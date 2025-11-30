import React, { useMemo, useState } from 'react';

export default function FlowChart({ data, onNodeClick }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const graph = useMemo(() => {
    // 1. Safety Slice: Keep graph performant
    const activeData = data.slice(0, 80); 

    const nodes = [];
    const links = [];
    
    const getNode = (id) => nodes.find(n => n.id === id);
    const addNode = (id, type, label, x) => {
      let n = getNode(id);
      if (!n) {
        n = { id, type, label, x, links: [] };
        nodes.push(n);
      }
      return n;
    };

    activeData.forEach(d => {
      // CENTER: Courses (Shifted to 500 to make room for left labels)
      const cNode = addNode(`C-${d.courseCode}`, 'course', d.courseCode, 500);

      // LEFT: Instructors (Shifted to 200 to prevent cut-off)
      d.instructor.split(/,|&|\//).forEach(i => {
        const name = i.trim();
        if (name.length > 2) {
          const iNode = addNode(`I-${name}`, 'instructor', name, 200);
          
          if (!links.find(l => l.s === iNode.id && l.t === cNode.id)) {
            links.push({ s: iNode.id, t: cNode.id, key: `${iNode.id}-${cNode.id}` });
            iNode.links.push(cNode.id);
            cNode.links.push(iNode.id);
          }
        }
      });

      // RIGHT: Rooms (Shifted to 800)
      if (d.room && d.room !== 'TBA') {
        const rNode = addNode(`R-${d.room}`, 'room', d.room, 800);
        
        if (!links.find(l => l.s === cNode.id && l.t === rNode.id)) {
          links.push({ s: cNode.id, t: rNode.id, key: `${cNode.id}-${rNode.id}` });
          cNode.links.push(rNode.id);
          rNode.links.push(cNode.id);
        }
      }
    });

    // 2. Dynamic Height Calculation
    const maxNodes = Math.max(
      nodes.filter(n => n.type === 'instructor').length,
      nodes.filter(n => n.type === 'course').length,
      nodes.filter(n => n.type === 'room').length
    );
    
    // Ensure nodes aren't squashed
    const minSpacing = 40; 
    const totalHeight = Math.max(650, maxNodes * minSpacing + 100);
    const totalWidth = 1000; // Increased width for better spacing

    ['instructor', 'course', 'room'].forEach(type => {
      const group = nodes.filter(n => n.type === type);
      group.sort((a,b) => b.links.length - a.links.length); // Put busy nodes at top
      
      const gap = totalHeight / (group.length + 1);
      group.forEach((n, i) => {
        n.y = (i + 1) * gap;
      });
    });

    return { nodes, links, width: totalWidth, height: totalHeight };
  }, [data]);

  return (
    <div className="h-full w-full bg-slate-900 border border-slate-700 rounded-xl relative overflow-auto custom-scrollbar flex flex-col">
      {/* Sticky Legend */}
      <div className="sticky top-0 left-0 z-20 flex gap-6 p-4 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider shadow-lg min-w-max">
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Instructors</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Courses</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Rooms</div>
      </div>

      <div className="relative" style={{ width: graph.width, height: graph.height }}>
        
        {/* SVG Layer for Links */}
        <svg 
          className="absolute inset-0 pointer-events-none" 
          width={graph.width} 
          height={graph.height} 
          viewBox={`0 0 ${graph.width} ${graph.height}`}
        >
          <defs>
            <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          
          {graph.links.map(link => {
            const s = graph.nodes.find(n => n.id === link.s);
            const t = graph.nodes.find(n => n.id === link.t);
            if(!s || !t) return null;

            const isHigh = hoveredNode && (hoveredNode === s.id || hoveredNode === t.id);
            const isDimmed = hoveredNode && !isHigh;

            // Smooth Bezier Curve
            const controlOffset = 150;
            const d = `M ${s.x} ${s.y} C ${s.x + controlOffset} ${s.y}, ${t.x - controlOffset} ${t.y}, ${t.x} ${t.y}`;

            return (
              <path
                key={link.key}
                d={d}
                fill="none"
                stroke={isHigh ? "#fff" : "url(#curveGrad)"}
                strokeWidth={isHigh ? 2 : 1}
                className={`transition-opacity duration-300 ${isDimmed ? 'opacity-5' : 'opacity-40'}`}
              />
            );
          })}
        </svg>

        {/* HTML Layer for Nodes (Better Text Rendering) */}
        {graph.nodes.map(node => {
          const isHovered = hoveredNode === node.id;
          const isDimmed = hoveredNode && !isHovered && !node.links.includes(hoveredNode);
          
          let colorClass = 'bg-slate-500';
          if (node.type === 'instructor') colorClass = 'bg-emerald-500 shadow-emerald-500/50';
          if (node.type === 'course') colorClass = 'bg-cyan-500 shadow-cyan-500/50';
          if (node.type === 'room') colorClass = 'bg-amber-500 shadow-amber-500/50';

          return (
            <div
              key={node.id}
              style={{ left: node.x, top: node.y }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 ${isDimmed ? 'opacity-20 blur-[1px]' : 'opacity-100'}`}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onNodeClick && onNodeClick(node)}
            >
              {/* Dot */}
              <div className={`w-3 h-3 rounded-full border-2 border-slate-900 shadow-lg ${colorClass} ${isHovered ? 'scale-150 ring-2 ring-white border-transparent' : ''}`}></div>
              
              {/* Label - Fixed Positioning */}
              <div 
                className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] font-medium text-slate-300 pointer-events-none transition-all
                  ${node.type === 'instructor' 
                    ? 'right-6 text-right origin-right'  // Instructors: Text to the LEFT of dot
                    : 'left-6 text-left origin-left'     // Others: Text to the RIGHT of dot
                  }
                  ${isHovered ? 'text-white text-sm font-bold z-50 scale-105 drop-shadow-md' : ''}
                `}
              >
                {node.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}