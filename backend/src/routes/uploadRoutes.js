const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');

// ── Cloudinary setup ──
// If CLOUDINARY_URL or all 3 keys are set, use Cloudinary.
// Otherwise fall back to local disk (dev only).
let uploadToCloud = null;

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
}

// Use memory storage so we can pipe to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
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

// POST /api/upload — admin only
router.post('/', protect, upload.single('image'), handleUpload);

// POST /api/upload/public — public (team join form)
router.post('/public', upload.single('image'), handleUpload);

module.exports = router;
