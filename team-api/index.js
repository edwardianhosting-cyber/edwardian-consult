const express = require('express');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const DATA = path.join(__dirname, 'data.json');
function readData() { try { return JSON.parse(fs.readFileSync(DATA, 'utf8')); } catch { return []; } }
function writeData(d) { fs.writeFileSync(DATA, JSON.stringify(d, null, 2)); }

const upload = multer({ storage: multer.memoryStorage() });

app.get('/team', (req, res) => res.json(readData()));

app.post('/team', upload.single('image'), async (req, res) => {
  const { name, role, bio, facebook, twitter, instagram, linkedin, whatsapp } = req.body;
  let imageUrl = null;
  if (req.file) {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'team' }, (err, r) => err ? reject(err) : resolve(r));
        stream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    } catch (e) { console.error(e); }
  }
  const item = { id: Date.now(), name, role, bio, image: imageUrl, socials: { facebook, twitter, instagram, linkedin, whatsapp }, createdAt: new Date().toISOString() };
  const data = readData();
  data.push(item);
  writeData(data);
  res.json(item);
});

app.get('/team/:id', (req, res) => {
  const data = readData();
  const item = data.find(d => String(d.id) === String(req.params.id));
  if (!item) return res.status(404).json({ error: 'not found' });
  res.json(item);
});
app.listen(PORT, () => console.log('Team API on ' + PORT));