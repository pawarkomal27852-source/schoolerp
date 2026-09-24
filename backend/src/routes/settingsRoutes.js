import { Router }            from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate }           from '../middleware/validate.js';
import { auditMiddleware }    from '../utils/auditLogger.js';
import { updateSettingsValidator } from '../validators/settingsValidator.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = Router();
router.use(protect);

router.get('/', getSettings);

router.put(
  '/',
  authorize('admin'),
  updateSettingsValidator,
  validate,
  auditMiddleware('settings', 'update'),
  updateSettings
);

export default router;
