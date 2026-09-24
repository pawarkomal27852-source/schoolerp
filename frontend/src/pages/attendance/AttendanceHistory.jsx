import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { attendanceService } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { PageHeader, StatusBadge, SearchBar, Pagination } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { DataTable } from '../../components/tables/DataTable';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const AttendanceHistory = () => {
  const { showToast } = useToast();

  const [records, setRecords] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const [history, classList] = await Promise.all([
          attendanceService.getAttendanceHistory(),
          classService.getClasses(),
        ]);
        setRecords(history);
        setClasses(classList);
      } catch {
        showToast('Error loading attendance logs', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [showToast]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === '' ||
        r.studentName.toLowerCase().includes(q) ||
        (r.studentId && r.studentId.toLowerCase().includes(q));

      const matchesClass =
        classFilter === 'all' || r.classId === classFilter || r.className?.startsWith(classFilter);

      const matchesStatus =
        statusFilter === 'all' || r.status === statusFilter;

      const matchesDate = !dateFilter || r.date === dateFilter;

      return matchesSearch && matchesClass && matchesStatus && matchesDate;
    });
  }, [records, search, classFilter, statusFilter, dateFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page]);

  const columns = [
    {
      header: 'Date',
      render: (r) => (
        <span className="font-semibold text-xs text-[#0b1c30]">
          {formatDate(r.date)}
        </span>
      ),
    },
    {
      header: 'Student Name',
      render: (r) => (
        <span className="font-bold text-sm text-[#0b1c30]">{r.studentName}</span>
      ),
    },
    {
      header: 'Class',
      render: (r) => (
        <span className="text-xs font-semibold bg-[#eff4ff] text-[#061449] px-2 py-0.5 rounded">
          {r.className}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance Historical Log"
        subtitle="Review past classroom attendance rolls, absentee trends, and student participation records"
        icon="history"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'History' },
        ]}
        actions={
          <Link to="/attendance">
            <Button variant="primary" icon="edit_calendar">
              Mark Today's Roll
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          onClear={() => setSearch('')}
          placeholder="Search student name or ID..."
          className="flex-1"
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs font-medium bg-[#eff4ff] text-[#0b1c30] rounded-xl px-3 py-2 border border-transparent focus:border-[#061449]"
          />

          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs font-medium bg-[#eff4ff] text-[#0b1c30] rounded-xl px-3 py-2 border border-transparent focus:border-[#061449]"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}-{c.section}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs font-medium bg-[#eff4ff] text-[#0b1c30] rounded-xl px-3 py-2 border border-transparent focus:border-[#061449]"
          >
            <option value="all">All Status</option>
            <option value="Present">Present Only</option>
            <option value="Absent">Absent Only</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <DataTable
        columns={columns}
        data={paginated}
        loading={loading}
        emptyMessage="No historical attendance records found."
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalItems={filteredRecords.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AttendanceHistory;
