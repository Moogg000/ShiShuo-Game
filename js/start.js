(function () {
	window.ShiShuoConfigReady.then(function (config) {
		const backgrounds = (config.backgrounds && config.backgrounds.pages) || [];
		if (backgrounds.length === 0 || !document.body) {
			console.warn('没有可用的页面背景。');
			return;
		}

		const selectedBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
		try {
			document.body.style.setProperty('--game-background', "url('../assets/images/" + selectedBackground + "')");
		} catch (error) {
			console.warn('无法设置背景:', error);
		}
	});
}());