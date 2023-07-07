const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

app.delete('/delete/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Gagal menghapus gambar');
    } else {
      res.sendStatus(200);
    }
  });
});

cron.schedule('0 0 * * *', () => {
  const directoryPath = path.join(__dirname, 'uploads');
  const files = fs.readdirSync(directoryPath);
  const currentDate = new Date();

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);
    const fileModifiedDate = new Date(stats.mtime);

    const expirationDays = 7;

    if (currentDate.getTime() - fileModifiedDate.getTime() >= expirationDays * 24 * 60 * 60 * 1000) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`Gambar ${file} berhasil dihapus`);
        }
      });
    }
  });
});

app.post('/upload', upload.single('image'), (req, res) => {
  const imageUrl = `http://file.sazumiviki.me/uploads/${req.file.filename}`;

  res.send(imageUrl);
});

app.get('/v1/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan saat memeriksa status gambar');
    }

    const currentDate = new Date();
    const fileModifiedDate = new Date(stats.mtime);
    const expirationDays = 7;

    const isExpired = currentDate.getTime() - fileModifiedDate.getTime() >= expirationDays * 24 * 60 * 60 * 1000;

    res.json({
      filename,
      expired: isExpired ? 'yes' : 'no'
    });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api-documentation.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-documentation.html'));
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`Server berjalan pada http://localhost:${PORT}`);
});
