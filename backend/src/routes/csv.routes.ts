import { Router } from 'express';
import * as csvController from '../controllers/csv.controller.js';
import { authenticate, requireManager } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// GET /api/csv/export — download full inventory as CSV (all authenticated)
router.get('/export', csvController.exportCsv);

// POST /api/csv/import — bulk import/update parts from CSV (manager+)
router.post('/import', requireManager, csvController.importCsv);

export default router;
