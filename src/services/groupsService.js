import { groupsMock } from "../mock/groupsMock";
import { DELIVERY_SMS } from "../constants/delivery";
import { withDelay } from "./utils";

let groupsState = [...groupsMock];

export const groupsService = {
  /**
   * Lists all reseller customer groups.
   * @param {void} [_params]
   * @returns {Promise<import('./types').Group[]>}
   * @endpoint GET /api/v1/groups
   * @todo Replace withDelay mock with HTTP client call
   */
  listGroups() {
    // TODO: replace with real API call (groupsService.listGroups)
    return withDelay([...groupsState], 700);
  },
  /**
   * Creates a new customer group.
   * @param {{ name?: string, members?: import('./types').Customer[], deliveryMethod?: 'sms'|'email'|'operator'|'manual', deliveryTime?: 'now'|'scheduled' }} payload
   * @returns {Promise<import('./types').Group>}
   * @endpoint POST /api/v1/groups
   * @todo Replace withDelay mock with HTTP client call
   */
  createGroup(payload) {
    const newGroup = {
      id: `GRP-00${groupsState.length + 1}`,
      name: payload?.name || "Yangi guruh",
      members: payload?.members || [],
      deliveryMethod: payload?.deliveryMethod || DELIVERY_SMS,
      deliveryTime: payload?.deliveryTime || "now"
    };

    groupsState = [newGroup, ...groupsState];

    // TODO: replace with real API call (groupsService.createGroup)
    return withDelay(newGroup, 850);
  }
};
