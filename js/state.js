(function () {
    const storageKey = 'shishuo-grace';
    // 回退配置：config.json 尚未加载完成或加载失败时使用。
    let activeConfig = {
        grace: { initial: 12 },
        backgrounds: { pages: ['bg_banboo.png', 'bg_ju.png', 'bg_lan.png', 'bg_lian.png', 'bg_mei.png'] }
    };

    function initialGrace() {
        return Math.max(0, Number(activeConfig.grace.initial) || 0);
    }

    function readGrace() {
        let storedValue;
        try {
            storedValue = localStorage.getItem(storageKey);
        } catch (error) {
            console.warn('localStorage 不可用:', error);
            return initialGrace();
        }
        if (storedValue === null) return initialGrace();
        const storedGrace = Number(storedValue);
        return Number.isFinite(storedGrace) && storedGrace >= 0 ? storedGrace : initialGrace();
    }

    function writeGrace(value) {
        const grace = Math.max(0, Math.floor(Number(value) || 0));
        try {
            localStorage.setItem(storageKey, String(grace));
        } catch (error) {
            console.warn('localStorage 不可用:', error);
        }
        updateDisplays(grace);
        return grace;
    }

    function updateDisplays(grace) {
        document.querySelectorAll('[data-grace-value], #grace-value').forEach(function (element) {
            element.textContent = grace;
        });
    }

    window.ShiShuoBackgrounds = activeConfig.backgrounds.pages;

    window.ShiShuoState = {
        getGrace: readGrace,
        setGrace: writeGrace,
        addGrace: function (amount) {
            return writeGrace(readGrace() + Number(amount || 0));
        },
        spendGrace: function (amount) {
            const cost = Math.max(0, Number(amount) || 0);
            const currentGrace = readGrace();
            if (currentGrace < cost) return false;
            writeGrace(currentGrace - cost);
            return true;
        },
        refresh: function () {
            updateDisplays(readGrace());
        }
    };

    updateDisplays(readGrace());

    // 配置就绪后应用集中配置（风度初始值与背景候选列表）。
    window.ShiShuoConfigReady.then(function (config) {
        activeConfig = config;
        window.ShiShuoBackgrounds = config.backgrounds.pages;
        updateDisplays(readGrace());
    });
}());
