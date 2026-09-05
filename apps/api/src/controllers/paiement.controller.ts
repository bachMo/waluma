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
      paiement: true,
      praticien: {
        include: { user: { select: { nom: true, prenom: true } } },
      },
    },
  })

  if (!mission) {
    res.status(404).json({ error: 'Mission introuvable' })
    return
  }

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
    paiement: mission.paiement,
  })
}

// POST /api/paiements — initier un paiement
export async function initierPaiement(req: AuthRequest, res: Response): Promise<void> {
  const { missionId, operateur, numeroMM } = req.body

  if (!missionId || !operateur) {
    res.status(400).json({ error: 'missionId et operateur requis' })
    return
  }

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: { paiement: true, praticien: true },
  })

  if (!mission) {
    res.status(404).json({ error: 'Mission introuvable' })
    return
  }

  if (mission.statut !== 'TERMINEE') {
    res.status(400).json({ error: 'La mission doit être terminée pour être payée' })
    return
  }

  if (mission.paiement?.statut === 'PAYE') {
    res.status(400).json({ error: 'Cette mission est déjà payée' })
    return
  }

  // Créer ou mettre à jour le paiement
  const reference = `WAL-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

  const paiement = await prisma.paiement.upsert({
  where: { missionId },
  update: {
    operateur: operateur as never,
    numeroPayeur: numeroMM || '',
    statut: 'EN_ATTENTE',
    referenceExterne: reference,
  },
  create: {
    missionId,
    userId: req.user!.userId,
    montant: mission.montantTotal,
    operateur: operateur as never,
    numeroPayeur: numeroMM || '',
    statut: 'EN_ATTENTE',
    referenceExterne: reference,
  },
})

res.status(201).json({ paiement, reference })


}

// POST /api/paiements/:id/confirmer — confirmer le paiement (simulé)
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

  // TODO: ici on appellera l'API Wave/Orange Money/Free Money
  // Pour l'instant on simule une confirmation immédiate

  const paiementConfirme = await prisma.paiement.update({
    where: { id },
    data: {
      statut: 'PAYE',
      payeAt: new Date(),
    },
  })

  // Calculer et enregistrer le gain du praticien
  if (paiement.mission.praticienId) {
    const commission = Math.round(paiement.montant * 0.1)
    const gainNet = paiement.montant - commission

    // Notifier le praticien du paiement reçu
    await sendToUsers(
      prisma,
      [paiement.mission.praticien!.userId],
      '💰 Paiement reçu',
      `Vous avez reçu ${gainNet.toLocaleString()} FCFA pour votre mission`,
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

  const totalGagne = paiements.reduce((sum, p) => sum + Math.round(p.montant * 0.9), 0)

  res.json({ paiements, total, totalGagne })
}