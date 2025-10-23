/**
 * CRM-Aware Chat Client
 * Extends ChatClient with CRM-specific functionality
 * Detects tenant from subdomain or path and integrates with PWA_CRM backend
 */
import ChatClient from './chat-client.js';

class CRMChatClient extends ChatClient {
  constructor() {
    super();

    // CRM API base URL (PWA_CRM backend)
    this.crmApiBase = window.location.hostname === 'localhost'
      ? 'http://localhost:5000/api/crm'
      : '/api/crm';

    // Tenant detection
    this.tenantId = null;
    this.tenantInfo = null;

    // Initialize tenant
    this.initializeTenant();
  }

  /**
   * Detect and initialize tenant from URL
   * Supports both subdomain-based and path-based routing
   * @private
   */
  async initializeTenant() {
    try {
      // Strategy 1: Subdomain-based tenant detection
      // Example: acme-dental.chatbot.com -> subdomain = "acme-dental"
      const hostname = window.location.hostname;
      const parts = hostname.split('.');

      let subdomain = null;
      if (parts.length >= 3) {
        subdomain = parts[0];

        // Skip common subdomains
        if (!['www', 'api', 'admin', 'app', 'localhost'].includes(subdomain)) {
          const tenant = await this.lookupTenantBySubdomain(subdomain);
          if (tenant) {
            this.tenantId = tenant.id;
            this.tenantInfo = tenant;
            console.log('Tenant detected via subdomain:', this.tenantInfo);
            return;
          }
        }
      }

      // Strategy 2: Path-based tenant detection
      // Example: /chat/acme-dental -> tenant = "acme-dental"
      const pathParts = window.location.pathname.split('/').filter(p => p);
      if (pathParts.length >= 2 && pathParts[0] === 'chat') {
        const tenantSlug = pathParts[1];
        const tenant = await this.lookupTenantBySubdomain(tenantSlug);
        if (tenant) {
          this.tenantId = tenant.id;
          this.tenantInfo = tenant;
          console.log('Tenant detected via path:', this.tenantInfo);
          return;
        }
      }

      // Strategy 3: Build-time configuration (fallback)
      // Check for tenant ID in window.TENANT_CONFIG
      if (window.TENANT_CONFIG && window.TENANT_CONFIG.tenantId) {
        this.tenantId = window.TENANT_CONFIG.tenantId;
        console.log('Tenant configured at build time:', this.tenantId);
      } else {
        console.warn('No tenant detected. CRM features disabled.');
      }

    } catch (error) {
      console.error('Failed to initialize tenant:', error);
    }
  }

