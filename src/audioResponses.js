const youtubeStream = require('youtube-audio-stream');

const getAudio = function (req, res) {
  console.log('stream request recieved');
  const requestUrl = `http://youtube.com/watch?v=${req.params.videoID}`;
  try {
    console.log('Trying to stream');
    youtubeStream(requestUrl).pipe(res);
    console.log('stream complete');
  } catch (exception) {
    console.log('streaming failed');
    res.status(500).send(exception);
  }
};

module.exports = {
  getAudio,
};
