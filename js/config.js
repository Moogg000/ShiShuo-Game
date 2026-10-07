(function () {
    // 集中配置加载器：读取 config.json，失败时回退到内置默认配置。
    // 所有页面脚本通过 window.ShiShuoConfigReady 获取配置。
    const defaultConfig = {
        grace: {
            initial: 12,
            correctAnswerBonus: 6,
            adviceCost: 3
        },
        backgrounds: {
            title: 'assets/images/bg.png',
            pages: ['bg_banboo.png', 'bg_ju.png', 'bg_lan.png', 'bg_lian.png', 'bg_mei.png']
        }
    };

    function mergeConfig(base, override) {
        const isPlainObject = function (value) {
            return value !== null && typeof value === 'object' && !Array.isArray(value);
        };
        if (!isPlainObject(base) || !isPlainObject(override)) {
            return override === undefined ? base : override;
        }
        const merged = {};
        Object.keys(base).forEach(function (key) {
            merged[key] = mergeConfig(base[key], override[key]);
        });
        Object.keys(override).forEach(function (key) {
            if (!(key in merged)) merged[key] = override[key];
        });
        return merged;
    }

    const request = fetch('config.json')
        .then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .catch(function (error) {
            console.warn('config.json 加载失败，使用内置默认配置：', error);
            return null;
        });

    window.ShiShuoConfigReady = request.then(function (loaded) {
        const config = loaded ? mergeConfig(defaultConfig, loaded) : defaultConfig;
        window.ShiShuoConfig = config;
        return config;
    });
}());
