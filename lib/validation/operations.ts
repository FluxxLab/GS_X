import { z } from 'zod';

/** Validation for the create-project form (§6). */
export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  projectManagerId: z.string().trim().min(1, 'Project manager is required'),
  startDate: z.string().min(1, 'Start date is required'),
  targetEndDate: z.string().min(1, 'Target end date is required'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/** Validation for the record-fuel-log form (§6). */
export const createFuelLogSchema = z.object({
  vehicleId: z.string().trim().min(1, 'Vehicle is required'),
  date: z.string().min(1, 'Date is required'),
  litres: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Litres must be greater than 0'),
  costPerLitre: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Cost per litre must be greater than 0'),
  odometerReading: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Odometer reading must be greater than 0'),
});

export type CreateFuelLogInput = z.infer<typeof createFuelLogSchema>;

/** Validation for the create/edit-RFQ form (§6). */
export const createRfqSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  closingDate: z.string().min(1, 'Closing date is required'),
  hasItem: z
    .boolean()
    .refine((v) => v === true, 'At least one item is needed'),
});

export type CreateRfqInput = z.infer<typeof createRfqSchema>;

/** Validation for the create-work-order (maintenance) form (§6). */
export const createWorkOrderSchema = z.object({
  assetName: z.string().trim().min(1, 'Asset name is required'),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
});

export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>;

/** Validation for the create-trip (fleet) form (§6). */
export const createTripSchema = z.object({
  vehicleId: z.string().trim().min(1, 'Vehicle is required'),
  driverName: z.string().trim().min(1, 'Driver is required'),
  purpose: z.string().trim().min(1, 'Purpose is required'),
  startLocation: z.string().trim().min(1, 'Start location is required'),
  endLocation: z.string().trim().min(1, 'End location is required'),
  startTime: z.string().min(1, 'Start time is required'),
  startOdometerKm: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Start odometer must be greater than 0'),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;

/** Validation for the create-asset-request form (§6). */
export const createAssetRequestSchema = z.object({
  requestedBy: z.string().trim().min(1, 'Requested by is required'),
  department: z.string().trim().min(1, 'Department is required'),
  assetCategory: z.string().trim().min(1, 'Asset category is required'),
  description: z.string().trim().min(1, 'Description is required'),
  justification: z.string().trim().min(1, 'Justification is required'),
});

export type CreateAssetRequestInput = z.infer<typeof createAssetRequestSchema>;

/** Validation for the add-vehicle (fleet) form (§6). */
export const createVehicleSchema = z.object({
  registrationNumber: z.string().trim().min(1, 'Registration number is required'),
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  year: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Year must be greater than 0'),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;

/** Validation for the create-preventive-maintenance-schedule form (§6). */
export const createPreventiveScheduleSchema = z.object({
  assetName: z.string().trim().min(1, 'Asset name is required'),
  title: z.string().trim().min(1, 'Title is required'),
  nextDueDate: z.string().min(1, 'Next due date is required'),
});

export type CreatePreventiveScheduleInput = z.infer<typeof createPreventiveScheduleSchema>;
