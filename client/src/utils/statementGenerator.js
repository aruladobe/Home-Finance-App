import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, subMonths, subYears, startOfDay, endOfDay, parseISO } from 'date-fns';
import { getCurrentFY, getFYDateRange } from './calculations';

// ─── Date range helpers ───────────────────────────────────────────────────────

export const PRESET_OPTIONS = [
  { value: 'last1m',  label: 'Last 1 Month' },
  { value: 'last3m',  label: 'Last 3 Months' },
  { value: 'last6m',  label: 'Last 6 Months' },
  { value: 'last1y',  label: 'Last 1 Year' },
  { value: 'fy',      label: 'Financial Year' },
  { value: 'custom',  label: 'Custom Range' },
];

export function getDateRange(preset, customFrom, customTo, activeFY) {
  const now = new Date();
  const today = endOfDay(now);

  if (preset === 'last1m') return { from: startOfDay(subMonths(now, 1)), to: today };
  if (preset === 'last3m') return { from: startOfDay(subMonths(now, 3)), to: today };
  if (preset === 'last6m') return { from: startOfDay(subMonths(now, 6)), to: today };
  if (preset === 'last1y') return { from: startOfDay(subYears(now, 1)), to: today };
  if (preset === 'fy') {
    const fy = activeFY || getCurrentFY();
    return getFYDateRange(fy);
  }
  if (preset === 'custom' && customFrom && customTo) {
    return { from: startOfDay(new Date(customFrom)), to: endOfDay(new Date(customTo)) };
  }
  return { from: startOfDay(subMonths(now, 1)), to: today };
}

function filterByRange(items, from, to) {
  return items.filter(item => {
    const d = item.date
      ? (typeof item.date === 'string' ? parseISO(item.date) : new Date(item.date))
      : null;
    return d && d >= from && d <= to;
  });
}

