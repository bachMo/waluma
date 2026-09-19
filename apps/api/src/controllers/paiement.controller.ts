import { Response } from 'express'
import { prisma } from '../prisma/client'
import { AuthRequest } from '../middlewares/auth.middleware'
import { sendToUsers } from '../services/push.service'

// GET /api/paiements/mission/:missionId — détail paiement d'une mission
export async function getPaiementMission(req: AuthRequest, res: Response): Promise<void> {
  const { missionId } = req.params

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      paiements: true, // ← liste
      praticien: {
        include: { user: { select: { nom: true, prenom: true } } },
      },
    },
  })

  if (!mission) {
    res.status(404).json({ error: 'Mission introuvable' })
    return
  }

  // Paiement patient (type PATIENT ou sans type)
  const paiementPatient = mission.paiements.find(p => p.type === 'PATIENT')
  // Paiement commission praticien
  const paiementCommission = mission.paiements.find(p => p.type === 'COMMISSION_PRATICIEN')

  res.json({
    mission: {
      id: mission.id,
      statut: mission.statut,
      specialite: mission.specialite,
      adresseTexte: mission.adresseTexte,
      montantBase: mission.montantBase,
      fraisDeplacement: mission.fraisDeplacement,
      montantTotal: mission.montantTotal,
      praticien: mission.praticien,
    },
    paiement: paiementPatient ?? null,
    paiementCommission: paiementCommission ?? null,
  })
}

// POST /api/paiements — initier un paiement patient
export async function initierPaiement(req: AuthRequest, res: Response): Promise<void> {
  const { missionId, operateur, numeroMM } = req.body

  if (!missionId || !operateur) {
    res.status(400).json({ error: 'missionId et operateur requis' })
    return
  }

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: { paiements: true, praticien: true },
  })

  if (!mission) {
    res.status(404).json({ error: 'Mission introuvable' })
    return
  }

  if (mission.statut !== 'TERMINEE') {
    res.status(400).json({ error: 'La mission doit être terminée pour être payée' })
    return
  }

  const paiementExistant = mission.paiements.find(p => p.type === 'PATIENT' && p.statut === 'PAYE')
  if (paiementExistant) {
    res.status(400).json({ error: 'Cette mission est déjà payée' })
    return
  }

  const reference = `WAL-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

  // Chercher un paiement patient existant non payé pour le mettre à jour
  const paiementEnAttente = mission.paiements.find(p => p.type === 'PATIENT' && p.statut !== 'PAYE')

  let paiement
  if (paiementEnAttente) {
    paiement = await prisma.paiement.update({
      where: { id: paiementEnAttente.id },
      data: {
        operateur: operateur as never,
        numeroPayeur: numeroMM || '',
        statut: 'EN_ATTENTE',
        referenceExterne: reference,
      },
    })
  } else {
    paiement = await prisma.paiement.create({
      data: {
        missionId,
        userId: req.user!.userId,
        type: 'PATIENT',
        montant: mission.montantTotal,
        operateur: operateur as never,
        numeroPayeur: numeroMM || '',
        statut: 'EN_ATTENTE',
        referenceExterne: reference,
      },
    })
  }

  res.status(201).json({ paiement, reference })
}

// POST /api/paiements/commission — praticien déclare paiement espèces + paie commission
export async function initierPaiementCommission(req: AuthRequest, res: Response): Promise<void> {
  const { missionId, operateur, numeroMM } = req.body

  if (!missionId || !operateur) {
    res.status(400).json({ error: 'missionId et operateur requis' })
    return
  }

  const praticien = await prisma.praticien.findUnique({ where: { userId: req.user!.userId } })
  if (!praticien) {
    res.status(404).json({ error: 'Praticien introuvable' })
    return
  }

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: { paiements: true },
  })

  if (!mission) {
    res.status(404).json({ error: 'Mission introuvable' })
    return
  }

  if (mission.praticienId !== praticien.id) {
    res.status(403).json({ error: 'Non autorisé' })
    return
  }

  if (mission.statut !== 'TERMINEE') {
    res.status(400).json({ error: 'La mission doit être terminée' })
    return
  }

  // Vérifier qu'il n'y a pas déjà un paiement commission PAYE
  const commissionExistante = mission.paiements.find(p => p.type === 'COMMISSION_PRATICIEN' && p.statut === 'PAYE')
  if (commissionExistante) {
    res.status(400).json({ error: 'La commission a déjà été payée pour cette mission' })
    return
  }

  const montantCommission = Math.round(mission.montantTotal * 0.1)
  const reference = `COM-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

  // Créer le paiement commission
  const paiementCommission = await prisma.paiement.create({
    data: {
      missionId,
      userId: req.user!.userId,
      type: 'COMMISSION_PRATICIEN',
      montant: montantCommission,
      operateur: operateur as never,
      numeroPayeur: numeroMM || '',
      statut: 'EN_ATTENTE',
      referenceExterne: reference,
    },
  })

  // Créer aussi le paiement patient (espèces) automatiquement marqué PAYE
  const paiementPatientExistant = mission.paiements.find(p => p.type === 'PATIENT')
  if (!paiementPatientExistant) {
    await prisma.paiement.create({
      data: {
        missionId,
        userId: mission.patientId,
        type: 'PATIENT',
        montant: mission.montantTotal,
        operateur: operateur as never,
        numeroPayeur: 'ESPECES',
        statut: 'PAYE',
        payeAt: new Date(),
        referenceExterne: `ESP-${Date.now()}`,
      },
    })
  }

  res.status(201).json({ paiementCommission, montantCommission, reference })
}

