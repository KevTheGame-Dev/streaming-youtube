window.onload = () => {

    //AUDIO STREAMING CODE
    var audioCTX, audioCTXBuffer, mainBuffer;
    var playButton, pauseButton;
    var startedAt, pausedAt;

    //AUDIO STREAMING -> AUDIO VISUALIZER VARIABLES;
    const NUM_SAMPLES = 256;
    var analyserNode;

    playButton = document.querySelector('#playButton');
    playButton.onclick = () => {
        if(audioCTXBuffer != null){
            audioCTXBuffer = audioCTX.createBufferSource();
            audioCTXBuffer.connect(analyserNode);
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
        var videoUrl = document.querySelector("#video-url").value;
    
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

        audioCTX = new (window.AudioContext || window.webkitAudioContext);
        analyserNode = audioCTX.createAnalyser();
        analyserNode.fttSize = NUM_SAMPLES;
        audioCTXBuffer = audioCTX.createBufferSource();
        audioCTXBuffer.connect(analyserNode);

        sendRequest(e, videoUrl);
    }

    const handleResponse = (e, xhr) => {
        console.log("stream response recieved");
        audioCTX.decodeAudioData(xhr.response, buffer => {
            
            mainBuffer = buffer;
            audioCTXBuffer.buffer = buffer;
            analyserNode.connect(audioCTX.destination);
            audioCTXBuffer.start();
            audioCTXBuffer.loop = true;

            update();
            startedAt = Date.now();

            playButton.disable = false;
            playButton.style.display = 'none';
            pauseButton.style.display = 'block';
            currentTimeInAudio = 0;
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
        xhr.setRequestHeader("Content-Type", 'application/x-www-form-urlencoded');
        xhr.onload = () => handleResponse(e, xhr);
        xhr.send();
        console.log("stream request sent");

        e.preventDefault();
        return false;
    }


    //AUDIO VISUALIZER CODE
    canvas = document.querySelector('#canvas');
    ctx = canvas.getContext('2d');
    var animationID;
    var maxRadius = 100;
    var tintColor = 'white';
    var invertIsChecked = false;
    var embossIsChecked = false;
    var noiseIsChecked = false;
    var linesIsChecked = false;
    var colorSwapIsChecked = false;
    var noiseFrequency = 30;
    var imgData;

    function update() { 
        // this schedules a call to the update() method in 1/60 seconds
        animationID = requestAnimationFrame(update);
        
        /*
            Nyquist Theorem
            http://whatis.techtarget.com/definition/Nyquist-Theorem
            The array of data we get back is 1/2 the size of the sample rate 
        */
        
        // create a new array of 8-bit integers (0-255)
        var data = new Uint8Array(NUM_SAMPLES/2); 
        
        // populate the array with the frequency data
        // notice these arrays can be passed "by reference" 
        analyserNode.getByteFrequencyData(data);
    
        // OR
        //analyserNode.getByteTimeDomainData(data); // waveform data
        
        // DRAW!
        ctx.clearRect(0,0,800,600);  
        var barWidth = 4;
        var barSpacing = 1;
        var barHeight = 100;
        var topSpacing = 50;
        

        var songDuration = audioCTXBuffer.buffer.duration;
        var currentTime = Date.now() - startedAt;
        var shapeChanger = 16;
        if(currentTime < songDuration / 16) shapeChanger = 16;
        else if(currentTime < songDuration*2 / 16) shapeChanger = 17;
        else if(currentTime < songDuration*3 / 16) shapeChanger = 18;
        else if(currentTime < songDuration*4 / 16) shapeChanger = 19;
        else if(currentTime < songDuration*5 / 16) shapeChanger = 20;
        else if(currentTime < songDuration*6 / 16) shapeChanger = 21;
        else if(currentTime < songDuration*7 / 16) shapeChanger = 22;
        else if(currentTime < songDuration*8 / 16) shapeChanger = 23;
        else if(currentTime < songDuration*9 / 16) shapeChanger = 24;
        else if(currentTime < songDuration*10 / 16) shapeChanger = 25;
        else if(currentTime < songDuration*11 / 16) shapeChanger = 26;
        else if(currentTime < songDuration*12 / 16) shapeChanger = 27;
        else if(currentTime < songDuration*13 / 16) shapeChanger = 28;
        else if(currentTime < songDuration*14 / 16) shapeChanger = 29;
        else if(currentTime < songDuration*15 / 16) shapeChanger = 30;
        else if(currentTime < songDuration) shapeChanger = 31;


        
        // loop through the data and draw!
        for(var i=0; i<data.length; i++) { 
            ctx.fillStyle = 'rgba(0,255,0,0.6)'; 
            
            // the higher the amplitude of the sample (bin) the taller the bar
            // remember we have to draw our bars left-to-right and top-down
            //ctx.fillRect(i * (barWidth + barSpacing),topSpacing + 256-data[i],barWidth,barHeight); 
            //Inversion
            //ctx.fillRect(640-i * (barWidth + barSpacing), topSpacing + 256-data[i] - 20, barWidth, barHeight);
            

            //circles
            //red

            var percent = data[i] / 255;

            if(i == 1){
                ctx.save();
                ctx.strokeStyle = "#ffffff";
                ctx.linePath = "round";
                ctx.lineJoin = "round";
                ctx.beginPath();
                ctx.moveTo(0, ctx.canvas.height);
                //ctx.lineTo(ctx.canvas.width/2 - ctx.canvas.width/3, ctx.canvas.height/2 + ctx.canvas.height/3);
                //ctx.moveTo(ctx.canvas.width/2 - 100, ctx.canvas.height/2 + 100);
                ctx.quadraticCurveTo(ctx.canvas.width/2 - (percent * 255), ctx.canvas.height/2 - (percent * 255), ctx.canvas.width/2, ctx.canvas.height/2)
                ctx.stroke();
                ctx.closePath();
                ctx.restore();

                ctx.save();
                ctx.strokeStyle = "#ffffff";
                ctx.linePath = "round";
                ctx.lineJoin = "round";
                ctx.beginPath();
                ctx.moveTo(ctx.canvas.width, 0);
                //ctx.lineTo(ctx.canvas.width/2 + ctx.canvas.width/3, ctx.canvas.height/2 - ctx.canvas.height/3);
                //ctx.quadraticCurveTo(ctx.canvas.width/2 + ctx.canvas.width/3 - (percent * 255), ctx.canvas.height/2 - ctx.canvas.height/3 - (percent * 255), ctx.canvas.width/2 + ctx.canvas.width/3, ctx.canvas.height/2 - ctx.canvas.height/3)
                //ctx.moveTo(ctx.canvas.width/2 - 100, ctx.canvas.height/2 + 100);
                ctx.quadraticCurveTo(ctx.canvas.width/2 + (percent * 255), ctx.canvas.height/2 + (percent * 255), ctx.canvas.width/2, ctx.canvas.height/2)
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
            }

            var angle;
            var x;
            var y;

            ctx.save();
            ctx.translate(ctx.canvas.width/2, ctx.canvas.height/2);
            ctx.scale(0.3, 0.3);
            
            for (var j=0; j< 720; j+=shapeChanger) {
                angle = 0.2 * j;
                x=(percent*255+angle)*Math.cos(angle);
                y=(percent*255+angle)*Math.sin(angle);
                drawCircle(ctx, x, y, 5, "red");
            }
            ctx.restore();
            
        }

        //for(var i = 0; i < data.length; i+=4){
            
            //Draw circles
            //ctx.save();
            /* ctx.translate(ctx.canvas.width/2, ctx.canvas.height/2);
            ctx.rotate(15*i);
            var cirColor = makeColor(percent * 255 , 255 - (percent * 255), percent * 255 / 2, 1.0);
            drawCircle(ctx, i, 10+data[i], 5, cirColor);
            ctx.restore(); */
        //}
         

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
                for(var i = 0; i < imgData.data.length; i+=4){
                    var red = i;
                    var green = i+1;
                    var blue = i+2;
                    var alpha = i+3;
                    
                    var newRed = 255 - imgData.data[red];
                    var newGreen = 255 - imgData.data[green];
                    var newBlue = 255 - imgData.data[blue];
                    imgData.data[red] = newRed;
                    imgData.data[green] = newGreen;
                    imgData.data[blue] = newBlue;
                }					
            }
            
            //emboss
            if(embossIsChecked){
                for(var i = 0; i < imgData.data.length; i++){
                    if(i%4 === 3) continue;
                    imgData.data[i] = 127 + 2*imgData.data[i] - imgData.data[i + 4] - imgData.data[i + ctx.canvas.width*4];
                }
            }

            var random = Math.random();
            if(noiseIsChecked){
                for(var i = 0; i < imgData.data.length; i+=4){
                    var red = i;
                    var green = i+1;
                    var blue = i+2;
                    var alpha = i+3;
                    
                    var makeBlack = Math.random();
                    if(makeBlack < noiseFrequency * 0.01){
                        imgData.data[red] = 0;
                        imgData.data[green] = 0;
                        imgData.data[blue] = 0;
                    }
                }	
            }

            if(linesIsChecked){
                for(var i = 0; i < imgData.data.length; i+=4){
                    var rows = Math.floor(i/4/ctx.canvas.width);
                    var red = i;
                    var green = i+1;
                    var blue = i+2;
                    var alpha = i+3;

                    if(rows % 50 === 0){
                        imgData.data[red] = 255;
                        imgData.data[green] = 255;
                        imgData.data[blue] = 255;


                    }
                }	
                
            }

            if(colorSwapIsChecked){
                for(var i = 0; i < imgData.data.length; i+=4){
                    var red = i;
                    var green = i+1;
                    var blue = i+2;
                    var alpha = i+3;
                    
                    var newRed = imgData.data[blue];
                    var newGreen = imgData.data[red];
                    var newBlue = imgData.data[green];
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
        var color='rgba('+red+','+green+','+blue+', '+alpha+')';
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
};