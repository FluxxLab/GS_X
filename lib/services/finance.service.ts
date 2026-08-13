import { apiClient } from '../api/client';
import type {
  Account,
  AccountQueryParams,
  CreateAccountPayload,
  UpdateAccountPayload,
  JournalEntry,
  LedgerQueryParams,
  CreateJournalEntryPayload,
  Invoice,
  InvoiceQueryParams,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  CreditNote,
  CreditNoteQueryParams,
  CreateCreditNotePayload,
  UpdateCreditNotePayload,
  RecurringInvoice,
  RecurringInvoiceQueryParams,
  CreateRecurringInvoicePayload,
  UpdateRecurringInvoicePayload,
  DebitNote,
  DebitNoteQueryParams,
  CreateDebitNotePayload,
  UpdateDebitNotePayload,
  Payment,
  PaymentQueryParams,
  CreatePaymentPayload,
  PaymentAllocation,
  OnAccountCredit,
  CustomerCreditBalance,
  ApplyCreditPayload,
  Refund,
  CreateRefundPayload,
  Expense,
  ExpenseQueryParams,
  CreateExpensePayload,
  UpdateExpensePayload,
  Budget,
  BudgetQueryParams,
  CreateBudgetPayload,
  UpdateBudgetPayload,
  PaginatedResponse,
  ReportQueryParams,
  DashboardData,
  ProfitLossReport,
  BalanceSheetReport,
  CashFlowReport,
  AgedReceivablesReport,
  AgedPayablesReport,
  TrialBalanceReport,
  CustomerStatement,
  CustomerStatementParams,
  VendorStatement,
  VendorStatementParams,
  CashFlowForecast,
  ProviderStatus,
  GatewayTransaction,
  InitiateCollectionPayload,
  InitiateCollectionResult,
  BankLink,
  LinkBankAccountPayload,
  BankSyncResult,
  Loan,
  LoanSchedule,
  LoanQueryParams,
  CreateLoanPayload,
  CostCenter,
  CreateCostCenterPayload,
  UpdateCostCenterPayload,
  SegmentPnl,
  YearEndPreview,
  YearEndCloseRecord,
  AmortizationSchedule,
  AmortizationQueryParams,
  CreateAmortizationSchedulePayload,
  UpdateAmortizationSchedulePayload,
  BadDebtProvision,
  TaxSummaryReport,
  GeneratedReport,
  GeneratedReportQueryParams,
  FixedAsset,
  AssetEvent,
  FixedAssetQueryParams,
  CreateFixedAssetPayload,
  UpdateFixedAssetPayload,
  BankAccount,
  CreateBankAccountPayload,
  BankTransaction,
  BankTransactionQueryParams,
  CreateBankTransactionPayload,
  ImportBankTransactionsPayload,
  ImportBankResult,
  ReconciliationSummary,
  PurchaseOrder,
  PurchaseOrderQueryParams,
  CreatePurchaseOrderPayload,
  UpdatePurchaseOrderPayload,
  Customer,
  CustomerQueryParams,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  Vendor,
  VendorQueryParams,
  CreateVendorPayload,
  UpdateVendorPayload,
  PettyCashTransaction,
  PettyCashQueryParams,
  CreatePettyCashPayload,
  FiscalPeriod,
  FiscalPeriodQueryParams,
  CreateFiscalPeriodPayload,
  AuditLog,
  AuditLogQueryParams,
  VendorPrequalification,
  CreateVendorPrequalificationPayload,
  ReviewVendorPrequalificationPayload,
  PrequalificationQueryParams,
  PrequalificationStats,
  ApprovalLevel,
  CreateApprovalLevelPayload,
  UpdateApprovalLevelPayload,
  PurchaseRequisition,
  PRQueryParams,
  CreatePRPayload,
  Rfq,
  RfqQueryParams,
  CreateRfqPayload,
  ProcurementContract,
  ContractQueryParams,
  CreateContractPayload,
  Grn,
  GrnQueryParams,
  CreateGrnPayload,
  PaymentVoucher,
  PVQueryParams,
  CreatePVPayload,
} from '../types/finance';

const PATH = '/finance';

