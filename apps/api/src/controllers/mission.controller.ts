import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { AuthRequest } from '../middlewares/auth.middleware'
import { findBestPraticien } from '../services/matching.service'
import { sendToUsers } from '../services/push.service'
import { emitToMission, emitToUser } from '../services/socket.service'

// POST /api/missions — créer une demande de soin (patient)
export async function creerMission(req: AuthRequest, res: Response): Promise<void> {
  const {
    specialite, adresseId, adresseTexte,
    latitude, longitude, notePatient,
    urgence = false, type = 'IMMEDIATE',
    dateHeureSoin, montantBase, fraisDeplacement = 2500,
  } = req.body

  if (!specialite || !adresseTexte || !montantBase) {
    res.status(400).json({ error: 'Champs obligatoires manquants' })
    return
  }

  // Vérifier qu'il n'y a pas de mission active en cours
  const missionActive = await prisma.mission.findFirst({
    where: {
      patientId: req.user!.userId,
      statut: { in: ['EN_ATTENTE', 'ACCEPTEE', 'EN_ROUTE', 'ARRIVE', 'EN_COURS'] },
    },
  })

  if (missionActive) {
    if (['EN_ATTENTE', 'ACCEPTEE'].includes(missionActive.statut)) {
      // Annuler l'ancienne mission
      await prisma.mission.update({
        where: { id: missionActive.id },
        data: { statut: 'ANNULEE', annuleeAt: new Date() },
      })
    } else {
      res.status(400).json({ error: 'Vous avez déjà une mission en cours. Terminez-la avant d\'en créer une nouvelle.' })
      return
    }
  }

  const montantTotal = montantBase + fraisDeplacement

  const mission = await prisma.mission.create({
    data: {
      patientId: req.user!.userId,
      specialite,
      adresseId,
      adresseTexte,
      latitude,
      longitude,
      notePatient,
      urgence,
      type,
      dateHeureSoin: dateHeureSoin ? new Date(dateHeureSoin) : null,
      montantBase,
      fraisDeplacement,
      montantTotal,
      statut: 'EN_ATTENTE',
    },
  })

  // Matching automatique pour missions immédiates
  if (type === 'IMMEDIATE') {
    const praticien = await findBestPraticien({ specialite, latitude, longitude, urgence })

    if (praticien) {
      await prisma.mission.update({
        where: { id: mission.id },
        data: { praticienId: praticien.id, statut: 'ACCEPTEE', accepteeAt: new Date() },
      })

      await sendToUsers(
        prisma, [praticien.userId],
        '🔔 Nouvelle mission',
        `${specialite} · ${adresseTexte}`,
        { missionId: mission.id, type: 'MISSION_NOUVELLE' }
      )
    }
  }

  const missionComplete = await prisma.mission.findUnique({
    where: { id: mission.id },
    include: {
      praticien: {
        include: { user: { select: { nom: true, prenom: true, telephone: true } } },
      },
    },
  })

  res.status(201).json(missionComplete)
}

