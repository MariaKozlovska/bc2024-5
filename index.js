const express = require('express');
const { Command } = require('commander');

// Створення програми командного рядка
const program = new Command();

program
  .requiredOption('-h, --host <host>', 'Адреса сервера')
  .requiredOption('-p, --port <port>', 'Порт сервера')
  .requiredOption('-c, --cache <path>', 'Шлях до директорії кешу');

program.parse(process.argv);

const options = program.opts();

// Перевірка параметрів
if (!options.host || !options.port || !options.cache) {
  console.error('Помилка: всі параметри (-h, -p, -c) є обовʼязковими!');
  process.exit(1);
}

// Ініціалізація Express
const app = express();

// Маршрут для перевірки роботи сервера
app.get('/', (req, res) => {
  res.send('Сервер працює!');
});

// Запуск сервера
const { host, port } = options;
app.listen(port, host, () => {
  console.log(`Сервер запущено на адресі http://${host}:${port}`);
  console.log(`Кешована директорія: ${options.cache}`);
});
