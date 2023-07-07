const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = 3001;

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

const uploadImage = async (filePath) => {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const response = await axios.post('https://telegra.ph/upload', form, {
    headers: {
      ...form.getHeaders(),
    },
  });

  const imageUrl = `https://file.sazumiviki.me${response.data[0].src}`;

  return imageUrl;
};

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

app.post('/upload', upload.single('image'), async (req, res) => {
  const filePath = req.file.path;
  const imageUrl = await uploadImage(filePath);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Gambar ${req.file.filename} berhasil dihapus`);
    }
  });

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

app.get('/docs.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs.html'));
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`Server berjalan pada http://localhost:${PORT}`);
});