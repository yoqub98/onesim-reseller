import {
  DELIVERY_SMS
} from "../constants/delivery";
import { supabase } from "../lib/supabase";

const FALLBACK_EMAIL_DOMAIN = "onesim.group.local";
const GROUP_TAG_PREFIX = "group_";

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

function mergeGroupTags(existingTags, patch = {}) {
  const prev = asPlainObject(existingTags);
  const prevPackage = asPlainObject(prev[`${GROUP_TAG_PREFIX}package`]);
  const hasPackageId = Object.prototype.hasOwnProperty.call(patch, "packageId");
  const packagePayload = hasPackageId
    ? (patch?.packageId
      ? {
        id: patch.packageId,
        name: patch.packageName ?? prevPackage.name ?? "",
        destination: patch.packageDestination ?? prevPackage.destination ?? "",
        countryCode: patch.packageCountryCode ?? prevPackage.countryCode ?? "",
        dataLabel: patch.packageDataLabel ?? prevPackage.dataLabel ?? "",
        validityDays: patch.packageValidityDays ?? prevPackage.validityDays ?? 0,
        resellerPriceUzs: patch.packageResellerPriceUzs ?? prevPackage.resellerPriceUzs ?? 0,
        resellerPriceUsd: patch.packageResellerPriceUsd ?? prevPackage.resellerPriceUsd ?? 0
      }
      : null)
    : undefined;

  const merged = {
    ...prev,
    [`${GROUP_TAG_PREFIX}delivery_method`]: patch.deliveryMethod ?? prev[`${GROUP_TAG_PREFIX}delivery_method`] ?? DELIVERY_SMS,
    [`${GROUP_TAG_PREFIX}delivery_time`]: patch.deliveryTime ?? prev[`${GROUP_TAG_PREFIX}delivery_time`] ?? "now",
    [`${GROUP_TAG_PREFIX}package_status`]: patch.packageStatus ?? prev[`${GROUP_TAG_PREFIX}package_status`] ?? "unassigned",
    [`${GROUP_TAG_PREFIX}esim_order_status`]: patch.esimOrderStatus ?? prev[`${GROUP_TAG_PREFIX}esim_order_status`] ?? "not_ordered",
    [`${GROUP_TAG_PREFIX}package_scheduled_at`]: patch.packageScheduledAt ?? prev[`${GROUP_TAG_PREFIX}package_scheduled_at`] ?? null,
    [`${GROUP_TAG_PREFIX}package_label`]: patch.packageLabel ?? prev[`${GROUP_TAG_PREFIX}package_label`] ?? "",
    [`${GROUP_TAG_PREFIX}package`]:
      packagePayload === undefined
        ? (prev[`${GROUP_TAG_PREFIX}package`] ?? null)
        : packagePayload
  };

  return merged;
}

