(function () {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const loadingProgress = document.getElementById('loading-progress');
    const loadingPercent = document.getElementById('loading-percent');
    const loadingScreen = document.getElementById('loading-screen');
    const loadingTrack = document.querySelector('.loading-track');
    let bgReady = false;
    let fontReady = false;

    const bg = new Image();

    function drawTitleScreen() {
        if (!ctx) return;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const imageRatio = bg.naturalWidth / bg.naturalHeight;
        const viewportRatio = viewportWidth / viewportHeight;
        let drawWidth = viewportWidth;
        let drawHeight = viewportHeight;
        let offsetX = 0;
        let offsetY = 0;

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
        const progress = Math.max(0, Math.min(100, Math.round(value)));

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
        const progress = (bgReady ? 50 : 0) + (fontReady ? 50 : 0);

        setLoadingProgress(progress);

        if (bgReady && fontReady) {
            drawTitleScreen();
            loadingScreen.classList.remove('is-visible');
            return;
        }

        loadingScreen.classList.add('is-visible');
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
    bg.onerror = function () {
        console.warn('首页背景加载失败，将使用纯色背景。');
        markBackgroundReady();
    };
    window.ShiShuoConfigReady.then(function (config) {
        bg.src = (config.backgrounds && config.backgrounds.title) || 'assets/images/bg.png';
    });

    if (document.fonts && document.fonts.load) {
    document.fonts.load('600 1rem "Chill Jinshu Song"')
        .then(markFontReady, markFontReady);
    } else {
        markFontReady();
    }

    window.addEventListener('resize', function () {
        if (bgReady && fontReady) drawTitleScreen();
    });

    const SAVE_KEY = 'shishuo-book-v1';

    // 是否玩过：以编书人玩法的存档为准（完成第一章受命后即写入存档）。
    function hasPlayed() {
        try {
            return localStorage.getItem(SAVE_KEY) !== null;
        } catch (error) {
            console.warn('localStorage 不可用，跳过新玩家引导：', error);
            return true;
        }
    }

    const guard = document.getElementById('intro-guard');
    const btnStart = document.getElementById('btn-start');

    function openGuard() {
        guard.hidden = false;
        document.getElementById('guard-read').focus();
    }

    function closeGuard() {
        guard.hidden = true;
        btnStart.focus();
    }

    document.getElementById('guard-read').addEventListener('click', function () {
        window.location.href = 'intro.html';
    });

    document.getElementById('guard-skip').addEventListener('click', function () {
        window.location.href = 'origin.html';
    });

    document.getElementById('guard-close').addEventListener('click', closeGuard);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !guard.hidden) closeGuard();
    });

    btnStart.addEventListener('click', function () {
        if (!hasPlayed()) {
            openGuard();
            return;
        }
        window.location.href = 'origin.html';
    });

    document.getElementById('btn-intro').addEventListener('click', function () {
        window.location.href = 'intro.html';
    });
}());