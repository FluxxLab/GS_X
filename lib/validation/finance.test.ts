import { describe, it, expect } from 'vitest';
import {
  createExpenseSchema,
  createCustomerSchema,
  createVendorSchema,
  createPaymentSchema,
  pettyCashRequestSchema,
  purchaseRequisitionSchema,
  createPurchaseOrderSchema,
  createFixedAssetSchema,
  createGrnSchema,
  createExpenseClaimSchema,
  createPaymentVoucherSchema,
  createJournalEntrySchema,
  vendorPrequalificationSchema,
  vendorInvoiceSchema,
  createBudgetSchema,
  createFiscalPeriodSchema,
  createContractSchema,
  createPurchaseRequisitionSchema,
  createPaymentRequestSchema,
} from './finance';
import { zodFieldErrors } from './helpers';

describe('createExpenseSchema', () => {
  const valid = { date: '2026-06-21', category: 'OFFICE', vendorName: 'Acme', description: 'Paper', amount: 1500 };

  it('accepts a valid expense', () => {
    expect(createExpenseSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a zero/negative amount', () => {
    const r = createExpenseSchema.safeParse({ ...valid, amount: 0 });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodFieldErrors(r.error).amount).toContain('greater than 0');
  });

  it('rejects a NaN amount (empty/invalid input)', () => {
    expect(createExpenseSchema.safeParse({ ...valid, amount: Number.NaN }).success).toBe(false);
  });

  it('requires vendor and description', () => {
    const r = createExpenseSchema.safeParse({ ...valid, vendorName: '  ', description: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.vendorName).toBeTruthy();
      expect(e.description).toBeTruthy();
    }
  });
});

describe('createCustomerSchema', () => {
  it('accepts a name with no email/phone', () => {
    expect(createCustomerSchema.safeParse({ name: 'Blue Corp' }).success).toBe(true);
  });

  it('requires a name', () => {
    const r = createCustomerSchema.safeParse({ name: '  ' });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodFieldErrors(r.error).name).toBeTruthy();
  });

  it('rejects a malformed email but allows an empty one', () => {
    expect(createCustomerSchema.safeParse({ name: 'X', email: 'bad' }).success).toBe(false);
    expect(createCustomerSchema.safeParse({ name: 'X', email: '' }).success).toBe(true);
  });
});

describe('createVendorSchema', () => {
  it('accepts a name with no email', () => {
    expect(createVendorSchema.safeParse({ name: 'ABC Suppliers' }).success).toBe(true);
  });

  it('requires a name', () => {
    const r = createVendorSchema.safeParse({ name: '  ' });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodFieldErrors(r.error).name).toBeTruthy();
  });

  it('rejects a malformed email', () => {
    expect(createVendorSchema.safeParse({ name: 'X', email: 'bad' }).success).toBe(false);
  });
});

describe('createPaymentSchema', () => {
  const valid = { customerName: 'Blue Corp', date: '2026-06-21', method: 'CASH', amount: 5000 };

  it('accepts a valid payment', () => {
    expect(createPaymentSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a customer, date and method', () => {
    const r = createPaymentSchema.safeParse({ customerName: '', date: '', method: '', amount: 5000 });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.customerName).toBeTruthy();
      expect(e.date).toBeTruthy();
      expect(e.method).toBeTruthy();
    }
  });

  it('rejects a zero/NaN amount', () => {
    expect(createPaymentSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
    expect(createPaymentSchema.safeParse({ ...valid, amount: Number.NaN }).success).toBe(false);
  });
});

describe('pettyCashRequestSchema', () => {
  const valid = { date: '2026-06-21', description: 'Office supplies', amount: 5000 };

  it('accepts a valid request', () => {
    expect(pettyCashRequestSchema.safeParse(valid).success).toBe(true);
  });

  it('requires date and description', () => {
    const r = pettyCashRequestSchema.safeParse({ date: '', description: '', amount: 5000 });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.date).toBeTruthy();
      expect(e.description).toBeTruthy();
    }
  });

  it('rejects a zero amount and amounts over the cap', () => {
    expect(pettyCashRequestSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
    expect(pettyCashRequestSchema.safeParse({ ...valid, amount: 25000 }).success).toBe(false);
  });
});

