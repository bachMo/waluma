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
      await prisma.mission.update({
        where: { id: missionActive.id },
        data: { statut: 'ANNULEE', annuleeAt: new Date() },
      })
    } else {
      res.status(400).json({ error: 'Vous avez déjà une mission en cours.' })
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

  // Proposer à un praticien (sans assigner directement)
  if (type === 'IMMEDIATE') {
    await proposerMission(mission.id, specialite, latitude, longitude, urgence, [])
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

// Proposer la mission à un praticien disponible
async function proposerMission(
  missionId: string,
  specialite: string,
  latitude?: number,
  longitude?: number,
  urgence?: boolean,
  excludeIds: string[] = []
): Promise<void> {
  const praticien = await findBestPraticien({ specialite, latitude, longitude, urgence, excludePraticienIds: excludeIds })
console.log('[MATCHING] Praticien trouvé:', praticien?.id, praticien?.user?.nom)
  console.log('[MATCHING] Options:', { specialite, excludeIds })
  if (!praticien) {
    // Aucun praticien disponible — laisser EN_ATTENTE, admin pourra assigner manuellement
     console.log('[MATCHING] Aucun praticien disponible')
    return
  }

  // Marquer le praticien comme "proposé" sur la mission
  await prisma.mission.update({
    where: { id: missionId },
    data: {
      praticienProposedId: praticien.id,
      proposedAt: new Date(),
    },
  })

  // Notifier le praticien
  await sendToUsers(
    prisma,
    [praticien.user.id],
    '🔔 Nouvelle mission disponible',
    `${specialite} — Acceptez dans les 5 minutes`,
    { missionId, type: 'MISSION_PROPOSEE' }
  )

  // Émettre en temps réel au praticien
  emitToUser(praticien.user.id, 'mission:proposee', { missionId, specialite })

  // Timeout de 5 minutes — si pas de réponse, proposer au suivant
  setTimeout(async () => {
  const missionActuelle = await prisma.mission.findUnique({ where: { id: missionId } })
  if (!missionActuelle || missionActuelle.statut !== 'EN_ATTENTE' || missionActuelle.praticienProposedId !== praticien.id) return

  // Retirer la proposition
  await prisma.mission.update({
    where: { id: missionId },
    data: { praticienProposedId: null, proposedAt: null },
  })

  // Chercher le prochain praticien
  const suivant = await findBestPraticien({ specialite, latitude, longitude, urgence, excludePraticienIds: [...excludeIds, praticien.id] })

  if (!suivant) {
    // Aucun praticien dispo → annuler et notifier le patient
    const missionAnnulee = await prisma.mission.update({
      where: { id: missionId },
      data: { statut: 'ANNULEE', annuleeAt: new Date() },
    })
    emitToUser(missionAnnulee.patientId, 'mission:update', { missionId, statut: 'ANNULEE' })
    emitToMission(missionId, 'mission:statut', { missionId, statut: 'ANNULEE', updatedAt: new Date() })
    await sendToUsers(
      prisma, [missionAnnulee.patientId],
      '❌ Aucun praticien disponible',
      'Aucun praticien n\'a pu prendre en charge votre demande.',
      { missionId, type: 'MISSION_ANNULEE' }
    )
  } else {
    await proposerMission(missionId, specialite, latitude, longitude, urgence, [...excludeIds, praticien.id])
  }
}, 5 * 60 * 1000) // 5 minutes
}

// POST /api/missions/:id/accepter — praticien accepte la mission
export async function accepterMission(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params

  const praticien = await prisma.praticien.findUnique({ where: { userId: req.user!.userId } })
  if (!praticien) { res.status(404).json({ error: 'Praticien introuvable' }); return }

  const mission = await prisma.mission.findUnique({ where: { id } })
  if (!mission) { res.status(404).json({ error: 'Mission introuvable' }); return }

  if (mission.praticienProposedId !== praticien.id) {
    res.status(403).json({ error: 'Cette mission ne vous a pas été proposée' })
    return
  }

  if (mission.statut !== 'EN_ATTENTE') {
    res.status(400).json({ error: 'Mission déjà prise en charge' })
    return
  }

  const missionAcceptee = await prisma.mission.update({
    where: { id },
    data: {
      praticienId: praticien.id,
      praticienProposedId: null,
      proposedAt: null,
      statut: 'ACCEPTEE',
      accepteeAt: new Date(),
    },
    include: {
      patient: { select: { nom: true, prenom: true, telephone: true } },
      praticien: { include: { user: { select: { nom: true, prenom: true, telephone: true } } } },
    },
  })

  // Mettre à jour le taux d'acceptation
  const totalProposees = await prisma.mission.count({ where: { praticienId: praticien.id } })
  const totalRefusees = praticien.missionsRefusees
  const taux = totalProposees > 0 ? ((totalProposees - totalRefusees) / totalProposees) : 1
  await prisma.praticien.update({ where: { id: praticien.id }, data: { tauxAcceptation: taux } })

  // Notifier le patient
  await sendToUsers(
    prisma,
    [mission.patientId],
    '✅ Praticien trouvé !',
    `${missionAcceptee.praticien?.user.prenom} ${missionAcceptee.praticien?.user.nom} prend en charge votre demande`,
    { missionId: id, type: 'MISSION_ACCEPTEE' }
  )

  emitToMission(id, 'mission:statut', { missionId: id, statut: 'ACCEPTEE', updatedAt: new Date() })
  emitToUser(mission.patientId, 'mission:update', { missionId: id, statut: 'ACCEPTEE' })

  res.json(missionAcceptee)
}

// POST /api/missions/:id/refuser — praticien refuse la mission
export async function refuserMission(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params

  const praticien = await prisma.praticien.findUnique({ where: { userId: req.user!.userId } })
  if (!praticien) { res.status(404).json({ error: 'Praticien introuvable' }); return }

  const mission = await prisma.mission.findUnique({ where: { id } })
  if (!mission) { res.status(404).json({ error: 'Mission introuvable' }); return }

  if (mission.praticienProposedId !== praticien.id) {
    res.status(403).json({ error: 'Cette mission ne vous a pas été proposée' })
    return
  }

  // Incrémenter les refus du praticien
  await prisma.praticien.update({
    where: { id: praticien.id },
    data: { missionsRefusees: { increment: 1 } },
  })

  // Retirer la proposition et chercher le suivant
  await prisma.mission.update({
    where: { id },
    data: { praticienProposedId: null, proposedAt: null },
  })

  // Proposer au praticien suivant
  await proposerMission(id, mission.specialite, mission.latitude ?? undefined, mission.longitude ?? undefined, mission.urgence, [praticien.id])

  res.json({ message: 'Mission refusée, recherche d\'un autre praticien' })
}

// GET /api/missions — liste
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
        paiement: { select: { statut: true } },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.mission.count({ where }),
  ])

  res.json({ missions, total, page: parseInt(page as string) })
}

