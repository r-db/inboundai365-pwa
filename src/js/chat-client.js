/**
 * Chat API Client with Streaming Support
 * Handles communication with backend LLM service
 */
class ChatClient {
  constructor() {
    // Use backend on port 5001 in development
    this.apiBase = window.location.hostname === 'localhost' && (window.location.port === '3000' || window.location.port === '4000')
      ? 'http://localhost:5001/api'
      : '/api';
    this.conversationHistory = [];
    this.abortController = null;
    this.csrfToken = null;

    // Fetch CSRF token on initialization
    this.fetchCsrfToken();
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
      'Content-Type': 'application/json'
    };
    if (this.csrfToken) {
      headers['X-CSRFToken'] = this.csrfToken;
    }
    // Add tenant ID from global tenant configuration
    if (window.tenantContext && window.tenantContext.tenant_id) {
      headers['X-Tenant-ID'] = window.tenantContext.tenant_id;
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
    try {
      // Ensure we have a CSRF token
      if (!this.csrfToken) {
        await this.fetchCsrfToken();
      }

      const response = await fetch(`${this.apiBase}/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',  // Include cookies for session
        body: JSON.stringify({
          message: message,
          provider: provider,
          model: model,
          history: this.conversationHistory
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();

      // Update conversation history
      this.conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: data.message }
      );

      return data;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
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
      // Ensure we have a CSRF token
      if (!this.csrfToken) {
        await this.fetchCsrfToken();
      }

      const response = await fetch(`${this.apiBase}/chat/stream`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',  // Include cookies for session
        body: JSON.stringify({
          message: message,
          provider: provider,
          history: this.conversationHistory
        }),
        signal: this.abortController.signal
      });

      console.log('[ChatClient] Stream response status:', response.status);
      console.log('[ChatClient] Stream response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ChatClient] Stream error response:', errorText);
        throw new Error(errorText || 'Failed to send message');
      }

      // Read stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullMessage = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          console.log('[ChatClient] SSE line:', line);
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'chunk') {
                fullMessage += data.content;
                if (onChunk) onChunk(data.content, fullMessage);
              } else if (data.type === 'done') {
                // Update history
                this.conversationHistory.push(
                  { role: 'user', content: message },
                  { role: 'assistant', content: fullMessage }
                );
                if (onComplete) onComplete(fullMessage, data.model, data.usage);
              } else if (data.type === 'error') {
                if (onError) onError(new Error(data.error));
              }
            } catch (e) {
              console.error('Failed to parse SSE:', e);
            }
          }
        }
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
      const response = await fetch(`${this.apiBase}/health`);
      const data = await response.json();
      return data.status === 'healthy';
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
