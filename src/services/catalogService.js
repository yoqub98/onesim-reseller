import { plansMock } from "../mock/catalogMock";
import { withDelay } from "./utils";

export const catalogService = {
  getPlans() {
    // TODO: replace with real API call (catalogService.getPlans)
    return withDelay([...plansMock], 650);
  }
};
