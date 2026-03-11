import { orderDetailsMock, recentOrdersMock } from "../mock/ordersMock";
import { portalOrdersMock, portalPackagesMock } from "../mock/ordersPortalMock";
import { groupOrdersMock, DELIVERY_STATUS } from "../mock/groupOrdersMock";
import { USD_TO_UZS_RATE } from "../constants/currency";
import {
  ORDER_STATUS_ACTIVE,
  ORDER_STATUS_FAILED,
  ORDER_STATUS_PENDING
} from "../constants/statuses";
import { withDelay } from "./utils";
import { supabase } from "../lib/supabase";

/**
 * Backend handoff:
 * - Contract reference: src/services/CONTRACTS.md#4-ordersservice
 * - Mapping helpers: src/services/supabaseMappers.js
 * - Main DB table: public.orders (+ partner/group/customer joins)
 * - Action auditing target: public.order_action_logs
 */
let ordersState = [...recentOrdersMock];
let portalOrdersState = [...portalOrdersMock];
const portalPackagesState = [...portalPackagesMock];

const portalTypeByTab = {
  client: "client",
  group: "group",
  self: "self"
};

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

/**
 * Checks if searchable fields match the query (supports ICCID, phone partial match).
 * @param {Object} entry - Order entry with searchable fields
 * @param {string} query - Normalized search query
 * @returns {boolean}
 */
function matchesSearch(entry, query) {
  if (!query) return true;

  // Searchable fields for order entries
  const searchable = [
    entry.id,
    entry.customerName,
    entry.customerPhone,
    entry.customerEmail,
    entry.groupName,
    entry.iccid,
    entry.package?.name,
    entry.package?.destination
  ].map(normalize);

  return searchable.some((value) => value.includes(query));
}

function getPortalOrderBundle(order) {
  if (!order) {
    return null;
  }

  const pkg = portalPackagesState.find((item) => item.id === order.packageId) || null;
  return { ...order, package: pkg };
}

function buildInstallLinks(iccid) {
  return {
    ios: `https://esim.setup/ios?iccid=${iccid}`,
    android: `https://esim.setup/android?iccid=${iccid}`
  };
}

