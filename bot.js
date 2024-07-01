const TelegramBot = require('node-telegram-bot-api');
const promisePool = require('./db');

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

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.startsWith('/')) {
    switch (text) {
      case '/start':
        bot.sendMessage(chatId, 'Привет, октагон!');
        break;
      case '/help':
        sendHelp(chatId);
        break;
      case '/site':
        sendSite(chatId);
        break;
      case '/creator':
        sendCreator(chatId);
        break;
      case '/randomItem':
        getRandomItem(chatId);
        break;
      case '/deleteItem':
        bot.sendMessage(chatId, 'Пожалуйста, введите ID необходимого предмета');
        currentAction[chatId] = 'deleteItem';
        break;
      case '/getItemByID':
        bot.sendMessage(chatId, 'Пожалуйста, введите ID необходимого предмета');
        currentAction[chatId] = 'getItemByID';
        break;
      default:
        bot.sendMessage(chatId, 'Не понимаю команду. Напишите /help для получения списка команд.');
        break;
    }
  } else {
    const action = currentAction[chatId];

  if (action) {
      const itemId = text;

      if (isNaN(itemId) || !Number.isInteger(parseFloat(itemId))) {
        bot.sendMessage(chatId, 'Пожалуйста, введите корректный ID предмета');
        return;
      }

      switch (action) {
        case 'deleteItem':
          deleteItem(chatId, itemId);
          break;
        case 'getItemByID':
          getItemByID(chatId, itemId);
          break;
      }
      delete currentAction[chatId];
    } else {
      bot.sendMessage(chatId, 'Не понимаю команду. Напишите /help для получения списка команд.');
    }
  }
});

console.log('Bot started...');