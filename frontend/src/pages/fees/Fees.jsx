import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { paymentService } from '../../services/paymentService';
import { PageHeader, KpiCard, StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const Fees = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [pendingData, setPendingData] = useState({ students: [], totalAmount: 0, totalCount: 0 });
  const [payments, setPayments] = useState([]);
  const [structures, setStructures] = useState([]);

  useEffect(() => {
    const loadFeesData = async () => {
      try {
        setLoading(true);
        const [pending, paymentList, feeStructures] = await Promise.all([
          feeService.getPendingFees(),
          paymentService.getPayments(),
          feeService.getFeeStructures(),
        ]);
        setPendingData(pending);
        setPayments(paymentList);
        setStructures(feeStructures);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFeesData();
  }, []);

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = pendingData.totalAmount;
  const totalExpected = totalCollected + totalPending;
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management & Accounts"
        subtitle="Single-window console for fee structures, receipt generation, dues collection, and ledger audits"
        icon="payments"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/fees/structure">
              <Button variant="outline" size="sm" icon="tune">
                Fee Structure
              </Button>
            </Link>
            <Link to="/fees/pending">
              <Button variant="dangerOutline" size="sm" icon="warning">
                Pending Dues ({pendingData.totalCount})
              </Button>
            </Link>
            <Link to="/fees/collect">
              <Button variant="primary" size="sm" icon="add">
                Collect Fee
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Total Expected Fees"
          value={formatCurrency(totalExpected)}
          subtext="Annual Academic Year Target"
          icon="account_balance"
          iconBg="bg-[#eff4ff]"
          iconColor="text-[#061449]"
        />

        <KpiCard
          title="Total Collected"
          value={formatCurrency(totalCollected)}
          subtext={`${collectionRate}% Cleared`}
          progressPercent={collectionRate}
          icon="check_circle"
          iconBg="bg-[#86f2e4]/30"
          iconColor="text-[#006a61]"
          onClick={() => navigate('/payments')}
        />

        <KpiCard
          title="Pending Dues"
          value={formatCurrency(totalPending)}
          badgeText={`${pendingData.totalCount} Defaulters`}
          badgeType="negative"
          subtext="Due for Term 2"
          icon="warning"
          iconBg="bg-[#ffdad6]"
          iconColor="text-[#ba1a1a]"
          onClick={() => navigate('/fees/pending')}
        />

        <KpiCard
          title="Active Structures"
          value={structures.length}
          subtext="Configured Classes"
          icon="rule"
          iconBg="bg-[#eff4ff]"
          iconColor="text-[#061449]"
          onClick={() => navigate('/fees/structure')}
        />
      </div>

      {/* Fast Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#061449] to-[#1e2a5e] text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#86f2e4] text-xs font-bold uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
              <span>Express Counter</span>
            </div>
            <h3 className="text-xl font-bold font-headline mb-1">
              Collect Fees & Issue Instant Receipt
            </h3>
            <p className="text-xs text-white/80 leading-relaxed max-w-md">
              Receive cash, UPI, bank transfers, or cheques with real-time balance calculations and automated PDF-ready receipts.
            </p>
          </div>
          <div className="pt-4 mt-2">
            <Link to="/fees/collect">
              <Button variant="accent" size="md" icon="payments">
                Open Collection Counter
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-[#ffdad6]/40 border border-[#ffdad6] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#ba1a1a] text-xs font-bold uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[18px]">notification_important</span>
              <span>Defaulters Alert</span>
            </div>
            <h3 className="text-xl font-bold text-[#0b1c30] font-headline mb-1">
              {pendingData.totalCount} Students Have Overdue Balances
            </h3>
            <p className="text-xs text-[#45464f] leading-relaxed max-w-md">
              A total of {formatCurrency(totalPending)} is outstanding across primary and secondary wings for Term 2.
            </p>
          </div>
          <div className="pt-4 mt-2">
            <Link to="/fees/pending">
              <Button variant="danger" size="md" icon="mail">
                Review Pending Dues List
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Pending Table and Recent Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Table */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#061449] font-headline">
              Outstanding Dues Roster
            </h3>
            <Link to="/fees/pending" className="text-xs font-bold text-[#061449] hover:underline">
              View All ({pendingData.totalCount})
            </Link>
          </div>

          <div className="divide-y divide-[#e5eeff]">
            {pendingData.students.slice(0, 5).map((item) => (
              <div key={item.studentId} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <Link
                    to={`/students/${item.studentId}`}
                    className="text-sm font-bold text-[#0b1c30] hover:text-[#061449] hover:underline block"
                  >
                    {item.studentName}
                  </Link>
                  <div className="text-xs text-[#767680] mt-0.5">
                    {item.className} • Parent: {item.parentName}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#ba1a1a] block">
                      {formatCurrency(item.pendingFee)}
                    </span>
                    <span className="text-[10px] text-[#767680]">Dues</span>
                  </div>
                  <Link to={`/fees/collect?studentId=${item.studentId}`}>
                    <Button variant="primary" size="sm">
                      Collect
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#061449] font-headline">
              Recent Transactions
            </h3>
            <Link to="/payments" className="text-xs font-bold text-[#061449] hover:underline">
              Full Ledger ({payments.length})
            </Link>
          </div>

          <div className="divide-y divide-[#e5eeff]">
            {payments.slice(0, 5).map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-bold text-[#0b1c30] block">
                    {p.studentName}
                  </span>
                  <div className="text-xs text-[#767680] mt-0.5">
                    #{p.receiptNo} • {p.mode} • {formatDate(p.date)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-[#006a61] block">
                    {formatCurrency(p.amount)}
                  </span>
                  <span className="text-[10px] font-semibold text-[#006a61]">Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fees;
