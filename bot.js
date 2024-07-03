const TelegramBot = require('node-telegram-bot-api');
const promisePool = require('./db');

// Замените на ваш токен бота
const token = '7097086634:AAFE4MUZgb0h-jHG0qyJAQ1RLOE-J6OMNaM';
const bot = new TelegramBot(token, { polling: true });

let currentAction = {};

function sendHelp(chatId) {
  bot.sendMessage(chatId, '/help - Показать список команд\n/site - Отправить ссылку на сайт\n/creator - Отправить имя создателя\n/randomItem - Получить случайный предмет\n/deleteItem - Удалить предмет\n/getItemByID - Получить предмет по ID');
}

function sendSite(chatId) {
  bot.sendMessage(chatId, 'Ссылка на сайт: https://students.forus.ru/');
}

function sendCreator(chatId) {
  bot.sendMessage(chatId, 'Создатель бота: Пинчук Кирилл');
}

function getRandomItem(chatId) {
  promisePool.execute('SELECT * FROM Items ORDER BY RAND() LIMIT 1')
    .then(([rows]) => {
      const item = rows[0];
      bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`);
    })
    .catch((err) => {
      bot.sendMessage(chatId, 'Ошибка: не удается извлечь случайный элемент');
    });
}

function deleteItem(chatId, itemId) {
  promisePool.execute('DELETE FROM Items WHERE id = ?', [itemId])
    .then(([result]) => {
      if (result.affectedRows == 0) {
        bot.sendMessage(chatId, 'Предмет с таким ID не найден');
      } else {
        bot.sendMessage(chatId, 'Предмет удалён успешно!');
      }
    })
    .catch((err) => {
      bot.sendMessage(chatId, 'Ошибка: не удалось удалить элемент');
    });
}

function getItemByID(chatId, itemId) {
  promisePool.execute('SELECT * FROM Items WHERE id = ?', [itemId])
    .then(([rows]) => {
      if (rows.length == 0) {
        bot.sendMessage(chatId, 'Предмет с таким ID не найден');
      } else {
        const item = rows[0];
        bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`);
      }
    })
    .catch((err) => {
      bot.sendMessage(chatId, 'Ошибка: не удается извлечь элемент');
    });
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Привет, октагон!');
});

bot.onText(/\/help/, (msg) => {
  sendHelp(msg.chat.id);
});

bot.onText(/\/site/, (msg) => {
  sendSite(msg.chat.id);
});

bot.onText(/\/creator/, (msg) => {
  sendCreator(msg.chat.id);
});

bot.onText(/\/randomItem/, (msg) => {
  getRandomItem(msg.chat.id);
});

bot.onText(/\/deleteItem/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Пожалуйста, введите ID необходимого предмета');
  currentAction[msg.chat.id] = 'deleteItem';
});

bot.onText(/\/getItemByID/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Пожалуйста, введите ID необходимого предмета');
  currentAction[msg.chat.id] = 'getItemByID';
});

// Блок для приёма сообщения о необходимом ID, чтобы не писать его чезез пробел после команды, так как это не удобно
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (!msg.text.startsWith('/')) {
    const action = currentAction[chatId];
    if (action === 'deleteItem') {
      deleteItem(chatId, msg.text);
      delete currentAction[chatId];
    } else if (action === 'getItemByID') {
      getItemByID(chatId, msg.text);
      delete currentAction[chatId];
    }
  }
});

console.log('Bot started...');