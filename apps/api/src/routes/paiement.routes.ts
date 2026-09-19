import { Router } from 'express'
import {
  getPaiementMission,
  initierPaiement,
  initierPaiementCommission,
  confirmerPaiement,
  getHistoriquePaiements,
} from '../controllers/paiement.controller'
import { authenticate, requireRole } from '../middlewares/auth.middleware'

const router = Router()

router.get('/mission/:missionId', authenticate, getPaiementMission)
router.post('/', authenticate, requireRole('PATIENT'), initierPaiement)
router.post('/commission', authenticate, requireRole('PRATICIEN'), initierPaiementCommission)
router.post('/:id/confirmer', authenticate, confirmerPaiement)
router.get('/historique', authenticate, requireRole('PRATICIEN'), getHistoriquePaiements)

export default router