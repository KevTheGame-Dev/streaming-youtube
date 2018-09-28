window.onload = () => {
    var audioCTX, audioCTXBuffer;
    document.querySelector('#video-input').onsubmit = (e) => {
        var videoUrl = document.querySelector("#video-url").value;
    
        if(videoUrl.includes('?')){
            videoUrl = videoUrl.split('?')[1];
        }

        audioCTX = new (window.AudioContext || window.webkitAudioContext);
        audioCTXBuffer = audioCTX.createBufferSource();

        sendRequest(e, videoUrl);
    }

    const handleResponse = (e, xhr) => {
        console.log("stream response recieved");
        audioCTX.decodeAudioData(xhr.response, buffer => {
            
            audioCTXBuffer.buffer = buffer;
            audioCTXBuffer.connect(audioCTX.destination);
            audioCTXBuffer.start();
            console.log("streaming...");
        });

        e.preventDefault();
        return false;
    }

    const sendRequest = (e, videoID) => {
        const xhr = new XMLHttpRequest();
        var url = '/audio' + `?videoID=${videoID}`;
        xhr.open('GET', url);

        xhr.responseType = 'arraybuffer';

        xhr.onload = () => handleResponse(e, xhr);
        xhr.send();
        console.log("stream request sent");

        e.preventDefault();
        return false;
    }
};