// ─── Enums ──────────────────────────────────────────────────────────────────

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type NormalBalance = 'DEBIT' | 'CREDIT';
export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'VOIDED';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'VOID';
export type PaymentType = 'INCOMING' | 'OUTGOING';
export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'POS' | 'ONLINE';
export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REVERSED';
export type ExpenseCategory = 'FUEL_ENERGY' | 'MAINTENANCE' | 'TRANSPORT' | 'UTILITIES' | 'OFFICE_SUPPLIES' | 'RENT' | 'OTHER';
export type ExpenseStatus = 'DRAFT' | 'PENDING' | 'HOD_APPROVED' | 'APPROVED' | 'REJECTED';
export type BudgetStatus = 'DRAFT' | 'UNDER_REVIEW' | 'FINANCE_APPROVED' | 'ACTIVE' | 'REJECTED' | 'CLOSED';

// ─── Entities ───────────────────────────────────────────────────────────────

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId: string | null;
  description: string | null;
  isActive: boolean;
  normalBalance: NormalBalance;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  account?: Account;
  debit: number;
  credit: number;
  description: string | null;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  reference: string | null;
  referenceType: string | null;
  referenceId: string | null;
  status: JournalEntryStatus;
  totalAmount: number;
  postedBy: string | null;
  postedAt: string | null;
  createdBy: string;
  lines: JournalEntryLine[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  accountId: string | null;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string | null;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  creditedAmount: number;
  balanceDue: number;
  isWrittenOff: boolean;
  writtenOffAmount: number;
  writeOffReason: string | null;
  writtenOffAt: string | null;
  writtenOffBy: string | null;
  notes: string | null;
  terms: string | null;
  lineItems: InvoiceLineItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // NRS e-invoicing (MBS) clearance
  einvoiceStatus?: EInvoiceStatus;
  einvoiceIrn?: string | null;
  einvoiceQr?: string | null;
  einvoiceClearedAt?: string | null;
  einvoiceError?: string | null;
}

export type EInvoiceStatus =
  | "not_submitted"
  | "pending"
  | "cleared"
  | "rejected";

// ─── Credit Notes ─────────────────────────────────────────────────────────────

export type CreditNoteStatus = 'DRAFT' | 'ISSUED' | 'CANCELLED';

export interface CreditNoteLineItem {
  id: string;
  creditNoteId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  accountId: string | null;
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  referenceInvoiceId: string;
  referenceInvoiceNumber: string;
  customerName: string;
  customerEmail: string | null;
  issueDate: string;
  reason: string | null;
  status: CreditNoteStatus;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  notes: string | null;
  lineItems: CreditNoteLineItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreditNotePayload {
  referenceInvoiceId: string;
  reason?: string;
  taxRate?: number;
  notes?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    accountId?: string;
  }[];
}

export type UpdateCreditNotePayload = Partial<CreateCreditNotePayload>;

export interface CreditNoteQueryParams extends FinanceQueryParams {
  status?: CreditNoteStatus;
  customerName?: string;
}

// ─── Debit Notes ──────────────────────────────────────────────────────────────

export type DebitNoteStatus = 'DRAFT' | 'ISSUED' | 'CANCELLED';

export interface DebitNoteLineItem {
  id: string;
  debitNoteId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  accountId: string | null;
}

export interface DebitNote {
  id: string;
  debitNoteNumber: string;
  referencePvId: string;
  referencePvNumber: string;
  vendorId: string | null;
  vendorName: string;
  issueDate: string;
  reason: string | null;
  status: DebitNoteStatus;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  notes: string | null;
  lineItems: DebitNoteLineItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDebitNotePayload {
  referencePvId: string;
  reason?: string;
  taxRate?: number;
  notes?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    accountId?: string;
  }[];
}

export type UpdateDebitNotePayload = Partial<CreateDebitNotePayload>;

export interface DebitNoteQueryParams extends FinanceQueryParams {
  status?: DebitNoteStatus;
  vendorName?: string;
}

// ─── Recurring Invoices ───────────────────────────────────────────────────────

export type RecurringFrequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type RecurringInvoiceStatus = 'ACTIVE' | 'PAUSED' | 'ENDED';

export interface RecurringInvoiceLineItem {
  id: string;
  recurringInvoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  accountId: string | null;
}

export interface RecurringInvoice {
  id: string;
  name: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string | null;
  frequency: RecurringFrequency;
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  dueDays: number;
  taxRate: number;
  autoSend: boolean;
  status: RecurringInvoiceStatus;
  lastRunDate: string | null;
  occurrencesGenerated: number;
  notes: string | null;
  lineItems: RecurringInvoiceLineItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringInvoicePayload {
  name: string;
  customerId: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  dueDays?: number;
  taxRate?: number;
  autoSend?: boolean;
  notes?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    accountId?: string;
  }[];
}

export type UpdateRecurringInvoicePayload = Partial<CreateRecurringInvoicePayload>;

export interface RecurringInvoiceQueryParams extends FinanceQueryParams {
  status?: RecurringInvoiceStatus;
}

// ─── Customer Statement ───────────────────────────────────────────────────────

