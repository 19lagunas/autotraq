import { Router } from 'express';
import * as partsSearchController from '../controllers/partsSearch.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// GET /api/parts-search/advanced?q=fender
router.get('/advanced', partsSearchController.advancedSearch);

// GET /api/parts-search/hierarchy
router.get('/hierarchy', partsSearchController.getHierarchy);

// GET /api/parts-search/hierarchy/:systemCode/:componentCode
router.get('/hierarchy/:systemCode/:componentCode', partsSearchController.getPartsByHierarchy);

export default router;
