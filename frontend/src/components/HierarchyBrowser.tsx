import { useState, useEffect } from 'react';
import { api, HierarchyItem } from '../api/client';
import { ChevronRight, ChevronDown, FolderOpen, Folder, Package } from 'lucide-react';

interface Props {
  onSelect: (systemCode: string, componentCode: string, label: string) => void;
  activeKey?: string; // "systemCode/componentCode"
}

export function HierarchyBrowser({ onSelect, activeKey }: Props) {
  const [hierarchy, setHierarchy] = useState<HierarchyItem[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPartsHierarchy()
      .then(setHierarchy)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleSystem = (code: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (hierarchy.length === 0) {
    return <p className="text-xs text-slate-500">No hierarchy data</p>;
  }

  return (
    <div className="space-y-0.5">
      {hierarchy.map((item) => {
        const isExpanded = expanded.has(item.system.code);
        const totalParts = item.components.reduce((sum, c) => sum + c.partCount, 0);

        return (
          <div key={item.system.code}>
            <button
              onClick={() => toggleSystem(item.system.code)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-slate-800/50 transition-colors group cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-amber-400" />
              ) : (
                <Folder className="w-4 h-4 text-slate-400 group-hover:text-amber-400" />
              )}
              <span className="text-sm font-medium text-slate-300 group-hover:text-white flex-1">
                {item.system.name}
              </span>
              <span className="text-[10px] text-slate-600 font-mono">{item.system.code}</span>
              {totalParts > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded-full">
                  {totalParts}
                </span>
              )}
            </button>

            {isExpanded && (
              <div className="ml-5 pl-3 border-l border-slate-800 space-y-0.5 mt-0.5 mb-1">
                {item.components.map((comp) => {
                  const key = `${item.system.code}/${comp.code}`;
                  const isActive = activeKey === key;

                  return (
                    <button
                      key={comp.code}
                      onClick={() => onSelect(item.system.code, comp.code, `${item.system.name} → ${comp.name}`)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/10 border border-amber-500/20'
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <Package className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className={`text-sm flex-1 ${isActive ? 'text-amber-400 font-medium' : 'text-slate-400'}`}>
                        {comp.name}
                      </span>
                      {comp.partCount > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {comp.partCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
