const db = require('../database/db');
const logger = require('../utils/logger');
const { getCharacterById, CHARACTER_CATALOG } = require('./characters');

/**
 * RPG Profile Manager
 * Handles user profiles, stats, and progression
 */
class RPGProfile {
  /**
   * Create new user profile
   */
  static createProfile(userId, characterId, username) {
    try {
      const character = getCharacterById(characterId);
      if (!character) {
        return { success: false, message: 'Character not found.' };
      }

      const profile = {
        userId,
        username,
        characterId,
        character: character.name,
        anime: character.anime,
        createdAt: Date.now(),
        level: 1,
        xp: 0,
        xpNeeded: 100,
        hp: 100,
        energy: 100,
        maxEnergy: 100,
        ichi: 0,
        stats: { ...character.stats },
        animeKnowledge: 0,
        achievements: [],
        title: 'Novice',
        status: 'Active',
        lastDaily: null,
        married: null,
        inventory: [],
      };

      db.write('users', userId, profile);
      logger.info(`Profile created for ${userId}: ${character.name}`);
      return { success: true, profile };
    } catch (error) {
      logger.error(`Error creating profile: ${error.message}`);
      return { success: false, message: 'Error creating profile.' };
    }
  }

  /**
   * Get user profile
   */
  static getProfile(userId) {
    try {
      return db.read('users', userId);
    } catch (error) {
      logger.error(`Error reading profile: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if user has profile
   */
  static hasProfile(userId) {
    return this.getProfile(userId) !== null;
  }

  /**
   * Add XP to user
   */
  static addXP(userId, amount) {
    try {
      const profile = this.getProfile(userId);
      if (!profile) return false;

      profile.xp += amount;

      // Check for level up
      while (profile.xp >= profile.xpNeeded) {
        profile.xp -= profile.xpNeeded;
        profile.level += 1;
        profile.xpNeeded = Math.floor(profile.xpNeeded * 1.1);
        profile.hp = 100 + profile.level * 10;
        profile.maxEnergy = 100 + profile.level * 5;

        // Add achievement for leveling up
        if (!profile.achievements.includes(`level_${profile.level}`)) {
          profile.achievements.push(`level_${profile.level}`);
        }
      }

      db.update('users', userId, profile);
      return profile;
    } catch (error) {
      logger.error(`Error adding XP: ${error.message}`);
      return false;
    }
  }

  /**
   * Add Ichi currency
   */
  static addIchi(userId, amount) {
    try {
      const profile = this.getProfile(userId);
      if (!profile) return false;

      profile.ichi += amount;
      db.update('users', userId, profile);
      return profile;
    } catch (error) {
      logger.error(`Error adding Ichi: ${error.message}`);
      return false;
    }
  }

  /**
   * Deduct Ichi currency
   */
  static deductIchi(userId, amount) {
    try {
      const profile = this.getProfile(userId);
      if (!profile) return false;
      if (profile.ichi < amount) return false;

      profile.ichi -= amount;
      db.update('users', userId, profile);
      return profile;
    } catch (error) {
      logger.error(`Error deducting Ichi: ${error.message}`);
      return false;
    }
  }

  /**
   * Add achievement
   */
  static addAchievement(userId, achievement) {
    try {
      const profile = this.getProfile(userId);
      if (!profile) return false;

      if (!profile.achievements.includes(achievement)) {
        profile.achievements.push(achievement);
        db.update('users', userId, profile);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error adding achievement: ${error.message}`);
      return false;
    }
  }

  /**
   * Restore energy daily
   */
  static restoreEnergy(userId) {
    try {
      const profile = this.getProfile(userId);
      if (!profile) return false;

      const now = Date.now();
      const lastDaily = profile.lastDaily || 0;
      const dayInMs = 24 * 60 * 60 * 1000;

      if (now - lastDaily >= dayInMs) {
        profile.energy = profile.maxEnergy;
        profile.lastDaily = now;
        db.update('users', userId, profile);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error restoring energy: ${error.message}`);
      return false;
    }
  }

  /**
   * Format profile for WhatsApp display
   */
  static formatProfileCard(profile) {
    if (!profile) return 'No profile found, Senpai. Use /start to create one.';

    const card = `
🎌 **${profile.username}'s Profile**

👤 Character: ${profile.character}
📺 Anime: ${profile.anime}
⭐ Level: ${profile.level}
📊 XP: ${profile.xp}/${profile.xpNeeded}

📈 Stats:
  💪 Strength: ${profile.stats.strength}
  ⚡ Speed: ${profile.stats.speed}
  🧠 Intelligence: ${profile.stats.intelligence}
  🛡️ Endurance: ${profile.stats.endurance}
  ✨ Charisma: ${profile.stats.charisma}

💰 Ichi: ${profile.ichi}
❤️ HP: ${profile.hp}
⚡ Energy: ${profile.energy}/${profile.maxEnergy}
🎓 Anime Knowledge: ${profile.animeKnowledge}

🏅 Title: ${profile.title}
🎖️ Achievements: ${profile.achievements.length}
${profile.married ? `💍 Married to: ${profile.married}` : '💔 Single'}
    `.trim();

    return card;
  }

  /**
   * Get top players
   */
  static getLeaderboard(type = 'level', limit = 10) {
    try {
      const userIds = db.list('users');
      const profiles = userIds
        .map(id => db.read('users', id))
        .filter(p => p !== null);

      let sorted;
      switch (type) {
        case 'ichi':
          sorted = profiles.sort((a, b) => b.ichi - a.ichi);
          break;
        case 'xp':
          sorted = profiles.sort((a, b) => b.xp - a.xp);
          break;
        case 'achievements':
          sorted = profiles.sort((a, b) => b.achievements.length - a.achievements.length);
          break;
        default:
          sorted = profiles.sort((a, b) => b.level - a.level);
      }

      return sorted.slice(0, limit);
    } catch (error) {
      logger.error(`Error getting leaderboard: ${error.message}`);
      return [];
    }
  }
}

module.exports = RPGProfile;
