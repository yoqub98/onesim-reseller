import { groupsMock } from "../mock/groupsMock";
import { withDelay } from "./utils";

let groupsState = [...groupsMock];

export const groupsService = {
  listGroups() {
    // TODO: replace with real API call (groupsService.listGroups)
    return withDelay([...groupsState], 700);
  },
  createGroup(payload) {
    const newGroup = {
      id: `GRP-00${groupsState.length + 1}`,
      name: payload?.name || "Yangi guruh",
      members: payload?.members || [],
      deliveryMethod: payload?.deliveryMethod || "sms",
      deliveryTime: payload?.deliveryTime || "now"
    };

    groupsState = [newGroup, ...groupsState];

    // TODO: replace with real API call (groupsService.createGroup)
    return withDelay(newGroup, 850);
  }
};
