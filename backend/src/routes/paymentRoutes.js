import { Router }          from 'express';
import { protect }         from '../middleware/auth.js';
import { validate }        from '../middleware/validate.js';
import { auditMiddleware } from '../utils/auditLogger.js';
import { recordPaymentValidator } from '../validators/paymentValidator.js';
import {
  getAllPayments, getPaymentById, recordPayment,
  getPendingFees, getPaymentSummary,
} from '../controllers/paymentController.js';

const router = Router();
router.use(protect);

router.get('/summary',            getPaymentSummary);
router.get('/pending/:studentId', getPendingFees);

router.route('/')
  .get(getAllPayments)
  .post(
    recordPaymentValidator,
    validate,
    auditMiddleware('payment', 'create', (_req, body) => body?.data?.payment?._id || null),
    recordPayment
  );

router.get('/:id', getPaymentById);

export default router;
