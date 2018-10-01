const youtubeStream = require('youtube-audio-stream');

const getAudio = function (request, response, params) {
  console.log('stream request recieved');
  console.log(params);
  const requestUrl = `http://youtube.com/watch?v=${params.videoID}`;
  try {
    console.log(`Trying to stream: ${requestUrl}`);
    youtubeStream(requestUrl).pipe(response);
    console.log('stream complete');
  } catch (exception) {
    console.log('streaming failed');
    response.writeHead(500, { 'Content-Type': 'text/html' });
    response.end();
  }
};

module.exports = {
  getAudio,
};