// POST /api/paiements/:id/confirmer — confirmer un paiement (patient ou commission)
export async function confirmerPaiement(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params

  const paiement = await prisma.paiement.findUnique({
    where: { id },
    include: {
      mission: {
        include: { praticien: true },
      },
    },
  })

  if (!paiement) {
    res.status(404).json({ error: 'Paiement introuvable' })
    return
  }

  if (paiement.statut === 'PAYE') {
    res.status(400).json({ error: 'Paiement déjà confirmé' })
    return
  }

  const paiementConfirme = await prisma.paiement.update({
    where: { id },
    data: { statut: 'PAYE', payeAt: new Date() },
  })

  if (paiement.type === 'PATIENT') {
    // Notifier le praticien
    if (paiement.mission.praticienId) {
      const gainNet = paiement.montant - Math.round(paiement.montant * 0.1)
      await sendToUsers(
        prisma,
        [paiement.mission.praticien!.userId],
        '💰 Paiement reçu',
        `Votre gain net de ${gainNet.toLocaleString()} FCFA est disponible`,
        { type: 'PAIEMENT_RECU', paiementId: id }
      )
    }
    // Notifier le patient
    await sendToUsers(
      prisma,
      [paiement.mission.patientId],
      '✅ Paiement confirmé',
      `Votre paiement de ${paiement.montant.toLocaleString()} FCFA a été effectué`,
      { type: 'PAIEMENT_CONFIRME', paiementId: id }
    )
  } else if (paiement.type === 'COMMISSION_PRATICIEN') {
    // Notifier le praticien que la commission est validée
    if (paiement.mission.praticienId) {
      await sendToUsers(
        prisma,
        [paiement.mission.praticien!.userId],
        '✅ Commission reçue',
        `Votre commission de ${paiement.montant.toLocaleString()} FCFA a été enregistrée`,
        { type: 'COMMISSION_CONFIRMEE', paiementId: id }
      )
    }
  }

  res.json(paiementConfirme)
}

// GET /api/paiements/historique — historique des paiements (praticien)
export async function getHistoriquePaiements(req: AuthRequest, res: Response): Promise<void> {
  const { page = '1', limit = '20' } = req.query
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

  const praticien = await prisma.praticien.findUnique({
    where: { userId: req.user!.userId },
  })

  if (!praticien) {
    res.status(404).json({ error: 'Praticien introuvable' })
    return
  }

  const [paiements, total] = await Promise.all([
    prisma.paiement.findMany({
      where: {
        mission: { praticienId: praticien.id },
        statut: 'PAYE',
      },
      include: {
        mission: {
          include: {
            patient: { select: { nom: true, prenom: true } },
          },
        },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { payeAt: 'desc' },
    }),
    prisma.paiement.count({
      where: {
        mission: { praticienId: praticien.id },
        statut: 'PAYE',
      },
    }),
  ])

  const totalGagne = paiements
    .filter(p => p.type === 'PATIENT')
    .reduce((sum, p) => sum + Math.round(p.montant * 0.9), 0)

  res.json({ paiements, total, totalGagne })
}