// GET /api/missions — liste (admin) ou missions du patient connecté
export async function listMissions(req: AuthRequest, res: Response): Promise<void> {
  const { statut, page = '1', limit = '20' } = req.query
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

  const where: Record<string, unknown> = {}

  if (req.user?.role === 'PATIENT') {
    where.patientId = req.user.userId
  } else if (req.user?.role === 'PRATICIEN') {
    const praticien = await prisma.praticien.findUnique({ where: { userId: req.user.userId } })
    if (praticien) where.praticienId = praticien.id
  }

  if (statut) where.statut = statut

  const [missions, total] = await Promise.all([
    prisma.mission.findMany({
      where,
      include: {
        patient: { select: { nom: true, prenom: true, telephone: true } },
        praticien: {
          include: { user: { select: { nom: true, prenom: true, telephone: true } } },
        },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.mission.count({ where }),
  ])

  res.json({ missions, total, page: parseInt(page as string) })
}

// GET /api/missions/:id — détail
export async function getMission(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params

  const mission = await prisma.mission.findUnique({
    where: { id },
    include: {
      patient: { select: { nom: true, prenom: true, telephone: true } },
      praticien: {
        include: {
          user: { select: { nom: true, prenom: true, telephone: true } },
          specialites: true,
        },
      },
      compteRendu: true,
      paiement: true,
      avis: true,
    },
  })

  if (!mission) {
    res.status(404).json({ error: 'Mission introuvable' })
    return
  }

  res.json(mission)
}

// PATCH /api/missions/:id/statut — changer le statut
export async function updateStatutMission(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params
  const { statut } = req.body

  const validStatuts = ['ACCEPTEE', 'EN_ROUTE', 'ARRIVE', 'EN_COURS', 'TERMINEE', 'ANNULEE']
  if (!validStatuts.includes(statut)) {
    res.status(400).json({ error: 'Statut invalide' })
    return
  }

  const timestampField: Record<string, string> = {
    ACCEPTEE: 'accepteeAt', EN_ROUTE: 'enRouteAt', ARRIVE: 'arriveeAt',
    EN_COURS: 'debutSoinAt', TERMINEE: 'finSoinAt', ANNULEE: 'annuleeAt',
  }

  const updateData: Record<string, unknown> = { statut }
  if (timestampField[statut]) updateData[timestampField[statut]] = new Date()

  const mission = await prisma.mission.update({
    where: { id },
    data: updateData,
    include: {
      patient: { select: { nom: true, prenom: true, telephone: true } },
      praticien: {
        include: { user: { select: { nom: true, prenom: true, telephone: true } } },
      },
    },
  })

  // Émettre en temps réel
  emitToMission(id, 'mission:statut', { missionId: id, statut, updatedAt: new Date() })
  emitToUser(mission.patientId, 'mission:update', { missionId: id, statut })

  // Notifier le patient
  const notifPatient: Record<string, { title: string; body: string }> = {
    EN_ROUTE: { title: '🚗 Votre praticien arrive', body: 'Votre soignant est en route vers vous' },
    ARRIVE: { title: '📍 Praticien arrivé', body: 'Votre soignant est devant chez vous' },
    EN_COURS: { title: '💉 Soin en cours', body: 'Le soin a commencé' },
    TERMINEE: { title: '✅ Soin terminé', body: 'Pensez à laisser un avis !' },
    ANNULEE: { title: '❌ Mission annulée', body: 'Votre mission a été annulée' },
  }
  const notif = notifPatient[statut]
  if (notif) {
    await sendToUsers(prisma, [mission.patientId], notif.title, notif.body, { missionId: id, type: `MISSION_${statut}` })
  }

  if (statut === 'TERMINEE' && mission.praticienId) {
    await prisma.praticien.update({
      where: { id: mission.praticienId },
      data: { totalMissions: { increment: 1 } },
    })
  }

  res.json(mission)
}

// PATCH /api/missions/:id/assigner — assigner manuellement un praticien (admin)
export async function assignerPraticien(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params
  const { praticienId } = req.body

  if (!praticienId) { res.status(400).json({ error: 'praticienId requis' }); return }

  const praticien = await prisma.praticien.findUnique({ where: { id: praticienId } })
  if (!praticien || praticien.statutCompte !== 'VALIDE') {
    res.status(400).json({ error: 'Praticien invalide ou non validé' })
    return
  }

  const mission = await prisma.mission.update({
    where: { id },
    data: { praticienId, statut: 'ACCEPTEE', accepteeAt: new Date() },
  })

  res.json(mission)
}

// POST /api/missions/:id/compte-rendu — soumettre le compte rendu (praticien)
export async function soumettreCompteRendu(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params
  const { acteRealise, description, tension, temperature, pouls, spo2, recommandations, suiteNecessaire, photoUrls = [], signaturePatientUrl } = req.body

  if (!acteRealise || !description) {
    res.status(400).json({ error: 'Acte réalisé et description obligatoires' })
    return
  }

  const compteRendu = await prisma.compteRendu.upsert({
    where: { missionId: id },
    update: { acteRealise, description, tension, temperature, pouls, spo2, recommandations, suiteNecessaire, photoUrls, signaturePatientUrl, soumisAt: new Date() },
    create: { missionId: id, acteRealise, description, tension, temperature, pouls, spo2, recommandations, suiteNecessaire, photoUrls, signaturePatientUrl },
  })

  await prisma.mission.update({ where: { id }, data: { statut: 'TERMINEE', finSoinAt: new Date() } })

  res.status(201).json(compteRendu)
}

// POST /api/missions/:id/avis — noter une mission (patient)
export async function noterMission(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params
  const { note, commentaire, tags = [] } = req.body

  if (!note || note < 1 || note > 5) { res.status(400).json({ error: 'Note entre 1 et 5 requise' }); return }

  const mission = await prisma.mission.findUnique({ where: { id } })
  if (!mission || !mission.praticienId) { res.status(404).json({ error: 'Mission introuvable ou sans praticien' }); return }

  const avis = await prisma.avis.create({
    data: { missionId: id, patientId: req.user!.userId, praticienId: mission.praticienId, note, commentaire, tags },
  })

  const avgResult = await prisma.avis.aggregate({ where: { praticienId: mission.praticienId }, _avg: { note: true } })
  await prisma.praticien.update({ where: { id: mission.praticienId }, data: { noteMoyenne: avgResult._avg.note } })

  res.status(201).json(avis)
}