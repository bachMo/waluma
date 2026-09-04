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

const router = Router();

router.post('/creer', authenticate, requireRole('ADMIN'), creerPraticien)
// Admin
router.get("/", authenticate, requireRole("ADMIN"), listPraticiens);
router.patch("/:id/statut", authenticate, requireRole("ADMIN"), updateStatutPraticien);
router.patch("/documents/:docId", authenticate, requireRole("ADMIN"), updateDocumentStatut);
router.patch('/:id/infos', authenticate, requireRole('ADMIN'), updateInfosPraticien);

// Praticien
router.patch("/:id/disponibilite", authenticate, requireRole("PRATICIEN"), toggleDisponibilite);
router.post("/:id/documents", authenticate, upload.single("file"), uploadDocument);
router.delete("/documents/:docId", authenticate, deleteDocument);

// Commun (admin + praticien)
router.get("/:id", authenticate, getPraticien);

export default router;