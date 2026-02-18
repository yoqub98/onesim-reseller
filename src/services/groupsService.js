import { DELIVERY_SMS } from "../constants/delivery";
import { supabase } from "../lib/supabase";

const FALLBACK_EMAIL_DOMAIN = "onesim.group.local";
const GROUP_TAG_PREFIX = "group_";

const GROUP_STATUS_DRAFT = "draft";
const GROUP_STATUS_READY = "ready";
const GROUP_STATUS_ARCHIVED = "archived";

const GROUP_ROW_SELECT_VARIANTS = [
  `
    id,
    name,
    destination_name,
    destination_country_code,
    travel_start_date,
    travel_end_date,
    group_size,
    status,
    default_package_code,
    default_package_name,
    default_delivery_method,
    tags,
    created_at
  `,
  `
    id,
    name,
    destination_country_code,
    travel_start_date,
    travel_end_date,
    group_size,
    status,
    default_package_code,
    default_package_name,
    default_delivery_method,
    tags,
    created_at
  `,
  `
    id,
    name,
    destination_country_code,
    travel_start_date,
    travel_end_date,
    group_size,
    status,
    default_package_code,
    default_package_name,
    default_delivery_method,
    created_at
  `
];

function asPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value;
}

function normalizeMembers(members = []) {
  return members
    .map((member) => ({
      name: member?.name?.trim() || "",
      phone: member?.phone?.trim() || "",
      email: member?.email?.trim().toLowerCase() || ""
    }))
    .filter((member) => member.name);
}

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeDeliveryMethod(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "email" || normalized === "manual" || normalized === "sms") {
    return normalized;
  }
  return DELIVERY_SMS;
}

function normalizeGroupStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === GROUP_STATUS_DRAFT || normalized === GROUP_STATUS_READY || normalized === GROUP_STATUS_ARCHIVED) {
    return normalized;
  }
  return GROUP_STATUS_DRAFT;
}

function splitName(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const firstName = parts[0] || "Customer";
  const lastName = parts.slice(1).join(" ") || "-";
  return { firstName, lastName };
}

function slugify(value) {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\./, "")
    .replace(/\.$/, "");

  return normalized || "customer";
}

function buildFallbackEmail(member, index) {
  const phoneDigits = String(member?.phone || "").replace(/\D+/g, "");
  if (phoneDigits) {
    return `phone.${phoneDigits}@${FALLBACK_EMAIL_DOMAIN}`;
  }

  const nameSlug = slugify(member?.name);
  return `${nameSlug}.${index + 1}@${FALLBACK_EMAIL_DOMAIN}`;
}

function buildMemberLookupEmail(member, index, used) {
  const explicitEmail = normalizeEmail(member?.email);
  let email = explicitEmail || buildFallbackEmail(member, index);

  if (!used.has(email)) {
    used.add(email);
    return email;
  }

  const atIndex = email.indexOf("@");
  const localPart = atIndex === -1 ? email : email.slice(0, atIndex);
  const domainPart = atIndex === -1 ? FALLBACK_EMAIL_DOMAIN : email.slice(atIndex + 1);

  let suffix = 2;
  while (used.has(`${localPart}+${suffix}@${domainPart}`)) {
    suffix += 1;
  }
  const uniqueEmail = `${localPart}+${suffix}@${domainPart}`;
  used.add(uniqueEmail);
  return uniqueEmail;
}

function toDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function toIsoOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function createGroupCode(id) {
  const compact = String(id || "").replace(/-/g, "").slice(0, 8).toUpperCase();
  return `GRP-${compact || "UNKNOWN"}`;
}

function readGroupTags(tags) {
  const safeTags = asPlainObject(tags);
  const pkg = asPlainObject(safeTags[`${GROUP_TAG_PREFIX}package`]);

  return {
    deliveryMethod: safeTags[`${GROUP_TAG_PREFIX}delivery_method`] || DELIVERY_SMS,
    packageStatus: safeTags[`${GROUP_TAG_PREFIX}package_status`] || "unassigned",
    esimOrderStatus: safeTags[`${GROUP_TAG_PREFIX}esim_order_status`] || "not_ordered",
    packageScheduledAt: toIsoOrNull(safeTags[`${GROUP_TAG_PREFIX}package_scheduled_at`]),
    packageLabel: safeTags[`${GROUP_TAG_PREFIX}package_label`] || "",
    package: pkg
  };
}

function mapCustomerRowToMember(row) {
  const tags = asPlainObject(row?.tags);
  const nameFromTags = String(tags.group_original_name || "").trim();
  const firstName = String(row?.first_name || "").trim();
  const lastName = String(row?.last_name || "").trim();
  const fullName = nameFromTags || [firstName, lastName === "-" ? "" : lastName].filter(Boolean).join(" ").trim();
  const email = normalizeEmail(row?.email);
  const isFallbackEmail = email.endsWith(`@${FALLBACK_EMAIL_DOMAIN}`);

  return {
    name: fullName || "Customer",
    phone: row?.phone || tags.group_original_phone || "",
    email: isFallbackEmail ? (tags.group_original_email || "") : email
  };
}

function mapGroupOrderStatusToUi(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "completed") {
    return "ordered";
  }
  if (normalized === "failed") {
    return "failed";
  }
  if (normalized === "paid" || normalized === "api_ordering") {
    return "ordering";
  }
  return "not_ordered";
}

