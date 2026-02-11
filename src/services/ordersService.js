import { orderDetailsMock, recentOrdersMock } from "../mock/ordersMock";
import { withDelay } from "./utils";

let ordersState = [...recentOrdersMock];

export const ordersService = {
  listOrders() {
    // TODO: replace with real API call (ordersService.listOrders)
    return withDelay([...ordersState], 800);
  },
  createOrder(payload) {
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

    // TODO: replace with real API call (ordersService.createOrder)
    return withDelay(newOrder, 900);
  },
  getOrderDetails(id) {
    const details = orderDetailsMock[id] || null;

    // TODO: replace with real API call (ordersService.getOrderDetails)
    return withDelay(details, 700);
  }
};
