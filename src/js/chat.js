/**
 * Robust Chat System
 * A reliable, self-healing chat implementation that works consistently
 */

export class RobustChat {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.messagesContainer = null;
    this.input = null;
    this.sendButton = null;
    this.chatClient = null;
    this.crmClient = null;
    this.initialized = false;
    this.retryCount = 0;
    this.maxRetries = 3;

    // Token tracking
    this.totalTokensIn = 0;
    this.totalTokensOut = 0;

    // Initialize CRM Client for appointment booking
    this.initCRMClient();

    // Bind methods to preserve context
    this.handleSend = this.handleSend.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleInput = this.handleInput.bind(this);

    this.init();
  }

  initCRMClient() {
    try {
      // Check if CRMClient is available
      if (typeof window.CRMClient !== 'undefined') {
        this.crmClient = new window.CRMClient(
          '11111111-1111-1111-1111-111111111111', // Demo tenant ID
          'http://localhost:5000' // CRM backend URL
        );
        console.log('[RobustChat] CRM Client initialized');

        // Test CRM API connection
        this.testCRMConnection();
      } else {
        console.warn('[RobustChat] CRMClient not available - appointment booking disabled');
      }
    } catch (error) {
      console.error('[RobustChat] Failed to initialize CRM Client:', error);
    }
  }

  async testCRMConnection() {
    try {
      // Test health check
      const isHealthy = await this.crmClient.healthCheck();
      console.log('[RobustChat] CRM API health check:', isHealthy ? 'OK' : 'FAILED');

      // Test availability check (example call)
      // Using null for serviceId as a test - real implementation will use actual service IDs
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + 7); // 7 days from now
      const dateStr = testDate.toISOString().split('T')[0]; // YYYY-MM-DD format

      console.log('[RobustChat] Testing CRM availability check for date:', dateStr);
      // Note: This will likely fail without a valid service_id, but tests the connection
      // In production, we'll get services first, then check availability
    } catch (error) {
      console.warn('[RobustChat] CRM API test failed (expected in dev):', error.message);
    }
  }

  async init() {
    console.log('[RobustChat] Initializing...');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      });
    }

    // Find container
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.error('[RobustChat] Container not found:', this.containerId);
      return;
    }

    // Build UI
    this.buildUI();

    // Get DOM elements
    this.messagesContainer = this.container.querySelector('[data-chat-messages]');
    this.input = this.container.querySelector('[data-chat-input]');
    this.sendButton = this.container.querySelector('[data-chat-send]');

    if (!this.messagesContainer || !this.input || !this.sendButton) {
      console.error('[RobustChat] Required elements not found');
      return;
    }

    // Initialize ChatClient
    await this.initChatClient();

    // Attach event listeners
    this.attachEventListeners();

    // Add welcome message
    this.addBotMessage("Hi, I'm Aveena! How can I help?");

    this.initialized = true;
    console.log('[RobustChat] Initialization complete');
  }

  buildUI() {
    // Clear existing content
    this.container.innerHTML = '';

    // Create chat structure
    this.container.innerHTML = `
      <div class="chat-messages-wrapper">
        <div class="chat-messages" data-chat-messages></div>
      </div>
      <div class="chat-input-wrapper">
        <input
          type="text"
          class="chat-input"
          data-chat-input
          placeholder="Type your message..."
          aria-label="Chat message"
        />
        <button
          class="chat-send-button"
          data-chat-send
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    `;
  }

  async initChatClient() {
    try {
      // Check if ChatClient is available globally
      if (typeof window.ChatClient === 'undefined') {
        console.log('[RobustChat] ChatClient not loaded, attempting to load...');

        // Try to dynamically import
        const module = await import('./chat-client.js');
        window.ChatClient = module.default || module.ChatClient;
      }

      // Create instance
      this.chatClient = new window.ChatClient();

      // Verify it initialized properly
      const isHealthy = await this.chatClient.checkHealth();
      if (!isHealthy) {
        console.warn('[RobustChat] Backend health check failed');
      }

      console.log('[RobustChat] ChatClient initialized successfully');
    } catch (error) {
      console.error('[RobustChat] Failed to initialize ChatClient:', error);
      this.addSystemMessage('Chat connection error. Please refresh the page.');
    }
  }

  attachEventListeners() {
    // Remove any existing listeners first
    this.removeEventListeners();

    // Send button click
    this.sendButton.addEventListener('click', this.handleSend);

    // Enter key press
    this.input.addEventListener('keypress', this.handleKeyPress);

    // Input changes (for button state)
    this.input.addEventListener('input', this.handleInput);

    console.log('[RobustChat] Event listeners attached');
  }

  removeEventListeners() {
    if (this.sendButton) {
      this.sendButton.removeEventListener('click', this.handleSend);
    }
    if (this.input) {
      this.input.removeEventListener('keypress', this.handleKeyPress);
      this.input.removeEventListener('input', this.handleInput);
    }
  }

  handleInput() {
    // Enable/disable send button based on input
    const hasText = this.input.value.trim().length > 0;
    this.sendButton.disabled = !hasText;
  }

  handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSend();
    }
  }

  async enrichMessageWithCRM(message) {
    // Check if message is appointment-related
    const appointmentKeywords = ['appointment', 'schedule', 'book', 'available', 'availability', 'slot', 'time'];
    const isAppointmentRelated = appointmentKeywords.some(keyword =>
      message.toLowerCase().includes(keyword)
    );

    if (!isAppointmentRelated || !this.crmClient) {
      return '';
    }

    try {
      console.log('[RobustChat] Enriching message with CRM context');

      // Get available services
      const servicesResponse = await this.crmClient.getServices();
      console.log('[RobustChat] Services response:', servicesResponse);

      if (!servicesResponse.success || !servicesResponse.data?.services) {
        console.warn('[RobustChat] No services data available');
        return '';
      }

      const servicesData = servicesResponse.data.services;

      // Get availability for today and tomorrow (using first service as example)
      const today = new Date();
      const availabilityPromises = [];

      if (servicesData.length > 0) {
        const firstService = servicesData[0];

        for (let i = 0; i < 2; i++) {  // Only check today and tomorrow to avoid rate limits
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() + i);
          const dateStr = checkDate.toISOString().split('T')[0];

          availabilityPromises.push(
            this.crmClient.checkAvailability(firstService.id, dateStr, 60)
              .then(result => ({ ...result, date: dateStr }))
              .catch(err => ({ date: dateStr, error: err.message }))
          );
        }
      }

      const availabilityData = await Promise.all(availabilityPromises);

      // Build context string
      let context = '\n\n[CRM CONTEXT - Use this data to answer the user\'s question]\n';

      if (servicesData.length > 0) {
        context += '\nAvailable Services:\n';
        servicesData.forEach(service => {
          context += `- ${service.name} (${service.duration_minutes}min, ${service.price})\n`;
        });
      }

      if (availabilityData.length > 0) {
        context += '\nAvailability (today and tomorrow):\n';
        availabilityData.forEach(day => {
          if (day.data?.available_slots) {
            context += `${day.date}: ${day.data.available_slots.length} slots available\n`;
          }
        });
      }

      context += '[END CRM CONTEXT]\n';

      console.log('[RobustChat] CRM context added:', context);
      return context;

    } catch (error) {
      console.error('[RobustChat] Failed to enrich with CRM data:', error);
      return '';
    }
  }

  async handleSend() {
    const message = this.input.value.trim();

    if (!message) {
      console.log('[RobustChat] Empty message, ignoring');
      return;
    }

    if (!this.chatClient) {
      console.error('[RobustChat] ChatClient not available');
      this.addSystemMessage('Chat not ready. Please refresh the page.');
      return;
    }

    console.log('[RobustChat] Sending message:', message);

    // Add user message to UI
    this.addUserMessage(message);

    // Clear input
    this.input.value = '';
    this.sendButton.disabled = true;

    // Show typing indicator
    const typingId = this.addTypingIndicator();

    try {
      // Enrich with CRM context if needed
      const crmContext = await this.enrichMessageWithCRM(message);
      const enrichedMessage = message + crmContext;

      // Send message with streaming
      let fullResponse = '';

      await this.chatClient.sendMessageStream(enrichedMessage, 'openai', {
        onChunk: (chunk, fullMessage) => {
          console.log('[RobustChat] Chunk received:', chunk);
          fullResponse = fullMessage;
        },
        onComplete: (fullMessage, model, usage) => {
          console.log('[RobustChat] Stream complete:', { fullMessage, model, usage });
          this.removeTypingIndicator(typingId);
          this.addBotMessage(fullMessage);

          // Update token counter if usage data is available
          if (usage) {
            this.updateTokenCounter(usage);
          }

          console.log('[RobustChat] Message sent successfully', usage);
        },
        onError: (error) => {
          console.error('[RobustChat] Stream error:', error);
          this.removeTypingIndicator(typingId);
          this.addSystemMessage('Failed to send message. Please try again.');
        }
      });

    } catch (error) {
      console.error('[RobustChat] Send error:', error);
      this.removeTypingIndicator(typingId);
      this.addSystemMessage('An error occurred. Please try again.');
    }

    // Re-focus input
    this.input.focus();
  }

  addUserMessage(text) {
    const messageEl = this.createMessageElement(text, 'user');
    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  addBotMessage(text) {
    const messageEl = this.createMessageElement(text, 'bot');
    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  addSystemMessage(text) {
    const messageEl = this.createMessageElement(text, 'system');
    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  addTypingIndicator() {
    const id = 'typing-' + Date.now();
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-message chat-message--bot chat-message--typing';
    typingEl.id = id;
    typingEl.innerHTML = `
      <div class="chat-message__avatar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 8V4H8"/>
          <rect width="16" height="12" x="4" y="8" rx="2"/>
          <path d="M2 14h2"/>
          <path d="M20 14h2"/>
          <path d="M15 13v2"/>
          <path d="M9 13v2"/>
        </svg>
      </div>
      <div class="chat-message__content">
        <span class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </div>
    `;
    this.messagesContainer.appendChild(typingEl);
    this.scrollToBottom();
    return id;
  }

  removeTypingIndicator(id) {
    const typingEl = document.getElementById(id);
    if (typingEl) {
      typingEl.remove();
    }
  }

  createMessageElement(text, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message chat-message--${type}`;

    if (type === 'bot') {
      messageEl.innerHTML = `
        <div class="chat-message__avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8V4H8"/>
            <rect width="16" height="12" x="4" y="8" rx="2"/>
            <path d="M2 14h2"/>
            <path d="M20 14h2"/>
            <path d="M15 13v2"/>
            <path d="M9 13v2"/>
          </svg>
        </div>
        <div class="chat-message__content">${this.escapeHtml(text)}</div>
      `;
    } else if (type === 'user') {
      messageEl.innerHTML = `
        <div class="chat-message__content">${this.escapeHtml(text)}</div>
        <div class="chat-message__avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>
          </svg>
        </div>
      `;
    } else if (type === 'system') {
      messageEl.innerHTML = `
        <div class="chat-message__content chat-message__content--system">${this.escapeHtml(text)}</div>
      `;
    }

    return messageEl;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    });
  }

  updateTokenCounter(usage) {
    console.log('[RobustChat] updateTokenCounter called with:', usage);

    if (!usage) {
      console.warn('[RobustChat] No usage data provided to updateTokenCounter');
      return;
    }

    // Handle both OpenAI and Claude token formats
    const tokensIn = usage.prompt_tokens || usage.input_tokens || 0;
    const tokensOut = usage.completion_tokens || usage.output_tokens || 0;

    console.log('[RobustChat] Parsed tokens:', { tokensIn, tokensOut });

    // Update totals
    this.totalTokensIn += tokensIn;
    this.totalTokensOut += tokensOut;

    // Update UI
    const tokensInEl = document.getElementById('tokens-in');
    const tokensOutEl = document.getElementById('tokens-out');
    const tokensTotalEl = document.getElementById('tokens-total');

    if (tokensInEl) tokensInEl.textContent = this.totalTokensIn.toLocaleString();
    if (tokensOutEl) tokensOutEl.textContent = this.totalTokensOut.toLocaleString();
    if (tokensTotalEl) {
      tokensTotalEl.textContent = (this.totalTokensIn + this.totalTokensOut).toLocaleString();
    }

    console.log('[RobustChat] Token counter updated:', {
      in: this.totalTokensIn,
      out: this.totalTokensOut,
      total: this.totalTokensIn + this.totalTokensOut
    });
  }

  // Public method to reinitialize (useful after navigation)
  async reinit() {
    console.log('[RobustChat] Reinitializing...');
    this.destroy();
    await this.init();
  }

  // Cleanup method
  destroy() {
    console.log('[RobustChat] Cleaning up...');
    this.removeEventListeners();
    this.initialized = false;
    this.chatClient = null;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChat);
} else {
  initChat();
}

function initChat() {
  const chatContainer = document.getElementById('robust-chat-container');
  if (chatContainer) {
    window.robustChat = new RobustChat('robust-chat-container');
  }
}

// Make available globally for direct script access
if (typeof window !== 'undefined') {
  window.RobustChat = RobustChat;
}

// Listen for page navigation to reinitialize
window.addEventListener('viewtransition', () => {
  console.log('[RobustChat] View transition detected, reinitializing...');
  setTimeout(() => {
    if (window.robustChat) {
      window.robustChat.reinit();
    } else {
      initChat();
    }
  }, 100);
});
