const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const processAudio = fs.readFileSync(`${__dirname}/../client/processAudio.js`);

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getAudioJS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/javascript' });
  response.write(processAudio);
  response.end();
};

module.exports = {
  getIndex,
  getAudioJS,
};
