import { Router }   from 'express';
import { protect }  from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createFeeValidator, updateFeeValidator } from '../validators/feeValidator.js';
import {
  getAllFees, getFeeById, getFeesByClass, createFee, updateFee, deleteFee,
} from '../controllers/feeController.js';

const router = Router();
router.use(protect);

router.get('/class/:classId', getFeesByClass);

router.route('/')
  .get(getAllFees)
  .post(createFeeValidator, validate, createFee);

router.route('/:id')
  .get(getFeeById)
  .put(updateFeeValidator, validate, updateFee)
  .delete(deleteFee);

export default router;
