import { Router } from "express";
import {
  sendOtpHandler,
  verifyOtpHandler,
  refreshTokenHandler,
  logoutHandler,
} from "../controllers/auth.controller";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from '../prisma/client'
import { Response } from 'express'
import multer from 'multer'
import { uploadFile } from '../services/r2.service'


const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })
const router = Router();

router.post("/otp/send", sendOtpHandler);
router.post("/otp/verify", verifyOtpHandler);
router.post("/refresh", refreshTokenHandler);
router.post("/logout", authenticate, logoutHandler);
router.patch('/profil', authenticate, async (req: AuthRequest, res: Response) => {
  const { prenom, nom } = req.body
  if (!prenom?.trim() || !nom?.trim()) {
    res.status(400).json({ error: 'Prénom et nom requis' })
    return
  }
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { prenom: prenom.trim(), nom: nom.trim() },
    select: { id: true, prenom: true, nom: true, telephone: true, role: true },
  })
  res.json(user)
})
// PATCH /api/auth/profil
router.patch('/profil', authenticate, async (req: AuthRequest, res: Response) => {
  const { prenom, nom } = req.body
  if (!prenom?.trim() || !nom?.trim()) {
    res.status(400).json({ error: 'Prénom et nom requis' })
    return
  }
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { prenom: prenom.trim(), nom: nom.trim() },
    select: { id: true, prenom: true, nom: true, telephone: true, role: true, avatarUrl: true },
  })
  res.json(user)
})

// POST /api/auth/avatar
router.post('/avatar', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  const file = req.file
  if (!file) { res.status(400).json({ error: 'Fichier requis' }); return }
  const url = await uploadFile(file.buffer, file.originalname, file.mimetype, 'avatars')
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { avatarUrl: url },
    select: { id: true, prenom: true, nom: true, telephone: true, role: true, avatarUrl: true },
  })
  res.json({ avatarUrl: url, user })
})
export default router;