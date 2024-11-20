const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Command } = require('commander');
const program = new Command();

const app = express();
const upload = multer();
app.use(express.json()); // Для роботи з JSON тілами запитів

// Конфігурація командного рядка
program
  .requiredOption('-h, --host <type>', 'server host')
  .requiredOption('-p, --port <type>', 'server port')
  .requiredOption('-c, --cache <path>', 'cache directory')
  .parse(process.argv);

const options = program.opts();

// Перевірка наявності обов'язкових параметрів
const { host, port, cache: storagePath } = options;

if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

console.log(`Host: ${host}, Port: ${port}, Cache Directory: ${storagePath}`);

// 1. GET /notes/<ім’я нотатки>
app.get('/notes/:noteName', (req, res) => {
  const noteName = req.params.noteName;
  const notePath = path.join(storagePath, noteName);

  if (!fs.existsSync(notePath)) {
    return res.status(404).send('Note not found');
  }

  const noteText = fs.readFileSync(notePath, 'utf-8');
  res.send(noteText);
});

// 2. PUT /notes/<ім’я нотатки>
app.put('/notes/:noteName', (req, res) => {
  const noteName = req.params.noteName;
  const notePath = path.join(storagePath, noteName);

  if (!fs.existsSync(notePath)) {
    return res.status(404).send('Note not found');
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).send('No text provided');
  }

  fs.writeFileSync(notePath, text);
  res.send('Note updated successfully');
});

// 3. DELETE /notes/<ім’я нотатки>
app.delete('/notes/:noteName', (req, res) => {
  const noteName = req.params.noteName;
  const notePath = path.join(storagePath, noteName);

  if (!fs.existsSync(notePath)) {
    return res.status(404).send('Note not found');
  }

  fs.unlinkSync(notePath);
  res.send('Note deleted successfully');
});

// 4. GET /notes
app.get('/notes', (req, res) => {
  const notes = fs.readdirSync(storagePath).map((fileName) => {
    const text = fs.readFileSync(path.join(storagePath, fileName), 'utf-8');
    return { name: fileName, text };
  });

  res.status(200).json(notes);
});

// 5. POST /write
app.post('/write', upload.none(), (req, res) => {
  const { note_name: noteName, note: noteText } = req.body;

  if (!noteName || !noteText) {
    return res.status(400).send('Invalid request: missing note name or text');
  }

  const notePath = path.join(storagePath, noteName);

  if (fs.existsSync(notePath)) {
    return res.status(400).send('Note already exists');
  }

  fs.writeFileSync(notePath, noteText);
  res.status(201).send('Note created successfully');
});

// 6. GET /UploadForm.html
app.get('/UploadForm.html', (req, res) => {
  res.send(`
    <html>
      <body>
        <form action="/write" method="POST" enctype="multipart/form-data">
          <label for="note_name">Note Name:</label>
          <input type="text" id="note_name" name="note_name" required>
          <br>
          <label for="note">Note Content:</label>
          <textarea id="note" name="note" required></textarea>
          <br>
          <button type="submit">Upload Note</button>
        </form>
      </body>
    </html>
  `);
});

// Запуск сервера
app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
