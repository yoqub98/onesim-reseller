import { supabase } from "../lib/supabase";
import {
  GROUP_ROW_SELECT_VARIANTS,
  GROUP_STATUS_ARCHIVED,
  applySearch,
  buildMemberLookupEmail,
  isMissingColumnError,
  isMissingRelationError,
  inferGroupStatus,
  mapGroupRowsToUi,
  normalizeCode,
  normalizeDeliveryMethod,
  normalizeEmail,
  normalizeGroupStatus,
  normalizeMembers,
  resolvePackageCode,
  resolvePackageName,
  splitName,
  toDateOrNull
} from "./groupsHelpers";

async function resolvePartnerId() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user?.id) {
    throw new Error("Partner session topilmadi");
  }

  const { data: partnerRow, error: partnerError } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", authData.user.id)
    .limit(1)
    .maybeSingle();

  if (partnerError) {
    throw new Error(`Partner profilingizni yuklab bo'lmadi: ${partnerError.message}`);
  }

  if (!partnerRow?.id) {
    throw new Error("Partner profili topilmadi");
  }

  return partnerRow.id;
}

async function fetchGroupRows(partnerId, groupId) {
  let lastError = null;

  for (const selectColumns of GROUP_ROW_SELECT_VARIANTS) {
    let query = supabase
      .from("customer_groups")
      .select(selectColumns)
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false });

    if (groupId) {
      query = query.eq("id", groupId);
    }

    const { data, error } = await query;
    if (!error) return data || [];

    lastError = error;
    if (!isMissingColumnError(error)) break;
  }

  throw new Error(`Guruhlarni yuklab bo'lmadi: ${lastError?.message || "unknown error"}`);
}

async function fetchLatestGroupOrders(partnerId, groupIds = []) {
  if (!groupIds.length) return new Map();

  const { data, error } = await supabase
    .from("group_orders")
    .select("id, customer_group_id, status, created_at, paid_at, ordered_at")
    .eq("partner_id", partnerId)
    .in("customer_group_id", groupIds)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingRelationError(error, "group_orders")) return new Map();
    throw new Error(`Guruh buyurtmalarini yuklab bo'lmadi: ${error.message}`);
  }

  const latestByGroupId = new Map();
  for (const row of data || []) {
    if (!row?.customer_group_id) continue;
    if (latestByGroupId.has(row.customer_group_id)) continue;
    latestByGroupId.set(row.customer_group_id, row);
  }

  return latestByGroupId;
}

async function fetchGroupsInternal(partnerId, groupId) {
  const groupsRows = await fetchGroupRows(partnerId, groupId);

  const groupIds = (groupsRows || []).map((row) => row.id);
  if (!groupIds.length) return [];

  const { data: memberRows, error: membersError } = await supabase
    .from("customer_group_members")
    .select(`
      group_id,
      customer_id,
      partner_customers (
        id,
        first_name,
        last_name,
        email,
        phone,
        tags
      )
    `)
    .in("group_id", groupIds);

  if (membersError) {
    throw new Error(`Guruh mijozlarini yuklab bo'lmadi: ${membersError.message}`);
  }

  const latestGroupOrderByGroupId = await fetchLatestGroupOrders(partnerId, groupIds);
  const groups = mapGroupRowsToUi(groupsRows || [], memberRows || [], latestGroupOrderByGroupId);

  if (groupId) return groups;
  return groups.filter((group) => group.status !== GROUP_STATUS_ARCHIVED);
}

async function upsertMembersAndLinks(partnerId, groupId, members) {
  const normalized = normalizeMembers(members);
  if (!normalized.length) return;

  const usedEmails = new Set();
  const upsertRows = normalized.map((member, index) => {
    const memberEmail = buildMemberLookupEmail(member, index, usedEmails);
    const { firstName, lastName } = splitName(member.name);
    return {
      partner_id: partnerId,
      first_name: firstName,
      last_name: lastName,
      email: memberEmail,
      phone: member.phone || null,
      tags: {
        group_original_name: member.name,
        group_original_email: member.email || null,
        group_original_phone: member.phone || null
      }
    };
  });

  const { data: customerRows, error: customersError } = await supabase
    .from("partner_customers")
    .upsert(upsertRows, { onConflict: "partner_id,email" })
    .select("id, email");

  if (customersError) {
    throw new Error(`Mijozlarni saqlab bo'lmadi: ${customersError.message}`);
  }

  const customerIdByEmail = new Map(
    (customerRows || []).map((row) => [normalizeEmail(row.email), row.id])
  );

  const seenCustomerIds = new Set();
  const linkRows = [];

  for (const row of upsertRows) {
    const customerId = customerIdByEmail.get(normalizeEmail(row.email));
    if (!customerId || seenCustomerIds.has(customerId)) continue;
    seenCustomerIds.add(customerId);
    linkRows.push({ group_id: groupId, customer_id: customerId });
  }

  if (!linkRows.length) return;

  const { error: linksError } = await supabase
    .from("customer_group_members")
    .upsert(linkRows, { onConflict: "group_id,customer_id" });

  if (linksError) {
    throw new Error(`Guruhga mijoz biriktirib bo'lmadi: ${linksError.message}`);
  }
}

