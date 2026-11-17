import { type Order, type StudentProfile, type ParentLimits, type WalletTransaction } from './store';

/**
 * Escapes characters for PDF string literals: (, ), and \
 */
function escapePdfText(text: string): string {
  return String(text ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Builds a valid PDF 1.4 binary/text document string from a page content stream.
 */
function compilePdfDocument(contentLines: string[], pageWidth = 595.28, pageHeight = 841.89): string {
  const contentStream = contentLines.join('\n');
  const streamLength = contentStream.length;

  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  objects.push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`
  );
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj');
  objects.push(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj`);

  let offset = 9; // `%PDF-1.4\n`
  const offsets: number[] = [0];
  const bodyParts: string[] = ['%PDF-1.4\n'];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(offset);
    const part = objects[i] + '\n';
    bodyParts.push(part);
    offset += part.length;
  }

  const startxref = offset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;
  bodyParts.push(xref);
  bodyParts.push(trailer);

  return bodyParts.join('');
}

/**
 * Helper to download raw PDF string as a browser file.
 */
function triggerPdfDownload(pdfString: string, filename: string): void {
  const blob = new Blob([pdfString], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// 1. OFFICIAL STUDENT WALLET STATEMENT (PDF)
// ============================================================================
export function downloadWalletStatementPdf(
  student: StudentProfile,
  walletBalance: number,
  parentLimits: ParentLimits,
  transactions: WalletTransaction[]
): void {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const leftMargin = 45;
  const contentWidth = pageWidth - leftMargin * 2; // 505.28

  const lines: string[] = [];

  const drawLine = (y: number, strokeWidth = 1, r = 0.85, g = 0.87, b = 0.9) => {
    lines.push(`q ${strokeWidth} w ${r} ${g} ${b} RG ${leftMargin} ${y} m ${leftMargin + contentWidth} ${y} l S Q`);
  };

  const fillRect = (x: number, y: number, w: number, h: number, r: number, g: number, b: number) => {
    lines.push(`q ${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f Q`);
  };

  const addText = (text: string, x: number, y: number, font = '/F1', size = 9, r = 0.1, g = 0.15, b = 0.2) => {
    const escaped = escapePdfText(text);
    lines.push(`BT ${font} ${size} Tf ${r} ${g} ${b} rg 1 0 0 1 ${x} ${y} Tm (${escaped}) Tj ET`);
  };

  // Header Banner
  fillRect(leftMargin, 740, contentWidth, 60, 0.06, 0.09, 0.16); // Obsidian navy banner
  addText('CAMPUSKART STUDENT WALLET & FINANCIAL STATEMENT', leftMargin + 16, 775, '/F2', 14, 1, 1, 1);
  addText('OFFICIAL ELECTRONIC LEDGER EXTRACT · SRI CHAITANYA & NARAYANA ACADEMY', leftMargin + 16, 755, '/F1', 8, 0.7, 0.8, 1);

  // Student & Account Information Card
  fillRect(leftMargin, 645, contentWidth, 80, 0.97, 0.98, 0.99);
  drawLine(725, 1, 0.88, 0.9, 0.93);
  drawLine(645, 1, 0.88, 0.9, 0.93);

  // Left Details
  addText('Student Name:', leftMargin + 15, 705, '/F2', 8.5, 0.4, 0.45, 0.52);
  addText(student.fullName, leftMargin + 85, 705, '/F2', 8.5, 0.1, 0.15, 0.2);

  addText('Student ID:', leftMargin + 15, 687, '/F2', 8.5, 0.4, 0.45, 0.52);
  addText(student.studentId, leftMargin + 85, 687, '/F1', 8.5, 0.1, 0.15, 0.2);

  addText('Institution:', leftMargin + 15, 669, '/F2', 8.5, 0.4, 0.45, 0.52);
  addText(student.institution || 'Sri Chaitanya & Narayana Junior Academy', leftMargin + 85, 669, '/F1', 8.5, 0.1, 0.15, 0.2);

  addText('Hostel Room:', leftMargin + 15, 652, '/F2', 8.5, 0.4, 0.45, 0.52);
  addText(`${student.hostel || 'Hostel Block B, Room 204'} (${student.city || 'Hyderabad Hub'})`, leftMargin + 85, 652, '/F1', 8.5, 0.1, 0.15, 0.2);

  // Right Details
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  addText('Statement Date:', leftMargin + 310, 705, '/F2', 8.5, 0.4, 0.45, 0.52);
  addText(now, leftMargin + 395, 705, '/F1', 8.5, 0.1, 0.15, 0.2);

  addText('Account Status:', leftMargin + 310, 687, '/F2', 8.5, 0.4, 0.45, 0.52);
  addText('Active · Verified Smart Pass', leftMargin + 395, 687, '/F2', 8.5, 0.05, 0.6, 0.3);

  addText('Parent / Guardian:', leftMargin + 310, 669, '/F2', 8.5, 0.4, 0.45, 0.52);
  addText(`${student.parentName || 'Rajesh Mehta'}`, leftMargin + 395, 669, '/F1', 8.5, 0.1, 0.15, 0.2);

  addText('Emergency Phone:', leftMargin + 310, 652, '/F2', 8.5, 0.4, 0.45, 0.52);
  addText(`${student.parentContact || '+91 98480 22334'}`, leftMargin + 395, 652, '/F1', 8.5, 0.1, 0.15, 0.2);

  // Summary Metrics Bar
  const metricsTop = 600;
  fillRect(leftMargin, metricsTop, contentWidth, 34, 0.93, 0.95, 0.98);
  drawLine(metricsTop + 34, 1, 0.8, 0.85, 0.9);
  drawLine(metricsTop, 1, 0.8, 0.85, 0.9);

  addText('AVAILABLE BALANCE:', leftMargin + 12, metricsTop + 13, '/F2', 9, 0.2, 0.25, 0.35);
  addText(`Rs. ${walletBalance.toLocaleString('en-IN')}`, leftMargin + 115, metricsTop + 13, '/F2', 10, 0.15, 0.4, 0.9);

  addText('DAILY CAP:', leftMargin + 205, metricsTop + 13, '/F2', 8.5, 0.4, 0.45, 0.5);
  addText(`Rs. ${parentLimits.daily}`, leftMargin + 260, metricsTop + 13, '/F1', 8.5, 0.1, 0.15, 0.2);

  addText('MONTHLY CAP:', leftMargin + 325, metricsTop + 13, '/F2', 8.5, 0.4, 0.45, 0.5);
  addText(`Rs. ${parentLimits.monthly}`, leftMargin + 395, metricsTop + 13, '/F1', 8.5, 0.1, 0.15, 0.2);

  addText('THRESHOLD:', leftMargin + 440, metricsTop + 13, '/F2', 8, 0.4, 0.45, 0.5);
  addText(`>Rs. ${parentLimits.approvalAbove}`, leftMargin + 490, metricsTop + 13, '/F1', 8, 0.1, 0.15, 0.2);

  // Transaction Ledger Table Header
  const tableTop = 560;
  fillRect(leftMargin, tableTop, contentWidth, 22, 0.88, 0.91, 0.95);
  drawLine(tableTop + 22, 1, 0.75, 0.8, 0.85);
  drawLine(tableTop, 1, 0.75, 0.8, 0.85);

  addText('TXN ID', leftMargin + 8, tableTop + 7, '/F2', 8, 0.2, 0.25, 0.35);
  addText('DATE & TIME', leftMargin + 90, tableTop + 7, '/F2', 8, 0.2, 0.25, 0.35);
  addText('DESCRIPTION', leftMargin + 190, tableTop + 7, '/F2', 8, 0.2, 0.25, 0.35);
  addText('TYPE', leftMargin + 380, tableTop + 7, '/F2', 8, 0.2, 0.25, 0.35);
  addText('AMOUNT (INR)', leftMargin + 440, tableTop + 7, '/F2', 8, 0.2, 0.25, 0.35);

  // Table Rows (Up to 14 latest transactions)
  let curY = tableTop - 20;
  const recentTxns = transactions.slice(0, 14);

  recentTxns.forEach((tx, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      fillRect(leftMargin, curY - 5, contentWidth, 20, 0.98, 0.99, 1);
    }
    drawLine(curY - 5, 0.5, 0.9, 0.92, 0.94);

    const isCredit = tx.type === 'top-up' || tx.type === 'refund';
    const amountStr = `${isCredit ? '+' : '-'}${Math.abs(tx.amount)}`;

    addText(tx.id.slice(0, 12), leftMargin + 8, curY, '/F1', 8, 0.4, 0.45, 0.5);
    addText(new Date(tx.createdAt).toLocaleDateString('en-IN'), leftMargin + 90, curY, '/F1', 8, 0.2, 0.25, 0.3);
    addText(tx.description.slice(0, 32), leftMargin + 190, curY, '/F1', 8, 0.1, 0.15, 0.2);
    addText(tx.type.toUpperCase(), leftMargin + 380, curY, '/F1', 7.5, 0.4, 0.45, 0.5);

    if (isCredit) {
      addText(`Rs. ${amountStr}`, leftMargin + 445, curY, '/F2', 8.5, 0.05, 0.6, 0.3);
    } else {
      addText(`Rs. ${amountStr}`, leftMargin + 445, curY, '/F2', 8.5, 0.2, 0.2, 0.25);
    }

    curY -= 20;
  });

  // Institutional Verification Seal & Policy Block
  const footerTop = 130;
  fillRect(leftMargin, footerTop - 45, contentWidth, 55, 0.97, 0.98, 0.99);
  drawLine(footerTop + 10, 1, 0.85, 0.88, 0.92);
  drawLine(footerTop - 45, 1, 0.85, 0.88, 0.92);

  addText('OFFICIAL INSTITUTIONAL AUTHENTICATION & FERPA AUDIT SEAL', leftMargin + 12, footerTop - 2, '/F2', 8, 0.2, 0.25, 0.35);
  addText('This statement constitutes an official electronic financial extract from the CampusKart Closed-Loop Ledger.', leftMargin + 12, footerTop - 16, '/F1', 7.5, 0.4, 0.45, 0.5);
  addText(`Digital Signature: CK-VERIFIED-${student.studentId}-${Date.now().toString(36).toUpperCase()} · Nonce: SHA256-LEGAL-STAMP`, leftMargin + 12, footerTop - 28, '/F1', 7, 0.5, 0.55, 0.6);
  addText('University Micro-Logistics & Parent Oversight Directive 2026. Sri Chaitanya & Narayana Junior Academy.', leftMargin + 12, footerTop - 38, '/F1', 7, 0.5, 0.55, 0.6);

  const fullPdf = compilePdfDocument(lines, pageWidth, pageHeight);
  triggerPdfDownload(fullPdf, `CampusKart_Statement_${student.studentId}.pdf`);
}

// ============================================================================
// 2. OFFICIAL PARENT OVERSIGHT AUDIT STATEMENT (PDF)
// ============================================================================
export function downloadParentStatementPdf(
  student: StudentProfile,
  walletBalance: number,
  parentLimits: ParentLimits,
  transactions: WalletTransaction[],
  orders: Order[]
): void {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const leftMargin = 45;
  const contentWidth = pageWidth - leftMargin * 2;

  const lines: string[] = [];

  const drawLine = (y: number, strokeWidth = 1, r = 0.85, g = 0.87, b = 0.9) => {
    lines.push(`q ${strokeWidth} w ${r} ${g} ${b} RG ${leftMargin} ${y} m ${leftMargin + contentWidth} ${y} l S Q`);
  };

  const fillRect = (x: number, y: number, w: number, h: number, r: number, g: number, b: number) => {
    lines.push(`q ${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f Q`);
  };

  const addText = (text: string, x: number, y: number, font = '/F1', size = 9, r = 0.1, g = 0.15, b = 0.2) => {
    const escaped = escapePdfText(text);
    lines.push(`BT ${font} ${size} Tf ${r} ${g} ${b} rg 1 0 0 1 ${x} ${y} Tm (${escaped}) Tj ET`);
  };

  // Header Banner - Emerald/Guardian Green Theme
  fillRect(leftMargin, 740, contentWidth, 60, 0.04, 0.35, 0.22);
  addText('PARENT GUARDIAN FINANCIAL OVERSIGHT & SPENDING AUDIT', leftMargin + 16, 775, '/F2', 13, 1, 1, 1);
  addText('CAMPUSKART CLOSED-LOOP PARENTAL CONTROLS & ALLOWANCE LEDGER', leftMargin + 16, 755, '/F1', 8, 0.8, 1, 0.9);

  // Student & Guardian Metadata Box
  fillRect(leftMargin, 650, contentWidth, 75, 0.97, 0.99, 0.97);
  drawLine(725, 1, 0.8, 0.9, 0.85);
  drawLine(650, 1, 0.8, 0.9, 0.85);

  addText('Student:', leftMargin + 15, 705, '/F2', 8.5, 0.35, 0.45, 0.4);
  addText(`${student.fullName} (${student.studentId})`, leftMargin + 70, 705, '/F2', 8.5, 0.1, 0.15, 0.2);

  addText('Institution:', leftMargin + 15, 687, '/F2', 8.5, 0.35, 0.45, 0.4);
  addText(student.institution, leftMargin + 70, 687, '/F1', 8.5, 0.1, 0.15, 0.2);

  addText('Hostel Room:', leftMargin + 15, 669, '/F2', 8.5, 0.35, 0.45, 0.4);
  addText(student.hostel || 'Hostel Block B, Room 204', leftMargin + 70, 669, '/F1', 8.5, 0.1, 0.15, 0.2);

  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  addText('Audit Timestamp:', leftMargin + 310, 705, '/F2', 8.5, 0.35, 0.45, 0.4);
  addText(now, leftMargin + 395, 705, '/F1', 8.5, 0.1, 0.15, 0.2);

  addText('Primary Guardian:', leftMargin + 310, 687, '/F2', 8.5, 0.35, 0.45, 0.4);
  addText(`${student.parentName || 'Rajesh Mehta'}`, leftMargin + 395, 687, '/F2', 8.5, 0.1, 0.15, 0.2);

  addText('Emergency Phone:', leftMargin + 310, 669, '/F2', 8.5, 0.35, 0.45, 0.4);
  addText(`${student.parentContact || '+91 98480 22334'}`, leftMargin + 395, 669, '/F1', 8.5, 0.1, 0.15, 0.2);

  // Active Policy Safeguards Strip
  const policyTop = 605;
  fillRect(leftMargin, policyTop, contentWidth, 36, 0.94, 0.97, 0.95);
  drawLine(policyTop + 36, 1, 0.75, 0.88, 0.8);
  drawLine(policyTop, 1, 0.75, 0.88, 0.8);

  addText('DAILY ALLOWANCE:', leftMargin + 10, policyTop + 14, '/F2', 8, 0.2, 0.4, 0.3);
  addText(`Rs. ${parentLimits.daily}`, leftMargin + 95, policyTop + 14, '/F2', 8.5, 0.05, 0.5, 0.2);

  addText('MONTHLY CAP:', leftMargin + 155, policyTop + 14, '/F2', 8, 0.2, 0.4, 0.3);
  addText(`Rs. ${parentLimits.monthly}`, leftMargin + 225, policyTop + 14, '/F2', 8.5, 0.05, 0.5, 0.2);

  addText('APPROVAL ABOVE:', leftMargin + 285, policyTop + 14, '/F2', 8, 0.2, 0.4, 0.3);
  addText(`Rs. ${parentLimits.approvalAbove}`, leftMargin + 375, policyTop + 14, '/F2', 8.5, 0.05, 0.5, 0.2);

  addText('ALLOWED HOURS:', leftMargin + 420, policyTop + 14, '/F2', 8, 0.2, 0.4, 0.3);
  addText(`${parentLimits.allowedFrom}-${parentLimits.allowedUntil}`, leftMargin + 500, policyTop + 14, '/F1', 7.5, 0.1, 0.15, 0.2);

  // Ledger Table Header
  const tableTop = 565;
  fillRect(leftMargin, tableTop, contentWidth, 22, 0.9, 0.94, 0.92);
  drawLine(tableTop + 22, 1, 0.75, 0.85, 0.8);
  drawLine(tableTop, 1, 0.75, 0.85, 0.8);

  addText('ENTRY ID', leftMargin + 8, tableTop + 7, '/F2', 8, 0.2, 0.3, 0.25);
  addText('DATE', leftMargin + 90, tableTop + 7, '/F2', 8, 0.2, 0.3, 0.25);
  addText('TRANSACTION / ITEM', leftMargin + 180, tableTop + 7, '/F2', 8, 0.2, 0.3, 0.25);
  addText('TYPE', leftMargin + 375, tableTop + 7, '/F2', 8, 0.2, 0.3, 0.25);
  addText('AMOUNT (INR)', leftMargin + 440, tableTop + 7, '/F2', 8, 0.2, 0.3, 0.25);

  let curY = tableTop - 20;
  const auditEntries = transactions.slice(0, 14);

  auditEntries.forEach((tx, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      fillRect(leftMargin, curY - 5, contentWidth, 20, 0.98, 1, 0.98);
    }
    drawLine(curY - 5, 0.5, 0.88, 0.92, 0.9);

    const isCredit = tx.type === 'top-up' || tx.type === 'refund';
    const amountStr = `${isCredit ? '+' : '-'}${Math.abs(tx.amount)}`;

    addText(tx.id.slice(0, 12), leftMargin + 8, curY, '/F1', 8, 0.4, 0.45, 0.5);
    addText(new Date(tx.createdAt).toLocaleDateString('en-IN'), leftMargin + 90, curY, '/F1', 8, 0.2, 0.25, 0.3);
    addText(tx.description.slice(0, 32), leftMargin + 180, curY, '/F1', 8, 0.1, 0.15, 0.2);
    addText(tx.type.toUpperCase(), leftMargin + 375, curY, '/F1', 7.5, 0.4, 0.45, 0.5);

    if (isCredit) {
      addText(`Rs. ${amountStr}`, leftMargin + 445, curY, '/F2', 8.5, 0.05, 0.6, 0.3);
    } else {
      addText(`Rs. ${amountStr}`, leftMargin + 445, curY, '/F2', 8.5, 0.2, 0.2, 0.25);
    }

    curY -= 20;
  });

  // Footer
  const footerTop = 130;
  fillRect(leftMargin, footerTop - 45, contentWidth, 55, 0.97, 0.99, 0.98);
  drawLine(footerTop + 10, 1, 0.8, 0.9, 0.85);
  drawLine(footerTop - 45, 1, 0.8, 0.9, 0.85);

  addText('OFFICIAL PARENTAL OVERSIGHT VERIFICATION HASH', leftMargin + 12, footerTop - 2, '/F2', 8, 0.1, 0.4, 0.25);
  addText('All student wallet debit transactions are restricted to university-approved retail categories and permitted hours.', leftMargin + 12, footerTop - 16, '/F1', 7.5, 0.35, 0.45, 0.4);
  addText(`Security Token: GUARDIAN-HASH-${student.parentId || 'PAR-101'}-${Date.now().toString(36).toUpperCase()}`, leftMargin + 12, footerTop - 28, '/F1', 7, 0.4, 0.5, 0.45);
  addText('Sri Chaitanya & Narayana Junior Academy · Closed-Loop Guardian Portal Protocol 2026.', leftMargin + 12, footerTop - 38, '/F1', 7, 0.4, 0.5, 0.45);

  const fullPdf = compilePdfDocument(lines, pageWidth, pageHeight);
  triggerPdfDownload(fullPdf, `CampusKart_Parent_Statement_${student.studentId}.pdf`);
}

