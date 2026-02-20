/**
 * Row-to-UI mappers for backend integration.
 * Keep these pure and deterministic.
 *
 * Why this file exists:
 * - Supabase rows are snake_case and DB-centric.
 * - UI contracts in src/services/types.js are camelCase and page-centric.
 * - Centralized mapping avoids spreading conversion logic across pages.
 */

const DEFAULT_USD_TO_UZS = 12800;

const statusMap = {
  PENDING: "pending",
  PROCESSING: "pending",
  ALLOCATED: "active",
  ACTIVE: "active",
  FAILED: "failed",
  CANCELLED: "cancelled",
  SUSPENDED: "suspended",
  EXPIRED: "expired",
  IN_USE: "active",
  USED_UP: "expired"
};

function toUiStatus(value) {
  if (!value) return "pending";
  const raw = String(value).trim();
  const upper = raw.toUpperCase();
  return statusMap[upper] || raw.toLowerCase();
}

function toIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function asNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function dataBytesToGb(value) {
  return asNumber(value, 0) / 1073741824;
}

export function mapPackageRowToPlan(row, options = {}) {
  const usdToUzsRate = asNumber(options.usdToUzsRate, DEFAULT_USD_TO_UZS);
  const defaultMarginPercent = asNumber(row?.default_margin_percent, 0);
  const apiPriceUsd = asNumber(row?.api_price_usd ?? row?.price_usd, 0);
  const b2cPriceUsd = apiPriceUsd * (1 + defaultMarginPercent / 100);
  const firstLocationName =
    Array.isArray(row?.location_network_list) && row.location_network_list.length > 0
      ? row.location_network_list[0]?.locationName
      : "";
  const firstLocationCode =
    Array.isArray(row?.location_network_list) && row.location_network_list.length > 0
      ? row.location_network_list[0]?.locationCode
      : "";
  const firstCoveredCountryCode =
    Array.isArray(row?.covered_countries) && row.covered_countries.length > 0
      ? row.covered_countries[0]?.code
      : "";
  const isTwoLetterCode = (value) => typeof value === "string" && /^[A-Za-z]{2}$/.test(value.trim());
  const locationType = row?.location_type || "";
  const destination =
    locationType === "country"
      ? firstLocationName || row?.location_name || row?.location_code || ""
      : row?.name || row?.location_name || row?.location_code || "";
  const countryCode =
    locationType === "country"
      ? (isTwoLetterCode(firstLocationCode) ? firstLocationCode : row?.location_code || "")
      : isTwoLetterCode(firstLocationCode)
        ? firstLocationCode
        : isTwoLetterCode(firstCoveredCountryCode)
          ? firstCoveredCountryCode
          : "";
  const partnerDiscountRate = asNumber(
    options?.partner?.custom_discount_rate ?? options?.partner?.discount_rate,
    0
  );
  const resellerPriceUsd = b2cPriceUsd * (1 - partnerDiscountRate / 100);
  const retailUsd = asNumber(row?.retail_price_override_usd, b2cPriceUsd);

  return {
    id: row?.id || row?.package_code || "",
    name: row?.name || row?.package_name || "",
    destination,
    countryCode,
    dataGb: asNumber(row?.data_gb, dataBytesToGb(row?.data_volume)),
    dataLabel: row?.data_gb ? `${asNumber(row.data_gb)}GB` : "",
    validityDays: asNumber(row?.duration, 0),
    price: resellerPriceUsd,
    speed: row?.speed || "",
    coverage: row?.speed || "",
    originalPriceUzs: Math.round(retailUsd * usdToUzsRate),
    resellerPriceUzs: Math.round(resellerPriceUsd * usdToUzsRate),
    originalPriceUsd: retailUsd,
    resellerPriceUsd,
    apiPriceUsd,
    defaultMarginPercent,
    partnerDiscountRate,
    locationType,
    packageCode: row?.package_code || "",
    slug: row?.slug || "",
    dataType: asNumber(row?.data_type, 0),
    smsStatus: asNumber(row?.sms_status, 0),
    description: row?.description || "",
    coveredCountries: row?.covered_countries || [],
    locationNetworkList: row?.location_network_list || [],
    sku: row?.slug || row?.package_code || ""
  };
}