describe('purchaseRequisitionSchema', () => {
  const valid = { title: 'Office chairs', budgetId: 'bud-1', hasLineItem: true };

  it('accepts a valid requisition', () => {
    expect(purchaseRequisitionSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a title and budget', () => {
    const r = purchaseRequisitionSchema.safeParse({ title: '', budgetId: '', hasLineItem: true });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.title).toBeTruthy();
      expect(e.budgetId).toBeTruthy();
    }
  });

  it('requires at least one line item', () => {
    const r = purchaseRequisitionSchema.safeParse({ ...valid, hasLineItem: false });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodFieldErrors(r.error).hasLineItem).toBeTruthy();
  });
});

describe('createPurchaseOrderSchema', () => {
  const valid = { vendorName: 'ABC Suppliers', date: '2026-06-21', lineDescription: 'Pipes', lineQuantity: 5, lineUnitPrice: 2000 };

  it('accepts a valid purchase order', () => {
    expect(createPurchaseOrderSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a vendor and date', () => {
    const r = createPurchaseOrderSchema.safeParse({ ...valid, vendorName: '', date: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.vendorName).toBeTruthy();
      expect(e.date).toBeTruthy();
    }
  });

  it('rejects a zero/NaN quantity or unit price', () => {
    expect(createPurchaseOrderSchema.safeParse({ ...valid, lineQuantity: 0 }).success).toBe(false);
    expect(createPurchaseOrderSchema.safeParse({ ...valid, lineUnitPrice: Number.NaN }).success).toBe(false);
  });
});

describe('createFixedAssetSchema', () => {
  const valid = { name: 'Toyota Hilux', acquisitionDate: '2026-06-21', acquisitionCost: 15000000 };

  it('accepts a valid asset', () => {
    expect(createFixedAssetSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a name and acquisition date', () => {
    const r = createFixedAssetSchema.safeParse({ ...valid, name: '  ', acquisitionDate: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.name).toBeTruthy();
      expect(e.acquisitionDate).toBeTruthy();
    }
  });

  it('rejects a zero/NaN acquisition cost', () => {
    expect(createFixedAssetSchema.safeParse({ ...valid, acquisitionCost: 0 }).success).toBe(false);
    expect(createFixedAssetSchema.safeParse({ ...valid, acquisitionCost: Number.NaN }).success).toBe(false);
  });
});

describe('createGrnSchema', () => {
  const valid = { purchaseOrderId: 'po-1', receivedDate: '2026-06-21', receivedBy: 'John Doe', hasLineItem: true };

  it('accepts a valid GRN', () => {
    expect(createGrnSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a PO, received date and received by', () => {
    const r = createGrnSchema.safeParse({ purchaseOrderId: '', receivedDate: '', receivedBy: '', hasLineItem: true });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.purchaseOrderId).toBeTruthy();
      expect(e.receivedDate).toBeTruthy();
      expect(e.receivedBy).toBeTruthy();
    }
  });

  it('requires at least one line item', () => {
    const r = createGrnSchema.safeParse({ ...valid, hasLineItem: false });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodFieldErrors(r.error).hasLineItem).toBeTruthy();
  });
});

describe('createExpenseClaimSchema', () => {
  const valid = { date: '2026-06-21', category: 'OFFICE', description: 'Paper', amount: 1500, budgetId: 'bud-1' };

  it('accepts a valid claim', () => {
    expect(createExpenseClaimSchema.safeParse(valid).success).toBe(true);
  });

  it('requires date, category, description and budget', () => {
    const r = createExpenseClaimSchema.safeParse({ ...valid, date: '', category: '', description: '', budgetId: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.date).toBeTruthy();
      expect(e.category).toBeTruthy();
      expect(e.description).toBeTruthy();
      expect(e.budgetId).toBeTruthy();
    }
  });

  it('rejects a zero/NaN amount', () => {
    expect(createExpenseClaimSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
    expect(createExpenseClaimSchema.safeParse({ ...valid, amount: Number.NaN }).success).toBe(false);
  });
});

describe('createPaymentVoucherSchema', () => {
  const valid = { voucherDate: '2026-06-21', payeeName: 'ABC Suppliers', description: 'Supply of pipes', grossAmount: 250000 };

  it('accepts a valid voucher', () => {
    expect(createPaymentVoucherSchema.safeParse(valid).success).toBe(true);
  });

  it('requires date, payee and description', () => {
    const r = createPaymentVoucherSchema.safeParse({ voucherDate: '', payeeName: '', description: '', grossAmount: 250000 });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.voucherDate).toBeTruthy();
      expect(e.payeeName).toBeTruthy();
      expect(e.description).toBeTruthy();
    }
  });

  it('rejects a zero/NaN gross amount', () => {
    expect(createPaymentVoucherSchema.safeParse({ ...valid, grossAmount: 0 }).success).toBe(false);
    expect(createPaymentVoucherSchema.safeParse({ ...valid, grossAmount: Number.NaN }).success).toBe(false);
  });
});

