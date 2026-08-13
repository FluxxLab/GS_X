export const TRAVEL_STATUS_BADGE: Record<string, { bg: string; color: string }> =
  {
    PENDING_APPROVAL: { bg: "#FEF3C7", color: "#92400E" },
    APPROVED: { bg: "#DCFCE7", color: "#166534" },
    REJECTED: { bg: "#FEE2E2", color: "#991B1B" },
    CANCELLED: { bg: "#F4F6FB", color: "#70768E" },
  };

export const TRAVEL_STATUS_LABEL: Record<string, string> = {
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

export const TRAVEL_TYPE_OPTIONS = [
  { value: "LOCAL", label: "Local" },
  { value: "REGIONAL", label: "Regional" },
  { value: "INTERNATIONAL", label: "International" },
];

export const TRAVEL_MODE_OPTIONS = [
  { value: "ROAD", label: "Road" },
  { value: "AIR", label: "Air" },
  { value: "RAIL", label: "Rail" },
  { value: "SEA", label: "Sea" },
];
