const TelegramBot = require('node-telegram-bot-api');

const token = '7097086634:AAFE4MUZgb0h-jHG0qyJAQ1RLOE-J6OMNaM';
const bot = new TelegramBot(token, { polling: true });

function sendHelp(chatId) {
  bot.sendMessage(chatId, '/help - Показать список команд\n/site - Отправить ссылку на сайт\n/creator - Отправить имя создателя');
}

function sendSite(chatId) {
  bot.sendMessage(chatId, 'Ссылка на сайт: https://students.forus.ru/');
}

function sendCreator(chatId) {
  bot.sendMessage(chatId, 'Создатель бота: Пинчук Кирилл');
}

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Проверяем команды
  if (text == '/start') {
    bot.sendMessage(chatId, 'Привет, октагон!');
  } else if (text == '/help') {
    sendHelp(chatId);
  } else if (text == '/site') {
    sendSite(chatId);
  } else if (text == '/creator') {
    sendCreator(chatId);
  } else {
    bot.sendMessage(chatId, 'Не понимаю команду. Напишите /help для получения списка команд.');
  }
});

console.log('Bot started...');