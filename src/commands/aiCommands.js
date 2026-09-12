const aiEngine = require('../ai/aiEngine');
const aiMemory = require('../ai/aiMemory');
const logger = require('../utils/logger');

/**
 * AI-related commands
 */
class AICommands {
  /**
   * /ai [mode] - Change AI mode
   */
  static async handleAIMode(message, args, groupId, sender) {
    if (args.length === 0) {
      const currentMode = aiMemory.getAIMode(groupId);
      return `Current AI mode: ${currentMode}\n\nAvailable modes: normal, serious, chaotic, teacher, debate, factcheck, eli5`;
    }

    const mode = args[0].toLowerCase();
    if (aiEngine.setMode(groupId, mode)) {
      const modeEmojis = {
        normal: '😊',
        serious: '🎩',
        chaotic: '🔥',
        teacher: '📚',
        debate: '⚖️',
        factcheck: '🔍',
        eli5: '🧸',
      };

      return `${modeEmojis[mode] || '✨'} Switched to **${mode}** mode, Senpai!`;
    }

    return "That's not a valid mode, Senpai. Try: normal, serious, chaotic, teacher, debate, factcheck, or eli5.";
  }

  /**
   * /memory [type] - View stored memories
   */
  static handleMemory(args, groupId) {
    const type = args[0]?.toLowerCase() || null;
    const memories = aiMemory.getMemories(groupId, type);

    if (memories.length === 0) {
      return "No memories stored yet, Senpai. Come back when I have more to remember~ 💭";
    }

    let response = `📚 **Memories** (${memories.length} stored):\n\n`;
    memories.slice(-5).forEach((memory, index) => {
      response += `${index + 1}. [${memory.type.toUpperCase()}] ${memory.content.substring(0, 50)}...\n`;
    });

    return response;
  }

  /**
   * /clearcontext - Clear conversation buffer (admin only)
   */
  static handleClearContext(groupId, isAdmin) {
    if (!isAdmin) {
      return "Only admins can clear the conversation context, Senpai.";
    }

    aiMemory.clearBuffer(groupId);
    return "Conversation context cleared. Fresh start! 🔄";
  }
}

module.exports = AICommands;
