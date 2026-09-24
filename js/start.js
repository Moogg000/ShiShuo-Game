var backgrounds = ['bg_banboo.png', 'bg_ju.png', 'bg_lan.png', 'bg_lian.png', 'bg_mei.png'];
var selectedBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
document.body.style.setProperty('--game-background', "url('../assets/images/" + selectedBackground + "')");