  /**
   * Lookup tenant by subdomain or slug
   * @param {string} subdomain - Tenant subdomain or slug
   * @returns {Promise<object|null>} Tenant information
   * @private
   */
  async lookupTenantBySubdomain(subdomain) {
    try {
      const response = await fetch(`${this.crmApiBase}/tenants/lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subdomain })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.success ? data.tenant : null;
    } catch (error) {
      console.error('Tenant lookup failed:', error);
      return null;
    }
  }

  /**
   * Get CRM headers with tenant ID
   * @private
   */
  getCRMHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.tenantId) {
      headers['X-Tenant-ID'] = this.tenantId;
    }
    return headers;
  }

  /**
   * Check if tenant is initialized
   * @returns {boolean}
   */
  hasTenant() {
    return this.tenantId !== null;
  }

  /**
   * Get current tenant information
   * @returns {object|null}
   */
  getTenantInfo() {
    return this.tenantInfo;
  }

  /**
   * Check availability for a specific date/time
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} serviceId - Optional service UUID
   * @returns {Promise<object>} Available time slots
   */
  async checkAvailability(date, serviceId = null) {
    if (!this.hasTenant()) {
      throw new Error('No tenant configured. Cannot check availability.');
    }

    try {
      const response = await fetch(`${this.crmApiBase}/tools/execute`, {
        method: 'POST',
        headers: this.getCRMHeaders(),
        body: JSON.stringify({
          tool_name: 'check_availability',
          parameters: {
            date: date,
            service_id: serviceId
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check availability');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Availability check failed:', error);
      throw error;
    }
  }

  /**
   * Book an appointment
   * @param {object} appointmentData - Appointment details
   * @param {string} appointmentData.customer_phone - Customer phone number (required)
   * @param {string} appointmentData.customer_name - Customer name (required)
   * @param {string} appointmentData.appointment_date - Date/time in ISO format (required)
   * @param {string} appointmentData.service_id - Service UUID (optional)
   * @param {string} appointmentData.notes - Additional notes (optional)
   * @returns {Promise<object>} Booking confirmation
   */
  async bookAppointment(appointmentData) {
    if (!this.hasTenant()) {
      throw new Error('No tenant configured. Cannot book appointment.');
    }

    try {
      const response = await fetch(`${this.crmApiBase}/tools/execute`, {
        method: 'POST',
        headers: this.getCRMHeaders(),
        body: JSON.stringify({
          tool_name: 'book_appointment',
          parameters: appointmentData
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to book appointment');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Appointment booking failed:', error);
      throw error;
    }
  }

  /**
   * Get available services for current tenant
   * @returns {Promise<Array>} List of services
   */
  async getServices() {
    if (!this.hasTenant()) {
      throw new Error('No tenant configured. Cannot fetch services.');
    }

    try {
      const response = await fetch(`${this.crmApiBase}/tools/execute`, {
        method: 'POST',
        headers: this.getCRMHeaders(),
        body: JSON.stringify({
          tool_name: 'get_services',
          parameters: {}
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch services');
      }

      const data = await response.json();
      return data.data.services || [];
    } catch (error) {
      console.error('Failed to fetch services:', error);
      throw error;
    }
  }

  /**
   * Look up customer by phone number
   * @param {string} phone - Customer phone number
   * @returns {Promise<object>} Customer information
   */
  async lookupCustomer(phone) {
    if (!this.hasTenant()) {
      throw new Error('No tenant configured. Cannot lookup customer.');
    }

    try {
      const response = await fetch(`${this.crmApiBase}/tools/execute`, {
        method: 'POST',
        headers: this.getCRMHeaders(),
        body: JSON.stringify({
          tool_name: 'lookup_customer',
          parameters: { phone }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to lookup customer');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Customer lookup failed:', error);
      throw error;
    }
  }

  /**
   * Get business hours for current tenant
   * @returns {Promise<Array>} Business hours by day of week
   */
  async getBusinessHours() {
    if (!this.hasTenant()) {
      throw new Error('No tenant configured. Cannot fetch business hours.');
    }

    try {
      const response = await fetch(`${this.crmApiBase}/tools/execute`, {
        method: 'POST',
        headers: this.getCRMHeaders(),
        body: JSON.stringify({
          tool_name: 'get_business_hours',
          parameters: {}
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch business hours');
      }

      const data = await response.json();
      return data.data.business_hours || [];
    } catch (error) {
      console.error('Failed to fetch business hours:', error);
      throw error;
    }
  }

  /**
   * Override sendMessage to include tenant context in system message
   * @param {string} message - User message
   * @param {string} provider - 'openai' or 'claude'
   * @param {string} model - Specific model ID
   * @returns {Promise<object>} Response from LLM
   */
  async sendMessage(message, provider = 'openai', model = null) {
    // Add tenant context if available
    if (this.hasTenant() && this.tenantInfo) {
      // Inject system context about the business
      const systemContext = `You are a helpful assistant for ${this.tenantInfo.business_name}. ` +
        `Business phone: ${this.tenantInfo.phone || 'N/A'}. ` +
        `Business email: ${this.tenantInfo.email || 'N/A'}. ` +
        `You can help customers check availability and book appointments.`;

      // Add system context to history if this is the first message
      if (this.conversationHistory.length === 0) {
        this.conversationHistory.push({
          role: 'system',
          content: systemContext
        });
      }
    }

    return super.sendMessage(message, provider, model);
  }

  /**
   * Override sendMessageStream to include tenant context
   * @param {string} message - User message
   * @param {string} provider - 'openai' or 'claude'
   * @param {object} callbacks - { onChunk, onComplete, onError }
   */
  async sendMessageStream(message, provider, callbacks) {
    // Add tenant context if available
    if (this.hasTenant() && this.tenantInfo) {
      const systemContext = `You are a helpful assistant for ${this.tenantInfo.business_name}. ` +
        `Business phone: ${this.tenantInfo.phone || 'N/A'}. ` +
        `Business email: ${this.tenantInfo.email || 'N/A'}. ` +
        `You can help customers check availability and book appointments.`;

      if (this.conversationHistory.length === 0) {
        this.conversationHistory.push({
          role: 'system',
          content: systemContext
        });
      }
    }

    return super.sendMessageStream(message, provider, callbacks);
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.CRMChatClient = CRMChatClient;
}

export default CRMChatClient;
