import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { paymentService } from '../../services/paymentService';
import { PageHeader, StatusBadge } from '../../components/common/StatusBadge';
import { Button, Input, Select } from '../../components/common/Button';
import { Modal } from '../../components/modals/ConfirmationModal';
import { OnlinePaymentModal } from '../../components/modals/OnlinePaymentModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const FeeCollection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [onlineGatewayOpen, setOnlineGatewayOpen] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('UPI');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('Term 2 Institutional Tuition Fee');

  // Receipt Modal State
  const [receiptModal, setReceiptModal] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);

  // Load all active students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const list = await studentService.getStudents();
        const active = list.filter((s) => s.status === 'Active');
        setStudents(active);

        const paramId = searchParams.get('studentId');
        if (paramId && active.some((s) => s.id === paramId)) {
          setSelectedStudentId(paramId);
        } else if (active.length > 0) {
          setSelectedStudentId(active[0].id);
        }
      } catch {
        showToast('Error loading students', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [searchParams, showToast]);

  // Update selected student details
  useEffect(() => {
    if (!selectedStudentId) {
      setStudent(null);
      return;
    }
    const found = students.find((s) => s.id === selectedStudentId);
    setStudent(found || null);

    // Default amount to either pending dues or empty
    if (found) {
      const pending = Math.max(0, (Number(found.totalFee) || 0) - (Number(found.paidFee) || 0));
      setAmount(pending > 0 ? String(pending) : '');
    }
  }, [selectedStudentId, students]);

  const totalFee = Number(student?.totalFee) || 0;
  const paidFee = Number(student?.paidFee) || 0;
  const pendingFee = Math.max(0, totalFee - paidFee);

  const numAmount = Number(amount);
  const isExceeding = numAmount > pendingFee;
  const isInvalid = !amount || numAmount <= 0 || isExceeding;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudentId) {
      showToast('Please select a student', 'error');
      return;
    }

    if (numAmount <= 0) {
      showToast('Payment amount must be greater than zero', 'error');
      return;
    }

    if (isExceeding) {
      showToast(`Payment amount cannot exceed pending fee of ₹${pendingFee.toLocaleString('en-IN')}`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payment = await paymentService.createPayment({
        studentId: student.id,
        amount: numAmount,
        mode,
        paymentDate,
        referenceNo: referenceNo || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        remarks,
      });

      // Update local student's paid fee
      setStudent((prev) => ({
        ...prev,
        paidFee: (Number(prev.paidFee) || 0) + numAmount,
      }));
      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id ? { ...s, paidFee: (Number(s.paidFee) || 0) + numAmount } : s
        )
      );

      setLastReceipt(payment);
      setReceiptModal(true);
      showToast(`Receipt #${payment.receiptNo} generated successfully!`, 'success');
      setAmount('');
      setReferenceNo('');
    } catch (err) {
      showToast(typeof err === 'string' ? err : err.message || 'Payment collection failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Fee Collection Counter"
        subtitle="Record student fee payments, enforce non-exceeding balance rules, and issue official receipts"
        icon="payments"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Fees', href: '/fees' },
          { label: 'Fee Collection' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/fees/pending">
              <Button variant="outline" size="sm" icon="pending_actions">
                Pending Dues
              </Button>
            </Link>
            <Link to="/payments">
              <Button variant="outline" size="sm" icon="receipt_long">
                Payment History
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Collection Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-sm space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#45464f] uppercase tracking-wider">
                Select Student for Fee Collection <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full text-sm font-semibold text-[#0b1c30] bg-[#eff4ff] focus:bg-white rounded-xl px-3.5 py-3 border border-transparent focus:border-[#061449] focus:outline-none"
              >
                {students.map((s) => {
                  const pend = Math.max(0, (Number(s.totalFee) || 0) - (Number(s.paidFee) || 0));
                  return (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.className}) — Pending: ₹{pend.toLocaleString('en-IN')}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Payment Fields */}
            <div className="space-y-4 pt-2 border-t border-[#e5eeff]">
              <div>
                <Input
                  label="Payment Amount (₹)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount to pay"
                  icon="currency_rupee"
                  error={
                    isExceeding
                      ? `Amount cannot exceed pending balance of ${formatCurrency(pendingFee)}`
                      : ''
                  }
                  required
                />
                {student && (
                  <div className="flex items-center justify-between text-xs text-[#767680] mt-1.5 px-1">
                    <span>Pending balance: <strong className="text-[#ba1a1a]">{formatCurrency(pendingFee)}</strong></span>
                    {pendingFee > 0 && (
                      <button
                        type="button"
                        onClick={() => setAmount(String(pendingFee))}
                        className="text-[#061449] font-bold hover:underline cursor-pointer"
                      >
                        Pay Full Dues
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Payment Mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  options={[
                    { value: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
                    { value: 'Cash', label: 'Cash at Counter' },
                    { value: 'Bank Transfer', label: 'Bank Transfer / NEFT' },
                    { value: 'Cheque', label: 'Cheque' },
                  ]}
                  required
                />

                <Input
                  label="Payment Date"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Transaction / Reference Number"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. UPI-93821092 or Cheque #492810"
                helperText="For digital transactions or bank audit trail"
              />

              <Input
                label="Remarks / Fee Head"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Term 2 Tuition Fee"
              />

              <div className="flex flex-col sm:flex-row items-center gap-2 mt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1 w-full"
                  loading={submitting}
                  disabled={isInvalid || pendingFee === 0}
                  icon="receipt"
                >
                  {pendingFee === 0
                    ? 'Annual Fees Fully Cleared'
                    : `Collect ${amount ? formatCurrency(numAmount) : 'Fee'} & Issue Receipt`}
                </Button>

                {pendingFee > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    icon="credit_card"
                    onClick={() => setOnlineGatewayOpen(true)}
                    className="border-[#006a61] text-[#006a61] hover:bg-[#86f2e4]/20 shrink-0"
                  >
                    Online Portal (UPI/Card)
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Student Ledger & Dues Card */}
        <div className="space-y-6">
          {student ? (
            <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#e5eeff]">
                <div className="w-12 h-12 rounded-xl bg-[#eff4ff] text-[#061449] font-bold flex items-center justify-center text-lg overflow-hidden shrink-0 border border-[#d3e4fe]">
                  {student.avatar ? (
                    <img
                      src={student.avatar}
                      alt={student.firstName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{student.firstName[0]}{student.lastName[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0b1c30] font-headline">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-xs text-[#767680]">
                    {student.className}-{student.section} • Roll #{student.rollNo || '—'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#767680]">Student ID</span>
                  <span className="font-mono font-bold text-[#061449]">{student.studentId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#767680]">Parent Name</span>
                  <span className="font-semibold text-[#0b1c30]">{student.parentName || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#767680]">Parent Phone</span>
                  <span className="font-semibold text-[#0b1c30]">{student.parentPhone || '—'}</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#eff4ff] rounded-xl space-y-2 text-xs border border-[#d3e4fe]">
                <div className="flex justify-between">
                  <span className="text-[#767680]">Total Assigned Fee:</span>
                  <span className="font-bold text-[#0b1c30]">{formatCurrency(totalFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#767680]">Paid to Date:</span>
                  <span className="font-bold text-[#006a61]">{formatCurrency(paidFee)}</span>
                </div>
                <div className="pt-2 border-t border-[#d3e4fe] flex justify-between items-center">
                  <span className="font-bold text-[#0b1c30]">Outstanding Balance:</span>
                  <span className={`text-base font-extrabold ${pendingFee > 0 ? 'text-[#ba1a1a]' : 'text-[#006a61]'}`}>
                    {formatCurrency(pendingFee)}
                  </span>
                </div>
              </div>

              <Link
                to={`/students/${student.id}`}
                className="block text-center text-xs font-semibold text-[#061449] hover:underline"
              >
                View Full Student Profile &rarr;
              </Link>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] text-center text-xs text-[#767680]">
              Select a student to view fee balance details.
            </div>
          )}
        </div>
      </div>

      {/* Official Receipt Modal */}
      {lastReceipt && (
        <Modal
          isOpen={receiptModal}
          onClose={() => setReceiptModal(false)}
          title="Payment Receipt Issued"
          subtitle="Official institutional acknowledgment"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 print:p-0">
            {/* School Crest Receipt Header */}
            <div className="text-center pb-3 border-b border-[#e5eeff]">
              <div className="w-10 h-10 rounded-xl bg-[#061449] text-white flex items-center justify-center mx-auto mb-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <h4 className="text-base font-bold text-[#0b1c30] font-headline">
                Greenwood Academy
              </h4>
              <p className="text-[11px] text-[#767680]">
                Institutional Fee Collection Voucher
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#767680]">Receipt Number:</span>
                <span className="font-mono font-bold text-[#061449]">#{lastReceipt.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#767680]">Date & Time:</span>
                <span className="font-medium text-[#0b1c30]">{formatDate(lastReceipt.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#767680]">Student:</span>
                <span className="font-bold text-[#0b1c30]">{lastReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#767680]">Class:</span>
                <span className="font-medium text-[#0b1c30]">{lastReceipt.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#767680]">Payment Mode:</span>
                <span className="font-bold text-[#006a61]">{lastReceipt.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#767680]">Reference ID:</span>
                <span className="font-mono text-[#45464f]">{lastReceipt.referenceNo}</span>
              </div>
            </div>

            <div className="p-3 bg-[#eff4ff] rounded-xl flex items-center justify-between border border-[#d3e4fe]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#061449]">
                Amount Paid
              </span>
              <span className="text-lg font-extrabold text-[#061449]">
                {formatCurrency(lastReceipt.amount)}
              </span>
            </div>

            <div className="text-[10px] text-center text-[#767680] leading-normal pt-2 border-t border-[#e5eeff]">
              Computer-generated receipt authorized by SchoolERP. Valid for institutional audit & tax deductions.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 print:hidden">
              <Button variant="outline" size="sm" icon="print" onClick={handlePrintReceipt}>
                Print Receipt
              </Button>
              <Button variant="primary" size="sm" onClick={() => setReceiptModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Online Gateway Simulation Modal */}
      <OnlinePaymentModal
        isOpen={onlineGatewayOpen}
        student={student}
        pendingAmount={pendingFee}
        onClose={() => setOnlineGatewayOpen(false)}
        onSuccess={async (payment) => {
          setOnlineGatewayOpen(false);
          setLastReceipt(payment);
          setReceiptModal(true);
          // Refresh student data
          const updated = await studentService.getStudentById(selectedStudentId);
          setStudent(updated);
        }}
      />
    </div>
  );
};

export default FeeCollection;
