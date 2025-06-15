const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const si = require('systeminformation');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const port = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

let useGPU = false;
si.graphics().then(data => {
  if (data.controllers && data.controllers.length > 0) {
    useGPU = true;
    console.log('GPU detectada:', data.controllers.map(c => c.model).join(', '));
  } else {
    console.log('Nenhuma GPU detectada, usando CPU.');
  }
}).catch(err => {
  console.log('Falha ao detectar GPU, assumindo CPU.', err);
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/output', express.static(outputDir));

const upload = multer({ dest: uploadDir });

const imageEffects = {
  grayscale: pipeline => pipeline.grayscale(),
  invert: pipeline => pipeline.negate(),
  rotate: pipeline => pipeline.rotate(90)
};

const videoEffects = {
  trim: command => command.setStartTime('0').setDuration(5),
  grayscale: command => command.videoFilters('hue=s=0'),
  mirror: command => command.videoFilters('hflip')
};

app.get('/api/effects', (req, res) => {
  res.json({
    image: Object.keys(imageEffects),
    video: Object.keys(videoEffects)
  });
});

// Upload an image and apply selected effect
app.post('/api/image', upload.single('file'), async (req, res) => {
  const effect = req.query.effect || 'grayscale';
  const inputPath = req.file.path;
  const outputPath = path.join(outputDir, `${req.file.filename}-${effect}.png`);

  try {
    const pipeline = sharp(inputPath);
    (imageEffects[effect] || imageEffects.grayscale)(pipeline);
    await pipeline.toFile(outputPath);
    res.json({ success: true, file: `/output/${path.basename(outputPath)}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Image processing failed' });
  } finally {
    fs.unlink(inputPath, () => {});
  }
});

// Upload a video and apply selected effect
app.post('/api/video', upload.single('file'), (req, res) => {
  const effect = req.query.effect || 'trim';
  const inputPath = req.file.path;
  const outputPath = path.join(outputDir, `${req.file.filename}-${effect}.mp4`);

  const command = ffmpeg(inputPath);
  if (useGPU) {
    command.addOption('-hwaccel', 'auto');
  }
  (videoEffects[effect] || videoEffects.trim)(command);

  command.output(outputPath)
    .on('end', () => {
      fs.unlink(inputPath, () => {});
      res.json({ success: true, file: `/output/${path.basename(outputPath)}` });
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
