import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middlewares/auth.middleware'
import { prisma } from '../prisma/client'

const router = Router()

// GET /api/avis/praticien/:praticienId — avis reçus par un praticien
router.get('/praticien/:praticienId', authenticate, async (req: AuthRequest, res: Response) => {
  const { praticienId } = req.params
  const { page = '1', limit = '50' } = req.query
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

  const [avis, total] = await Promise.all([
    prisma.avis.findMany({
      where: { praticienId },
      include: {
        patient: { select: { nom: true, prenom: true } },
        mission: { select: { specialite: true } },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.avis.count({ where: { praticienId } }),
  ])

  // Calculer la vraie note moyenne depuis la BD
  const aggregate = await prisma.avis.aggregate({
    where: { praticienId },
    _avg: { note: true },
  })

  res.json({ avis, total, noteMoyenne: aggregate._avg.note })
})

export default router