// Order status constants and display config
// Used by: OrdersTable, OrderDetailsPage, StatusBadge
// Backend: status values must match API response values

export const ORDER_STATUS_PENDING = "pending";
export const ORDER_STATUS_ACTIVE = "active";
export const ORDER_STATUS_SUSPENDED = "suspended";
export const ORDER_STATUS_CANCELLED = "cancelled";
export const ORDER_STATUS_EXPIRED = "expired";
export const ORDER_STATUS_FAILED = "failed";

export const STATUS_CONFIG = {
  [ORDER_STATUS_ACTIVE]: { label_key: "statusLabels.active", colorScheme: "green", icon: "check-circle" },
  [ORDER_STATUS_PENDING]: { label_key: "statusLabels.pending", colorScheme: "orange", icon: "clock" },
  [ORDER_STATUS_FAILED]: { label_key: "statusLabels.failed", colorScheme: "red", icon: "x-circle" },
  [ORDER_STATUS_EXPIRED]: { label_key: "statusLabels.expired", colorScheme: "gray", icon: "calendar" },
  [ORDER_STATUS_SUSPENDED]: { label_key: "statusLabels.suspended", colorScheme: "yellow", icon: "pause-circle" },
  [ORDER_STATUS_CANCELLED]: { label_key: "statusLabels.cancelled", colorScheme: "red", icon: "trash" }
};
