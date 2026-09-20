import { Router } from "express";
import {
  listPraticiens,
  getPraticien,
  updateStatutPraticien,
  toggleDisponibilite,
  uploadDocument,
  updateDocumentStatut,
  deleteDocument,
} from "../controllers/praticien.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import { creerPraticien } from '../controllers/praticien.controller'
import { updateInfosPraticien } from '../controllers/praticien.controller'
import { getMonProfil } from '../controllers/praticien.controller'
import { deletePraticien } from '../controllers/praticien.controller'
import { prisma } from "../prisma/client";
import { uploadFile } from '../services/r2.service'

const router = Router();

router.post('/creer', authenticate, requireRole('ADMIN'), upload.array('files', 10), creerPraticien)
// Admin
router.get("/", authenticate, requireRole("ADMIN"), listPraticiens);
router.patch("/:id/statut", authenticate, requireRole("ADMIN"), updateStatutPraticien);
router.patch("/documents/:docId", authenticate, requireRole("ADMIN"), updateDocumentStatut);
router.patch('/:id/infos', authenticate, requireRole('ADMIN'), updateInfosPraticien);

// Praticien
router.patch("/:id/disponibilite", authenticate, requireRole("PRATICIEN"), toggleDisponibilite);
router.post("/:id/documents", authenticate, upload.single("file"), uploadDocument);
router.delete("/documents/:docId", authenticate, deleteDocument);
router.get('/me', authenticate, requireRole('PRATICIEN'), getMonProfil)
// Commun (admin + praticien)
router.get("/:id", authenticate, getPraticien);
router.delete('/:id', authenticate, requireRole('ADMIN'), deletePraticien)
router.patch('/:id/bloquer', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { id } = req.params
  const { bloque } = req.body
  if (typeof bloque !== 'boolean') { res.status(400).json({ error: 'bloque requis (boolean)' }); return }
  const praticien = await prisma.praticien.update({
    where: { id },
    data: { bloque },
  })
  res.json(praticien)
})

// À ajouter dans apps/api/src/routes/praticien.routes.ts
// Route PUBLIQUE — sans authenticate — pour les candidatures depuis la landing



router.post('/creer-demande', upload.array('files', 3), async (req, res) => {
  const {
    prenom, nom, telephone, specialite,
    anneesExperience, bio, zoneIntervention,
    numeroOrdre, operateur, numeroMM,
  } = req.body

  // Validation
  if (!prenom || !nom || !telephone || !specialite || !anneesExperience || !bio) {
    res.status(400).json({ error: 'Champs obligatoires manquants' })
    return
  }

  const telRegex = /^\+221(70|75|76|77|78)\d{7}$/
  if (!telRegex.test(telephone.replace(/\s/g, ''))) {
    res.status(400).json({ error: 'Format téléphone invalide' })
    return
  }

  const existing = await prisma.user.findUnique({ where: { telephone: telephone.replace(/\s/g, '') } })
  if (existing) {
    res.status(400).json({ error: 'Un compte avec ce numéro existe déjà' })
    return
  }

  const files = req.files as Express.Multer.File[]
  if (!files || files.length < 3) {
    res.status(400).json({ error: '3 documents requis (diplôme, CNI, casier judiciaire)' })
    return
  }

  let parsedZone: string[] = []
  try {
    parsedZone = typeof zoneIntervention === 'string' ? JSON.parse(zoneIntervention) : zoneIntervention
  } catch {
    parsedZone = []
  }

  const DOC_TYPES = ['DIPLOME', 'CNI', 'CASIER_JUDICIAIRE'] as const

  const user = await prisma.user.create({
    data: {
      telephone: telephone.replace(/\s/g, ''),
      nom,
      prenom,
      role: 'PRATICIEN',
      praticien: {
        create: {
          numeroOrdre: numeroOrdre || null,
          anneesExperience: parseInt(anneesExperience) || 0,
          bio,
          zoneIntervention: parsedZone,
          statutCompte: 'EN_ATTENTE',
          disponible: false,
          commission: 10,
          operateurMM: operateur as never || 'WAVE',
          numeroMM: numeroMM?.replace(/\s/g, '') || null,
          specialites: {
            create: [{ specialite, principale: true }],
          },
        },
      },
    },
    include: { praticien: true },
  })

  const praticienId = user.praticien!.id

  // Upload des 3 documents
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const docType = DOC_TYPES[i] || 'AUTRE'
    const url = await uploadFile(file.buffer, file.originalname, file.mimetype, `praticiens/${praticienId}/documents`)
    await prisma.document.create({
      data: { praticienId, type: docType, url, nom: file.originalname, statut: 'EN_ATTENTE' },
    })
  }

  res.status(201).json({ message: 'Candidature reçue. Votre dossier sera examiné sous 48-72h.' })
})

export default router;