// Admin Console Application
class AdminConsole {
    constructor() {
        this.API_BASE = 'http://localhost:5001/api';
        this.currentView = 'dashboard';
        this.onboardingData = {};
        this.currentStep = 1;
        
        this.init();
    }
    
    async init() {
        // Check authentication
        await this.checkAuth();
        
        // Setup event listeners
        this.setupNavigation();
        
        // Load initial data
        await this.loadDashboard();
    }
    
    async checkAuth() {
        // TODO: Implement proper authentication
        // For now, simulate authenticated admin
        document.getElementById('admin-user').textContent = 'admin@inboundai365.com';
    }
    
    setupNavigation() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });
        
        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    }
    
    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });
        
        // Update views
        document.querySelectorAll('.admin-view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');
        
        // Load view data
        switch (viewName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'tenants':
                this.loadTenants();
                break;
            case 'numbers':
                this.loadPhoneNumbers();
                break;
            case 'agents':
                this.loadAgents();
                break;
            case 'system':
                this.loadSystemHealth();
                break;
        }
        
        this.currentView = viewName;
    }
    
    async loadDashboard() {
        try {
            // Load stats
            const statsResponse = await fetch(`${this.API_BASE}/admin/stats`);
            const stats = await statsResponse.json();
            
            document.getElementById('stat-tenants').textContent = stats.active_tenants || '0';
            document.getElementById('stat-calls').textContent = stats.total_calls_30d || '0';
            document.getElementById('stat-revenue').textContent = '$' + (stats.revenue_30d || '0');
            document.getElementById('stat-agents').textContent = stats.active_agents || '0';
            
            // Load recent activity
            const activityResponse = await fetch(`${this.API_BASE}/admin/activity/recent`);
            const activities = await activityResponse.json();
            
            const activityList = document.getElementById('recent-activity-list');
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <strong>${activity.type}</strong>: ${activity.description}
                    <span class="activity-time">${this.formatTime(activity.timestamp)}</span>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            this.showToast('Failed to load dashboard data', 'error');
        }
    }
    
    async loadTenants() {
        try {
            const response = await fetch(`${this.API_BASE}/admin/tenants`);
            const tenants = await response.json();
            
            const grid = document.getElementById('tenants-list');
            grid.innerHTML = tenants.map(tenant => `
                <div class="tenant-card">
                    <h4>${tenant.business_name}</h4>
                    <div class="tenant-type">${tenant.business_type}</div>
                    <div class="tenant-info">
                        <div>📞 ${tenant.phone_number || 'No number'}</div>
                        <div>📧 ${tenant.contact_email}</div>
                        <div>💰 Balance: $${tenant.balance}</div>
                        <div>📊 Status: ${tenant.status}</div>
                    </div>
                    <div class="tenant-actions">
                        <button class="btn-outline" onclick="admin.viewTenant('${tenant.tenant_id}')">View</button>
                        <button class="btn-outline" onclick="admin.editTenant('${tenant.tenant_id}')">Edit</button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Failed to load tenants:', error);
            this.showToast('Failed to load tenants', 'error');
        }
    }
    
    async loadPhoneNumbers() {
        try {
            const response = await fetch(`${this.API_BASE}/admin/numbers`);
            const numbers = await response.json();
            
            const list = document.getElementById('numbers-list');
            list.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Phone Number</th>
                            <th>Country</th>
                            <th>Tenant</th>
                            <th>Status</th>
                            <th>Monthly Cost</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${numbers.map(num => `
                            <tr>
                                <td>${num.phone_number}</td>
                                <td>${num.country}</td>
                                <td>${num.tenant_name || 'Unassigned'}</td>
                                <td>${num.status}</td>
                                <td>$${num.monthly_cost}</td>
                                <td>
                                    ${!num.tenant_id ? `<button class="btn-link" onclick="admin.assignNumber('${num.phone_number}')">Assign</button>` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
        } catch (error) {
            console.error('Failed to load numbers:', error);
            this.showToast('Failed to load phone numbers', 'error');
        }
    }
    
    async loadAgents() {
        try {
            const response = await fetch(`${this.API_BASE}/admin/agents`);
            const agents = await response.json();
            
            const grid = document.getElementById('agents-list');
            grid.innerHTML = agents.map(agent => `
                <div class="tenant-card">
                    <h4>${agent.name}</h4>
                    <div class="tenant-info">
                        <div>🏢 ${agent.business_name}</div>
                        <div>🗣️ Voice: ${agent.voice_id}</div>
                        <div>💬 ${agent.total_calls} calls</div>
                        <div>⏱️ ${agent.avg_duration}s avg duration</div>
                    </div>
                    <div class="tenant-actions">
                        <button class="btn-outline" onclick="admin.testAgent('${agent.agent_id}')">Test</button>
                        <button class="btn-outline" onclick="admin.editAgent('${agent.agent_id}')">Edit</button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Failed to load agents:', error);
            this.showToast('Failed to load agents', 'error');
        }
    }
    
    async loadSystemHealth() {
        try {
            const response = await fetch(`${this.API_BASE}/admin/health`);
            const health = await response.json();
            
            // Update health status
            this.updateHealthStatus('api-health', health.api);
            this.updateHealthStatus('db-health', health.database);
            this.updateHealthStatus('elevenlabs-health', health.elevenlabs);
            this.updateHealthStatus('vonage-health', health.vonage);
            
            // Load system logs
            const logsResponse = await fetch(`${this.API_BASE}/admin/logs`);
            const logs = await logsResponse.json();
            
            const logsContainer = document.getElementById('system-logs');
            logsContainer.innerHTML = logs.map(log => `
                <div class="log-entry ${log.level}">
                    <span class="log-time">${this.formatTime(log.timestamp)}</span>
                    <span class="log-message">${log.message}</span>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Failed to load system health:', error);
            this.showToast('Failed to load system health', 'error');
        }
    }
    
    updateHealthStatus(elementId, status) {
        const element = document.getElementById(elementId);
        element.className = 'health-status';
        
        if (status.healthy) {
            element.classList.add('healthy');
            element.textContent = '✓ Healthy';
        } else if (status.warning) {
            element.classList.add('warning');
            element.textContent = '⚠ Warning';
        } else {
            element.classList.add('error');
            element.textContent = '✗ Error';
        }
        
        if (status.message) {
            element.textContent += ` - ${status.message}`;
        }
    }
    
    searchTenants(query) {
        const cards = document.querySelectorAll('.tenant-card');
        query = query.toLowerCase();
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? 'block' : 'none';
        });
    }
    
    viewTenant(tenantId) {
        // TODO: Implement tenant detail view
        console.log('View tenant:', tenantId);
    }
    
    editTenant(tenantId) {
        // TODO: Implement tenant edit
        console.log('Edit tenant:', tenantId);
    }
    
    assignNumber(phoneNumber) {
        // TODO: Implement number assignment
        console.log('Assign number:', phoneNumber);
    }
    
    testAgent(agentId) {
        // TODO: Implement agent testing
        console.log('Test agent:', agentId);
    }
    
    editAgent(agentId) {
        // TODO: Implement agent editing
        console.log('Edit agent:', agentId);
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        const messageEl = document.getElementById('loading-message');
        messageEl.textContent = message;
        overlay.style.display = 'flex';
    }
    
    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        
        return date.toLocaleDateString();
    }
    
    logout() {
        // TODO: Implement logout
        window.location.href = '/';
    }
}

// Initialize admin console
let admin;
document.addEventListener('DOMContentLoaded', () => {
    admin = new AdminConsole();
});
