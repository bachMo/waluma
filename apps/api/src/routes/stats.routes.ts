import { Router } from 'express'
import { getDashboardStats, getBadges } from '../controllers/stats.controller'
import { authenticate, requireRole } from '../middlewares/auth.middleware'


const router = Router()

router.get('/dashboard', authenticate, requireRole('ADMIN'), getDashboardStats)
router.get('/badges', authenticate, requireRole('ADMIN'), getBadges)

export default router