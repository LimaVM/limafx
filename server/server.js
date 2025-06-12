const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const jimp = require('jimp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const port = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/output', express.static(outputDir));

const upload = multer({ dest: uploadDir });

// Upload and grayscale an image
app.post('/api/image', upload.single('file'), async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join(outputDir, `${req.file.filename}-gray.png`);

  try {
    await sharp(inputPath).grayscale().toFile(outputPath);
    res.json({ success: true, file: outputPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Image processing failed' });
  } finally {
    fs.unlink(inputPath, () => {});
  }
});

// Upload and trim a video to first 5 seconds
app.post('/api/video', upload.single('file'), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join(outputDir, `${req.file.filename}-trim.mp4`);

  ffmpeg(inputPath)
    .setStartTime('0')
    .setDuration(5)
    .output(outputPath)
    .on('end', () => {
      fs.unlink(inputPath, () => {});
      res.json({ success: true, file: outputPath });
    })
    .on('error', (err) => {
      console.error(err);
      fs.unlink(inputPath, () => {});
      res.status(500).json({ success: false, error: 'Video processing failed' });
    })
    .run();
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
