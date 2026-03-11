/**
 * Customers Service
 *
 * Backend handoff:
 * - Main DB table: public.partner_customers
 * - Related: public.orders, public.customer_groups
 *
 * TODO: Backend - Replace mock data with Supabase queries
 */

import { customersMock, CUSTOMER_STATUS } from "../mock/customersMock";
import { withDelay } from "./utils";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export const customersService = {
  /**
   * Lists all customers for current partner with optional filtering.
   * @param {{ query?: string, status?: string }} [params]
   * @returns {Promise<import('./types').Customer[]>}
   * @endpoint GET /api/v1/customers
   * @todo Backend - Query partner_customers with partner_id filter
   */
  listCustomers(params = {}) {
    const query = normalize(params.query);
    const statusFilter = params.status || "all";

    // TODO: Backend - Replace with Supabase query
    const customers = customersMock
      .filter((customer) => {
        // Search filter
        if (query) {
          const searchable = [
            customer.name,
            customer.phone,
            customer.email,
            customer.id
          ].map(normalize);

          if (!searchable.some((val) => val.includes(query))) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== "all") {
          if (statusFilter === "active" && customer.status !== CUSTOMER_STATUS.ACTIVE) {
            return false;
          }
          if (statusFilter === "inactive" && customer.status !== CUSTOMER_STATUS.INACTIVE) {
            return false;
          }
          if (statusFilter === "new" && customer.status !== CUSTOMER_STATUS.NEW) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());

    return withDelay(customers, 400);
  },

  /**
   * Fetches detailed customer info including order history.
   * @param {string} customerId
   * @returns {Promise<import('./types').CustomerDetails|null>}
   * @endpoint GET /api/v1/customers/{customerId}
   * @todo Backend - Query partner_customers + orders join
   */
  getCustomerDetails(customerId) {
    // TODO: Backend - Replace with Supabase query
    const customer = customersMock.find((c) => c.id === customerId) || null;
    return withDelay(customer, 300);
  },

  /**
   * Creates a new customer.
   * @param {{ name: string, phone?: string, email?: string }} payload
   * @returns {Promise<import('./types').Customer>}
   * @endpoint POST /api/v1/customers
   * @todo Backend - Insert into partner_customers
   */
  createCustomer(payload) {
    // TODO: Backend - Replace with Supabase insert
    const newCustomer = {
      id: `cust-${Date.now()}`,
      name: payload.name,
      phone: payload.phone || null,
      email: payload.email || null,
      status: CUSTOMER_STATUS.NEW,
      createdAt: new Date().toISOString(),
      lastOrderDate: null,
      totalOrders: 0,
      activeEsims: 0,
      totalSpentUzs: 0,
      groups: [],
      recentOrders: []
    };

    customersMock.unshift(newCustomer);
    return withDelay(newCustomer, 400);
  },

  /**
   * Updates customer info.
   * @param {string} customerId
   * @param {{ name?: string, phone?: string, email?: string }} payload
   * @returns {Promise<import('./types').Customer>}
   * @endpoint PUT /api/v1/customers/{customerId}
   * @todo Backend - Update partner_customers
   */
  updateCustomer(customerId, payload) {
    // TODO: Backend - Replace with Supabase update
    const index = customersMock.findIndex((c) => c.id === customerId);
    if (index === -1) {
      return withDelay(null, 250, true);
    }

    const updated = {
      ...customersMock[index],
      ...payload
    };
    customersMock[index] = updated;

    return withDelay(updated, 350);
  },

  /**
   * Deletes a customer.
   * @param {string} customerId
   * @returns {Promise<{ ok: boolean }>}
   * @endpoint DELETE /api/v1/customers/{customerId}
   * @todo Backend - Delete from partner_customers (or soft delete)
   */
  deleteCustomer(customerId) {
    // TODO: Backend - Replace with Supabase delete
    const index = customersMock.findIndex((c) => c.id === customerId);
    if (index === -1) {
      return withDelay(null, 250, true);
    }

    customersMock.splice(index, 1);
    return withDelay({ ok: true }, 300);
  },

  /**
   * Gets customer order history.
   * @param {string} customerId
   * @returns {Promise<import('./types').CustomerOrder[]>}
   * @endpoint GET /api/v1/customers/{customerId}/orders
   * @todo Backend - Query orders with end_customer_id filter
   */
  getCustomerOrders(customerId) {
    // TODO: Backend - Replace with Supabase query
    const customer = customersMock.find((c) => c.id === customerId);
    if (!customer) {
      return withDelay([], 250);
    }

    return withDelay(customer.recentOrders || [], 300);
  },

  /**
   * Gets groups customer belongs to.
   * @param {string} customerId
   * @returns {Promise<import('./types').CustomerGroup[]>}
   * @endpoint GET /api/v1/customers/{customerId}/groups
   * @todo Backend - Query customer_group_members join
   */
  getCustomerGroups(customerId) {
    // TODO: Backend - Replace with Supabase query
    const customer = customersMock.find((c) => c.id === customerId);
    if (!customer) {
      return withDelay([], 250);
    }

    return withDelay(customer.groups || [], 300);
  }
};
