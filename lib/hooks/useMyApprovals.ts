"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePaymentVouchers } from "@/lib/hooks/usePaymentVouchers";
import { usePurchaseRequisitions } from "@/lib/hooks/usePurchaseRequisitions";
import { useExpenses } from "@/lib/hooks/useExpenses";
import { usePurchaseOrders } from "@/lib/hooks/usePurchaseOrders";
import { attendanceService } from "@/lib/services/attendance.service";
import { LEAVE_TYPE_LABELS } from "@/lib/constants/attendance";
import type {
  PVStatus,
  PRStatus,
  ExpenseStatus,
  PurchaseOrderStatus,
  PurchaseRequisition,
  Expense,
  PurchaseOrder,
  PaymentVoucher,
} from "@/lib/types/finance";

const PRIMARY = "#081340";
const MD_THRESHOLD = 15_000_000;

export type ApprovalType =
  | "all"
  | "payment_vouchers"
  | "requisitions"
  | "purchase_orders"
  | "expenses"
  | "leave";

/** A pending approval normalised into a common shape across all document sources. */
export type ApprovalItem = {
  id: string;
  _ref: string;
  _type: string;
  _typeBadge: { bg: string; color: string };
  _date: string;
  _payee: string;
  _description: string;
  _amount: number;
  _status: string;
  _approvalAction: "hod" | "md" | "finance";
  _actionLabel: string;
  _actionColor: string;
  _source: "pv" | "requisition" | "expense" | "po" | "leave";
};

export type CardFilter = "ALL" | "pv" | "requisition" | "po" | "expense";

/**
 * Data layer for the My Approvals inbox: fetches every pending document source,
 * normalises them into a common `ApprovalItem` shape, applies the search / tab /
 * KPI-card filters, and exposes the approve + reject actions.
 */
