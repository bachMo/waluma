import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { AuthRequest } from '../middlewares/auth.middleware'

// GET /api/litiges — liste (admin)
export async function listLitiges(req: Request, res: Response): Promise<void> {
  const { statut, page = '1', limit = '20' } = req.query
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

  const where: Record<string, unknown> = {}
  if (statut) where.statut = statut

  const [litiges, total] = await Promise.all([
    prisma.litige.findMany({
      where,
      include: {
        mission: {
          include: {
            patient: { select: { nom: true, prenom: true, telephone: true } },
            praticien: {
              include: { user: { select: { nom: true, prenom: true, telephone: true } } },
            },
          },
        },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: [{ statut: 'asc' }, { ouvertAt: 'desc' }],
    }),
    prisma.litige.count({ where }),
  ])

  res.json({ litiges, total, page: parseInt(page as string) })
}

// GET /api/litiges/:id — détail
export async function getLitige(req: Request, res: Response): Promise<void> {
  const { id } = req.params

  const litige = await prisma.litige.findUnique({
    where: { id },
    include: {
      mission: {
        include: {
          patient: { select: { nom: true, prenom: true, telephone: true } },
          praticien: {
            include: { user: { select: { nom: true, prenom: true, telephone: true } } },
          },
          compteRendu: true,
          paiements: true, // ← liste
        },
      },
    },
  })

  if (!litige) {
    res.status(404).json({ error: 'Litige introuvable' })
    return
  }

  res.json(litige)
}

// POST /api/litiges — ouvrir un litige
export async function ouvrirLitige(req: AuthRequest, res: Response): Promise<void> {
  const { missionId, motif, description } = req.body

  if (!missionId || !motif) {
    res.status(400).json({ error: 'Mission et motif obligatoires' })
    return
  }

  const mission = await prisma.mission.findUnique({ where: { id: missionId } })
  if (!mission) {
    res.status(404).json({ error: 'Mission introuvable' })
    return
  }

  const existing = await prisma.litige.findUnique({ where: { missionId } })
  if (existing) {
    res.status(400).json({ error: 'Un litige existe déjà pour cette mission' })
    return
  }

  const litige = await prisma.litige.create({
    data: { missionId, motif, description, statut: 'OUVERT' },
    include: {
      mission: {
        include: {
          patient: { select: { nom: true, prenom: true, telephone: true } },
          praticien: {
            include: { user: { select: { nom: true, prenom: true, telephone: true } } },
          },
        },
      },
    },
  })

  res.status(201).json(litige)
}

// PATCH /api/litiges/:id — mettre à jour un litige (admin)
export async function updateLitige(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params
  const { statut, resolution } = req.body

  const validStatuts = ['EN_TRAITEMENT', 'RESOLU', 'CLOS']
  if (statut && !validStatuts.includes(statut)) {
    res.status(400).json({ error: 'Statut invalide' })
    return
  }

  const updateData: Record<string, unknown> = {}
  if (statut) updateData.statut = statut
  if (resolution) updateData.resolution = resolution
  if (statut === 'RESOLU' || statut === 'CLOS') updateData.resoluAt = new Date()

  const litige = await prisma.litige.update({
    where: { id },
    data: updateData,
    include: {
      mission: {
        include: {
          patient: { select: { nom: true, prenom: true, telephone: true } },
          praticien: {
            include: { user: { select: { nom: true, prenom: true, telephone: true } } },
          },
        },
      },
    },
  })

  res.json(litige)
}

// POST /api/litiges/:id/forcer-cloture — forcer la clôture (admin)
export async function forcerCloture(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params
  const { resolution } = req.body

  const litige = await prisma.litige.update({
    where: { id },
    data: {
      statut: 'CLOS',
      resolution: resolution || 'Clôture forcée par l\'administrateur',
      resoluAt: new Date(),
    },
  })

  await prisma.mission.update({
    where: { id: litige.missionId },
    data: { statut: 'TERMINEE', finSoinAt: new Date() },
  }).catch(() => {})

  res.json({ message: 'Litige clôturé', litige })
}

// POST /api/litiges/:id/rembourser — rembourser le patient (admin)
export async function rembourserPatient(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params

  const litige = await prisma.litige.findUnique({
    where: { id },
    include: { mission: { include: { paiements: true } } }, // ← liste
  })

  if (!litige) {
    res.status(404).json({ error: 'Litige introuvable' })
    return
  }

  // Trouver le paiement patient
  const paiementPatient = litige.mission.paiements.find(p => p.type === 'PATIENT')
  if (paiementPatient) {
    await prisma.paiement.update({
      where: { id: paiementPatient.id },
      data: { statut: 'REMBOURSE' },
    })
  }

  await prisma.litige.update({
    where: { id },
    data: { statut: 'RESOLU', resolution: 'Patient remboursé', resoluAt: new Date() },
  })

  res.json({ message: 'Remboursement effectué' })
}