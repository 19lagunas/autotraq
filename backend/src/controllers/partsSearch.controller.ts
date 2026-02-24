import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import * as partsSearchService from '../services/partsSearch.service.js';
import { success, serverError } from '../utils/response.js';

export async function advancedSearch(req: AuthenticatedRequest, res: Response) {
  try {
    const q = req.query.q as string | undefined;
    const result = await partsSearchService.advancedSearch(q);
    success(res, result);
  } catch (err) {
    console.error('Advanced search error:', err);
    serverError(res);
  }
}

export async function getHierarchy(_req: AuthenticatedRequest, res: Response) {
  try {
    const result = await partsSearchService.getHierarchy();
    success(res, result);
  } catch (err) {
    console.error('Get hierarchy error:', err);
    serverError(res);
  }
}

export async function getPartsByHierarchy(req: AuthenticatedRequest, res: Response) {
  try {
    const { systemCode, componentCode } = req.params;
    const result = await partsSearchService.getPartsByHierarchy(systemCode, componentCode);
    success(res, result);
  } catch (err) {
    console.error('Get parts by hierarchy error:', err);
    serverError(res);
  }
}
