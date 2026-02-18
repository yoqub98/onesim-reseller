import { supabase } from "../lib/supabase";
import { mapPackageRowToPlan } from "./supabaseMappers";

/**
 * Backend handoff:
 * - Target endpoint: ENDPOINTS.catalog.plans
 * - Contract reference: src/services/CONTRACTS.md#2-catalogservice
 * - Row mapping helper: mapPackageRowToPlan() in src/services/supabaseMappers.js
 */

const BASE_COLUMNS = `
  id,
  package_code,
  slug,
  name,
  description,
  location_code,
  location_type,
  covered_countries,
  location_network_list,
  data_volume,
  data_gb,
  duration,
  duration_unit,
  speed,
  data_type,
  sms_status,
  api_price_usd,
  default_margin_percent,
  is_active,
  is_hidden
`;

function applyFilters(query, filters) {
  if (filters.destination && filters.destination !== "all") {
    query = query.eq("location_code", filters.destination);
  }
  if (filters.locationType && filters.locationType !== "all") {
    query = query.eq("location_type", filters.locationType);
  }
  if (filters.packageType && filters.packageType !== "all") {
    if (filters.packageType === "daily") {
      query = query.eq("data_type", 2);
    } else {
      query = query.neq("data_type", 2);
    }
  }
  if (filters.data && filters.data !== "all") {
    const bucket = filters.data;
    if (bucket === "upTo1") {
      query = query.lte("data_gb", 1);
    } else if (bucket === "1to5") {
      query = query.gt("data_gb", 1).lte("data_gb", 5);
    } else if (bucket === "5to10") {
      query = query.gt("data_gb", 5).lte("data_gb", 10);
    } else if (bucket === "10to20") {
      query = query.gt("data_gb", 10).lte("data_gb", 20);
    } else if (bucket === "20plus") {
      query = query.gte("data_gb", 20);
    }
  }
  if (filters.days && filters.days !== "all") {
    query = query.eq("duration", Number(filters.days));
  }
  return query;
}

export const catalogService = {
  /**
   * Fetches a single page of reseller catalog plans with server-side filtering.
   * @param {object} params
   * @param {any}    [params.partner] - Partner profile for discount calculation
   * @param {object} [params.filters] - Filter values (destination, locationType, packageType, data, days)
   * @param {number} [params.page]    - 1-based page number
   * @param {number} [params.pageSize] - Items per page (default 15)
   * @returns {Promise<{plans: import('./types').Plan[], totalCount: number}>}
   */
  async getPlans(params = {}) {
    const partner = params?.partner || null;
    const filters = params?.filters || {};
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 15;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("esim_packages")
      .select(BASE_COLUMNS, { count: "exact" })
      .eq("is_active", true)
      .eq("is_hidden", false);

    query = applyFilters(query, filters);

    query = query
      .order("location_type", { ascending: true })
      .order("location_code", { ascending: true })
      .order("duration", { ascending: true })
      .order("data_gb", { ascending: true })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to load catalog packages: ${error.message}`);
    }

    const rows = data || [];
    return {
      plans: rows.map((row) => mapPackageRowToPlan(row, { partner })),
      totalCount: count || 0
    };
  },

  /**
   * Fetches distinct destination options for the filter dropdown.
   * Returns array of { value: location_code, label: display_name }.
   * @returns {Promise<{value: string, label: string}[]>}
   */
  async getDestinations() {
    const pageSize = 1000;
    let from = 0;
    let allRows = [];

    while (true) {
      const to = from + pageSize - 1;
      const { data, error } = await supabase
        .from("esim_packages")
        .select("location_code, location_type, name, location_network_list")
        .eq("is_active", true)
        .eq("is_hidden", false)
        .order("location_code", { ascending: true })
        .range(from, to);

      if (error) {
        throw new Error(`Failed to load destinations: ${error.message}`);
      }

      const rows = data || [];
      allRows = allRows.concat(rows);
      if (rows.length < pageSize) break;
      from += pageSize;
    }

    // Deduplicate by location_code, deriving a display label
    const seen = new Map();
    for (const row of allRows) {
      const code = row.location_code;
      if (!code || seen.has(code)) continue;

      let label;
      if (row.location_type === "country") {
        const firstName =
          Array.isArray(row.location_network_list) && row.location_network_list.length > 0
            ? row.location_network_list[0]?.locationName
            : "";
        label = firstName || code;
      } else {
        label = row.name || code;
      }
      seen.set(code, label);
    }

    return [...seen.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  },

  /**
   * Fetches distinct duration values for the days filter chips.
   * @returns {Promise<number[]>}
   */
  async getDurations() {
    const { data, error } = await supabase
      .from("esim_packages")
      .select("duration")
      .eq("is_active", true)
      .eq("is_hidden", false)
      .order("duration", { ascending: true })
      .limit(1000);

    if (error) {
      throw new Error(`Failed to load durations: ${error.message}`);
    }

    const rows = data || [];
    const unique = [...new Set(rows.map((r) => r.duration).filter((v) => v != null))]
      .map(Number)
      .filter((v) => Number.isFinite(v) && v >= 0)
      .sort((a, b) => a - b);

    return unique;
  }
};