export type StatementLineType = 'invoice' | 'credit_note' | 'payment';

export interface StatementLine {
  date: string;
  type: StatementLineType;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface CustomerStatement {
  customer: { id: string; code: string; name: string; email: string | null };
  startDate: string | null;
  endDate: string | null;
  openingBalance: number;
  closingBalance: number;
  totals: { invoiced: number; credited: number; paid: number };
  lines: StatementLine[];
}

export interface CustomerStatementParams {
  customerId: string;
  startDate?: string;
  endDate?: string;
}

// ─── Vendor Statement ─────────────────────────────────────────────────────────

export type VendorStatementLineType = 'bill' | 'debit_note' | 'payment';

export interface VendorStatementLine {
  date: string;
  type: VendorStatementLineType;
  reference: string;
  description: string;
  charge: number;
  payment: number;
  balance: number;
}

export interface VendorStatement {
  vendor: { id: string; code: string; name: string; email: string | null };
  startDate: string | null;
  endDate: string | null;
  openingBalance: number;
  closingBalance: number;
  totals: { billed: number; debited: number; paid: number };
  lines: VendorStatementLine[];
}

export interface VendorStatementParams {
  vendorId: string;
  startDate?: string;
  endDate?: string;
}

// ─── Payment Gateway (online collections) ─────────────────────────────────────

export interface ProviderStatus { provider: string; configured: boolean; }

export type GatewayTxStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface GatewayTransaction {
  id: string;
  provider: string;
  providerRef: string | null;
  invoiceId: string | null;
  customerName: string;
  email: string | null;
  amount: number;
  currency: string;
  status: GatewayTxStatus;
  paymentId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InitiateCollectionPayload {
  invoiceId?: string;
  amount?: number;
  customerName?: string;
  email?: string;
  callbackUrl?: string;
}

export interface InitiateCollectionResult { reference: string; checkoutUrl: string; provider: string; }

// ─── Bank Feeds ───────────────────────────────────────────────────────────────

export interface BankLink {
  id: string;
  bankAccountId: string;
  provider: string;
  accountToken: string;
  lastSyncedAt: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkBankAccountPayload { bankAccountId: string; accountToken: string; }
export interface BankSyncResult { link: string; imported: number; skipped: number; total: number; }

// ─── Loans & Lease Liabilities ────────────────────────────────────────────────

export type LoanStatus = 'ACTIVE' | 'PAID_OFF' | 'CANCELLED';

export interface Loan {
  id: string;
  name: string;
  lender: string | null;
  principal: number;
  annualRate: number;
  termMonths: number;
  startDate: string;
  paymentAmount: number;
  nextPaymentDate: string;
  periodsPaid: number;
  principalRepaid: number;
  interestPaid: number;
  outstandingBalance: number;
  status: LoanStatus;
  lastPaymentDate: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanScheduleRow {
  period: number;
  date: string;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface LoanSchedule {
  loan: Loan;
  schedule: LoanScheduleRow[];
}

export interface CreateLoanPayload {
  name: string;
  lender?: string;
  principal: number;
  annualRate?: number;
  termMonths: number;
  startDate: string;
  notes?: string;
}

export interface LoanQueryParams {
  status?: LoanStatus;
  search?: string;
}

// ─── Cost Centers (Segments) ──────────────────────────────────────────────────

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCostCenterPayload {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateCostCenterPayload = Partial<CreateCostCenterPayload>;

export interface SegmentPnlRow {
  costCenterId: string | null;
  code: string | null;
  name: string;
  revenue: number;
  expenses: number;
  net: number;
}

export interface SegmentPnl {
  startDate: string | null;
  endDate: string | null;
  segments: SegmentPnlRow[];
  totals: { revenue: number; expenses: number; net: number };
}

// ─── Amortization (Prepayments & Deferred Revenue) ────────────────────────────

export type AmortizationType = 'PREPAID_EXPENSE' | 'DEFERRED_REVENUE';
export type AmortizationStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface AmortizationSchedule {
  id: string;
  name: string;
  type: AmortizationType;
  plAccountId: string;
  totalAmount: number;
  periods: number;
  amountPerPeriod: number;
  startDate: string;
  nextRunDate: string;
  periodsRecognized: number;
  recognizedAmount: number;
  status: AmortizationStatus;
  lastRunDate: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAmortizationSchedulePayload {
  name: string;
  type: AmortizationType;
  plAccountId: string;
  totalAmount: number;
  periods: number;
  startDate: string;
  notes?: string;
}

export type UpdateAmortizationSchedulePayload = Partial<CreateAmortizationSchedulePayload>;

export interface AmortizationQueryParams extends FinanceQueryParams {
  status?: AmortizationStatus;
  type?: AmortizationType;
}

// ─── Year-End Close ───────────────────────────────────────────────────────────

export interface YearEndAccountBalance {
  code: string;
  name: string;
  type: 'REVENUE' | 'EXPENSE';
  balance: number;
}

export interface YearEndPreview {
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  closed: boolean;
  closedAt: string | null;
  accounts: YearEndAccountBalance[];
}

export interface YearEndCloseRecord {
  id: string;
  year: number;
  closedAt: string;
  closedBy: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  journalEntryId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Cash-Flow Forecast ───────────────────────────────────────────────────────

export interface CashFlowForecastPeriod {
  month: string;
  label: string;
  inflow: number;
  outflow: number;
  net: number;
  closingCash: number;
}

export interface CashFlowForecast {
  openingCash: number;
  months: number;
  closingCash: number;
  totals: { inflow: number; outflow: number; net: number };
  periods: CashFlowForecastPeriod[];
}

// ─── Bad-Debt Provision ───────────────────────────────────────────────────────

export interface BadDebtProvisionBand {
  bucket: string;
  outstanding: number;
  rate: number;
  provision: number;
}

export interface BadDebtProvision {
  asOfDate: string;
  bands: BadDebtProvisionBand[];
  recommended: number;
  currentAllowance: number;
  adjustment: number;
}

export interface Payment {
  id: string;
  referenceNumber: string;
  date: string;
  type: PaymentType;
  method: PaymentMethod;
  amount: number;
  invoiceId: string | null;
  invoice?: Invoice;
  appliedAmount: number;
  unappliedAmount: number;
  customerName: string;
  description: string | null;
  status: PaymentStatus;
  accountId: string | null;
  processedBy: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAllocation {
  id: string;
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  fromCredit: boolean;
  createdAt: string;
}

export interface OnAccountCredit {
  paymentId: string;
  referenceNumber: string;
  customerName: string;
  date: string;
  unappliedAmount: number;
}

export interface CustomerCreditBalance {
  customerName: string;
  creditBalance: number;
}

export interface Refund {
  id: string;
  refundNumber: string;
  date: string;
  customerId: string | null;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  sourcePaymentId: string | null;
  reason: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyCreditPayload {
  paymentId: string;
  invoiceId: string;
  amount: number;
}

export interface CreateRefundPayload {
  sourcePaymentId: string;
  amount: number;
  date: string;
  method?: PaymentMethod;
  reason?: string;
}

export interface Expense {
  id: string;
  expenseNumber: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  vendorName: string;
  amount: number;
  status: ExpenseStatus;
  submittedBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  accountId: string | null;
  budgetId: string | null;
  receiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetLineItem {
  id: string;
  budgetId: string;
  description: string;
  category: string | null;
  accountId: string | null;
  budgetedAmount: number;
  actualAmount: number;
  committedAmount: number;
  notes: string | null;
}

export interface Budget {
  id: string;
  name: string;
  departmentId: string | null;
  department: string | null;
  category: string | null;
  period: string;
  startDate: string | null;
  endDate: string | null;
  status: BudgetStatus;
  totalBudgeted: number;
  totalActual: number;
  totalCommitted: number;
  notes: string | null;
  createdBy: string;
  approvedBy: string | null;
  lineItems: BudgetLineItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Create Payloads ────────────────────────────────────────────────────────

export interface CreateInvoicePayload {
  customerName: string;
  customerEmail?: string;
  issueDate: string;
  dueDate: string;
  taxRate?: number;
  notes?: string;
  terms?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    accountId?: string;
  }[];
}

export type UpdateInvoicePayload = Partial<CreateInvoicePayload>;

export interface CreatePaymentPayload {
  date: string;
  type: PaymentType;
  method: PaymentMethod;
  amount: number;
  invoiceId?: string;
  allocations?: { invoiceId: string; amount: number }[];
  onAccount?: boolean;
  customerName: string;
  description?: string;
  accountId?: string;
}

export interface CreateExpensePayload {
  date: string;
  description: string;
  category: ExpenseCategory;
  vendorName: string;
  amount: number;
  accountId?: string;
  budgetId?: string;
  costCenterId?: string;
  receiptUrl?: string;
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export interface CreateBudgetPayload {
  name: string;
  department?: string;
  category?: string;
  period: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  approvedBy?: string;
  lineItems: {
    description: string;
    category?: string;
    accountId?: string;
    budgetedAmount: number;
  }[];
}

export interface UpdateBudgetPayload extends Partial<CreateBudgetPayload> {
  status?: BudgetStatus;
}

export type IfrsCategory = 'OPERATING' | 'INVESTING' | 'FINANCING' | 'INCOME_TAX';

export interface CreateAccountPayload {
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  description?: string;
  isActive?: boolean;
  /** IFRS 18 statement category for revenue/expense accounts. */
  ifrsCategory?: IfrsCategory;
}

export type UpdateAccountPayload = Partial<CreateAccountPayload>;

export interface CreateJournalEntryPayload {
  date: string;
  description: string;
  reference?: string;
  referenceType?: string;
  lines: {
    accountId: string;
    debit: number;
    credit: number;
    description?: string;
  }[];
}

// ─── Query Params ───────────────────────────────────────────────────────────

export interface FinanceQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface InvoiceQueryParams extends FinanceQueryParams {
  status?: InvoiceStatus;
  customerName?: string;
}

export interface PaymentQueryParams extends FinanceQueryParams {
  type?: PaymentType;
  method?: PaymentMethod;
  status?: PaymentStatus;
}

export interface ExpenseQueryParams extends FinanceQueryParams {
  status?: ExpenseStatus;
  category?: ExpenseCategory;
}

export interface BudgetQueryParams extends FinanceQueryParams {
  status?: BudgetStatus;
  department?: string;
  period?: string;
}

export interface AccountQueryParams {
  type?: AccountType;
  isActive?: boolean;
  search?: string;
}

export interface LedgerQueryParams extends FinanceQueryParams {
  status?: JournalEntryStatus;
  accountId?: string;
  accountType?: string;
}

// ─── Paginated Response ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Report Types ────────────────────────────────────────────────────────────

export interface DashboardKpis {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  revenueChangePercent: number;
  expenseChangePercent: number;
  outstandingReceivables: number;
  cashPosition: number;
  overdueInvoiceCount: number;
  pendingExpenseApprovals: number;
}

export interface MonthlyRevenueExpense {
  month: string;
  revenue: number;
  expenses: number;
}

export interface AgingBucket {
  bucket: string;
  count: number;
  amount: number;
}

export interface DashboardAlert {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface BudgetUtilizationSummary {
  totalBudgeted: number;
  totalActual: number;
  utilizationPercent: number;
}

export interface DashboardTransaction {
  id: string;
  date: string;
  customerName: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
}

export interface DashboardData {
  kpis: DashboardKpis;
  revenueVsExpenses: MonthlyRevenueExpense[];
  invoiceAging: AgingBucket[];
  recentTransactions: DashboardTransaction[];
  budgetUtilization: BudgetUtilizationSummary;
  alerts: DashboardAlert[];
}

export interface ReportLineItem {
  accountCode: string;
  accountName: string;
  amount: number;
}

export interface ReportSection {
  items: ReportLineItem[];
  total: number;
}

/** IFRS 18 income statement: categories plus the standard's subtotals. */
export interface ProfitLossReport {
  period: { startDate: string; endDate: string };
  revenue: ReportSection;
  costOfSales: ReportSection;
  grossProfit: number;
  operatingExpenses: ReportSection;
  operatingProfit: number;
  investing: ReportSection;
  profitBeforeFinancingAndTax: number;
  financing: ReportSection;
  profitBeforeTax: number;
  incomeTax: ReportSection;
  /** Legacy alias of operatingProfit. */
  operatingIncome: number;
  netIncome: number;
}

export interface BalanceSheetReport {
  asOfDate: string;
  assets: { currentAssets: ReportLineItem[]; fixedAssets: ReportLineItem[]; totalAssets: number };
  liabilities: { currentLiabilities: ReportLineItem[]; longTermLiabilities: ReportLineItem[]; totalLiabilities: number };
  equity: { items: ReportLineItem[]; retainedEarnings: number; totalEquity: number };
  totalLiabilitiesAndEquity: number;
}

export interface CashFlowReport {
  period: { startDate: string; endDate: string };
  operating: ReportSection;
  investing: ReportSection;
  financing: ReportSection;
  netCashChange: number;
  openingCashBalance: number;
  closingCashBalance: number;
}

export interface AgedReceivablesReport {
  asOfDate: string;
  summary: AgingBucket[];
  totalOutstanding: number;
  details: {
    invoiceNumber: string;
    customerName: string;
    issueDate: string;
    dueDate: string;
    totalAmount: number;
    balanceDue: number;
    agingDays: number;
    bucket: string;
  }[];
}

export interface AgedPayablesReport {
  asOfDate: string;
  summary: {
    current: number;
    '1-30': number;
    '31-60': number;
    '61-90': number;
    '90+': number;
    total: number;
  };
  details: {
    voucherNumber: string;
    payeeName: string;
    voucherDate: string;
    dueDate: string;
    amount: number;
    agingDays: number;
    bucket: string;
  }[];
}

export interface TrialBalanceReport {
  asOfDate: string;
  rows: { code: string; name: string; type: string; debit: number; credit: number }[];
  totals: { debit: number; credit: number; difference: number };
  balanced: boolean;
}

export interface TaxSummaryReport {
  period: { startDate: string; endDate: string };
  taxCollected: number;
  byMonth: { month: string; amount: number }[];
  details: { invoiceNumber: string; customerName: string; subtotal: number; taxRate: number; taxAmount: number }[];
}

export interface ReportQueryParams {
  startDate?: string;
  endDate?: string;
}

// Generated Reports
export type ReportType = 'PROFIT_LOSS' | 'BALANCE_SHEET' | 'CASH_FLOW' | 'AGED_RECEIVABLES' | 'TAX_SUMMARY';
export type GeneratedReportStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface GeneratedReport {
  id: string;
  type: ReportType;
  title: string;
  period: string;
  status: GeneratedReportStatus;
  generatedBy: string;
  completedAt: string | null;
  fileSize: string | null;
  fileUrl: string | null;
  parameters: Record<string, unknown> | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedReportQueryParams {
  page?: number;
  limit?: number;
  type?: ReportType;
  status?: GeneratedReportStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Fixed Assets ──────────────────────────────────────────────────────────
export type AssetCategory = 'LAND' | 'BUILDING' | 'VEHICLE' | 'EQUIPMENT' | 'FURNITURE' | 'IT_EQUIPMENT' | 'PIPELINE' | 'TREATMENT_PLANT' | 'SOFTWARE' | 'OTHER';
export type DepreciationMethod = 'STRAIGHT_LINE' | 'REDUCING_BALANCE';
export type AssetStatus = 'ACTIVE' | 'DISPOSED' | 'WRITTEN_OFF' | 'UNDER_MAINTENANCE';
export type AssetCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR';

export interface FixedAsset {
  id: string; assetCode: string; name: string; description: string | null; category: AssetCategory;
  location: string | null; department: string | null; assignedTo: string | null; serialNumber: string | null;
  acquisitionDate: string; acquisitionCost: number; usefulLifeYears: number; residualValue: number;
  depreciationMethod: DepreciationMethod; accumulatedDepreciation: number; currentBookValue: number;
  status: AssetStatus; disposalDate: string | null; disposalAmount: number | null;
  condition: AssetCondition; warrantyExpiry: string | null; notes: string | null;
  receiptName?: string | null; receiptMimeType?: string | null;
  createdAt: string; updatedAt: string;
}

export type AssetEventType =
  | 'CREATED' | 'UPDATED' | 'CHECKED_OUT' | 'RETURNED' | 'EXIT_RETURN'
  | 'DISPOSED' | 'MAINTENANCE_STARTED' | 'MAINTENANCE_COMPLETED' | 'INCIDENT_REPORTED';

export interface AssetEvent {
  id: string; assetId: string; eventType: AssetEventType; description: string;
  performedBy: string; metadata: Record<string, unknown> | null;
  createdAt: string; updatedAt: string;
}

export interface CreateFixedAssetPayload {
  name: string; description?: string; category: AssetCategory; location?: string; department?: string;
  assignedTo?: string; serialNumber?: string; acquisitionDate: string; acquisitionCost: number;
  usefulLifeYears: number; residualValue?: number; depreciationMethod: DepreciationMethod;
  condition?: AssetCondition; warrantyExpiry?: string; notes?: string;
  receiptData?: string; receiptName?: string; receiptMimeType?: string;
  // Funding (credit) account for the acquisition journal entry.
  paidFromAccountId?: string;
  // Capital budget to charge the acquisition against.
  budgetId?: string;
}
export interface UpdateFixedAssetPayload extends Partial<CreateFixedAssetPayload> { status?: AssetStatus; }
export interface FixedAssetQueryParams { page?: number; limit?: number; category?: AssetCategory; status?: AssetStatus; department?: string; condition?: AssetCondition; search?: string; assigned?: 'true' | 'false'; sortBy?: string; sortOrder?: 'ASC' | 'DESC'; }

// ─── Bank Reconciliation ───────────────────────────────────────────────────
export type BankAccountType = 'CURRENT' | 'SAVINGS' | 'DOMICILIARY';
export type TransactionSource = 'MANUAL' | 'IMPORT' | 'SYSTEM';

export interface BankAccount {
  id: string; bankName: string; accountNumber: string; accountName: string; accountType: BankAccountType;
  currency: string; currentBalance: number; isActive: boolean; notes: string | null;
  createdAt: string; updatedAt: string;
}

export interface BankTransaction {
  id: string; bankAccountId: string; date: string; description: string; reference: string | null;
  debit: number; credit: number; balance: number; isReconciled: boolean;
  reconciledWith: string | null; reconciledAt: string | null; source: TransactionSource;
  createdAt: string; updatedAt: string;
}

export interface ReconciliationSummary {
  bankBalance: number; bookBalance: number; unreconciledCount: number; reconciledCount: number;
  unreconciledDebitTotal: number; unreconciledCreditTotal: number;
}

export interface CreateBankAccountPayload { bankName: string; accountNumber: string; accountName: string; accountType: BankAccountType; currency?: string; notes?: string; }
export interface CreateBankTransactionPayload { bankAccountId: string; date: string; description: string; reference?: string; debit?: number; credit?: number; balance: number; source?: TransactionSource; }
export interface BankTransactionQueryParams { page?: number; limit?: number; bankAccountId?: string; isReconciled?: boolean; startDate?: string; endDate?: string; search?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC'; }

export interface ImportBankRow { date: string; description: string; reference?: string; debit?: number; credit?: number; balance?: number; }
export interface ImportBankTransactionsPayload { bankAccountId: string; transactions: ImportBankRow[]; }
export interface ImportBankResult { imported: number; skipped: number; total: number; }

// ─── Purchase Orders ───────────────────────────────────────────────────────
export type PurchaseOrderStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderLine { id: string; purchaseOrderId: string; description: string; quantity: number; unitPrice: number; amount: number; receivedQuantity: number; }

export interface PurchaseOrder {
  id: string; poNumber: string; vendorName: string; vendorId: string | null; date: string;
  deliveryDate: string | null; status: PurchaseOrderStatus; totalAmount: number; notes: string | null;
  approvedBy: string | null; approvedAt: string | null; department: string | null; budgetId: string | null; createdBy: string;
  lineItems: PurchaseOrderLine[]; createdAt: string; updatedAt: string;
}

export interface CreatePurchaseOrderPayload {
  vendorName: string; vendorId?: string; date: string; deliveryDate?: string; department?: string; budgetId?: string; notes?: string;
  lineItems: { description: string; quantity: number; unitPrice: number; accountId?: string }[];
}
export interface UpdatePurchaseOrderPayload extends Partial<CreatePurchaseOrderPayload> { status?: PurchaseOrderStatus; }
export interface PurchaseOrderQueryParams { page?: number; limit?: number; status?: PurchaseOrderStatus; vendorName?: string; department?: string; startDate?: string; endDate?: string; search?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC'; }

// ─── Customers ──────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  paymentTermsDays: number;
  industry: string | null;
  region: string | null;
  isActive: boolean;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerPayload {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  paymentTermsDays?: number;
  industry?: string;
  region?: string;
  notes?: string;
}

export interface UpdateCustomerPayload extends Partial<CreateCustomerPayload> { isActive?: boolean; }

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  region?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Vendors ───────────────────────────────────────────────────────────────
export interface Vendor {
  id: string; vendorCode: string; name: string; contactPerson: string | null; email: string | null;
  phone: string | null; address: string | null; taxId: string | null; bankName: string | null;
  bankAccountNumber: string | null; bankAccountName: string | null; paymentTermsDays: number;
  whtCategory: string | null; defaultWhtRate: number; isActive: boolean;
  totalInvoiced: number; totalPaid: number; outstandingBalance: number; notes: string | null;
  createdAt: string; updatedAt: string;
}

export interface CreateVendorPayload {
  name: string; contactPerson?: string; email?: string; phone?: string; address?: string;
  taxId?: string; bankName?: string; bankAccountNumber?: string; bankAccountName?: string;
  paymentTermsDays?: number; whtCategory?: string; defaultWhtRate?: number; notes?: string;
}
export interface UpdateVendorPayload extends Partial<CreateVendorPayload> { isActive?: boolean; }
export interface VendorQueryParams { page?: number; limit?: number; isActive?: boolean; whtCategory?: string; search?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC'; }

// ─── Petty Cash ────────────────────────────────────────────────────────────
export type PettyCashType = 'REPLENISHMENT' | 'EXPENSE';
export type PettyCashStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PettyCashTransaction {
  id: string; transactionNo: string; date: string; type: PettyCashType; status: PettyCashStatus; description: string;
  amount: number; category: string | null; paidTo: string | null; receiptUrl: string | null;
  approvedBy: string | null; custodian: string; balanceAfter: number; notes: string | null;
  createdAt: string; updatedAt: string;
}

export interface CreatePettyCashPayload { date: string; type: PettyCashType; description: string; amount: number; category?: string; paidTo?: string; custodian: string; notes?: string; }
export interface PettyCashQueryParams { page?: number; limit?: number; type?: PettyCashType; custodian?: string; startDate?: string; endDate?: string; search?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC'; }

// ─── Fiscal Periods ────────────────────────────────────────────────────────
export type PeriodType = 'MONTH' | 'QUARTER' | 'YEAR';
export type PeriodStatus = 'OPEN' | 'CLOSED' | 'LOCKED';

export interface FiscalPeriod {
  id: string; name: string; type: PeriodType; startDate: string; endDate: string;
  status: PeriodStatus; closedBy: string | null; closedAt: string | null; fiscalYear: string;
  createdAt: string; updatedAt: string;
}

export interface CreateFiscalPeriodPayload { name: string; type: PeriodType; startDate: string; endDate: string; fiscalYear: string; }
export interface FiscalPeriodQueryParams { page?: number; limit?: number; status?: PeriodStatus; type?: PeriodType; fiscalYear?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC'; }

// ─── Audit Trail ───────────────────────────────────────────────────────────
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'APPROVE' | 'REJECT';

export interface AuditLog {
  id: string; entityType: string; entityId: string; action: AuditAction; performedBy: string;
  performedAt: string; changes: Record<string, { from: unknown; to: unknown }> | null;
  ipAddress: string | null; description: string | null;
}

export interface AuditLogQueryParams { page?: number; limit?: number; entityType?: string; entityId?: string; action?: AuditAction; performedBy?: string; startDate?: string; endDate?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC'; }

// ─── Approval Levels ────────────────────────────────────────────────────────

export interface ApprovalLevel {
  id: string;
  name: string;
  category: string;
  role: string;
  minAmount: number;
  maxAmount: number;
  level: number;
  isActive: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApprovalLevelPayload {
  name: string;
  category: string;
  role: string;
  minAmount: number;
  maxAmount: number;
  level: number;
  isActive?: boolean;
  description?: string;
}

export type UpdateApprovalLevelPayload = Partial<CreateApprovalLevelPayload>;

// ─── Vendor Prequalification ────────────────────────────────────────────────

export type PrequalificationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface PrequalificationDocument {
  name: string;
  type: string;
  url: string;
}

export interface VendorPrequalification {
  id: string;
  applicationCode: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string | null;
  website: string | null;
  rcNumber: string | null;
  taxId: string | null;
  yearsInBusiness: number | null;
  businessType: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  servicesOffered: string | null;
  annualTurnover: number | null;
  numberOfEmployees: number | null;
  documents: PrequalificationDocument[] | null;
  status: PrequalificationStatus;
  reviewNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  vendorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorPrequalificationPayload {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  website?: string;
  rcNumber?: string;
  taxId?: string;
  yearsInBusiness?: number;
  businessType?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  servicesOffered?: string;
  annualTurnover?: number;
  numberOfEmployees?: number;
  documents?: PrequalificationDocument[];
}

export interface ReviewVendorPrequalificationPayload {
  status: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
  rejectionReason?: string;
}

export interface PrequalificationQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: PrequalificationStatus;
}

export interface PrequalificationStats {
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
  total: number;
}

// ─── Purchase Requisitions ──────────────────────────────────────────────────

export type PRStatus = 'DRAFT' | 'PENDING' | 'HOD_APPROVED' | 'FINANCE_APPROVED' | 'APPROVED' | 'REJECTED' | 'CONVERTED';
export type ProcurementMethod = 'DIRECT_PURCHASE' | 'REQUEST_FOR_QUOTATION' | 'NATIONAL_COMPETITIVE_BIDDING' | 'INTERNATIONAL_COMPETITIVE_BIDDING';

export interface PurchaseRequisitionLine {
  id: string;
  requisitionId: string;
  description: string;
  unit: string | null;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedAmount: number;
  specifications: string | null;
}

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  title: string;
  description: string | null;
  department: string | null;
  departmentId: string | null;
  requestDate: string;
  requiredDate: string | null;
  status: PRStatus;
  procurementMethod: ProcurementMethod | null;
  estimatedTotal: number;
  budgetId: string | null;
  requestedBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
  justification: string | null;
  rejectionReason: string | null;
  purchaseOrderId: string | null;
  notes: string | null;
  lineItems: PurchaseRequisitionLine[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePRPayload {
  title: string;
  description?: string;
  department?: string;
  departmentId?: string;
  requestDate: string;
  requiredDate?: string;
  budgetId?: string;
  justification?: string;
  notes?: string;
  lineItems: { description: string; unit?: string; quantity: number; estimatedUnitPrice: number; specifications?: string }[];
}

export interface PRQueryParams {
  page?: number;
  limit?: number;
  status?: PRStatus;
  department?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── RFQ ────────────────────────────────────────────────────────────────────

export type RfqStatus = 'DRAFT' | 'SENT' | 'QUOTES_RECEIVED' | 'EVALUATED' | 'AWARDED' | 'CANCELLED';

export interface RfqItem {
  id: string;
  rfqId: string;
  description: string;
  unit: string | null;
  quantity: number;
  specifications: string | null;
}

export interface RfqQuote {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  totalAmount: number;
  lineQuotes: Array<{ itemId: string; unitPrice: number; amount: number }> | null;
  submittedDate: string;
  validUntil: string | null;
  technicalScore: number;
  isWinner: boolean;
  notes: string | null;
  createdAt: string;
}

export interface Rfq {
  id: string;
  rfqNumber: string;
  title: string;
  description: string | null;
  requisitionId: string | null;
  prNumber: string | null;
  issueDate: string;
  closingDate: string;
  status: RfqStatus;
  estimatedValue: number;
  invitedVendorIds: string[] | null;
  awardedVendorId: string | null;
  awardedVendorName: string | null;
  awardedAmount: number | null;
  purchaseOrderId: string | null;
  createdBy: string;
  terms: string | null;
  notes: string | null;
  items: RfqItem[];
  quotes: RfqQuote[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRfqPayload {
  title: string;
  description?: string;
  requisitionId?: string;
  prNumber?: string;
  issueDate: string;
  closingDate: string;
  estimatedValue?: number;
  invitedVendorIds?: string[];
  terms?: string;
  notes?: string;
  items: { description: string; unit?: string; quantity: number; specifications?: string }[];
}

export interface RfqQueryParams {
  page?: number;
  limit?: number;
  status?: RfqStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Procurement Contracts ──────────────────────────────────────────────────

export type ContractStatus = 'DRAFT' | 'UNDER_REVIEW' | 'LEGAL_APPROVED' | 'FINANCE_APPROVED' | 'MD_APPROVED' | 'SENT_TO_VENDOR' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'RENEWED';
export type ContractType = 'SUPPLY' | 'WORKS' | 'CONSULTANCY' | 'MSA' | 'FRAMEWORK' | 'SLA';

export interface ProcurementContract {
  id: string;
  contractNumber: string;
  title: string;
  contractType: ContractType;
  status: ContractStatus;
  vendorId: string | null;
  vendorName: string;
  vendorEmail: string | null;
  rfqId: string | null;
  rfqNumber: string | null;
  requisitionId: string | null;
  prNumber: string | null;
  purchaseOrderId: string | null;
  startDate: string;
  endDate: string;
  signedDate: string | null;
  contractValue: number;
  currency: string | null;
  paymentTermsDays: number;
  scopeOfWork: string | null;
  deliverables: string | null;
  paymentSchedule: string | null;
  penaltyClauses: string | null;
  warrantyTerms: string | null;
  terminationClauses: string | null;
  specialConditions: string | null;
  slaMetrics: Array<{ metric: string; target: string; penalty: string }> | null;
  createdBy: string;
  legalApprovedBy: string | null;
  financeApprovedBy: string | null;
  mdApprovedBy: string | null;
  rejectionReason: string | null;
  notes: string | null;
  attachments: Array<{ name: string; url: string; uploadedAt: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractPayload {
  title: string;
  contractType: ContractType;
  vendorName: string;
  vendorId?: string;
  vendorEmail?: string;
  rfqId?: string;
  rfqNumber?: string;
  requisitionId?: string;
  prNumber?: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  paymentTermsDays?: number;
  scopeOfWork?: string;
  deliverables?: string;
  paymentSchedule?: string;
  penaltyClauses?: string;
  warrantyTerms?: string;
  terminationClauses?: string;
  specialConditions?: string;
  slaMetrics?: Array<{ metric: string; target: string; penalty: string }>;
  budgetId?: string;
  notes?: string;
}

export interface ContractQueryParams {
  page?: number;
  limit?: number;
  status?: ContractStatus;
  contractType?: ContractType;
  vendorName?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── GRN (Goods Received Note) ──────────────────────────────────────────────

export type GrnStatus = 'DRAFT' | 'CONFIRMED' | 'DISPUTED';

export interface GrnLine {
  id: string; grnId: string; description: string;
  itemType: "PRODUCT" | "RAW_MATERIAL" | "STORE_ITEM" | null; itemId: string | null;
  orderedQuantity: number;
  receivedQuantity: number; rejectedQuantity: number; unit: string | null;
  condition: string; remarks: string | null;
}

export interface Grn {
  id: string; grnNumber: string; purchaseOrderId: string; poNumber: string;
  vendorName: string; vendorId: string | null; receivedDate: string;
  status: GrnStatus; receivedBy: string; inspectedBy: string | null;
  deliveryNoteRef: string | null; waybillNumber: string | null;
  remarks: string | null; disputeReason: string | null;
  landedCost: number;
  attachments: Array<{ name: string; url: string; type: string }>;
  lineItems: GrnLine[]; createdAt: string; updatedAt: string;
}

export interface CreateGrnPayload {
  purchaseOrderId: string; poNumber: string; vendorName: string;
  vendorId?: string; receivedDate: string; receivedBy: string;
  inspectedBy?: string; deliveryNoteRef?: string; waybillNumber?: string;
  remarks?: string; landedCost?: number;
  lineItems: { description: string; itemType?: "PRODUCT" | "RAW_MATERIAL" | "STORE_ITEM"; itemId?: string; unitCost?: number; orderedQuantity: number; receivedQuantity: number; rejectedQuantity?: number; unit?: string; condition: string; remarks?: string }[];
}

export interface GrnQueryParams {
  page?: number; limit?: number; status?: GrnStatus; poNumber?: string; search?: string;
}

// ─── Payment Voucher ────────────────────────────────────────────────────────

export type PVStatus = 'DRAFT' | 'PENDING' | 'HOD_APPROVED' | 'MD_APPROVED' | 'FINANCE_REVIEWED' | 'PROCESSED' | 'REJECTED';

export interface PaymentVoucher {
  id: string; pvNumber: string; voucherDate: string; dueDate: string | null; payeeName: string;
  vendorId: string | null; purchaseOrderId: string | null; poNumber: string | null;
  grnId: string | null; grnNumber: string | null; contractId: string | null;
  contractNumber: string | null; vendorInvoiceNumber: string | null;
  grossAmount: number; whtRate: number; whtAmount: number; vatAmount: number;
  netAmount: number; paymentMethod: string | null;
  status: PVStatus; description: string;
  preparedBy: string; checkedBy: string | null;
  financeApprovedBy: string | null; financeApprovedAt: string | null;
  mdApprovedBy: string | null; mdApprovedAt: string | null;
  rejectionReason: string | null; notes: string | null;
  poVerified: boolean; grnVerified: boolean; invoiceVerified: boolean;
  documentChecklist: Array<{ document: string; submitted: boolean; verified: boolean; verifiedBy?: string }>;
  attachments: Array<{ name: string; url: string; type: string }>;
  createdAt: string; updatedAt: string;
}

export interface CreatePVPayload {
  voucherDate: string; dueDate?: string; payeeName: string; vendorId?: string;
  purchaseOrderId?: string; poNumber?: string; grnId?: string; grnNumber?: string;
  contractId?: string; contractNumber?: string; vendorInvoiceNumber?: string;
  grossAmount: number; whtRate?: number; vatAmount?: number;
  paymentMethod?: string; paymentType?: 'DIRECT_PURCHASE' | 'PO_BASED';
  description: string; notes?: string;
}

export interface PVQueryParams {
  page?: number; limit?: number; status?: PVStatus; search?: string;
}
