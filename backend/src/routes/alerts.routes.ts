import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as alertsController from '../controllers/alerts.controller.js';

const router = Router();

/**
 * ALERTS ROUTES
 *
 * All alert-related endpoints
 */

// Get low stock alerts
router.get('/low-stock', authenticate, alertsController.getLowStock);

// Dismiss a low stock alert
router.post('/low-stock/:partId/dismiss', authenticate, alertsController.dismissLowStock);

export default router;