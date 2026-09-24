import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { PageHeader, SearchBar, Pagination, StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { DataTable } from '../../components/tables/DataTable';
import { Modal } from '../../components/modals/ConfirmationModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCsv, exportTableToPrint } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';

export const Payments = () => {
  const { showToast } = useToast();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getPayments();
      setPayments(data);
    } catch {
      showToast('Error loading payment transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === '' ||
        p.studentName.toLowerCase().includes(q) ||
        p.receiptNo.toLowerCase().includes(q) ||
        (p.referenceNo && p.referenceNo.toLowerCase().includes(q));

      const matchesMode =
        modeFilter === 'all' || p.mode.toLowerCase() === modeFilter.toLowerCase();

      const matchesDate = !dateFilter || p.date.startsWith(dateFilter);

      return matchesSearch && matchesMode && matchesDate;
    });
  }, [payments, search, modeFilter, dateFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, page]);

  const totalFilteredAmount = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      header: 'Receipt #',
      accessor: 'receiptNo',
      render: (p) => (
        <span className="font-mono text-xs font-bold text-[#061449] bg-[#eff4ff] px-2 py-0.5 rounded">
          #{p.receiptNo}
        </span>
      ),
    },
    {
      header: 'Student Name',
      render: (p) => (
        <div>
          <Link
            to={`/students/${p.studentId}`}
            className="font-bold text-[#0b1c30] hover:text-[#061449] hover:underline block"
          >
            {p.studentName}
          </Link>
          <span className="text-[11px] text-[#767680]">{p.className}</span>
        </div>
      ),
    },
    {
      header: 'Date',
      render: (p) => (
        <span className="text-xs text-[#45464f]">{formatDate(p.date)}</span>
      ),
    },
    {
      header: 'Payment Mode',
      render: (p) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#86f2e4]/30 text-[#006f66] px-2 py-0.5 rounded-md">
          <span>{p.mode}</span>
        </span>
      ),
    },
    {
      header: 'Amount Paid',
      align: 'right',
      render: (p) => (
        <span className="text-sm font-extrabold text-[#0b1c30]">
          {formatCurrency(p.amount)}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      header: 'Receipt',
      align: 'right',
      render: (p) => (
        <button
          onClick={() => setSelectedReceipt(p)}
          className="p-1.5 text-[#061449] hover:bg-[#eff4ff] rounded-lg transition-colors cursor-pointer"
          title="View & Print Official Receipt"
        >
          <span className="material-symbols-outlined text-[18px]">receipt</span>
        </button>
      ),
    },
  ];

  const handleExportCsv = () => {
    const headers = ['Receipt No', 'Date', 'Student Name', 'Amount (INR)', 'Payment Mode', 'Reference No', 'Remarks'];
    const rows = filteredPayments.map((p) => [
      p.receiptNo,
      p.date,
      p.studentName,
      p.amount,
      p.mode,
      p.referenceNo || '—',
      p.remarks || '—',
    ]);
    exportToCsv('Payment_Ledger_Transactions', headers, rows);
    showToast('Payment ledger exported to CSV', 'success');
  };

  const handleExportPrint = () => {
    const columns = ['Receipt #', 'Date', 'Student', 'Amount', 'Mode', 'Ref No'];
    const rows = filteredPayments.map((p) => [
      p.receiptNo,
      formatDate(p.date),
      p.studentName,
      formatCurrency(p.amount),
      p.mode,
      p.referenceNo || '—',
    ]);
    exportTableToPrint('Fee Payment Ledger', columns, rows);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Payment Ledger"
        subtitle="Complete record of all verified fee transactions, receipts, and electronic collections"
        icon="receipt_long"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Fees', href: '/fees' },
          { label: 'Payments' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon="download" onClick={handleExportCsv}>
              Export CSV
            </Button>
            <Button variant="outline" size="sm" icon="print" onClick={handleExportPrint}>
              Print Ledger
            </Button>
            <Link to="/fees/collect">
              <Button variant="primary" size="sm" icon="add">
                Collect New Fee
              </Button>
            </Link>
          </div>
        }
      />

      {/* Summary Micro Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          onClear={() => setSearch('')}
          placeholder="Search by receipt #, student name, or transaction ref..."
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
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs font-medium bg-[#eff4ff] text-[#0b1c30] rounded-xl px-3 py-2 border border-transparent focus:border-[#061449]"
          >
            <option value="all">All Modes</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="bank transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </select>

          <div className="px-3 py-1.5 bg-[#eff4ff] rounded-xl border border-[#d3e4fe] text-xs font-bold text-[#061449]">
            Total: {formatCurrency(totalFilteredAmount)}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <DataTable
        columns={columns}
        data={paginated}
        loading={loading}
        emptyMessage="No fee payments match current criteria."
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalItems={filteredPayments.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Receipt View Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Payment Voucher"
          subtitle="Official Institutional Acknowledgment"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 print:p-0">
            <div className="text-center pb-3 border-b border-[#e5eeff]">
              <div className="w-10 h-10 rounded-xl bg-[#061449] text-white flex items-center justify-center mx-auto mb-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <h4 className="text-base font-bold text-[#0b1c30] font-headline">
                Greenwood Academy
              </h4>
              <p className="text-[11px] text-[#767680]">
                Institutional Fee Voucher • Central Ledger Copy
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#767680]">Receipt Number:</span>
                <span className="font-mono font-bold text-[#061449]">#{selectedReceipt.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#767680]">Date & Time:</span>
                <span className="font-medium text-[#0b1c30]">{formatDate(selectedReceipt.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#767680]">Student Name:</span>
                <span className="font-bold text-[#0b1c30]">{selectedReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#767680]">Class:</span>
                <span className="font-medium text-[#0b1c30]">{selectedReceipt.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#767680]">Payment Mode:</span>
                <span className="font-bold text-[#006a61]">{selectedReceipt.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#767680]">Reference ID:</span>
                <span className="font-mono text-[#45464f]">{selectedReceipt.referenceNo}</span>
              </div>
              {selectedReceipt.remarks && (
                <div className="flex justify-between">
                  <span className="text-[#767680]">Remarks:</span>
                  <span className="text-[#45464f]">{selectedReceipt.remarks}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#eff4ff] rounded-xl flex items-center justify-between border border-[#d3e4fe]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#061449]">
                Amount Settled
              </span>
              <span className="text-lg font-extrabold text-[#061449]">
                {formatCurrency(selectedReceipt.amount)}
              </span>
            </div>

            <div className="text-[10px] text-center text-[#767680] leading-normal pt-2 border-t border-[#e5eeff]">
              Computer-generated receipt authorized by SchoolERP. Valid for institutional audit & tax deductions.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 print:hidden">
              <Button variant="outline" size="sm" icon="print" onClick={handlePrint}>
                Print Receipt
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedReceipt(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Payments;