describe('createJournalEntrySchema', () => {
  const valid = { date: '2026-06-21', description: 'Rent payment', balanced: true, hasAmount: true };

  it('accepts a valid balanced entry', () => {
    expect(createJournalEntrySchema.safeParse(valid).success).toBe(true);
  });

  it('requires date and description', () => {
    const r = createJournalEntrySchema.safeParse({ ...valid, date: '', description: '  ' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.date).toBeTruthy();
      expect(e.description).toBeTruthy();
    }
  });

  it('rejects an unbalanced entry', () => {
    const r = createJournalEntrySchema.safeParse({ ...valid, balanced: false });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodFieldErrors(r.error).balanced).toContain('Debits must equal credits');
  });

  it('rejects an entry with no amounts', () => {
    expect(createJournalEntrySchema.safeParse({ ...valid, hasAmount: false }).success).toBe(false);
  });
});

describe('vendorPrequalificationSchema', () => {
  const valid = { companyName: 'ABC Water Ltd', contactPerson: 'Jane Doe', email: 'jane@abc.com', phone: '+2348012345678' };

  it('accepts a valid application', () => {
    expect(vendorPrequalificationSchema.safeParse(valid).success).toBe(true);
  });

  it('requires company, contact, email and phone', () => {
    const r = vendorPrequalificationSchema.safeParse({ companyName: '', contactPerson: '', email: '', phone: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.companyName).toBeTruthy();
      expect(e.contactPerson).toBeTruthy();
      expect(e.email).toBeTruthy();
      expect(e.phone).toBeTruthy();
    }
  });

  it('rejects a malformed email', () => {
    expect(vendorPrequalificationSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });
});

describe('vendorInvoiceSchema', () => {
  const valid = { purchaseOrderId: 'po-1', invoiceNumber: 'INV-001', date: '2026-06-21', amount: 250000 };

  it('accepts a valid invoice', () => {
    expect(vendorInvoiceSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a PO, invoice number and date', () => {
    const r = vendorInvoiceSchema.safeParse({ purchaseOrderId: '', invoiceNumber: '', date: '', amount: 250000 });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.purchaseOrderId).toBeTruthy();
      expect(e.invoiceNumber).toBeTruthy();
      expect(e.date).toBeTruthy();
    }
  });

  it('rejects a zero/NaN amount', () => {
    expect(vendorInvoiceSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
    expect(vendorInvoiceSchema.safeParse({ ...valid, amount: Number.NaN }).success).toBe(false);
  });
});

describe('createBudgetSchema', () => {
  const valid = { name: 'Ops Q2 2026', period: 'Q2 2026', hasLineDescriptions: true, hasLineAmount: true };

  it('accepts a valid budget', () => {
    expect(createBudgetSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a name and period', () => {
    const r = createBudgetSchema.safeParse({ ...valid, name: '  ', period: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.name).toBeTruthy();
      expect(e.period).toBeTruthy();
    }
  });

  it('requires line descriptions and at least one amount', () => {
    expect(createBudgetSchema.safeParse({ ...valid, hasLineDescriptions: false }).success).toBe(false);
    expect(createBudgetSchema.safeParse({ ...valid, hasLineAmount: false }).success).toBe(false);
  });
});

describe('createFiscalPeriodSchema', () => {
  const valid = { name: 'March 2026', startDate: '2026-03-01', endDate: '2026-03-31', fiscalYear: '2025/2026' };

  it('accepts a valid period', () => {
    expect(createFiscalPeriodSchema.safeParse(valid).success).toBe(true);
  });

  it('requires name, dates and fiscal year', () => {
    const r = createFiscalPeriodSchema.safeParse({ name: '  ', startDate: '', endDate: '', fiscalYear: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.name).toBeTruthy();
      expect(e.startDate).toBeTruthy();
      expect(e.endDate).toBeTruthy();
      expect(e.fiscalYear).toBeTruthy();
    }
  });
});

describe('createContractSchema', () => {
  const valid = { title: 'Pipe supply', contractType: 'SUPPLY', vendorName: 'ABC Suppliers', startDate: '2026-01-01', endDate: '2026-12-31', budgetId: 'bud-1', contractValue: 2500000 };

  it('accepts a valid contract', () => {
    expect(createContractSchema.safeParse(valid).success).toBe(true);
  });

  it('requires title, type, vendor, dates and budget', () => {
    const r = createContractSchema.safeParse({ ...valid, title: '', contractType: '', vendorName: '', startDate: '', endDate: '', budgetId: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.title).toBeTruthy();
      expect(e.contractType).toBeTruthy();
      expect(e.vendorName).toBeTruthy();
      expect(e.startDate).toBeTruthy();
      expect(e.endDate).toBeTruthy();
      expect(e.budgetId).toBeTruthy();
    }
  });

  it('rejects a zero/NaN contract value', () => {
    expect(createContractSchema.safeParse({ ...valid, contractValue: 0 }).success).toBe(false);
    expect(createContractSchema.safeParse({ ...valid, contractValue: Number.NaN }).success).toBe(false);
  });
});

describe('createPurchaseRequisitionSchema', () => {
  const valid = { title: 'Office chairs', hasLineItem: true };

  it('accepts a valid requisition', () => {
    expect(createPurchaseRequisitionSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a title', () => {
    const r = createPurchaseRequisitionSchema.safeParse({ title: '  ', hasLineItem: true });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodFieldErrors(r.error).title).toBeTruthy();
  });

  it('requires at least one line item', () => {
    const r = createPurchaseRequisitionSchema.safeParse({ ...valid, hasLineItem: false });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodFieldErrors(r.error).hasLineItem).toBeTruthy();
  });
});

describe('createPaymentRequestSchema', () => {
  const validDirect = { paymentType: 'DIRECT_PURCHASE', date: '2026-06-21', payeeName: 'ABC Suppliers', invoiceNumber: 'INV-1', description: 'Pipes', grossAmount: 150000 };
  const validPo = { paymentType: 'PO_BASED', date: '2026-06-21', payeeName: 'ABC Suppliers', invoiceNumber: 'INV-1', description: 'Pipes', grossAmount: 800000, purchaseOrderId: 'po-1' };

  it('accepts a valid direct-purchase request', () => {
    expect(createPaymentRequestSchema.safeParse(validDirect).success).toBe(true);
  });

  it('accepts a valid PO-based request', () => {
    expect(createPaymentRequestSchema.safeParse(validPo).success).toBe(true);
  });

  it('requires date, payee, invoice, description', () => {
    const r = createPaymentRequestSchema.safeParse({ ...validDirect, date: '', payeeName: '', invoiceNumber: '', description: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.date).toBeTruthy();
      expect(e.payeeName).toBeTruthy();
      expect(e.invoiceNumber).toBeTruthy();
      expect(e.description).toBeTruthy();
    }
  });

  it('rejects a zero/NaN gross amount', () => {
    expect(createPaymentRequestSchema.safeParse({ ...validDirect, grossAmount: 0 }).success).toBe(false);
    expect(createPaymentRequestSchema.safeParse({ ...validDirect, grossAmount: Number.NaN }).success).toBe(false);
  });

  it('caps direct purchases at ₦ 500,000', () => {
    const r = createPaymentRequestSchema.safeParse({ ...validDirect, grossAmount: 600000 });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodFieldErrors(r.error).grossAmount).toBeTruthy();
  });

  it('requires a purchase order for PO-based payments', () => {
    const r = createPaymentRequestSchema.safeParse({ ...validPo, purchaseOrderId: undefined });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodFieldErrors(r.error).purchaseOrderId).toBeTruthy();
  });
});
