const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const storagePath = './notes'; // Директорія для збереження нотаток

// Middleware для роботи з JSON
app.use(express.json());

// Налаштування multer для роботи з формами
const upload = multer();

// Переконайтесь, що директорія для збереження нотаток існує
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath);
}

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

  fs.writeFileSync(notePath, req.body.text);
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
