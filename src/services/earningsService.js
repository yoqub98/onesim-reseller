import { earningsSummaryMock } from "../mock/earningsMock";
import { withDelay } from "./utils";

export const earningsService = {
  /**
   * Fetches reseller earnings summary metrics.
   * @param {void} [_params]
   * @returns {Promise<import('./types').EarningsSummary>}
   * @endpoint GET /api/v1/earnings/summary
   * @todo Replace withDelay mock with HTTP client call
   */
  getSummary() {
    // TODO: replace with real API call (earningsService.getSummary)
    return withDelay({ ...earningsSummaryMock }, 750);
  }
};
