import { Router } from 'express'
import {
  creerMission,
  listMissions,
  getMission,
  updateStatutMission,
  assignerPraticien,
  soumettreCompteRendu,
  noterMission,
} from '../controllers/mission.controller'
import { authenticate, requireRole } from '../middlewares/auth.middleware'

const router = Router()

// Patient
router.post('/', authenticate, requireRole('PATIENT'), creerMission)
router.post('/:id/avis', authenticate, requireRole('PATIENT'), noterMission)

// Praticien
router.patch('/:id/statut', authenticate, requireRole('PRATICIEN', 'ADMIN', 'PATIENT'), updateStatutMission)
router.post('/:id/compte-rendu', authenticate, requireRole('PRATICIEN'), soumettreCompteRendu)

// Admin
router.get('/', authenticate, requireRole('ADMIN', 'PATIENT', 'PRATICIEN'), listMissions)
router.patch('/:id/assigner', authenticate, requireRole('ADMIN'), assignerPraticien)

// Commun
router.get('/:id', authenticate, getMission)

export default router