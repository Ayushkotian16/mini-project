const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');

// ── Cloudinary setup ──
// If CLOUDINARY_URL or all 3 keys are set, use Cloudinary.
// Otherwise fall back to local disk (dev only).
let uploadToCloud = null;
let uploadAudioToCloud = null;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  uploadToCloud = (buffer, mimetype) => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'nandini_chende', resource_type: 'image' },
      (error, result) => error ? reject(error) : resolve(result.secure_url)
    );
    const { Readable } = require('stream');
    Readable.from(buffer).pipe(stream);
  });

  uploadAudioToCloud = (buffer, originalname) => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'nandini_chende/audio', resource_type: 'video' },
      (error, result) => error ? reject(error) : resolve(result.secure_url)
    );
    const { Readable } = require('stream');
    Readable.from(buffer).pipe(stream);
  });
}

// ── Image upload (memory storage) ──
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ── Audio upload (memory storage) ──
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4'];

const uploadAudio = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed.'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for audio
});

const handleUpload = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

  try {
    if (uploadToCloud) {
      // Upload to Cloudinary
      const url = await uploadToCloud(req.file.buffer, req.file.mimetype);
      return res.status(200).json({ success: true, url });
    } else {
      // Dev fallback — save to local disk
      const path = require('path');
      const fs = require('fs');
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(req.file.originalname)}`;
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
      return res.status(200).json({ success: true, url: `/uploads/${filename}` });
    }
  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ success: false, message: 'Upload failed: ' + err.message });
  }
};

const handleAudioUpload = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No audio file uploaded.' });

  try {
    if (uploadAudioToCloud) {
      // Upload to Cloudinary with resource_type: 'video' (Cloudinary uses 'video' for audio)
      const url = await uploadAudioToCloud(req.file.buffer, req.file.originalname);
      return res.status(200).json({ success: true, url });
    } else {
      // Dev fallback — save to local disk
      const path = require('path');
      const fs = require('fs');
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const ext = path.extname(req.file.originalname) || '.mp3';
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
      return res.status(200).json({ success: true, url: `/uploads/${filename}` });
    }
  } catch (err) {
    console.error('Audio upload error:', err.message);
    return res.status(500).json({ success: false, message: 'Audio upload failed: ' + err.message });
  }
};

// POST /api/upload — admin only
router.post('/', protect, upload.single('image'), handleUpload);

// POST /api/upload/public — public (team join form)
router.post('/public', upload.single('image'), handleUpload);

// POST /api/upload/audio — public audio upload
router.post('/audio', uploadAudio.single('audio'), handleAudioUpload);

// POST /api/upload/audio-admin — admin-only audio upload
router.post('/audio-admin', protect, uploadAudio.single('audio'), handleAudioUpload);

module.exports = router;
