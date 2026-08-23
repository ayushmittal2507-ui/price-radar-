import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;

const isTokenConfigured = Boolean(token && token.trim() && token.trim() !== 'your_telegram_bot_token');

// Initialize bot if token is present and not running in test mode
if (isTokenConfigured && process.env.NODE_ENV !== 'test') {
  try {
    bot = new TelegramBot(token, { polling: true });
    
    // Suppress unhandled polling error crash / spam
    bot.on('polling_error', (error) => {
      console.error('❌ Telegram polling error:', error.message || error);
    });

    // Set up start command to share Chat ID with user
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const response = `Welcome to <b>PriceRadar Bot</b>! 🎯\n\nYour Telegram Chat ID is:\n<code>${chatId}</code>\n\nCopy this ID and paste it in your profile settings on the PriceRadar web dashboard to active Telegram alerts.`;
      
      bot.sendMessage(chatId, response, { parse_mode: 'HTML' });
    });

    console.log('🤖 Telegram bot listener running successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error.message);
  }
} else {
  if (process.env.NODE_ENV !== 'test') {
    console.log('Telegram bot disabled: no token configured');
  }
}

/**
 * Sends a Telegram message to a specific Chat ID.
 * 
 * @param {string|number} chatId 
 * @param {string} message 
 */
export const sendTelegramMessage = async (chatId, message) => {
  if (!bot) {
    console.warn('⚠️ Telegram bot not initialized. Skipping dispatch.');
    return;
  }
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    console.log(`📱 Telegram alert dispatched to Chat ID: ${chatId}`);
  } catch (error) {
    console.error(`❌ Failed to dispatch Telegram alert to ${chatId}:`, error.message);
  }
};
