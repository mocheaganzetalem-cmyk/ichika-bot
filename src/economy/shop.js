const logger = require('../utils/logger');
const RPGProfile = require('../rpg/rpgProfile');
const db = require('../database/db');

/**
 * Shop System
 * Buy and sell items with Ichi currency
 */
class Shop {
  constructor() {
    this.items = [
      {
        id: 1,
        name: 'Health Potion',
        price: 50,
        emoji: '🧪',
        description: 'Restore 50 HP',
        effect: 'heal',
        value: 50,
      },
      {
        id: 2,
        name: 'Energy Drink',
        price: 75,
        emoji: '⚡',
        description: 'Restore full energy',
        effect: 'energy',
        value: 100,
      },
      {
        id: 3,
        name: 'XP Boost',
        price: 100,
        emoji: '📈',
        description: 'Double XP for 1 hour',
        effect: 'xpboost',
        value: 3600000,
      },
      {
        id: 4,
        name: 'Lucky Charm',
        price: 150,
        emoji: '🍀',
        description: 'Increase luck for games',
        effect: 'luck',
        value: 1,
      },
      {
        id: 5,
        name: 'Anime Figurine',
        price: 200,
        emoji: '🎀',
        description: 'Rare collectible',
        effect: 'collectible',
        value: 1,
      },
      {
        id: 6,
        name: 'Character Skin',
        price: 250,
        emoji: '👘',
        description: 'Change your character appearance',
        effect: 'skin',
        value: 1,
      },
    ];
  }

  /**
   * View shop catalog
   */
  getShopCatalog() {
    let response = `💰 **Ichika Shop**\n\n`;

    this.items.forEach((item, index) => {
      response += `${index + 1}. ${item.emoji} ${item.name} - ${item.price} Ichi\n`;
      response += `   ${item.description}\n\n`;
    });

    response += `Use /buy [number] to purchase`;
    return response;
  }

  /**
   * Buy item
   */
  buyItem(userId, itemId) {
    try {
      const profile = RPGProfile.getProfile(userId);
      if (!profile) {
        return 'No profile found. Use /start to create one.';
      }

      const item = this.items.find(i => i.id === itemId);
      if (!item) {
        return 'Item not found.';
      }

      if (profile.ichi < item.price) {
        return `Not enough Ichi! You need ${item.price} but only have ${profile.ichi}.`;
      }

      // Deduct Ichi
      RPGProfile.deductIchi(userId, item.price);

      // Add item to inventory
      if (!profile.inventory) {
        profile.inventory = [];
      }

      profile.inventory.push({
        id: item.id,
        name: item.name,
        emoji: item.emoji,
        purchasedAt: Date.now(),
      });

      db.update('users', userId, profile);

      return `
✅ **Purchase Successful!**

${item.emoji} ${item.name}
-${item.price} Ichi

Remaining Ichi: ${profile.ichi - item.price}
      `.trim();
    } catch (error) {
      logger.error(`Error buying item: ${error.message}`);
      return 'Error processing purchase.';
    }
  }

  /**
   * View inventory
   */
  getInventory(userId) {
    try {
      const profile = RPGProfile.getProfile(userId);
      if (!profile) {
        return 'No profile found.';
      }

      if (!profile.inventory || profile.inventory.length === 0) {
        return `${profile.username}'s inventory is empty!`;
      }

      let response = `🎒 **${profile.username}'s Inventory**\n\n`;

      profile.inventory.forEach((item, index) => {
        response += `${index + 1}. ${item.emoji} ${item.name}\n`;
      });

      return response;
    } catch (error) {
      logger.error(`Error getting inventory: ${error.message}`);
      return 'Error retrieving inventory.';
    }
  }
}

/**
 * Economy Commands Handler
 */
class EconomyCommands {
  /**
   * /shop - View shop
   */
  static handleShop() {
    try {
      const shop = new Shop();
      return shop.getShopCatalog();
    } catch (error) {
      logger.error(`Error in /shop: ${error.message}`);
      return 'Error opening shop.';
    }
  }

  /**
   * /buy [itemId] - Buy item
   */
  static handleBuy(args, sender) {
    try {
      if (args.length === 0) {
        return 'Usage: /buy [number]\nUse /shop to see available items.';
      }

      const itemId = parseInt(args[0]);
      if (!itemId || itemId < 1 || itemId > 6) {
        return 'Invalid item number. Use /shop to see available items.';
      }

      const shop = new Shop();
      return shop.buyItem(sender, itemId);
    } catch (error) {
      logger.error(`Error in /buy: ${error.message}`);
      return 'Error processing purchase.';
    }
  }

  /**
   * /inventory - View inventory
   */
  static handleInventory(sender) {
    try {
      const shop = new Shop();
      return shop.getInventory(sender);
    } catch (error) {
      logger.error(`Error in /inventory: ${error.message}`);
      return 'Error retrieving inventory.';
    }
  }

  /**
   * /transfer [userId] [amount] - Transfer Ichi to another player
   */
  static handleTransfer(args, sender) {
    try {
      if (args.length < 2) {
        return 'Usage: /transfer [@user] [amount]';
      }

      const recipient = args[0].replace('@', '');
      const amount = parseInt(args[1]);

      if (!amount || amount <= 0) {
        return 'Invalid amount.';
      }

      const senderProfile = RPGProfile.getProfile(sender);
      if (!senderProfile) {
        return 'You need a profile first. Use /start';
      }

      if (senderProfile.ichi < amount) {
        return `Insufficient Ichi! You only have ${senderProfile.ichi}.`;
      }

      const recipientProfile = RPGProfile.getProfile(recipient);
      if (!recipientProfile) {
        return `${recipient} doesn't have a profile yet.`;
      }

      // Transfer
      RPGProfile.deductIchi(sender, amount);
      RPGProfile.addIchi(recipient, amount);

      return `
💸 **Transfer Complete!**

Sent ${amount} Ichi to ${recipientProfile.username}
Your new balance: ${senderProfile.ichi - amount}
      `.trim();
    } catch (error) {
      logger.error(`Error in /transfer: ${error.message}`);
      return 'Error processing transfer.';
    }
  }
}

module.exports = {
  Shop,
  EconomyCommands,
};
