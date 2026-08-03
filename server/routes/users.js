import { Router } from 'express'
import auth from '../middleware/auth.js'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { updatePreferences } from '../controllers/usersController.js'

const router = Router()

router.patch(
  '/preferences',
  auth,
  [
    body('accentColor')
      .optional()
      .isIn(['amber', 'crimson', 'violet', 'emerald', 'azure'])
      .withMessage('Invalid accent'),
    body('defaultView').optional().isIn(['board', 'grid', 'list']).withMessage('Invalid view'),
    body('density').optional().isIn(['comfortable', 'compact']).withMessage('Invalid density'),
  ],
  validate,
  updatePreferences
)

export default router
