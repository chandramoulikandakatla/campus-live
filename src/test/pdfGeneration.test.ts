import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  compilePdfDocument,
  downloadWalletStatementPdf,
  downloadCollegeReportPdf,
} from '@/lib/pdfStatements';
import { downloadOrderReceiptPdf } from '@/lib/pdfReceipt';
import { type Order, type StudentProfile, type ParentLimits } from '@/lib/store';

describe('PDF Generation & Image Reference System', () => {
  beforeEach(() => {
    // Mock URL and document.body for download triggering
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
  });

  it('compiles valid PDF 1.4 binary with image XObjects', () => {
    const dummyImage = {
      id: 'ImSample',
      width: 10,
      height: 10,
      bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0xff, 0xd9]),
    };

    const lines = [
      'BT /F1 12 Tf 1 0 0 1 50 700 Tm (Test Heading) Tj ET',
      'q 50 0 0 50 50 600 cm /ImSample Do Q',
    ];

    const pdfBytes = compilePdfDocument(lines, [dummyImage]);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.byteLength).toBeGreaterThan(200);

    // Verify PDF header %PDF-1.4
    const headerStr = new TextDecoder().decode(pdfBytes.slice(0, 8));
    expect(headerStr).toContain('%PDF-1.4');

    // Verify presence of XObject
    const fullContent = new TextDecoder().decode(pdfBytes);
    expect(fullContent).toContain('/XObject << /ImSample 7 0 R >>');
    expect(fullContent).toContain('/Subtype /Image');
    expect(fullContent).toContain('/Filter /DCTDecode');
  });

  it('generates official order receipt PDF with reference images without throwing', async () => {
    const mockOrder: Order = {
      id: 'ORD-TEST-001',
      studentId: 'CK2026001',
      studentName: 'Aarav Sharma',
      items: [
        {
          productId: 'f1',
          quantity: 2,
          qty: 2,
          product: {
            id: 'f1',
            sku: 'CK-001',
            name: 'Fresh Bananas',
            price: 40,
            category: 'Fruits & Fresh',
            availability: 'in-stock',
            unit: '6 pcs',
          },
        },
      ],
      total: 80,
      status: 'placed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pickupCode: '123456',
    };

    await expect(downloadOrderReceiptPdf(mockOrder)).resolves.not.toThrow();
  });

  it('generates institutional college report PDF with category images without throwing', async () => {
    const mockOrders: Order[] = [
      {
        id: 'ORD-TEST-002',
        studentId: 'CK2026001',
        studentName: 'Aarav Sharma',
        items: [
          {
            productId: 'f1',
            quantity: 1,
            qty: 1,
            product: {
              id: 'f1',
              sku: 'CK-001',
              name: 'Fresh Bananas',
              price: 40,
              category: 'Fruits & Fresh',
              availability: 'in-stock',
            },
          },
        ],
        total: 40,
        status: 'collected',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await expect(
      downloadCollegeReportPdf('Sri Chaitanya Academy', 'Hyderabad', mockOrders, 40)
    ).resolves.not.toThrow();
  });

  it('generates wallet financial statement PDF with brand crest without throwing', async () => {
    const student: StudentProfile = {
      studentId: 'CK2026001',
      fullName: 'Aarav Sharma',
      campus: 'Hyderabad Main',
      city: 'Hyderabad',
      hostel: 'Block B, Room 204',
      institution: 'Sri Chaitanya Academy',
      avatarUrl: '',
      walletBalance: 2500,
      limits: { daily: 500, monthly: 5000, approvalAbove: 1000 },
    };

    const limits: ParentLimits = {
      daily: 500,
      monthly: 5000,
      approvalAbove: 1000,
      categories: ['Fruits & Fresh', 'Snacks & Namkeen'],
      allowedFrom: '06:00',
      allowedUntil: '22:00',
      requireApprovalAbove: 1000,
    };

    await expect(
      downloadWalletStatementPdf(student, 2500, limits, [])
    ).resolves.not.toThrow();
  });
});
