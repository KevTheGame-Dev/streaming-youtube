const http = require('http');
const url = require('url');
const htmlHandler = require('./htmlResponses');
const audioHandler = require('./audioResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  console.log(request.url);
  const parsedURL = url.parse(request.url);
  console.log(parsedURL);
  let temp = parsedURL.query;
  let params = {};
  if (temp != null) {
    temp = temp.split('=');
    params = { videoID: `${temp[1]}` };
    console.log(params);
  }

  switch (parsedURL.pathname) {
    case '/':
      htmlHandler.getIndex(request, response);
      break;
    case '/styles.css':
      htmlHandler.getStyles(request, response);
      break;
    case '/audio':
      audioHandler.getAudio(request, response, params);
      break;
    case '/processAudio.js':
      htmlHandler.getAudioJS(request, response);
      break;
    default:
      htmlHandler.getIndex(request, response);
      break;
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1:${port}`);
