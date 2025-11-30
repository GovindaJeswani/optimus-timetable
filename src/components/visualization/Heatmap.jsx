import React, { useMemo } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM to 7 PM

export default function Heatmap({ data }) {
  // 1. Compute Density
  const density = useMemo(() => {
    const map = {};
    let max = 0;

    data.forEach(d => {
      d.slots.forEach(slot => {
        // Quantize to Hour (e.g., 540 -> 9)
        const h = Math.floor(slot.start / 60);
        const key = `${slot.day}-${h}`;
        map[key] = (map[key] || 0) + 1;
        if (map[key] > max) max = map[key];
      });
    });
    return { map, max };
  }, [data]);

  const getColor = (count) => {
    if (!count) return 'bg-slate-800/50';
    // Intensity Scale (Green -> Yellow -> Red)
    const intensity = Math.min(1, count / (density.max || 1));
    if (intensity < 0.2) return 'bg-emerald-900/40 border-emerald-800/50';
    if (intensity < 0.5) return 'bg-yellow-900/40 border-yellow-800/50';
    return 'bg-rose-900/60 border-rose-600/50';
  };

  return (
    <div className="h-full bg-slate-900 border border-slate-700 rounded-xl p-6 overflow-auto">
      <h3 className="text-slate-300 font-bold mb-6 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-rose-500"></span> 
        Campus Density Heatmap
        <span className="text-xs font-normal text-slate-500 ml-auto">
          Peak Load: {density.max} simultaneous classes
        </span>
      </h3>

      <div className="grid grid-cols-[100px_1fr] gap-4 min-w-[800px]">
        {/* Header Row */}
        <div className="text-right text-xs text-slate-500 font-mono pt-2">TIME</div>
        <div className="grid grid-cols-13 gap-1 mb-2">
          {HOURS.map(h => (
            <div key={h} className="text-center text-xs text-slate-500 font-mono">
              {h}:00
            </div>
          ))}
        </div>

        {/* Rows */}
        {DAYS.map(day => (
          <React.Fragment key={day}>
            {/* Day Label */}
            <div className="text-right text-sm font-bold text-slate-400 py-3 pr-4 border-r border-slate-800">
              {day}
            </div>
            
            {/* Grid Cells */}
            <div className="grid grid-cols-13 gap-1">
              {HOURS.map(h => {
                const count = density.map[`${day}-${h}`] || 0;
                return (
                  <div 
                    key={`${day}-${h}`}
                    className={`rounded-md border ${getColor(count)} transition-all hover:scale-110 hover:brightness-125 relative group cursor-default`}
                  >
                    {count > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/70">
                        {count}
                      </div>
                    )}
                    
                    {/* Tooltip */}
                    {count > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-32 bg-slate-900 border border-slate-600 p-2 rounded shadow-xl text-xs text-center pointer-events-none">
                        <div className="font-bold text-cyan-400">{day} @ {h}:00</div>
                        <div className="text-white">{count} Classes</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex gap-6 justify-center text-xs text-slate-400">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-900/40 border border-emerald-800"></div> Low Traffic</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-yellow-900/40 border border-yellow-800"></div> Moderate</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-rose-900/60 border border-rose-600"></div> High Congestion</div>
      </div>
    </div>
  );
}