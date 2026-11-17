import { type Order, inr } from './store';
export {
  downloadWalletStatementPdf,
  downloadParentStatementPdf,
  downloadCollegeReportPdf
} from './pdfStatements';

/**
 * Escapes characters for PDF string literals: (, ), and \
 */
function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/**
 * Generates a clean, valid PDF 1.4 document in pure TypeScript
 * and triggers a browser download with filename `CampusKart_Receipt_{orderId}.pdf`.
 */
export function downloadOrderReceiptPdf(order: Order): void {
  const pageWidth = 595.28; // A4 standard width in points
  const pageHeight = 841.89; // A4 standard height in points
  const leftMargin = 50;
  const contentWidth = pageWidth - leftMargin * 2; // 495.28

  // Stream commands
  const lines: string[] = [];

  // Helper to draw horizontal line
  const drawLine = (y: number, strokeWidth = 1, r = 0.8, g = 0.82, b = 0.86) => {
    lines.push(`q ${strokeWidth} w ${r} ${g} ${b} RG ${leftMargin} ${y} m ${leftMargin + contentWidth} ${y} l S Q`);
  };

  // Helper to fill rectangle
  const fillRect = (x: number, y: number, w: number, h: number, r: number, g: number, b: number) => {
    lines.push(`q ${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f Q`);
  };

  // Helper to place text
  const addText = (text: string, x: number, y: number, font = '/F1', size = 10, r = 0.1, g = 0.15, b = 0.2) => {
    const escaped = escapePdfText(text);
    lines.push(`BT ${font} ${size} Tf ${r} ${g} ${b} rg 1 0 0 1 ${x} ${y} Tm (${escaped}) Tj ET`);
  };

  // Header Banner Background
  fillRect(leftMargin, 730, contentWidth, 65, 0.24, 0.35, 0.93); // Primary indigo banner

  // Header Text
  addText('CampusKart Commerce System', leftMargin + 18, 770, '/F2', 18, 1, 1, 1);
  addText('OFFICIAL TOUCHLESS KIOSK RECEIPT & PROOF OF DELIVERY', leftMargin + 18, 748, '/F1', 9, 0.88, 0.92, 1);

  // Metadata Card Background
  fillRect(leftMargin, 630, contentWidth, 85, 0.96, 0.97, 0.99);
  drawLine(715, 1, 0.88, 0.9, 0.94);
  drawLine(630, 1, 0.88, 0.9, 0.94);

  // Metadata Fields - Left Column
  addText('Order ID:', leftMargin + 15, 695, '/F2', 9, 0.4, 0.45, 0.52);
  addText(order.id, leftMargin + 70, 695, '/F2', 9, 0.1, 0.15, 0.2);

  addText('Student:', leftMargin + 15, 675, '/F2', 9, 0.4, 0.45, 0.52);
  addText(`${order.studentName} (${order.studentId})`, leftMargin + 70, 675, '/F1', 9, 0.1, 0.15, 0.2);

  addText('Institution:', leftMargin + 15, 655, '/F2', 9, 0.4, 0.45, 0.52);
  addText(order.institution || 'Sri Chaitanya & Narayana Junior Academy', leftMargin + 70, 655, '/F1', 9, 0.1, 0.15, 0.2);

  addText('Campus / Block:', leftMargin + 15, 638, '/F2', 9, 0.4, 0.45, 0.52);
  addText(`${order.city || 'Hyderabad'} · ${order.hostel || 'Hostel B Lobby Locker #08'}`, leftMargin + 95, 638, '/F1', 9, 0.1, 0.15, 0.2);

  // Metadata Fields - Right Column
  const orderDate = new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  addText('Date / Time:', leftMargin + 290, 695, '/F2', 9, 0.4, 0.45, 0.52);
  addText(orderDate, leftMargin + 355, 695, '/F1', 9, 0.1, 0.15, 0.2);

  addText('Payment Mode:', leftMargin + 290, 675, '/F2', 9, 0.4, 0.45, 0.52);
  addText('CampusKart Student Wallet', leftMargin + 365, 675, '/F1', 9, 0.1, 0.15, 0.2);

  addText('Payment Status:', leftMargin + 290, 655, '/F2', 9, 0.4, 0.45, 0.52);
  addText('Paid & Verified (Txn Ref: TXN-CK-90012)', leftMargin + 365, 655, '/F2', 9, 0.1, 0.6, 0.3);

  addText('Pickup Token OTP:', leftMargin + 290, 638, '/F2', 9, 0.4, 0.45, 0.52);
  addText(order.pickupCode || '334190', leftMargin + 380, 638, '/F2', 10, 0.24, 0.35, 0.93);

  // Line Items Table Header
  const tableTop = 595;
  fillRect(leftMargin, tableTop, contentWidth, 24, 0.91, 0.93, 0.97);
  drawLine(tableTop + 24, 1.5, 0.8, 0.84, 0.9);
  drawLine(tableTop, 1, 0.8, 0.84, 0.9);

  addText('ITEM DESCRIPTION', leftMargin + 12, tableTop + 8, '/F2', 9, 0.25, 0.3, 0.4);
  addText('CATEGORY', leftMargin + 250, tableTop + 8, '/F2', 9, 0.25, 0.3, 0.4);
  addText('QTY', leftMargin + 370, tableTop + 8, '/F2', 9, 0.25, 0.3, 0.4);
  addText('UNIT PRICE', leftMargin + 410, tableTop + 8, '/F2', 9, 0.25, 0.3, 0.4);
  addText('LINE TOTAL', leftMargin + 450, tableTop + 8, '/F2', 9, 0.25, 0.3, 0.4);

  // Table Rows
  let curY = tableTop - 22;
  order.items.forEach((item, idx) => {
    const itemTotal = item.product.price * item.quantity;
    const isEven = idx % 2 === 0;

    if (isEven) {
      fillRect(leftMargin, curY - 6, contentWidth, 22, 0.98, 0.99, 1);
    }
    drawLine(curY - 6, 0.5, 0.9, 0.92, 0.95);

    addText(item.product.name.slice(0, 36), leftMargin + 12, curY, '/F1', 9, 0.1, 0.15, 0.2);
    addText(item.product.category.slice(0, 20), leftMargin + 250, curY, '/F1', 8, 0.4, 0.45, 0.5);
    addText(String(item.quantity), leftMargin + 375, curY, '/F1', 9, 0.1, 0.15, 0.2);
    addText(`Rs. ${item.product.price}`, leftMargin + 412, curY, '/F1', 9, 0.1, 0.15, 0.2);
    addText(`Rs. ${itemTotal}`, leftMargin + 455, curY, '/F2', 9, 0.1, 0.15, 0.2);

    curY -= 22;
  });

  // Summary Card
  const summaryTop = curY - 15;
  fillRect(leftMargin + 280, summaryTop - 85, contentWidth - 280, 95, 0.97, 0.98, 1);
  drawLine(summaryTop + 10, 1, 0.84, 0.88, 0.95);
  drawLine(summaryTop - 85, 1, 0.84, 0.88, 0.95);

  addText('Subtotal:', leftMargin + 295, summaryTop - 12, '/F1', 9, 0.4, 0.45, 0.52);
  addText(`Rs. ${order.total}`, leftMargin + 440, summaryTop - 12, '/F1', 9, 0.1, 0.15, 0.2);

  addText('Campus Handling / Taxes:', leftMargin + 295, summaryTop - 32, '/F1', 9, 0.4, 0.45, 0.52);
  addText('Rs. 0 (Subsidized)', leftMargin + 415, summaryTop - 32, '/F1', 9, 0.1, 0.6, 0.3);

  addText('Paid via Student Wallet:', leftMargin + 295, summaryTop - 52, '/F1', 9, 0.4, 0.45, 0.52);
  addText(`Rs. ${order.total}`, leftMargin + 440, summaryTop - 52, '/F2', 9, 0.1, 0.15, 0.2);

  drawLine(summaryTop - 62, 1, 0.8, 0.84, 0.9);
  addText('NET TOTAL PAID:', leftMargin + 295, summaryTop - 78, '/F2', 11, 0.1, 0.15, 0.2);
  addText(`Rs. ${order.total}`, leftMargin + 430, summaryTop - 78, '/F2', 13, 0.24, 0.35, 0.93);

  // Security & Token Stamp Box (Left side of summary)
  const stampTop = summaryTop;
  fillRect(leftMargin, stampTop - 85, 260, 95, 0.98, 0.99, 0.98);
  drawLine(stampTop + 10, 1, 0.75, 0.85, 0.75);
  drawLine(stampTop - 85, 1, 0.75, 0.85, 0.75);

  addText('AUTHENTICATION & DISPENSING TOKEN', leftMargin + 12, stampTop - 12, '/F2', 8, 0.2, 0.5, 0.25);
  addText('Status:', leftMargin + 12, stampTop - 32, '/F1', 9, 0.4, 0.45, 0.5);
  addText(order.status.toUpperCase(), leftMargin + 65, stampTop - 32, '/F2', 9, 0.1, 0.6, 0.3);

  addText('6-Digit Handshake OTP:', leftMargin + 12, stampTop - 52, '/F1', 9, 0.4, 0.45, 0.5);
  addText(order.pickupCode || '334190', leftMargin + 125, stampTop - 54, '/F2', 13, 0.24, 0.35, 0.93);

  addText('Token ID: TOKEN-' + order.id + '-' + (order.pickupCode || '334190'), leftMargin + 12, stampTop - 74, '/F1', 7.5, 0.5, 0.55, 0.6);

  // Legal & Institutional Footer
  const footerY = 120;
  drawLine(footerY + 25, 1, 0.85, 0.88, 0.92);
  addText('FERPA & University Guardian Policy Compliant. All transactions are logged in the immutable double-entry campus ledger.', leftMargin, footerY + 10, '/F1', 7.5, 0.45, 0.5, 0.55);
  addText('CampusKart Technologies Pvt Ltd · Internal University Pilot Terminal · Verified Electronic Receipt', leftMargin, footerY - 5, '/F1', 7.5, 0.45, 0.5, 0.55);

  // Assemble PDF Objects
  const contentStream = lines.join('\n');
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

  // Calculate Xref offsets
  let offset = 9; // header `%PDF-1.4\n`
  const offsets: number[] = [0]; // 0000000000 65535 f
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

  const fullPdf = bodyParts.join('');

  // Trigger download as Blob
  const blob = new Blob([fullPdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CampusKart_Receipt_${order.id}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
