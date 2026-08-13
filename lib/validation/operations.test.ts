import { describe, it, expect } from 'vitest';
import {
  createProjectSchema,
  createFuelLogSchema,
  createRfqSchema,
  createWorkOrderSchema,
  createTripSchema,
  createAssetRequestSchema,
  createVehicleSchema,
  createPreventiveScheduleSchema,
} from './operations';
import { zodFieldErrors } from './helpers';

describe('createProjectSchema', () => {
  const valid = { name: 'Pipeline Phase 3', projectManagerId: '11111111-1111-1111-1111-111111111111', startDate: '2026-06-21', targetEndDate: '2026-12-31' };

  it('accepts a valid project', () => {
    expect(createProjectSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a name, manager and dates', () => {
    const r = createProjectSchema.safeParse({ name: '', projectManagerId: '', startDate: '', targetEndDate: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.name).toBeTruthy();
      expect(e.projectManagerId).toBeTruthy();
      expect(e.startDate).toBeTruthy();
      expect(e.targetEndDate).toBeTruthy();
    }
  });
});

describe('createFuelLogSchema', () => {
  const valid = { vehicleId: 'veh-1', date: '2026-06-21', litres: 40, costPerLitre: 750, odometerReading: 12500 };

  it('accepts a valid fuel log', () => {
    expect(createFuelLogSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a vehicle and date', () => {
    const r = createFuelLogSchema.safeParse({ ...valid, vehicleId: '', date: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.vehicleId).toBeTruthy();
      expect(e.date).toBeTruthy();
    }
  });

  it('rejects a zero/NaN litres or cost', () => {
    expect(createFuelLogSchema.safeParse({ ...valid, litres: 0 }).success).toBe(false);
    expect(createFuelLogSchema.safeParse({ ...valid, costPerLitre: Number.NaN }).success).toBe(false);
    expect(createFuelLogSchema.safeParse({ ...valid, odometerReading: 0 }).success).toBe(false);
  });
});

describe('createRfqSchema', () => {
  const valid = { title: 'Pipe supply', issueDate: '2026-06-21', closingDate: '2026-07-05', hasItem: true };

  it('accepts a valid RFQ', () => {
    expect(createRfqSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a title and dates', () => {
    const r = createRfqSchema.safeParse({ title: '', issueDate: '', closingDate: '', hasItem: true });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.title).toBeTruthy();
      expect(e.issueDate).toBeTruthy();
      expect(e.closingDate).toBeTruthy();
    }
  });

  it('requires at least one item', () => {
    const r = createRfqSchema.safeParse({ ...valid, hasItem: false });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodFieldErrors(r.error).hasItem).toBeTruthy();
  });
});

describe('createWorkOrderSchema', () => {
  const valid = { assetName: 'Pump A', title: 'Replace seal', description: 'Mechanical seal leaking' };

  it('accepts a valid work order', () => {
    expect(createWorkOrderSchema.safeParse(valid).success).toBe(true);
  });

  it('requires asset, title and description', () => {
    const r = createWorkOrderSchema.safeParse({ assetName: '', title: '  ', description: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.assetName).toBeTruthy();
      expect(e.title).toBeTruthy();
      expect(e.description).toBeTruthy();
    }
  });
});




describe('createTripSchema', () => {
  const valid = {
    vehicleId: 'veh-1',
    driverName: 'Sam Okon',
    purpose: 'Delivery run',
    startLocation: 'Plant',
    endLocation: 'Depot',
    startTime: '2026-06-21T08:00',
    startOdometerKm: 12500,
  };

  it('accepts a valid trip', () => {
    expect(createTripSchema.safeParse(valid).success).toBe(true);
  });

  it('requires vehicle, driver, purpose, locations and time', () => {
    const r = createTripSchema.safeParse({ ...valid, vehicleId: '', driverName: '', purpose: '', startLocation: '', endLocation: '', startTime: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.vehicleId).toBeTruthy();
      expect(e.driverName).toBeTruthy();
      expect(e.purpose).toBeTruthy();
      expect(e.startLocation).toBeTruthy();
      expect(e.endLocation).toBeTruthy();
      expect(e.startTime).toBeTruthy();
    }
  });

  it('rejects a zero/NaN start odometer', () => {
    expect(createTripSchema.safeParse({ ...valid, startOdometerKm: 0 }).success).toBe(false);
    expect(createTripSchema.safeParse({ ...valid, startOdometerKm: Number.NaN }).success).toBe(false);
  });
});

describe('createAssetRequestSchema', () => {
  const valid = { requestedBy: 'Jane Doe', department: 'Operations', assetCategory: 'IT Equipment', description: 'New laptop', justification: 'Old one broke' };

  it('accepts a valid request', () => {
    expect(createAssetRequestSchema.safeParse(valid).success).toBe(true);
  });

  it('requires requestedBy, department, category, description and justification', () => {
    const r = createAssetRequestSchema.safeParse({ requestedBy: '', department: '', assetCategory: '', description: '  ', justification: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.requestedBy).toBeTruthy();
      expect(e.department).toBeTruthy();
      expect(e.assetCategory).toBeTruthy();
      expect(e.description).toBeTruthy();
      expect(e.justification).toBeTruthy();
    }
  });
});

describe('createVehicleSchema', () => {
  const valid = { registrationNumber: 'ABC-123-XY', make: 'Toyota', model: 'Hilux', year: 2024 };

  it('accepts a valid vehicle', () => {
    expect(createVehicleSchema.safeParse(valid).success).toBe(true);
  });

  it('requires registration, make and model', () => {
    const r = createVehicleSchema.safeParse({ ...valid, registrationNumber: '', make: '  ', model: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.registrationNumber).toBeTruthy();
      expect(e.make).toBeTruthy();
      expect(e.model).toBeTruthy();
    }
  });

  it('rejects a zero/NaN year', () => {
    expect(createVehicleSchema.safeParse({ ...valid, year: 0 }).success).toBe(false);
    expect(createVehicleSchema.safeParse({ ...valid, year: Number.NaN }).success).toBe(false);
  });
});

describe('createPreventiveScheduleSchema', () => {
  const valid = { assetName: 'Pump A', title: 'Quarterly service', nextDueDate: '2026-09-01' };

  it('accepts a valid schedule', () => {
    expect(createPreventiveScheduleSchema.safeParse(valid).success).toBe(true);
  });

  it('requires asset, title and next due date', () => {
    const r = createPreventiveScheduleSchema.safeParse({ assetName: '', title: '  ', nextDueDate: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.assetName).toBeTruthy();
      expect(e.title).toBeTruthy();
      expect(e.nextDueDate).toBeTruthy();
    }
  });
});
