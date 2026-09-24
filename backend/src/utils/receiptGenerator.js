/**
 * Generates a unique receipt number: RCP-YYYY-NNNNNN
 * e.g., RCP-2026-000001
 */
export async function generateReceiptNumber() {
  const { default: Payment } = await import('../models/Payment.js');

  const year   = new Date().getFullYear();
  const prefix = `RCP-${year}-`;

  const last = await Payment.findOne(
    { receiptNumber: { $regex: `^${prefix}` } },
    { receiptNumber: 1 },
    { sort: { receiptNumber: -1 } }
  ).lean();

  let nextNum = 1;
  if (last) {
    const parts = last.receiptNumber.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num)) nextNum = num + 1;
  }

  return `${prefix}${String(nextNum).padStart(6, '0')}`;
}
