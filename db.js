const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chatbottests',
});

// Преобразование pool в promise-based
const promisePool = pool.promise();

// Функция для проверки подключения
const checkConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('Подключение к серверу MySQL успешно установлено');
    connection.release();
  } catch (error) {
    console.error('Ошибка подключения к БД:', error.message);
  }
};

// Выполняем проверку подключения
checkConnection();

module.exports = promisePool;