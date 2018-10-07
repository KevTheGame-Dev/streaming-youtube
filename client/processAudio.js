window.onload = () => {

    //AUDIO STREAMING CODE
    let audioCTX = new (window.AudioContext || window.webkitAudioContext);
    let audioCTXBuffer, mainBuffer;
    let playButton, pauseButton;
    let startedAt, pausedAt;
    let loading = true;

    //AUDIO STREAMING -> AUDIO VISUALIZER VARIABLES;
    const NUM_SAMPLES = 256;
    let analyserNode;
    let delayNode;
    let delayAmount = 0;
    let lowShelfBiquadFilter;
    let highShelfBiquadFilter;
    let distortionFilter;
    let distortionAmount = 20;

    playButton = document.querySelector('#playButton');
    playButton.onclick = () => {
        if(audioCTXBuffer != null){
            audioCTXBuffer = audioCTX.createBufferSource();

            //connect nodes
            audioCTXBuffer.connect(lowShelfBiquadFilter);
            lowShelfBiquadFilter.connect(highShelfBiquadFilter);
            highShelfBiquadFilter.connect(distortionFilter);
            distortionFilter.connect(analyserNode);

            audioCTXBuffer.buffer = mainBuffer;
            analyserNode.connect(audioCTX.destination);
            audioCTXBuffer.start(0, pausedAt / 1000);
            audioCTXBuffer.loop = true;

            startedAt = Date.now() - pausedAt;
            update();
        }
        playButton.style.display = 'none';
        pauseButton.style.display = 'block';
    }

    pauseButton = document.querySelector('#pauseButton');
    pauseButton.onclick = () => {
        if(audioCTXBuffer != null){
            if(audioCTXBuffer.buffer != null){
                audioCTXBuffer.stop();  
                pausedAt = Date.now() - startedAt;
                currentTimeInAudio = 0;
                cancelAnimationFrame(animationID);
            }
        }
        playButton.style.display = 'block';
        pauseButton.style.display = 'none';
    }

    playButton.disable = true;
    pauseButton.style.display = 'none';

    document.querySelector('#video-input').onsubmit = (e) => {
        let videoUrl = document.querySelector("#video-url").value;
    
        if(audioCTXBuffer != null){
            audioCTXBuffer.stop();
            cancelAnimationFrame(animationID);
            audioCTXBuffer.buffer = null;
            audioCTXBuffer = null;
            audioCTX = null;
        }

        if(videoUrl.includes('=')){
            videoUrl = videoUrl.split('=')[1];
        }

        analyserNode = audioCTX.createAnalyser();
        analyserNode.fttSize = NUM_SAMPLES;

        delayNode = audioCTX.createDelay();
        delayNode.delayTime.value = delayAmount;

        lowShelfBiquadFilter = audioCTX.createBiquadFilter();
        lowShelfBiquadFilter.type = 'lowshelf';
        highShelfBiquadFilter = audioCTX.createBiquadFilter();
        highShelfBiquadFilter.type = 'highshelf';
        distortionFilter = audioCTX.createWaveShaper();

        audioCTXBuffer = audioCTX.createBufferSource();
        audioCTXBuffer.connect(lowShelfBiquadFilter);
        lowShelfBiquadFilter.connect(highShelfBiquadFilter);
        highShelfBiquadFilter.connect(distortionFilter);
        distortionFilter.connect(analyserNode);

        loading = true;
        update();
        sendRequest(e, videoUrl);
    }

    const handleResponse = (e, xhr) => {
        audioCTX.decodeAudioData(xhr.response, buffer => {
            
            loading = false;
            mainBuffer = buffer;
            audioCTXBuffer.buffer = buffer;
            analyserNode.connect(audioCTX.destination);
            audioCTXBuffer.start();
            audioCTXBuffer.loop = true;

            startedAt = Date.now();

            playButton.disable = false;
            playButton.style.display = 'none';
            pauseButton.style.display = 'block';
            currentTimeInAudio = 0;
        });

        e.preventDefault();
        return false;
    }

    const sendRequest = (e, videoID) => {
        const xhr = new XMLHttpRequest();
        let url = '/audio' + `?videoID=${videoID}`;
        xhr.open('GET', url);

        xhr.responseType = 'arraybuffer';
        xhr.setRequestHeader("Content-Type", 'application/x-www-form-urlencoded');
        xhr.onload = () => handleResponse(e, xhr);
        xhr.send();

        e.preventDefault();
        return false;
    }


    //AUDIO VISUALIZER CODE
    canvas = document.querySelector('#canvas');
    ctx = canvas.getContext('2d');
    let animationID;
    let maxRadius = 100;
    let tintColor = 'white';
    let invertIsChecked = false;
    let embossIsChecked = false;
    let noiseIsChecked = false;
    let linesIsChecked = false;
    let colorSwapIsChecked = false;
    let noiseFrequency = 30;
    let imgData;
    let loadingNum = 0;
    let loadingX = -100;

    function update() { 
        // this schedules a call to the update() method in 1/60 seconds
        animationID = requestAnimationFrame(update);
    
        
        // Clear the canvas for next frame
        ctx.clearRect(0,0,1800,1600);

        //If loading audio data from server, draw loading animation
        if(loading){
            loadingNum += 1;

            ctx.save();
            ctx.translate(ctx.canvas.width/2 - 35, ctx.canvas.height/2 - 30);

            //Draw greyed loading bars
            for(let i = 0; i < 8; i++){
                ctx.fillStyle = 'grey';
                ctx.beginPath();
                ctx.rect(i * 10, 0, 10, 30);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }

            //Draw white loading bar
            if(loadingNum < 15){
                loadingX = 0;
            }
            else if(loadingNum < 30){
                loadingX = 10;
            }
            else if(loadingNum < 45){
                loadingX = 20;
            }
            else if(loadingNum < 60){
                loadingX = 30;
            }
            else if(loadingNum < 75){
                loadingX = 40;
            }
            else if(loadingNum < 90){
                loadingX = 50;
            }
            else if(loadingNum < 105){
                loadingX = 60;
            }
            else if(loadingNum < 120){
                loadingX = 70;
            }
            else if(loadingNum > 120){
                loadingNum = 0;
            }

            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.rect(loadingX, 0, 10, 30);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.restore();
        }
        else{
            
            // create a new array of 8-bit integers (0-255)
            let data = new Uint8Array(NUM_SAMPLES/2);
            let data_w = new Uint8Array(NUM_SAMPLES/2);
            
            // populate the array with the frequency data
            // notice these arrays can be passed "by reference" 
            analyserNode.getByteFrequencyData(data);
            analyserNode.getByteTimeDomainData(data_w);


            //Draw waveform 'guitar string'
            for(let i = 0; i < data_w.length; i++){
                let percent = data_w[i] / 255;

                //Focus on base waveform
                if(i == 1){
                    //Bottom right 'string'
                    ctx.save();
                    ctx.strokeStyle = "#ffffff";
                    ctx.linePath = "round";
                    ctx.lineJoin = "round";
                    ctx.beginPath();
                    ctx.moveTo(0, ctx.canvas.height);
                    ctx.quadraticCurveTo(ctx.canvas.width/2 - (percent * 255), ctx.canvas.height/2 - (percent * 255), ctx.canvas.width/2, ctx.canvas.height/2)
                    ctx.stroke();
                    ctx.closePath();
                    ctx.restore();

                    //Top right 'string'
                    ctx.save();
                    ctx.strokeStyle = "#ffffff";
                    ctx.linePath = "round";
                    ctx.lineJoin = "round";
                    ctx.beginPath();
                    ctx.moveTo(ctx.canvas.width, 0);
                    ctx.quadraticCurveTo(ctx.canvas.width/2 + (percent * 255), ctx.canvas.height/2 + (percent * 255), ctx.canvas.width/2, ctx.canvas.height/2)
                    ctx.stroke();
                    ctx.closePath();
                    ctx.restore();
                }
            }


            //Use frequency data to draw circles
            for(let i=0; i<data.length; i++) {

                let percent = data[i] / 255;

                if(i%4 == 0){
                    let angle;
                    let x;
                    let y;

                    ctx.save();
                    ctx.translate(ctx.canvas.width/2, ctx.canvas.height/2);
                    ctx.scale(0.5, 0.5);
                    
                    //Draw circles in a really cool mathy 'spiral'
                    for (let j=0; j< 720; j+=16) {
                        angle = 0.2 * j;
                        x=(percent*255+angle)*Math.cos(angle);
                        y=(percent*255+angle)*Math.sin(angle);
                        drawCircle(ctx, x, y, 5, `rgb(${percent*255}, ${j/2}, ${percent*255})`);//Base color off of percent & spiral location
                    }
                    ctx.restore();
                }
                
            }

            
        }
         

        switch(tintColor){
            case 'white':
                break;
            case 'red':
                ctx.save();
                ctx.fillStyle = "rgba(255,0,0,0.3)";
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
                break;
            case 'green':
                ctx.save();
                ctx.fillStyle = 'rgba(0,255,0,0.3)';
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
                break;
            case 'blue':
                ctx.save();
                ctx.fillStyle = 'rgba(0,0,255,0.3)';
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
                break;
            case 'violet':
                ctx.save();
                ctx.fillStyle = 'rgba(238,130,238,0.3)';
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
                break;
            case 'cyan':
                ctx.save();
                ctx.fillStyle = 'rgba(0,255,255,0.3)';
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
                break;
            case 'purple':
                ctx.save();
                ctx.fillStyle = 'rgba(102,51,153,0.3)';
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
                break;
        }
        

        //check if any toggle
        if(invertIsChecked || embossIsChecked || noiseIsChecked || linesIsChecked || colorSwapIsChecked){
            imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            //invert
            if(invertIsChecked){
                for(let i = 0; i < imgData.data.length; i+=4){
                    let red = i;
                    let green = i+1;
                    let blue = i+2;
                    let alpha = i+3;
                    
                    let newRed = 255 - imgData.data[red];
                    let newGreen = 255 - imgData.data[green];
                    let newBlue = 255 - imgData.data[blue];
                    imgData.data[red] = newRed;
                    imgData.data[green] = newGreen;
                    imgData.data[blue] = newBlue;
                }					
            }
            
            //emboss
            if(embossIsChecked){
                for(let i = 0; i < imgData.data.length; i++){
                    if(i%4 === 3) continue;
                    imgData.data[i] = 127 + 2*imgData.data[i] - imgData.data[i + 4] - imgData.data[i + ctx.canvas.width*4];
                }
            }

            let random = Math.random();
            if(noiseIsChecked){
                for(let i = 0; i < imgData.data.length; i+=4){
                    let red = i;
                    let green = i+1;
                    let blue = i+2;
                    let alpha = i+3;
                    
                    let makeBlack = Math.random();
                    if(makeBlack < noiseFrequency * 0.01){
                        imgData.data[red] = 0;
                        imgData.data[green] = 0;
                        imgData.data[blue] = 0;
                    }
                }	
            }

            if(linesIsChecked){
                for(let i = 0; i < imgData.data.length; i+=4){
                    let rows = Math.floor(i/4/ctx.canvas.width);
                    let red = i;
                    let green = i+1;
                    let blue = i+2;
                    let alpha = i+3;

                    if(rows % 50 === 0){
                        imgData.data[red] = 255;
                        imgData.data[green] = 255;
                        imgData.data[blue] = 255;


                    }
                }	
                
            }

            if(colorSwapIsChecked){
                for(let i = 0; i < imgData.data.length; i+=4){
                    let red = i;
                    let green = i+1;
                    let blue = i+2;
                    let alpha = i+3;
                    
                    let newRed = imgData.data[blue];
                    let newGreen = imgData.data[red];
                    let newBlue = imgData.data[green];
                    imgData.data[red] = newRed;
                    imgData.data[green] = newGreen;
                    imgData.data[blue] = newBlue;
                }	
            }

            ctx.putImageData(imgData, 0, 0);
        }
    }

    //Helper functions
    function makeColor(red, green, blue, alpha){
        let color='rgba('+red+','+green+','+blue+', '+alpha+')';
        return color;
    }

    //Circle drawing helper
    function drawCircle(ctx,x=0,y=0,radius=10, fillStyle="red",strokeStyle="black",lineWidth=0,startAngle=0,endAngle=Math.PI*2){
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;    
        ctx.lineWidth = lineWidth;  
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }


    //SET UP UI
    const controls = document.querySelector('#controls');
    const hoverField = document.querySelector('#hoverField');
    const controlsLabel = document.querySelector('#controlsLabel');

    hoverField.onmouseover = () => {
        controls.style.width = '200px';
        controlsLabel.style.display = 'none';
    }
    hoverField.onmouseout = () => {
        controls.style.width = '0px';
        controlsLabel.style.display = 'block';
    }

    document.querySelector('#tintSelect').onchange = function(e){
        tintColor = e.target.value;
    }

    document.querySelector('#doInvert').onchange = function(e){
        invertIsChecked = !invertIsChecked;
    }

    document.querySelector('#doEmboss').onchange = function(e){
        embossIsChecked = !embossIsChecked;
    }

    document.querySelector('#doNoise').onchange = function(e){
        noiseIsChecked = !noiseIsChecked;
    }

    let noiseSlider = document.querySelector('#noiseSlider');
    noiseSlider.oninput = function(){
        noiseFrequency = this.value;
    }

    document.querySelector('#doLines').onchange = function(e){
        linesIsChecked = !linesIsChecked;
    }
    
    document.querySelector('#colorSwap').onchange = function(e){
        colorSwapIsChecked = !colorSwapIsChecked;
    }

    document.querySelector('#doReverb').onchange = function(e){
        if(document.querySelector('#doReverb').checked){
            audioCTXBuffer.disconnect();
            delayNode.disconnect();
            lowShelfBiquadFilter.disconnect();
            highShelfBiquadFilter.disconnect();
            distortionFilter.disconnect();
            analyserNode.disconnect();

            audioCTXBuffer.connect(audioCTX.destination);
            audioCTXBuffer.connect(lowShelfBiquadFilter);
            lowShelfBiquadFilter.connect(highShelfBiquadFilter);
            highShelfBiquadFilter.connect(distortionFilter);
            distortionFilter.connect(delayNode);
            delayNode.connect(analyserNode);
            analyserNode.connect(audioCTX.destination);
        }
        else{
            audioCTXBuffer.disconnect();
            delayNode.disconnect();
            lowShelfBiquadFilter.disconnect();
            highShelfBiquadFilter.disconnect();
            distortionFilter.disconnect();
            analyserNode.disconnect();

            audioCTXBuffer.connect(lowShelfBiquadFilter);
            lowShelfBiquadFilter.connect(highShelfBiquadFilter);
            highShelfBiquadFilter.connect(distortionFilter);
            distortionFilter.connect(analyserNode);
        }
    }
    let reverbSlider = document.querySelector('#reverbSlider');
    reverbSlider.oninput = function(){
        delayAmount = this.value;
        delayNode.delayTime.value = delayAmount;
    }



    document.querySelector('#doHighshelf').onchange = function(e){
        if(document.querySelector('#doHighshelf').checked){
            highShelfBiquadFilter.frequency.setValueAtTime(1000, audioCTX.currentTime);
            highShelfBiquadFilter.gain.setValueAtTime(10, audioCTX.currentTime);
        }
        else{
            highShelfBiquadFilter.gain.setValueAtTime(0, audioCTX.currentTime);
        }
    }

    document.querySelector('#doLowshelf').onchange = function(e){
        if(document.querySelector('#doLowshelf').checked){
            lowShelfBiquadFilter.frequency.setValueAtTime(1000, audioCTX.currentTime);
            lowShelfBiquadFilter.gain.setValueAtTime(8, audioCTX.currentTime);
        }
        else{
            lowShelfBiquadFilter.gain.setValueAtTime(0, audioCTX.currentTime);
        }
    }


    document.querySelector('#doDistortion').onchange = function(e){
        if(document.querySelector('#doDistortion').checked){
            distortionFilter.curve = null; // being paranoid and trying to trigger garbage collection
            distortionFilter.curve = makeCurve(distortionAmount);
            
        }else{
            distortionFilter.curve = null;
        }
    }
    let distortionSlider = document.querySelector('#distortionSlider');
    distortionSlider.oninput = function(){
        distortionAmount = this.value;
        distortionFilter.curve = makeCurve(distortionAmount);
    }

    makeCurve = (amount) => {
        let n_samples = 256, curve = new Float32Array(n_samples);
        for (let i =0 ; i < n_samples; ++i ) {
          let x = i * 2 / n_samples - 1;
          curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
        }
        return curve;;
    }
};