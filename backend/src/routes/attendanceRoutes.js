import { Router }   from 'express';
import { protect }  from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  markAttendanceValidator,
  bulkAttendanceValidator,
  updateAttendanceValidator,
} from '../validators/attendanceValidator.js';
import {
  markAttendance, markBulkAttendance, updateAttendance,
  getAttendanceHistory, getTodayClassAttendance,
} from '../controllers/attendanceController.js';

const router = Router();
router.use(protect);

router.get('/history',                    getAttendanceHistory);
router.get('/today/:classId',             getTodayClassAttendance);
router.post('/',  markAttendanceValidator,  validate, markAttendance);
router.post('/bulk', bulkAttendanceValidator, validate, markBulkAttendance);
router.put('/:id', updateAttendanceValidator, validate, updateAttendance);

export default router;
