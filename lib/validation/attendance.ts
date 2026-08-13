import { z } from 'zod';

/** Validation for the remote-work request form (§6). */
export const remoteWorkRequestSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().trim().optional(),
});

export type RemoteWorkRequestInput = z.infer<typeof remoteWorkRequestSchema>;

/** Validation for the overtime request form (§6). Mirrors the original UI gate:
 * date required, expected hours between 0.5 and 8. */
export const overtimeRequestSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  expectedHours: z
    .number({ message: 'Expected hours is required' })
    .min(0.5, 'Minimum 0.5h')
    .max(8, 'Maximum 8h'),
  reason: z.string().trim().optional(),
});

export type OvertimeRequestInput = z.infer<typeof overtimeRequestSchema>;

/** Validation for the create-leave-request form (§6). */
export const leaveRequestSchema = z.object({
  leaveType: z.string().min(1, 'Leave type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().trim().optional(),
});

export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
