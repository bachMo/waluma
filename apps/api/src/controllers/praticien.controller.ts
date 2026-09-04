import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { uploadFile, deleteFile } from "../services/r2.service";
import { AuthRequest } from "../middlewares/auth.middleware";

// GET /api/praticiens — liste (admin)
export async function listPraticiens(req: Request, res: Response): Promise<void> {
  const { statut, specialite, page = "1", limit = "20" } = req.query;

  const where: Record<string, unknown> = {};
  if (statut) where.statutCompte = statut;
  if (specialite) {
    where.specialites = {
      some: { specialite },
    };
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const [praticiens, total] = await Promise.all([
    prisma.praticien.findMany({
      where,
      include: {
        user: { select: { nom: true, prenom: true, telephone: true } },
        specialites: true,
        documents: true,
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: "desc" },
    }),
    prisma.praticien.count({ where }),
  ]);

  res.json({ praticiens, total, page: parseInt(page as string) });
}

// GET /api/praticiens/:id — détail
export async function getPraticien(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const praticien = await prisma.praticien.findUnique({
    where: { id },
    include: {
      user: { select: { nom: true, prenom: true, telephone: true, createdAt: true } },
      specialites: true,
      documents: true,
      avisRecus: {
        include: { patient: { select: { nom: true, prenom: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!praticien) {
    res.status(404).json({ error: "Praticien introuvable" });
    return;
  }

  res.json(praticien);
}

// PATCH /api/praticiens/:id/statut — valider / suspendre (admin)
export async function updateStatutPraticien(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { statut, commentaire } = req.body;

  const validStatuts = ["VALIDE", "SUSPENDU", "REFUSE"];
  if (!validStatuts.includes(statut)) {
    res.status(400).json({ error: "Statut invalide" });
    return;
  }

  const praticien = await prisma.praticien.update({
    where: { id },
    data: { statutCompte: statut },
    include: { user: true },
  });

  // TODO : envoyer notification WhatsApp au praticien

  res.json({ message: `Praticien ${statut.toLowerCase()}`, praticien });
}

// PATCH /api/praticiens/:id/disponibilite — toggle dispo (praticien)
export async function toggleDisponibilite(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const praticien = await prisma.praticien.findUnique({ where: { id } });

  if (!praticien) {
    res.status(404).json({ error: "Praticien introuvable" });
    return;
  }

  // Vérifier que c'est bien le praticien lui-même
  if (praticien.userId !== req.user?.userId) {
    res.status(403).json({ error: "Accès interdit" });
    return;
  }

  if (praticien.statutCompte !== "VALIDE") {
    res.status(403).json({ error: "Compte non validé" });
    return;
  }

  const updated = await prisma.praticien.update({
    where: { id },
    data: { disponible: !praticien.disponible },
  });

  res.json({ disponible: updated.disponible });
}

// POST /api/praticiens/:id/documents — upload document
export async function uploadDocument(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { type } = req.body;
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: "Fichier requis" });
    return;
  }

  const validTypes = ["DIPLOME", "ORDRE_PROFESSIONNEL", "CNI", "CASIER_JUDICIAIRE", "AUTRE"];
  if (!validTypes.includes(type)) {
    res.status(400).json({ error: "Type de document invalide" });
    return;
  }

  const praticien = await prisma.praticien.findUnique({ where: { id } });
  if (!praticien) {
    res.status(404).json({ error: "Praticien introuvable" });
    return;
  }

  const url = await uploadFile(
    file.buffer,
    file.originalname,
    file.mimetype,
    `praticiens/${id}/documents`
  );

  const document = await prisma.document.create({
    data: {
      praticienId: id,
      type,
      url,
      nom: file.originalname,
      statut: "EN_ATTENTE",
    },
  });

  res.status(201).json(document);
}

// PATCH /api/praticiens/documents/:docId — valider/refuser doc (admin)
export async function updateDocumentStatut(req: Request, res: Response): Promise<void> {
  const { docId } = req.params;
  const { statut, commentaireAdmin } = req.body;

  const validStatuts = ["VALIDE", "REFUSE"];
  if (!validStatuts.includes(statut)) {
    res.status(400).json({ error: "Statut invalide" });
    return;
  }

  const document = await prisma.document.update({
    where: { id: docId },
    data: {
      statut,
      commentaireAdmin,
      valideAt: statut === "VALIDE" ? new Date() : null,
    },
  });

  res.json(document);
}

// DELETE /api/praticiens/documents/:docId — supprimer doc
export async function deleteDocument(req: Request, res: Response): Promise<void> {
  const { docId } = req.params;

  const document = await prisma.document.findUnique({ where: { id: docId } });
  if (!document) {
    res.status(404).json({ error: "Document introuvable" });
    return;
  }

  await deleteFile(document.url);
  await prisma.document.delete({ where: { id: docId } });

  res.json({ message: "Document supprimé" });
}

// POST /api/praticiens/creer — créer un praticien (admin)
export async function creerPraticien(req: Request, res: Response): Promise<void> {
  const {
    prenom, nom, telephone, specialite,
    numeroOrdre, anneesExperience, bio,
    zoneIntervention, commission,
    operateurMM, numeroMM,
  } = req.body

  if (!prenom || !nom || !telephone || !specialite) {
    res.status(400).json({ error: 'Champs obligatoires manquants' })
    return
  }

  const existing = await prisma.user.findUnique({ where: { telephone } })
  if (existing) {
    res.status(400).json({ error: 'Un compte avec ce numéro existe déjà' })
    return
  }

  const user = await prisma.user.create({
    data: {
      telephone,
      nom,
      prenom,
      role: 'PRATICIEN',
      praticien: {
        create: {
          numeroOrdre,
          anneesExperience: anneesExperience || 0,
          bio,
          zoneIntervention: zoneIntervention || [],
          statutCompte: 'EN_ATTENTE',
          disponible: false,
          commission: commission || 10,
          operateurMM,
          numeroMM,
          specialites: {
            create: [{ specialite, principale: true }],
          },
        },
      },
    },
    include: { praticien: true },
  })

  // TODO : envoyer SMS avec identifiants temporaires

  res.status(201).json({ message: 'Praticien créé', user })
}

// PATCH /api/praticiens/:id/infos — modifier les infos (admin)
export async function updateInfosPraticien(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const {
    nom, prenom, telephone,
    numeroOrdre, anneesExperience, bio,
    zoneIntervention, commission,
    operateurMM, numeroMM,
  } = req.body

  const praticien = await prisma.praticien.findUnique({ where: { id } })
  if (!praticien) {
    res.status(404).json({ error: 'Praticien introuvable' })
    return
  }

  // Mettre à jour les infos du user si nécessaire
  if (nom || prenom || telephone) {
    await prisma.user.update({
      where: { id: praticien.userId },
      data: {
        ...(nom && { nom }),
        ...(prenom && { prenom }),
        ...(telephone && { telephone }),
      },
    })
  }

  // Mettre à jour les infos du praticien
  const updated = await prisma.praticien.update({
    where: { id },
    data: {
      ...(numeroOrdre !== undefined && { numeroOrdre }),
      ...(anneesExperience !== undefined && { anneesExperience }),
      ...(bio !== undefined && { bio }),
      ...(zoneIntervention !== undefined && { zoneIntervention }),
      ...(commission !== undefined && { commission }),
      ...(operateurMM !== undefined && { operateurMM }),
      ...(numeroMM !== undefined && { numeroMM }),
    },
    include: {
      user: { select: { nom: true, prenom: true, telephone: true } },
      specialites: true,
      documents: true,
    },
  })

  res.json(updated)
}