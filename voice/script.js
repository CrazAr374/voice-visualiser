const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const toggleButton = document.getElementById('toggleButton');

let audioContext, analyser, dataArray, source;
let isRecording = false;

function setCanvasSize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

setCanvasSize();
window.addEventListener('resize', setCanvasSize);

toggleButton.addEventListener('click', toggleRecording);

function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 512;  // Increased fftSize for more frequency bins
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        isRecording = true;
        toggleButton.textContent = 'Stop';
        draw();
    } catch (err) {
        console.error('Error accessing microphone:', err);
    }
}

function stopRecording() {
    if (source) {
        source.disconnect();
    }
    if (audioContext) {
        audioContext.close();
    }
    isRecording = false;
    toggleButton.textContent = 'Start';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    if (!isRecording) return;

    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / dataArray.length) * 2; // Double bar width for visibility
    let barHeight;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i] * (canvas.height / 256); // Scale bar height to canvas height

        // Create a gradient for each bar
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 255, 0.8)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight); // Adjust to start from bottom

        x += barWidth + 2; // Increase spacing between bars
    }

    // Add a radial gradient overlay for extra visual appeal
    const radialGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
