// Delivery method constants and display config
// Used by: Catalog order modal, NewOrderPage, group delivery views
// Backend: delivery values must match API response values

export const DELIVERY_SMS = "sms";
export const DELIVERY_EMAIL = "email";
export const DELIVERY_MANUAL = "manual";
export const DELIVERY_OPERATOR = "operator";

export const DELIVERY_CONFIG = {
  [DELIVERY_SMS]: { label_key: "deliveryMethods.sms", icon: "phone" },
  [DELIVERY_EMAIL]: { label_key: "deliveryMethods.email", icon: "envelope" },
  [DELIVERY_MANUAL]: { label_key: "deliveryMethods.manual", icon: "printer" },
  [DELIVERY_OPERATOR]: { label_key: "deliveryMethods.operator", icon: "users" }
};