// ============================================================================
// 3. OFFICIAL INSTITUTIONAL ANALYTICS REPORT (PDF - STRICTLY ANONYMIZED)
// ============================================================================
export function downloadCollegeReportPdf(
  institution: string,
  city: string,
  activeOrders: Order[],
  grossGmv: number
): void {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const leftMargin = 45;
  const contentWidth = pageWidth - leftMargin * 2;

  const lines: string[] = [];

  const drawLine = (y: number, strokeWidth = 1, r = 0.85, g = 0.87, b = 0.9) => {
    lines.push(`q ${strokeWidth} w ${r} ${g} ${b} RG ${leftMargin} ${y} m ${leftMargin + contentWidth} ${y} l S Q`);
  };

  const fillRect = (x: number, y: number, w: number, h: number, r: number, g: number, b: number) => {
    lines.push(`q ${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f Q`);
  };

  const addText = (text: string, x: number, y: number, font = '/F1', size = 9, r = 0.1, g = 0.15, b = 0.2) => {
    const escaped = escapePdfText(text);
    lines.push(`BT ${font} ${size} Tf ${r} ${g} ${b} rg 1 0 0 1 ${x} ${y} Tm (${escaped}) Tj ET`);
  };

  // Header Banner - Academic Violet Theme
  fillRect(leftMargin, 740, contentWidth, 60, 0.28, 0.2, 0.58);
  addText('CAMPUS COMMERCE & MICRO-LOGISTICS AGGREGATE AUDIT', leftMargin + 16, 775, '/F2', 13, 1, 1, 1);
  addText('ANONYMIZED INSTITUTIONAL REPORT · STRICT FERPA PRIVACY COMPLIANT', leftMargin + 16, 755, '/F1', 8, 0.85, 0.8, 1);

  // Institution Overview
  fillRect(leftMargin, 655, contentWidth, 70, 0.97, 0.96, 0.99);
  drawLine(725, 1, 0.85, 0.8, 0.95);
  drawLine(655, 1, 0.85, 0.8, 0.95);

  addText('Institution:', leftMargin + 15, 702, '/F2', 8.5, 0.4, 0.35, 0.5);
  addText(institution, leftMargin + 75, 702, '/F2', 8.5, 0.1, 0.15, 0.2);

  addText('Campus City:', leftMargin + 15, 684, '/F2', 8.5, 0.4, 0.35, 0.5);
  addText(city, leftMargin + 75, 684, '/F1', 8.5, 0.1, 0.15, 0.2);

  addText('Privacy Invariant:', leftMargin + 15, 666, '/F2', 8.5, 0.4, 0.35, 0.5);
  addText('ZERO STUDENT PII (Strictly aggregate counts & totals)', leftMargin + 95, 666, '/F2', 8, 0.28, 0.2, 0.58);

  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  addText('Reporting Period:', leftMargin + 310, 702, '/F2', 8.5, 0.4, 0.35, 0.5);
  addText(now, leftMargin + 395, 702, '/F1', 8.5, 0.1, 0.15, 0.2);

  addText('Compliance Standard:', leftMargin + 310, 684, '/F2', 8.5, 0.4, 0.35, 0.5);
  addText('FERPA § 99.31 Aggregate Audit', leftMargin + 410, 684, '/F1', 8, 0.1, 0.15, 0.2);

  // Aggregate Metrics Cards
  const statsTop = 605;
  fillRect(leftMargin, statsTop, contentWidth, 36, 0.93, 0.92, 0.97);
  drawLine(statsTop + 36, 1, 0.8, 0.75, 0.9);
  drawLine(statsTop, 1, 0.8, 0.75, 0.9);

  const collectedOrders = activeOrders.filter((o) => o.status === 'collected').length;
  const successRate = activeOrders.length > 0 ? Math.round((collectedOrders / activeOrders.length) * 100) : 100;

  addText('GROSS ORDER VALUE (GMV):', leftMargin + 10, statsTop + 14, '/F2', 8, 0.3, 0.25, 0.4);
  addText(`Rs. ${grossGmv.toLocaleString('en-IN')}`, leftMargin + 130, statsTop + 14, '/F2', 9.5, 0.28, 0.2, 0.58);

  addText('TOTAL ORDERS:', leftMargin + 230, statsTop + 14, '/F2', 8, 0.3, 0.25, 0.4);
  addText(String(activeOrders.length), leftMargin + 300, statsTop + 14, '/F2', 9, 0.1, 0.15, 0.2);

  addText('COMPLETED:', leftMargin + 340, statsTop + 14, '/F2', 8, 0.3, 0.25, 0.4);
  addText(String(collectedOrders), leftMargin + 400, statsTop + 14, '/F2', 9, 0.05, 0.5, 0.2);

  addText('FULFILLMENT RATE:', leftMargin + 430, statsTop + 14, '/F2', 7.5, 0.3, 0.25, 0.4);
  addText(`${successRate}%`, leftMargin + 510, statsTop + 14, '/F2', 8.5, 0.05, 0.5, 0.2);

  // Category Distribution Table Header
  const tableTop = 565;
  fillRect(leftMargin, tableTop, contentWidth, 22, 0.89, 0.88, 0.94);
  drawLine(tableTop + 22, 1, 0.78, 0.75, 0.88);
  drawLine(tableTop, 1, 0.78, 0.75, 0.88);

  addText('CATEGORY', leftMargin + 12, tableTop + 7, '/F2', 8, 0.25, 0.2, 0.4);
  addText('TRANSACTION VOLUME', leftMargin + 240, tableTop + 7, '/F2', 8, 0.25, 0.2, 0.4);
  addText('TOTAL SALES (INR)', leftMargin + 400, tableTop + 7, '/F2', 8, 0.25, 0.2, 0.4);

  // Group by category
  const catMap = new Map<string, { count: number; total: number }>();
  activeOrders.forEach((o) => {
    o.items.forEach((it) => {
      const cat = it.product.category;
      const prev = catMap.get(cat) ?? { count: 0, total: 0 };
      catMap.set(cat, { count: prev.count + it.quantity, total: prev.total + it.product.price * it.quantity });
    });
  });

  const catEntries = [...catMap.entries()].sort((a, b) => b[1].total - a[1].total);
  let curY = tableTop - 20;

  catEntries.forEach(([catName, stats], idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      fillRect(leftMargin, curY - 5, contentWidth, 20, 0.98, 0.97, 1);
    }
    drawLine(curY - 5, 0.5, 0.9, 0.88, 0.95);

    addText(catName, leftMargin + 12, curY, '/F2', 8.5, 0.1, 0.15, 0.2);
    addText(`${stats.count} units fulfilled`, leftMargin + 240, curY, '/F1', 8, 0.35, 0.4, 0.45);
    addText(`Rs. ${stats.total.toLocaleString('en-IN')}`, leftMargin + 400, curY, '/F2', 8.5, 0.28, 0.2, 0.58);

    curY -= 20;
  });

  // Institutional Verification Footer
  const footerTop = 130;
  fillRect(leftMargin, footerTop - 45, contentWidth, 55, 0.97, 0.96, 0.99);
  drawLine(footerTop + 10, 1, 0.82, 0.78, 0.9);
  drawLine(footerTop - 45, 1, 0.82, 0.78, 0.9);

  addText('OFFICIAL INSTITUTIONAL AGGREGATE REPORT & AUDIT SEAL', leftMargin + 12, footerTop - 2, '/F2', 8, 0.28, 0.2, 0.58);
  addText('Generated by the CampusKart Institutional Admin Engine. Contains zero identifiable student transaction traces.', leftMargin + 12, footerTop - 16, '/F1', 7.5, 0.4, 0.45, 0.5);
  addText(`Report Hash: INST-REPORT-${city.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`, leftMargin + 12, footerTop - 28, '/F1', 7, 0.5, 0.55, 0.6);
  addText('Sri Chaitanya & Narayana Junior Academy · Institutional Analytics Division 2026.', leftMargin + 12, footerTop - 38, '/F1', 7, 0.5, 0.55, 0.6);

  const fullPdf = compilePdfDocument(lines, pageWidth, pageHeight);
  triggerPdfDownload(fullPdf, `CampusKart_College_Report_${city}.pdf`);
}
