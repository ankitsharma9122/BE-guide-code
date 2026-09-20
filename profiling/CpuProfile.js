const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 4000;

app.use(cors());

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const performHeavyTask = () => {
  let heavyTaskCount = 1;

  for (let x = 0; x < 10000000; ++x) {
    heavyTaskCount += Math.sqrt(heavyTaskCount * 3);
  }

  return heavyTaskCount;
};

app.get('/heavy', (req, res) => {
//   console.profile();
  const heavyTaskCount = performHeavyTask();
//   console.profileEnd();

  res.send(
    JSON.stringify({
      status: 'ok',
      heavyTaskCount,
    })
  );
});

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

setTimeout(() => {
  console.log('Stopping server...');
  server.close(() => {
    console.log('Server closed');
  });
}, 120000);