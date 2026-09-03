import { Router } from 'express'
import { getParametres, updateParametres, getParametre } from '../controllers/parametre.controller'
import { authenticate, requireRole } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', authenticate, requireRole('ADMIN'), getParametres)
router.patch('/', authenticate, requireRole('ADMIN'), updateParametres)
router.get('/:cle', authenticate, requireRole('ADMIN'), getParametre)

export default router