// GET /api/missions/proposees — missions proposées au praticien connecté
export async function getMissionsProposees(req: AuthRequest, res: Response): Promise<void> {
  const praticien = await prisma.praticien.findUnique({ where: { userId: req.user!.userId } })
  if (!praticien) { res.status(404).json({ error: 'Praticien introuvable' }); return }

  const missions = await prisma.mission.findMany({
    where: {
      praticienProposedId: praticien.id,
      statut: 'EN_ATTENTE',
    },
    include: {
      patient: { select: { nom: true, prenom: true, telephone: true } },
    },
    orderBy: { proposedAt: 'asc' },
  })

  res.json({ missions })
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

  if (!mission) { res.status(404).json({ error: 'Mission introuvable' }); return }

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

  const missionActuelle = await prisma.mission.findUnique({ where: { id } })
  if (!missionActuelle) { res.status(404).json({ error: 'Mission introuvable' }); return }

  if (req.user?.role === 'PATIENT') {
    if (statut !== 'ANNULEE') { res.status(403).json({ error: 'Non autorisé' }); return }
    if (!['EN_ATTENTE', 'ACCEPTEE'].includes(missionActuelle.statut)) {
      res.status(400).json({ error: 'Impossible d\'annuler une mission déjà démarrée' }); return
    }
    if (missionActuelle.patientId !== req.user.userId) {
      res.status(403).json({ error: 'Non autorisé' }); return
    }
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
      praticien: { include: { user: { select: { nom: true, prenom: true, telephone: true } } } },
    },
  })

  emitToMission(id, 'mission:statut', { missionId: id, statut, updatedAt: new Date() })
  emitToUser(mission.patientId, 'mission:update', { missionId: id, statut })

  const notifPatient: Record<string, { title: string; body: string }> = {
    EN_ROUTE: { title: '🚗 Votre praticien arrive', body: 'Votre soignant est en route vers vous' },
    ARRIVE: { title: '📍 Praticien arrivé', body: 'Votre soignant est devant chez vous' },
    EN_COURS: { title: '💉 Soin en cours', body: 'Le soin a commencé' },
    TERMINEE: { title: '✅ Soin terminé', body: 'Pensez à effectuer le paiement !' },
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

// PATCH /api/missions/:id/assigner — assigner manuellement (admin)
export async function assignerPraticien(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params
  const { praticienId } = req.body

  if (!praticienId) { res.status(400).json({ error: 'praticienId requis' }); return }

  const praticien = await prisma.praticien.findUnique({ where: { id: praticienId } })
  if (!praticien || praticien.statutCompte !== 'VALIDE') {
    res.status(400).json({ error: 'Praticien invalide ou non validé' }); return
  }

  const mission = await prisma.mission.update({
    where: { id },
    data: { praticienId, praticienProposedId: null, proposedAt: null, statut: 'ACCEPTEE', accepteeAt: new Date() },
  })

  res.json(mission)
}

// POST /api/missions/:id/compte-rendu
export async function soumettreCompteRendu(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params
  const { acteRealise, description, tension, temperature, pouls, spo2, recommandations, suiteNecessaire, photoUrls = [], signaturePatientUrl } = req.body

  if (!acteRealise || !description) {
    res.status(400).json({ error: 'Acte réalisé et description obligatoires' }); return
  }

  const compteRendu = await prisma.compteRendu.upsert({
    where: { missionId: id },
    update: { acteRealise, description, tension, temperature, pouls, spo2, recommandations, suiteNecessaire, photoUrls, signaturePatientUrl, soumisAt: new Date() },
    create: { missionId: id, acteRealise, description, tension, temperature, pouls, spo2, recommandations, suiteNecessaire, photoUrls, signaturePatientUrl },
  })

  await prisma.mission.update({ where: { id }, data: { statut: 'TERMINEE', finSoinAt: new Date() } })

  res.status(201).json(compteRendu)
}

// POST /api/missions/:id/avis
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