function inferGroupStatus(packageCode) {
  return packageCode ? GROUP_STATUS_READY : GROUP_STATUS_DRAFT;
}

function resolvePackageCode(input = {}, fallback = "") {
  const candidates = [input.packageCode, input.defaultPackageCode, input.packageId, fallback];
  for (const candidate of candidates) {
    const value = String(candidate || "").trim();
    if (value) return value;
  }
  return "";
}

function resolvePackageName(input = {}, fallback = "") {
  const candidates = [input.packageName, input.defaultPackageName, input.packageLabel, fallback];
  for (const candidate of candidates) {
    const value = String(candidate || "").trim();
    if (value) return value;
  }
  return "";
}

function isMissingColumnError(error) {
  const message = String(error?.message || "");
  return /column .* does not exist/i.test(message) || /could not find the '.*' column/i.test(message);
}

function isMissingRelationError(error, relationName) {
  const message = String(error?.message || "");
  const relationLower = String(relationName || "").toLowerCase();
  return (
    new RegExp(`relation ['"]?${relationLower}['"]? does not exist`, "i").test(message)
    || new RegExp(`could not find the table ['"]?${relationLower}['"]?`, "i").test(message)
  );
}

function mapGroupRowsToUi(groupsRows = [], memberRows = [], latestGroupOrderByGroupId = new Map()) {
  const membersByGroupId = new Map();

  for (const row of memberRows) {
    const groupId = row?.group_id;
    if (!groupId) continue;

    const related = Array.isArray(row.partner_customers)
      ? row.partner_customers[0]
      : row.partner_customers;
    if (!related) continue;

    const nextMember = mapCustomerRowToMember(related);
    const existing = membersByGroupId.get(groupId) || [];
    existing.push(nextMember);
    membersByGroupId.set(groupId, existing);
  }

  return groupsRows.map((row) => {
    const groupTags = readGroupTags(row.tags);
    const packageMeta = asPlainObject(groupTags.package);
    const packageCode = row.default_package_code || packageMeta.id || "";
    const packageName = row.default_package_name || packageMeta.name || "";
    const packageLabel =
      packageName
      || groupTags.packageLabel
      || (packageMeta.id
        ? `${packageMeta.name || "Package"} (${packageMeta.dataLabel || "-"} / ${packageMeta.validityDays || 0} kun)`
        : "");
    const latestGroupOrder = latestGroupOrderByGroupId.get(row.id);
    const orderStatus = mapGroupOrderStatusToUi(latestGroupOrder?.status);
    const packageScheduledAt =
      toIsoOrNull(latestGroupOrder?.ordered_at)
      || toIsoOrNull(latestGroupOrder?.paid_at)
      || toIsoOrNull(latestGroupOrder?.created_at)
      || groupTags.packageScheduledAt
      || null;

    return {
      id: row.id,
      code: createGroupCode(row.id),
      name: row.name || "Yangi guruh",
      destination: row.destination_name || packageMeta.destination || row.destination_country_code || "",
      destinationCountryCode: normalizeCode(row.destination_country_code || packageMeta.countryCode || ""),
      travelStartDate: row.travel_start_date || null,
      travelEndDate: row.travel_end_date || null,
      status: normalizeGroupStatus(row.status || inferGroupStatus(packageCode)),
      packageId: packageCode,
      packageCode,
      packageName,
      packageLabel,
      packageStatus: packageCode ? "assigned" : groupTags.packageStatus || "unassigned",
      esimOrderStatus: orderStatus || groupTags.esimOrderStatus || "not_ordered",
      packageScheduledAt,
      members: membersByGroupId.get(row.id) || [],
      deliveryMethod: normalizeDeliveryMethod(row.default_delivery_method || groupTags.deliveryMethod),
      deliveryTime: "now"
    };
  });
}

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
    if (!error) {
      return data || [];
    }

    lastError = error;
    if (!isMissingColumnError(error)) {
      break;
    }
  }

  throw new Error(`Guruhlarni yuklab bo'lmadi: ${lastError?.message || "unknown error"}`);
}

async function fetchLatestGroupOrders(partnerId, groupIds = []) {
  if (!groupIds.length) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("group_orders")
    .select("id, customer_group_id, status, created_at, paid_at, ordered_at")
    .eq("partner_id", partnerId)
    .in("customer_group_id", groupIds)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingRelationError(error, "group_orders")) {
      return new Map();
    }
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
  if (!groupIds.length) {
    return [];
  }

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

  if (groupId) {
    return groups;
  }

  return groups.filter((group) => group.status !== GROUP_STATUS_ARCHIVED);
}

async function upsertMembersAndLinks(partnerId, groupId, members) {
  const normalized = normalizeMembers(members);
  if (!normalized.length) {
    return;
  }

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

  if (!linkRows.length) {
    return;
  }

  const { error: linksError } = await supabase
    .from("customer_group_members")
    .upsert(linkRows, { onConflict: "group_id,customer_id" });

  if (linksError) {
    throw new Error(`Guruhga mijoz biriktirib bo'lmadi: ${linksError.message}`);
  }
}

function applySearch(groups, query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) {
    return groups;
  }

  return groups.filter((group) => {
    const searchable = [
      group.name,
      group.code,
      group.destination,
      group.destinationCountryCode,
      group.status,
      group.packageLabel,
      group.packageCode,
      group.deliveryMethod,
      ...(group.members || []).flatMap((member) => [member.name, member.phone, member.email])
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(normalizedQuery);
  });
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
