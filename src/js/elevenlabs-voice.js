/**
 * ElevenLabs Voice Agent Integration
 * Handles voice conversations using ElevenLabs Conversational AI
 */

export class ElevenLabsVoice {
  constructor(config = {}) {
    this.agentId = config.agentId || this.getDefaultAgentId();
    this.isReady = false;
    this.currentConversation = null;

    this.init();
  }

  /**
   * Get the default agent ID from environment or backend
   */
  getDefaultAgentId() {
    // Try to get from backend configuration
    return localStorage.getItem('elevenlabs_agent_id') || 'YOUR_AGENT_ID_HERE';
  }

  /**
   * Initialize ElevenLabs integration
   */
  async init() {
    try {
      // Load agent configuration from backend if available
      await this.loadAgentConfig();

      // Wait for ElevenLabs SDK to load
      this.waitForSDK();
    } catch (error) {
      console.error('Failed to initialize ElevenLabs:', error);
    }
  }

  /**
   * Load agent configuration from backend
   */
  async loadAgentConfig() {
    try {
      const apiBase = this.getApiBase();
      const response = await fetch(`${apiBase}/agents/default`);

      if (response.ok) {
        const data = await response.json();
        if (data.agent_id) {
          this.agentId = data.agent_id;
          localStorage.setItem('elevenlabs_agent_id', this.agentId);
        }
      }
    } catch (error) {
      console.warn('Could not load agent config from backend:', error);
    }
  }

  /**
   * Get API base URL
   */
  getApiBase() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    return '/api';
  }

  /**
   * Wait for ElevenLabs SDK to be available
   */
  waitForSDK() {
    const checkSDK = setInterval(() => {
      if (window.ElevenLabs && window.ElevenLabs.Convai) {
        this.isReady = true;
        clearInterval(checkSDK);
        console.log('ElevenLabs SDK ready');
        this.onReady();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkSDK);
      if (!this.isReady) {
        console.warn('ElevenLabs SDK failed to load');
      }
    }, 10000);
  }

  /**
   * Called when SDK is ready
   */
  onReady() {
    // SDK is ready, can start conversations
  }

  /**
   * Start a voice conversation with the agent
   */
  async startConversation() {
    if (!this.isReady) {
      throw new Error('ElevenLabs SDK not ready');
    }

    if (this.agentId === 'YOUR_AGENT_ID_HERE') {
      throw new Error('Agent ID not configured. Please set your ElevenLabs agent ID.');
    }

    try {
      // Start the conversation
      this.currentConversation = await window.ElevenLabs.Convai.startSession({
        agentId: this.agentId,
        onConnect: () => {
          console.log('Connected to voice agent');
        },
        onDisconnect: () => {
          console.log('Disconnected from voice agent');
          this.currentConversation = null;
        },
        onMessage: (message) => {
          console.log('Agent message:', message);
        },
        onError: (error) => {
          console.error('Conversation error:', error);
          this.handleError(error);
        }
      });

      return this.currentConversation;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      throw error;
    }
  }

  /**
   * End the current conversation
   */
  async endConversation() {
    if (this.currentConversation) {
      try {
        await this.currentConversation.end();
        this.currentConversation = null;
      } catch (error) {
        console.error('Error ending conversation:', error);
      }
    }
  }

  /**
   * Handle errors
   */
  handleError(error) {
    // Override this method to handle errors in your app
    console.error('ElevenLabs error:', error);
  }

  /**
   * Set a new agent ID
   */
  setAgentId(agentId) {
    this.agentId = agentId;
    localStorage.setItem('elevenlabs_agent_id', agentId);
  }

  /**
   * Check if a conversation is active
   */
  isConversationActive() {
    return this.currentConversation !== null;
  }
}

// Create a global instance
window.elevenLabsVoice = new ElevenLabsVoice();

export default ElevenLabsVoice;
