import React, { useState, useEffect } from 'react';
import { Upload, Database, Users, Trash2, FileText, X } from 'lucide-react';
import { processCSV } from './core/engine/ingestor';
import ExplorerView from './components/dashboard/ExplorerView';
import MeetingScheduler from './components/dashboard/MeetingScheduler';

export default function OptimusDashboard() {
  const [data, setData] = useState([]);
  const [view, setView] = useState('upload'); 
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  // 1. PERSISTENCE: Load data from LocalStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('optimus_data');
    const savedFiles = localStorage.getItem('optimus_files');
    if (savedData) setData(JSON.parse(savedData));
    if (savedFiles) setFiles(JSON.parse(savedFiles));
  }, []);

  // 2. PERSISTENCE: Save data whenever it changes
  useEffect(() => {
    localStorage.setItem('optimus_data', JSON.stringify(data));
    localStorage.setItem('optimus_files', JSON.stringify(files));
  }, [data, files]);

  // 3. FILE MANAGER LOGIC
  const handleFileUpload = async (e) => {
    setLoading(true);
    const uploadedFiles = Array.from(e.target.files);
    let newData = [];
    let newFileNames = [];

    try {
      for (const file of uploadedFiles) {
        // Check if file already exists
        if (files.includes(file.name)) {
          console.warn(`Skipping duplicate: ${file.name}`);
          continue;
        }
        const processed = await processCSV(file);
        newData = [...newData, ...processed];
        newFileNames.push(file.name);
      }
      
      setData(prev => [...prev, ...newData]);
      setFiles(prev => [...prev, ...newFileNames]);
      setView('explorer'); 
    } catch (err) {
      alert("Error parsing CSV: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = (fileName) => {
    if (confirm(`Remove ${fileName} and its data?`)) {
      setFiles(prev => prev.filter(f => f !== fileName));
      setData(prev => prev.filter(row => row._sourceFile !== fileName));
    }
  };

  const clearAll = () => {
    if (confirm("Clear ALL data? This cannot be undone.")) {
      setData([]);
      setFiles([]);
      localStorage.removeItem('optimus_data');
      localStorage.removeItem('optimus_files');
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <nav className="w-20 lg:w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col p-4 z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="font-bold text-slate-900 text-xl">O</span>
          </div>
          <span className="font-bold text-xl tracking-tight hidden lg:block text-slate-200">OPTIMUS</span>
        </div>
        
        <div className="space-y-2 flex-1">
          <NavBtn icon={Upload} label="Manage Data" active={view==='upload'} onClick={()=>setView('upload')} />
          <NavBtn icon={Database} label="Data Explorer" active={view==='explorer'} onClick={()=>setView('explorer')} />
          <NavBtn icon={Users} label="Meeting Scheduler" active={view==='scheduler'} onClick={()=>setView('scheduler')} />
        </div>

        <div className="pt-4 border-t border-slate-800 hidden lg:block">
           <div className="text-xs text-slate-500 mb-2 flex justify-between">
             <span>Storage:</span>
             <span>{(JSON.stringify(data).length / 1024 / 1024).toFixed(2)} MB</span>
           </div>
           {data.length > 0 && (
             <button onClick={clearAll} className="w-full py-2 text-xs text-rose-400 hover:bg-rose-900/20 rounded flex items-center justify-center gap-2 border border-rose-900/30">
               <Trash2 size={12} /> Format System
             </button>
           )}
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 relative overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900">
        {loading && (
          <div className="absolute inset-0 bg-slate-950/80 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
              <div className="text-cyan-400 font-mono text-sm animate-pulse">INGESTING NEURAL DATA...</div>
            </div>
          </div>
        )}

        {/* VIEW: UPLOAD & MANAGER */}
        <div className={`${view === 'upload' ? 'block' : 'hidden'} h-full flex flex-col max-w-4xl mx-auto`}>
           {/* Drop Zone */}
           <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
             <div className="w-full border-2 border-dashed border-slate-700 rounded-3xl bg-slate-900/50 p-12 text-center hover:border-cyan-500/50 hover:bg-slate-900 transition-all group relative">
               <input type="file" multiple onChange={handleFileUpload} className="hidden" id="csvInput" />
               <label htmlFor="csvInput" className="cursor-pointer">
                 <div className="w-20 h-20 bg-slate-800 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                   <Upload className="h-10 w-10 text-cyan-400" />
                 </div>
                 <h2 className="text-3xl font-bold text-white mb-2">Upload Timetables</h2>
                 <p className="text-slate-400">Supported: CSV (BITS Format)</p>
               </label>
             </div>
           </div>

           {/* Active Files List */}
           {files.length > 0 && (
             <div className="mt-8">
               <h3 className="text-slate-400 font-bold mb-4 uppercase text-xs tracking-wider">Active Datasets ({files.length})</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {files.map(f => (
                   <div key={f} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center group">
                     <div className="flex items-center gap-3 overflow-hidden">
                       <div className="p-2 bg-slate-700 rounded-lg"><FileText size={16} className="text-cyan-400" /></div>
                       <span className="text-sm text-slate-200 truncate">{f}</span>
                     </div>
                     <button onClick={() => deleteFile(f)} className="text-slate-500 hover:text-rose-400 p-2 hover:bg-rose-900/20 rounded-lg transition-colors">
                       <Trash2 size={16} />
                     </button>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>

        {/* VIEW: EXPLORER (Using hidden instead of unmount to preserve state) */}
        <div className={`${view === 'explorer' ? 'block' : 'hidden'} h-full`}>
           <ExplorerView fullData={data} />
        </div>
        
        {/* VIEW: SCHEDULER */}
        <div className={`${view === 'scheduler' ? 'block' : 'hidden'} h-full`}>
           <MeetingScheduler fullData={data} />
        </div>

      </main>
    </div>
  );
}

const NavBtn = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all ${
      active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-900/10' : 'text-slate-400 hover:bg-slate-800'
    }`}
  >
    <Icon size={20} /> 
    <span className="hidden lg:block font-medium">{label}</span>
  </button>
);