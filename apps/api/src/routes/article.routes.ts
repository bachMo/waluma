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
import { upload } from '../middlewares/upload.middleware'
import { uploadImageArticle } from '../controllers/article.controller'

const router = Router()


router.post('/upload-image', authenticate, requireRole('ADMIN'), upload.single('file'), uploadImageArticle)

// Routes admin
router.get('/admin/all', authenticate, requireRole('ADMIN'), listArticlesAdmin)
router.post('/', authenticate, requireRole('ADMIN'), creerArticle)
router.patch('/:id', authenticate, requireRole('ADMIN'), updateArticle)
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteArticle)

// Routes publiques (patients)
router.get('/', listArticles)
router.get('/:id', getArticle)

export default router