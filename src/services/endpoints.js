/**
 * Backend route contract for reseller portal.
 * Keep paths stable unless BOTH frontend and backend update together.
 *
 * These are logical endpoints for the BFF/API layer; backend can proxy
 * to Supabase and eSIMAccess as needed.
 */
export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    logout: "/auth/logout",
    me: "/auth/me"
  },
  catalog: {
    plans: "/catalog/plans"
  },
  groups: {
    root: "/groups"
  },
  orders: {
    root: "/orders",
    portalRoot: "/portal/orders",
    byId: (id) => `/portal/orders/${id}`,
    installLinks: (id) => `/portal/orders/${id}/install-links`,
    resend: (id) => `/portal/orders/${id}/resend`,
    suspend: (id) => `/portal/orders/${id}/suspend`,
    cancel: (id) => `/portal/orders/${id}/cancel`,
    topup: (id) => `/portal/orders/${id}/topup`
  },
  earnings: {
    summary: "/earnings/summary"
  }
};
