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

export default router;