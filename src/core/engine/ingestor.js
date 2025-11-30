import Papa from 'papaparse';
import { parseTimePattern } from './parser';

const TARGET_SCHEMA = {
  courseCode: ['course_no', 'com_code', 'code'],
  courseName: ['course_title', 'title', 'name'],
  instructor: ['instructors', 'instructor_name', 'faculty'],
  room: ['room', 'venue', 'loc'],
  timing: ['days_h', 'schedule', 'hours'], 
  dept: ['course_no'] 
};

const mapHeader = (header) => {
  const lower = header.toLowerCase().trim().replace(/[^a-z_]/g, '');
  for (const [key, variants] of Object.entries(TARGET_SCHEMA)) {
    if (variants.some(v => lower.includes(v))) return key;
  }
  return `unknown_${header}`;
};

const cleanValue = (val) => {
  if (!val) return 'TBA';
  const s = String(val).trim().replace(/\s+/g, ' ');
  return (s === '' || s.toLowerCase() === 'nan') ? 'TBA' : s;
};

// Now accepts 'fileName' as the second argument
export const processCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { meta, data } = results;
        const headerMap = {};
        meta.fields.forEach(f => headerMap[f] = mapHeader(f));

        const processed = data.map((row, idx) => {
          const entry = { 
            id: `row-${idx}-${Math.random().toString(36).substr(2, 6)}`,
            _sourceFile: file.name // <--- TAGGING THE SOURCE
          };

          Object.keys(row).forEach(key => {
            const canonicalKey = headerMap[key];
            if (!canonicalKey.startsWith('unknown')) {
              entry[canonicalKey] = cleanValue(row[key]);
            }
          });

          entry.slots = entry.timing ? parseTimePattern(entry.timing) : [];

          if (entry.courseCode && entry.courseCode !== 'TBA') {
             const parts = entry.courseCode.split(' ');
             entry.dept = isNaN(parts[0]) ? parts[0] : 'Unknown';
          } else {
             entry.dept = 'Unknown';
          }

          return entry;
        });

        resolve(processed.filter(p => p.courseCode && p.courseCode.length < 20));
      },
      error: (err) => reject(err)
    });
  });
};