function fmt(n) {
  return `Rs ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function sum(items, key = 'amount') {
  return items.reduce((s, i) => s + Number(i[key] || 0), 0);
}

// ─── CSV ─────────────────────────────────────────────────────────────────────

export function downloadCSV(income, expenses, investments, { from, to }, userName) {
  const rows = [];

  rows.push(['FinanceHome — Financial Statement']);
  rows.push([`Name: ${userName || 'User'}`]);
  rows.push([`Period: ${format(from, 'dd MMM yyyy')} – ${format(to, 'dd MMM yyyy')}`]);
  rows.push([`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`]);
  rows.push([]);

  const incData = filterByRange(income, from, to);
  const expData = filterByRange(expenses, from, to);
  const invData = filterByRange(investments, from, to);

  // Summary
  rows.push(['SUMMARY']);
  rows.push(['Total Income', fmt(sum(incData))]);
  rows.push(['Total Expenses', fmt(sum(expData))]);
  rows.push(['Net Savings', fmt(sum(incData) - sum(expData))]);
  rows.push(['Total Invested', fmt(sum(invData))]);
  rows.push([]);

  // Income
  rows.push(['INCOME']);
  rows.push(['Date', 'Type', 'Description', 'Member', 'Period', 'Amount']);
  incData.forEach(r => rows.push([
    r.date ? format(new Date(r.date), 'dd MMM yyyy') : '',
    r.type || '',
    r.description || '',
    r.familyMemberName || 'Self',
    r.period || '',
    sum([r]),
  ]));
  rows.push(['', '', '', '', 'Total', sum(incData)]);
  rows.push([]);

  // Expenses
  rows.push(['EXPENSES']);
  rows.push(['Date', 'Category', 'Description', 'Member', 'Period', 'Amount']);
  expData.forEach(r => rows.push([
    r.date ? format(new Date(r.date), 'dd MMM yyyy') : '',
    r.category || '',
    r.description || '',
    r.familyMemberName || 'Self',
    r.period || '',
    sum([r]),
  ]));
  rows.push(['', '', '', '', 'Total', sum(expData)]);
  rows.push([]);

  // Investments
  rows.push(['INVESTMENTS']);
  rows.push(['Date', 'Type', 'Description', 'Member', 'Status', 'Amount', 'Expected Returns']);
  invData.forEach(r => rows.push([
    r.date ? format(new Date(r.date), 'dd MMM yyyy') : '',
    r.type || '',
    r.description || '',
    r.familyMemberName || 'Self',
    r.status || '',
    sum([r]),
    r.expectedReturns || 0,
  ]));
  rows.push(['', '', '', '', '', 'Total', sum(invData)]);

  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `statement_${format(from, 'yyyyMMdd')}_${format(to, 'yyyyMMdd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

const DARK   = [10, 15, 35];
const ACCENT = [99, 102, 241];
const GREEN  = [16, 185, 129];
const RED    = [239, 68, 68];
const MID    = [30, 41, 59];
const LIGHT  = [148, 163, 184];
const WHITE  = [255, 255, 255];
const YELLOW = [245, 158, 11];

export function downloadPDF(income, expenses, investments, { from, to }, userName, activeFY) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();

  const incData = filterByRange(income, from, to);
  const expData = filterByRange(expenses, from, to);
  const invData = filterByRange(investments, from, to);

  const totalInc = sum(incData);
  const totalExp = sum(expData);
  const totalInv = sum(invData);
  const netSavings = totalInc - totalExp;

  let y = 0;

  // ── Header band ──
  doc.setFillColor(...DARK);
  doc.rect(0, 0, PW, 42, 'F');

  doc.setFillColor(...ACCENT);
  doc.roundedRect(14, 9, 16, 16, 3, 3, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FH', 22, 19.5, { align: 'center' });

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FinanceHome', 34, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...LIGHT);
  doc.text('Family Finance Manager', 34, 24);

  doc.setTextColor(...WHITE);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Statement', PW - 14, 16, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...LIGHT);
  doc.text(`${format(from, 'dd MMM yyyy')} – ${format(to, 'dd MMM yyyy')}`, PW - 14, 22, { align: 'right' });
  doc.text(`Name: ${userName || 'User'}`, PW - 14, 28, { align: 'right' });
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, PW - 14, 34, { align: 'right' });

  y = 50;

  // ── Summary cards ──
  const cardW = (PW - 28 - 9) / 4;
  const cards = [
    { label: 'Total Income',   value: fmt(totalInc),    color: GREEN },
    { label: 'Total Expenses', value: fmt(totalExp),    color: RED   },
    { label: 'Net Savings',    value: fmt(netSavings),  color: netSavings >= 0 ? GREEN : RED },
    { label: 'Total Invested', value: fmt(totalInv),    color: YELLOW },
  ];
  cards.forEach((c, i) => {
    const x = 14 + i * (cardW + 3);
    doc.setFillColor(...MID);
    doc.roundedRect(x, y, cardW, 22, 2, 2, 'F');
    doc.setFillColor(...c.color);
    doc.rect(x, y, 2.5, 22, 'F');
    doc.setTextColor(...LIGHT);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(c.label, x + 5, y + 8);
    doc.setTextColor(...c.color);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    const lines = doc.splitTextToSize(c.value, cardW - 6);
    doc.text(lines[0], x + 5, y + 16);
  });

  y += 30;

  // ── Table helper ──
  const addTable = (title, color, head, rows, totalRow) => {
    // Section title
    doc.setFillColor(...MID);
    doc.rect(14, y, PW - 28, 8, 'F');
    doc.setFillColor(...color);
    doc.rect(14, y, 3, 8, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, y + 5.5);
    doc.setTextColor(...LIGHT);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${rows.length} entries`, PW - 14, y + 5.5, { align: 'right' });
    y += 9;

    if (rows.length === 0) {
      doc.setTextColor(...LIGHT);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('No entries for this period.', 14, y + 6);
      y += 12;
      return;
    }

    autoTable(doc, {
      startY: y,
      head: [head],
      body: [...rows, totalRow],
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        textColor: [203, 213, 225],
        fillColor: [15, 23, 42],
        lineColor: [30, 41, 59],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [20, 30, 55],
        textColor: WHITE,
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      alternateRowStyles: { fillColor: [18, 26, 48] },
      didParseCell(data) {
        const isTotal = data.row.index === rows.length;
        if (isTotal) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [25, 35, 65];
          data.cell.styles.textColor = WHITE;
        }
        // Amount column — right-align and colour
        const lastCol = data.column.index === head.length - 1;
        if (lastCol && !isTotal) {
          data.cell.styles.textColor = color;
          data.cell.styles.halign = 'right';
          data.cell.styles.fontStyle = 'bold';
        }
        if (lastCol && isTotal) {
          data.cell.styles.halign = 'right';
          data.cell.styles.textColor = color;
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  };

  // ── Income table ──
  addTable(
    'INCOME',
    GREEN,
    ['Date', 'Type', 'Description', 'Member', 'Period', 'Amount'],
    incData.map(r => [
      r.date ? format(new Date(r.date), 'dd MMM yy') : '—',
      r.type || '—',
      r.description || '—',
      r.familyMemberName || 'Self',
      r.period || '—',
      fmt(r.amount),
    ]),
    ['', '', '', '', 'Total', fmt(totalInc)],
  );

  // ── Expenses table ──
  addTable(
    'EXPENSES',
    RED,
    ['Date', 'Category', 'Description', 'Member', 'Period', 'Amount'],
    expData.map(r => [
      r.date ? format(new Date(r.date), 'dd MMM yy') : '—',
      r.category || '—',
      r.description || '—',
      r.familyMemberName || 'Self',
      r.period || '—',
      fmt(r.amount),
    ]),
    ['', '', '', '', 'Total', fmt(totalExp)],
  );

  // ── Investments table ──
  addTable(
    'INVESTMENTS',
    YELLOW,
    ['Date', 'Type', 'Description', 'Member', 'Status', 'Amount'],
    invData.map(r => [
      r.date ? format(new Date(r.date), 'dd MMM yy') : '—',
      r.type || '—',
      r.description || '—',
      r.familyMemberName || 'Self',
      r.status || '—',
      fmt(r.amount),
    ]),
    ['', '', '', '', 'Total', fmt(totalInv)],
  );

  // ── Footer on every page ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(...DARK);
    doc.rect(0, PH - 10, PW, 10, 'F');
    doc.setTextColor(...LIGHT);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text('FinanceHome — Confidential', 14, PH - 4);
    doc.text(`Page ${p} of ${totalPages}`, PW - 14, PH - 4, { align: 'right' });
  }

  doc.save(`statement_${format(from, 'yyyyMMdd')}_${format(to, 'yyyyMMdd')}.pdf`);
}
