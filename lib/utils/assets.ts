import type { AssetAssignment } from '../types/operations';

/**
 * An assignment is overdue when it's still checked out and its expected
 * return date is in the past (compared at day granularity, so an asset due
 * "today" is not flagged until tomorrow).
 */
export function isAssignmentOverdue(a: Pick<AssetAssignment, 'status' | 'expectedReturnDate'>): boolean {
  if (a.status && a.status !== 'CHECKED_OUT') return false;
  if (!a.expectedReturnDate) return false;
  const due = new Date(a.expectedReturnDate);
  if (Number.isNaN(due.getTime())) return false;
  due.setHours(23, 59, 59, 999);
  return due.getTime() < Date.now();
}

/** Whole days an assignment is overdue (0 if not overdue). */
export function daysOverdue(a: Pick<AssetAssignment, 'status' | 'expectedReturnDate'>): number {
  if (!isAssignmentOverdue(a)) return 0;
  const due = new Date(a.expectedReturnDate as string);
  return Math.floor((Date.now() - due.getTime()) / 86_400_000);
}
