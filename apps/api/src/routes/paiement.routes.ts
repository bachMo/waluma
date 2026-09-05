import { Router } from 'express'
import {
  getPaiementMission,
  initierPaiement,
  confirmerPaiement,
  getHistoriquePaiements,
} from '../controllers/paiement.controller'
import { authenticate, requireRole } from '../middlewares/auth.middleware'

const router = Router()

router.get('/mission/:missionId', authenticate, getPaiementMission)
router.post('/', authenticate, requireRole('PATIENT'), initierPaiement)
router.post('/:id/confirmer', authenticate, requireRole('PATIENT'), confirmerPaiement)
router.get('/historique', authenticate, requireRole('PRATICIEN'), getHistoriquePaiements)

export default router