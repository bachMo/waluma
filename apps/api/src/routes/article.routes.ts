import { Router } from 'express'
import {
  listArticles,
  listArticlesAdmin,
  getArticle,
  creerArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/article.controller'
import { authenticate, requireRole } from '../middlewares/auth.middleware'

const router = Router()

// Routes publiques (patients)
router.get('/', listArticles)
router.get('/:id', getArticle)

// Routes admin
router.get('/admin/all', authenticate, requireRole('ADMIN'), listArticlesAdmin)
router.post('/', authenticate, requireRole('ADMIN'), creerArticle)
router.patch('/:id', authenticate, requireRole('ADMIN'), updateArticle)
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteArticle)

export default router