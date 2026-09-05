import { Router } from 'express'
import { registerToken, removeToken, getNotifications, markAllRead } from '../controllers/notification.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.post('/token', authenticate, registerToken)
router.delete('/token', authenticate, removeToken)
router.get('/', authenticate, getNotifications)
router.patch('/read', authenticate, markAllRead)

export default router