const TelegramBot = require('node-telegram-bot-api');

const token = '7097086634:AAFE4MUZgb0h-jHG0qyJAQ1RLOE-J6OMNaM';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет, октагон!');
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '/help - Показать список команд\n/site - Отправить ссылку на сайт\n/creator - Отправить имя создателя');
});

bot.onText(/\/site/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Ссылка на сайт: https://students.forus.ru/');
});

bot.onText(/\/creator/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Создатель бота: Пинчук Кирилл');
});

console.log('Bot started...');