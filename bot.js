const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer'); // Используем библиотеку для создания скриншотов
const promisePool = require('./db');
const { setIntervalAsync } = require('set-interval-async/dynamic'); // Используем set-interval-async
const cron = require('node-cron');//Используем для планирования задач

const token = '7097086634:AAFE4MUZgb0h-jHG0qyJAQ1RLOE-J6OMNaM';
const bot = new TelegramBot(token, { polling: true });

const TIMEZONE = "Europe/Moscow";
const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

let currentAction = {};

function sendHelp(chatId) {
  bot.sendMessage(chatId, '/help - Показать список команд\n/site - Отправить ссылку на сайт\n/creator - Отправить имя создателя\n/randomItem - Получить случайный предмет\n/deleteItem - Удалить предмет\n/getItemByID - Получить предмет по ID\n!qr - Сгенерировать QR-код\n!webscr - Сделать скриншот сайта');
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

async function updateUserLastMessage(userId) {
  const today = new Date().toISOString().split('T')[0];
  await promisePool.execute('INSERT INTO Users (id, lastMessage) VALUES (?, ?) ON DUPLICATE KEY UPDATE lastMessage = ?', [userId, today, today]);
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

//Это для скриншотов
async function captureScreenshot(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  const screenshotBuffer = await page.screenshot({ fullPage: true });
  await browser.close();
  return screenshotBuffer;
}

// Функция для отправки скриншота сайта
bot.onText(/^\!webscr/, async function(msg) {
  var userId = msg.from.id;
  var url = msg.text.substring(8).trim();

  // Проверка на пустое сообщение
  if (url === "") {
    bot.sendMessage(msg.chat.id, "Ошибка: введите URL для создания скриншота.");
    return;
  }

  try {
    const screenshot = await captureScreenshot(url);
    bot.sendPhoto(msg.chat.id, screenshot, { caption: `📷 Скриншот сайта: ${url}` });
  } catch (error) {
    bot.sendMessage(msg.chat.id, `Ошибка: не удалось сделать скриншот сайта ${url}. Убедитесь, что URL корректен и доступен.`);
    console.error(error);
  }
});

bot.onText(/^\!qr/, function(msg) {
  var userId = msg.from.id;
  var data = msg.text.substring(3).trim();
  var uniqueParam = `&timestamp=${Date.now()}`;

  // Проверка на пустое сообщение
  if (data === "") {
    bot.sendMessage(msg.chat.id, "Ошибка: введите текст для создания QR-кода.");
    return;
  }

  var encodedData = encodeURIComponent(data);
  var imageqr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedData}${uniqueParam}`;

  // Отправляем изображение напрямую
  bot.sendPhoto(msg.chat.id, imageqr, { caption: `✏️ QR-код для: ${data}` });
});

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

// Блок для приёма сообщения о необходимом ID, чтобы не писать его через пробел после команды, так как это неудобно
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Обновляем дату последнего сообщения пользователя
  await updateUserLastMessage(userId);

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

// Таймер для отправки сообщения пользователям, которые не писали более 2х суток
cron.schedule('0 13 * * *', async () => {
  try {
	//Вариант для тестирования (отправка сообщения через 1 минуту)
	//const [users] = await promisePool.execute('SELECT * FROM Users WHERE lastMessage < DATE_SUB(NOW(), INTERVAL 1 MINUTE)');
    
	const [users] = await promisePool.execute('SELECT * FROM Users WHERE lastMessage < DATE_SUB(NOW(), INTERVAL 2 DAY)');
    users.forEach((user) => {
      getRandomItem(user.id);
    });
  } catch (error) {
    console.error('Ошибка при отправке сообщений пользователям:', error);
  }
}, {
  timezone: TIMEZONE
});

console.log('Bot started...');