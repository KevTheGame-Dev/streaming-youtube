const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const pageTwo = fs.readFileSync(`${__dirname}/../client/client2.html`);
const pageThree = fs.readFileSync(`${__dirname}/../client/client3.html`);

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getPageTwo = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(pageTwo);
  response.end();
};

const getPageThree = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(pageThree);
  response.end();
};

module.exports.getIndex = getIndex;
module.exports.getPageTwo = getPageTwo;
module.exports.getPageThree = getPageThree;
