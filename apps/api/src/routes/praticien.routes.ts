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

export default router;