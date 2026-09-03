import { Router } from 'express'
import { getDashboardStats } from '../controllers/stats.controller'
import { authenticate, requireRole } from '../middlewares/auth.middleware'

const router = Router()

router.get('/dashboard', authenticate, requireRole('ADMIN'), getDashboardStats)

export default router