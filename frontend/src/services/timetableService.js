// Timetable Service with realistic schedules and persistence

const DEFAULT_TIMETABLE = {
  // Class X - Section A
  'cls-10a': {
    className: 'Class X - Section A',
    room: 'Room 304, Senior Block',
    classTeacher: 'Mr. Vikram Sen',
    schedule: {
      Monday: [
        { period: 1, time: '08:30 - 09:15', subject: 'Mathematics', teacher: 'Mr. Vikram Sen', room: '304', code: 'MATH' },
        { period: 2, time: '09:15 - 10:00', subject: 'Physics', teacher: 'Dr. Ramesh Rao', room: 'Science Lab 1', code: 'PHY' },
        { period: 3, time: '10:00 - 10:45', subject: 'English Core', teacher: 'Ms. Sunita Roy', room: '304', code: 'ENG' },
        { period: 'recess', time: '10:45 - 11:15', subject: 'Morning Recess & Snacks', teacher: 'Break', room: 'Campus Courtyard', isBreak: true },
        { period: 4, time: '11:15 - 12:00', subject: 'Chemistry', teacher: 'Mrs. Kavita Patel', room: 'Chemistry Lab', code: 'CHEM' },
        { period: 5, time: '12:00 - 12:45', subject: 'Social Studies', teacher: 'Mr. Rajesh Verma', room: '304', code: 'SST' },
        { period: 'lunch', time: '12:45 - 01:20', subject: 'Lunch Break', teacher: 'Break', room: 'Cafeteria', isBreak: true },
        { period: 6, time: '01:20 - 02:05', subject: 'Computer Science', teacher: 'Mr. Amit Sinha', room: 'Computer Lab 2', code: 'CS' },
        { period: 7, time: '02:05 - 02:45', subject: 'Physical Education', teacher: 'Coach Harish', room: 'Sports Ground', code: 'PE' },
      ],
      Tuesday: [
        { period: 1, time: '08:30 - 09:15', subject: 'Chemistry', teacher: 'Mrs. Kavita Patel', room: '304', code: 'CHEM' },
        { period: 2, time: '09:15 - 10:00', subject: 'Mathematics', teacher: 'Mr. Vikram Sen', room: '304', code: 'MATH' },
        { period: 3, time: '10:00 - 10:45', subject: 'Biology', teacher: 'Dr. Archana Das', room: 'Bio Lab', code: 'BIO' },
        { period: 'recess', time: '10:45 - 11:15', subject: 'Morning Recess & Snacks', teacher: 'Break', room: 'Campus Courtyard', isBreak: true },
        { period: 4, time: '11:15 - 12:00', subject: 'English Core', teacher: 'Ms. Sunita Roy', room: '304', code: 'ENG' },
        { period: 5, time: '12:00 - 12:45', subject: 'Hindi / Sanskrit', teacher: 'Mr. Devendra Mishra', room: '304', code: 'LANG' },
        { period: 'lunch', time: '12:45 - 01:20', subject: 'Lunch Break', teacher: 'Break', room: 'Cafeteria', isBreak: true },
        { period: 6, time: '01:20 - 02:05', subject: 'Social Studies', teacher: 'Mr. Rajesh Verma', room: '304', code: 'SST' },
        { period: 7, time: '02:05 - 02:45', subject: 'Library & Reading', teacher: 'Mrs. Shanti Nair', room: 'Central Library', code: 'LIB' },
      ],
      Wednesday: [
        { period: 1, time: '08:30 - 09:15', subject: 'Physics', teacher: 'Dr. Ramesh Rao', room: 'Science Lab 1', code: 'PHY' },
        { period: 2, time: '09:15 - 10:00', subject: 'Mathematics', teacher: 'Mr. Vikram Sen', room: '304', code: 'MATH' },
        { period: 3, time: '10:00 - 10:45', subject: 'Computer Science', teacher: 'Mr. Amit Sinha', room: 'Computer Lab 2', code: 'CS' },
        { period: 'recess', time: '10:45 - 11:15', subject: 'Morning Recess & Snacks', teacher: 'Break', room: 'Campus Courtyard', isBreak: true },
        { period: 4, time: '11:15 - 12:00', subject: 'Social Studies', teacher: 'Mr. Rajesh Verma', room: '304', code: 'SST' },
        { period: 5, time: '12:00 - 12:45', subject: 'English Core', teacher: 'Ms. Sunita Roy', room: '304', code: 'ENG' },
        { period: 'lunch', time: '12:45 - 01:20', subject: 'Lunch Break', teacher: 'Break', room: 'Cafeteria', isBreak: true },
        { period: 6, time: '01:20 - 02:05', subject: 'Art & Craft', teacher: 'Mrs. Neha Kulkarni', room: 'Art Studio', code: 'ART' },
        { period: 7, time: '02:05 - 02:45', subject: 'Club Activity', teacher: 'Faculty Assigned', room: 'Auditorium', code: 'CLUB' },
      ],
      Thursday: [
        { period: 1, time: '08:30 - 09:15', subject: 'Mathematics', teacher: 'Mr. Vikram Sen', room: '304', code: 'MATH' },
        { period: 2, time: '09:15 - 10:00', subject: 'Chemistry', teacher: 'Mrs. Kavita Patel', room: 'Chemistry Lab', code: 'CHEM' },
        { period: 3, time: '10:00 - 10:45', subject: 'Biology', teacher: 'Dr. Archana Das', room: 'Bio Lab', code: 'BIO' },
        { period: 'recess', time: '10:45 - 11:15', subject: 'Morning Recess & Snacks', teacher: 'Break', room: 'Campus Courtyard', isBreak: true },
        { period: 4, time: '11:15 - 12:00', subject: 'Hindi / Sanskrit', teacher: 'Mr. Devendra Mishra', room: '304', code: 'LANG' },
        { period: 5, time: '12:00 - 12:45', subject: 'Physics', teacher: 'Dr. Ramesh Rao', room: '304', code: 'PHY' },
        { period: 'lunch', time: '12:45 - 01:20', subject: 'Lunch Break', teacher: 'Break', room: 'Cafeteria', isBreak: true },
        { period: 6, time: '01:20 - 02:05', subject: 'English Core', teacher: 'Ms. Sunita Roy', room: '304', code: 'ENG' },
        { period: 7, time: '02:05 - 02:45', subject: 'Yoga & Meditation', teacher: 'Coach Anita', room: 'Yoga Hall', code: 'YOGA' },
      ],
      Friday: [
        { period: 1, time: '08:30 - 09:15', subject: 'Physics Lab', teacher: 'Dr. Ramesh Rao', room: 'Physics Lab', code: 'PHY-LAB' },
        { period: 2, time: '09:15 - 10:00', subject: 'Physics Lab', teacher: 'Dr. Ramesh Rao', room: 'Physics Lab', code: 'PHY-LAB' },
        { period: 3, time: '10:00 - 10:45', subject: 'Mathematics', teacher: 'Mr. Vikram Sen', room: '304', code: 'MATH' },
        { period: 'recess', time: '10:45 - 11:15', subject: 'Morning Recess & Snacks', teacher: 'Break', room: 'Campus Courtyard', isBreak: true },
        { period: 4, time: '11:15 - 12:00', subject: 'Social Studies', teacher: 'Mr. Rajesh Verma', room: '304', code: 'SST' },
        { period: 5, time: '12:00 - 12:45', subject: 'Computer Science', teacher: 'Mr. Amit Sinha', room: 'Computer Lab 2', code: 'CS' },
        { period: 'lunch', time: '12:45 - 01:20', subject: 'Lunch Break', teacher: 'Break', room: 'Cafeteria', isBreak: true },
        { period: 6, time: '01:20 - 02:05', subject: 'English Core', teacher: 'Ms. Sunita Roy', room: '304', code: 'ENG' },
        { period: 7, time: '02:05 - 02:45', subject: 'Physical Education', teacher: 'Coach Harish', room: 'Sports Ground', code: 'PE' },
      ],
      Saturday: [
        { period: 1, time: '08:30 - 09:15', subject: 'Doubt Clearing & Mentorship', teacher: 'Mr. Vikram Sen', room: '304', code: 'MENTOR' },
        { period: 2, time: '09:15 - 10:00', subject: 'Weekly Assessment', teacher: 'All Subject Teachers', room: 'Exam Hall A', code: 'TEST' },
        { period: 3, time: '10:00 - 10:45', subject: 'Music / Performing Arts', teacher: 'Mr. Rahul Joshi', room: 'Music Room', code: 'MUS' },
        { period: 'recess', time: '10:45 - 11:15', subject: 'Morning Recess', teacher: 'Break', room: 'Courtyard', isBreak: true },
        { period: 4, time: '11:15 - 12:00', subject: 'House Assembly & Debate', teacher: 'Senior Wing Lead', room: 'Auditorium', code: 'ASSEMBLY' },
      ],
    },
  },
};

const STORAGE_KEY = 'schoolerp_timetables';

export const timetableService = {
  getTimetable: async (classId) => {
    // Check localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    let all = saved ? JSON.parse(saved) : DEFAULT_TIMETABLE;

    if (!all[classId]) {
      // Create a default schedule based on Class X template
      all[classId] = {
        className: classId.toUpperCase(),
        room: `Room ${Math.floor(100 + Math.random() * 200)}`,
        classTeacher: 'Senior Faculty Member',
        schedule: DEFAULT_TIMETABLE['cls-10a'].schedule,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }

    return all[classId];
  },

  updatePeriod: async (classId, day, periodIndex, updatedSlot) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let all = saved ? JSON.parse(saved) : DEFAULT_TIMETABLE;

    if (all[classId] && all[classId].schedule[day]) {
      all[classId].schedule[day][periodIndex] = {
        ...all[classId].schedule[day][periodIndex],
        ...updatedSlot,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
    return all[classId];
  },

  resetToDefault: async () => {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_TIMETABLE['cls-10a'];
  },
};
