const RPGProfile = require('./rpgProfile');
const { CHARACTER_CATALOG } = require('./characters');
const logger = require('../utils/logger');

/**
 * RPG Command Handlers
 */
class RPGCommands {
  /**
   * /start - Create RPG profile with character selection
   */
  static handleStart(sender) {
    try {
      // Check if user already has profile
      if (RPGProfile.hasProfile(sender)) {
        return `You already have a profile, Senpai! Use /profile to view it.`;
      }

      // Show character selection
      let response = `🎌 **Character Selection**\n\nChoose your character (reply with number):\n\n`;

      CHARACTER_CATALOG.slice(0, 10).forEach((char, index) => {
        response += `${index + 1}. ${char.name} (${char.anime}) - ${char.rarity}\n`;
      });

      response += `\nReply with: /select [number] [your_username]\nExample: /select 1 Senpai`;

      return response;
    } catch (error) {
      logger.error(`Error in /start: ${error.message}`);
      return 'Error starting profile creation.';
    }
  }

  /**
   * /select [characterId] [username] - Select character and create profile
   */
  static handleSelect(args, sender) {
    try {
      if (args.length < 2) {
        return `Usage: /select [number] [username]\nExample: /select 1 MyUsername`;
      }

      const characterId = parseInt(args[0]);
      const username = args.slice(1).join(' ');

      if (!characterId || characterId < 1 || characterId > CHARACTER_CATALOG.length) {
        return `Invalid character number. Choose between 1-${CHARACTER_CATALOG.length}`;
      }

      if (username.length < 2 || username.length > 20) {
        return 'Username must be between 2-20 characters.';
      }

      const result = RPGProfile.createProfile(sender, characterId, username);

      if (!result.success) {
        return result.message;
      }

      const character = CHARACTER_CATALOG.find(c => c.id === characterId);
      return `
🎉 **Profile Created!**

Username: ${username}
Character: ${character.name}
Anime: ${character.anime}
Level: 1
XP: 0/100

Welcome to the adventure, Senpai! 🎌
Use /profile to view your profile card.
      `.trim();
    } catch (error) {
      logger.error(`Error in /select: ${error.message}`);
      return 'Error creating profile.';
    }
  }

  /**
   * /profile - View user profile
   */
  static handleProfile(sender) {
    try {
      const profile = RPGProfile.getProfile(sender);
      return RPGProfile.formatProfileCard(profile);
    } catch (error) {
      logger.error(`Error in /profile: ${error.message}`);
      return 'Error retrieving profile.';
    }
  }

  /**
   * /daily - Claim daily Ichi reward
   */
  static handleDaily(sender) {
    try {
      const profile = RPGProfile.getProfile(sender);
      if (!profile) {
        return 'No profile found. Use /start to create one.';
      }

      const now = Date.now();
      const lastDaily = profile.lastDaily || 0;
      const dayInMs = 24 * 60 * 60 * 1000;

      if (now - lastDaily < dayInMs) {
        const hoursLeft = Math.ceil((dayInMs - (now - lastDaily)) / (60 * 60 * 1000));
        return `You already claimed your daily reward! Come back in ${hoursLeft} hours, Senpai.`;
      }

      const reward = 100 + profile.level * 10;
      RPGProfile.addIchi(sender, reward);
      RPGProfile.restoreEnergy(sender);
      RPGProfile.addAchievement(sender, 'daily_claim');

      return `
✨ **Daily Reward Claimed!**

+${reward} Ichi
Energy Restored!

Keep it up, Senpai! 💪
      `.trim();
    } catch (error) {
      logger.error(`Error in /daily: ${error.message}`);
      return 'Error claiming daily reward.';
    }
  }

  /**
   * /rankings [type] - View leaderboards
   */
  static handleRankings(args) {
    try {
      const type = args[0]?.toLowerCase() || 'level';
      const validTypes = ['level', 'ichi', 'xp', 'achievements'];

      if (!validTypes.includes(type)) {
        return `Invalid ranking type. Choose: ${validTypes.join(', ')}`;
      }

      const leaderboard = RPGProfile.getLeaderboard(type, 10);

      if (leaderboard.length === 0) {
        return 'No players found yet, Senpai.';
      }

      const typeEmojis = {
        level: '⭐',
        ichi: '💰',
        xp: '📊',
        achievements: '🏅',
      };

      let response = `🏆 **Top Players - ${type.toUpperCase()}** ${typeEmojis[type]}\n\n`;

      leaderboard.forEach((profile, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
        let value;

        switch (type) {
          case 'level':
            value = `Lv ${profile.level}`;
            break;
          case 'ichi':
            value = `${profile.ichi} Ichi`;
            break;
          case 'xp':
            value = `${profile.xp} XP`;
            break;
          case 'achievements':
            value = `${profile.achievements.length} Achievements`;
            break;
        }

        response += `${medal} ${profile.username} (${profile.character}) - ${value}\n`;
      });

      return response;
    } catch (error) {
      logger.error(`Error in /rankings: ${error.message}`);
      return 'Error retrieving rankings.';
    }
  }

  /**
   * /addxp [amount] - Add XP to user (admin/testing only)
   */
  static handleAddXP(args, sender, isAdmin) {
    try {
      if (!isAdmin) {
        return 'This command is admin-only, Senpai.';
      }

      if (args.length === 0) {
        return 'Usage: /addxp [amount]';
      }

      const amount = parseInt(args[0]);
      if (!amount || amount <= 0) {
        return 'Invalid amount.';
      }

      const profile = RPGProfile.addXP(sender, amount);
      if (!profile) {
        return 'No profile found.';
      }

      return `
✨ **XP Added!**

+${amount} XP
Current Level: ${profile.level}
Current XP: ${profile.xp}/${profile.xpNeeded}
      `.trim();
    } catch (error) {
      logger.error(`Error in /addxp: ${error.message}`);
      return 'Error adding XP.';
    }
  }

  /**
   * /balance - Check Ichi balance
   */
  static handleBalance(sender) {
    try {
      const profile = RPGProfile.getProfile(sender);
      if (!profile) {
        return 'No profile found. Use /start to create one.';
      }

      return `
💰 **Ichi Balance**

${profile.username}: ${profile.ichi} Ichi
      `.trim();
    } catch (error) {
      logger.error(`Error in /balance: ${error.message}`);
      return 'Error checking balance.';
    }
  }
}

module.exports = RPGCommands;
