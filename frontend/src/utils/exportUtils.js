/**
 * Utility functions for exporting data to CSV/Excel and triggering formatted print/PDF workflows
 */

export const exportToCsv = (filename, headers, rows) => {
  if (!rows || rows.length === 0) return;

  // Header row
  const headerLine = headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(',');

  // Data rows
  const rowLines = rows.map((row) =>
    row.map((val) => {
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportTableToPrint = (title, columns, data) => {
  const printWindow = window.open('', '_blank', 'width=900,height=650');
  if (!printWindow) {
    window.print();
    return;
  }

  const tableHeaderHtml = columns.map(c => `<th style="padding: 10px 12px; border: 1px solid #cbd5e1; background: #061449; color: white; text-align: left; font-size: 12px;">${c}</th>`).join('');
  
  const tableRowsHtml = data.map((row, idx) => {
    const cells = row.map(val => `<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 12px; ${idx % 2 === 0 ? 'background: #ffffff;' : 'background: #f8fafc;'}">${val ?? '—'}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - Greenwood Academy</title>
        <style>
          body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; margin: 30px; color: #0b1c30; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #061449; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; color: #061449; }
          .meta { font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .footer { margin-top: 30px; text-align: right; font-size: 11px; color: #94a3b8; }
          @media print {
            body { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">GREENWOOD ACADEMY</div>
            <div class="meta">Affiliated to Central Board of Secondary Education (CBSE)</div>
            <div style="font-weight: 600; font-size: 14px; margin-top: 4px; color: #006a61;">${title}</div>
          </div>
          <div style="text-align: right;">
            <div class="meta">Academic Session: 2024–2025</div>
            <div class="meta">Exported: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            <div class="meta">Verified by Institutional Admin</div>
          </div>
        </div>
        <table>
          <thead><tr>${tableHeaderHtml}</tr></thead>
          <tbody>${tableRowsHtml}</tbody>
        </table>
        <div class="footer">
          SchoolERP Generated Document • Page 1 of 1 • Strictly Confidential
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
