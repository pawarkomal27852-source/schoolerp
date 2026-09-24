import React, { useState } from 'react';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';

export const OnlinePaymentModal = ({ student, pendingAmount, isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [method, setMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('***');
  const [cardName, setCardName] = useState(student?.parentName || 'Rajesh Sharma');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  if (!isOpen || !student) return null;

  const payable = pendingAmount || Math.max(0, (Number(student.totalFee) || 0) - (Number(student.paidFee) || 0));

  const handlePay = async () => {
    if (payable <= 0) {
      showToast('No outstanding balance to pay', 'info');
      return;
    }

    setProcessing(true);

    try {
      // Simulate real-time secure gateway handshakes
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const payment = await paymentService.createPayment({
        studentId: student.id,
        amount: payable,
        mode: method === 'upi' ? 'Online UPI' : method === 'card' ? 'Online Card' : 'Net Banking',
        referenceNo: `GATEWAY-${Math.floor(100000 + Math.random() * 900000)}`,
        remarks: `Online Payment via ${method.toUpperCase()} Portal`,
      });

      setReceiptData(payment);
      setCompleted(true);
      showToast(`Payment of ${formatCurrency(payable)} processed successfully!`, 'success');
      if (onSuccess) onSuccess(payment);
    } catch (err) {
      showToast('Payment processing error', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setCompleted(false);
    setReceiptData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        {!completed ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#006a61] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-headline">
                    Secure Fee Gateway
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    256-Bit SSL Encrypted • Greenwood Academy
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Bill Summary */}
            <div className="p-3.5 bg-[#eff4ff] dark:bg-slate-800/80 rounded-2xl border border-[#d3e4fe] dark:border-slate-700">
              <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-300">
                <span>Student: <strong className="text-slate-900 dark:text-white">{student.firstName} {student.lastName}</strong></span>
                <span className="font-mono text-[11px]">{student.studentId}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#d3e4fe]/60 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Payable Amount:</span>
                <span className="text-lg font-extrabold text-[#061449] dark:text-[#86f2e4] tabular-nums">
                  {formatCurrency(payable)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    method === 'upi'
                      ? 'border-[#061449] dark:border-[#86f2e4] bg-[#eff4ff] dark:bg-slate-800 font-bold text-[#061449] dark:text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                  <span className="text-xs">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    method === 'card'
                      ? 'border-[#061449] dark:border-[#86f2e4] bg-[#eff4ff] dark:bg-slate-800 font-bold text-[#061449] dark:text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">credit_card</span>
                  <span className="text-xs">Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('netbanking')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    method === 'netbanking'
                      ? 'border-[#061449] dark:border-[#86f2e4] bg-[#eff4ff] dark:bg-slate-800 font-bold text-[#061449] dark:text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">account_balance</span>
                  <span className="text-xs">Net Banking</span>
                </button>
              </div>
            </div>

            {/* Method Details */}
            {method === 'upi' && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Scan QR via Any UPI App</span>
                </div>
                {/* Simulated UPI QR code */}
                <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-xl border border-slate-300 shadow-sm flex items-center justify-center">
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-1h2v2h-2v-2zm-3 2h2v2h-2v-2zm3 2h3v4h-2v-2h-1v-2zm-5 2h3v2h-3v-2zm2 2h3v2h-3v-2z" />
                  </svg>
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">GPay</span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">PhonePe</span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">Paytm</span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">BHIM</span>
                </div>
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-2.5 text-left">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-xs font-mono font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'netbanking' && (
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Select Bank</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra'].map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => setSelectedBank(b)}
                      className={`p-2 rounded-xl border text-left cursor-pointer ${
                        selectedBank === b
                          ? 'border-[#061449] dark:border-[#86f2e4] bg-[#eff4ff] dark:bg-slate-800 font-bold text-[#061449] dark:text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={handleClose} disabled={processing}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={processing}
                onClick={handlePay}
                icon="verified_user"
              >
                Pay {formatCurrency(payable)}
              </Button>
            </div>
          </>
        ) : (
          /* Payment Completed Screen */
          <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-headline">
                Payment Authorized & Verified!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Transaction ID: {receiptData?.referenceNo || 'GATEWAY-TXN-98421'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">#{receiptData?.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600">{formatCurrency(receiptData?.amount || payable)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-medium text-slate-800 dark:text-white">{receiptData?.mode}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" icon="print" onClick={() => window.print()}>
                Print Receipt
              </Button>
              <Button variant="primary" size="sm" onClick={handleClose}>
                Done & Return
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