function readGroupTags(tags) {
  const safeTags = asPlainObject(tags);
  const pkg = asPlainObject(safeTags[`${GROUP_TAG_PREFIX}package`]);

  return {
    deliveryMethod: safeTags[`${GROUP_TAG_PREFIX}delivery_method`] || DELIVERY_SMS,
    deliveryTime: safeTags[`${GROUP_TAG_PREFIX}delivery_time`] || "now",
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

function mapGroupRowsToUi(groupsRows = [], memberRows = []) {
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
    const packageLabel =
      groupTags.packageLabel
      || (packageMeta.id
        ? `${packageMeta.name || "Package"} (${packageMeta.dataLabel || "-"} / ${packageMeta.validityDays || 0} kun)`
        : "");

    return {
      id: row.id,
      code: createGroupCode(row.id),
      name: row.name || "Yangi guruh",
      destination: row.destination_name || packageMeta.destination || "",
      destinationCountryCode: normalizeCode(row.destination_country_code || packageMeta.countryCode || ""),
      travelStartDate: row.travel_start_date || null,
      travelEndDate: row.travel_end_date || null,
      packageId: packageMeta.id || "",
      packageLabel,
      packageStatus: groupTags.packageStatus || "unassigned",
      esimOrderStatus: groupTags.esimOrderStatus || "not_ordered",
      packageScheduledAt: groupTags.packageScheduledAt || null,
      members: membersByGroupId.get(row.id) || [],
      deliveryMethod: groupTags.deliveryMethod || DELIVERY_SMS,
      deliveryTime: groupTags.deliveryTime || "now"
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

async function fetchGroupsInternal(partnerId, groupId) {
  let query = supabase
    .from("customer_groups")
    .select(`
      id,
      name,
      destination_name,
      destination_country_code,
      travel_start_date,
      travel_end_date,
      tags,
      is_active,
      created_at
    `)
    .eq("partner_id", partnerId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (groupId) {
    query = query.eq("id", groupId);
  }

  const { data: groupsRows, error: groupsError } = await query;
  if (groupsError) {
    throw new Error(`Guruhlarni yuklab bo'lmadi: ${groupsError.message}`);
  }

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

  return mapGroupRowsToUi(groupsRows || [], memberRows || []);
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
      group.packageLabel,
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
    const nowIso = new Date().toISOString();
    const tags = mergeGroupTags({}, {
      deliveryMethod: payload?.deliveryMethod || DELIVERY_SMS,
      deliveryTime: payload?.deliveryTime || "now",
      packageId: payload?.packageId || "",
      packageLabel: payload?.packageLabel || "",
      packageStatus: payload?.packageStatus || "unassigned",
      esimOrderStatus: payload?.esimOrderStatus || "not_ordered",
      packageScheduledAt: payload?.packageScheduledAt || null,
      packageName: payload?.packageName || "",
      packageDestination: payload?.packageDestination || "",
      packageCountryCode: payload?.packageCountryCode || "",
      packageDataLabel: payload?.packageDataLabel || "",
      packageValidityDays: payload?.packageValidityDays || 0,
      packageResellerPriceUzs: payload?.packageResellerPriceUzs || 0,
      packageResellerPriceUsd: payload?.packageResellerPriceUsd || 0
    });

    const { data: createdRow, error: createError } = await supabase
      .from("customer_groups")
      .insert({
        partner_id: partnerId,
        name: payload?.name?.trim() || "Yangi guruh",
        destination_name: payload?.destination?.trim() || "Belgilanmagan",
        destination_country_code: normalizeCode(payload?.destinationCountryCode),
        travel_start_date: toDateOrNull(payload?.travelStartDate),
        travel_end_date: toDateOrNull(payload?.travelEndDate),
        group_size: members.length,
        tags: {
          ...tags,
          [`${GROUP_TAG_PREFIX}created_at`]: nowIso
        },
        is_active: true
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

    const { data: currentGroupRow, error: currentGroupError } = await supabase
      .from("customer_groups")
      .select("tags")
      .eq("id", groupId)
      .eq("partner_id", partnerId)
      .single();

    if (currentGroupError) {
      throw new Error(`Guruh holatini o'qib bo'lmadi: ${currentGroupError.message}`);
    }

    const nextTags = mergeGroupTags(currentGroupRow?.tags, {
      deliveryMethod: patch?.deliveryMethod ?? existingGroup.deliveryMethod,
      deliveryTime: patch?.deliveryTime ?? existingGroup.deliveryTime,
      packageId: patch?.packageId ?? existingGroup.packageId,
      packageLabel: patch?.packageLabel ?? existingGroup.packageLabel,
      packageStatus: patch?.packageStatus ?? existingGroup.packageStatus,
      esimOrderStatus: patch?.esimOrderStatus ?? existingGroup.esimOrderStatus,
      packageScheduledAt: patch?.packageScheduledAt ?? existingGroup.packageScheduledAt,
      packageName: patch?.packageName,
      packageDestination: patch?.packageDestination,
      packageCountryCode: patch?.packageCountryCode,
      packageDataLabel: patch?.packageDataLabel,
      packageValidityDays: patch?.packageValidityDays,
      packageResellerPriceUzs: patch?.packageResellerPriceUzs,
      packageResellerPriceUsd: patch?.packageResellerPriceUsd
    });

    const nextMembers = Array.isArray(patch?.members) ? normalizeMembers(patch.members) : null;

    const { error: updateError } = await supabase
      .from("customer_groups")
      .update({
        name: patch?.name?.trim() || existingGroup.name,
        destination_name: patch?.destination?.trim() || existingGroup.destination,
        destination_country_code: normalizeCode(
          patch?.destinationCountryCode ?? existingGroup.destinationCountryCode
        ),
        travel_start_date: patch?.travelStartDate !== undefined
          ? toDateOrNull(patch.travelStartDate)
          : toDateOrNull(existingGroup.travelStartDate),
        travel_end_date: patch?.travelEndDate !== undefined
          ? toDateOrNull(patch.travelEndDate)
          : toDateOrNull(existingGroup.travelEndDate),
        group_size: nextMembers ? nextMembers.length : (existingGroup.members?.length || 0),
        tags: nextTags
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
      .update({ is_active: false })
      .eq("id", groupId)
      .eq("partner_id", partnerId);

    if (error) {
      throw new Error(`Guruhni o'chirib bo'lmadi: ${error.message}`);
    }

    return { ok: true };
  }
};
