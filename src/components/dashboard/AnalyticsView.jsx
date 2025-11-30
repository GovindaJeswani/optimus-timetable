import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function AnalyticsView({ analytics }) {
  if (!analytics || !analytics.roomUtil) return <div className="text-slate-500">No Data Analyzed</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
      
      {/* 1. ROOM UTILIZATION (Bar Chart) */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-lg font-bold text-cyan-400 mb-4">Top 20 Busy Rooms</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.roomUtil} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
              <Bar dataKey="count" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. SUBJECT DISTRIBUTION (Pie Chart) */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-lg font-bold text-purple-400 mb-4">Course Distribution by Dept</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.subjectDist}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={5}
                dataKey="count"
              >
                {analytics.subjectDist.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. INSTRUCTOR WORKLOAD (Area Chart) */}
      <div className="col-span-1 md:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-lg font-bold text-emerald-400 mb-4">Instructor Workload (Top 20)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.instructorLoad}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
              <Area type="monotone" dataKey="count" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}