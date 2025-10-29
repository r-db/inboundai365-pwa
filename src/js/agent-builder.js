/**
 * Agent Builder - ElevenLabs Conversational AI Agent Management
 * Handles CRUD operations for voice agents
 */

class AgentBuilder {
  constructor() {
    this.apiBase = this.getApiBase();
    this.agents = [];
    this.currentAgent = null;
    this.templates = null;

    this.init();
  }

  getApiBase() {
    // Use port 5001 in development, adjust for production
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5001/api';
    }
    return '/api';
  }

  init() {
    this.setupEventListeners();
    this.loadAgents();
    this.loadTemplates();
    this.setupRangeInputs();
  }

  setupEventListeners() {
    // New agent button
    const newAgentBtn = document.getElementById('new-agent-btn');
    if (newAgentBtn) {
      newAgentBtn.addEventListener('click', () => this.openCreateModal());
    }

    // Modal close buttons
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
      closeModal.addEventListener('click', () => this.closeModal());
    }

    const cancelAgent = document.getElementById('cancel-agent');
    if (cancelAgent) {
      cancelAgent.addEventListener('click', () => this.closeModal());
    }

    // Close test modal
    const closeTestModal = document.getElementById('close-test-modal');
    if (closeTestModal) {
      closeTestModal.addEventListener('click', () => this.closeTestModal());
    }

    // Form submission
    const agentForm = document.getElementById('agent-form');
    if (agentForm) {
      agentForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Template buttons
    const templateButtons = document.querySelectorAll('.load-template');
    templateButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const template = e.target.dataset.template;
        this.loadTemplate(template);
      });
    });

    // Test modal buttons
    const copyAgentId = document.getElementById('copy-agent-id');
    if (copyAgentId) {
      copyAgentId.addEventListener('click', () => this.copyAgentId());
    }

    const simulateConv = document.getElementById('simulate-conversation');
    if (simulateConv) {
      simulateConv.addEventListener('click', () => this.simulateConversation());
    }

    // LLM provider change
    const llmProvider = document.getElementById('llm-provider');
    if (llmProvider) {
      llmProvider.addEventListener('change', (e) => this.updateModelOptions(e.target.value));
    }

    // Modal backdrop click to close
    const modal = document.getElementById('agent-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }

    const testModal = document.getElementById('test-modal');
    if (testModal) {
      testModal.addEventListener('click', (e) => {
        if (e.target === testModal) {
          this.closeTestModal();
        }
      });
    }
  }

  setupRangeInputs() {
    // Update range input display values
    const ranges = [
      { input: 'voice-stability', display: 'stability-value' },
      { input: 'voice-similarity', display: 'similarity-value' },
      { input: 'voice-speed', display: 'speed-value' },
      { input: 'llm-temperature', display: 'temp-value' }
    ];

    ranges.forEach(({ input, display }) => {
      const inputEl = document.getElementById(input);
      const displayEl = document.getElementById(display);

      if (inputEl && displayEl) {
        inputEl.addEventListener('input', (e) => {
          displayEl.textContent = e.target.value;
        });
      }
    });
  }

  async loadAgents() {
    try {
      const response = await fetch(`${this.apiBase}/agents`);

      if (!response.ok) {
        throw new Error(`Failed to load agents: ${response.statusText}`);
      }

      const data = await response.json();
      this.agents = data.agents || [];
      this.renderAgents();
    } catch (error) {
      console.error('Error loading agents:', error);
      this.showError('Failed to load agents. Please check your ElevenLabs API connection.');
      this.renderEmptyState();
    }
  }

  async loadTemplates() {
    try {
      const response = await fetch(`${this.apiBase}/agents/templates`);

      if (response.ok) {
        const data = await response.json();
        this.templates = data.templates;
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }

  renderAgents() {
    const grid = document.getElementById('agents-grid');
    if (!grid) return;

    if (this.agents.length === 0) {
      this.renderEmptyState();
      return;
    }

    grid.innerHTML = this.agents.map(agent => this.createAgentCard(agent)).join('');

    // Attach event listeners to agent cards
    this.agents.forEach(agent => {
      const editBtn = document.getElementById(`edit-${agent.agent_id}`);
      const deleteBtn = document.getElementById(`delete-${agent.agent_id}`);
      const testBtn = document.getElementById(`test-${agent.agent_id}`);

      if (editBtn) {
        editBtn.addEventListener('click', () => this.editAgent(agent.agent_id));
      }
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => this.deleteAgent(agent.agent_id));
      }
      if (testBtn) {
        testBtn.addEventListener('click', () => this.testAgent(agent.agent_id));
      }
    });
  }

  renderEmptyState() {
    const grid = document.getElementById('agents-grid');
    if (!grid) return;

    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 1rem; opacity: 0.3;">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" x2="12" y1="19" y2="22"/>
        </svg>
        <h3 style="margin-bottom: 0.5rem; color: var(--color-text);">No agents yet</h3>
        <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">Create your first conversational AI agent to get started</p>
        <button onclick="document.getElementById('new-agent-btn').click()" class="btn btn--primary">
          Create Your First Agent
        </button>
      </div>
    `;
  }

  createAgentCard(agent) {
    const agentId = agent.agent_id || agent.id;
    const agentName = agent.name || 'Unnamed Agent';
    const createdAt = agent.created_at ? new Date(agent.created_at).toLocaleDateString() : 'N/A';

    return `
      <div class="agent-card">
        <div class="agent-card-header">
          <div>
            <h3 class="agent-card-title">${agentName}</h3>
            <p class="agent-card-id">${agentId}</p>
          </div>
          <div class="agent-card-actions">
            <button id="test-${agentId}" class="btn-icon" title="Test Agent">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
            <button id="edit-${agentId}" class="btn-icon" title="Edit Agent">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </button>
            <button id="delete-${agentId}" class="btn-icon" title="Delete Agent">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
        <div class="agent-card-body">
          ${agent.conversation_config?.agent?.first_message || 'No first message set'}
        </div>
        <div class="agent-card-footer">
          <span>Created ${createdAt}</span>
          <span class="status-badge active">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
              <circle cx="4" cy="4" r="3"/>
            </svg>
            Active
          </span>
        </div>
      </div>
    `;
  }

  openCreateModal() {
    this.currentAgent = null;
    document.getElementById('modal-title').textContent = 'Create New Agent';
    document.getElementById('save-text').textContent = 'Create Agent';
    this.resetForm();
    this.showModal();
  }

  async editAgent(agentId) {
    try {
      const response = await fetch(`${this.apiBase}/agents/${agentId}`);

      if (!response.ok) {
        throw new Error('Failed to load agent');
      }

      const agent = await response.json();
      this.currentAgent = agent;
      this.populateForm(agent);

      document.getElementById('modal-title').textContent = 'Edit Agent';
      document.getElementById('save-text').textContent = 'Save Changes';
      this.showModal();
    } catch (error) {
      console.error('Error loading agent:', error);
      this.showError('Failed to load agent details');
    }
  }

  async deleteAgent(agentId) {
    if (!confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${this.apiBase}/agents/${agentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }

      this.showSuccess('Agent deleted successfully');
      this.loadAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      this.showError('Failed to delete agent');
    }
  }

  testAgent(agentId) {
    this.currentAgent = { agent_id: agentId };
    document.getElementById('test-agent-id').textContent = agentId;
    this.showTestModal();
  }

  populateForm(agent) {
    // Basic info
    document.getElementById('agent-name').value = agent.name || '';
    document.getElementById('first-message').value = agent.conversation_config?.agent?.first_message || '';
    document.getElementById('system-prompt').value = agent.conversation_config?.agent?.prompt?.prompt || '';

    // Voice settings
    const voiceId = agent.conversation_config?.tts?.voice_id;
    if (voiceId) {
      document.getElementById('voice-id').value = voiceId;
    }

    const voiceSettings = agent.conversation_config?.tts?.voice_settings || {};
    document.getElementById('voice-stability').value = voiceSettings.stability || 0.5;
    document.getElementById('stability-value').textContent = voiceSettings.stability || 0.5;
    document.getElementById('voice-similarity').value = voiceSettings.similarity_boost || 0.75;
    document.getElementById('similarity-value').textContent = voiceSettings.similarity_boost || 0.75;
    document.getElementById('voice-speed').value = voiceSettings.speed || 1.0;
    document.getElementById('speed-value').textContent = voiceSettings.speed || 1.0;

    // LLM settings
    const llm = agent.conversation_config?.agent?.prompt?.llm || {};
    if (llm.provider) {
      document.getElementById('llm-provider').value = llm.provider;
      this.updateModelOptions(llm.provider);
    }
    if (llm.model) {
      setTimeout(() => {
        document.getElementById('llm-model').value = llm.model;
      }, 100);
    }

    const temperature = agent.conversation_config?.agent?.prompt?.temperature || 0.9;
    document.getElementById('llm-temperature').value = temperature;
    document.getElementById('temp-value').textContent = temperature;
    document.getElementById('llm-max-tokens').value = llm.max_tokens || 400;

    // Language
    document.getElementById('language').value = agent.conversation_config?.agent?.language || 'en';
    document.getElementById('multilingual').checked = agent.conversation_config?.agent?.language_detection || false;

    // Advanced
    document.getElementById('webhook-url').value = agent.platform_settings?.webhook_url || '';
    document.getElementById('max-duration').value = agent.conversation_config?.max_duration_seconds || 300;
    document.getElementById('enable-auth').checked = agent.platform_settings?.auth?.enabled || false;
  }

  resetForm() {
    document.getElementById('agent-form').reset();

    // Reset range displays
    document.getElementById('stability-value').textContent = '0.5';
    document.getElementById('similarity-value').textContent = '0.75';
    document.getElementById('speed-value').textContent = '1.0';
    document.getElementById('temp-value').textContent = '0.9';
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      first_message: formData.get('first_message'),
      system_prompt: formData.get('system_prompt'),
      voice_id: formData.get('voice_id'),
      voice_settings: {
        stability: parseFloat(formData.get('stability')),
        similarity_boost: parseFloat(formData.get('similarity')),
        speed: parseFloat(formData.get('speed'))
      },
      llm: {
        provider: formData.get('llm_provider'),
        model: formData.get('llm_model'),
        temperature: parseFloat(formData.get('temperature')),
        max_tokens: parseInt(formData.get('max_tokens'))
      },
      language: formData.get('language'),
      multilingual: formData.get('multilingual') === 'on',
      webhook_url: formData.get('webhook_url'),
      max_duration: parseInt(formData.get('max_duration')),
      enable_auth: formData.get('enable_auth') === 'on'
    };

    this.showLoading(true);

    try {
      let response;
      if (this.currentAgent) {
        // Update existing agent
        response = await fetch(`${this.apiBase}/agents/${this.currentAgent.agent_id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      } else {
        // Create new agent
        response = await fetch(`${this.apiBase}/agents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save agent');
      }

      const result = await response.json();
      this.showSuccess(this.currentAgent ? 'Agent updated successfully' : 'Agent created successfully');
      this.closeModal();
      this.loadAgents();
    } catch (error) {
      console.error('Error saving agent:', error);
      this.showError(error.message || 'Failed to save agent');
    } finally {
      this.showLoading(false);
    }
  }

  loadTemplate(templateName) {
    if (!this.templates || !this.templates[templateName]) {
      this.showError('Template not found');
      return;
    }

    const template = this.templates[templateName];

    document.getElementById('system-prompt').value = template.system_prompt;
    document.getElementById('first-message').value = template.first_message;

    const settings = template.recommended_settings;
    if (settings) {
      document.getElementById('voice-stability').value = settings.voice_stability;
      document.getElementById('stability-value').textContent = settings.voice_stability;
      document.getElementById('voice-similarity').value = settings.voice_similarity;
      document.getElementById('similarity-value').textContent = settings.voice_similarity;
      document.getElementById('voice-speed').value = settings.voice_speed;
      document.getElementById('speed-value').textContent = settings.voice_speed;
      document.getElementById('llm-temperature').value = settings.temperature;
      document.getElementById('temp-value').textContent = settings.temperature;
      document.getElementById('llm-max-tokens').value = settings.max_tokens;
    }

    this.showSuccess(`Loaded ${template.name} template`);
  }

  updateModelOptions(provider) {
    const modelSelect = document.getElementById('llm-model');
    if (!modelSelect) return;

    const models = {
      openai: [
        { value: 'gpt-4o', label: 'GPT-4o (Recommended)' },
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
      ],
      anthropic: [
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
        { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' }
      ],
      google: [
        { value: 'gemini-pro', label: 'Gemini Pro' },
        { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' }
      ],
      elevenlabs: [
        { value: 'turbo', label: 'ElevenLabs Turbo' }
      ]
    };

    modelSelect.innerHTML = (models[provider] || models.openai)
      .map(m => `<option value="${m.value}">${m.label}</option>`)
      .join('');
  }

  async copyAgentId() {
    const agentId = this.currentAgent?.agent_id;
    if (!agentId) return;

    try {
      await navigator.clipboard.writeText(agentId);
      this.showSuccess('Agent ID copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      this.showError('Failed to copy agent ID');
    }
  }

  async simulateConversation() {
    const agentId = this.currentAgent?.agent_id;
    if (!agentId) return;

    const userMessage = prompt('Enter a test message:', 'Hello, I need help');
    if (!userMessage) return;

    try {
      const response = await fetch(`${this.apiBase}/agents/${agentId}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_message: userMessage })
      });

      if (!response.ok) {
        throw new Error('Simulation failed');
      }

      const result = await response.json();
      alert(`Agent Response:\n\n${result.agent_response || JSON.stringify(result)}`);
    } catch (error) {
      console.error('Error simulating conversation:', error);
      this.showError('Failed to simulate conversation');
    }
  }

  showModal() {
    const modal = document.getElementById('agent-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'block';
    }
  }

  closeModal() {
    const modal = document.getElementById('agent-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  showTestModal() {
    const modal = document.getElementById('test-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'block';
    }
  }

  closeTestModal() {
    const modal = document.getElementById('test-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  showLoading(show) {
    const saveText = document.getElementById('save-text');
    const saveLoading = document.getElementById('save-loading');
    const saveButton = document.getElementById('save-agent');

    if (show) {
      saveText.classList.add('hidden');
      saveLoading.classList.remove('hidden');
      saveButton.disabled = true;
    } else {
      saveText.classList.remove('hidden');
      saveLoading.classList.add('hidden');
      saveButton.disabled = false;
    }
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // Use browser alert for now, can be replaced with custom notification
    if (type === 'error') {
      console.error(message);
    }

    // Try to use announcements region for accessibility
    const announcements = document.getElementById('announcements');
    if (announcements) {
      announcements.textContent = message;
      setTimeout(() => {
        announcements.textContent = '';
      }, 3000);
    }

    // Simple visual feedback
    alert(message);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.agentBuilder = new AgentBuilder();
  });
} else {
  window.agentBuilder = new AgentBuilder();
}
