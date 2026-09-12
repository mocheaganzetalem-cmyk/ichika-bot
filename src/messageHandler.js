const aiEngine = require('./ai/aiEngine');
const aiMemory = require('./ai/aiMemory');
const aiCommands = require('./commands/aiCommands');
const rpgCommands = require('./rpg/rpgCommands');
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

    // RPG Commands
    if (command === 'start') {
      return rpgCommands.handleStart(sender);
    }

    if (command === 'select') {
      return rpgCommands.handleSelect(args, sender);
    }

    if (command === 'profile') {
      return rpgCommands.handleProfile(sender);
    }

    if (command === 'daily') {
      return rpgCommands.handleDaily(sender);
    }

    if (command === 'rankings') {
      return rpgCommands.handleRankings(args);
    }

    if (command === 'balance') {
      return rpgCommands.handleBalance(sender);
    }

    if (command === 'addxp') {
      const isAdmin = this.checkAdmin(sender);
      return rpgCommands.handleAddXP(args, sender, isAdmin);
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

👤 **RPG**
/start - Create RPG profile
/profile - View your profile
/daily - Claim daily Ichi
/rankings [type] - View leaderboards
/balance - Check Ichi balance

📚 Use /help [category] for more info, Senpai.`;
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

/memory [type] - View stored memories
/clearcontext - Clear conversation context (admin only)`,

      rpg: `👤 **RPG Commands**
/start - Create a new RPG profile
/select [number] [username] - Select character and create profile
/profile - View your profile card
/daily - Claim daily Ichi reward
/rankings [type] - View leaderboards (level/ichi/xp/achievements)
/balance - Check your Ichi balance`,

      all: `Use /help ai or /help rpg for detailed info, Senpai! 👀`,
    };

    return helpTexts[category] || helpTexts.all;
  }
}

module.exports = new MessageHandler();
