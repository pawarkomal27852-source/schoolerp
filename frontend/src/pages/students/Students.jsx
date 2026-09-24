import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { PageHeader, SearchBar, StatusBadge, Pagination } from '../../components/common/StatusBadge';
import { Button, Select } from '../../components/common/Button';
import { DataTable } from '../../components/tables/DataTable';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { StudentIdCardModal } from '../../components/modals/StudentIdCardModal';
import { exportToCsv, exportTableToPrint } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';

export const Students = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Deactivation confirmation modal state
  const [deactivatingStudent, setDeactivatingStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  // Student ID card modal state
  const [idCardStudent, setIdCardStudent] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const [studentsData, classesData] = await Promise.all([
        studentService.getStudents(),
        classService.getClasses(),
      ]);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (err) {
      showToast('Error loading students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDeactivate = async () => {
    if (!deactivatingStudent) return;
    setActionLoading(true);
    try {
      await studentService.deactivateStudent(deactivatingStudent.id);
      showToast(`${deactivatingStudent.firstName} ${deactivatingStudent.lastName} has been deactivated.`, 'success');
      setDeactivatingStudent(null);
      fetchStudents();
    } catch (err) {
      showToast('Failed to deactivate student', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (student) => {
    try {
      await studentService.activateStudent(student.id);
      showToast(`${student.firstName} is now active.`, 'success');
      fetchStudents();
    } catch {
      showToast('Failed to activate student', 'error');
    }
  };

  // Filtered & paginated students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        search === '' ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.toLowerCase().includes(search.toLowerCase()) ||
        (s.parentName && s.parentName.toLowerCase().includes(search.toLowerCase())) ||
        (s.parentPhone && s.parentPhone.includes(search));

      const matchesClass =
        classFilter === 'all' || s.classId === classFilter;

      const matchesStatus =
        statusFilter === 'all' || s.status === statusFilter;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, search, classFilter, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, page]);

  const columns = [
    {
      header: 'Student',
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#eff4ff] text-[#061449] font-bold flex items-center justify-center text-xs overflow-hidden shrink-0 border border-[#d3e4fe]">
            {s.avatar ? (
              <img
                src={s.avatar}
                alt={`${s.firstName} ${s.lastName}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{s.firstName[0]}{s.lastName[0]}</span>
            )}
          </div>
          <div>
            <Link
              to={`/students/${s.id}`}
              className="font-bold text-[#0b1c30] hover:text-[#061449] hover:underline block leading-snug"
            >
              {s.firstName} {s.lastName}
            </Link>
            <span className="text-xs text-[#767680]">Roll #{s.rollNo || '—'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Student ID',
      accessor: 'studentId',
      render: (s) => (
        <span className="font-mono text-xs font-semibold text-[#061449] bg-[#eff4ff] px-2 py-0.5 rounded-md">
          {s.studentId}
        </span>
      ),
    },
    {
      header: 'Class',
      render: (s) => (
        <span className="font-medium text-xs text-[#0b1c30]">
          {s.className} {s.section ? `(${s.section})` : ''}
        </span>
      ),
    },
    {
      header: 'Parent / Guardian',
      render: (s) => (
        <div>
          <div className="text-xs font-semibold text-[#0b1c30]">{s.parentName || '—'}</div>
          <div className="text-[11px] text-[#767680]">{s.parentPhone || '—'}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setIdCardStudent(s)}
            className="p-1.5 text-[#767680] hover:text-[#061449] dark:hover:text-[#86f2e4] hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Generate Student ID Card"
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
          </button>
          <Link
            to={`/students/${s.id}`}
            className="p-1.5 text-[#767680] hover:text-[#061449] dark:hover:text-blue-400 hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="View Student Profile"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </Link>
          <Link
            to={`/students/${s.id}/edit`}
            className="p-1.5 text-[#767680] hover:text-[#061449] dark:hover:text-blue-400 hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit Student"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </Link>
          {s.status === 'Active' ? (
            <button
              onClick={() => setDeactivatingStudent(s)}
              className="p-1.5 text-[#767680] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors cursor-pointer"
              title="Deactivate Student"
            >
              <span className="material-symbols-outlined text-[18px]">person_off</span>
            </button>
          ) : (
            <button
              onClick={() => handleActivate(s)}
              className="p-1.5 text-[#767680] hover:text-[#006a61] hover:bg-[#86f2e4]/30 rounded-lg transition-colors cursor-pointer"
              title="Re-activate Student"
            >
              <span className="material-symbols-outlined text-[18px]">person_check</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleExportCsv = () => {
    const headers = ['Student ID', 'First Name', 'Last Name', 'Class', 'Roll No', 'Gender', 'Parent Name', 'Parent Phone', 'Status'];
    const rows = filteredStudents.map((s) => [
      s.studentId,
      s.firstName,
      s.lastName,
      s.className,
      s.rollNo || '—',
      s.gender,
      s.parentName || '—',
      s.parentPhone || '—',
      s.status,
    ]);
    exportToCsv('SchoolERP_Student_Directory', headers, rows);
    showToast('Student directory exported to CSV', 'success');
  };

  const handleExportPrint = () => {
    const columns = ['Student ID', 'Student Name', 'Class', 'Roll', 'Parent Contact', 'Status'];
    const rows = filteredStudents.map((s) => [
      s.studentId,
      `${s.firstName} ${s.lastName}`,
      s.className,
      s.rollNo || '—',
      `${s.parentName || '—'} (${s.parentPhone || '—'})`,
      s.status,
    ]);
    exportTableToPrint('Student Directory Roster', columns, rows);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Student Directory"
        subtitle="Manage student enrollments, academic details, and institutional records"
        icon="school"
        badge={`${filteredStudents.length} Students`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon="download" onClick={handleExportCsv}>
              Export CSV
            </Button>
            <Button variant="outline" size="sm" icon="print" onClick={handleExportPrint}>
              Print Roster
            </Button>
            <Link to="/students/new">
              <Button variant="primary" size="sm" icon="person_add">
                Add Student
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3 justify-between">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          onClear={() => setSearch('')}
          placeholder="Search by student name, ID, parent, or phone..."
          className="flex-1"
        />

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="w-40">
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs font-medium bg-[#eff4ff] text-[#0b1c30] border border-transparent focus:border-[#061449] rounded-xl px-3 py-2"
            >
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.section ? `(${c.section})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="w-36">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs font-medium bg-[#eff4ff] text-[#0b1c30] border border-transparent focus:border-[#061449] rounded-xl px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Records Table */}
      <DataTable
        columns={columns}
        data={paginatedData}
        loading={loading}
        emptyMessage="No students found matching current filters. Click 'Add Student' to enroll a student."
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalItems={filteredStudents.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Deactivation Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deactivatingStudent}
        onClose={() => setDeactivatingStudent(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Student Record"
        message={`Are you sure you want to deactivate ${deactivatingStudent?.firstName} ${deactivatingStudent?.lastName} (${deactivatingStudent?.studentId})? Inactive students will be excluded from attendance sheets and new fee billings.`}
        confirmText="Deactivate"
        isDanger={true}
        loading={actionLoading}
      />

      {/* Official Student ID Card Modal */}
      <StudentIdCardModal
        isOpen={!!idCardStudent}
        student={idCardStudent}
        onClose={() => setIdCardStudent(null)}
      />
    </div>
  );
};

export default Students;
