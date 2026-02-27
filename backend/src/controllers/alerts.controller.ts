import { Request, Response, NextFunction } from 'express';
import { getLowStockAlerts, dismissLowStockAlert } from '../services/alerts.service.js';
import { success } from '../utils/response.js';

/**
 * ALERTS CONTROLLER
 *
 * Handles alert-related HTTP endpoints
 */

/**
 * GET /api/alerts/low-stock
 * Returns all parts that are below their minimum stock threshold
 */
export async function getLowStock(req: Request, res: Response, next: NextFunction) {
  try {
    const alerts = await getLowStockAlerts();

    success(res, {
      alerts,
      total: alerts.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/alerts/low-stock/:partId/dismiss
 * Dismiss a low stock alert for a specific part
 */
export async function dismissLowStock(req: Request, res: Response, next: NextFunction) {
  try {
    const partId = parseInt(req.params.partId);
    const userId = (req as any).user?.id;

    if (isNaN(partId)) {
      return res.status(400).json({ error: 'Invalid part ID' });
    }

    await dismissLowStockAlert(partId, userId);

    success(res, {
      message: 'Alert dismissed successfully'
    });
  } catch (error) {
    next(error);
  }
}