export function useMyApprovals() {
  const [activeTab, setActiveTab] = useState<ApprovalType>("all");
  // KPI cards double as table filters by document source (counts stay on the full set).
  const [cardFilter, setCardFilter] = useState<CardFilter>("ALL");
  const [search, setSearch] = useState("");
  // Optimistically hidden rows: an approved/rejected item vanishes instantly for
  // snappy feedback on slow connections, and is restored if the action fails.
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const hideRow = (id: string) => setPendingIds((p) => new Set(p).add(id));
  const restoreRow = (id: string) => setPendingIds((p) => { const n = new Set(p); n.delete(id); return n; });

  const { vouchers: pendingVouchers, loading: pvLoading, hodApprovePV, mdApprovePV, financeReviewPV, rejectPV, refresh: refreshPV } = usePaymentVouchers({ status: "PENDING" as PVStatus });
  const { vouchers: hodApproved } = usePaymentVouchers({ status: "HOD_APPROVED" as PVStatus });
  const { vouchers: mdApproved } = usePaymentVouchers({ status: "MD_APPROVED" as PVStatus });
  const { requisitions: pendingReqs, hodApprovePR, rejectPR, refresh: refreshPR } = usePurchaseRequisitions({ status: "PENDING" as PRStatus });
  const { expenses: pendingExpenses, hodApproveExpense, rejectExpense, refresh: refreshExp } = useExpenses({ status: "PENDING" as ExpenseStatus });
  const { purchaseOrders: pendingPOs, approvePurchaseOrder, refresh: refreshPO } = usePurchaseOrders({ status: "PENDING_APPROVAL" as PurchaseOrderStatus });

  const queryClient = useQueryClient();
  const { data: leaveData } = useQuery({
    queryKey: ["leaves", "pending", "my-approvals"],
    queryFn: () => attendanceService.getLeaveRequests({ status: "pending", limit: 100 }),
  });
  const pendingLeaves = leaveData?.data ?? [];

  const approveLeaveMutation = useMutation({
    mutationFn: (id: string) => attendanceService.approveLeave(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leaves"] }); },
  });
  const rejectLeaveMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => attendanceService.rejectLeave(id, reason),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leaves"] }); },
  });

  const refresh = () => Promise.all([
    refreshPV(), refreshPR(), refreshExp(), refreshPO(),
    queryClient.invalidateQueries({ queryKey: ["leaves"] }),
  ]);

  const pvItems: ApprovalItem[] = [
    ...pendingVouchers.map((pv) => ({
      id: pv.id,
      _ref: pv.pvNumber,
      _type: (pv as PaymentVoucher & { paymentType?: string }).paymentType === "PO_BASED" ? "PO-Based PV" : "Direct PV",
      _typeBadge: (pv as PaymentVoucher & { paymentType?: string }).paymentType === "PO_BASED" ? { bg: "#DBEAFE", color: "#1E40AF" } : { bg: "#FEF3C7", color: "#92400E" },
      _date: pv.voucherDate,
      _payee: pv.payeeName,
      _description: pv.description || "",
      _amount: Number(pv.grossAmount),
      _status: "Pending",
      _approvalAction: (Number(pv.grossAmount) > MD_THRESHOLD ? "md" : "hod") as "hod" | "md",
      _actionLabel: Number(pv.grossAmount) > MD_THRESHOLD ? "MD Approve" : "HOD Approve",
      _actionColor: Number(pv.grossAmount) > MD_THRESHOLD ? PRIMARY : "#6366F1",
      _source: "pv" as const,
    })),
    ...hodApproved.map((pv) => ({
      id: pv.id, _ref: pv.pvNumber, _type: "Payment Voucher",
      _typeBadge: { bg: "#E0E7FF", color: "#4338CA" },
      _date: pv.voucherDate, _payee: pv.payeeName, _description: pv.description || "",
      _amount: Number(pv.grossAmount), _status: "HOD Approved",
      _approvalAction: "finance" as const, _actionLabel: "Finance Review", _actionColor: "#059669",
      _source: "pv" as const,
    })),
    ...mdApproved.map((pv) => ({
      id: pv.id, _ref: pv.pvNumber, _type: "Payment Voucher",
      _typeBadge: { bg: "#DBEAFE", color: "#1E40AF" },
      _date: pv.voucherDate, _payee: pv.payeeName, _description: pv.description || "",
      _amount: Number(pv.grossAmount), _status: "MD Approved",
      _approvalAction: "finance" as const, _actionLabel: "Finance Review", _actionColor: "#059669",
      _source: "pv" as const,
    })),
  ];

  const reqItems: ApprovalItem[] = pendingReqs.map((r: PurchaseRequisition) => {
    const x = r as PurchaseRequisition & Record<string, unknown>;
    return {
      id: r.id,
      _ref: r.prNumber || r.id.slice(0, 8),
      _type: "Requisition",
      _typeBadge: { bg: "#F3E8FF", color: "#7C3AED" },
      _date: r.requestDate || r.createdAt?.split("T")[0] || "",
      _payee: r.requestedBy || r.department || "",
      _description: r.description || (x.purpose as string) || "",
      _amount: Number(r.estimatedTotal || x.estimatedCost || x.totalAmount || 0),
      _status: "Pending",
      _approvalAction: "hod" as const,
      _actionLabel: "HOD Approve",
      _actionColor: "#6366F1",
      _source: "requisition" as const,
    };
  });

  const expItems: ApprovalItem[] = pendingExpenses.map((e: Expense) => ({
    id: e.id,
    _ref: e.expenseNumber || e.id.slice(0, 8),
    _type: "Expense",
    _typeBadge: { bg: "#FEF3C7", color: "#D97706" },
    _date: e.date || e.createdAt?.split("T")[0] || "",
    _payee: e.vendorName || e.submittedBy || "",
    _description: e.description || "",
    _amount: Number(e.amount || 0),
    _status: "Pending",
    _approvalAction: "hod" as const,
    _actionLabel: "Approve",
    _actionColor: "#059669",
    _source: "expense" as const,
  }));

  const poItems: ApprovalItem[] = pendingPOs.map((po: PurchaseOrder) => ({
    id: po.id,
    _ref: po.poNumber || po.id.slice(0, 8),
    _type: "Purchase Order",
    _typeBadge: { bg: "#DBEAFE", color: "#1E40AF" },
    _date: po.date || po.createdAt?.split("T")[0] || "",
    _payee: po.vendorName || "",
    _description: `PO for ${po.department || "General"} · ${po.lineItems?.length || 0} items`,
    _amount: Number(po.totalAmount || 0),
    _status: "Pending Approval",
    _approvalAction: "hod" as const,
    _actionLabel: "Approve PO",
    _actionColor: "#2563EB",
    _source: "po" as const,
  }));

  const leaveItems: ApprovalItem[] = pendingLeaves.map((lv) => ({
    id: lv.id,
    _ref: lv.id.slice(0, 8).toUpperCase(),
    _type: "Leave Request",
    _typeBadge: { bg: "#D1FAE5", color: "#065F46" },
    _date: lv.startDate,
    _payee: lv.employee ? `${lv.employee.firstName} ${lv.employee.lastName}` : "Unknown",
    _description: `${LEAVE_TYPE_LABELS[lv.leaveType] || lv.leaveType} · ${lv.totalDays} day${lv.totalDays !== 1 ? "s" : ""}${lv.reason ? ` · ${lv.reason}` : ""}`,
    _amount: 0,
    _status: "Pending",
    _approvalAction: "hod" as const,
    _actionLabel: "Approve Leave",
    _actionColor: "#059669",
    _source: "leave" as const,
  }));

  const allPending = [...pvItems, ...reqItems, ...expItems, ...poItems, ...leaveItems].filter((item) => {
    if (search) {
      const s = search.toLowerCase();
      return item._ref.toLowerCase().includes(s) || item._payee.toLowerCase().includes(s) || item._description.toLowerCase().includes(s);
    }
    return true;
  });

  const filtered = activeTab === "all" ? allPending
    : activeTab === "payment_vouchers" ? allPending.filter((i) => i._source === "pv")
    : activeTab === "requisitions" ? allPending.filter((i) => i._source === "requisition")
    : activeTab === "expenses" ? allPending.filter((i) => i._source === "expense")
    : activeTab === "purchase_orders" ? allPending.filter((i) => i._source === "po")
    : activeTab === "leave" ? allPending.filter((i) => i._source === "leave")
    : allPending;

  // KPI cards filter the table by document source on top of the active tab.
  // Optimistically hidden rows drop out immediately for instant feedback.
  const displayed = (cardFilter === "ALL" ? filtered : filtered.filter((i) => i._source === cardFilter))
    .filter((i) => !pendingIds.has(i.id));

  const approve = async (item: ApprovalItem) => {
    hideRow(item.id); // optimistic: the row vanishes now, no waiting on the round-trip
    try {
      if (item._source === "pv") {
        if (item._approvalAction === "hod") await hodApprovePV(item.id);
        else if (item._approvalAction === "md") await mdApprovePV(item.id);
        else if (item._approvalAction === "finance") await financeReviewPV(item.id);
      } else if (item._source === "requisition") {
        await hodApprovePR(item.id);
      } else if (item._source === "expense") {
        await hodApproveExpense(item.id);
      } else if (item._source === "po") {
        await approvePurchaseOrder(item.id);
      } else if (item._source === "leave") {
        await approveLeaveMutation.mutateAsync(item.id);
      }
    } catch {
      restoreRow(item.id); // rollback: the action failed, bring the row back
      return;
    }
    // Reconcile with the server, then drop the optimistic hide. A PV that only
    // advanced a stage (HOD -> Finance) reappears under its new action.
    await refresh();
    restoreRow(item.id);
  };

  const reject = async (id: string, reason: string) => {
    if (!reason.trim()) return;
    const item = allPending.find((i) => i.id === id);
    hideRow(id); // optimistic removal
    try {
      if (item?._source === "pv") await rejectPV(id, reason);
      else if (item?._source === "requisition") await rejectPR(id, reason);
      else if (item?._source === "expense") await rejectExpense(id, reason);
      else if (item?._source === "leave") await rejectLeaveMutation.mutateAsync({ id, reason });
    } catch {
      restoreRow(id); // rollback on failure
      return;
    }
    await refresh();
    restoreRow(id);
  };

  return {
    search, setSearch,
    activeTab, setActiveTab,
    cardFilter, setCardFilter,
    counts: { pv: pvItems.length, req: reqItems.length, po: poItems.length, exp: expItems.length },
    allPending,
    displayed,
    totalValue: allPending.reduce((s, p) => s + (p._amount || 0), 0),
    loading: pvLoading,
    approve,
    reject,
  };
}
