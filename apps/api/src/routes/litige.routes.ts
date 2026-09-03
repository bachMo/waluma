import { Router } from 'express'
import {
  listLitiges,
  getLitige,
  ouvrirLitige,
  updateLitige,
  forcerCloture,
  rembourserPatient,
} from '../controllers/litige.controller'
import { authenticate, requireRole } from '../middlewares/auth.middleware'

const router = Router()

// Admin
router.get('/', authenticate, requireRole('ADMIN'), listLitiges)
router.get('/:id', authenticate, requireRole('ADMIN'), getLitige)
router.patch('/:id', authenticate, requireRole('ADMIN'), updateLitige)
router.post('/:id/forcer-cloture', authenticate, requireRole('ADMIN'), forcerCloture)
router.post('/:id/rembourser', authenticate, requireRole('ADMIN'), rembourserPatient)

// Patient ou praticien peuvent ouvrir un litige
router.post('/', authenticate, ouvrirLitige)

export default router