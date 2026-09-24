import { Router }  from 'express';
import { protect } from '../middleware/auth.js';
import {
  getStudentSummaryReport,
  getAttendanceSummaryReport,
  getFeeSummaryReport,
} from '../controllers/reportController.js';

const router = Router();
router.use(protect);

router.get('/students',   getStudentSummaryReport);
router.get('/attendance', getAttendanceSummaryReport);
router.get('/fees',       getFeeSummaryReport);

export default router;
