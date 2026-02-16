/**
 * Backend team: configure this file with your HTTP client.
 * All service files should call these methods instead of withDelay.
 */

export const BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api/v1";

function notImplemented() {
  throw new Error("Not implemented — replace with real HTTP client");
}

export const apiClient = {
  get(url, params) {
    return notImplemented(url, params);
  },
  post(url, body) {
    return notImplemented(url, body);
  },
  put(url, body) {
    return notImplemented(url, body);
  },
  delete(url) {
    return notImplemented(url);
  }
};

// Example integration (fetch or axios):
// const response = await fetch(`${BASE_URL}${url}`);
// return response.json();