export const ordersService = {
  /**
   * Lists reseller dashboard orders.
   * @param {void} [_params]
   * @returns {Promise<import('./types').Order[]>}
   * @endpoint GET /api/v1/orders
   * @todo Replace withDelay mock with HTTP client call
   */
  listOrders() {
    // TODO: replace with real API call (ordersService.listOrders)
    return withDelay([...ordersState], 800);
  },
  /**
   * Creates a new reseller order.
   * @param {{ customerName?: string, destination?: string, countryCode?: string, planName?: string, amount?: number, commission?: number, phone?: string, email?: string }} payload
   * @returns {Promise<import('./types').Order>}
   * @endpoint POST /api/v1/orders
   * @todo Replace withDelay mock with HTTP client call
   */
  createOrder(payload) {
    const portalPackage =
      portalPackagesState.find(
        (item) => normalize(item.destination) === normalize(payload?.destination)
      ) || portalPackagesState[0];

    const newOrder = {
      id: `ORD-${1000 + ordersState.length + 1}`,
      customerName: payload?.customerName || "Yangi mijoz",
      destination: payload?.destination || "Turkiya",
      countryCode: payload?.countryCode || "TR",
      planName: payload?.planName || "Turkiya Plus",
      amount: payload?.amount || 19,
      commission: payload?.commission || 2.4,
      status: ORDER_STATUS_PENDING,
      createdAt: new Date().toISOString()
    };

    ordersState = [newOrder, ...ordersState];

    portalOrdersState = [
      {
        id: newOrder.id,
        orderType: "client",
        packageId: portalPackage?.id || "pkg-uz-10-30",
        customerName: payload?.customerName || "Yangi mijoz",
        customerPhone: payload?.phone || "",
        customerEmail: payload?.email || "",
        status: ORDER_STATUS_PENDING,
        dataUsageGb: 0,
        totalDataGb: portalPackage?.dataGb === -1 ? 999 : portalPackage?.dataGb || 0,
        purchasedAt: new Date().toISOString(),
        paymentTotalUzs: Math.round((payload?.amount || 0) * USD_TO_UZS_RATE),
        iccid: `8999${Math.floor(100000000000000 + Math.random() * 900000000000000)}`,
        timeline: {
          createdAt: new Date().toISOString(),
          paymentClearedAt: new Date().toISOString(),
          deliveredAt: null,
          activatedAt: null,
          lastSyncAt: new Date().toISOString()
        }
      },
      ...portalOrdersState
    ];

    // TODO: replace with real API call (ordersService.createOrder)
    return withDelay(newOrder, 900);
  },
  /**
   * Fetches legacy order details by order id.
   * @param {string} id
   * @returns {Promise<import('./types').OrderDetails|null>}
   * @endpoint GET /api/v1/orders/{id}
   * @todo Replace withDelay mock with HTTP client call
   */
  getOrderDetails(id) {
    const details = orderDetailsMock[id] || null;

    // TODO: replace with real API call (ordersService.getOrderDetails)
    return withDelay(details, 700);
  },
  /**
   * Fetches portal orders filtered by order tab and search query.
   * @param {{ tab?: 'client'|'group'|'self', query?: string }} [params]
   * @returns {Promise<import('./types').PortalOrder[]>}
   * @endpoint GET /api/v1/portal/orders?tab={tab}&query={query}
   * @todo Replace withDelay mock with HTTP client call
   */
  listPortalOrders(params = {}) {
    const tab = params.tab || "client";
    const query = normalize(params.query);
    const expectedType = portalTypeByTab[tab] || "client";
    const statusFilter = params.status || null;
    const dateFrom = params.dateFrom ? new Date(params.dateFrom) : null;
    const dateTo = params.dateTo ? new Date(params.dateTo) : null;

    const rows = portalOrdersState
      .filter((order) => order.orderType === expectedType)
      .map((order) => getPortalOrderBundle(order))
      .filter(Boolean)
      .filter((entry) => matchesSearch(entry, query))
      .filter((entry) => {
        // Status filter
        if (statusFilter && entry.status !== statusFilter) {
          return false;
        }
        // Date range filter
        if (dateFrom || dateTo) {
          const orderDate = new Date(entry.purchasedAt);
          if (dateFrom && orderDate < dateFrom) return false;
          if (dateTo) {
            const dateToEnd = new Date(dateTo);
            dateToEnd.setHours(23, 59, 59, 999);
            if (orderDate > dateToEnd) return false;
          }
        }
        return true;
      })
      .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

    return withDelay(rows, 450);
  },
  /**
   * Fetches a single portal order with expanded package info.
   * @param {string} id
   * @returns {Promise<import('./types').PortalOrder|null>}
   * @endpoint GET /api/v1/portal/orders/{id}
   * @todo Replace withDelay mock with HTTP client call
   */
  getPortalOrderDetails(id) {
    const order = portalOrdersState.find((item) => item.id === id) || null;
    return withDelay(getPortalOrderBundle(order), 450);
  },
  /**
   * Fetches a portal package by id.
   * @param {string} packageId
   * @returns {Promise<import('./types').PortalPackage|null>}
   * @endpoint GET /api/v1/portal/packages/{packageId}
   * @todo Replace withDelay mock with HTTP client call
   */
  getPortalPackage(packageId) {
    const entry = portalPackagesState.find((item) => item.id === packageId) || null;
    return withDelay(entry, 250);
  },
  /**
   * Fetches installation deep links for a portal order.
   * @param {string} id
   * @returns {Promise<import('./types').PortalInstallLinks|null>}
   * @endpoint GET /api/v1/portal/orders/{id}/install-links
   * @todo Replace withDelay mock with HTTP client call
   */
  getPortalInstallLinks(id) {
    const order = portalOrdersState.find((item) => item.id === id);
    if (!order) {
      return withDelay(null, 250, true);
    }

    return withDelay(buildInstallLinks(order.iccid), 250);
  },
  /**
   * Triggers resend of portal order delivery details.
   * @param {string} id
   * @returns {Promise<{ ok: boolean }>}
   * @endpoint POST /api/v1/portal/orders/{id}/resend
   * @todo Replace withDelay mock with HTTP client call
   */
  resendPortalOrder(id) {
    const order = portalOrdersState.find((item) => item.id === id);
    if (!order) {
      return withDelay(null, 250, true);
    }

    return withDelay({ ok: true }, 400);
  },
  /**
   * Suspends an active portal order.
   * @param {string} id
   * @returns {Promise<{ ok: boolean }>}
   * @endpoint POST /api/v1/portal/orders/{id}/suspend
   * @todo Replace withDelay mock with HTTP client call
   */
  suspendPortalOrder(id) {
    const orderIndex = portalOrdersState.findIndex((item) => item.id === id);
    if (orderIndex === -1) {
      return withDelay(null, 250, true);
    }

    const order = portalOrdersState[orderIndex];
    portalOrdersState[orderIndex] = {
      ...order,
      status: order.status === ORDER_STATUS_ACTIVE ? ORDER_STATUS_PENDING : order.status
    };

    return withDelay({ ok: true }, 400);
  },
  /**
   * Cancels a portal order.
   * @param {string} id
   * @returns {Promise<{ ok: boolean }>}
   * @endpoint POST /api/v1/portal/orders/{id}/cancel
   * @todo Replace withDelay mock with HTTP client call
   */
  cancelPortalOrder(id) {
    const orderIndex = portalOrdersState.findIndex((item) => item.id === id);
    if (orderIndex === -1) {
      return withDelay(null, 250, true);
    }

    const order = portalOrdersState[orderIndex];
    portalOrdersState[orderIndex] = {
      ...order,
      status: ORDER_STATUS_FAILED
    };

    return withDelay({ ok: true }, 400);
  },
  /**
   * Tops up a portal order package.
   * @param {string} id
   * @returns {Promise<{ ok: boolean }>}
   * @endpoint POST /api/v1/portal/orders/{id}/topup
   * @todo Replace withDelay mock with HTTP client call
   */
  topupPortalOrder(id) {
    const order = portalOrdersState.find((item) => item.id === id);
    if (!order) {
      return withDelay(null, 250, true);
    }

    return withDelay({ ok: true }, 450);
  },

  // ============================================================
  // GROUP ORDER METHODS
  // ============================================================

  /**
   * Fetches detailed group order with all customer eSIM data.
   * @param {string} groupOrderId - The group order ID (e.g., "GO-2025-0142")
   * @returns {Promise<import('./types').GroupOrderDetails|null>}
   * @endpoint GET /api/v1/group-orders/{groupOrderId}
   * @todo Backend - Join: group_orders + customer_groups + orders + partner_customers
   */
  getGroupOrderDetails(groupOrderId) {
    // TODO: Backend - Replace with Supabase query
    const order = groupOrdersMock.find((item) => item.id === groupOrderId) || null;
    return withDelay(order, 400);
  },

  /**
   * Lists all group orders for current partner.
   * @param {{ query?: string }} [params]
   * @returns {Promise<import('./types').GroupOrderSummary[]>}
   * @endpoint GET /api/v1/group-orders
   * @todo Backend - Query group_orders table with partner_id filter
   */
  listGroupOrders(params = {}) {
    const query = normalize(params.query);

    // TODO: Backend - Replace with Supabase query
    const orders = groupOrdersMock
      .filter((order) => {
        if (!query) return true;
        const searchable = [
          order.id,
          order.groupName,
          order.groupCode,
          order.destination
        ].map(normalize);
        return searchable.some((val) => val.includes(query));
      })
      .map((order) => ({
        id: order.id,
        groupId: order.groupId,
        groupName: order.groupName,
        groupCode: order.groupCode,
        status: order.status,
        destination: order.destination,
        destinationCountryCode: order.destinationCountryCode,
        packageName: order.package?.name,
        totalCustomers: order.totalCustomers,
        totalPriceUzs: order.totalPriceUzs,
        partnerPaidUzs: order.partnerPaidUzs,
        createdAt: order.createdAt,
        travelStartDate: order.travelStartDate,
        travelEndDate: order.travelEndDate
      }));

    return withDelay(orders, 350);
  },

  /**
   * Fetches single customer eSIM details within a group order.
   * @param {string} groupOrderId
   * @param {string} customerId
   * @returns {Promise<import('./types').CustomerEsimDetails|null>}
   * @endpoint GET /api/v1/group-orders/{groupOrderId}/customers/{customerId}
   * @todo Backend - Query orders table with group_order_id and end_customer_id
   */
  getGroupOrderCustomerDetails(groupOrderId, customerId) {
    // TODO: Backend - Replace with Supabase query
    const order = groupOrdersMock.find((item) => item.id === groupOrderId);
    if (!order) {
      return withDelay(null, 250, true);
    }

    const customer = order.customers.find((c) => c.id === customerId) || null;
    if (!customer) {
      return withDelay(null, 250, true);
    }

    // Return customer with package info attached
    return withDelay({
      ...customer,
      package: order.package,
      groupOrderId: order.id,
      groupName: order.groupName
    }, 300);
  },

  /**
   * Resends eSIM delivery to a specific customer in a group order.
   * @param {string} groupOrderId
   * @param {string} customerId
   * @param {{ method?: 'sms' | 'email' }} [options]
   * @returns {Promise<{ ok: boolean }>}
   * @endpoint POST /api/v1/group-orders/{groupOrderId}/customers/{customerId}/resend
   * @todo Backend - Trigger delivery service, update esim_delivery_logs
   */
  resendGroupOrderCustomerEsim(groupOrderId, customerId, options = {}) {
    // TODO: Backend - Implement actual resend logic
    const order = groupOrdersMock.find((item) => item.id === groupOrderId);
    if (!order) {
      return withDelay(null, 250, true);
    }

    const customerIndex = order.customers.findIndex((c) => c.id === customerId);
    if (customerIndex === -1) {
      return withDelay(null, 250, true);
    }

    // Mock: Update delivery status to "sent"
    order.customers[customerIndex] = {
      ...order.customers[customerIndex],
      deliveryStatus: DELIVERY_STATUS.SENT,
      deliverySentAt: new Date().toISOString()
    };

    return withDelay({ ok: true }, 400);
  },

  /**
   * Generates install links for a customer's eSIM.
   * @param {string} iccid
   * @returns {{ ios: string, android: string, manual: string }}
   */
  generateInstallLinks(iccid) {
    return {
      ios: `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=LPA:1$esim.onesim.uz$${iccid}`,
      android: `https://esim.onesim.uz/install?iccid=${iccid}`,
      manual: `LPA:1$esim.onesim.uz$${iccid}`
    };
  },

  // ============================================================
  // SINGLE ORDER (MODE 1: TUR AGENT NOMIGA)
  // ============================================================

  /**
   * Creates a single order for the partner themselves (Mode 1).
   * Calls the process-single-order Edge Function.
   *
   * @param {{
   *   packageCode: string,
   *   quantity: number,
   *   deliveryMethod: 'sms' | 'manual',
   *   phone?: string
   * }} payload
   * @returns {Promise<{
   *   success: boolean,
   *   orders?: Array<{
   *     id: string,
   *     iccid: string,
   *     short_url: string,
   *     qr_code_data: string,
   *     activation_code: string,
   *     package_name: string,
   *     delivery_status: string
   *   }>,
   *   sms_sent?: boolean,
   *   summary?: {
   *     total_orders: number,
   *     total_paid_usd: number,
   *     total_discount_usd: number
   *   },
   *   error?: string
   * }>}
   */
  async createSingleOrder(payload) {
    const { packageCode, quantity, deliveryMethod, phone } = payload;

    // Get current session for auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    // Call Edge Function
    const response = await supabase.functions.invoke("process-single-order", {
      body: {
        mode: "agent",
        package_code: packageCode,
        quantity: quantity || 1,
        delivery_method: deliveryMethod || "manual",
        phone: phone || null
      }
    });

    if (response.error) {
      console.error("Edge function error:", response.error);
      return {
        success: false,
        error: response.error.message || "Order processing failed"
      };
    }

    return response.data;
  },

  /**
   * Formats phone number for Uzbekistan (removes +, spaces, ensures 998 prefix)
   * @param {string} phone - Raw phone input
   * @returns {string} - Formatted phone: 998XXXXXXXXX
   */
  formatPhoneNumber(phone) {
    if (!phone) return "";
    // Remove all non-digits
    let digits = phone.replace(/\D/g, "");
    // Add 998 prefix if missing
    if (!digits.startsWith("998") && digits.length === 9) {
      digits = "998" + digits;
    }
    // Remove leading + if present
    if (digits.startsWith("+")) {
      digits = digits.slice(1);
    }
    return digits;
  },

  /**
   * Validates phone number for Uzbekistan format
   * @param {string} phone - Phone number to validate
   * @returns {boolean}
   */
  isValidUzPhone(phone) {
    const formatted = this.formatPhoneNumber(phone);
    return /^998\d{9}$/.test(formatted);
  }
};
