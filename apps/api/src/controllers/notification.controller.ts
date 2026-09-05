import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { AuthRequest } from '../middlewares/auth.middleware'

// POST /api/notifications/token — enregistrer un push token
export async function registerToken(req: AuthRequest, res: Response): Promise<void> {
  const { token, platform } = req.body

  if (!token || !platform) {
    res.status(400).json({ error: 'Token et platform requis' })
    return
  }

  // Vérifier que c'est un token Expo valide
  if (!token.startsWith('ExponentPushToken[') && !token.startsWith('ExpoPushToken[')) {
    res.status(400).json({ error: 'Token Expo invalide' })
    return
  }

  await prisma.pushToken.upsert({
    where: { token },
    update: { userId: req.user!.userId, platform, updatedAt: new Date() },
    create: { token, platform, userId: req.user!.userId },
  })

  res.json({ message: 'Token enregistré' })
}

// DELETE /api/notifications/token — supprimer un push token (déconnexion)
export async function removeToken(req: AuthRequest, res: Response): Promise<void> {
  const { token } = req.body

  if (!token) {
    res.status(400).json({ error: 'Token requis' })
    return
  }

  await prisma.pushToken.deleteMany({
    where: { token, userId: req.user!.userId },
  })

  res.json({ message: 'Token supprimé' })
}

// GET /api/notifications — liste des notifications de l'utilisateur
export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  const { page = '1', limit = '20' } = req.query
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.user!.userId },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId: req.user!.userId } }),
  ])

  res.json({ notifications, total })
}

// PATCH /api/notifications/read — marquer tout comme lu
export async function markAllRead(req: AuthRequest, res: Response): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, lu: false },
    data: { lu: true },
  })
  res.json({ message: 'Notifications marquées comme lues' })
}