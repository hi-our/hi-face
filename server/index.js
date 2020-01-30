const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const faceapi = require('face-api.js')

const { canvas, faceDetectionNet, faceDetectionOptions, saveFile } = require('./commons');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API calls
app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});
// API calls
app.get('/api/face-detection', async (req, res) => {
  // console.log('face_detection req ', req);
  // console.log('face_detection req query:', req.query);
  console.log('1 :', 1);
  await faceDetectionNet.loadFromDisk('./weights')

  const { baseData = '' } = req.query
  // console.log('src :', baseData);

  const img = await canvas.loadImage(baseData)
  // console.log('img :', img);
  const detections = await faceapi.detectAllFaces(img, faceDetectionOptions)

  console.log('detections :', detections);

  // const out = faceapi.createCanvasFromMedia(img)
  // faceapi.draw.drawDetections(out, detections)
  // console.log('out :', out);

  res.send({
    data: {
      src: 'abc',
    },
    time: new Date(),
    status: 0,
    message: ''
  })

});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
