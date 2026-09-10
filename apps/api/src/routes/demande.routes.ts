import { Router, Response } from 'express'
import { authenticate, AuthRequest, requireRole } from '../middlewares/auth.middleware'
import { prisma } from '../prisma/client'

const router = Router()

// GET /api/demandes/mes-demandes — DOIT être avant /:id
router.get('/mes-demandes', authenticate, async (req: AuthRequest, res: Response) => {
  const demandes = await prisma.demande.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ demandes })
})

// POST /api/demandes
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { type, description, details } = req.body
  if (!type || !description) {
    res.status(400).json({ error: 'Type et description requis' })
    return
  }
  const demande = await prisma.demande.create({
    data: {
      userId: req.user!.userId,
      type,
      description,
      details: details || '',
      statut: 'EN_ATTENTE',
    },
  })
  res.status(201).json(demande)
})

// GET /api/demandes — liste admin
router.get('/', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  const { statut, type, page = '1', limit = '20' } = req.query
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
  const where: Record<string, unknown> = {}
  if (statut) where.statut = statut
  if (type) where.type = type

  const [demandes, total] = await Promise.all([
    prisma.demande.findMany({
      where,
      include: {
        user: { select: { nom: true, prenom: true, telephone: true, role: true } },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.demande.count({ where }),
  ])
  res.json({ demandes, total })
})

// PATCH /api/demandes/:id
router.patch('/:id', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const { statut, reponseAdmin } = req.body

  const validStatuts = ['EN_ATTENTE', 'EN_COURS', 'TRAITEE', 'REFUSEE']
  if (!validStatuts.includes(statut)) {
    res.status(400).json({ error: 'Statut invalide' })
    return
  }

  const demande = await prisma.demande.update({
    where: { id },
    data: {
      statut,
      reponseAdmin: reponseAdmin || undefined,
      traiteeAt: ['TRAITEE', 'REFUSEE'].includes(statut) ? new Date() : undefined,
    },
    include: {
      user: { select: { nom: true, prenom: true, telephone: true } },
    },
  })
  res.json(demande)
})
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const demande = await prisma.demande.findUnique({ where: { id } })
  if (!demande || demande.userId !== req.user!.userId) {
    res.status(403).json({ error: 'Accès interdit' })
    return
  }
  if (['TRAITEE', 'REFUSEE'].includes(demande.statut)) {
    res.status(400).json({ error: 'Impossible de supprimer une demande déjà traitée' })
    return
  }
  await prisma.demande.delete({ where: { id } })
  res.json({ message: 'Demande supprimée' })
})

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const demande = await prisma.demande.findUnique({ where: { id } })
  if (!demande || demande.userId !== req.user!.userId) {
    res.status(403).json({ error: 'Accès interdit' })
    return
  }
  if (['TRAITEE', 'REFUSEE'].includes(demande.statut)) {
    res.status(400).json({ error: 'Impossible de supprimer une demande déjà traitée' })
    return
  }
  await prisma.demande.delete({ where: { id } })
  res.json({ message: 'Demande supprimée' })
})
export default router