/**
 * BITS PILANI TIME PARSER
 * Converts "M 2 3" -> [{day: 'Monday', start: 540, end: 600}, ...]
 */
const DAYS_MAP = {
  M: "Monday", T: "Tuesday", W: "Wednesday", Th: "Thursday", TH: "Thursday", F: "Friday", S: "Saturday",
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday"
};

const getPeriodTime = (periodNum) => {
  const p = parseInt(periodNum, 10);
  if (isNaN(p)) return null;
  // Period 1 = 8:00 AM (7 + 1)
  const startHour = 7 + p; 
  return { start: startHour * 60, end: (startHour * 60) + 50 };
};

export const parseTimePattern = (rawString) => {
  if (!rawString || typeof rawString !== 'string') return [];
  if (rawString.toUpperCase().includes('TBA')) return [];

  // Normalize: "M 2 3"
  let cleanStr = rawString
    .replace(/,/g, ' ')
    .replace(/-/g, ' ')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2') 
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .trim();

  const tokens = cleanStr.split(/\s+/);
  const slots = [];
  let activeDays = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i].toUpperCase();
    const mappedDay = Object.keys(DAYS_MAP).find(k => k.toUpperCase() === t);

    if (mappedDay) {
      const prevToken = i > 0 ? tokens[i-1] : null;
      if (prevToken && !isNaN(prevToken)) activeDays = [];
      activeDays.push(DAYS_MAP[mappedDay]);
    } 
    else if (!isNaN(t)) {
      const time = getPeriodTime(t);
      if (time && activeDays.length > 0) {
        activeDays.forEach(day => {
          slots.push({
            day,
            start: time.start,
            end: time.end,
            id: `${day}-${time.start}-${Math.random().toString(36).substr(2,6)}`
          });
        });
      }
    }
  }
  return slots;
};