import { z } from 'zod';

/**
 * Boundary validation for the employment-contract create & renew forms
 * (app/dashboard/contracts/all). Mirrors only the REQUIRED fields of the
 * backend `CreateContractDto` / `RenewContractDto`; every other field is
 * optional and validated by the backend.
 */

/** Required by backend CreateContractDto: employeeId, startDate, grossAnnualSalary, jobTitle. */
export const createContractSchema = z.object({
  employeeId: z.string().trim().min(1, 'Select an employee'),
  startDate: z.string().min(1, 'Start date is required'),
  grossAnnualSalary: z.number({ message: 'Annual salary is required' }).min(0, 'Annual salary must be 0 or more'),
  jobTitle: z.string().trim().min(1, 'Job title is required'),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;

/** Required by backend RenewContractDto: newStartDate. */
export const renewContractSchema = z.object({
  newStartDate: z.string().min(1, 'New start date is required'),
});

export type RenewContractInput = z.infer<typeof renewContractSchema>;
