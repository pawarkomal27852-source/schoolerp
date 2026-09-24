import { Router }   from 'express';
import { protect }  from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createParentValidator, updateParentValidator } from '../validators/parentValidator.js';
import {
  getAllParents, getParentById, createParent, updateParent, deleteParent,
} from '../controllers/parentController.js';

const router = Router();
router.use(protect);

router.route('/')
  .get(getAllParents)
  .post(createParentValidator, validate, createParent);

router.route('/:id')
  .get(getParentById)
  .put(updateParentValidator, validate, updateParent)
  .delete(deleteParent);

export default router;
