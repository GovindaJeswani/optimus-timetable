export const detectConflicts = (courses) => {
  const conflicts = [];
  const allSlots = courses.flatMap(c => 
    c.slots.map(s => ({
      ...s,
      courseId: c.courseCode,
      instructor: c.instructor,
      room: c.room,
      uid: c.id
    }))
  );

  for (let i = 0; i < allSlots.length; i++) {
    for (let j = i + 1; j < allSlots.length; j++) {
      const A = allSlots[i];
      const B = allSlots[j];

      if (A.globalStart < B.globalEnd && B.globalStart < A.globalEnd) {
        if (A.instructor === B.instructor && A.instructor) {
          conflicts.push({ type: 'INSTRUCTOR', entity: A.instructor, source: A, target: B });
        }
        if (A.room === B.room && A.room !== 'TBA' && A.room) {
          conflicts.push({ type: 'ROOM', entity: A.room, source: A, target: B });
        }
      }
    }
  }
  return conflicts;
};