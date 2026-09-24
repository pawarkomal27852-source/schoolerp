import { Router }    from 'express';
import { protect }   from '../middleware/auth.js';
import { validate }  from '../middleware/validate.js';
import { createClassValidator, updateClassValidator } from '../validators/classValidator.js';
import {
  getAllClasses, getClassById, createClass, updateClass, deleteClass,
} from '../controllers/classController.js';

const router = Router();
router.use(protect); // all class routes require authentication

router.route('/')
  .get(getAllClasses)
  .post(createClassValidator, validate, createClass);

router.route('/:id')
  .get(getClassById)
  .put(updateClassValidator, validate, updateClass)
  .delete(deleteClass);

export default router;
