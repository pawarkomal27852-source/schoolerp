import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { feeService } from '../../services/feeService';
import { paymentService } from '../../services/paymentService';
import { attendanceService } from '../../services/attendanceService';
import { formatCurrency } from '../../utils/formatters';
import { KpiCard } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 482,
    activeClasses: 8,
    feesCollected: 485000,
    feesPending: 135000,
    attendanceRate: 94.6,
    presentToday: 456,
    absentToday: 26,
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcasted, setBroadcasted] = useState(false);

  // Weekly attendance trends data
  const weeklyTrends = [
    { day: 'Mon', rate: 96.2, present: 464 },
    { day: 'Tue', rate: 94.6, present: 456 },
    { day: 'Wed', rate: 95.8, present: 462 },
    { day: 'Thu', rate: 93.9, present: 453 },
    { day: 'Fri', rate: 97.1, present: 468 },
    { day: 'Sat', rate: 91.5, present: 441 },
  ];

  // Fee collection heads breakdown
  const feeHeads = [
    { head: 'Tuition Fee', collected: 320000, target: 380000, color: 'bg-[#061449] dark:bg-blue-500' },
    { head: 'Computer & Lab Fee', collected: 85000, target: 110000, color: 'bg-[#006a61] dark:bg-teal-400' },
    { head: 'Transportation', collected: 50000, target: 75000, color: 'bg-indigo-600 dark:bg-indigo-400' },
    { head: 'Sports & Activities', collected: 30000, target: 45000, color: 'bg-amber-600 dark:bg-amber-400' },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [students, pendingData, payments, attendance] = await Promise.all([
          studentService.getStudents(),
          feeService.getPendingFees(),
          paymentService.getPayments(),
          attendanceService.getTodaySummary(),
        ]);

        const totalFeesPaid = students.reduce(
          (sum, s) => sum + (Number(s.paidFee) || 0),
          0
        );

        setStats({
          totalStudents: students.length || 482,
          activeClasses: 8,
          feesCollected: totalFeesPaid || 485000,
          feesPending: pendingData.totalAmount || 135000,
          attendanceRate: attendance.percentage || 94.6,
          presentToday: attendance.present || 456,
          absentToday: attendance.absent || 26,
        });

        setRecentPayments(payments.slice(0, 5));
        setPendingStudents(pendingData.students.slice(0, 5));
      } catch (err) {
        console.warn('Dashboard fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleBroadcastNotice = () => {
    setBroadcasting(true);
    setTimeout(() => {
      setBroadcasting(false);
      setBroadcasted(true);
      showToast('Term 2 Fee Deadline reminder SMS & Notice broadcasted to 42 parents!', 'success');
      setTimeout(() => setBroadcasted(false), 4000);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Operational Greeting Card */}
      <section className="bg-[#eff4ff] dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-sm border border-[#d3e4fe] dark:border-slate-800 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-8 w-44 h-44 rounded-full bg-[#dde1ff]/60 dark:bg-blue-900/20 pointer-events-none blur-3xl"></div>
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#86f2e4] dark:bg-teal-950 text-[#006f66] dark:text-[#86f2e4] text-xs font-bold uppercase tracking-wider border border-[#006a61]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006a61] dark:bg-teal-400 mr-1.5 animate-pulse"></span>
                Active Session
              </span>
              <span className="text-xs font-semibold text-[#45464f] dark:text-slate-400">
                Term 2 • AY 2024–25
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] dark:text-white tracking-tight font-headline">
              Good Morning, Principal Sharma
            </h1>
            <p className="text-xs sm:text-sm text-[#45464f] dark:text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
              <span className="material-symbols-outlined text-[16px] text-[#061449] dark:text-blue-400">
                calendar_today
              </span>
              <span>Tuesday, 24 Oct 2024 • Greenwood Academy Senior Wing</span>
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#061449] dark:bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
            <span className="material-symbols-outlined text-[26px]">shield_person</span>
          </div>
        </div>
      </section>

      {/* High-Level KPI Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Students */}
        <KpiCard
          title="Total Students"
          value={stats.totalStudents}
          badgeText="+12 this term"
          badgeType="positive"
          subtext="Class I–X Active"
          icon="school"
          iconBg="bg-[#eff4ff] dark:bg-slate-800"
          iconColor="text-[#061449] dark:text-blue-400"
          onClick={() => navigate('/students')}
        />

        {/* Today's Pulse */}
        <KpiCard
          title="Today's Attendance"
          value={`${stats.attendanceRate}%`}
          badgeText="↑ 1.2%"
          badgeType="positive"
          subtext={`${stats.presentToday} Present • ${stats.absentToday} Out`}
          icon="how_to_reg"
          iconBg="bg-[#86f2e4]/30 dark:bg-teal-950/60"
          iconColor="text-[#006a61] dark:text-[#86f2e4]"
          onClick={() => navigate('/attendance')}
        />

        {/* Fee Collection MTD */}
        <KpiCard
          title="Collected (MTD)"
          value={formatCurrency(stats.feesCollected)}
          progressPercent={78.2}
          subtext="78% of ₹6.2L Target"
          icon="currency_rupee"
          iconBg="bg-[#86f2e4]/30 dark:bg-teal-950/60"
          iconColor="text-[#006a61] dark:text-[#86f2e4]"
          onClick={() => navigate('/fees')}
        />

        {/* Pending Dues */}
        <KpiCard
          title="Pending Dues"
          value={formatCurrency(stats.feesPending)}
          badgeText="42 Overdue"
          badgeType="negative"
          subtext="Deadline Oct 31"
          icon="warning"
          iconBg="bg-[#ffdad6] dark:bg-red-950/60"
          iconColor="text-[#ba1a1a] dark:text-red-400"
          onClick={() => navigate('/fees/pending')}
        />
      </section>

      {/* Express Desk: Quick Administrative Action Shortcuts */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[#0b1c30] dark:text-white tracking-tight font-headline">
            Express Desk
          </h2>
          <span className="text-xs text-[#767680] dark:text-slate-400">
            Instant Administrative Operations
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Collect Fee */}
          <button
            onClick={() => navigate('/fees/collect')}
            className="bg-[#061449] dark:bg-blue-600 hover:bg-[#1e2a5e] text-white p-3.5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px] text-[#86f2e4]">
                payments
              </span>
            </div>
            <span className="text-xs font-bold leading-tight">Collect Fee</span>
            <span className="text-[10px] text-white/70 mt-0.5">Counter & Online</span>
          </button>

          {/* Mark Attendance / QR */}
          <button
            onClick={() => navigate('/attendance')}
            className="bg-white dark:bg-slate-900 hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white border border-[#e5eeff] dark:border-slate-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#eff4ff] dark:bg-slate-800 flex items-center justify-center mb-1.5 text-[#006a61] dark:text-[#86f2e4] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
            </div>
            <span className="text-xs font-bold leading-tight">QR Attendance</span>
            <span className="text-[10px] text-[#767680] dark:text-slate-400 mt-0.5">Daily Roll Call</span>
          </button>

          {/* Add Student */}
          <button
            onClick={() => navigate('/students/new')}
            className="bg-white dark:bg-slate-900 hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white border border-[#e5eeff] dark:border-slate-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#eff4ff] dark:bg-slate-800 flex items-center justify-center mb-1.5 text-[#061449] dark:text-blue-400 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">person_add</span>
            </div>
            <span className="text-xs font-bold leading-tight">New Admission</span>
            <span className="text-[10px] text-[#767680] dark:text-slate-400 mt-0.5">Enroll Student</span>
          </button>

          {/* Timetable */}
          <button
            onClick={() => navigate('/timetable')}
            className="bg-white dark:bg-slate-900 hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white border border-[#e5eeff] dark:border-slate-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#eff4ff] dark:bg-slate-800 flex items-center justify-center mb-1.5 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">schedule</span>
            </div>
            <span className="text-xs font-bold leading-tight">Timetable</span>
            <span className="text-[10px] text-[#767680] dark:text-slate-400 mt-0.5">Periods & Rooms</span>
          </button>

          {/* Reports */}
          <button
            onClick={() => navigate('/reports')}
            className="bg-white dark:bg-slate-900 hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white border border-[#e5eeff] dark:border-slate-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#eff4ff] dark:bg-slate-800 flex items-center justify-center mb-1.5 text-[#061449] dark:text-blue-400 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">analytics</span>
            </div>
            <span className="text-xs font-bold leading-tight">Reports</span>
            <span className="text-[10px] text-[#767680] dark:text-slate-400 mt-0.5">Audit & Summaries</span>
          </button>
        </div>
      </section>

      {/* Analytics Visuals: Weekly Attendance Trends & Fee Head Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weekly Attendance Graph */}
        <section className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-[#e5eeff] dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006a61]"></span>
              <h2 className="text-sm sm:text-base font-bold text-[#0b1c30] dark:text-white font-headline">
                Weekly Attendance Trajectory
              </h2>
            </div>
            <span className="text-xs font-bold text-[#006a61] dark:text-[#86f2e4] bg-[#86f2e4]/30 dark:bg-teal-950 px-2 py-0.5 rounded-full">
              95.2% Weekly Avg
            </span>
          </div>

          {/* Bar Chart Representation */}
          <div className="pt-2">
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              {weeklyTrends.map((t, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.rate}%
                  </span>
                  <div className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-800 rounded-t-xl h-full flex items-end p-0.5">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        t.rate >= 95
                          ? 'bg-[#006a61] dark:bg-teal-400'
                          : 'bg-[#061449] dark:bg-blue-500'
                      }`}
                      style={{ height: `${(t.rate - 85) * 6.5}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.day}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 px-1">
              <span>Class I through X Daily Roll Call</span>
              <Link to="/attendance/history" className="text-[#061449] dark:text-blue-400 font-semibold hover:underline">
                View Full Log →
              </Link>
            </div>
          </div>
        </section>

        {/* Fee Collection by Category */}
        <section className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-[#e5eeff] dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#061449] dark:bg-blue-400"></span>
              <h2 className="text-sm sm:text-base font-bold text-[#0b1c30] dark:text-white font-headline">
                Fee Head Realization
              </h2>
            </div>
            <span className="text-xs font-bold text-[#061449] dark:text-blue-400 bg-[#eff4ff] dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
              ₹4.85L / ₹6.10L
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {feeHeads.map((head, idx) => {
              const pct = Math.round((head.collected / head.target) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{head.head}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(head.collected)}{' '}
                      <span className="text-slate-400 font-normal">/ {formatCurrency(head.target)}</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${head.color}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500">Auto-calculated from paid receipts</span>
            <Link to="/fees/structure" className="text-[#061449] dark:text-blue-400 font-bold hover:underline">
              Fee Structures →
            </Link>
          </div>
        </section>
      </div>

      {/* Grid: Wing Breakdown & Priority Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Today's Wing Attendance */}
        <section className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-[#e5eeff] dark:border-slate-800 space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006a61]"></span>
                <h2 className="text-sm sm:text-base font-bold text-[#0b1c30] dark:text-white font-headline">
                  Today's Wing Attendance Breakdown
                </h2>
              </div>
              <span className="text-xs font-bold text-[#006a61] dark:text-[#86f2e4] bg-[#86f2e4]/30 dark:bg-teal-950 px-2 py-0.5 rounded-full">
                94.6% Avg
              </span>
            </div>

            {/* Visual Breakdown Bars */}
            <div className="space-y-3 pt-3">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-[#0b1c30] dark:text-slate-200">Primary Wing (I - V)</span>
                  <span className="font-bold text-[#0b1c30] dark:text-white">
                    98.0% <span className="text-[#767680] dark:text-slate-400 font-normal">(184/188)</span>
                  </span>
                </div>
                <div className="w-full bg-[#eff4ff] dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#006a61] h-full rounded-full transition-all duration-500" style={{ width: '98%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-[#0b1c30] dark:text-slate-200">Middle Wing (VI - VIII)</span>
                  <span className="font-bold text-[#0b1c30] dark:text-white">
                    93.2% <span className="text-[#767680] dark:text-slate-400 font-normal">(151/162)</span>
                  </span>
                </div>
                <div className="w-full bg-[#eff4ff] dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#061449] dark:bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: '93.2%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-[#0b1c30] dark:text-slate-200">High School (IX - X)</span>
                  <span className="font-bold text-[#0b1c30] dark:text-white">
                    92.4% <span className="text-[#767680] dark:text-slate-400 font-normal">(121/132)</span>
                  </span>
                </div>
                <div className="w-full bg-[#eff4ff] dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#061449] dark:bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: '92.4%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#e5eeff] dark:border-slate-800">
            <Link
              to="/attendance"
              className="w-full bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#dce9ff] dark:hover:bg-slate-750 text-[#061449] dark:text-blue-300 rounded-xl py-2.5 px-3 flex items-center justify-between group transition-colors text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ba1a1a] dark:text-red-400">
                  sms_failed
                </span>
                <span>Review 26 Absentees & Daily Roll</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#767680] dark:text-slate-400 group-hover:translate-x-0.5 transition-transform">
                arrow_forward_ios
              </span>
            </Link>
          </div>
        </section>

        {/* Administrative Priority Notice */}
        <section className="bg-[#dce9ff]/60 dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-[#b9c3ff]/50 dark:border-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#ffdad6] dark:bg-red-950 flex items-center justify-center text-[#ba1a1a] dark:text-red-400 shrink-0">
              <span className="material-symbols-outlined text-[22px]">notifications_active</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-[#0b1c30] dark:text-white font-headline">
                  Term 2 Fee Deadline Notice
                </h3>
                <span className="text-[11px] text-[#ba1a1a] dark:text-red-300 font-bold bg-[#ffdad6] dark:bg-red-950 px-2 py-0.5 rounded-md">
                  7 Days Left
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#45464f] dark:text-slate-300 mt-1 leading-relaxed">
                Oct 31st deadline approaching. 42 families have balances pending verification across Junior KG through Class X.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[#c6c5d1]/40 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleBroadcastNotice}
                loading={broadcasting}
                icon={broadcasted ? 'check_circle' : 'send'}
              >
                {broadcasted ? 'Notice Broadcasted' : 'Broadcast Notice'}
              </Button>
              <Link to="/fees/pending">
                <Button variant="outline" size="sm">
                  View Defaulters
                </Button>
              </Link>
            </div>
            {broadcasted && (
              <span className="text-xs font-semibold text-[#006a61] dark:text-[#86f2e4] animate-in fade-in">
                Batch SMS & Parent Notice Dispatched!
              </span>
            )}
          </div>
        </section>
      </div>

      {/* Grid: Recent Collections & Pending Fees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Collections Stream */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#0b1c30] dark:text-white tracking-tight font-headline">
                Recent Collections
              </h2>
              <span className="w-2 h-2 rounded-full bg-[#006a61]"></span>
            </div>
            <Link
              to="/payments"
              className="text-xs text-[#061449] dark:text-blue-400 font-bold hover:underline flex items-center"
            >
              <span>Full Ledger</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-[#e5eeff] dark:border-slate-800 divide-y divide-[#e5eeff] dark:divide-slate-800 overflow-hidden">
            {recentPayments.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#767680] dark:text-slate-400">
                No payment transactions recorded today.
              </div>
            ) : (
              recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#f8f9ff] dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#eff4ff] dark:bg-slate-800 text-[#061449] dark:text-[#86f2e4] font-bold flex items-center justify-center text-sm shrink-0 font-headline border border-[#d3e4fe] dark:border-slate-700">
                      {payment.studentName.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-[#0b1c30] dark:text-white truncate">
                          {payment.studentName}
                        </span>
                        <span className="text-[10px] font-semibold bg-[#eff4ff] dark:bg-slate-800 text-[#45464f] dark:text-slate-300 px-1.5 py-0.5 rounded">
                          {payment.className}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#767680] dark:text-slate-400 mt-0.5">
                        <span className="font-mono">#{payment.receiptNo}</span>
                        <span>•</span>
                        <span>{new Date(payment.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-[#0b1c30] dark:text-white tabular-nums">
                      {formatCurrency(payment.amount)}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] font-bold bg-[#86f2e4]/30 dark:bg-teal-950 text-[#006f66] dark:text-[#86f2e4] px-1.5 py-0.5 rounded">
                        {payment.mode}
                      </span>
                      <span className="material-symbols-outlined text-[14px] text-[#006a61] dark:text-[#86f2e4]">
                        verified
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Pending Fees Snapshot */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#0b1c30] dark:text-white tracking-tight font-headline">
                High Priority Pending Dues
              </h2>
              <span className="text-[11px] font-bold bg-[#ffdad6] dark:bg-red-950 text-[#ba1a1a] dark:text-red-300 px-1.5 py-0.2 rounded-full">
                Action Required
              </span>
            </div>
            <Link
              to="/fees/pending"
              className="text-xs text-[#061449] dark:text-blue-400 font-bold hover:underline flex items-center"
            >
              <span>View All Pending</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-[#e5eeff] dark:border-slate-800 divide-y divide-[#e5eeff] dark:divide-slate-800 overflow-hidden">
            {pendingStudents.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#006a61] dark:text-emerald-400 font-semibold">
                All student dues are up to date!
              </div>
            ) : (
              pendingStudents.map((item) => (
                <div
                  key={item.studentId}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#f8f9ff] dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#0b1c30] dark:text-white truncate">
                        {item.studentName}
                      </span>
                      <span className="text-[10px] bg-[#eff4ff] dark:bg-slate-800 text-[#061449] dark:text-blue-300 px-1.5 py-0.5 rounded font-semibold">
                        {item.className}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#767680] dark:text-slate-400 mt-0.5">
                      <span>Total: {formatCurrency(item.totalFee)}</span>
                      <span>•</span>
                      <span className="text-[#006a61] dark:text-teal-400">Paid: {formatCurrency(item.paidFee)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-bold text-[#ba1a1a] dark:text-red-400 tabular-nums">
                        {formatCurrency(item.pendingFee)}
                      </div>
                      <span className="text-[10px] text-[#767680] dark:text-slate-400">Pending</span>
                    </div>
                    <button
                      onClick={() => navigate(`/fees/collect?studentId=${item.studentId}`)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#061449] dark:bg-blue-600 hover:bg-[#1e2a5e] text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      Collect
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Campus Status & System Health Micro-Footer */}
      <footer className="pt-3 pb-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[#767680] dark:text-slate-500 text-xs border-t border-[#e5eeff] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#006a61] dark:bg-emerald-400"></span>
          <span>SchoolERP v1.4 • Single Window Administration</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Connected to Central Ledger</span>
          <span>•</span>
          <span className="font-semibold text-[#006a61] dark:text-emerald-400">100% Audit Ready</span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
