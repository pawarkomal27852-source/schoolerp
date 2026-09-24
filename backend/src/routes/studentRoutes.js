import { Router }           from 'express';
import { protect }          from '../middleware/auth.js';
import { validate }         from '../middleware/validate.js';
import { auditMiddleware }  from '../utils/auditLogger.js';
import { createStudentValidator, updateStudentValidator } from '../validators/studentValidator.js';
import {
  getAllStudents, getStudentById, createStudent,
  updateStudent, deleteStudent, getStudentsList,
} from '../controllers/studentController.js';

const router = Router();
router.use(protect);

router.get('/list', getStudentsList);

router.route('/')
  .get(getAllStudents)
  .post(
    createStudentValidator,
    validate,
    auditMiddleware('student', 'create', (_req, body) => body?.data?.student?._id || null),
    createStudent
  );

router.route('/:id')
  .get(getStudentById)
  .put(
    updateStudentValidator,
    validate,
    auditMiddleware('student', 'update', (req) => req.params.id),
    updateStudent
  )
  .delete(
    auditMiddleware('student', 'delete', (req) => req.params.id),
    deleteStudent
  );

export default router;
