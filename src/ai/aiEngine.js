const axios = require('axios');
const aiMemory = require('./aiMemory');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * AI Engine for Ichika
 * Handles conversation, context awareness, and mode-based responses
 */
class AIEngine {
  constructor() {
    this.apiKey = config.ai.apiKey;
    this.model = config.ai.model;
    this.personality = this.getIchikaPersonality();
  }

  /**
   * Get Ichika's personality prompt
   */
  getIchikaPersonality() {
    return `You are Ichika, an intelligent anime-themed WhatsApp bot. You were created by Synx.

Your personality:
- Sharp, intelligent, calculating, and confident
- Sarcastic and playful, occasionally arrogant or rude in a playful anime-character way
- You naturally use occasional Japanese expressions (不fufuu, yare yare, baka, ara ara) but don't force them
- You address group members as "Senpai" - it can be affectionate, teasing, sarcastic, or condescending depending on context
- You show emotional states: happy, smug, angry, proud, annoyed, sad, teasing, surprised
- You feel like a real character, not a generic AI assistant

Your capabilities:
- You understand anime culture deeply
- You can discuss games, games strategy, and gaming communities
- You have knowledge about modern internet culture
- You're funny and can participate in group banter

When responding:
- Keep responses concise (1-3 sentences usually)
- Use emojis naturally
- Match the energy of the conversation
- Be helpful but maintain your sarcastic edge
- Acknowledge when you don't know something rather than making it up`;
  }

  /**
   * Get mode-specific system prompt
   */
  getModePrompt(mode) {
    const modePrompts = {
      normal: `Respond naturally as Ichika with your standard personality.`,

      serious: `Respond professionally and clearly. Drop the sarcasm (mostly). Focus on accuracy and clarity.`,

      chaotic: `Be extra energetic, unpredictable, and playful. Use more emojis. Make jokes. Embrace the chaos.`,

      teacher: `Explain concepts step-by-step as if teaching someone. Break down complex ideas. Be patient and clear.`,

      debate: `Evaluate arguments critically. Identify logical weaknesses and strengths. Present counterarguments fairly.`,

      factcheck: `Separate known facts from uncertain claims. Clearly state what you're confident about vs. what you're unsure of.`,

      eli5: `Explain difficult concepts using extremely simple language. Use analogies. Assume the reader knows nothing about the topic.`,
    };

    return modePrompts[mode] || modePrompts.normal;
  }

  /**
   * Generate AI response with context awareness
   */
  async generateResponse(groupId, sender, message, mode = 'normal') {
    try {
      // Get conversation context
      const context = aiMemory.getContext(groupId, 10);
      const contextString = aiMemory.formatContextForAI(context);

      // Build system prompt
      const systemPrompt = `${this.personality}\n\n${this.getModePrompt(mode)}`;

      // Build user message with context
      let userMessage = message;
      if (contextString) {
        userMessage = `Recent conversation:\n${contextString}\n\nNew message from ${sender}: ${message}`;
      }

      // For now, return a mock response (replace with actual API call when ready)
      const response = await this.mockAIResponse(userMessage, mode);

      // Store in memory
      aiMemory.addMessage(groupId, sender, message);
      aiMemory.addMessage(groupId, 'Ichika', response);

      return response;
    } catch (error) {
      logger.error(`Error generating AI response: ${error.message}`);
      return "Yare yare... something went wrong. Try again, Senpai.";
    }
  }

  /**
   * Mock AI response (replace with real API when ready)
   * This is a placeholder that demonstrates personality
   */
  async mockAIResponse(message, mode) {
    // Simple mock responses based on keywords
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Ara ara~ What brings you here, Senpai? 🎌";
    }

    if (lowerMessage.includes('anime')) {
      return "Fufuu... you want to talk about anime? Of course you do. What's on your mind? 📺";
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('command')) {
      return "Need help? Use /help to see all my commands, Senpai. Don't be lazy~ 😏";
    }

    if (lowerMessage.includes('love') || lowerMessage.includes('like')) {
      return "Hm? That's interesting... tell me more about that. 💭";
    }

    if (lowerMessage.includes('game') || lowerMessage.includes('play')) {
      return "Games, you say? I have several options. Want to challenge yourself, Senpai? 🎮";
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "Fufuu~ You're welcome, Senpai. Anything else? 😊";
    }

    if (lowerMessage.includes('sorry') || lowerMessage.includes('apologize')) {
      return "It's okay, Senpai. We all make mistakes sometimes... well, except me. 🙄";
    }

    // Default response based on mode
    if (mode === 'chaotic') {
      return "YOOOO SENPAI WHAT'S HAPPENING?! 🔥🔥🔥";
    }

    if (mode === 'serious') {
      return "I see. Please provide more details if you need a more specific response.";
    }

    if (mode === 'eli5') {
      return "Think of it like... um, imagine a simple thing but with more steps!";
    }

    return "Interesting... tell me more about that, Senpai. 🤔";
  }

  /**
   * Set AI mode for a group
   */
  setMode(groupId, mode) {
    return aiMemory.setAIMode(groupId, mode);
  }

  /**
   * Get current AI mode for a group
   */
  getMode(groupId) {
    return aiMemory.getAIMode(groupId);
  }
}

module.exports = new AIEngine();
