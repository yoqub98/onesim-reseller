/**
 * Backend team: configure this file with your HTTP client.
 * All service files should call these methods instead of withDelay.
 *
 * Handoff references:
 * - Root guide: BACKEND_HANDOFF.md
 * - Service contracts: src/services/CONTRACTS.md
 * - DB/UI mappers: src/services/supabaseMappers.js
 */

export const BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api/v1";

function notImplemented(method, url) {
  throw new Error(`[apiClient] ${method} ${url} is not implemented yet`);
}

/**
 * Optional helper once backend API is live.
 * Keeps route construction consistent between services.
 */
export function buildApiUrl(path) {
  if (!path) return BASE_URL;
  return path.startsWith("http") ? path : `${BASE_URL}${path}`;
}

export const apiClient = {
  get(url, params) {
    return notImplemented("GET", buildApiUrl(url), params);
  },
  post(url, body) {
    return notImplemented("POST", buildApiUrl(url), body);
  },
  put(url, body) {
    return notImplemented("PUT", buildApiUrl(url), body);
  },
  delete(url) {
    return notImplemented("DELETE", buildApiUrl(url));
  }
};

// Suggested fetch shape:
// const response = await fetch(buildApiUrl(url), {
//   method: "GET",
//   headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
// });
// if (!response.ok) throw new Error(`HTTP ${response.status}`);
// return response.json();
