(function () {
    var backgrounds = ['bg_banboo.png', 'bg_ju.png', 'bg_lan.png', 'bg_lian.png', 'bg_mei.png'];
    var grace = 12;
    var activeRoute = 'literature';
    var currentQuestion = 0;
    var answered = false;
    var questionBank = {
        literature: { label: '艺苑 · 品鉴', title: '雪夜访戴', source: '王子猷居山阴。夜大雪，眠觉，开室命酌酒。', translation: '王子猷住在山阴。一天夜里下大雪，他睡醒后，打开房门，命人斟酒。', question: '此时的王子猷，为何忽然乘舟而返？', note: '“兴尽”不是扫兴，而是兴致已经满足。理解语气，才能读懂人物。', choices: ['因为夜雪太大，担心舟行不安全。', '因为想起戴安道，乘兴而去；到了门口，兴致已尽便返回。', '因为忽然想起还有政务，不能久留。'], correct: 1, explanation: '关键在“兴尽”：他访友为乘兴而往，兴尽而返，不求相见，正是名士的率真与自得。' },
        mountain: { label: '山林 · 隐逸', title: '刘伶病酒', source: '刘伶恒纵酒放达，或脱衣裸形在屋中。人见讥之，伶曰：“我以天地为栋宇，屋室为裈衣。”', translation: '刘伶常常纵情饮酒，放任旷达，有时脱掉衣服裸身在屋中。有人讥笑他，他说：“我把天地当作屋宇，把屋子当作裤子。”', question: '这段文字主要写刘伶怎样的性情？', note: '“放达”不是简单的任性，而是魏晋语境中对礼法边界的反思。', choices: ['以奇异行为博取众人喝彩。', '借酒逃避一切责任，不关心世事。', '以旷达姿态回应世俗目光，体现任诞中的自我表达。'], correct: 2, explanation: '“放达”需要放回时代语境理解。文本写的是人物对世俗礼法的独特回应，不应简单模仿或美化饮酒行为。' },
        court: { label: '庙堂 · 政事', title: '陈元方责友', source: '友人惭，下车引之。元方入门不顾。', translation: '友人感到惭愧，下车想拉住陈元方。元方走进家门，头也不回。', question: '元方“入门不顾”表现出怎样的判断？', note: '“方正”首先是辨明是非、守住原则，并非只看待人是否圆融。', choices: ['他因为年幼任性，不愿意与长者交谈。', '他认为友人失信失礼，已经没有再辩解的必要。', '他急着回家读书，不愿耽误时间。'], correct: 1, explanation: '友人先失约又在孩子父亲面前失礼，元方以“无信”“无礼”责之。“入门不顾”是对失礼行为的明确判断。' },
        bearing: { label: '容止 · 风仪', title: '东床坦腹', source: '郗太傅在京口，遣门生与王丞相书，求女婿。门生归，白郗曰：“王家诸郎亦皆可嘉，闻来觅婿，咸自矜持。”', translation: '郗太傅在京口，派门生给王丞相送信，想为女儿求一位女婿。门生回来报告：“王家的几个公子都很好，听说来选女婿，都显得拘谨矜持。”', question: '故事为何独独注意到“坦腹东床”的王羲之？', note: '“坦腹”写的是不拘小节的自然姿态，人物的风仪由细节显现。', choices: ['因为他衣着最华贵，身份最高。', '因为他完全不在意选婿，显得自然真率，不矫饰。', '因为他故意用失礼姿态拒绝郗太傅。'], correct: 1, explanation: '众人“咸自矜持”，只有王羲之坦腹而卧，反而显出自然真率。容止描写的重点，在姿态背后的性情。' }
    };
    var routeButtons = document.querySelectorAll('.route-button');
    var choiceList = document.getElementById('choice-list');
    var feedback = document.getElementById('feedback');
    var continueButton = document.getElementById('continue-button');

    function setRandomBackground() {
        var background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        document.querySelector('.game-page').style.setProperty('--game-background', "url('../assets/images/" + background + "')");
    }

    function renderQuestion() {
        var data = questionBank[activeRoute];
        answered = false;
        document.getElementById('route-label').textContent = data.label;
        document.getElementById('chapter-progress').textContent = '研读 0' + (currentQuestion + 1) + ' / 03';
        document.getElementById('story-title').textContent = data.title;
        document.getElementById('source-line').textContent = data.source;
        document.getElementById('translation').textContent = data.translation;
        document.getElementById('question-title').textContent = data.question;
        document.getElementById('lesson-note').textContent = data.note;
        feedback.hidden = true;
        continueButton.hidden = true;
        choiceList.innerHTML = data.choices.map(function (choice, index) { return '<button class="choice" data-index="' + index + '"><span>' + String.fromCharCode(65 + index) + '</span><strong>' + choice + '</strong><i>→</i></button>'; }).join('');
        choiceList.querySelectorAll('.choice').forEach(function (button) { button.addEventListener('click', chooseAnswer); });
    }

    function chooseAnswer(event) {
        if (answered) return;
        answered = true;
        var data = questionBank[activeRoute];
        var selected = Number(event.currentTarget.dataset.index);
        choiceList.querySelectorAll('.choice').forEach(function (button, index) { button.disabled = true; if (index === data.correct) button.classList.add('is-correct'); if (index === selected && index !== data.correct) button.classList.add('is-wrong'); });
        if (selected === data.correct) { grace += 6; document.getElementById('grace-value').textContent = grace; feedback.className = 'feedback is-success'; feedback.innerHTML = '<strong>理解得其正。</strong><p>' + data.explanation + '</p><span>风度 + 6</span>'; } else { feedback.className = 'feedback is-revise'; feedback.innerHTML = '<strong>先别急着下结论。</strong><p>' + data.explanation + '</p><span>进入复习模式</span>'; }
        feedback.hidden = false;
        continueButton.hidden = false;
    }

    routeButtons.forEach(function (button) { button.addEventListener('click', function () { routeButtons.forEach(function (item) { item.classList.remove('is-active'); }); button.classList.add('is-active'); activeRoute = button.dataset.route; currentQuestion = 0; renderQuestion(); }); });
    continueButton.addEventListener('click', function () { currentQuestion = (currentQuestion + 1) % 3; renderQuestion(); });
    document.getElementById('mentor-button').addEventListener('click', function (event) { var button = event.currentTarget; if (grace < 3 || button.disabled) return; grace -= 3; document.getElementById('grace-value').textContent = grace; button.disabled = true; button.innerHTML = '请教完成 <span>已记入札记</span>'; document.getElementById('lesson-note').textContent = '谢道韫批注：所谓风流，不是逃离世事，而是在一念之间保有清醒。'; });
    setRandomBackground();
    renderQuestion();
}());