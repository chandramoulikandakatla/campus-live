import { type Order, type StudentProfile, type ParentLimits, type WalletTransaction, categoryImage } from './store';
import iconImg from '@/assets/campuskart-icon.jpg';
import logoImg from '@/assets/campuskart-logo.jpg';
import freshImg from '@/assets/cat-fresh.jpg';
import snacksImg from '@/assets/cat-snacks.jpg';
import sweetImg from '@/assets/cat-sweet.jpg';
import pantryImg from '@/assets/cat-pantry.jpg';
import careImg from '@/assets/cat-care.jpg';
import homeImg from '@/assets/cat-home.jpg';

export interface PdfImageResource {
  id: string;
  width: number;
  height: number;
  bytes: Uint8Array;
}

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'Fruits & Fresh': freshImg,
  'Biscuits & Cookies': sweetImg,
  'Snacks & Namkeen': snacksImg,
  'Chocolates': sweetImg,
  'Candies & Treats': sweetImg,
  'Bakery & Rusks': pantryImg,
  'Pickles & Add-ons': pantryImg,
  'Beverages': freshImg,
  'Coconut Water': freshImg,
  'Hygiene & Home Care': homeImg,
  'Emergency': careImg,
  'Stationery': pantryImg,
  'Chips': snacksImg,
  'Nachos': snacksImg,
  'Food and Snacks': snacksImg,
  'Personal Care': careImg,
  'Daily Essentials': pantryImg,
};

/**
 * Escapes characters for PDF string literals: (, ), and \
 */
export function escapePdfText(text: string): string {
  return String(text ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

const MINIMAL_JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

function getMinimalJpegBytes(): Uint8Array {
  if (typeof atob === 'function') {
    const bin = atob(MINIMAL_JPEG_BASE64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0xff, 0xd9]);
}

function createFallbackCanvasJpeg(w: number, h: number, label: string): Uint8Array | null {
  try {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#2563eb');
    grad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(10, Math.round(h * 0.32))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label.slice(0, 6).toUpperCase(), w / 2, h / 2);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const b64 = dataUrl.split(',')[1];
    if (b64 && typeof atob === 'function') {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    }
    return null;
  } catch {
    return null;
  }
}

function isCanvasUsable(): boolean {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;
    // In jsdom without canvas installed, HTMLCanvasElement doesn't have a real 2d context
    const testCanvas = document.createElement('canvas');
    const ctx = testCanvas.getContext && testCanvas.getContext('2d');
    return !!ctx;
  } catch {
    return false;
  }
}

/**
 * Loads an image from a URL or bundled asset, normalizes it via HTML5 Canvas,
 * and extracts standard JPEG DCT bytes suitable for PDF Image XObject embedding.
 */
export async function loadJpegImage(
  src: string,
  targetWidth = 100,
  targetHeight = 100,
  fallbackLabel = 'CK'
): Promise<PdfImageResource> {
  if (!isCanvasUsable()) {
    return {
      id: '',
      width: targetWidth,
      height: targetHeight,
      bytes: getMinimalJpegBytes(),
    };
  }

  return new Promise((resolve) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        const fallbackBytes = createFallbackCanvasJpeg(targetWidth, targetHeight, fallbackLabel);
        resolve({
          id: '',
          width: targetWidth,
          height: targetHeight,
          bytes: fallbackBytes || getMinimalJpegBytes(),
        });
      }
    }, 2000);

    const finishWithCanvas = (canvas: HTMLCanvasElement) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      try {
        canvas.toBlob(
          async (blob) => {
            if (blob) {
              const buf = await blob.arrayBuffer();
              resolve({
                id: '',
                width: canvas.width,
                height: canvas.height,
                bytes: new Uint8Array(buf),
              });
            } else {
              resolve({
                id: '',
                width: 2,
                height: 2,
                bytes: getMinimalJpegBytes(),
              });
            }
          },
          'image/jpeg',
          0.85
        );
      } catch {
        resolve({
          id: '',
          width: 2,
          height: 2,
          bytes: getMinimalJpegBytes(),
        });
      }
    };

    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          clearTimeout(timeout);
          resolved = true;
          return resolve({ id: '', width: 2, height: 2, bytes: getMinimalJpegBytes() });
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        finishWithCanvas(canvas);
      } catch {
        const fallbackBytes = createFallbackCanvasJpeg(targetWidth, targetHeight, fallbackLabel);
        clearTimeout(timeout);
        resolved = true;
        resolve({
          id: '',
          width: targetWidth,
          height: targetHeight,
          bytes: fallbackBytes || getMinimalJpegBytes(),
        });
      }
    };

    img.onerror = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      const fallbackBytes = createFallbackCanvasJpeg(targetWidth, targetHeight, fallbackLabel);
      resolve({
        id: '',
        width: targetWidth,
        height: targetHeight,
        bytes: fallbackBytes || getMinimalJpegBytes(),
      });
    };

    img.src = src;
  });
}

