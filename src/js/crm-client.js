/**
 * CRM Client for PWA_CRM Backend Integration
 * Handles all communication with the PWA_CRM API
 */

class CRMClient {
    /**
     * Initialize CRM Client
     * @param {string} tenantId - Tenant UUID (e.g., '11111111-1111-1111-1111-111111111111')
     * @param {string} apiUrl - Backend API URL (e.g., 'http://localhost:5000')
     */
    constructor(tenantId, apiUrl = 'http://localhost:5000') {
        if (!tenantId) {
            throw new Error('CRMClient requires a valid tenant ID');
        }

        this.tenantId = tenantId;
        this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
        this.endpoint = `${this.apiUrl}/api/crm/tools/execute`;
    }

    /**
     * Execute a tool via the universal CRM API endpoint
     * @param {string} toolName - Name of the tool to execute
     * @param {Object} parameters - Tool parameters
     * @returns {Promise<Object>} API response
     */
    async executeTool(toolName, parameters = {}) {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': this.tenantId
                },
                body: JSON.stringify({
                    tool_name: toolName,
                    parameters: parameters
                })
            });

            // Handle non-200 responses
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error ||
                    errorData.message ||
                    `API request failed with status ${response.status}`
                );
            }

            const data = await response.json();

            // Check if the API returned an error in the response body
            if (data.error) {
                throw new Error(data.error);
            }

            return data;

        } catch (error) {
            // Network errors, parsing errors, or thrown errors
            console.error(`CRM API Error (${toolName}):`, error);
            throw new Error(`Failed to execute ${toolName}: ${error.message}`);
        }
    }

    /**
     * Check availability for a service
     * @param {string} serviceId - Service UUID
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {number} duration - Duration in minutes
     * @returns {Promise<Object>} Available time slots
     */
    async checkAvailability(serviceId, date, duration = 60) {
        if (!serviceId || !date) {
            throw new Error('serviceId and date are required for checkAvailability');
        }

        return await this.executeTool('check_availability', {
            service_id: serviceId,
            date: date,
            duration: duration
        });
    }

    /**
     * Look up a customer by phone or email
     * @param {string} phone - Customer phone number (optional)
     * @param {string} email - Customer email (optional)
     * @returns {Promise<Object>} Customer information
     */
    async lookupCustomer(phone = null, email = null) {
        if (!phone && !email) {
            throw new Error('Either phone or email is required for lookupCustomer');
        }

        const parameters = {};
        if (phone) parameters.phone = phone;
        if (email) parameters.email = email;

        return await this.executeTool('lookup_customer', parameters);
    }

    /**
     * Book an appointment
     * @param {Object} appointmentData - Appointment details
     * @param {string} appointmentData.customer_id - Customer UUID
     * @param {string} appointmentData.service_id - Service UUID
     * @param {string} appointmentData.start_time - ISO 8601 datetime
     * @param {number} appointmentData.duration - Duration in minutes
     * @param {string} appointmentData.notes - Optional notes
     * @returns {Promise<Object>} Created appointment
     */
    async bookAppointment(appointmentData) {
        const required = ['customer_id', 'service_id', 'start_time', 'duration'];
        const missing = required.filter(field => !appointmentData[field]);

        if (missing.length > 0) {
            throw new Error(`Missing required fields for bookAppointment: ${missing.join(', ')}`);
        }

        return await this.executeTool('book_appointment', appointmentData);
    }

    /**
     * Get available services for the tenant
     * @returns {Promise<Object>} List of services
     */
    async getServices() {
        return await this.executeTool('get_services', {});
    }

    /**
     * Create a new customer
     * @param {Object} customerData - Customer details
     * @param {string} customerData.name - Customer name
     * @param {string} customerData.phone - Customer phone
     * @param {string} customerData.email - Customer email (optional)
     * @returns {Promise<Object>} Created customer
     */
    async createCustomer(customerData) {
        const required = ['name', 'phone'];
        const missing = required.filter(field => !customerData[field]);

        if (missing.length > 0) {
            throw new Error(`Missing required fields for createCustomer: ${missing.join(', ')}`);
        }

        return await this.executeTool('create_customer', customerData);
    }

    /**
     * Update an existing appointment
     * @param {string} appointmentId - Appointment UUID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated appointment
     */
    async updateAppointment(appointmentId, updates) {
        if (!appointmentId) {
            throw new Error('appointmentId is required for updateAppointment');
        }

        return await this.executeTool('update_appointment', {
            appointment_id: appointmentId,
            ...updates
        });
    }

    /**
     * Cancel an appointment
     * @param {string} appointmentId - Appointment UUID
     * @returns {Promise<Object>} Cancellation confirmation
     */
    async cancelAppointment(appointmentId) {
        if (!appointmentId) {
            throw new Error('appointmentId is required for cancelAppointment');
        }

        return await this.executeTool('cancel_appointment', {
            appointment_id: appointmentId
        });
    }

    /**
     * Get appointments for a customer
     * @param {string} customerId - Customer UUID
     * @param {string} status - Filter by status (optional: 'scheduled', 'completed', 'cancelled')
     * @returns {Promise<Object>} List of appointments
     */
    async getCustomerAppointments(customerId, status = null) {
        if (!customerId) {
            throw new Error('customerId is required for getCustomerAppointments');
        }

        const parameters = { customer_id: customerId };
        if (status) parameters.status = status;

        return await this.executeTool('get_customer_appointments', parameters);
    }

    /**
     * Health check - verify API connectivity
     * @returns {Promise<boolean>} True if API is reachable
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.apiUrl}/api/crm/health`, {
                method: 'GET',
                headers: {
                    'X-Tenant-ID': this.tenantId
                }
            });
            return response.ok;
        } catch (error) {
            console.error('CRM API health check failed:', error);
            return false;
        }
    }
}

// Make CRMClient available globally
if (typeof window !== 'undefined') {
    window.CRMClient = CRMClient;
}

// Export for module systems
export default CRMClient;
