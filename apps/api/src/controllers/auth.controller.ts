import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { sendOtp, verifyOtp } from "../services/otp.service";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../services/jwt.service";

// POST /api/auth/otp/send
export async function sendOtpHandler(req: Request, res: Response): Promise<void> {
  const { telephone } = req.body;

  if (!telephone) {
    res.status(400).json({ error: "Numéro de téléphone requis" });
    return;
  }

  // Vérifier si l'utilisateur existe
  const user = await prisma.user.findUnique({ where: { telephone } });

  if (!user) {
  res.status(404).json({ error: 'Compte introuvable', nouveauCompte: true })
  return
}

  if (!user.actif) {
    res.status(403).json({ error: "Compte désactivé" });
    return;
  }

  await sendOtp(telephone);

  res.json({ message: "OTP envoyé", telephone });
}

// POST /api/auth/otp/verify
export async function verifyOtpHandler(req: Request, res: Response): Promise<void> {
  const { telephone, code } = req.body;

  if (!telephone || !code) {
    res.status(400).json({ error: "Téléphone et code requis" });
    return;
  }

  const isValid = verifyOtp(telephone, code);

  if (!isValid) {
    res.status(400).json({ error: "Code invalide ou expiré" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { telephone },
    include: { praticien: true },
  });

  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }

  const payload = { userId: user.id, role: user.role, telephone: user.telephone };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Vérifier si praticien première connexion
  const premiereConnexion =
    user.role === "PRATICIEN" &&
    user.praticien?.statutCompte === "EN_ATTENTE";

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      telephone: user.telephone,
      avatarUrl: user.avatarUrl ?? null,
    },
    premiereConnexion,
  });
}

// POST /api/auth/refresh
export async function refreshTokenHandler(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: "Refresh token requis" });
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken({
      userId: payload.userId,
      role: payload.role,
      telephone: payload.telephone,
    });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: "Refresh token invalide" });
  }
}

// POST /api/auth/logout
export async function logoutHandler(_req: Request, res: Response): Promise<void> {
  // Avec Redis en prod : blacklister le token ici
  res.json({ message: "Déconnexion réussie" });
}

// Ajouter cette fonction dans auth.controller.ts (avec les imports existants)
// Ajouter aussi : import { sendOtp } from '../services/otp.service' (déjà présent)

// POST /api/auth/register — inscription patient
export async function registerPatient(req: Request, res: Response): Promise<void> {
  const { telephone, nom, prenom } = req.body

  if (!telephone || !nom?.trim() || !prenom?.trim()) {
    res.status(400).json({ error: 'Téléphone, nom et prénom requis' })
    return
  }

  const telClean = telephone.replace(/\s/g, '')

  const existing = await prisma.user.findUnique({ where: { telephone: telClean } })
  if (existing) {
    res.status(409).json({ error: 'Ce numéro est déjà associé à un compte' })
    return
  }

  await prisma.user.create({
    data: {
      telephone: telClean,
      nom: nom.trim(),
      prenom: prenom.trim(),
      role: 'PATIENT',
      actif: true,
    },
  })

  await sendOtp(telClean)

  res.status(201).json({ message: 'Compte créé, code envoyé', telephone: telClean })
}