window.onload( () => {
    const audioCTX, audioCTXBuffer;
    document.querySelector('#video-input').onsubmit = () => {
        const videoUrl = document.querySelector("#video-url").value;
    
        if(videoUrl.includes('?')){
            videoUrl = videoUrl.split('?')[1];
        }

        audioCTX = new (window.AudioContext || window.webkitAudioContext);
        audioCTXBuffer = audioCTX.createBufferSource();

        sendRequest(videoUrl);
    }

    const handleResponse = (e, xhr) => {
        audioCTX.decodeAudioData(xhr.response, buffer => {
            
            audioCTXBuffer.buffer = buffer;
            audioCTXBuffer.connect(audioCTX.destination);
            audioCTXBuffer.start();
        });
    }

    const sendRequest = (videoID) => {
        const xhr = new XMLHttpRequest();
        var url = '/audio' + `?videoID=${videoID}`;
        xhr.open('GET', url);

        xhr.responseType = 'arraybuffer';

        xhr.onload = () => handleResponse(e, xhr);
        xhr.send();

        return false;
    }
});