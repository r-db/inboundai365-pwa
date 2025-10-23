/**
 * Chat UI Controller
 * Manages the chat interface and interactions
 */
import ChatClient from './chat-client.js';

class ChatUI {
  constructor() {
    this.chatClient = new ChatClient();
    this.isStreaming = false;
    this.elements = {};
    this.init();
  }

  init() {
    // Get DOM elements
    this.elements = {
      chatForm: document.getElementById('chat-form'),
      chatInput: document.getElementById('chat-input'),
      chatMessages: document.getElementById('chat-messages'),
      providerSelect: document.getElementById('provider-select'),
      streamToggle: document.getElementById('stream-toggle'),
      sendButton: document.getElementById('send-button'),
      stopButton: document.getElementById('stop-button'),
      clearButton: document.getElementById('clear-chat'),
      backendStatus: document.getElementById('backend-status')
    };

    // Check if we're on the chat page
    if (!this.elements.chatForm) return;

    // Set up event listeners
    this.setupEventListeners();

    // Check backend health
    this.checkBackendHealth();

    // Auto-resize textarea
    this.setupTextareaAutoResize();
  }

  setupEventListeners() {
    // Form submission
    this.elements.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSendMessage();
    });

    // Enter key to send (Shift+Enter for new line)
    this.elements.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    // Stop button
    this.elements.stopButton?.addEventListener('click', () => {
      this.handleStopGeneration();
    });

    // Clear chat
    this.elements.clearButton?.addEventListener('click', () => {
      this.handleClearChat();
    });
  }

  setupTextareaAutoResize() {
    this.elements.chatInput.addEventListener('input', () => {
      this.elements.chatInput.style.height = 'auto';
      this.elements.chatInput.style.height = Math.min(this.elements.chatInput.scrollHeight, 150) + 'px';
    });
  }

  async checkBackendHealth() {
    try {
      const isHealthy = await this.chatClient.checkHealth();

      if (isHealthy) {
        this.updateBackendStatus('healthy', 'Backend connected');
      } else {
        this.updateBackendStatus('error', 'Backend unavailable');
      }
    } catch (error) {
      this.updateBackendStatus('error', 'Backend unavailable');
    }
  }

  updateBackendStatus(status, text) {
    if (!this.elements.backendStatus) return;

    this.elements.backendStatus.className = `backend-status ${status}`;
    this.elements.backendStatus.querySelector('.status-text').textContent = text;
  }

  async handleSendMessage() {
    const message = this.elements.chatInput.value.trim();
    if (!message) return;

    const provider = this.elements.providerSelect.value;
    const useStreaming = this.elements.streamToggle?.checked ?? true;

    // Clear input
    this.elements.chatInput.value = '';
    this.elements.chatInput.style.height = 'auto';

    // Remove welcome message
    const welcome = this.elements.chatMessages.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    // Add user message
    this.addMessage('user', message);

    // Disable input during response
    this.setInputState(false);

    try {
      if (useStreaming) {
        await this.handleStreamingResponse(message, provider);
      } else {
        await this.handleNonStreamingResponse(message, provider);
      }
    } catch (error) {
      this.addMessage('error', error.message || 'Failed to get response from AI');
    } finally {
      this.setInputState(true);
    }
  }

  async handleStreamingResponse(message, provider) {
    this.isStreaming = true;

    // Show stop button, hide send button
    this.elements.sendButton?.classList.add('hidden');
    this.elements.stopButton?.classList.remove('hidden');

    // Create message container for streaming response
    const messageId = Date.now();
    const messageDiv = this.createMessageElement('assistant', '', messageId);
    this.elements.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();

    await this.chatClient.sendMessageStream(message, provider, {
      onChunk: (chunk, fullMessage) => {
        const msgElement = document.getElementById(`msg-${messageId}`);
        if (msgElement) {
          msgElement.textContent = fullMessage;
          this.scrollToBottom();
        }
      },
      onComplete: (fullMessage, model) => {
        this.isStreaming = false;
        // Add metadata
        const msgElement = document.getElementById(`msg-${messageId}`);
        if (msgElement && model) {
          const meta = document.createElement('div');
          meta.className = 'message-meta';
          meta.textContent = `Model: ${model}`;
          msgElement.appendChild(meta);
        }
        // Reset buttons
        this.elements.sendButton?.classList.remove('hidden');
        this.elements.stopButton?.classList.add('hidden');
      },
      onError: (error) => {
        this.isStreaming = false;
        this.addMessage('error', error.message || 'Streaming error occurred');
        // Remove incomplete message
        const msgElement = document.getElementById(`msg-${messageId}`);
        if (msgElement) msgElement.remove();
        // Reset buttons
        this.elements.sendButton?.classList.remove('hidden');
        this.elements.stopButton?.classList.add('hidden');
      }
    });
  }

  async handleNonStreamingResponse(message, provider) {
    // Show loading
    const loadingId = this.showLoading();

    try {
      const response = await this.chatClient.sendMessage(message, provider);

      // Remove loading
      this.removeLoading(loadingId);

      // Add response
      this.addMessage('assistant', response.message, response.model);
    } catch (error) {
      this.removeLoading(loadingId);
      throw error;
    }
  }

  handleStopGeneration() {
    this.chatClient.cancelStream();
    this.isStreaming = false;
    this.elements.sendButton?.classList.remove('hidden');
    this.elements.stopButton?.classList.add('hidden');
  }

  handleClearChat() {
    if (confirm('Clear all messages?')) {
      this.chatClient.clearHistory();

      // Clear messages
      this.elements.chatMessages.innerHTML = `
        <div class="chat-welcome">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <h2>Welcome to AI Chat</h2>
          <p>Start a conversation with our AI assistant. Choose your preferred model and ask anything!</p>
        </div>
      `;
    }
  }

  addMessage(role, content, model = null) {
    const messageDiv = this.createMessageElement(role, content);
    if (model && role === 'assistant') {
      const meta = document.createElement('div');
      meta.className = 'message-meta';
      meta.textContent = `Model: ${model}`;
      messageDiv.appendChild(meta);
    }
    this.elements.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  createMessageElement(role, content, id = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message chat-message--${role}`;
    if (id) messageDiv.id = `msg-${id}`;
    messageDiv.textContent = content;
    return messageDiv;
  }

  showLoading() {
    const id = Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = `loading-${id}`;
    loadingDiv.className = 'chat-message chat-message--loading';
    loadingDiv.textContent = 'Thinking';
    this.elements.chatMessages.appendChild(loadingDiv);
    this.scrollToBottom();
    return id;
  }

  removeLoading(id) {
    const loading = document.getElementById(`loading-${id}`);
    if (loading) loading.remove();
  }

  setInputState(enabled) {
    this.elements.chatInput.disabled = !enabled;
    this.elements.sendButton.disabled = !enabled;
    this.elements.providerSelect.disabled = !enabled;

    if (enabled) {
      this.elements.chatInput.focus();
    }
  }

  scrollToBottom() {
    this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
  }
}

export default ChatUI;
