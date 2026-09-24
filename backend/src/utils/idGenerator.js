/**
 * Generates a unique student ID in the format: STU-YYYY-NNNN
 * e.g., STU-2026-0001
 *
 * Finds the highest existing ID for the current year and increments by 1.
 * Relies on the Student model — import lazily to avoid circular deps.
 */
export async function generateStudentId() {
  const { default: Student } = await import('../models/Student.js');

  const year   = new Date().getFullYear();
  const prefix = `STU-${year}-`;

  // Find the highest numbered ID for this year
  const last = await Student.findOne(
    { studentId: { $regex: `^${prefix}` } },
    { studentId: 1 },
    { sort: { studentId: -1 } }
  ).lean();

  let nextNum = 1;
  if (last) {
    const parts = last.studentId.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num)) nextNum = num + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}
