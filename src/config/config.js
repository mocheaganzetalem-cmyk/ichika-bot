require('dotenv').config();

const config = {
  bot: {
    name: process.env.BOT_NAME || 'Ichika',
    adminIds: process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [],
  },
  
  ai: {
    enabled: process.env.ENABLE_AI === 'true' || true,
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-3.5-turbo',
    defaultMode: process.env.AI_DEFAULT_MODE || 'normal',
    contextBufferSize: parseInt(process.env.CONTEXT_BUFFER_SIZE) || 100,
  },

  database: {
    path: process.env.DATABASE_PATH || './database/',
  },

  features: {
    moderation: process.env.ENABLE_MODERATION === 'true' || true,
    autoReply: process.env.ENABLE_AUTO_REPLY === 'true' || true,
    games: process.env.ENABLE_GAMES === 'true' || true,
    rpg: process.env.ENABLE_RPG === 'true' || true,
    anime: process.env.ENABLE_ANIME === 'true' || true,
    news: process.env.ENABLE_NEWS === 'true' || true,
  },

  cooldowns: {
    daily: parseInt(process.env.DAILY_COOLDOWN) || 86400000, // 24 hours
    command: parseInt(process.env.COMMAND_COOLDOWN) || 1000, // 1 second
  },

  debug: process.env.DEBUG === 'true' || false,
};

module.exports = config;
