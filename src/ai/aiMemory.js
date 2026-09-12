const db = require('../database/db');
const logger = require('../utils/logger');

/**
 * AI Memory System
 * Maintains rolling context buffer and conversation history
 */
class AIMemory {
  constructor(bufferSize = 100) {
    this.bufferSize = bufferSize;
    this.conversationBuffers = new Map(); // groupId -> array of messages
    this.memoryStore = db; // Uses JSON database
  }

  /**
   * Add message to group's conversation buffer
   */
  addMessage(groupId, sender, message, timestamp = Date.now()) {
    if (!this.conversationBuffers.has(groupId)) {
      this.conversationBuffers.set(groupId, []);
    }

    const buffer = this.conversationBuffers.get(groupId);
    buffer.push({
      sender,
      message,
      timestamp,
    });

    // Keep buffer size limited
    if (buffer.length > this.bufferSize) {
      buffer.shift();
    }
  }

  /**
   * Get context for AI (recent conversation history)
   */
  getContext(groupId, count = 10) {
    if (!this.conversationBuffers.has(groupId)) {
      return [];
    }

    const buffer = this.conversationBuffers.get(groupId);
    return buffer.slice(Math.max(0, buffer.length - count));
  }

  /**
   * Format context for AI model
   */
  formatContextForAI(context) {
    return context
      .map(msg => `${msg.sender}: ${msg.message}`)
      .join('\n');
  }

  /**
   * Store important memory entry (daily summary, events, etc.)
   */
  storeMemoryEntry(groupId, type, content) {
    try {
      const memoryData = this.memoryStore.read('ai', `memory_${groupId}`) || {
        entries: [],
      };

      memoryData.entries.push({
        type, // 'summary', 'event', 'important_quote', 'preference'
        content,
        timestamp: Date.now(),
      });

      // Keep only recent entries (last 30 days worth)
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      memoryData.entries = memoryData.entries.filter(
        entry => entry.timestamp > thirtyDaysAgo
      );

      this.memoryStore.write('ai', `memory_${groupId}`, memoryData);
      logger.debug(`Memory entry stored for group ${groupId}`);
      return true;
    } catch (error) {
      logger.error(`Error storing memory entry: ${error.message}`);
      return false;
    }
  }

  /**
   * Retrieve stored memories
   */
  getMemories(groupId, type = null) {
    try {
      const memoryData = this.memoryStore.read('ai', `memory_${groupId}`);
      if (!memoryData) return [];

      if (type) {
        return memoryData.entries.filter(entry => entry.type === type);
      }

      return memoryData.entries;
    } catch (error) {
      logger.error(`Error retrieving memories: ${error.message}`);
      return [];
    }
  }

  /**
   * Clear buffer for a group (useful for testing)
   */
  clearBuffer(groupId) {
    this.conversationBuffers.delete(groupId);
  }

  /**
   * Get AI mode for a group
   */
  getAIMode(groupId) {
    const modeData = this.memoryStore.read('ai', `mode_${groupId}`);
    return modeData?.mode || 'normal';
  }

  /**
   * Set AI mode for a group
   */
  setAIMode(groupId, mode) {
    const validModes = [
      'normal',
      'serious',
      'chaotic',
      'teacher',
      'debate',
      'factcheck',
      'eli5',
    ];

    if (!validModes.includes(mode)) {
      logger.warn(`Invalid AI mode: ${mode}`);
      return false;
    }

    this.memoryStore.write('ai', `mode_${groupId}`, {
      mode,
      setAt: Date.now(),
    });
    logger.info(`AI mode set to ${mode} for group ${groupId}`);
    return true;
  }
}

module.exports = new AIMemory();