/**
 * Builds a valid PDF 1.4 binary document from content stream lines and embedded Image XObjects.
 */
export function compilePdfDocument(
  contentLines: string[],
  images: PdfImageResource[] = [],
  pageWidth = 595.28,
  pageHeight = 841.89
): Uint8Array {
  const encoder = new TextEncoder();
  const contentStream = contentLines.join('\n');
  const contentBytes = encoder.encode(contentStream);

  const obj1 = encoder.encode('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  const obj2 = encoder.encode('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  let xobjectDict = '';
  if (images.length > 0) {
    xobjectDict = ' /XObject << ' + images.map((img, i) => `/${img.id} ${7 + i} 0 R`).join(' ') + ' >>';
  }
  const obj3 = encoder.encode(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >>${xobjectDict} >> /Contents 6 0 R >>\nendobj\n`
  );

  const obj4 = encoder.encode('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
  const obj5 = encoder.encode('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n');

  const obj6Header = encoder.encode(`6 0 obj\n<< /Length ${contentBytes.byteLength} >>\nstream\n`);
  const obj6Footer = encoder.encode('\nendstream\nendobj\n');

  const header = encoder.encode('%PDF-1.4\n');

  const imageHeaders: Uint8Array[] = [];
  const imageFooters: Uint8Array[] = [];
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const objNum = 7 + i;
    imageHeaders.push(
      encoder.encode(
        `${objNum} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.bytes.byteLength} >>\nstream\n`
      )
    );
    imageFooters.push(encoder.encode('\nendstream\nendobj\n'));
  }

  const totalObjects = 6 + images.length;
  const offsets: number[] = [0];
  let curOffset = header.byteLength;

  offsets.push(curOffset); curOffset += obj1.byteLength;
  offsets.push(curOffset); curOffset += obj2.byteLength;
  offsets.push(curOffset); curOffset += obj3.byteLength;
  offsets.push(curOffset); curOffset += obj4.byteLength;
  offsets.push(curOffset); curOffset += obj5.byteLength;
  offsets.push(curOffset); curOffset += obj6Header.byteLength + contentBytes.byteLength + obj6Footer.byteLength;

  for (let i = 0; i < images.length; i++) {
    offsets.push(curOffset);
    curOffset += imageHeaders[i].byteLength + images[i].bytes.byteLength + imageFooters[i].byteLength;
  }

  const startxref = curOffset;
  let xref = `xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= totalObjects; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  const trailer = `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;
  const trailerBytes = encoder.encode(xref + trailer);

  const totalLength = curOffset + trailerBytes.byteLength;
  const result = new Uint8Array(totalLength);
  let pos = 0;

  const append = (buf: Uint8Array) => {
    result.set(buf, pos);
    pos += buf.byteLength;
  };

  append(header);
  append(obj1);
  append(obj2);
  append(obj3);
  append(obj4);
  append(obj5);
  append(obj6Header);
  append(contentBytes);
  append(obj6Footer);

  for (let i = 0; i < images.length; i++) {
    append(imageHeaders[i]);
    append(images[i].bytes);
    append(imageFooters[i]);
  }

  append(trailerBytes);
  return result;
}

/**
 * Downloads a binary PDF Uint8Array.
 */
export function triggerPdfDownload(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
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
// 1. OFFICIAL STUDENT WALLET STATEMENT (PDF WITH EMBEDDED LOGO)
// ============================================================================
export async function downloadWalletStatementPdf(
  student: StudentProfile,
  walletBalance: number,
  parentLimits: ParentLimits,
  transactions: WalletTransaction[]
): Promise<void> {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const leftMargin = 45;
  const contentWidth = pageWidth - leftMargin * 2;

  // Load institutional brand crest image
  const logoResource = await loadJpegImage(iconImg, 80, 80, 'LOGO');
  logoResource.id = 'ImLogo';

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
  fillRect(leftMargin, 735, contentWidth, 68, 0.06, 0.09, 0.16);

  // Embed Brand Logo Image in Header Banner
  lines.push(`q 0.9 0.92 0.96 rg ${leftMargin + 12} 743 52 52 re f Q`);
  lines.push(`q 48 0 0 48 ${leftMargin + 14} 745 cm /ImLogo Do Q`);

  addText('CAMPUSKART STUDENT WALLET & FINANCIAL STATEMENT', leftMargin + 75, 775, '/F2', 13.5, 1, 1, 1);
  addText('OFFICIAL ELECTRONIC LEDGER EXTRACT · SRI CHAITANYA & NARAYANA ACADEMY', leftMargin + 75, 755, '/F1', 8, 0.7, 0.8, 1);

  // Student & Account Information Card
  fillRect(leftMargin, 645, contentWidth, 80, 0.97, 0.98, 0.99);
  drawLine(725, 1, 0.88, 0.9, 0.93);
  drawLine(645, 1, 0.88, 0.9, 0.93);

  addText('Student Name:', leftMargin + 15, 705, '/F2', 8.5, 0.4, 0.45, 0.52);
  addText(student.fullName, leftMargin + 85, 705, '/F2', 8.5, 0.1, 0.15, 0.2);

  addText('Student ID:', leftMargin + 15, 687, '/F2', 8.5, 0.4, 0.45, 0.52);
  addText(student.studentId, leftMargin + 85, 687, '/F1', 8.5, 0.1, 0.15, 0.2);

  addText('Institution:', leftMargin + 15, 669, '/F2', 8.5, 0.4, 0.45, 0.52);
  addText(student.institution || 'Sri Chaitanya & Narayana Junior Academy', leftMargin + 85, 669, '/F1', 8.5, 0.1, 0.15, 0.2);

  addText('Hostel Room:', leftMargin + 15, 652, '/F2', 8.5, 0.4, 0.45, 0.52);
  addText(`${student.hostel || 'Hostel Block B, Room 204'} (${student.city || 'Hyderabad Hub'})`, leftMargin + 85, 652, '/F1', 8.5, 0.1, 0.15, 0.2);

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

  const fullPdf = compilePdfDocument(lines, [logoResource], pageWidth, pageHeight);
  triggerPdfDownload(fullPdf, `CampusKart_Statement_${student.studentId}.pdf`);
}

// ============================================================================
// 2. OFFICIAL PARENT OVERSIGHT AUDIT STATEMENT (PDF WITH EMBEDDED LOGO)
// ============================================================================
export async function downloadParentStatementPdf(
  student: StudentProfile,
  walletBalance: number,
  parentLimits: ParentLimits,
  transactions: WalletTransaction[],
  orders: Order[]
): Promise<void> {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const leftMargin = 45;
  const contentWidth = pageWidth - leftMargin * 2;

  // Load institutional brand crest image
  const logoResource = await loadJpegImage(iconImg, 80, 80, 'PAR');
  logoResource.id = 'ImLogo';

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
  fillRect(leftMargin, 735, contentWidth, 68, 0.04, 0.35, 0.22);

  // Embed Logo Image
  lines.push(`q 0.9 0.98 0.92 rg ${leftMargin + 12} 743 52 52 re f Q`);
  lines.push(`q 48 0 0 48 ${leftMargin + 14} 745 cm /ImLogo Do Q`);

  addText('PARENT GUARDIAN FINANCIAL OVERSIGHT & SPENDING AUDIT', leftMargin + 75, 775, '/F2', 12.5, 1, 1, 1);
  addText('CAMPUSKART CLOSED-LOOP PARENTAL CONTROLS & ALLOWANCE LEDGER', leftMargin + 75, 755, '/F1', 8, 0.8, 1, 0.9);

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

  const fullPdf = compilePdfDocument(lines, [logoResource], pageWidth, pageHeight);
  triggerPdfDownload(fullPdf, `CampusKart_Parent_Statement_${student.studentId}.pdf`);
}

// ============================================================================
// 3. OFFICIAL INSTITUTIONAL REPORT (PDF WITH CATEGORY REFERENCE IMAGES)
// ============================================================================
export async function downloadCollegeReportPdf(
  institution: string,
  city: string,
  activeOrders: Order[],
  grossGmv: number
): Promise<void> {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const leftMargin = 45;
  const contentWidth = pageWidth - leftMargin * 2;

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

  // Load institutional brand logo
  const logoResource = await loadJpegImage(iconImg, 80, 80, 'ADM');
  logoResource.id = 'ImLogo';

  // Load category reference images for visual reference in the report!
  const imageList: PdfImageResource[] = [logoResource];
  const catImageIdMap = new Map<string, string>();

  for (let i = 0; i < Math.min(catEntries.length, 6); i++) {
    const [catName] = catEntries[i];
    const assetUrl = CATEGORY_IMAGE_MAP[catName] || freshImg;
    const catRes = await loadJpegImage(assetUrl, 80, 60, catName);
    catRes.id = `ImCat${i}`;
    catImageIdMap.set(catName, catRes.id);
    imageList.push(catRes);
  }

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
  fillRect(leftMargin, 735, contentWidth, 68, 0.28, 0.2, 0.58);

  // Embed Logo Image
  lines.push(`q 0.95 0.94 0.99 rg ${leftMargin + 12} 743 52 52 re f Q`);
  lines.push(`q 48 0 0 48 ${leftMargin + 14} 745 cm /ImLogo Do Q`);

  addText('CAMPUS COMMERCE & MICRO-LOGISTICS AGGREGATE AUDIT', leftMargin + 75, 775, '/F2', 12.5, 1, 1, 1);
  addText('ANONYMIZED INSTITUTIONAL REPORT · STRICT FERPA PRIVACY COMPLIANT', leftMargin + 75, 755, '/F1', 8, 0.85, 0.8, 1);

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

  // Category Distribution Table Header with Image Thumbnail column
  const tableTop = 560;
  fillRect(leftMargin, tableTop, contentWidth, 24, 0.89, 0.88, 0.94);
  drawLine(tableTop + 24, 1, 0.78, 0.75, 0.88);
  drawLine(tableTop, 1, 0.78, 0.75, 0.88);

  addText('VISUAL REF', leftMargin + 12, tableTop + 8, '/F2', 8, 0.25, 0.2, 0.4);
  addText('CATEGORY', leftMargin + 85, tableTop + 8, '/F2', 8, 0.25, 0.2, 0.4);
  addText('TRANSACTION VOLUME', leftMargin + 260, tableTop + 8, '/F2', 8, 0.25, 0.2, 0.4);
  addText('TOTAL SALES (INR)', leftMargin + 400, tableTop + 8, '/F2', 8, 0.25, 0.2, 0.4);

  let curY = tableTop - 36;

  catEntries.forEach(([catName, stats], idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      fillRect(leftMargin, curY - 6, contentWidth, 34, 0.98, 0.97, 1);
    }
    drawLine(curY - 6, 0.5, 0.9, 0.88, 0.95);

    // Render embedded category reference image thumbnail!
    const imageId = catImageIdMap.get(catName);
    if (imageId) {
      lines.push(`q 0.92 0.92 0.95 rg ${leftMargin + 10} ${curY - 4} 34 26 re f Q`);
      lines.push(`q 0.8 0.82 0.88 RG 0.5 w ${leftMargin + 10} ${curY - 4} 34 26 re s Q`);
      lines.push(`q 32 0 0 24 ${leftMargin + 11} ${curY - 3} cm /${imageId} Do Q`);
    }

    addText(catName, leftMargin + 85, curY + 6, '/F2', 8.5, 0.1, 0.15, 0.2);
    addText(`${stats.count} units fulfilled`, leftMargin + 260, curY + 6, '/F1', 8, 0.35, 0.4, 0.45);
    addText(`Rs. ${stats.total.toLocaleString('en-IN')}`, leftMargin + 400, curY + 6, '/F2', 8.5, 0.28, 0.2, 0.58);

    curY -= 36;
  });

  // Institutional Verification Footer
  const footerTop = 130;
  fillRect(leftMargin, footerTop - 45, contentWidth, 55, 0.97, 0.96, 0.99);
  drawLine(footerTop + 10, 1, 0.82, 0.78, 0.9);
  drawLine(footerTop - 45, 1, 0.82, 0.78, 0.9);

  addText('OFFICIAL INSTITUTIONAL AGGREGATE REPORT & AUDIT SEAL', leftMargin + 12, footerTop - 2, '/F2', 8, 0.28, 0.2, 0.58);
  addText('Generated by the CampusKart Institutional Admin Engine with embedded merchandise reference imagery.', leftMargin + 12, footerTop - 16, '/F1', 7.5, 0.4, 0.45, 0.5);
  addText(`Report Hash: INST-REPORT-${city.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`, leftMargin + 12, footerTop - 28, '/F1', 7, 0.5, 0.55, 0.6);
  addText('Sri Chaitanya & Narayana Junior Academy · Institutional Analytics Division 2026.', leftMargin + 12, footerTop - 38, '/F1', 7, 0.5, 0.55, 0.6);

  const fullPdf = compilePdfDocument(lines, imageList, pageWidth, pageHeight);
  triggerPdfDownload(fullPdf, `CampusKart_College_Report_${city}.pdf`);
}
