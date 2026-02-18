import { AdvancedSearchResult } from '../api/client';
import { ConditionBadge } from './ConditionBadge';
import { Package, DollarSign, Archive, TrendingUp } from 'lucide-react';
import type { PartCondition } from '../api/client';

interface Props {
  data: AdvancedSearchResult;
}

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function SearchStatsCards({ data }: Props) {
  const { totalCount, conditionBreakdown, priceStats, inventoryStats } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Parts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Parts</span>
        </div>
        <p className="text-2xl font-bold text-white">{totalCount}</p>
      </div>

      {/* Condition Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">By Condition</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(conditionBreakdown).map(([condition, count]) => (
            <span key={condition} className="inline-flex items-center gap-1">
              <ConditionBadge condition={condition as PartCondition} size="sm" />
              <span className="text-xs text-slate-400 font-medium">{count}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Price Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Price Range</span>
        </div>
        <div className="flex items-baseline gap-3">
          <div>
            <p className="text-xs text-slate-500">Avg</p>
            <p className="text-sm font-semibold text-white">{formatDollars(priceStats.avg)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Low</p>
            <p className="text-sm font-semibold text-emerald-400">{formatDollars(priceStats.low)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">High</p>
            <p className="text-sm font-semibold text-red-400">{formatDollars(priceStats.high)}</p>
          </div>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Archive className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Inventory</span>
        </div>
        <div className="flex items-baseline gap-4">
          <div>
            <p className="text-xs text-slate-500">In Stock</p>
            <p className="text-sm font-semibold text-emerald-400">{inventoryStats.inStock}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Out</p>
            <p className="text-sm font-semibold text-red-400">{inventoryStats.outOfStock}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Qty</p>
            <p className="text-sm font-semibold text-white">{inventoryStats.totalOnHand}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
