const youtubeStream = require('youtube-audio-stream');

const getAudio = function (req, res) {
  const requestUrl = `http://youtube.com/watch?v=${req.params.videoID}`;
  try {
    youtubeStream(requestUrl).pipe(res);
  } catch (exception) {
    res.status(500).send(exception);
  }
};

module.exports = {
  getAudio,
};
