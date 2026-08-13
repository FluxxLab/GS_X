export interface MonthPoint {
  month: string; // YYYY-MM
  value: number;
}

export interface ExecutiveSummary {
  year: number;
  production: {
    ytdOutput: number;
    ytdDamaged: number;
    yieldPct: number;
    monthly: MonthPoint[];
  };
  sales: {
    ytdSales: number;
    ytdCollections: number;
    ytdCredit: number;
    monthly: MonthPoint[];
    monthlyPrevYear: MonthPoint[];
  };
  operations: {
    openWorkOrders: number;
    overdueWorkOrders: number;
    maintenanceCostYtd: number;
    fuelCostYtd: number;
    vehicleCount: number;
  };
}
