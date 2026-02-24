import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import * as solutionsService from '../services/solutions.service.js';
import { success, validationError, serverError } from '../utils/response.js';

const router = Router();

router.use(authenticate);

// GET /api/solutions/search?year=2002&make=Ford&model=F150&partName=tail+light
router.get('/search', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { year, make, model, system, component, partName } = req.query;

    if (!year || !make || !model) {
      validationError(res, 'year, make, and model are required');
      return;
    }

    const result = await solutionsService.findSolutions({
      year: parseInt(year as string, 10),
      make: make as string,
      model: model as string,
      system: system as string | undefined,
      component: component as string | undefined,
      partName: partName as string | undefined,
    });

    success(res, result);
  } catch (err) {
    console.error('Solutions search error:', err);
    serverError(res);
  }
});

// GET /api/solutions/makes — available makes
router.get('/makes', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const makes = await solutionsService.getAvailableMakes();
    success(res, makes);
  } catch (err) {
    console.error('Get makes error:', err);
    serverError(res);
  }
});

// GET /api/solutions/models?make=Ford — models for a make
router.get('/models', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { make } = req.query;
    if (!make) {
      validationError(res, 'make is required');
      return;
    }
    const models = await solutionsService.getModelsByMake(make as string);
    success(res, models);
  } catch (err) {
    console.error('Get models error:', err);
    serverError(res);
  }
});

// GET /api/solutions/years?make=Ford&model=F150 — years for make+model
router.get('/years', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { make, model } = req.query;
    if (!make || !model) {
      validationError(res, 'make and model are required');
      return;
    }
    const years = await solutionsService.getYearsByMakeModel(make as string, model as string);
    success(res, years);
  } catch (err) {
    console.error('Get years error:', err);
    serverError(res);
  }
});

export default router;
