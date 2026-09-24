import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { classService } from '../../services/classService';
import { PageHeader, SearchBar, Pagination } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { DataTable } from '../../components/tables/DataTable';
import { OnlinePaymentModal } from '../../components/modals/OnlinePaymentModal';
import { formatCurrency } from '../../utils/formatters';
import { exportToCsv, exportTableToPrint } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';

export const PendingFees = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState({ students: [], totalAmount: 0, totalCount: 0 });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [reminding, setReminding] = useState(false);
  const [onlinePayStudent, setOnlinePayStudent] = useState(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const [pending, classList] = await Promise.all([
        feeService.getPendingFees(),
        classService.getClasses(),
      ]);
      setData(pending);
      setClasses(classList);
    } catch {
      showToast('Error loading pending dues', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [showToast]);

  const handleSendReminders = () => {
    setReminding(true);
    setTimeout(() => {
      setReminding(false);
      showToast(`Automated SMS fee reminders sent to all ${data.totalCount} parent contacts!`, 'success');
    }, 800);
  };

  const filteredStudents = useMemo(() => {
    return data.students.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === '' ||
        s.studentName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        (s.parentName && s.parentName.toLowerCase().includes(q)) ||
        (s.parentPhone && s.parentPhone.includes(q));

      const matchesClass =
        classFilter === 'all' || s.classId === classFilter;

      return matchesSearch && matchesClass;
    });
  }, [data.students, search, classFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, page, pageSize]);

  // Export handlers
  const handleExportCsv = () => {
    const headers = ['Student ID', 'Student Name', 'Class', 'Parent Name', 'Parent Phone', 'Pending Dues (INR)', 'Overdue Days'];
    const rows = filteredStudents.map((s) => [
      s.studentCode,
      s.studentName,
      s.className,
      s.parentName || '—',
      s.parentPhone || '—',
      s.pendingFee,
      s.overdueDays || 14,
    ]);
    exportToCsv('Defaulters_Fee_List', headers, rows);
    showToast('Fee defaulters roster exported to CSV', 'success');
  };

  const handleExportPrint = () => {
    const columns = ['Student ID', 'Student Name', 'Class', 'Parent Contact', 'Outstanding Dues'];
    const rows = filteredStudents.map((s) => [
      s.studentCode,
      s.studentName,
      s.className,
      `${s.parentName || '—'} (${s.parentPhone || '—'})`,
      formatCurrency(s.pendingFee),
    ]);
    exportTableToPrint('Notice of Outstanding School Dues', columns, rows);
  };

  const columns = [
    {
      header: 'Student',
      render: (s) => (
        <div>
          <div className="font-bold text-[#0b1c30] dark:text-white">
            {s.studentName}
          </div>
          <span className="font-mono text-[11px] text-[#767680] dark:text-slate-400">
            {s.studentCode}
          </span>
        </div>
      ),
    },
    {
      header: 'Class',
      render: (s) => (
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#eff4ff] dark:bg-slate-800 text-[#061449] dark:text-blue-300 font-semibold text-xs border border-[#d3e4fe] dark:border-slate-700">
          {s.className}
        </span>
      ),
    },
    {
      header: 'Parent Contact',
      render: (s) => (
        <div>
          <span className="font-medium text-[#0b1c30] dark:text-slate-200 block text-xs">
            {s.parentName || '—'}
          </span>
          <span className="text-[11px] text-[#767680] dark:text-slate-400 font-mono">
            {s.parentPhone || '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Pending Balance',
      render: (s) => (
        <span className="font-extrabold text-[#ba1a1a] dark:text-red-400 text-sm">
          {formatCurrency(s.pendingFee)}
        </span>
      ),
    },
    {
      header: 'Action',
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() =>
              setOnlinePayStudent({
                id: s.studentId,
                firstName: s.studentName,
                lastName: '',
                studentId: s.studentCode,
                totalFee: s.pendingFee,
                paidFee: 0,
                parentName: s.parentName,
              })
            }
            className="p-1.5 text-[#006a61] dark:text-[#86f2e4] hover:bg-[#86f2e4]/30 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Pay Online"
          >
            <span className="material-symbols-outlined text-[18px]">credit_card</span>
          </button>
          <Link to={`/fees/collect?studentId=${s.studentId}`}>
            <Button variant="primary" size="sm" icon="payments">
              Collect
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Fees & Defaulters"
        subtitle="List of students with outstanding fee balances for the current academic session"
        icon="pending_actions"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Fees', href: '/fees' },
          { label: 'Pending Dues' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" icon="download" onClick={handleExportCsv}>
              Export CSV
            </Button>
            <Button variant="outline" size="sm" icon="print" onClick={handleExportPrint}>
              Print Notice
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon="sms"
              onClick={handleSendReminders}
              loading={reminding}
            >
              Send Reminders
            </Button>
            <Link to="/fees/collect">
              <Button variant="primary" size="sm" icon="add">
                Collect Fee
              </Button>
            </Link>
          </div>
        }
      />

      {/* Overview Stat Banner */}
      <div className="bg-[#ffdad6]/40 dark:bg-red-950/20 border border-[#ffdad6] dark:border-red-900/40 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ba1a1a] text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
          <div>
            <span className="text-xs font-bold text-[#ba1a1a] dark:text-red-300 uppercase tracking-wider">
              Total Outstanding Balance
            </span>
            <div className="text-2xl font-extrabold text-[#93000a] dark:text-red-400 font-headline">
              {formatCurrency(data.totalAmount)}
            </div>
            <p className="text-xs text-[#45464f] dark:text-slate-400 mt-0.5">
              Accumulated across {data.totalCount} enrolled students
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/fees/structure">
            <Button variant="outline" size="sm" icon="tune">
              Review Fee Structure
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[#e5eeff] dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          onClear={() => setSearch('')}
          placeholder="Search by student, ID, or parent..."
          className="w-full sm:max-w-md"
        />

        <div className="w-full sm:w-48">
          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs font-medium bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white border border-transparent focus:border-[#061449] rounded-xl px-3 py-2"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}-{c.section}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={paginated}
        loading={loading}
        emptyMessage="No pending fee balances found. All students are in good financial standing!"
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalItems={filteredStudents.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Online Gateway Simulation */}
      <OnlinePaymentModal
        isOpen={!!onlinePayStudent}
        student={onlinePayStudent}
        pendingAmount={onlinePayStudent?.totalFee}
        onClose={() => setOnlinePayStudent(null)}
        onSuccess={() => {
          setOnlinePayStudent(null);
          fetchPending();
        }}
      />
    </div>
  );
};

export default PendingFees;
