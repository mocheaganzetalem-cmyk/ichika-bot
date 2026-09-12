const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const config = require('./config/config');
const logger = require('./utils/logger');
const messageHandler = require('./messageHandler');

let sock;

async function connectWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // We'll handle QR manually
  });

  // Handle QR code
  sock.ev.on('connection.update', async update => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info('Scan the QR code to login:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'connecting') {
      logger.info('Connecting to WhatsApp...');
    }

    if (connection === 'open') {
      logger.success('✨ Ichika is online! Ready to rock, Senpai!');
    }

    if (connection === 'close') {
      if (
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut
      ) {
        logger.warn('Connection lost. Reconnecting...');
        setTimeout(connectWhatsApp, 3000);
      } else {
        logger.info('Logged out.');
      }
    }
  });

  // Save credentials
  sock.ev.on('creds.update', saveCreds);

  // Handle messages
  sock.ev.on('messages.upsert', async m => {
    for (const msg of m.messages) {
      if (!msg.message) continue;

      try {
        const sender = msg.key.participant || msg.key.remoteJid;
        const groupId = msg.key.remoteJid;
        const isGroupMsg = msg.isGroup || msg.key.remoteJid.includes('@g.us');
        const isFromMe =
          msg.key.fromMe ||
          sender === sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // Extract text
        let text;
        if (msg.message.conversation) {
          text = msg.message.conversation;
        } else if (msg.message.extendedTextMessage) {
          text = msg.message.extendedTextMessage.text;
        } else {
          continue; // Skip non-text messages for now
        }

        logger.debug(
          `[${isGroupMsg ? 'GROUP' : 'DM'}] ${sender}: ${text.substring(0, 50)}`
        );

        // Handle message
        const response = await messageHandler.handleMessage({
          text,
          sender,
          groupId,
          isGroupMsg,
          isFromMe,
        });

        // Send response if any
        if (response) {
          await sock.sendMessage(groupId, { text: response });
        }
      } catch (error) {
        logger.error(`Error processing message: ${error.message}`);
      }
    }
  });
}

// Start bot
async function start() {
  logger.info('🎌 Ichika Bot Starting...');
  logger.info(`Environment: ${config.debug ? 'DEBUG' : 'PRODUCTION'}`);
  logger.info(`AI Enabled: ${config.features.ai}`);

  await connectWhatsApp();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  if (sock) {
    sock.end();
  }
  process.exit(0);
});

// Start the bot
start().catch(error => {
  logger.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
