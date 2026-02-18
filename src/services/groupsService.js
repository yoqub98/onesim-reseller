import { DELIVERY_SMS } from "../constants/delivery";
import { groupsMock } from "../mock/groupsMock";
import { withDelay } from "./utils";

let groupsState = [...groupsMock];

function normalizeMembers(members = []) {
  return members
    .map((member) => ({
      name: member?.name?.trim() || "",
      phone: member?.phone?.trim() || "",
      email: member?.email?.trim() || ""
    }))
    .filter((member) => member.name);
}

function createGroupCode() {
  return `GRP-${String(1000 + groupsState.length + 1).padStart(4, "0")}`;
}

/**
 * Backend handoff:
 * - Tables: public.customer_groups, public.customer_group_members, public.partner_customers
 * - Ownership key: customer_groups.partner_id = current partner
 * - Catalog integration: package assignment can be persisted as metadata/tags or dedicated relation table
 */
export const groupsService = {
  /**
   * Lists all reseller customer groups with optional search query.
   * @param {{ query?: string }} [params]
   * @returns {Promise<import('./types').Group[]>}
   * @endpoint GET /api/v1/groups?query=
   * @todo Replace withDelay mock with HTTP or Supabase query
   */
  listGroups(params = {}) {
    const query = params?.query?.trim().toLowerCase();

    const filtered = !query
      ? [...groupsState]
      : groupsState.filter((group) => {
        const searchable = [
          group.name,
          group.code,
          group.destination,
          group.destinationCountryCode,
          group.packageLabel
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      });

    return withDelay(filtered, 360);
  },

  /**
   * Creates a new customer group.
   * @param {Partial<import('./types').Group>} payload
   * @returns {Promise<import('./types').Group>}
   * @endpoint POST /api/v1/groups
   * @todo Backend flow:
   * 1) insert customer_groups row
   * 2) upsert partner_customers from members
   * 3) insert customer_group_members links
   */
  createGroup(payload) {
    const nextGroup = {
      id: crypto.randomUUID(),
      code: createGroupCode(),
      name: payload?.name?.trim() || "Yangi guruh",
      destination: payload?.destination?.trim() || "Belgilanmagan",
      destinationCountryCode: payload?.destinationCountryCode?.trim()?.toUpperCase() || "",
      travelStartDate: payload?.travelStartDate || null,
      travelEndDate: payload?.travelEndDate || null,
      packageId: payload?.packageId || "",
      packageLabel: payload?.packageLabel || "",
      packageStatus: payload?.packageStatus || "unassigned",
      packageScheduledAt: payload?.packageScheduledAt || null,
      members: normalizeMembers(payload?.members),
      deliveryMethod: payload?.deliveryMethod || DELIVERY_SMS,
      deliveryTime: payload?.deliveryTime || "now"
    };

    groupsState = [nextGroup, ...groupsState];

    return withDelay(nextGroup, 500);
  },

  /**
   * Updates an existing customer group by id.
   * @param {string} groupId
   * @param {Partial<import('./types').Group>} patch
   * @returns {Promise<import('./types').Group|null>}
   * @endpoint PATCH /api/v1/groups/:groupId
   * @todo Replace with server-side validation + partner ownership check.
   */
  updateGroup(groupId, patch) {
    let updated = null;

    groupsState = groupsState.map((group) => {
      if (group.id !== groupId) {
        return group;
      }

      updated = {
        ...group,
        ...patch,
        members: patch?.members ? normalizeMembers(patch.members) : group.members
      };

      return updated;
    });

    return withDelay(updated, 380);
  },

  /**
   * Deletes a customer group by id.
   * @param {string} groupId
   * @returns {Promise<{ ok: boolean }>}.
   * @endpoint DELETE /api/v1/groups/:groupId
   * @todo Backend delete should remove customer_group_members rows first or cascade.
   */
  deleteGroup(groupId) {
    groupsState = groupsState.filter((group) => group.id !== groupId);
    return withDelay({ ok: true }, 300);
  }
};