export const financeService = {
  // ─── Accounts ───────────────────────────────────────────────────────────────

  getAccounts(params?: AccountQueryParams): Promise<Account[]> {
    return apiClient.get<Account[]>(
      `${PATH}/accounts`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  createAccount(data: CreateAccountPayload): Promise<Account> {
    return apiClient.post<Account>(`${PATH}/accounts`, data);
  },

  updateAccount(id: string, data: UpdateAccountPayload): Promise<Account> {
    return apiClient.patch<Account>(`${PATH}/accounts/${id}`, data);
  },

  deleteAccount(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/accounts/${id}`);
  },

  // ─── Ledger ─────────────────────────────────────────────────────────────────

  getJournalEntries(params?: LedgerQueryParams): Promise<PaginatedResponse<JournalEntry>> {
    return apiClient.get<PaginatedResponse<JournalEntry>>(
      `${PATH}/ledger/entries`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getJournalEntry(id: string): Promise<JournalEntry> {
    return apiClient.get<JournalEntry>(`${PATH}/ledger/entries/${id}`);
  },

  createJournalEntry(data: CreateJournalEntryPayload): Promise<JournalEntry> {
    return apiClient.post<JournalEntry>(`${PATH}/ledger/entries`, data);
  },

  postJournalEntry(id: string): Promise<JournalEntry> {
    return apiClient.patch<JournalEntry>(`${PATH}/ledger/entries/${id}/post`);
  },

  voidJournalEntry(id: string): Promise<JournalEntry> {
    return apiClient.patch<JournalEntry>(`${PATH}/ledger/entries/${id}/void`);
  },

  // ─── Invoices ───────────────────────────────────────────────────────────────

  getInvoices(params?: InvoiceQueryParams): Promise<PaginatedResponse<Invoice>> {
    return apiClient.get<PaginatedResponse<Invoice>>(
      `${PATH}/invoices`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getInvoice(id: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`${PATH}/invoices/${id}`);
  },

  createInvoice(data: CreateInvoicePayload): Promise<Invoice> {
    return apiClient.post<Invoice>(`${PATH}/invoices`, data);
  },

  updateInvoice(id: string, data: UpdateInvoicePayload): Promise<Invoice> {
    return apiClient.patch<Invoice>(`${PATH}/invoices/${id}`, data);
  },

  deleteInvoice(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/invoices/${id}`);
  },

  sendInvoice(id: string): Promise<Invoice> {
    return apiClient.patch<Invoice>(`${PATH}/invoices/${id}/send`);
  },

  voidInvoice(id: string): Promise<Invoice> {
    return apiClient.patch<Invoice>(`${PATH}/invoices/${id}/void`);
  },
  sendInvoiceReminder(id: string): Promise<{ message: string; daysOverdue: number }> {
    return apiClient.patch<{ message: string; daysOverdue: number }>(`${PATH}/invoices/${id}/reminder`);
  },
  writeOffInvoice(id: string, reason: string): Promise<Invoice> {
    return apiClient.patch<Invoice>(`${PATH}/invoices/${id}/write-off`, { reason });
  },
  downloadInvoicePdf(id: string): Promise<Blob> {
    return apiClient.getBlob(`${PATH}/invoices/${id}/pdf`);
  },

  // ─── Credit Notes ─────────────────────────────────────────────────────────────

  getCreditNotes(params?: CreditNoteQueryParams): Promise<PaginatedResponse<CreditNote>> {
    return apiClient.get<PaginatedResponse<CreditNote>>(
      `${PATH}/credit-notes`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getCreditNote(id: string): Promise<CreditNote> {
    return apiClient.get<CreditNote>(`${PATH}/credit-notes/${id}`);
  },

  createCreditNote(data: CreateCreditNotePayload): Promise<CreditNote> {
    return apiClient.post<CreditNote>(`${PATH}/credit-notes`, data);
  },

  updateCreditNote(id: string, data: UpdateCreditNotePayload): Promise<CreditNote> {
    return apiClient.patch<CreditNote>(`${PATH}/credit-notes/${id}`, data);
  },

  deleteCreditNote(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/credit-notes/${id}`);
  },

  issueCreditNote(id: string): Promise<CreditNote> {
    return apiClient.patch<CreditNote>(`${PATH}/credit-notes/${id}/issue`);
  },

  cancelCreditNote(id: string): Promise<CreditNote> {
    return apiClient.patch<CreditNote>(`${PATH}/credit-notes/${id}/cancel`);
  },

  // ─── Debit Notes ──────────────────────────────────────────────────────────────

  getDebitNotes(params?: DebitNoteQueryParams): Promise<PaginatedResponse<DebitNote>> {
    return apiClient.get<PaginatedResponse<DebitNote>>(
      `${PATH}/debit-notes`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getDebitNote(id: string): Promise<DebitNote> {
    return apiClient.get<DebitNote>(`${PATH}/debit-notes/${id}`);
  },

  createDebitNote(data: CreateDebitNotePayload): Promise<DebitNote> {
    return apiClient.post<DebitNote>(`${PATH}/debit-notes`, data);
  },

  updateDebitNote(id: string, data: UpdateDebitNotePayload): Promise<DebitNote> {
    return apiClient.patch<DebitNote>(`${PATH}/debit-notes/${id}`, data);
  },

  deleteDebitNote(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/debit-notes/${id}`);
  },

  issueDebitNote(id: string): Promise<DebitNote> {
    return apiClient.patch<DebitNote>(`${PATH}/debit-notes/${id}/issue`);
  },

  cancelDebitNote(id: string): Promise<DebitNote> {
    return apiClient.patch<DebitNote>(`${PATH}/debit-notes/${id}/cancel`);
  },

  // ─── Recurring Invoices ───────────────────────────────────────────────────────

  getRecurringInvoices(params?: RecurringInvoiceQueryParams): Promise<PaginatedResponse<RecurringInvoice>> {
    return apiClient.get<PaginatedResponse<RecurringInvoice>>(
      `${PATH}/recurring-invoices`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getRecurringInvoice(id: string): Promise<RecurringInvoice> {
    return apiClient.get<RecurringInvoice>(`${PATH}/recurring-invoices/${id}`);
  },

  createRecurringInvoice(data: CreateRecurringInvoicePayload): Promise<RecurringInvoice> {
    return apiClient.post<RecurringInvoice>(`${PATH}/recurring-invoices`, data);
  },

  updateRecurringInvoice(id: string, data: UpdateRecurringInvoicePayload): Promise<RecurringInvoice> {
    return apiClient.patch<RecurringInvoice>(`${PATH}/recurring-invoices/${id}`, data);
  },

  deleteRecurringInvoice(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/recurring-invoices/${id}`);
  },

  pauseRecurringInvoice(id: string): Promise<RecurringInvoice> {
    return apiClient.patch<RecurringInvoice>(`${PATH}/recurring-invoices/${id}/pause`);
  },

  resumeRecurringInvoice(id: string): Promise<RecurringInvoice> {
    return apiClient.patch<RecurringInvoice>(`${PATH}/recurring-invoices/${id}/resume`);
  },

  runRecurringInvoiceNow(id: string): Promise<{ invoice: Invoice; schedule: RecurringInvoice }> {
    return apiClient.post<{ invoice: Invoice; schedule: RecurringInvoice }>(`${PATH}/recurring-invoices/${id}/run-now`);
  },

  // ─── Payments ───────────────────────────────────────────────────────────────

  getPayments(params?: PaymentQueryParams): Promise<PaginatedResponse<Payment>> {
    return apiClient.get<PaginatedResponse<Payment>>(
      `${PATH}/payments`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getPayment(id: string): Promise<Payment> {
    return apiClient.get<Payment>(`${PATH}/payments/${id}`);
  },

  createPayment(data: CreatePaymentPayload): Promise<Payment> {
    return apiClient.post<Payment>(`${PATH}/payments`, data);
  },

  getPaymentAllocations(id: string): Promise<PaymentAllocation[]> {
    return apiClient.get<PaymentAllocation[]>(`${PATH}/payments/${id}/allocations`);
  },

  // ─── Cash application & refunds ───────────────────────────────────────────────

  getOnAccountCredits(customerName?: string): Promise<OnAccountCredit[]> {
    return apiClient.get<OnAccountCredit[]>(
      `${PATH}/payments/on-account`,
      customerName ? { customerName } : undefined,
    );
  },

  getCustomerCreditBalance(customerName: string): Promise<CustomerCreditBalance> {
    return apiClient.get<CustomerCreditBalance>(`${PATH}/payments/credit-balance`, { customerName });
  },

  applyCredit(data: ApplyCreditPayload): Promise<PaymentAllocation> {
    return apiClient.post<PaymentAllocation>(`${PATH}/payments/apply-credit`, data);
  },

  getRefunds(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Refund>> {
    return apiClient.get<PaginatedResponse<Refund>>(
      `${PATH}/payments/refunds`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  createRefund(data: CreateRefundPayload): Promise<Refund> {
    return apiClient.post<Refund>(`${PATH}/payments/refunds`, data);
  },

  // ─── Expenses ───────────────────────────────────────────────────────────────

  getExpenses(params?: ExpenseQueryParams): Promise<PaginatedResponse<Expense>> {
    return apiClient.get<PaginatedResponse<Expense>>(
      `${PATH}/expenses`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getExpense(id: string): Promise<Expense> {
    return apiClient.get<Expense>(`${PATH}/expenses/${id}`);
  },

  createExpense(data: CreateExpensePayload): Promise<Expense> {
    return apiClient.post<Expense>(`${PATH}/expenses`, data);
  },

  updateExpense(id: string, data: UpdateExpensePayload): Promise<Expense> {
    return apiClient.patch<Expense>(`${PATH}/expenses/${id}`, data);
  },

  deleteExpense(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/expenses/${id}`);
  },

  hodApproveExpense(id: string): Promise<Expense> {
    return apiClient.patch<Expense>(`${PATH}/expenses/${id}/hod-approve`);
  },
  approveExpense(id: string): Promise<Expense> {
    return apiClient.patch<Expense>(`${PATH}/expenses/${id}/approve`);
  },

  rejectExpense(id: string, reason?: string): Promise<Expense> {
    return apiClient.patch<Expense>(`${PATH}/expenses/${id}/reject`, { reason });
  },

  // ─── Budgets ────────────────────────────────────────────────────────────────

  getBudgets(params?: BudgetQueryParams): Promise<PaginatedResponse<Budget>> {
    return apiClient.get<PaginatedResponse<Budget>>(
      `${PATH}/budgets`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getBudget(id: string): Promise<Budget> {
    return apiClient.get<Budget>(`${PATH}/budgets/${id}`);
  },

  createBudget(data: CreateBudgetPayload): Promise<Budget> {
    return apiClient.post<Budget>(`${PATH}/budgets`, data);
  },

  updateBudget(id: string, data: UpdateBudgetPayload): Promise<Budget> {
    return apiClient.patch<Budget>(`${PATH}/budgets/${id}`, data);
  },

  deleteBudget(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/budgets/${id}`);
  },
  activateBudget(id: string): Promise<Budget> {
    return apiClient.patch<Budget>(`${PATH}/budgets/${id}/activate`);
  },
  closeBudget(id: string): Promise<Budget> {
    return apiClient.patch<Budget>(`${PATH}/budgets/${id}/close`);
  },

  // ─── Reports ─────────────────────────────────────────────────────────────────

  async getDashboard(params?: ReportQueryParams): Promise<DashboardData> {
    // The backend returns the KPI metrics flat, alongside the chart/table data;
    // the UI expects them nested under `kpis`. Adapt the shape here so the two
    // agree in one place.
    const r = await apiClient.get<Record<string, unknown>>(
      '/finance/reports/dashboard',
      params as Record<string, string>,
    );
    const n = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);

    // Invoice aging arrives as an object keyed by bucket; the chart wants an
    // array of { bucket, amount, count } with the display labels it colours by.
    const agingObj = (r.invoiceAging as Record<string, number> | undefined) ?? {};
    const invoiceAging: DashboardData["invoiceAging"] = [
      ["current", "Current"],
      ["1-30", "1-30 Days"],
      ["31-60", "31-60 Days"],
      ["61-90", "61-90 Days"],
      ["90+", "90+ Days"],
    ].map(([key, label]) => ({ bucket: label, amount: n(agingObj[key]), count: 0 }));

    // Alerts use { type, message, severity }; the panel wants { type, title, description }.
    const alerts: DashboardData["alerts"] = (
      (r.alerts as Array<{ type?: string; message?: string; severity?: string }>) ?? []
    ).map((a) => ({
      type: a.severity === "info" ? "info" : a.severity === "success" ? "success" : "warning",
      title: String(a.type ?? "Alert").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
      description: String(a.message ?? ""),
    }));

    return {
      kpis: {
        totalRevenue: n(r.totalRevenue),
        totalExpenses: n(r.totalExpenses),
        netIncome: n(r.netIncome),
        revenueChangePercent: n(r.revenueChangePercent),
        expenseChangePercent: n(r.expenseChangePercent),
        outstandingReceivables: n(r.outstandingReceivables),
        cashPosition: n(r.cashPosition),
        overdueInvoiceCount: n(r.overdueInvoiceCount),
        pendingExpenseApprovals: n(r.pendingExpenseApprovals),
      },
      revenueVsExpenses: (r.revenueVsExpenses as DashboardData["revenueVsExpenses"]) ?? [],
      invoiceAging,
      recentTransactions: (r.recentTransactions as DashboardData["recentTransactions"]) ?? [],
      budgetUtilization:
        (r.budgetUtilization as DashboardData["budgetUtilization"]) ?? {
          totalBudgeted: 0,
          totalActual: 0,
          utilizationPercent: 0,
        },
      alerts,
    };
  },
  getProfitLoss(params?: ReportQueryParams): Promise<ProfitLossReport> {
    return apiClient.get<ProfitLossReport>('/finance/reports/profit-loss', params as Record<string, string>);
  },
  getBalanceSheet(params?: { asOfDate?: string }): Promise<BalanceSheetReport> {
    return apiClient.get<BalanceSheetReport>('/finance/reports/balance-sheet', params as Record<string, string>);
  },
  getCashFlow(params?: ReportQueryParams): Promise<CashFlowReport> {
    return apiClient.get<CashFlowReport>('/finance/reports/cash-flow', params as Record<string, string>);
  },
  getAgedReceivables(params?: { asOfDate?: string }): Promise<AgedReceivablesReport> {
    return apiClient.get<AgedReceivablesReport>('/finance/reports/aged-receivables', params as Record<string, string>);
  },
  getAgedPayables(params?: { asOfDate?: string }): Promise<AgedPayablesReport> {
    return apiClient.get<AgedPayablesReport>('/finance/reports/aged-payables', params as Record<string, string>);
  },
  getTrialBalance(params?: { asOfDate?: string }): Promise<TrialBalanceReport> {
    return apiClient.get<TrialBalanceReport>('/finance/reports/trial-balance', params as Record<string, string>);
  },
  getCustomerStatement(params: CustomerStatementParams): Promise<CustomerStatement> {
    return apiClient.get<CustomerStatement>('/finance/reports/customer-statement', {
      customerId: params.customerId,
      startDate: params.startDate,
      endDate: params.endDate,
    });
  },
  getVendorStatement(params: VendorStatementParams): Promise<VendorStatement> {
    return apiClient.get<VendorStatement>('/finance/reports/vendor-statement', {
      vendorId: params.vendorId,
      startDate: params.startDate,
      endDate: params.endDate,
    });
  },
  getCashFlowForecast(params?: { months?: number }): Promise<CashFlowForecast> {
    return apiClient.get<CashFlowForecast>('/finance/reports/cash-flow-forecast', params as Record<string, number>);
  },
  getAmortizationSchedules(params?: AmortizationQueryParams): Promise<PaginatedResponse<AmortizationSchedule>> {
    return apiClient.get<PaginatedResponse<AmortizationSchedule>>(
      '/finance/amortization',
      params as Record<string, string | number | boolean | undefined>,
    );
  },
  createAmortizationSchedule(data: CreateAmortizationSchedulePayload): Promise<AmortizationSchedule> {
    return apiClient.post<AmortizationSchedule>('/finance/amortization', data);
  },
  updateAmortizationSchedule(id: string, data: UpdateAmortizationSchedulePayload): Promise<AmortizationSchedule> {
    return apiClient.patch<AmortizationSchedule>(`/finance/amortization/${id}`, data);
  },
  deleteAmortizationSchedule(id: string): Promise<void> {
    return apiClient.delete<void>(`/finance/amortization/${id}`);
  },
  cancelAmortizationSchedule(id: string): Promise<AmortizationSchedule> {
    return apiClient.patch<AmortizationSchedule>(`/finance/amortization/${id}/cancel`);
  },
  runAmortizationNow(id: string): Promise<AmortizationSchedule> {
    return apiClient.post<AmortizationSchedule>(`/finance/amortization/${id}/run-now`);
  },

  // ─── Payment gateway + bank feeds ─────────────────────────────────────────────
  getPaymentGatewayStatus(): Promise<ProviderStatus> {
    return apiClient.get<ProviderStatus>('/finance/payment-gateway/status');
  },
  getGatewayTransactions(): Promise<GatewayTransaction[]> {
    return apiClient.get<GatewayTransaction[]>('/finance/payment-gateway/transactions');
  },
  initiateCollection(data: InitiateCollectionPayload): Promise<InitiateCollectionResult> {
    return apiClient.post<InitiateCollectionResult>('/finance/payment-gateway/collect', data);
  },
  getBankFeedStatus(): Promise<ProviderStatus> {
    return apiClient.get<ProviderStatus>('/finance/bank-feeds/status');
  },
  getBankLinks(): Promise<BankLink[]> {
    return apiClient.get<BankLink[]>('/finance/bank-feeds/links');
  },
  linkBankAccount(data: LinkBankAccountPayload): Promise<BankLink> {
    return apiClient.post<BankLink>('/finance/bank-feeds/links', data);
  },
  unlinkBankAccount(id: string): Promise<void> {
    return apiClient.delete<void>(`/finance/bank-feeds/links/${id}`);
  },
  syncBankLink(id: string): Promise<BankSyncResult> {
    return apiClient.post<BankSyncResult>(`/finance/bank-feeds/links/${id}/sync`);
  },

  getLoans(params?: LoanQueryParams): Promise<Loan[]> {
    return apiClient.get<Loan[]>('/finance/loans', params as Record<string, string | undefined>);
  },
  getLoan(id: string): Promise<Loan> {
    return apiClient.get<Loan>(`/finance/loans/${id}`);
  },
  getLoanSchedule(id: string): Promise<LoanSchedule> {
    return apiClient.get<LoanSchedule>(`/finance/loans/${id}/schedule`);
  },
  createLoan(data: CreateLoanPayload): Promise<Loan> {
    return apiClient.post<Loan>('/finance/loans', data);
  },
  deleteLoan(id: string): Promise<void> {
    return apiClient.delete<void>(`/finance/loans/${id}`);
  },
  cancelLoan(id: string): Promise<Loan> {
    return apiClient.patch<Loan>(`/finance/loans/${id}/cancel`);
  },
  runLoanNow(id: string): Promise<Loan> {
    return apiClient.post<Loan>(`/finance/loans/${id}/run-now`);
  },

  getCostCenters(params?: { search?: string; isActive?: boolean }): Promise<CostCenter[]> {
    return apiClient.get<CostCenter[]>('/finance/cost-centers', params as Record<string, string | boolean | undefined>);
  },
  createCostCenter(data: CreateCostCenterPayload): Promise<CostCenter> {
    return apiClient.post<CostCenter>('/finance/cost-centers', data);
  },
  updateCostCenter(id: string, data: UpdateCostCenterPayload): Promise<CostCenter> {
    return apiClient.patch<CostCenter>(`/finance/cost-centers/${id}`, data);
  },
  deleteCostCenter(id: string): Promise<void> {
    return apiClient.delete<void>(`/finance/cost-centers/${id}`);
  },
  getSegmentPnl(params?: { startDate?: string; endDate?: string }): Promise<SegmentPnl> {
    return apiClient.get<SegmentPnl>('/finance/reports/segment-pnl', params as Record<string, string>);
  },

  getYearEndCloses(): Promise<YearEndCloseRecord[]> {
    return apiClient.get<YearEndCloseRecord[]>('/finance/year-end');
  },
  getYearEndPreview(year: number): Promise<YearEndPreview> {
    return apiClient.get<YearEndPreview>(`/finance/year-end/${year}/preview`);
  },
  closeYear(year: number): Promise<YearEndCloseRecord> {
    return apiClient.post<YearEndCloseRecord>(`/finance/year-end/${year}/close`);
  },
  getBadDebtProvision(params?: { asOfDate?: string }): Promise<BadDebtProvision> {
    return apiClient.get<BadDebtProvision>('/finance/reports/bad-debt-provision', params as Record<string, string>);
  },
  postBadDebtProvision(asOfDate?: string): Promise<BadDebtProvision> {
    return apiClient.post<BadDebtProvision>('/finance/reports/bad-debt-provision', { asOfDate });
  },
  getTaxSummary(params?: ReportQueryParams): Promise<TaxSummaryReport> {
    return apiClient.get<TaxSummaryReport>('/finance/reports/tax-summary', params as Record<string, string>);
  },

  // Generated Reports
  getGeneratedReports(params?: GeneratedReportQueryParams): Promise<PaginatedResponse<GeneratedReport>> {
    return apiClient.get<PaginatedResponse<GeneratedReport>>('/finance/reports/generated', params as Record<string, string>);
  },
  generateReport(data: { type: string; title: string; period: string; parameters?: Record<string, unknown> }): Promise<GeneratedReport> {
    return apiClient.post<GeneratedReport>('/finance/reports/generate', data);
  },
  deleteGeneratedReport(id: string): Promise<void> {
    return apiClient.delete<void>(`/finance/reports/generated/${id}`);
  },

  // ─── Fixed Assets ──────────────────────────────────────────────────────────

  getFixedAssets(params?: FixedAssetQueryParams): Promise<PaginatedResponse<FixedAsset>> {
    return apiClient.get<PaginatedResponse<FixedAsset>>(
      `${PATH}/fixed-assets`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getFixedAsset(id: string): Promise<FixedAsset> {
    return apiClient.get<FixedAsset>(`${PATH}/fixed-assets/${id}`);
  },

  getFixedAssetReceipt(id: string): Promise<{ receiptName: string | null; receiptMimeType: string | null; receiptData: string | null }> {
    return apiClient.get(`${PATH}/fixed-assets/${id}/receipt`);
  },

  getFixedAssetEvents(id: string): Promise<AssetEvent[]> {
    return apiClient.get<AssetEvent[]>(`${PATH}/fixed-assets/${id}/events`);
  },

  createFixedAsset(data: CreateFixedAssetPayload): Promise<FixedAsset> {
    return apiClient.post<FixedAsset>(`${PATH}/fixed-assets`, data);
  },

  updateFixedAsset(id: string, data: UpdateFixedAssetPayload): Promise<FixedAsset> {
    return apiClient.patch<FixedAsset>(`${PATH}/fixed-assets/${id}`, data);
  },

  disposeFixedAsset(id: string, data: { disposalDate: string; disposalAmount: number }): Promise<{ asset: FixedAsset; gainLoss: number; gainOrLoss: string }> {
    return apiClient.patch<{ asset: FixedAsset; gainLoss: number; gainOrLoss: string }>(`${PATH}/fixed-assets/${id}/dispose`, data);
  },

  runDepreciation(data: { month: number; year: number }): Promise<void> {
    return apiClient.post<void>(`${PATH}/fixed-assets/run-depreciation`, data);
  },

  // ─── Bank Accounts & Reconciliation ──────────────────────────────────────

  getBankAccounts(): Promise<BankAccount[]> {
    return apiClient.get<BankAccount[]>(`${PATH}/bank-accounts`);
  },

  createBankAccount(data: CreateBankAccountPayload): Promise<BankAccount> {
    return apiClient.post<BankAccount>(`${PATH}/bank-accounts`, data);
  },

  updateBankAccount(id: string, data: Partial<CreateBankAccountPayload>): Promise<BankAccount> {
    return apiClient.patch<BankAccount>(`${PATH}/bank-accounts/${id}`, data);
  },

  getBankTransactions(params?: BankTransactionQueryParams): Promise<PaginatedResponse<BankTransaction>> {
    return apiClient.get<PaginatedResponse<BankTransaction>>(
      `${PATH}/bank-transactions`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  createBankTransaction(data: CreateBankTransactionPayload): Promise<BankTransaction> {
    return apiClient.post<BankTransaction>(`${PATH}/bank-transactions`, data);
  },

  importBankTransactions(data: ImportBankTransactionsPayload): Promise<ImportBankResult> {
    return apiClient.post<ImportBankResult>(`${PATH}/bank-transactions/import`, data);
  },

  reconcileTransaction(id: string, reconciledWith: string): Promise<BankTransaction> {
    return apiClient.patch<BankTransaction>(`${PATH}/bank-transactions/${id}/reconcile`, { reconciledWith });
  },

  unreconcileTransaction(id: string): Promise<BankTransaction> {
    return apiClient.patch<BankTransaction>(`${PATH}/bank-transactions/${id}/unreconcile`);
  },

  getReconciliationSummary(bankAccountId: string, params?: { startDate?: string; endDate?: string }): Promise<ReconciliationSummary> {
    return apiClient.get<ReconciliationSummary>(
      `${PATH}/bank-transactions/summary/${bankAccountId}`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  // ─── Purchase Orders ─────────────────────────────────────────────────────

  getPurchaseOrders(params?: PurchaseOrderQueryParams): Promise<PaginatedResponse<PurchaseOrder>> {
    return apiClient.get<PaginatedResponse<PurchaseOrder>>(
      `${PATH}/purchase-orders`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    return apiClient.get<PurchaseOrder>(`${PATH}/purchase-orders/${id}`);
  },

  createPurchaseOrder(data: CreatePurchaseOrderPayload): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(`${PATH}/purchase-orders`, data);
  },

  updatePurchaseOrder(id: string, data: UpdatePurchaseOrderPayload): Promise<PurchaseOrder> {
    return apiClient.patch<PurchaseOrder>(`${PATH}/purchase-orders/${id}`, data);
  },

  deletePurchaseOrder(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/purchase-orders/${id}`);
  },

  approvePurchaseOrder(id: string): Promise<PurchaseOrder> {
    return apiClient.patch<PurchaseOrder>(`${PATH}/purchase-orders/${id}/approve`);
  },

  // ─── Customers ────────────────────────────────────────────────────────────
  getCustomers(params?: CustomerQueryParams): Promise<PaginatedResponse<Customer>> {
    return apiClient.get<PaginatedResponse<Customer>>(`${PATH}/customers`, params as Record<string, string | number | boolean | undefined>);
  },
  getCustomer(id: string): Promise<Customer> {
    return apiClient.get<Customer>(`${PATH}/customers/${id}`);
  },
  createCustomer(data: CreateCustomerPayload): Promise<Customer> {
    return apiClient.post<Customer>(`${PATH}/customers`, data);
  },
  updateCustomer(id: string, data: UpdateCustomerPayload): Promise<Customer> {
    return apiClient.patch<Customer>(`${PATH}/customers/${id}`, data);
  },
  deleteCustomer(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/customers/${id}`);
  },

  // ─── Vendors ──────────────────────────────────────────────────────────────

  getVendors(params?: VendorQueryParams): Promise<PaginatedResponse<Vendor>> {
    return apiClient.get<PaginatedResponse<Vendor>>(
      `${PATH}/vendors`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getVendor(id: string): Promise<Vendor> {
    return apiClient.get<Vendor>(`${PATH}/vendors/${id}`);
  },

  createVendor(data: CreateVendorPayload): Promise<Vendor> {
    return apiClient.post<Vendor>(`${PATH}/vendors`, data);
  },

  updateVendor(id: string, data: UpdateVendorPayload): Promise<Vendor> {
    return apiClient.patch<Vendor>(`${PATH}/vendors/${id}`, data);
  },

  deleteVendor(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/vendors/${id}`);
  },

  // ─── Petty Cash ──────────────────────────────────────────────────────────

  getPettyCashTransactions(params?: PettyCashQueryParams): Promise<PaginatedResponse<PettyCashTransaction>> {
    return apiClient.get<PaginatedResponse<PettyCashTransaction>>(
      `${PATH}/petty-cash`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  createPettyCashTransaction(data: CreatePettyCashPayload): Promise<PettyCashTransaction> {
    return apiClient.post<PettyCashTransaction>(`${PATH}/petty-cash`, data);
  },

  getPettyCashBalance(custodian?: string): Promise<{ balance: number }> {
    return apiClient.get<{ balance: number }>(
      `${PATH}/petty-cash/balance`,
      custodian ? { custodian } as Record<string, string> : undefined,
    );
  },

  replenishPettyCash(data: { amount: number; custodian: string }): Promise<PettyCashTransaction> {
    return apiClient.post<PettyCashTransaction>(`${PATH}/petty-cash/replenish`, data);
  },
  approvePettyCash(id: string): Promise<PettyCashTransaction> {
    return apiClient.patch<PettyCashTransaction>(`${PATH}/petty-cash/${id}/approve`);
  },
  rejectPettyCash(id: string): Promise<PettyCashTransaction> {
    return apiClient.patch<PettyCashTransaction>(`${PATH}/petty-cash/${id}/reject`);
  },

  // ─── Fiscal Periods ──────────────────────────────────────────────────────

  getFiscalPeriods(params?: FiscalPeriodQueryParams): Promise<PaginatedResponse<FiscalPeriod>> {
    return apiClient.get<PaginatedResponse<FiscalPeriod>>(
      `${PATH}/fiscal-periods`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  createFiscalPeriod(data: CreateFiscalPeriodPayload): Promise<FiscalPeriod> {
    return apiClient.post<FiscalPeriod>(`${PATH}/fiscal-periods`, data);
  },

  closeFiscalPeriod(id: string): Promise<FiscalPeriod> {
    return apiClient.patch<FiscalPeriod>(`${PATH}/fiscal-periods/${id}/close`);
  },

  reopenFiscalPeriod(id: string): Promise<FiscalPeriod> {
    return apiClient.patch<FiscalPeriod>(`${PATH}/fiscal-periods/${id}/reopen`);
  },

  // ─── Audit Trail ─────────────────────────────────────────────────────────

  getAuditLogs(params?: AuditLogQueryParams): Promise<PaginatedResponse<AuditLog>> {
    return apiClient.get<PaginatedResponse<AuditLog>>(
      '/audit-logs',
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getEntityAuditLogs(entityType: string, entityId: string): Promise<AuditLog[]> {
    return apiClient.get<AuditLog[]>(`/audit-logs/entity/${entityType}/${entityId}`);
  },

  // ─── Approval Levels ─────────────────────────────────────────────────────
  getApprovalLevels(category?: string): Promise<ApprovalLevel[]> {
    return apiClient.get<ApprovalLevel[]>('/settings/approval-levels', category ? { category } : undefined);
  },
  createApprovalLevel(data: CreateApprovalLevelPayload): Promise<ApprovalLevel> {
    return apiClient.post<ApprovalLevel>('/settings/approval-levels', data);
  },
  updateApprovalLevel(id: string, data: UpdateApprovalLevelPayload): Promise<ApprovalLevel> {
    return apiClient.patch<ApprovalLevel>(`/settings/approval-levels/${id}`, data);
  },
  deleteApprovalLevel(id: string): Promise<void> {
    return apiClient.delete<void>(`/settings/approval-levels/${id}`);
  },

  // ─── Vendor Prequalification ──────────────────────────────────────────────
  getPrequalifications(params?: PrequalificationQueryParams): Promise<PaginatedResponse<VendorPrequalification>> {
    return apiClient.get<PaginatedResponse<VendorPrequalification>>('/finance/vendor-prequalification', params as Record<string, string | number | boolean | undefined>);
  },
  getPrequalification(id: string): Promise<VendorPrequalification> {
    return apiClient.get<VendorPrequalification>(`/finance/vendor-prequalification/${id}`);
  },
  getPrequalificationStats(): Promise<PrequalificationStats> {
    return apiClient.get<PrequalificationStats>('/finance/vendor-prequalification/stats');
  },
  createPrequalification(data: CreateVendorPrequalificationPayload): Promise<VendorPrequalification> {
    return apiClient.post<VendorPrequalification>('/finance/vendor-prequalification', data);
  },
  updatePrequalification(id: string, data: Partial<CreateVendorPrequalificationPayload>): Promise<VendorPrequalification> {
    return apiClient.patch<VendorPrequalification>(`/finance/vendor-prequalification/${id}`, data);
  },
  reviewPrequalification(id: string, data: ReviewVendorPrequalificationPayload): Promise<VendorPrequalification> {
    return apiClient.patch<VendorPrequalification>(`/finance/vendor-prequalification/${id}/review`, data);
  },
  deletePrequalification(id: string): Promise<void> {
    return apiClient.delete<void>(`/finance/vendor-prequalification/${id}`);
  },

  // ─── Purchase Requisitions ──────────────────────────────────────────────────
  getPurchaseRequisitions(params?: PRQueryParams): Promise<PaginatedResponse<PurchaseRequisition>> {
    return apiClient.get<PaginatedResponse<PurchaseRequisition>>(`${PATH}/purchase-requisitions`, params as Record<string, string | number | boolean | undefined>);
  },
  getPurchaseRequisition(id: string): Promise<PurchaseRequisition> {
    return apiClient.get<PurchaseRequisition>(`${PATH}/purchase-requisitions/${id}`);
  },
  createPurchaseRequisition(data: CreatePRPayload): Promise<PurchaseRequisition> {
    return apiClient.post<PurchaseRequisition>(`${PATH}/purchase-requisitions`, data);
  },
  updatePurchaseRequisition(id: string, data: Partial<CreatePRPayload>): Promise<PurchaseRequisition> {
    return apiClient.patch<PurchaseRequisition>(`${PATH}/purchase-requisitions/${id}`, data);
  },
  deletePurchaseRequisition(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/purchase-requisitions/${id}`);
  },
  submitPR(id: string): Promise<PurchaseRequisition> {
    return apiClient.patch<PurchaseRequisition>(`${PATH}/purchase-requisitions/${id}/submit`);
  },
  hodApprovePR(id: string): Promise<PurchaseRequisition> {
    return apiClient.patch<PurchaseRequisition>(`${PATH}/purchase-requisitions/${id}/hod-approve`);
  },
  financeApprovePR(id: string): Promise<PurchaseRequisition> {
    return apiClient.patch<PurchaseRequisition>(`${PATH}/purchase-requisitions/${id}/finance-approve`);
  },
  approvePR(id: string): Promise<PurchaseRequisition> {
    return apiClient.patch<PurchaseRequisition>(`${PATH}/purchase-requisitions/${id}/approve`);
  },
  rejectPR(id: string, reason?: string): Promise<PurchaseRequisition> {
    return apiClient.patch<PurchaseRequisition>(`${PATH}/purchase-requisitions/${id}/reject`, { reason });
  },

  // ─── RFQ ────────────────────────────────────────────────────────────────────
  getRfqs(params?: RfqQueryParams): Promise<PaginatedResponse<Rfq>> {
    return apiClient.get<PaginatedResponse<Rfq>>(`${PATH}/rfq`, params as Record<string, string | number | boolean | undefined>);
  },
  getRfq(id: string): Promise<Rfq> {
    return apiClient.get<Rfq>(`${PATH}/rfq/${id}`);
  },
  createRfq(data: CreateRfqPayload): Promise<Rfq> {
    return apiClient.post<Rfq>(`${PATH}/rfq`, data);
  },
  updateRfq(id: string, data: Partial<CreateRfqPayload>): Promise<Rfq> {
    return apiClient.patch<Rfq>(`${PATH}/rfq/${id}`, data);
  },
  deleteRfq(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/rfq/${id}`);
  },
  sendRfq(id: string): Promise<Rfq> {
    return apiClient.patch<Rfq>(`${PATH}/rfq/${id}/send`);
  },
  submitRfqQuote(rfqId: string, data: { vendorId: string; vendorName: string; totalAmount: number; submittedDate: string; lineQuotes?: Array<{ itemId: string; unitPrice: number; amount: number }>; validUntil?: string; notes?: string }): Promise<Rfq> {
    return apiClient.post<Rfq>(`${PATH}/rfq/${rfqId}/quote`, data);
  },
  evaluateRfq(id: string, data: { quoteId: string; technicalScores?: Array<{ quoteId: string; score: number }> }): Promise<Rfq> {
    return apiClient.patch<Rfq>(`${PATH}/rfq/${id}/evaluate`, data);
  },
  awardRfq(id: string): Promise<Rfq> {
    return apiClient.patch<Rfq>(`${PATH}/rfq/${id}/award`);
  },
  cancelRfq(id: string): Promise<Rfq> {
    return apiClient.patch<Rfq>(`${PATH}/rfq/${id}/cancel`);
  },

  // ─── Procurement Contracts ──────────────────────────────────────────────────
  getContracts(params?: ContractQueryParams): Promise<PaginatedResponse<ProcurementContract>> {
    return apiClient.get<PaginatedResponse<ProcurementContract>>(`${PATH}/procurement-contracts`, params as Record<string, string | number | boolean | undefined>);
  },
  getContract(id: string): Promise<ProcurementContract> {
    return apiClient.get<ProcurementContract>(`${PATH}/procurement-contracts/${id}`);
  },
  createContract(data: CreateContractPayload): Promise<ProcurementContract> {
    return apiClient.post<ProcurementContract>(`${PATH}/procurement-contracts`, data);
  },
  updateContract(id: string, data: Partial<CreateContractPayload>): Promise<ProcurementContract> {
    return apiClient.patch<ProcurementContract>(`${PATH}/procurement-contracts/${id}`, data);
  },
  deleteContract(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/procurement-contracts/${id}`);
  },
  submitContract(id: string): Promise<ProcurementContract> {
    return apiClient.patch<ProcurementContract>(`${PATH}/procurement-contracts/${id}/submit`);
  },
  legalApproveContract(id: string): Promise<ProcurementContract> {
    return apiClient.patch<ProcurementContract>(`${PATH}/procurement-contracts/${id}/legal-approve`);
  },
  financeApproveContract(id: string): Promise<ProcurementContract> {
    return apiClient.patch<ProcurementContract>(`${PATH}/procurement-contracts/${id}/finance-approve`);
  },
  mdApproveContract(id: string): Promise<ProcurementContract> {
    return apiClient.patch<ProcurementContract>(`${PATH}/procurement-contracts/${id}/md-approve`);
  },
  sendContractToVendor(id: string): Promise<ProcurementContract> {
    return apiClient.patch<ProcurementContract>(`${PATH}/procurement-contracts/${id}/send-to-vendor`);
  },
  activateContract(id: string, signedDate: string): Promise<ProcurementContract> {
    return apiClient.patch<ProcurementContract>(`${PATH}/procurement-contracts/${id}/activate`, { signedDate });
  },
  terminateContract(id: string, reason: string): Promise<ProcurementContract> {
    return apiClient.patch<ProcurementContract>(`${PATH}/procurement-contracts/${id}/terminate`, { reason });
  },
  renewContract(id: string): Promise<ProcurementContract> {
    return apiClient.patch<ProcurementContract>(`${PATH}/procurement-contracts/${id}/renew`);
  },
  rejectContract(id: string, reason: string): Promise<ProcurementContract> {
    return apiClient.patch<ProcurementContract>(`${PATH}/procurement-contracts/${id}/reject`, { reason });
  },
  downloadContractPdf(id: string): Promise<Blob> {
    return apiClient.getBlob(`${PATH}/procurement-contracts/${id}/pdf`);
  },

  // ─── GRN ────────────────────────────────────────────────────────────────────
  getGrns(params?: GrnQueryParams): Promise<PaginatedResponse<Grn>> {
    return apiClient.get<PaginatedResponse<Grn>>(`${PATH}/grn`, params as Record<string, string | number | boolean | undefined>);
  },
  getGrn(id: string): Promise<Grn> {
    return apiClient.get<Grn>(`${PATH}/grn/${id}`);
  },
  createGrn(data: CreateGrnPayload): Promise<Grn> {
    return apiClient.post<Grn>(`${PATH}/grn`, data);
  },
  confirmGrn(id: string): Promise<Grn> {
    return apiClient.patch<Grn>(`${PATH}/grn/${id}/confirm`);
  },
  disputeGrn(id: string, reason: string): Promise<Grn> {
    return apiClient.patch<Grn>(`${PATH}/grn/${id}/dispute`, { reason });
  },
  deleteGrn(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/grn/${id}`);
  },

  // ─── Payment Vouchers ─────────────────────────────────────────────────────
  getPaymentVouchers(params?: PVQueryParams): Promise<PaginatedResponse<PaymentVoucher>> {
    return apiClient.get<PaginatedResponse<PaymentVoucher>>(`${PATH}/payment-vouchers`, params as Record<string, string | number | boolean | undefined>);
  },
  getPaymentVoucher(id: string): Promise<PaymentVoucher> {
    return apiClient.get<PaymentVoucher>(`${PATH}/payment-vouchers/${id}`);
  },
  createPaymentVoucher(data: CreatePVPayload): Promise<PaymentVoucher> {
    return apiClient.post<PaymentVoucher>(`${PATH}/payment-vouchers`, data);
  },
  updatePaymentVoucher(id: string, data: Partial<CreatePVPayload>): Promise<PaymentVoucher> {
    return apiClient.patch<PaymentVoucher>(`${PATH}/payment-vouchers/${id}`, data);
  },
  submitPV(id: string): Promise<PaymentVoucher> {
    return apiClient.patch<PaymentVoucher>(`${PATH}/payment-vouchers/${id}/submit`);
  },
  verifyPVDocuments(id: string, data: { poVerified?: boolean; grnVerified?: boolean; invoiceVerified?: boolean }): Promise<PaymentVoucher> {
    return apiClient.patch<PaymentVoucher>(`${PATH}/payment-vouchers/${id}/verify-documents`, data);
  },
  hodApprovePV(id: string): Promise<PaymentVoucher> {
    return apiClient.patch<PaymentVoucher>(`${PATH}/payment-vouchers/${id}/hod-approve`);
  },
  mdApprovePV(id: string): Promise<PaymentVoucher> {
    return apiClient.patch<PaymentVoucher>(`${PATH}/payment-vouchers/${id}/md-approve`);
  },
  financeReviewPV(id: string): Promise<PaymentVoucher> {
    return apiClient.patch<PaymentVoucher>(`${PATH}/payment-vouchers/${id}/finance-review`);
  },
  processPV(id: string): Promise<PaymentVoucher> {
    return apiClient.patch<PaymentVoucher>(`${PATH}/payment-vouchers/${id}/process`);
  },
  rejectPV(id: string, reason: string): Promise<PaymentVoucher> {
    return apiClient.patch<PaymentVoucher>(`${PATH}/payment-vouchers/${id}/reject`, { reason });
  },
  deletePV(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/payment-vouchers/${id}`);
  },

  // ─── Vendor Prequalification (Public) ─────────────────────────────────────
  submitPublicPrequalification(data: CreateVendorPrequalificationPayload): Promise<VendorPrequalification> {
    return apiClient.post<VendorPrequalification>('/vendor-prequalification/apply', data);
  },
};
