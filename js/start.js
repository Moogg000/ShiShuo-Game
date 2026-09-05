var backgroundReady = false;
var fontReady = false;
var readyTimer;

function revealStartPage() {
    if (!backgroundReady || !fontReady) {
        return;
    }

    window.clearTimeout(readyTimer);
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
}

function markBackgroundReady() {
    backgroundReady = true;
    revealStartPage();
}

function markFontReady() {
    fontReady = true;
    revealStartPage();
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

readyTimer = window.setTimeout(function() {
    backgroundReady = true;
    fontReady = true;
    revealStartPage();
}, 2500);
