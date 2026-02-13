import { orderDetailsMock, recentOrdersMock } from "../mock/ordersMock";
import { portalOrdersMock, portalPackagesMock } from "../mock/ordersPortalMock";
import { withDelay } from "./utils";

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
  listOrders() {
    // TODO: replace with real API call (ordersService.listOrders)
    return withDelay([...ordersState], 800);
  },
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
      status: "pending",
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
        status: "pending",
        dataUsageGb: 0,
        totalDataGb: portalPackage?.dataGb === -1 ? 999 : portalPackage?.dataGb || 0,
        purchasedAt: new Date().toISOString(),
        paymentTotalUzs: Math.round((payload?.amount || 0) * 12800),
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
  getOrderDetails(id) {
    const details = orderDetailsMock[id] || null;

    // TODO: replace with real API call (ordersService.getOrderDetails)
    return withDelay(details, 700);
  },
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
  getPortalOrderDetails(id) {
    const order = portalOrdersState.find((item) => item.id === id) || null;
    return withDelay(getPortalOrderBundle(order), 450);
  },
  getPortalPackage(packageId) {
    const entry = portalPackagesState.find((item) => item.id === packageId) || null;
    return withDelay(entry, 250);
  },
  getPortalInstallLinks(id) {
    const order = portalOrdersState.find((item) => item.id === id);
    if (!order) {
      return withDelay(null, 250, true);
    }

    return withDelay(buildInstallLinks(order.iccid), 250);
  },
  resendPortalOrder(id) {
    const order = portalOrdersState.find((item) => item.id === id);
    if (!order) {
      return withDelay(null, 250, true);
    }

    return withDelay({ ok: true }, 400);
  },
  suspendPortalOrder(id) {
    const orderIndex = portalOrdersState.findIndex((item) => item.id === id);
    if (orderIndex === -1) {
      return withDelay(null, 250, true);
    }

    const order = portalOrdersState[orderIndex];
    portalOrdersState[orderIndex] = {
      ...order,
      status: order.status === "active" ? "pending" : order.status
    };

    return withDelay({ ok: true }, 400);
  },
  cancelPortalOrder(id) {
    const orderIndex = portalOrdersState.findIndex((item) => item.id === id);
    if (orderIndex === -1) {
      return withDelay(null, 250, true);
    }

    const order = portalOrdersState[orderIndex];
    portalOrdersState[orderIndex] = {
      ...order,
      status: "failed"
    };

    return withDelay({ ok: true }, 400);
  },
  topupPortalOrder(id) {
    const order = portalOrdersState.find((item) => item.id === id);
    if (!order) {
      return withDelay(null, 250, true);
    }

    return withDelay({ ok: true }, 450);
  }
};
