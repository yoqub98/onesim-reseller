import { earningsSummaryMock } from "../mock/earningsMock";
import { withDelay } from "./utils";

export const earningsService = {
  getSummary() {
    // TODO: replace with real API call (earningsService.getSummary)
    return withDelay({ ...earningsSummaryMock }, 750);
  }
};
