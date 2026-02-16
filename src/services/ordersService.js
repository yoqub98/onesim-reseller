import { orderDetailsMock, recentOrdersMock } from "../mock/ordersMock";
import { portalOrdersMock, portalPackagesMock } from "../mock/ordersPortalMock";
import { USD_TO_UZS_RATE } from "../constants/currency";
import {
  ORDER_STATUS_ACTIVE,
  ORDER_STATUS_FAILED,
  ORDER_STATUS_PENDING
} from "../constants/statuses";
import { withDelay } from "./utils";

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

    const rows = portalOrdersState
      .filter((order) => order.orderType === expectedType)
      .map((order) => getPortalOrderBundle(order))
      .filter(Boolean)
      .filter((entry) => {
        if (!query) {
          return true;
        }

        const searchable = [
          entry.id,
          entry.customerName,
          entry.customerPhone,
          entry.customerEmail,
          entry.groupName,
          entry.package?.name,
          entry.package?.destination
        ].map(normalize);

        return searchable.some((value) => value.includes(query));
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
  }
};
