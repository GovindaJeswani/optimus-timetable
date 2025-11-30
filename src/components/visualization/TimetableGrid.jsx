import React, { useMemo } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const START_HOUR = 7; 
const END_HOUR = 19;
const PIXELS_PER_MIN = 1.2; 

const TimetableGrid = ({ data }) => {
  const processedEvents = useMemo(() => {
    let events = data.flatMap(course => 
      (course.slots || []).map(slot => ({
        ...slot,
        courseCode: course.courseCode,
        title: course.courseName,
        instructor: course.instructor,
        room: course.room,
        color: getColorForDept(course.dept),
        uid: `${course.id}-${slot.day}-${slot.start}`
      }))
    );
    return events;
  }, [data]);

  const timeLabels = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="flex flex-col h-[800px] w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden relative">
      <div className="grid grid-cols-7 border-b border-slate-700 bg-slate-800 shrink-0 h-10">
        <div className="p-2 text-center text-xs font-mono text-slate-500 border-r border-slate-700">TIME</div>
        {DAYS.map(day => (
          <div key={day} className="p-2 text-center text-xs font-bold text-cyan-400 border-r border-slate-700">
            {day.toUpperCase()}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto relative bg-slate-900 custom-scrollbar">
        <div className="grid grid-cols-7 min-h-[900px] relative">
          
          <div className="border-r border-slate-700 bg-slate-800/30">
            {timeLabels.map(hour => (
              <div key={hour} className="absolute w-full text-right pr-2 text-[10px] text-slate-500"
                style={{ top: `${(hour * 60 - START_HOUR * 60) * PIXELS_PER_MIN}px` }}>
                {hour}:00
              </div>
            ))}
          </div>

          {DAYS.map(day => {
            const daysEvents = processedEvents.filter(e => e.day === day);
            return (
              <div key={day} className="relative border-r border-slate-700/50 hover:bg-slate-800/20">
                 {/* Grid Lines */}
                 {timeLabels.map(hour => (
                  <div key={`l-${hour}`} className="absolute w-full border-t border-slate-800/30"
                    style={{ top: `${(hour * 60 - START_HOUR * 60) * PIXELS_PER_MIN}px` }} />
                ))}

                {daysEvents.map((event, idx) => (
                  <div key={idx}
                    style={{ 
                      top: `${(event.start - (START_HOUR * 60)) * PIXELS_PER_MIN}px`, 
                      height: `${(event.end - event.start) * PIXELS_PER_MIN}px`,
                      width: '90%'
                    }}
                    className={`absolute left-1 rounded border-l-2 p-1 text-[9px] overflow-hidden hover:z-50 hover:w-full hover:shadow-xl transition-all cursor-pointer ${event.color}`}
                    title={`${event.courseCode}: ${event.title}`}
                  >
                    <div className="font-bold truncate">{event.courseCode}</div>
                    <div className="opacity-80 truncate">{event.room}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const getColorForDept = (dept) => {
  if(dept?.includes('CS')) return 'bg-blue-600/40 border-blue-400 text-blue-100';
  if(dept?.includes('EEE') || dept?.includes('INSTR')) return 'bg-amber-600/40 border-amber-400 text-amber-100';
  if(dept?.includes('BIO')) return 'bg-emerald-600/40 border-emerald-400 text-emerald-100';
  return 'bg-slate-700/50 border-slate-500 text-slate-200';
};

export default TimetableGrid;