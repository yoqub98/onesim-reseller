import { plansMock } from "../mock/catalogMock";
import { withDelay } from "./utils";

/**
 * Backend handoff:
 * - Target endpoint: ENDPOINTS.catalog.plans
 * - Contract reference: src/services/CONTRACTS.md#2-catalogservice
 * - Row mapping helper: mapPackageRowToPlan() in src/services/supabaseMappers.js
 */
export const catalogService = {
  /**
   * Fetches reseller catalog plans.
   * @param {void} [_params]
   * @returns {Promise<import('./types').Plan[]>}
   * @endpoint GET /api/v1/catalog/plans
   * @todo Replace withDelay mock with HTTP client call
   */
  getPlans() {
    // TODO: replace with real API call (catalogService.getPlans)
    return withDelay([...plansMock], 650);
  }
};
