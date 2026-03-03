import { DELIVERY_SMS } from "../constants/delivery";

export const FALLBACK_EMAIL_DOMAIN = "onesim.group.local";
export const GROUP_TAG_PREFIX = "group_";

export const GROUP_STATUS_DRAFT = "draft";
export const GROUP_STATUS_READY = "ready";
export const GROUP_STATUS_ARCHIVED = "archived";

export const GROUP_ROW_SELECT_VARIANTS = [
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

export function asPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value;
}

export function normalizeMembers(members = []) {
  return members
    .map((member) => ({
      name: member?.name?.trim() || "",
      phone: member?.phone?.trim() || "",
      email: member?.email?.trim().toLowerCase() || ""
    }))
    .filter((member) => member.name);
}

export function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function normalizeDeliveryMethod(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "email" || normalized === "manual" || normalized === "sms") {
    return normalized;
  }
  return DELIVERY_SMS;
}

export function normalizeGroupStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === GROUP_STATUS_DRAFT || normalized === GROUP_STATUS_READY || normalized === GROUP_STATUS_ARCHIVED) {
    return normalized;
  }
  return GROUP_STATUS_DRAFT;
}

export function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Customer",
    lastName: parts.slice(1).join(" ") || "-"
  };
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

export function buildFallbackEmail(member, index) {
  const phoneDigits = String(member?.phone || "").replace(/\D+/g, "");
  if (phoneDigits) {
    return `phone.${phoneDigits}@${FALLBACK_EMAIL_DOMAIN}`;
  }
  return `${slugify(member?.name)}.${index + 1}@${FALLBACK_EMAIL_DOMAIN}`;
}

export function buildMemberLookupEmail(member, index, used) {
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

export function toDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export function toIsoOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function createGroupCode(id) {
  const compact = String(id || "").replace(/-/g, "").slice(0, 8).toUpperCase();
  return `GRP-${compact || "UNKNOWN"}`;
}

export function readGroupTags(tags) {
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

export function mapCustomerRowToMember(row) {
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

export function mapGroupOrderStatusToUi(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "completed") return "ordered";
  if (normalized === "failed") return "failed";
  if (normalized === "paid" || normalized === "api_ordering") return "ordering";
  return "not_ordered";
}

export function inferGroupStatus(packageCode) {
  return packageCode ? GROUP_STATUS_READY : GROUP_STATUS_DRAFT;
}

export function resolvePackageCode(input = {}, fallback = "") {
  for (const candidate of [input.packageCode, input.defaultPackageCode, input.packageId, fallback]) {
    const value = String(candidate || "").trim();
    if (value) return value;
  }
  return "";
}

export function resolvePackageName(input = {}, fallback = "") {
  for (const candidate of [input.packageName, input.defaultPackageName, input.packageLabel, fallback]) {
    const value = String(candidate || "").trim();
    if (value) return value;
  }
  return "";
}

export function isMissingColumnError(error) {
  const message = String(error?.message || "");
  return /column .* does not exist/i.test(message) || /could not find the '.*' column/i.test(message);
}

export function isMissingRelationError(error, relationName) {
  const message = String(error?.message || "");
  const relationLower = String(relationName || "").toLowerCase();
  return (
    new RegExp(`relation ['"]?${relationLower}['"]? does not exist`, "i").test(message)
    || new RegExp(`could not find the table ['"]?${relationLower}['"]?`, "i").test(message)
  );
}

export function mapGroupRowsToUi(groupsRows = [], memberRows = [], latestGroupOrderByGroupId = new Map()) {
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

export function applySearch(groups, query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) return groups;

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
