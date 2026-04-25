import { BASE_URL } from "./endpoint.js";

export function resolveApiAssetUrl(assetPath) {
  if (!assetPath) {
    return "";
  }

  if (/^(blob:|data:|https?:\/\/)/i.test(assetPath)) {
    return assetPath;
  }

  try {
    return new URL(assetPath, `${BASE_URL}/`).toString();
  } catch {
    return assetPath;
  }
}

// API Client with pre-built HTTP methods
class APIClient {
  constructor(baseURL = BASE_URL) {
    this.baseURL = baseURL;
    this.timeout = 30000; // 30 seconds
    this.token = null;
  }

  /**
   * Set authorization token
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Get authorization headers
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Prepare URL with base URL
   */
  prepareUrl(endpoint) {
    if (endpoint.startsWith("http")) {
      return endpoint;
    }
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(data?.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    const url = this.prepareUrl(endpoint);
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(options.headers),
      timeout: options.timeout || this.timeout,
      ...options,
    });
    return this.handleResponse(response);
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}, options = {}) {
    const url = this.prepareUrl(endpoint);
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(options.headers),
      body: JSON.stringify(data),
      timeout: options.timeout || this.timeout,
      ...options,
    });
    return this.handleResponse(response);
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}, options = {}) {
    const url = this.prepareUrl(endpoint);
    const response = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(options.headers),
      body: JSON.stringify(data),
      timeout: options.timeout || this.timeout,
      ...options,
    });
    return this.handleResponse(response);
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data = {}, options = {}) {
    const url = this.prepareUrl(endpoint);
    const response = await fetch(url, {
      method: "PATCH",
      headers: this.getHeaders(options.headers),
      body: JSON.stringify(data),
      timeout: options.timeout || this.timeout,
      ...options,
    });
    return this.handleResponse(response);
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    const url = this.prepareUrl(endpoint);
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(options.headers),
      timeout: options.timeout || this.timeout,
      ...options,
    });
    return this.handleResponse(response);
  }

  /**
   * Upload file with support for different HTTP methods
   */
  async upload(endpoint, formData, options = {}) {
    const url = this.prepareUrl(endpoint);
    const headers = new Headers(this.getHeaders(options.headers));
    // Remove Content-Type for FormData (browser will set it with boundary)
    headers.delete("Content-Type");

    const response = await fetch(url, {
      method: options.method || "POST",
      headers,
      body: formData,
      timeout: options.timeout || this.timeout,
      ...options,
    });
    return this.handleResponse(response);
  }
}

// Export singleton instance
export const apiClient = new APIClient();

export default apiClient;
