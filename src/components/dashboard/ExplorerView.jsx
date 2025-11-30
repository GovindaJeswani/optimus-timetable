import React, { useState, useMemo } from 'react';
import { Search, Filter, GitGraph, Activity, X } from 'lucide-react';
import FlowChart from '../visualization/FlowChart';
import Heatmap from '../visualization/Heatmap';

export default function ExplorerView({ fullData }) {
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('flow'); // 'flow' | 'heatmap'
  
  // Inspector State
  const [selectedNode, setSelectedNode] = useState(null);

  // 1. Logic: Filter Data
  const uniqueDepts = useMemo(() => {
    const d = new Set(fullData.map(i => i.dept));
    return ['All', ...Array.from(d).sort()];
  }, [fullData]);

  const filteredData = useMemo(() => {
    let res = fullData;
    if (selectedDept !== 'All') res = res.filter(d => d.dept === selectedDept);
    
    const term = searchTerm.toLowerCase();
    if (term) {
      res = res.filter(d => 
        (d.instructor||'').toLowerCase().includes(term) ||
        (d.courseCode||'').toLowerCase().includes(term) ||
        (d.room||'').toLowerCase().includes(term)
      );
    }
    return res;
  }, [fullData, selectedDept, searchTerm]);

  // 2. Logic: Get Details for Clicked Node
  const nodeDetails = useMemo(() => {
    if (!selectedNode) return null;
    
    // Find all related records
    const related = fullData.filter(d => {
      if (selectedNode.type === 'instructor') return d.instructor.includes(selectedNode.label);
      if (selectedNode.type === 'course') return d.courseCode === selectedNode.label;
      if (selectedNode.type === 'room') return d.room === selectedNode.label;
      return false;
    });

    return {
      title: selectedNode.label,
      type: selectedNode.type,
      count: related.length,
      records: related
    };
  }, [selectedNode, fullData]);

  return (
    <div className="h-full flex flex-col gap-6 relative">
      
      {/* HEADER */}
      <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl flex flex-wrap gap-4 items-center shrink-0">
        
        {/* Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
          <button 
            onClick={() => setTab('flow')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition ${tab==='flow' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <GitGraph size={16} /> Relations
          </button>
          <button 
            onClick={() => setTab('heatmap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition ${tab==='heatmap' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Activity size={16} /> Heatmap
          </button>
        </div>

        {/* Filters */}
        <select 
          className="bg-slate-900 border border-slate-600 text-slate-200 rounded-lg px-4 py-2 outline-none"
          value={selectedDept} onChange={e => setSelectedDept(e.target.value)}
        >
          {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <div className="flex-1 relative max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input 
             className="w-full bg-slate-900 border border-slate-600 text-slate-200 rounded-lg pl-10 pr-4 py-2 outline-none"
             placeholder="Search..."
             value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="ml-auto text-xs text-slate-500 font-mono">
          {filteredData.length} Records
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 bg-slate-950/30 rounded-2xl relative overflow-hidden border border-slate-800/50">
        {tab === 'flow' ? (
           <FlowChart data={filteredData} onNodeClick={setSelectedNode} />
        ) : (
           <Heatmap data={filteredData} />
        )}
      </div>

      {/* SLIDE-OVER INSPECTOR PANEL */}
      {nodeDetails && (
        <div className="absolute top-0 right-0 h-full w-80 bg-slate-900 border-l border-slate-700 shadow-2xl z-50 transform transition-transform animate-in slide-in-from-right duration-300 flex flex-col">
          
          <div className="p-6 border-b border-slate-700 bg-slate-800">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                nodeDetails.type==='instructor'?'bg-emerald-900 text-emerald-400':
                nodeDetails.type==='room'?'bg-amber-900 text-amber-400':'bg-cyan-900 text-cyan-400'
              }`}>
                {nodeDetails.type}
              </span>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{nodeDetails.title}</h2>
            <p className="text-slate-400 text-sm mt-1">Associated with {nodeDetails.count} classes</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
            {nodeDetails.records.map((rec, i) => (
              <div key={i} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors">
                <div className="font-bold text-cyan-400 text-sm">{rec.courseCode}</div>
                <div className="text-slate-300 text-xs mb-2 line-clamp-1">{rec.courseName}</div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 uppercase font-mono border-t border-slate-700/50 pt-2">
                  <div>
                    <span className="block text-emerald-500">Room</span>
                    {rec.room}
                  </div>
                  <div>
                    <span className="block text-amber-500">Instructor</span>
                    <span className="truncate block" title={rec.instructor}>{rec.instructor.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}