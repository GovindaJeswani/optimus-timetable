import React, { useState, useMemo, useEffect } from 'react';
import { UserPlus, Calendar, Save, Trash2, Download, Users, X, CheckCircle, ChevronRight } from 'lucide-react';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function MeetingScheduler({ fullData }) {
  const [selectedProfs, setSelectedProfs] = useState([]);
  const [search, setSearch] = useState('');
  
  // Group Management State
  const [savedGroups, setSavedGroups] = useState({}); // { "Committee A": ["Prof X", "Prof Y"] }
  const [newGroupName, setNewGroupName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 1. PERSISTENCE: Load Groups on Mount
  useEffect(() => {
    const loaded = localStorage.getItem('optimus_groups');
    if (loaded) setSavedGroups(JSON.parse(loaded));
  }, []);

  // 2. PERSISTENCE: Save Groups on Change
  useEffect(() => {
    localStorage.setItem('optimus_groups', JSON.stringify(savedGroups));
  }, [savedGroups]);

  // 3. Logic: Get Unique Instructors
  const allInstructors = useMemo(() => {
    const s = new Set();
    fullData.forEach(d => {
      d.instructor.split(/,|&|\//).forEach(i => {
        const name = i.trim();
        if (name.length > 2) s.add(name);
      });
    });
    return Array.from(s).sort();
  }, [fullData]);

  // 4. Logic: Toggle Selection
  const toggleProf = (name) => {
    if (selectedProfs.includes(name)) {
      setSelectedProfs(prev => prev.filter(p => p !== name));
    } else {
      setSelectedProfs(prev => [...prev, name]);
    }
  };

  // 5. Logic: Group Actions
  const saveGroup = () => {
    if (!newGroupName.trim()) return alert("Enter a group name");
    if (selectedProfs.length < 2) return alert("Select at least 2 professors");
    
    setSavedGroups(prev => ({
      ...prev,
      [newGroupName.trim()]: selectedProfs
    }));
    setNewGroupName('');
    setIsSaving(false);
  };

  const loadGroup = (groupName) => {
    setSelectedProfs(savedGroups[groupName]);
  };

  const deleteGroup = (groupName) => {
    if (confirm(`Delete group "${groupName}"?`)) {
      const newGroups = { ...savedGroups };
      delete newGroups[groupName];
      setSavedGroups(newGroups);
    }
  };

  // 6. CORE LOGIC: Compute Matrix
  const scheduleMatrix = useMemo(() => {
    const matrix = {}; 
    DAYS.forEach(day => {
      HOURS.forEach(h => {
        matrix[`${day}-${h}`] = { busy: false, who: [] };
      });
    });

    fullData.forEach(d => {
      const instructors = d.instructor.split(/,|&|\//).map(s => s.trim());
      const teachingProf = instructors.find(i => selectedProfs.includes(i));

      if (teachingProf) {
        d.slots.forEach(slot => {
          const h = Math.floor(slot.start / 60);
          const key = `${slot.day}-${h}`;
          if (matrix[key]) {
            matrix[key].busy = true;
            if (!matrix[key].who.includes(teachingProf)) {
              matrix[key].who.push(teachingProf);
            }
          }
        });
      }
    });
    return matrix;
  }, [fullData, selectedProfs]);

  // 7. Logic: Find Free Slots
  const freeSlots = useMemo(() => {
    if (selectedProfs.length === 0) return [];
    const slots = [];
    DAYS.forEach(day => {
      HOURS.forEach(h => {
        const cell = scheduleMatrix[`${day}-${h}`];
        if (!cell.busy) {
          slots.push({ day, time: h, end: h+1 });
        }
      });
    });
    return slots;
  }, [scheduleMatrix, selectedProfs]);

  // 8. Logic: Download CSV
  const downloadCSV = () => {
    if (freeSlots.length === 0) return alert("No free slots to export.");
    
    let csvContent = "data:text/csv;charset=utf-8,Day,Start Time,End Time,Status\n";
    freeSlots.forEach(slot => {
      csvContent += `${slot.day},${slot.time}:00,${slot.end}:00,Available\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `meeting_slots_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      
      {/* LEFT PANEL: Controls */}
      <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 h-full overflow-hidden">
        
        {/* A. Group Manager */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg shrink-0">
          <h3 className="text-slate-300 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Users size={16} className="text-cyan-400" /> Saved Groups
          </h3>
          
          {Object.keys(savedGroups).length === 0 ? (
            <div className="text-xs text-slate-500 italic mb-2">No groups saved yet.</div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto custom-scrollbar">
              {Object.keys(savedGroups).map(name => (
                <div key={name} className="group flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 cursor-pointer hover:border-cyan-500 transition-colors">
                  <span onClick={() => loadGroup(name)} className="text-xs font-medium text-slate-300 hover:text-white flex-1">{name}</span>
                  <button onClick={() => deleteGroup(name)} className="text-slate-600 hover:text-rose-400"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Save Current Selection */}
          {selectedProfs.length > 1 && (
            <div className="mt-2 pt-3 border-t border-slate-700">
               {!isSaving ? (
                 <button 
                   onClick={() => setIsSaving(true)}
                   className="w-full text-xs flex items-center justify-center gap-2 text-cyan-400 hover:bg-cyan-900/20 py-2 rounded transition"
                 >
                   <Save size={14} /> Save Current Selection as Group
                 </button>
               ) : (
                 <div className="flex gap-2">
                   <input 
                     className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white outline-none focus:border-cyan-500"
                     placeholder="Group Name (e.g. Physics Dept)"
                     value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
                     autoFocus
                   />
                   <button onClick={saveGroup} className="bg-cyan-600 hover:bg-cyan-500 text-white p-1 rounded"><ChevronRight size={16}/></button>
                   <button onClick={() => setIsSaving(false)} className="text-slate-500 hover:text-white p-1"><X size={16}/></button>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* B. Professor Selector */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg flex-1 flex flex-col min-h-0">
          <div className="relative mb-3">
            <input 
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
              placeholder="Search Professor..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          {/* List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-700 rounded-lg bg-slate-900/50">
            {allInstructors
              .filter(i => i.toLowerCase().includes(search.toLowerCase()) && !selectedProfs.includes(i))
              .slice(0, 50)
              .map(prof => (
                <button 
                  key={prof} onClick={() => toggleProf(prof)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors border-b border-slate-800 last:border-0 flex items-center justify-between group"
                >
                  {prof}
                  <UserPlus size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            ))}
          </div>

          {/* Selected Chips */}
          <div className="flex flex-wrap gap-2 mt-4 min-h-[40px]">
            {selectedProfs.map(p => (
              <span key={p} className="bg-cyan-900/40 text-cyan-300 border border-cyan-700/50 text-[10px] px-2 py-1 rounded-md flex items-center gap-1 animate-in fade-in zoom-in">
                {p} <button onClick={() => toggleProf(p)} className="hover:text-white"><X size={10} /></button>
              </span>
            ))}
            {selectedProfs.length === 0 && <span className="text-slate-500 text-xs italic p-1">Select professors to begin</span>}
          </div>
        </div>

        {/* C. Results Area */}
        <div className="bg-emerald-900/10 p-4 rounded-xl border border-emerald-900/30 flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-emerald-400 font-bold flex items-center gap-2 text-sm uppercase">
               <CheckCircle size={16} /> Available Slots
             </h3>
             {freeSlots.length > 0 && (
               <button 
                 onClick={downloadCSV}
                 className="text-[10px] bg-emerald-800/50 hover:bg-emerald-700 text-emerald-100 px-2 py-1 rounded flex items-center gap-1 transition"
               >
                 <Download size={12} /> CSV
               </button>
             )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
             {selectedProfs.length > 0 ? (
                freeSlots.length > 0 ? freeSlots.map((slot, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900/80 p-2 rounded border-l-2 border-emerald-500 shadow-sm">
                    <span className="text-slate-200 text-xs font-bold">{slot.day}</span>
                    <span className="text-emerald-400 font-mono text-xs bg-emerald-900/20 px-2 py-0.5 rounded">{slot.time}:00 - {slot.time+1}:00</span>
                  </div>
                )) : (
                  <div className="text-rose-400 text-xs text-center mt-10 p-4 bg-rose-900/10 rounded-lg">
                    No common free time found.<br/>Try removing a professor.
                  </div>
                )
             ) : (
                <div className="text-slate-600 text-xs text-center mt-10">Waiting for selection...</div>
             )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Visual Matrix */}
      <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-6 overflow-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-200 font-bold flex items-center gap-2">
            <Calendar className="text-purple-400" /> Consolidated Schedule
          </h3>
          <div className="flex gap-4 text-xs">
             <div className="flex items-center gap-2"><span className="w-3 h-3 bg-rose-500 rounded-sm"></span> Busy</div>
             <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-900/30 border border-emerald-800 rounded-sm"></span> Free</div>
          </div>
        </div>

        <div className="grid grid-cols-[100px_1fr] gap-2 min-w-[700px]">
          {/* Header */}
          <div></div>
          <div className="flex mb-2">
            {HOURS.map(h => (
              <div key={h} className="flex-1 text-center text-xs text-slate-500 font-mono">{h}:00</div>
            ))}
          </div>

          {/* Rows */}
          {DAYS.map(day => (
            <React.Fragment key={day}>
              <div className="h-12 flex items-center justify-end pr-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-800">
                {day}
              </div>
              <div className="flex h-12 mb-2 bg-slate-800/30 rounded-r-lg overflow-hidden border border-slate-700/30">
                {HOURS.map(h => {
                  const cell = scheduleMatrix[`${day}-${h}`];
                  return (
                    <div 
                      key={h} 
                      className={`flex-1 border-r border-slate-700/30 transition-all relative group
                        ${cell.busy 
                           ? 'bg-rose-600/20 hover:bg-rose-600/30' 
                           : 'hover:bg-emerald-500/10'
                        }
                      `}
                    >
                      {cell.busy ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                          {/* Hover Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-48 bg-slate-900 border border-slate-600 p-3 rounded-lg shadow-2xl text-[10px]">
                            <div className="text-rose-400 font-bold mb-1 uppercase tracking-wider border-b border-slate-700 pb-1">Busy Professors</div>
                            <div className="max-h-20 overflow-y-auto custom-scrollbar">
                              {cell.who.map(p => <div key={p} className="text-slate-300 truncate py-0.5">{p}</div>)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        selectedProfs.length > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-emerald-500/20 font-bold text-lg select-none">✓</span>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

    </div>
  );
}