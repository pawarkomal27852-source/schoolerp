import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { PageHeader, KpiCard, LoadingState } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('fees');
  const [loading, setLoading] = useState(true);

  const [studentReport, setStudentReport] = useState(null);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [feeReport, setFeeReport] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState('2024-10-24');

  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        setLoading(true);
        const [stu, att, fees] = await Promise.all([
          reportService.getStudentReport(),
          reportService.getAttendanceReport({ date: attendanceDate }),
          reportService.getFeeReport(),
        ]);
        setStudentReport(stu);
        setAttendanceReport(att);
        setFeeReport(fees);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllReports();
  }, [attendanceDate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingState message="Compiling institutional audit summaries..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Analytics & Reports"
        subtitle="Comprehensive summaries covering enrollment distribution, daily attendance, and financial ledgers"
        icon="analytics"
        actions={
          <Button variant="outline" size="sm" icon="print" onClick={handlePrint}>
            Export / Print Report
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-[#e5eeff] gap-2 overflow-x-auto print:hidden">
        <button
          onClick={() => setActiveTab('fees')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'fees'
              ? 'border-[#061449] text-[#061449]'
              : 'border-transparent text-[#767680] hover:text-[#0b1c30]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">payments</span>
          <span>Fee Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'border-[#061449] text-[#061449]'
              : 'border-transparent text-[#767680] hover:text-[#0b1c30]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">event_available</span>
          <span>Attendance Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'students'
              ? 'border-[#061449] text-[#061449]'
              : 'border-transparent text-[#767680] hover:text-[#0b1c30]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">school</span>
          <span>Student Summary</span>
        </button>
      </div>

      {/* TAB 1: FEE SUMMARY */}
      {activeTab === 'fees' && feeReport && (
        <div className="space-y-6 animate-in fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Assigned Fees"
              value={formatCurrency(feeReport.totalExpected)}
              subtext="Annual Target"
              icon="account_balance"
              iconBg="bg-[#eff4ff]"
              iconColor="text-[#061449]"
            />
            <KpiCard
              title="Total Collected"
              value={formatCurrency(feeReport.totalCollected)}
              subtext={`${feeReport.collectionRate}% Recovered`}
              progressPercent={Number(feeReport.collectionRate)}
              icon="verified"
              iconBg="bg-[#86f2e4]/30"
              iconColor="text-[#006a61]"
            />
            <KpiCard
              title="Total Pending Dues"
              value={formatCurrency(feeReport.totalPending)}
              badgeText="Overdue"
              badgeType="negative"
              subtext="Current Outstanding"
              icon="warning"
              iconBg="bg-[#ffdad6]"
              iconColor="text-[#ba1a1a]"
            />
            <KpiCard
              title="Collection Ratio"
              value={`${feeReport.collectionRate}%`}
              subtext="Institutional Recovery"
              icon="pie_chart"
              iconBg="bg-[#eff4ff]"
              iconColor="text-[#061449]"
            />
          </div>

          {/* Class-wise fee breakdown table */}
          <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#061449] font-headline border-b border-[#e5eeff] pb-2">
              Class-by-Class Fee Recovery Analysis
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[#767680] border-b border-[#e5eeff] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Class & Section</th>
                    <th className="py-2.5 px-3 text-center">Students</th>
                    <th className="py-2.5 px-3 text-right">Expected (₹)</th>
                    <th className="py-2.5 px-3 text-right">Collected (₹)</th>
                    <th className="py-2.5 px-3 text-right">Pending Dues (₹)</th>
                    <th className="py-2.5 px-3 text-right">Recovery %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5eeff]">
                  {feeReport.classSummary?.map((cls, idx) => (
                    <tr key={idx} className="hover:bg-[#f8f9ff]">
                      <td className="py-3 px-3 font-bold text-[#0b1c30]">{cls.className}</td>
                      <td className="py-3 px-3 text-center text-[#45464f]">{cls.students}</td>
                      <td className="py-3 px-3 text-right text-[#767680]">{formatCurrency(cls.expected)}</td>
                      <td className="py-3 px-3 text-right font-semibold text-[#006a61]">
                        {formatCurrency(cls.collected)}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-[#ba1a1a]">
                        {formatCurrency(cls.pending)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#0b1c30]">
                        <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#061449]">
                          {cls.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE SUMMARY */}
      {activeTab === 'attendance' && attendanceReport && (
        <div className="space-y-6 animate-in fade-in">
          {/* Controls */}
          <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[#767680] uppercase tracking-wider">
                Select Audit Date:
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="text-xs font-semibold bg-[#eff4ff] rounded-xl px-3 py-1.5 border border-transparent focus:border-[#061449]"
              />
            </div>
            <span className="text-xs font-bold text-[#006a61]">
              Average Attendance: {attendanceReport.attendanceRate}%
            </span>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Records Logged"
              value={attendanceReport.total}
              subtext={`For ${formatDate(attendanceReport.date)}`}
              icon="groups"
              iconBg="bg-[#eff4ff]"
              iconColor="text-[#061449]"
            />
            <KpiCard
              title="Students Present"
              value={attendanceReport.present}
              subtext="In classroom"
              icon="how_to_reg"
              iconBg="bg-[#86f2e4]/30"
              iconColor="text-[#006a61]"
            />
            <KpiCard
              title="Students Absent"
              value={attendanceReport.absent}
              badgeText={`${attendanceReport.absent} Absentees`}
              badgeType="negative"
              subtext="Unexcused / On Leave"
              icon="person_cancel"
              iconBg="bg-[#ffdad6]"
              iconColor="text-[#ba1a1a]"
            />
            <KpiCard
              title="Overall Percentage"
              value={`${attendanceReport.attendanceRate}%`}
              subtext="Campus Attendance"
              icon="percent"
              iconBg="bg-[#eff4ff]"
              iconColor="text-[#061449]"
            />
          </div>

          {/* Class Breakdown Table */}
          <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#061449] font-headline border-b border-[#e5eeff] pb-2">
              Class-wise Attendance Ratio for {formatDate(attendanceReport.date)}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[#767680] border-b border-[#e5eeff] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3 text-center">Present</th>
                    <th className="py-2.5 px-3 text-center">Absent</th>
                    <th className="py-2.5 px-3 text-center">Total Roll</th>
                    <th className="py-2.5 px-3 text-right">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5eeff]">
                  {attendanceReport.classBreakdown?.map((cls, idx) => (
                    <tr key={idx} className="hover:bg-[#f8f9ff]">
                      <td className="py-3 px-3 font-bold text-[#0b1c30]">{cls.className}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#006a61]">{cls.present}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#ba1a1a]">{cls.absent}</td>
                      <td className="py-3 px-3 text-center text-[#45464f]">{cls.total}</td>
                      <td className="py-3 px-3 text-right font-extrabold text-[#061449]">
                        {cls.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STUDENT SUMMARY */}
      {activeTab === 'students' && studentReport && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Registered Students"
              value={studentReport.totalStudents}
              subtext="Enrolled across all classes"
              icon="school"
              iconBg="bg-[#eff4ff]"
              iconColor="text-[#061449]"
            />
            <KpiCard
              title="Active Students"
              value={studentReport.activeStudents}
              subtext="Currently attending"
              icon="check_circle"
              iconBg="bg-[#86f2e4]/30"
              iconColor="text-[#006a61]"
            />
            <KpiCard
              title="Inactive / Transferred"
              value={studentReport.inactiveStudents}
              subtext="Deactivated records"
              icon="person_off"
              iconBg="bg-[#ffdad6]"
              iconColor="text-[#ba1a1a]"
            />
            <KpiCard
              title="Class Sections"
              value={studentReport.classesCount}
              subtext="Academic Grade units"
              icon="co_present"
              iconBg="bg-[#eff4ff]"
              iconColor="text-[#061449]"
            />
          </div>

          <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#061449] font-headline border-b border-[#e5eeff] pb-2">
              Class Enrollment & Demographic Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[#767680] border-b border-[#e5eeff] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Class Teacher</th>
                    <th className="py-2.5 px-3 text-center">Boys</th>
                    <th className="py-2.5 px-3 text-center">Girls</th>
                    <th className="py-2.5 px-3 text-center">Enrolled</th>
                    <th className="py-2.5 px-3 text-center">Capacity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5eeff]">
                  {studentReport.byClass?.map((c, idx) => (
                    <tr key={idx} className="hover:bg-[#f8f9ff]">
                      <td className="py-3 px-3 font-bold text-[#0b1c30]">{c.className}</td>
                      <td className="py-3 px-3 text-[#45464f]">{c.teacher}</td>
                      <td className="py-3 px-3 text-center text-[#061449] font-medium">{c.male}</td>
                      <td className="py-3 px-3 text-center text-[#061449] font-medium">{c.female}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#0b1c30]">{c.total}</td>
                      <td className="py-3 px-3 text-center text-[#767680]">{c.capacity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
