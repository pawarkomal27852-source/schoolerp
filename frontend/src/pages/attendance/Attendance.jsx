import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { attendanceService } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { PageHeader, StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { QRAttendanceModal } from '../../components/modals/QRAttendanceModal';
import { exportToCsv, exportTableToPrint } from '../../utils/exportUtils';

export const Attendance = () => {
  const { showToast } = useToast();

  const [date, setDate] = useState('2024-10-24');
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Load active classes
  useEffect(() => {
    const init = async () => {
      try {
        const clsList = await classService.getClasses();
        const activeOnly = clsList.filter((c) => c.status === 'Active');
        setClasses(activeOnly);
        if (activeOnly.length > 0) {
          setSelectedClassId(activeOnly[0].id);
        }
      } catch {
        showToast('Error loading classrooms', 'error');
      }
    };
    init();
  }, []);

  // Load attendance records for date & class
  useEffect(() => {
    if (!selectedClassId) return;

    const loadAttendance = async () => {
      setLoading(true);
      try {
        const data = await attendanceService.getAttendance({
          date,
          classId: selectedClassId,
        });
        setStudents(data);
      } catch {
        showToast('Failed to load attendance list', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [date, selectedClassId]);

  const handleStatusChange = (studentId, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const markAll = (status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
    showToast(`Marked all as ${status}`, 'info');
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) return;

    setSaving(true);
    try {
      await attendanceService.markAttendance({
        date,
        classId: selectedClassId,
        records: students,
      });
      showToast(`Attendance recorded successfully for ${students.length} students!`, 'success');
    } catch {
      showToast('Error saving attendance records', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Export handlers
  const handleExportCsv = () => {
    const headers = ['Student ID', 'Student Name', 'Roll No', 'Class', 'Date', 'Attendance Status'];
    const rows = students.map((s) => [
      s.studentId,
      `${s.firstName} ${s.lastName}`,
      s.rollNo || '—',
      s.className,
      date,
      s.status,
    ]);
    exportToCsv(`Attendance_${selectedClass?.name || 'Class'}_${date}`, headers, rows);
    showToast('Attendance CSV exported successfully', 'success');
  };

  const handleExportPrint = () => {
    const columns = ['Student ID', 'Student Name', 'Roll No', 'Class', 'Date', 'Status'];
    const rows = students.map((s) => [
      s.studentId,
      `${s.firstName} ${s.lastName}`,
      s.rollNo || '—',
      s.className,
      date,
      s.status,
    ]);
    exportTableToPrint(`Daily Attendance Roster - ${date}`, columns, rows);
  };

  const presentCount = students.filter((s) => s.status === 'Present').length;
  const absentCount = students.filter((s) => s.status === 'Absent').length;
  const totalCount = students.length;
  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Daily Roll Call & Attendance"
        subtitle="Mark classroom attendance, scan student QR badges, track absentees, and export logs"
        icon="event_available"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon="qr_code_scanner"
              onClick={() => setQrModalOpen(true)}
              className="border-[#006a61] text-[#006a61] hover:bg-[#86f2e4]/20"
            >
              QR Scanner Station
            </Button>
            <Button variant="outline" size="sm" icon="download" onClick={handleExportCsv}>
              Export CSV
            </Button>
            <Button variant="outline" size="sm" icon="print" onClick={handleExportPrint}>
              Print Roster
            </Button>
            <Link to="/attendance/history">
              <Button variant="outline" size="sm" icon="history">
                History
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              icon="save"
              onClick={handleSaveAttendance}
              loading={saving}
              disabled={students.length === 0}
            >
              Save Roll
            </Button>
          </div>
        }
      />

      {/* Filter and Date Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-[#e5eeff] dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#767680] dark:text-slate-400 uppercase tracking-wider">
              Select Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm font-semibold text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#e5eeff] dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-900 rounded-xl px-3 py-2 border border-transparent focus:border-[#061449] focus:outline-none"
            />
          </div>

          {/* Class Select */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#767680] dark:text-slate-400 uppercase tracking-wider">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-sm font-semibold text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#e5eeff] dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-900 rounded-xl px-3 py-2 border border-transparent focus:border-[#061449] focus:outline-none min-w-[200px]"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - Section {c.section}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Batch Marking Buttons */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e5eeff] dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll('Present')}
            disabled={students.length === 0}
          >
            All Present
          </Button>
          <Button
            variant="dangerOutline"
            size="sm"
            onClick={() => markAll('Absent')}
            disabled={students.length === 0}
          >
            All Absent
          </Button>
        </div>
      </div>

      {/* Class Attendance Metric Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[#e5eeff] dark:border-slate-800 shadow-sm">
        <div className="p-3 bg-[#eff4ff] dark:bg-slate-800 rounded-xl border border-[#d3e4fe] dark:border-slate-700">
          <span className="text-[10px] font-bold text-[#767680] dark:text-slate-400 uppercase tracking-wider">
            Total Enrolled
          </span>
          <div className="text-xl font-extrabold text-[#0b1c30] dark:text-white mt-0.5">
            {totalCount} Students
          </div>
        </div>

        <div className="p-3 bg-[#86f2e4]/20 dark:bg-teal-950/40 rounded-xl border border-[#006a61]/20 dark:border-teal-800/40">
          <span className="text-[10px] font-bold text-[#006a61] dark:text-[#86f2e4] uppercase tracking-wider">
            Marked Present
          </span>
          <div className="text-xl font-extrabold text-[#006a61] dark:text-[#86f2e4] mt-0.5">
            {presentCount}
          </div>
        </div>

        <div className="p-3 bg-[#ffdad6]/50 dark:bg-red-950/40 rounded-xl border border-[#ba1a1a]/20 dark:border-red-800/40">
          <span className="text-[10px] font-bold text-[#ba1a1a] dark:text-red-400 uppercase tracking-wider">
            Marked Absent
          </span>
          <div className="text-xl font-extrabold text-[#ba1a1a] dark:text-red-400 mt-0.5">
            {absentCount}
          </div>
        </div>

        <div className="p-3 bg-[#eff4ff] dark:bg-slate-800 rounded-xl border border-[#d3e4fe] dark:border-slate-700">
          <span className="text-[10px] font-bold text-[#767680] dark:text-slate-400 uppercase tracking-wider">
            Attendance Rate
          </span>
          <div className="text-xl font-extrabold text-[#061449] dark:text-blue-400 mt-0.5">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Student Attendance List / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e5eeff] dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-[#767680] dark:text-slate-400">
            Fetching student roll for {selectedClass?.name || 'Classroom'}...
          </div>
        ) : students.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#767680] dark:text-slate-400">
            No students enrolled in this classroom.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#eff4ff]/60 dark:bg-slate-800/80 border-b border-[#e5eeff] dark:border-slate-800 text-[#767680] dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3 px-4 sm:px-6">Roll #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Registration ID</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Quick Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5eeff] dark:divide-slate-800">
                {students.map((student) => {
                  const isPresent = student.status === 'Present';

                  return (
                    <tr
                      key={student.studentId}
                      className="hover:bg-[#f8f9ff] dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-[#0b1c30] dark:text-white">
                        {student.rollNo || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#eff4ff] dark:bg-slate-800 text-[#061449] dark:text-[#86f2e4] font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                            {student.avatar ? (
                              <img
                                src={student.avatar}
                                alt={student.firstName}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>
                                {student.firstName?.[0]}
                                {student.lastName?.[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-[#0b1c30] dark:text-white block">
                              {student.firstName} {student.lastName}
                            </span>
                            <span className="text-[11px] text-[#767680] dark:text-slate-400 sm:hidden">
                              {student.studentId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 hidden sm:table-cell font-mono text-[#061449] dark:text-blue-300 font-semibold">
                        {student.studentId}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge
                          status={student.status}
                          variant={isPresent ? 'success' : 'danger'}
                        />
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Present Toggle */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, 'Present')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                              isPresent
                                ? 'bg-[#006a61] text-white shadow-sm'
                                : 'bg-[#eff4ff] dark:bg-slate-800 text-[#45464f] dark:text-slate-300 hover:bg-[#dce9ff]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              check_circle
                            </span>
                            <span>Present</span>
                          </button>

                          {/* Absent Toggle */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, 'Absent')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                              !isPresent
                                ? 'bg-[#ba1a1a] text-white shadow-sm'
                                : 'bg-[#eff4ff] dark:bg-slate-800 text-[#45464f] dark:text-slate-300 hover:bg-[#ffdad6]/60'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              cancel
                            </span>
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating or Bottom Save Bar */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-[#e5eeff] dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-[#45464f] dark:text-slate-400">
          <span className="material-symbols-outlined text-[18px] text-[#006a61]">
            verified_user
          </span>
          <span>Attendance logs are timestamped and linked to institutional audit records.</span>
        </div>
        <Button
          variant="primary"
          size="md"
          icon="check"
          onClick={handleSaveAttendance}
          loading={saving}
          disabled={students.length === 0}
        >
          Submit Attendance
        </Button>
      </div>

      {/* QR Attendance Station Modal */}
      <QRAttendanceModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        students={students}
        classInfo={selectedClass}
        onMarkPresent={(studentId) => handleStatusChange(studentId, 'Present')}
      />
    </div>
  );
};

export default Attendance;
