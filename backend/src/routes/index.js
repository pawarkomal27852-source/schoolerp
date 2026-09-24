import { Router } from 'express';
import authRoutes       from './authRoutes.js';
import classRoutes      from './classRoutes.js';
import parentRoutes     from './parentRoutes.js';
import studentRoutes    from './studentRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import feeRoutes        from './feeRoutes.js';
import paymentRoutes    from './paymentRoutes.js';
import dashboardRoutes  from './dashboardRoutes.js';
import reportRoutes     from './reportRoutes.js';
import settingsRoutes   from './settingsRoutes.js';

const router = Router();

// ── Health check ──────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'SchoolERP API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Module routes ─────────────────────────────────────────────────────────
router.use('/auth',       authRoutes);
router.use('/classes',    classRoutes);
router.use('/parents',    parentRoutes);
router.use('/students',   studentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/fees',       feeRoutes);
router.use('/payments',   paymentRoutes);
router.use('/dashboard',  dashboardRoutes);
router.use('/reports',    reportRoutes);
router.use('/settings',   settingsRoutes);

export default router;
