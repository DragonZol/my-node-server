const TelegramBot = require('node-telegram-bot-api');
const token = '7097086634:AAFE4MUZgb0h-jHG0qyJAQ1RLOE-J6OMNaM';

const bot = new TelegramBot(token, { polling: true });

bot.onText("/start", (msg) => {
  bot.sendMessage(msg.chat.id, 'Привет, октагон!');
});
