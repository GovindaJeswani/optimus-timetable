import React, { useMemo, useState } from 'react';

export default function RelationshipFlow({ data }) {
  const [hovered, setHovered] = useState(null);

  const graph = useMemo(() => {
    // Limit to top 50 to prevent crash
    const safeData = data.slice(0, 50); 
    const nodes = [];
    const links = [];
    
    const addNode = (id, type, label, x) => {
      let n = nodes.find(x => x.id === id);
      if(!n) {
        n = { id, type, label, x, links: [] };
        nodes.push(n);
      }
      return n;
    };

    safeData.forEach(d => {
      const cNode = addNode(`C-${d.courseCode}`, 'course', d.courseCode, 400);
      
      d.instructor.split(',').forEach(i => {
        if(i.length > 2) {
           const iNode = addNode(`I-${i.trim()}`, 'instructor', i.trim(), 100);
           links.push({ s: iNode, t: cNode });
           iNode.links.push(cNode.id); cNode.links.push(iNode.id);
        }
      });

      if(d.room && d.room !== 'TBA') {
        const rNode = addNode(`R-${d.room}`, 'room', d.room, 700);
        links.push({ s: cNode, t: rNode });
        rNode.links.push(cNode.id); cNode.links.push(rNode.id);
      }
    });

    // Spread Y positions
    ['instructor', 'course', 'room'].forEach(type => {
      const typeNodes = nodes.filter(n => n.type === type);
      const gap = 600 / (typeNodes.length + 1);
      typeNodes.forEach((n, i) => n.y = (i+1) * gap);
    });

    return { nodes, links };
  }, [data]);

  return (
    <div className="h-[600px] w-full bg-slate-900 border border-slate-700 rounded-xl relative overflow-hidden">
       <svg width="100%" height="100%" viewBox="0 0 800 600">
         {graph.links.map((link, i) => (
           <path key={i} 
             d={`M ${link.s.x} ${link.s.y} C ${link.s.x+150} ${link.s.y}, ${link.t.x-150} ${link.t.y}, ${link.t.x} ${link.t.y}`}
             fill="none" stroke="#475569" strokeWidth="1" opacity="0.4"
           />
         ))}
         {graph.nodes.map(node => (
           <g key={node.id} transform={`translate(${node.x},${node.y})`}>
             <circle r="5" fill={node.type==='course'?'#22d3ee':'#f59e0b'} />
             <text x="10" y="4" className="text-[10px] fill-slate-400">{node.label}</text>
           </g>
         ))}
       </svg>
    </div>
  );
}