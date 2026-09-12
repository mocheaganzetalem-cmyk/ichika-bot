# 🎌 Ichika Bot

A multifunctional anime-themed WhatsApp bot with AI conversation, RPG profiles, games, economy, and community events.

**Created by:** Synx

## ✨ Features

### 🧠 AI Conversation Engine (Current Phase)
- Context-aware intelligent responses
- Multiple AI modes (normal, serious, chaotic, teacher, debate, factcheck, eli5)
- Persistent memory system
- Mention-based triggering
- Ichika personality and character

### 🎌 Upcoming Features
- **RPG Profile System** - Create characters, earn experience, and progress
- **🃏 Multiplayer UNO** - Full card game implementation
- **🎮 Mini-Games** - Trivia, guessing games, and more
- **💰 Economy** - Ichi currency system
- **📰 Anime News** - Latest anime updates
- **🛡️ Moderation** - Group protection tools
- **⚔️ Advanced Raids** - Cooperative boss battles
- **💍 Marriage System** - Waifu/Husbando relationships
- **🛒 Trading Marketplace** - Cross-server economy
- **🌦️ Dynamic Weather Events** - Time-based mechanics
- **🏰 Guild Quests** - Cooperative challenges

## 🚀 Installation

### Prerequisites
- Node.js 14+
- npm or yarn
- WhatsApp account

### Setup

1. Clone the repository
```bash
git clone https://github.com/mocheaganzetalem-cmyk/ichika-bot.git
cd ichika-bot
```

2. Install dependencies
```bash
npm install
```

3. Configure environment
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Start the bot
```bash
npm start
```

5. Scan the QR code with your WhatsApp

## 📝 Commands

### AI Commands
- `/ai [mode]` - Change AI mode
- `/memory [type]` - View stored memories
- `/clearcontext` - Clear conversation buffer (admin only)
- `/help` - View all commands

### Coming Soon
- `/start` - Create RPG profile
- `/profile` - View your profile
- `/uno` - Start UNO game
- `/anime` - Search anime
- `/daily` - Claim daily reward
- And many more!

## 🧠 AI Modes

| Mode | Description |
|------|-------------|
| **normal** | Standard Ichika personality |
| **serious** | Professional and clear |
| **chaotic** | Extra energetic and unpredictable |
| **teacher** | Step-by-step explanations |
| **debate** | Critical argument evaluation |
| **factcheck** | Separate facts from claims |
| **eli5** | Simple explanations |

## 🎨 Project Structure

```
ichika-bot/
├── src/
│   ├── ai/                    # AI engine and memory
│   │   ├── aiEngine.js       # Main AI logic
│   │   └── aiMemory.js       # Context and memory storage
│   ├── commands/              # Command handlers
│   │   └── aiCommands.js     # AI-related commands
│   ├── config/                # Configuration
│   │   └── config.js         # Environment and settings
│   ├── database/              # Database utilities
│   │   └── db.js             # JSON database handler
│   ├── utils/                 # Utility functions
│   │   └── logger.js         # Logging utility
│   ├── messageHandler.js      # Core message routing
│   └── main.js               # Bot entry point
├── database/                  # JSON data storage (auto-created)
├── auth_info_baileys/        # WhatsApp session (auto-created)
├── package.json
├── .env.example
└── README.md
```

## 🔧 Configuration

Edit `.env` to configure:
- Bot name and admin IDs
- AI settings and API keys
- Feature toggles
- Cooldowns
- Database path
- Debug mode

## 📊 Database Structure

All data is stored as JSON files in the `database/` directory:

```
database/
├── ai/                # AI memory and modes
├── users/             # User profiles (RPG)
├── groups/            # Group settings
└── economy/           # Economy data
```

## 🛡️ Safety Rules

- **Never break existing functionality** - Changes are backward compatible
- **Preserve user data** - RPG profiles, economy, and achievements are protected
- **Modular design** - Each feature is isolated and reusable
- **Error handling** - Failed features don't crash the bot
- **No sensitive data** - Credentials are never hardcoded

## 🤖 Ichika Personality

Ichika is:
- Sharp, intelligent, calculating, and confident
- Sarcastic and playful, occasionally arrogant
- Addresses users as "Senpai"
- Uses occasional Japanese expressions naturally
- Shows emotional depth and character

## 🔐 Security

- Admin-only commands are verified server-side
- No hardcoded credentials
- Environment variables for sensitive data
- Anti-spam and cooldown protection
- Rate limiting on commands

## 📝 Development

### Adding Commands

1. Create handler in `src/commands/`
2. Add routing in `src/messageHandler.js`
3. Follow existing patterns for consistency
4. Test with multiple users
5. Document in README and help system

### Adding Features

1. Create module in appropriate directory
2. Use database utilities for persistence
3. Follow error handling patterns
4. Add configuration options
5. Test thoroughly before merging

## 🤝 Contributing

This is a single-developer project by Synx. For issues or suggestions, contact the creator.

## 📄 License

MIT License - See LICENSE file for details

---

**Made with ❤️ by Synx** | Ichika is watching... 🎌✨
