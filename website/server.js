const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 8779;

app.use(bodyParser.urlencoded({ extended: true }));

const buildUrl = 'build'
const faceName = 'hi-face'

app.use(express.static(path.join(__dirname, buildUrl)));

app.get('/hi-face', function (req, res) {
  res.sendFile(path.join(__dirname, buildUrl, faceName, 'index.html'));
});

// // API calls
// app.get('/api/hello', (req, res) => {
//   res.send({ express: 'Hello From Express' });
// });

// app.post('/api/world', (req, res) => {
//   console.log(req.body);
//   res.send(
//     `I received your POST request. This is what you sent me: ${req.body.post}`,
//   );
// });

if (process.env.NODE_ENV) {
  console.log('(process.env.NODE_ENV :', process.env.NODE_ENV);
}

if (process.env.NODE_ENV === 'production') {
  console.log('编译正式环境的效果 :');
  // Serve any static files
  app.use(express.static(path.join(__dirname, buildUrl)));

  // Handle React routing, return all requests to React app
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, buildUrl, faceName, 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
