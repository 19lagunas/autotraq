import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import prisma from '../repositories/prisma.js';
import { success, validationError, serverError } from '../utils/response.js';
import { InventoryEventType, PartCondition } from '@prisma/client';

/**
 * CSV BULK EXPORT — streams all parts + on-hand inventory as CSV
 * GET /api/csv/export
 */
export async function exportCsv(req: AuthenticatedRequest, res: Response) {
  try {
    // Get all parts with fitments
    const parts = await prisma.part.findMany({
      include: {
        fitments: { include: { vehicle: true } },
      },
      orderBy: { sku: 'asc' },
    });

    // Get on-hand quantities aggregated by part
    const onHandAgg = await prisma.inventoryEvent.groupBy({
      by: ['partId'],
      _sum: { qtyDelta: true },
    });
    const onHandMap = new Map(onHandAgg.map(e => [e.partId, e._sum.qtyDelta || 0]));

    // Build CSV
    const header = 'SKU,Name,Description,Condition,Min Stock,Cost ($),On Hand,Vehicle Fitments';
    const rows = parts.map(p => {
      const fitmentStr = p.fitments
        .map(f => `${f.vehicle.year} ${f.vehicle.make} ${f.vehicle.model}${f.vehicle.trim ? ' ' + f.vehicle.trim : ''}`)
        .join('; ');
      const cost = p.costCents != null ? (p.costCents / 100).toFixed(2) : '';
      return [
        p.sku,
        csvEscape(p.name),
        csvEscape(p.description || ''),
        p.condition,
        p.minStock,
        cost,
        onHandMap.get(p.id) || 0,
        csvEscape(fitmentStr),
      ].join(',');
    });

    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="autotraq-inventory-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('CSV export error:', err);
    serverError(res);
  }
}

/**
 * CSV BULK IMPORT — create or update parts from CSV upload
 * POST /api/csv/import
 * Body: { csv: string }
 *
 * Columns: SKU, Name, Description, Condition, Min Stock, Cost ($)
 * If SKU exists → update. If new → create.
 */
export async function importCsv(req: AuthenticatedRequest, res: Response) {
  try {
    const { csv } = req.body;
    if (!csv || typeof csv !== 'string') {
      validationError(res, 'Missing csv field in request body');
      return;
    }

    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
      validationError(res, 'CSV must have a header row and at least one data row');
      return;
    }

    // Parse header
    const header = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
    const skuIdx = header.indexOf('sku');
    const nameIdx = header.indexOf('name');
    if (skuIdx === -1 || nameIdx === -1) {
      validationError(res, 'CSV must have SKU and Name columns');
      return;
    }
    const descIdx = header.indexOf('description');
    const condIdx = header.findIndex(h => h === 'condition');
    const minIdx = header.findIndex(h => h.includes('min'));
    const costIdx = header.findIndex(h => h.includes('cost'));

    const validConditions = new Set(Object.values(PartCondition));
    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = parseCsvLine(line);
      const sku = cols[skuIdx]?.trim();
      const name = cols[nameIdx]?.trim();

      if (!sku || !name) {
        results.errors.push(`Row ${i + 1}: Missing SKU or Name`);
        continue;
      }

      const data: any = { name };
      if (descIdx !== -1 && cols[descIdx] != null) data.description = cols[descIdx].trim() || null;
      if (condIdx !== -1 && cols[condIdx]?.trim()) {
        const cond = cols[condIdx].trim().toUpperCase();
        if (validConditions.has(cond as PartCondition)) {
          data.condition = cond as PartCondition;
        }
      }
      if (minIdx !== -1 && cols[minIdx]?.trim()) {
        const v = parseInt(cols[minIdx].trim());
        if (!isNaN(v) && v >= 0) data.minStock = v;
      }
      if (costIdx !== -1 && cols[costIdx]?.trim()) {
        const v = parseFloat(cols[costIdx].trim());
        if (!isNaN(v) && v >= 0) data.costCents = Math.round(v * 100);
      }

      try {
        const existing = await prisma.part.findUnique({ where: { sku } });
        if (existing) {
          await prisma.part.update({ where: { sku }, data });
          results.updated++;
        } else {
          await prisma.part.create({ data: { sku, ...data } });
          results.created++;
        }
      } catch (err: any) {
        results.errors.push(`Row ${i + 1} (${sku}): ${err.message?.slice(0, 80)}`);
      }
    }

    success(res, results);
  } catch (err) {
    console.error('CSV import error:', err);
    serverError(res);
  }
}

function csvEscape(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}