export const groupsService = {
  async listGroups(params = {}) {
    const partnerId = await resolvePartnerId();
    const groups = await fetchGroupsInternal(partnerId);
    return applySearch(groups, params?.query);
  },

  async createGroup(payload) {
    const partnerId = await resolvePartnerId();
    const members = normalizeMembers(payload?.members);
    const packageCode = resolvePackageCode(payload);
    const packageName = resolvePackageName(payload);
    const status = normalizeGroupStatus(payload?.status || inferGroupStatus(packageCode));

    const { data: createdRow, error: createError } = await supabase
      .from("customer_groups")
      .insert({
        partner_id: partnerId,
        name: payload?.name?.trim() || "Yangi guruh",
        destination_country_code: normalizeCode(
          payload?.destinationCountryCode || payload?.destination
        ) || null,
        travel_start_date: toDateOrNull(payload?.travelStartDate),
        travel_end_date: toDateOrNull(payload?.travelEndDate),
        group_size: members.length,
        status,
        default_package_code: packageCode || null,
        default_package_name: packageName || null,
        default_delivery_method: normalizeDeliveryMethod(payload?.deliveryMethod)
      })
      .select("id")
      .single();

    if (createError) {
      throw new Error(`Guruh yaratib bo'lmadi: ${createError.message}`);
    }

    if (members.length > 0) {
      await upsertMembersAndLinks(partnerId, createdRow.id, members);
    }

    const createdGroups = await fetchGroupsInternal(partnerId, createdRow.id);
    return createdGroups[0] || null;
  },

  async updateGroup(groupId, patch) {
    const partnerId = await resolvePartnerId();
    const existingGroups = await fetchGroupsInternal(partnerId, groupId);
    const existingGroup = existingGroups[0];

    if (!existingGroup) {
      throw new Error("Guruh topilmadi");
    }

    const packageCode = resolvePackageCode(patch, existingGroup.packageCode || existingGroup.packageId || "");
    const packageName = resolvePackageName(patch, existingGroup.packageName || existingGroup.packageLabel || "");
    const nextMembers = Array.isArray(patch?.members) ? normalizeMembers(patch.members) : null;

    const { error: updateError } = await supabase
      .from("customer_groups")
      .update({
        name: patch?.name?.trim() || existingGroup.name,
        destination_country_code: normalizeCode(
          patch?.destinationCountryCode
          ?? patch?.destination
          ?? existingGroup.destinationCountryCode
          ?? existingGroup.destination
        ) || null,
        travel_start_date: patch?.travelStartDate !== undefined
          ? toDateOrNull(patch.travelStartDate)
          : toDateOrNull(existingGroup.travelStartDate),
        travel_end_date: patch?.travelEndDate !== undefined
          ? toDateOrNull(patch.travelEndDate)
          : toDateOrNull(existingGroup.travelEndDate),
        group_size: nextMembers ? nextMembers.length : (existingGroup.members?.length || 0),
        status: normalizeGroupStatus(patch?.status || inferGroupStatus(packageCode)),
        default_package_code: packageCode || null,
        default_package_name: packageName || null,
        default_delivery_method: normalizeDeliveryMethod(patch?.deliveryMethod ?? existingGroup.deliveryMethod)
      })
      .eq("id", groupId)
      .eq("partner_id", partnerId);

    if (updateError) {
      throw new Error(`Guruhni yangilab bo'lmadi: ${updateError.message}`);
    }

    if (nextMembers) {
      const { error: clearMembersError } = await supabase
        .from("customer_group_members")
        .delete()
        .eq("group_id", groupId);

      if (clearMembersError) {
        throw new Error(`Guruh mijozlarini yangilab bo'lmadi: ${clearMembersError.message}`);
      }

      await upsertMembersAndLinks(partnerId, groupId, nextMembers);
    }

    const updatedGroups = await fetchGroupsInternal(partnerId, groupId);
    return updatedGroups[0] || null;
  },

  async deleteGroup(groupId) {
    const partnerId = await resolvePartnerId();
    const { error } = await supabase
      .from("customer_groups")
      .update({ status: GROUP_STATUS_ARCHIVED })
      .eq("id", groupId)
      .eq("partner_id", partnerId);

    if (error) {
      throw new Error(`Guruhni o'chirib bo'lmadi: ${error.message}`);
    }

    return { ok: true };
  }
};
