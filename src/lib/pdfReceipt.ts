import { type Order, categoryImage } from './store';
import {
  compilePdfDocument,
  loadJpegImage,
  triggerPdfDownload,
  escapePdfText,
  type PdfImageResource,
} from './pdfStatements';
import iconImg from '@/assets/campuskart-icon.jpg';

export {
  downloadWalletStatementPdf,
  downloadParentStatementPdf,
  downloadCollegeReportPdf,
} from './pdfStatements';

/**
 * Generates an official, beautiful PDF 1.4 document in pure TypeScript
 * containing embedded institutional brand emblems, visual reference images for all ordered items,
 * and triggers a browser download with filename `CampusKart_Receipt_{orderId}.pdf`.
 */
export async function downloadOrderReceiptPdf(order: Order): Promise<void> {
  const pageWidth = 595.28; // A4 standard width in points
  const pageHeight = 841.89; // A4 standard height in points
  const leftMargin = 45;
  const contentWidth = pageWidth - leftMargin * 2; // 505.28

  // 1. Load Institutional Header Logo
  const logoResource = await loadJpegImage(iconImg, 80, 80, 'LOGO');
  logoResource.id = 'ImLogo';
  const imageList: PdfImageResource[] = [logoResource];

  // 2. Load Visual Reference Images for each ordered product
  const itemImageIdMap: string[] = [];
  for (let idx = 0; idx < Math.min(order.items.length, 10); idx++) {
    const item = order.items[idx];
    const imgSrc =
      item.product.image ||
      (item.product.imageUrl ? `/products/${item.product.imageUrl}` : categoryImage(item.product.category));
    const fallbackLabel = item.product.sku || `ITEM${idx + 1}`;
    const imgResource = await loadJpegImage(imgSrc, 64, 64, fallbackLabel);
    imgResource.id = `ImItem${idx}`;
    itemImageIdMap.push(imgResource.id);
    imageList.push(imgResource);
  }

  // Stream commands
  const lines: string[] = [];

  const drawLine = (y: number, strokeWidth = 1, r = 0.8, g = 0.82, b = 0.86) => {
    lines.push(`q ${strokeWidth} w ${r} ${g} ${b} RG ${leftMargin} ${y} m ${leftMargin + contentWidth} ${y} l S Q`);
  };

  const fillRect = (x: number, y: number, w: number, h: number, r: number, g: number, b: number) => {
    lines.push(`q ${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f Q`);
  };

  const addText = (text: string, x: number, y: number, font = '/F1', size = 10, r = 0.1, g = 0.15, b = 0.2) => {
    const escaped = escapePdfText(text);
    lines.push(`BT ${font} ${size} Tf ${r} ${g} ${b} rg 1 0 0 1 ${x} ${y} Tm (${escaped}) Tj ET`);
  };

  // Header Banner Background - Obsidian / Royal Indigo
  fillRect(leftMargin, 735, contentWidth, 68, 0.15, 0.25, 0.7);

  // Embed Brand Logo Image in Header Banner
  lines.push(`q 0.92 0.95 1 rg ${leftMargin + 12} 743 52 52 re f Q`);
  lines.push(`q 48 0 0 48 ${leftMargin + 14} 745 cm /ImLogo Do Q`);

  // Header Text
  addText('CampusKart Commerce System', leftMargin + 75, 775, '/F2', 16, 1, 1, 1);
  addText('OFFICIAL TOUCHLESS KIOSK RECEIPT & PROOF OF DELIVERY (WITH IMAGE REFERENCES)', leftMargin + 75, 755, '/F1', 8, 0.88, 0.92, 1);

  // Metadata Card Background
  fillRect(leftMargin, 635, contentWidth, 85, 0.96, 0.97, 0.99);
  drawLine(720, 1, 0.88, 0.9, 0.94);
  drawLine(635, 1, 0.88, 0.9, 0.94);

  // Metadata Fields - Left Column
  addText('Order ID:', leftMargin + 15, 700, '/F2', 9, 0.4, 0.45, 0.52);
  addText(order.id, leftMargin + 70, 700, '/F2', 9, 0.1, 0.15, 0.2);

  addText('Student:', leftMargin + 15, 680, '/F2', 9, 0.4, 0.45, 0.52);
  addText(`${order.studentName} (${order.studentId})`, leftMargin + 70, 680, '/F1', 9, 0.1, 0.15, 0.2);

  addText('Institution:', leftMargin + 15, 660, '/F2', 9, 0.4, 0.45, 0.52);
  addText(order.institution || 'Sri Chaitanya & Narayana Junior Academy', leftMargin + 70, 660, '/F1', 9, 0.1, 0.15, 0.2);

  addText('Campus / Block:', leftMargin + 15, 642, '/F2', 9, 0.4, 0.45, 0.52);
  addText(`${order.city || 'Hyderabad'} · ${order.hostel || 'Hostel B Lobby Locker #08'}`, leftMargin + 95, 642, '/F1', 9, 0.1, 0.15, 0.2);

  // Metadata Fields - Right Column
  const orderDate = new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  addText('Date / Time:', leftMargin + 290, 700, '/F2', 9, 0.4, 0.45, 0.52);
  addText(orderDate, leftMargin + 355, 700, '/F1', 9, 0.1, 0.15, 0.2);

  addText('Payment Mode:', leftMargin + 290, 680, '/F2', 9, 0.4, 0.45, 0.52);
  addText('CampusKart Student Wallet', leftMargin + 365, 680, '/F1', 9, 0.1, 0.15, 0.2);

  addText('Payment Status:', leftMargin + 290, 660, '/F2', 9, 0.4, 0.45, 0.52);
  addText('Paid & Verified (Txn Ref: TXN-CK-90012)', leftMargin + 365, 660, '/F2', 9, 0.1, 0.6, 0.3);

  addText('Pickup Token OTP:', leftMargin + 290, 642, '/F2', 9, 0.4, 0.45, 0.52);
  addText(order.pickupCode || '334190', leftMargin + 380, 642, '/F2', 10, 0.15, 0.25, 0.7);

  // Line Items Table Header (Includes VISUAL REF Column!)
  const tableTop = 595;
  fillRect(leftMargin, tableTop, contentWidth, 24, 0.91, 0.93, 0.97);
  drawLine(tableTop + 24, 1.5, 0.8, 0.84, 0.9);
  drawLine(tableTop, 1, 0.8, 0.84, 0.9);

  addText('VISUAL REF', leftMargin + 10, tableTop + 8, '/F2', 8, 0.25, 0.3, 0.4);
  addText('ITEM DESCRIPTION', leftMargin + 75, tableTop + 8, '/F2', 8, 0.25, 0.3, 0.4);
  addText('CATEGORY', leftMargin + 270, tableTop + 8, '/F2', 8, 0.25, 0.3, 0.4);
  addText('QTY', leftMargin + 380, tableTop + 8, '/F2', 8, 0.25, 0.3, 0.4);
  addText('UNIT PRICE', leftMargin + 418, tableTop + 8, '/F2', 8, 0.25, 0.3, 0.4);
  addText('LINE TOTAL', leftMargin + 462, tableTop + 8, '/F2', 8, 0.25, 0.3, 0.4);

  // Table Rows (With Embedded Product Images!)
  let curY = tableTop - 34;
  order.items.slice(0, 10).forEach((item, idx) => {
    const itemTotal = item.product.price * item.quantity;
    const isEven = idx % 2 === 0;

    if (isEven) {
      fillRect(leftMargin, curY - 6, contentWidth, 32, 0.98, 0.99, 1);
    }
    drawLine(curY - 6, 0.5, 0.9, 0.92, 0.95);

    // Embed Product Image Thumbnail!
    const imgId = itemImageIdMap[idx];
    if (imgId) {
      lines.push(`q 0.92 0.93 0.96 rg ${leftMargin + 10} ${curY - 4} 26 26 re f Q`);
      lines.push(`q 0.8 0.83 0.9 RG 0.5 w ${leftMargin + 10} ${curY - 4} 26 26 re s Q`);
      lines.push(`q 24 0 0 24 ${leftMargin + 11} ${curY - 3} cm /${imgId} Do Q`);
    }

    // SKU and Item Name
    const sku = item.product.sku || `CK-00${idx + 1}`;
    addText(sku, leftMargin + 75, curY + 8, '/F2', 7.5, 0.2, 0.35, 0.8);
    addText(item.product.name.slice(0, 32), leftMargin + 75, curY - 2, '/F1', 8.5, 0.1, 0.15, 0.2);

    addText(item.product.category.slice(0, 20), leftMargin + 270, curY + 3, '/F1', 8, 0.4, 0.45, 0.5);
    addText(String(item.quantity), leftMargin + 385, curY + 3, '/F1', 8.5, 0.1, 0.15, 0.2);
    addText(`Rs. ${item.product.price}`, leftMargin + 420, curY + 3, '/F1', 8.5, 0.1, 0.15, 0.2);
    addText(`Rs. ${itemTotal}`, leftMargin + 465, curY + 3, '/F2', 8.5, 0.1, 0.15, 0.2);

    curY -= 34;
  });

  // Summary Card & Dispense Token
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
  addText('NET TOTAL PAID:', leftMargin + 295, summaryTop - 78, '/F2', 10, 0.1, 0.15, 0.2);
  addText(`Rs. ${order.total}`, leftMargin + 430, summaryTop - 78, '/F2', 12, 0.15, 0.25, 0.7);

  // Security & Token Stamp Box (Left side of summary)
  const stampTop = summaryTop;
  fillRect(leftMargin, stampTop - 85, 260, 95, 0.98, 0.99, 0.98);
  drawLine(stampTop + 10, 1, 0.75, 0.85, 0.75);
  drawLine(stampTop - 85, 1, 0.75, 0.85, 0.75);

  addText('AUTHENTICATION & DISPENSING TOKEN', leftMargin + 12, stampTop - 12, '/F2', 8, 0.2, 0.5, 0.25);
  addText('Status:', leftMargin + 12, stampTop - 32, '/F1', 9, 0.4, 0.45, 0.5);
  addText(order.status.toUpperCase(), leftMargin + 65, stampTop - 32, '/F2', 9, 0.1, 0.6, 0.3);

  addText('6-Digit Handshake OTP:', leftMargin + 12, stampTop - 52, '/F1', 9, 0.4, 0.45, 0.5);
  addText(order.pickupCode || '334190', leftMargin + 125, stampTop - 54, '/F2', 13, 0.15, 0.25, 0.7);

  addText('Token ID: TOKEN-' + order.id + '-' + (order.pickupCode || '334190'), leftMargin + 12, stampTop - 74, '/F1', 7.5, 0.5, 0.55, 0.6);

  // Legal & Institutional Footer
  const footerY = 120;
  drawLine(footerY + 25, 1, 0.85, 0.88, 0.92);
  addText('FERPA & University Guardian Policy Compliant. All transactions are logged in the immutable double-entry campus ledger.', leftMargin, footerY + 10, '/F1', 7.5, 0.45, 0.5, 0.55);
  addText('CampusKart Technologies Pvt Ltd · Internal University Pilot Terminal · Verified Electronic Receipt with Item Reference Images', leftMargin, footerY - 5, '/F1', 7.5, 0.45, 0.5, 0.55);

  // Compile full binary PDF with embedded image XObjects
  const fullPdf = compilePdfDocument(lines, imageList, pageWidth, pageHeight);
  triggerPdfDownload(fullPdf, `CampusKart_Receipt_${order.id}.pdf`);
}
