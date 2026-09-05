var canvas = document.getElementById('game-canvas');
var ctx = canvas.getContext('2d');
var loadingProgress = document.getElementById('loading-progress');
var loadingPercent = document.getElementById('loading-percent');
var loadingMessage = document.getElementById('loading-message');
var loadingScreen = document.getElementById('loading-screen');
var loadingTrack = document.querySelector('.loading-track');
var bgReady = false;
var fontReady = false;

var bg = new Image();

function drawTitleScreen() {
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;
    var imageRatio = bg.naturalWidth / bg.naturalHeight;
    var viewportRatio = viewportWidth / viewportHeight;
    var drawWidth = viewportWidth;
    var drawHeight = viewportHeight;
    var offsetX = 0;
    var offsetY = 0;

    canvas.width = viewportWidth;
    canvas.height = viewportHeight;
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (bg.complete && bg.naturalWidth) {
        if (imageRatio > viewportRatio) {
            drawWidth = viewportHeight * imageRatio;
            offsetX = (viewportWidth - drawWidth) / 2;
        } else {
            drawHeight = viewportWidth / imageRatio;
            offsetY = (viewportHeight - drawHeight) / 2;
        }
        ctx.drawImage(bg, offsetX, offsetY, drawWidth, drawHeight);
    }
}

function setLoadingProgress(value) {
    var progress = Math.max(0, Math.min(100, Math.round(value)));

    if (loadingProgress) {
        loadingProgress.style.width = progress + '%';
    }
    if (loadingPercent) {
        loadingPercent.textContent = progress + '%';
    }
    if (loadingTrack) {
        loadingTrack.setAttribute('aria-valuenow', progress);
    }
}

function updateInitialLoading() {
    var progress = (bgReady ? 50 : 0) + (fontReady ? 50 : 0);

    setLoadingProgress(progress);

    if (bgReady && fontReady) {
        drawTitleScreen();
        loadingScreen.style.display = 'none';
        return;
    }

    loadingScreen.style.display = 'flex';
}

function markBackgroundReady() {
    bgReady = true;
    updateInitialLoading();
}

function markFontReady() {
    fontReady = true;
    updateInitialLoading();
}

bg.onload = markBackgroundReady;
bg.onerror = markBackgroundReady;
bg.src = 'assets/images/bg.png';

if (document.fonts && document.fonts.load) {
    document.fonts.load('600 1rem "ZHSJ Serif"')
        .then(markFontReady, markFontReady);
} else {
    markFontReady();
}

window.addEventListener('resize', drawTitleScreen);

// 按钮逻辑保持不变
document.getElementById('btn-start').addEventListener('click', function() {
    var startButton = document.getElementById('btn-start');
    var progress = 0;

    startButton.disabled = true;
    document.getElementById('start-menu').style.display = 'none';
    loadingScreen.style.display = 'flex';
    loadingScreen.style.opacity = '1';
    loadingMessage.textContent = '正在进入游戏...';
    setLoadingProgress(0);

    var startLoadingTimer = window.setInterval(function() {
        progress += 5;
        setLoadingProgress(progress);

        if (progress >= 100) {
            window.clearInterval(startLoadingTimer);
            window.location.href = 'start.html';
        }
    }, 60);
});

document.getElementById('btn-intro').addEventListener('click', function() {
    window.location.href = 'intro.html'; 
});