export function mapOrderRowToDashboardOrder(row, options = {}) {
  const usdToUzsRate = asNumber(options.usdToUzsRate, DEFAULT_USD_TO_UZS);
  const amountUsd = asNumber(row?.partner_paid_usd ?? row?.price_usd, 0);

  return {
    id: row?.order_no || row?.id || "",
    customerName:
      [row?.customer_first_name, row?.customer_last_name].filter(Boolean).join(" ").trim() ||
      row?.customer_email ||
      "Unknown",
    destination: row?.country_code || "",
    countryCode: row?.country_code || "",
    planName: row?.package_name || row?.package_code || "",
    amount: amountUsd,
    commission: asNumber(row?.discount_amount_usd, 0),
    status: toUiStatus(row?.order_status || row?.esim_status),
    createdAt: toIsoDate(row?.created_at),
    paymentTotalUzs: Math.round(amountUsd * usdToUzsRate)
  };
}

export function mapOrderRowToPortalOrder(row, packageRecord, options = {}) {
  const usdToUzsRate = asNumber(options.usdToUzsRate, DEFAULT_USD_TO_UZS);
  const usedBytes = asNumber(row?.order_usage, 0);
  const totalBytes = asNumber(row?.total_volume, 0);
  const amountUsd = asNumber(row?.partner_paid_usd ?? row?.price_usd, 0);
  const deliveryLogs = Array.isArray(row?.esim_delivery_logs)
    ? row.esim_delivery_logs
    : row?.esim_delivery_logs
      ? [row.esim_delivery_logs]
      : [];
  const latestDeliveryLog = deliveryLogs
    .filter(Boolean)
    .sort((a, b) => new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime())[0];
  const deliveredAt =
    toIsoDate(latestDeliveryLog?.delivered_at)
    || toIsoDate(latestDeliveryLog?.sent_at)
    || toIsoDate(row?.email_sent_at);

  return {
    id: row?.order_no || row?.id || "",
    orderType: row?.customer_group_id ? "group" : row?.source_type === "b2b_partner" ? "client" : "self",
    packageId: packageRecord?.id || row?.package_code || "",
    customerName:
      [row?.customer_first_name, row?.customer_last_name].filter(Boolean).join(" ").trim() || undefined,
    customerPhone: row?.customer_phone || undefined,
    customerEmail: row?.customer_email || undefined,
    groupName: row?.group_name || undefined,
    status: toUiStatus(row?.order_status || row?.esim_status),
    dataUsageGb: usedBytes > 0 ? dataBytesToGb(usedBytes) : 0,
    totalDataGb: totalBytes > 0 ? dataBytesToGb(totalBytes) : asNumber(packageRecord?.dataGb, 0),
    purchasedAt: toIsoDate(row?.created_at) || new Date().toISOString(),
    paymentTotalUzs: Math.round(amountUsd * usdToUzsRate),
    iccid: row?.iccid || "",
    timeline: {
      createdAt: toIsoDate(row?.created_at),
      paymentClearedAt: toIsoDate(row?.created_at),
      deliveredAt,
      activatedAt: toIsoDate(row?.activation_date),
      lastSyncAt: toIsoDate(row?.updated_at)
    },
    package: packageRecord || undefined
  };
}

export function mapPartnerDashboardRowToEarningsSummary(row) {
  return {
    totalCommission: asNumber(row?.total_savings, 0),
    totalOrders: asNumber(row?.total_orders, 0),
    activeEsims: asNumber(row?.active_orders, 0),
    monthlyGrowthPct: asNumber(row?.monthly_growth_pct, 0)
  };
}

export const mapperUtils = {
  toUiStatus,
  toIsoDate,
  asNumber,
  dataBytesToGb
};
