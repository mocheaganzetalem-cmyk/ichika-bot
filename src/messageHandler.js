const aiEngine = require('./ai/aiEngine');
const aiMemory = require('./ai/aiMemory');
const aiCommands = require('./commands/aiCommands');
const logger = require('./utils/logger');
const config = require('./config/config');

/**
 * Core message handler
 * Routes messages to appropriate handlers
 */
class MessageHandler {
  constructor() {
    this.commandPrefix = '/';
    this.mentionPattern = /@?Ichika/i;
    this.cooldowns = new Map();
  }

  /**
   * Check if user is on cooldown
   */
  isOnCooldown(userId) {
    if (!this.cooldowns.has(userId)) return false;

    const expirationTime =
      this.cooldowns.get(userId) + config.cooldowns.command;
    if (Date.now() < expirationTime) {
      return true;
    }

    this.cooldowns.delete(userId);
    return false;
  }

  /**
   * Set cooldown for user
   */
  setCooldown(userId) {
    this.cooldowns.set(userId, Date.now());
  }

  /**
   * Check if message is a command
   */
  isCommand(text) {
    return text.startsWith(this.commandPrefix);
  }

  /**
   * Check if message mentions Ichika
   */
  isMention(text) {
    return this.mentionPattern.test(text);
  }

  /**
   * Parse command
   */
  parseCommand(text) {
    const parts = text.slice(this.commandPrefix.length).split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    return { command, args };
  }

  /**
   * Handle incoming message
   */
  async handleMessage(messageData) {
    try {
      const {
        text,
        sender,
        groupId,
        isGroupMsg,
        isCommand: explicitCommand = false,
        isFromMe = false,
      } = messageData;

      // Ignore bot's own messages
      if (isFromMe) return null;

      // Ignore empty messages
      if (!text || text.trim().length === 0) return null;

      const cleanText = text.trim();

      logger.debug(
        `Message from ${sender} in ${groupId}: ${cleanText.substring(0, 50)}`
      );

      // Check cooldown
      if (this.isOnCooldown(sender)) {
        return null; // Silently ignore cooldown
      }

      // Handle commands
      if (this.isCommand(cleanText)) {
        return await this.handleCommand(cleanText, sender, groupId, isGroupMsg);
      }

      // Handle mentions (only in groups)
      if (isGroupMsg && this.isMention(cleanText)) {
        this.setCooldown(sender);
        return await this.handleMention(cleanText, sender, groupId);
      }

      // Add to memory even if no response
      if (isGroupMsg) {
        aiMemory.addMessage(groupId, sender, cleanText);
      }

      return null;
    } catch (error) {
      logger.error(`Error handling message: ${error.message}`);
      return "Yare yare... something went wrong. Try again.";
    }
  }

  /**
   * Handle command
   */
  async handleCommand(text, sender, groupId, isGroupMsg) {
    const { command, args } = this.parseCommand(text);

    logger.info(`Command received: /${command} from ${sender}`);

    this.setCooldown(sender);

    // AI Commands
    if (command === 'ai') {
      return await aiCommands.handleAIMode(text, args, groupId, sender);
    }

    if (command === 'memory') {
      return aiCommands.handleMemory(args, groupId);
    }

    if (command === 'clearcontext') {
      const isAdmin = this.checkAdmin(sender);
      return aiCommands.handleClearContext(groupId, isAdmin);
    }

    if (command === 'help') {
      return this.handleHelp(args);
    }

    // Unknown command
    return `Unknown command: /${command}. Use /help for available commands, Senpai.`;
  }

  /**
   * Handle mentions
   */
  async handleMention(text, sender, groupId) {
    // Remove mention from text
    const messageText = text.replace(this.mentionPattern, '').trim();

    if (!messageText) {
      return "You called, Senpai? What do you need? 🎌";
    }

    // Get current AI mode
    const mode = aiMemory.getAIMode(groupId);

    // Generate response
    const response = await aiEngine.generateResponse(
      groupId,
      sender,
      messageText,
      mode
    );

    return response;
  }

  /**
   * Check if user is admin
   */
  checkAdmin(userId) {
    return config.bot.adminIds.includes(userId);
  }

  /**
   * Handle /help command
   */
  handleHelp(args) {
    if (args.length === 0) {
      return `🎌 **Ichika Help Menu**

🧠 **AI**
/ai [mode] - Change AI mode (normal, serious, chaotic, teacher, debate, factcheck, eli5)
/memory [type] - View stored memories

📚 **More coming soon!**

Use /help [category] for more info, Senpai.`;
    }

    const category = args[0].toLowerCase();
    const helpTexts = {
      ai: `🧠 **AI Commands**
/ai [mode] - Switch AI mode
  • normal: Standard Ichika
  • serious: Professional mode
  • chaotic: Extra energetic
  • teacher: Step-by-step explanations
  • debate: Critical evaluation
  • factcheck: Separate facts from claims
  • eli5: Simple explanations

/memory [type] - View stored memories`,

      all: `All features coming soon, Senpai! 👀`,
    };

    return helpTexts[category] || helpTexts.all;
  }
}

module.exports = new MessageHandler();
