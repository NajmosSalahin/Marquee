import { Router } from 'express';
import auth from '../middleware/auth.js';
import { itemValidation, createItemValidation, validate } from '../middleware/validate.js';
import { listItems, createItem, updateItem, deleteItem, reorderItems } from '../controllers/itemsController.js';

const router = Router();

router.use(auth);

router.get('/', listItems);
router.post('/', createItemValidation, validate, createItem);
router.patch('/reorder', reorderItems);
router.patch('/:id', itemValidation, validate, updateItem);
router.delete('/:id', deleteItem);

export default router;
