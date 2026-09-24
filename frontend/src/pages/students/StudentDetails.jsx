import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { paymentService } from '../../services/paymentService';
import { PageHeader, StatusBadge, LoadingState } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { StudentIdCardModal } from '../../components/modals/StudentIdCardModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deactivateModal, setDeactivateModal] = useState(false);
  const [idCardOpen, setIdCardOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const studentData = await studentService.getStudentById(id);
        const paymentsData = await paymentService.getPayments({ studentId: id });
        setStudent(studentData);
        setPayments(paymentsData);
      } catch (err) {
        showToast('Student not found', 'error');
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate, showToast]);

  const handleDeactivate = async () => {
    setActionLoading(true);
    try {
      await studentService.deactivateStudent(student.id);
      showToast('Student record deactivated.', 'success');
      setDeactivateModal(false);
      const updated = await studentService.getStudentById(id);
      setStudent(updated);
    } catch {
      showToast('Failed to deactivate student', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      await studentService.activateStudent(student.id);
      showToast('Student reinstated as Active.', 'success');
      const updated = await studentService.getStudentById(id);
      setStudent(updated);
    } catch {
      showToast('Failed to activate student', 'error');
    }
  };

  if (loading || !student) {
    return <LoadingState message="Loading student profile..." />;
  }

  const totalFee = Number(student.totalFee) || 0;
  const paidFee = Number(student.paidFee) || 0;
  const pendingFee = Math.max(0, totalFee - paidFee);
  const paidPercent = totalFee > 0 ? Math.round((paidFee / totalFee) * 100) : 100;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        subtitle={`Student Registration ID: ${student.studentId} • Roll #${student.rollNo || '—'}`}
        icon="account_circle"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students', href: '/students' },
          { label: `${student.firstName} ${student.lastName}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon="badge"
              onClick={() => setIdCardOpen(true)}
            >
              Generate ID Card
            </Button>
            <Link to={`/students/${student.id}/edit`}>
              <Button variant="outline" size="sm" icon="edit">
                Edit Record
              </Button>
            </Link>
            {student.status === 'Active' ? (
              <Button
                variant="dangerOutline"
                size="sm"
                icon="person_off"
                onClick={() => setDeactivateModal(true)}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                variant="accent"
                size="sm"
                icon="person_check"
                onClick={handleActivate}
              >
                Reinstate
              </Button>
            )}
            {pendingFee > 0 && (
              <Link to={`/fees/collect?studentId=${student.id}`}>
                <Button variant="primary" size="sm" icon="payments">
                  Collect Dues
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Top Banner Profile Card */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#eff4ff] text-[#061449] font-bold flex items-center justify-center text-xl overflow-hidden shrink-0 border-2 border-[#d3e4fe] shadow-inner">
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
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] font-headline">
                {student.firstName} {student.lastName}
              </h2>
              <StatusBadge status={student.status} />
            </div>
            <p className="text-xs sm:text-sm text-[#45464f] mt-0.5 font-medium">
              Class {student.className} {student.section ? `• Section ${student.section}` : ''} • Enrolled on {formatDate(student.admissionDate || '2024-06-15')}
            </p>
          </div>
        </div>

        {/* Quick KPI pills */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="bg-[#eff4ff] px-4 py-2.5 rounded-xl border border-[#d3e4fe] min-w-[120px]">
            <span className="text-[10px] uppercase font-bold text-[#767680] tracking-wider block">
              Attendance
            </span>
            <span className="text-base font-extrabold text-[#006a61]">
              {student.attendanceRate || 95}%
            </span>
          </div>

          <div className="bg-[#eff4ff] px-4 py-2.5 rounded-xl border border-[#d3e4fe] min-w-[120px]">
            <span className="text-[10px] uppercase font-bold text-[#767680] tracking-wider block">
              Pending Balance
            </span>
            <span className={`text-base font-extrabold ${pendingFee > 0 ? 'text-[#ba1a1a]' : 'text-[#006a61]'}`}>
              {formatCurrency(pendingFee)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Details & Fee Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal & Parent Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#061449] border-b border-[#e5eeff] pb-2 font-headline">
              Academic & Bio Profile
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#767680] block">Gender</span>
                <span className="font-semibold text-[#0b1c30] text-sm">{student.gender || 'Male'}</span>
              </div>
              <div>
                <span className="text-[#767680] block">Date of Birth</span>
                <span className="font-semibold text-[#0b1c30] text-sm">{formatDate(student.dob)}</span>
              </div>
              <div>
                <span className="text-[#767680] block">Roll Number</span>
                <span className="font-semibold text-[#0b1c30] text-sm">{student.rollNo || '—'}</span>
              </div>
              <div>
                <span className="text-[#767680] block">Class Section</span>
                <span className="font-semibold text-[#0b1c30] text-sm">{student.className}-{student.section}</span>
              </div>
              <div>
                <span className="text-[#767680] block">Academic Year</span>
                <span className="font-semibold text-[#0b1c30] text-sm">2024–2025</span>
              </div>
              <div>
                <span className="text-[#767680] block">Registration ID</span>
                <span className="font-semibold font-mono text-[#061449] text-sm">{student.studentId}</span>
              </div>
            </div>
          </div>

          {/* Parent & Guardian Info */}
          <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5eeff] pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#061449] font-headline">
                Parent / Guardian Record
              </h3>
              {student.parentId && (
                <Link
                  to={`/parents?search=${encodeURIComponent(student.parentName || '')}`}
                  className="text-xs text-[#061449] font-semibold hover:underline"
                >
                  View Parent Directory
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#767680] block">Parent Name</span>
                <span className="font-semibold text-[#0b1c30] text-sm">{student.parentName || '—'}</span>
              </div>
              <div>
                <span className="text-[#767680] block">Primary Phone</span>
                <span className="font-semibold text-[#0b1c30] text-sm">{student.parentPhone || '—'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[#767680] block">Residential Address</span>
                <span className="font-semibold text-[#0b1c30] text-sm leading-relaxed block mt-0.5">
                  {student.address || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Receipts Ledger */}
          <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#e5eeff] pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#061449] font-headline">
                Payment History ({payments.length})
              </h3>
              {pendingFee > 0 && (
                <Link
                  to={`/fees/collect?studentId=${student.id}`}
                  className="text-xs font-bold text-[#061449] hover:underline"
                >
                  + Add Payment
                </Link>
              )}
            </div>

            {payments.length === 0 ? (
              <p className="text-xs text-[#767680] py-4 text-center">
                No fee collections logged for this student yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[#767680] border-b border-[#e5eeff]">
                      <th className="py-2">Receipt #</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Mode</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5eeff]">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 font-mono font-bold text-[#061449]">{p.receiptNo}</td>
                        <td className="py-2.5 text-[#45464f]">{formatDate(p.date)}</td>
                        <td className="py-2.5">
                          <span className="px-1.5 py-0.5 bg-[#eff4ff] text-[#061449] rounded font-semibold text-[10px]">
                            {p.mode}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-bold text-[#0b1c30]">
                          {formatCurrency(p.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Fee Ledger Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#061449] border-b border-[#e5eeff] pb-2 font-headline">
              Fee Ledger Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#767680]">Total Assigned Fee</span>
                <span className="font-bold text-[#0b1c30] text-sm">{formatCurrency(totalFee)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#767680]">Total Fee Cleared</span>
                <span className="font-bold text-[#006a61] text-sm">{formatCurrency(paidFee)}</span>
              </div>
              <div className="pt-2 border-t border-[#e5eeff] flex justify-between items-center">
                <span className="font-bold text-[#0b1c30]">Balance Remaining</span>
                <span className={`font-extrabold text-base ${pendingFee > 0 ? 'text-[#ba1a1a]' : 'text-[#006a61]'}`}>
                  {formatCurrency(pendingFee)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-[#767680]">
                <span>Payment Settlement</span>
                <span className="font-bold text-[#0b1c30]">{paidPercent}%</span>
              </div>
              <div className="w-full bg-[#eff4ff] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#006a61] h-full rounded-full transition-all duration-500"
                  style={{ width: `${paidPercent}%` }}
                ></div>
              </div>
            </div>

            {pendingFee > 0 ? (
              <div className="pt-2">
                <Link to={`/fees/collect?studentId=${student.id}`} className="block">
                  <Button variant="primary" size="md" className="w-full" icon="payments">
                    Collect Fee (₹{pendingFee.toLocaleString('en-IN')})
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-3 bg-[#86f2e4]/30 rounded-xl text-center text-xs font-bold text-[#006f66] flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Annual Fees Fully Cleared</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deactivateModal}
        onClose={() => setDeactivateModal(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Student"
        message={`Are you sure you want to deactivate ${student.firstName} ${student.lastName}? They will be marked Inactive and omitted from active classroom roll calls.`}
        confirmText="Deactivate"
        isDanger={true}
        loading={actionLoading}
      />

      {/* Official Student ID Card Modal */}
      <StudentIdCardModal
        isOpen={idCardOpen}
        student={student}
        onClose={() => setIdCardOpen(false)}
      />
    </div>
  );
};

export default StudentDetails;
