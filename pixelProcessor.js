const express = require('express')
const multer = require('multer')
const ffmpeg = require('fluent-ffmpeg')
const Jimp = require('jimp')
const fs = require('fs')
const path = require('path')

const app = express()
const upload = multer({ dest: 'uploads/' })

app.post('/upload', upload.single('media'), (req, res) => {
  const filePath = req.file.path
  const framesDir = path.join(__dirname, 'frames')

  if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir)

  ffmpeg(filePath)
    .output(path.join(framesDir, 'frame-%03d.png'))
    .outputOptions(['-vf', 'scale=100:100', '-r', '10'])
    .on('end', async () => {
      try {
        const files = fs.readdirSync(framesDir).filter(f => f.endsWith('.png'))
        let pixelFrames = []

        for (const file of files) {
          const img = await Jimp.read(path.join(framesDir, file))
          let pixels = []
          for (let y = 0; y < img.bitmap.height; y++) {
            for (let x = 0; x < img.bitmap.width; x++) {
              const color = img.getPixelColor(x, y)
              const { r, g, b } = Jimp.intToRGBA(color)
              pixels.push([r, g, b])
            }
          }
          pixelFrames.push(pixels)
        }

        fs.writeFileSync('pixelData.json', JSON.stringify(pixelFrames))
        res.json({ message: 'Upload processed', frames: pixelFrames.length })
      } catch (e) {
        res.status(500).send(e.message)
      }
    })
    .on('error', err => res.status(500).send(err.message))
    .run()
})

app.listen(3000)
