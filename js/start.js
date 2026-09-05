var loadingProgress = document.getElementById('loading-progress');
var loadingPercent = document.getElementById('loading-percent');
var loadingScreen = document.getElementById('loading-screen');
var loadingTrack = document.querySelector('.loading-track');
var backgroundReady = false;
var fontReady = false;

function setLoadingProgress(value) {
    var progress = Math.max(0, Math.min(100, Math.round(value)));

    loadingProgress.style.width = progress + '%';
    loadingPercent.textContent = progress + '%';
    loadingTrack.setAttribute('aria-valuenow', progress);
}

function updateLoadingState() {
    var progress = (backgroundReady ? 50 : 0) + (fontReady ? 50 : 0);

    setLoadingProgress(progress);

    if (backgroundReady && fontReady) {
        loadingScreen.style.display = 'none';
    } else {
        loadingScreen.style.display = 'flex';
    }
}

function markBackgroundReady() {
    backgroundReady = true;
    updateLoadingState();
}

function markFontReady() {
    fontReady = true;
    updateLoadingState();
}

var background = new Image();
background.onload = markBackgroundReady;
background.onerror = markBackgroundReady;
background.src = 'assets/images/start_bg.png';

if (document.fonts && document.fonts.load) {
    document.fonts.load('600 1rem "ZHSJ Serif"')
        .then(markFontReady, markFontReady);
} else {
    markFontReady();
}
