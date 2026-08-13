import { z } from 'zod';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validation for the create-expense form (§6). */
export const createExpenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  vendorName: z.string().trim().min(1, 'Vendor is required'),
  description: z.string().trim().min(1, 'Description is required'),
  amount: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Amount must be greater than 0'),
});

/** Validation for the create/edit-customer form (§6). */
export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Customer name is required'),
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || EMAIL_RE.test(v), 'Enter a valid email address'),
  phone: z.string().trim().optional(),
});

/** Validation for the create-vendor form (§6). */
export const createVendorSchema = z.object({
  name: z.string().trim().min(1, 'Vendor name is required'),
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || EMAIL_RE.test(v), 'Enter a valid email address'),
  phone: z.string().trim().optional(),
});

/** Validation for the record-payment form (§6). */
export const createPaymentSchema = z.object({
  customerName: z.string().trim().min(1, 'Select a customer or vendor'),
  date: z.string().min(1, 'Payment date is required'),
  method: z.string().trim().min(1, 'Select a payment method'),
  amount: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Amount must be greater than 0'),
});

/** Validation for the petty-cash request form (§6). */
export const pettyCashRequestSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().trim().min(1, 'Description is required'),
  amount: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Amount must be greater than 0')
    .refine((n) => n <= 20000, 'Petty cash cannot exceed ₦ 20,000'),
});

/** Validation for the purchase-requisition form (§6). */
export const purchaseRequisitionSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  budgetId: z.string().trim().min(1, 'Budget is required'),
  hasLineItem: z
    .boolean()
    .refine((v) => v === true, 'At least one line item is needed'),
});

/** Validation for the create-purchase-order form (§6). */
export const createPurchaseOrderSchema = z.object({
  vendorName: z.string().trim().min(1, 'Vendor is required'),
  date: z.string().min(1, 'Date is required'),
  lineDescription: z.string().trim().min(1, 'Item description is required'),
  lineQuantity: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Quantity must be greater than 0'),
  lineUnitPrice: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Unit price must be greater than 0'),
});

/** Validation for the add-fixed-asset form (§6). */
export const createFixedAssetSchema = z.object({
  name: z.string().trim().min(1, 'Asset name is required'),
  acquisitionDate: z.string().min(1, 'Acquisition date is required'),
  acquisitionCost: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Acquisition cost must be greater than 0'),
});

/** Validation for the create-GRN form (§6). */
export const createGrnSchema = z.object({
  purchaseOrderId: z.string().trim().min(1, 'Purchase order is required'),
  receivedDate: z.string().min(1, 'Received date is required'),
  receivedBy: z.string().trim().min(1, 'Received by is required'),
  hasLineItem: z
    .boolean()
    .refine((v) => v === true, 'At least one line item is needed'),
});

/** Validation for the submit-expense-claim form (§6). */
export const createExpenseClaimSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  category: z.string().trim().min(1, 'Category is required'),
  description: z.string().trim().min(1, 'Description is required'),
  amount: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Amount must be greater than 0'),
  budgetId: z.string().trim().min(1, 'Budget is required'),
});

/** Validation for the create-payment-voucher form (§6). */
export const createPaymentVoucherSchema = z.object({
  voucherDate: z.string().min(1, 'Voucher date is required'),
  payeeName: z.string().trim().min(1, 'Payee is required'),
  description: z.string().trim().min(1, 'Description is required'),
  grossAmount: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Gross amount must be greater than 0'),
});

/** Validation for the create-journal-entry form (general ledger, §6). */
export const createJournalEntrySchema = z.object({
  date: z.string().min(1, 'Transaction date is required'),
  description: z.string().trim().min(1, 'Description is required'),
  balanced: z.boolean().refine((v) => v, 'Debits must equal credits'),
  hasAmount: z.boolean().refine((v) => v === true, 'Total debits and credits must be greater than 0'),
});

/** Validation for the vendor-prequalification application form (§6). */
export const vendorPrequalificationSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required'),
  contactPerson: z.string().trim().min(1, 'Contact person is required'),
  email: z.string().trim().min(1, 'Email is required').refine((v) => EMAIL_RE.test(v), 'Enter a valid email address'),
  phone: z.string().trim().min(1, 'Phone is required'),
});

/** Validation for the vendor-portal submit-invoice form (§6). */
export const vendorInvoiceSchema = z.object({
  purchaseOrderId: z.string().trim().min(1, 'Please select a purchase order'),
  invoiceNumber: z.string().trim().min(1, 'Invoice number is required'),
  date: z.string().min(1, 'Date is required'),
  amount: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Amount must be greater than 0'),
});

/** Validation for the create/edit-budget form (§6). */
export const createBudgetSchema = z.object({
  name: z.string().trim().min(1, 'Budget name is required'),
  period: z.string().trim().min(1, 'Please select a budget period'),
  hasLineDescriptions: z.boolean().refine((v) => v === true, 'All line items need a description'),
  hasLineAmount: z.boolean().refine((v) => v === true, 'At least one line item needs an amount'),
});

/** Validation for the create-fiscal-period form (§6). */
export const createFiscalPeriodSchema = z.object({
  name: z.string().trim().min(1, 'Period name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  fiscalYear: z.string().trim().min(1, 'Fiscal year is required'),
});

/** Validation for the create-procurement-contract form (§6). */
export const createContractSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  contractType: z.string().trim().min(1, 'Contract type is required'),
  vendorName: z.string().trim().min(1, 'Vendor is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  budgetId: z.string().trim().min(1, 'Budget is required'),
  contractValue: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Contract value must be greater than 0'),
});

/** Validation for the create-purchase-requisition (procurement) form (§6). */
export const createPurchaseRequisitionSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  hasLineItem: z
    .boolean()
    .refine((v) => v === true, 'At least one line item is needed'),
});

/** Validation for the create-payment-request (my payment requests) form (§6). */
export const createPaymentRequestSchema = z
  .object({
    paymentType: z.enum(['DIRECT_PURCHASE', 'PO_BASED']),
    date: z.string().min(1, 'Date is required'),
    payeeName: z.string().trim().min(1, 'Vendor/Payee is required'),
    invoiceNumber: z.string().trim().min(1, 'Vendor invoice number is required'),
    description: z.string().trim().min(1, 'Description is required'),
    grossAmount: z
      .number()
      .refine((n) => Number.isFinite(n) && n > 0, 'Amount must be greater than 0'),
    purchaseOrderId: z.string().trim().optional(),
  })
  .refine((v) => v.paymentType !== 'DIRECT_PURCHASE' || v.grossAmount <= 500000, {
    message: 'Direct purchases cannot exceed ₦ 500,000. Use PO-Based for larger amounts.',
    path: ['grossAmount'],
  })
  .refine((v) => v.paymentType !== 'PO_BASED' || !!v.purchaseOrderId, {
    message: 'Purchase Order is required for PO-based payments.',
    path: ['purchaseOrderId'],
  });
