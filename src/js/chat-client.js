/**
 * Chat API Client with Streaming Support
 * Handles communication with backend LLM service
 */
class ChatClient {
  constructor() {
    this.defaultApiBase = this.resolveDefaultApiBase();
    this.apiBase = this.resolveApiBase();
    console.log('[ChatClient] Using API base:', this.apiBase);
    this.conversationHistory = [];
    this.abortController = null;
    this.csrfToken = null;
    this.availableBots = [];
    this.activeBot = null;
    this.conversationId = null;

    // Fetch CSRF token on initialization
    this.fetchCsrfToken();

    // Update API base when tenant configuration loads
    if (typeof window !== 'undefined') {
      window.addEventListener('tenant-config-loaded', (event) => {
        this.apiBase = this.resolveApiBase(event.detail);
        console.log('[ChatClient] Tenant config loaded. API base set to:', this.apiBase);
      });
    }
  }

  resolveDefaultApiBase() {
    if (typeof window === 'undefined') {
      return 'https://api.ib365.ai/api';
    }

    const host = window.location.hostname;
    const port = window.location.port;

    if (host === 'localhost' || host === '127.0.0.1') {
      if (port === '3000' || port === '4000') {
        return 'http://localhost:5001/api';
      }
      return '/api';
    }

    if (host.endsWith('.ib365.ai') || host === 'ib365.ai') {
      return 'https://api.ib365.ai/api';
    }

    return '/api';
  }

  resolveApiBase(config) {
    if (config?.api_base_url) {
      return config.api_base_url;
    }

    if (typeof window !== 'undefined') {
      if (window.tenantContext?.api_base_url) {
        return window.tenantContext.api_base_url;
      }
    }

    return this.defaultApiBase;
  }

  /**
   * Fetch CSRF token from backend
   * @private
   */
  async fetchCsrfToken() {
    try {
      const response = await fetch(`${this.apiBase}/csrf-token`, {
        credentials: 'include'  // Include cookies for session
      });
      const data = await response.json();
      this.csrfToken = data.csrf_token;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  }

  /**
   * Get headers with CSRF token and tenant ID
   * @private
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (this.csrfToken) {
      headers['X-CSRFToken'] = this.csrfToken;
    }
    // Add tenant ID from global tenant configuration
    if (window.tenantContext) {
      const { tenant_id, api_token } = window.tenantContext;
      if (tenant_id) {
        headers['X-Tenant-ID'] = tenant_id;
      }
      if (api_token) {
        headers['Authorization'] = `Bearer ${api_token}`;
      }
    }
    return headers;
  }

  /**
   * Send message to chatbot (non-streaming)
   * @param {string} message - User message
   * @param {string} provider - 'openai' or 'claude'
   * @param {string} model - Specific model ID
   * @returns {Promise<object>} Response from LLM
   */
  async sendMessage(message, provider = 'openai', model = null) {
    const result = await this.sendMessageInternal(message);
    return {
      message: result.message,
      model: result.model,
      usage: result.usage
    };
  }

  /**
   * Send message with streaming response
   * @param {string} message - User message
   * @param {string} provider - 'openai' or 'claude'
   * @param {object} callbacks - { onChunk, onComplete, onError }
   */
  async sendMessageStream(message, provider, callbacks) {
    const { onChunk, onComplete, onError } = callbacks;
    this.abortController = new AbortController();

    try {
      const result = await this.sendMessageInternal(message);

      if (onChunk) {
        onChunk(result.message, result.message);
      }

      if (onComplete) {
        onComplete(result.message, result.model, result.usage);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Stream error:', error);
        if (onError) onError(error);
      }
    }
  }

  async sendMessageInternal(message) {
    try {
      await this.ensureConversation();

      const response = await fetch(
        `${this.apiBase}/public/ai-chat/conversations/${this.conversationId}/messages`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          credentials: 'include',
          body: JSON.stringify({ message })
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.response?.message) {
        throw new Error(data?.error || 'Failed to send message');
      }

      const aiMessage = data.response.message;
      const usage = data.response.tokens_used
        ? { total_tokens: data.response.tokens_used }
        : null;

      this.conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: aiMessage }
      );

      return {
        message: aiMessage,
        model: data.response.model || null,
        usage
      };
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  async ensureConversation() {
    if (this.conversationId) {
      return this.conversationId;
    }

    const tenantId = this.getTenantId();
    if (!tenantId) {
      throw new Error('Tenant context unavailable. Chat cannot start.');
    }

    // Load bots if needed
    if (!this.activeBot) {
      await this.loadAvailableBots();
    }

    if (!this.activeBot) {
      throw new Error('No AI assistant is enabled for this tenant.');
    }

    const response = await fetch(`${this.apiBase}/public/ai-chat/conversations`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        botId: this.activeBot.tenant_bot_id,
        userName: 'Website Visitor'
      })
    });

    const data = await response.json();

    if (!response.ok || !data?.conversation?.conversation_id) {
      throw new Error(data?.error || 'Failed to start conversation');
    }

    this.conversationId = data.conversation.conversation_id;
    console.log('[ChatClient] Conversation started:', this.conversationId);
    return this.conversationId;
  }

  async loadAvailableBots() {
    const tenantId = this.getTenantId();
    if (!tenantId) return;

    try {
      const response = await fetch(`${this.apiBase}/public/ai-chat/bots`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load AI bots');
      }

      this.availableBots = data.bots || [];

      if (this.availableBots.length === 0) {
        console.warn('[ChatClient] No AI bots configured for tenant.');
        return;
      }

      const preferredBotId = window.tenantContext?.ai_assistant?.default_bot_id;
      const matched = preferredBotId
        ? this.availableBots.find(bot => bot.tenant_bot_id === preferredBotId)
        : null;

      this.activeBot = matched || this.availableBots[0];
      console.log('[ChatClient] Active AI bot:', this.activeBot?.name || 'Default');
    } catch (error) {
      console.error('[ChatClient] Failed to load AI bots:', error);
      this.availableBots = [];
      this.activeBot = null;
    }
  }

  getTenantId() {
    return window.tenantContext?.tenant_id || null;
  }

  /**
   * Cancel ongoing streaming request
   */
  cancelStream() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return [...this.conversationHistory];
  }

  /**
   * Get available models
   * @returns {Promise<object>} Available models
   */
  async getModels() {
    try {
      const response = await fetch(`${this.apiBase}/models`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch models:', error);
      return { openai: [], claude: [] };
    }
  }

  /**
   * Health check
   * @returns {Promise<boolean>} True if backend is healthy
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.apiBase}/public/ai-chat/bots`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      if (!response.ok) return false;
      const data = await response.json();
      return Array.isArray(data.bots) && data.bots.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get rate limit info
   */
  async getRateLimits() {
    try {
      const response = await fetch(`${this.apiBase}/rate-limit`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch rate limits:', error);
      return null;
    }
  }
}

// Make available globally for inline scripts
if (typeof window !== 'undefined') {
  window.ChatClient = ChatClient;
}

export default ChatClient;
