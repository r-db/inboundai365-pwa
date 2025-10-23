// API Adapter Pattern
export class APIAdapter {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.headers = config.headers || {};
    this.timeout = config.timeout || 7000;
    this.retryAttempts = config.retryAttempts || 3;
    this.interceptors = {
      request: [],
      response: [],
      error: []
    };
    this.cache = new Map();
  }

  addRequestInterceptor(fn) {
    this.interceptors.request.push(fn);
  }

  addResponseInterceptor(fn) {
    this.interceptors.response.push(fn);
  }

  addErrorInterceptor(fn) {
    this.interceptors.error.push(fn);
  }

  async request(endpoint, options = {}) {
    let config = {
      ...options,
      headers: { ...this.headers, ...options.headers }
    };

    for (const interceptor of this.interceptors.request) {
      config = await interceptor(config);
    }

    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = `${config.method || 'GET'}_${url}_${JSON.stringify(config.body || '')}`;

    if ((config.method === 'GET' || !config.method) && config.cache !== false) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < (config.cacheTTL || 60000)) {
        return cached.data;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      let response = await this.fetchWithRetry(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      for (const interceptor of this.interceptors.response) {
        response = await interceptor(response);
      }

      if ((config.method === 'GET' || !config.method) && config.cache !== false) {
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      for (const interceptor of this.interceptors.error) {
        error = await interceptor(error);
      }

      throw error;
    }
  }

  async fetchWithRetry(url, config, attempt = 1) {
    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      if (attempt < this.retryAttempts && error.name !== 'AbortError') {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, config, attempt + 1);
      }

      throw error;
    }
  }

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
  }

  put(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
  }

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  clearCache() {
    this.cache.clear();
  }
}

export default APIAdapter;
