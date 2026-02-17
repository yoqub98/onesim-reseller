import { supabase } from "../lib/supabase";
import { mapPackageRowToPlan } from "./supabaseMappers";

/**
 * Backend handoff:
 * - Target endpoint: ENDPOINTS.catalog.plans
 * - Contract reference: src/services/CONTRACTS.md#2-catalogservice
 * - Row mapping helper: mapPackageRowToPlan() in src/services/supabaseMappers.js
 */
export const catalogService = {
  /**
   * Fetches reseller catalog plans.
   * @param {{partner?: any}} [_params]
   * @returns {Promise<import('./types').Plan[]>}
   * @source Supabase: public.esim_packages
   */
  async getPlans(params = {}) {
    const partner = params?.partner || null;
    const pageSize = 500;
    let from = 0;
    let allRows = [];

    while (true) {
      const to = from + pageSize - 1;
      const { data, error } = await supabase
        .from("esim_packages")
        .select(`
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
        `)
        .eq("is_active", true)
        .eq("is_hidden", false)
        .order("location_type", { ascending: true })
        .order("location_code", { ascending: true })
        .order("duration", { ascending: true })
        .order("data_gb", { ascending: true })
        .range(from, to);

      if (error) {
        throw new Error(`Failed to load catalog packages: ${error.message}`);
      }

      const rows = data || [];
      allRows = allRows.concat(rows);
      if (rows.length < pageSize) {
        break;
      }
      from += pageSize;
    }

    return allRows.map((row) => mapPackageRowToPlan(row, { partner }));
  }
};
