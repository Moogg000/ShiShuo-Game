(function () {
    var routeKey = document.body.className.match(/route-(literature|mountain|court|bearing)/)[1];
    var routeData = {
        literature: {
            label: '艺苑 · 品鉴', title: '在辞章之间，听见人物的心声', footer: '雅量',
            lessons: [
                { title: '雪夜访戴', source: '王子猷居山阴。夜大雪，眠觉，开室命酌酒。', translation: '王子猷住在山阴。夜里大雪，他睡醒后打开房门，命人斟酒。', question: '王子猷为何乘兴而去，兴尽而返？', choices: ['因为风雪太大，不便久留。', '因为访友只为乘兴，到了门口兴致已尽。', '因为忽然想起政务未完。'], answer: 1, explain: '“兴尽”是兴致得到满足，并非扫兴。人物不求相见而返，显出率真自得。' },
                { title: '咏絮之才', source: '白雪纷纷何所似？兄子胡儿曰：“撒盐空中差可拟。”兄女曰：“未若柳絮因风起。”', translation: '白雪纷纷像什么？胡儿说像把盐撒在空中。谢道韫说不如比作柳絮乘风飞舞。', question: '谢道韫的回答好在哪里？', choices: ['只因为柳絮比盐更洁白。', '以柳絮的动态和轻盈写出雪的神韵。', '因为她回答得比兄长更快。'], answer: 1, explain: '“因风起”不只写颜色，更写雪花飞舞的姿态，体现比喻中的动态审美。' },
                { title: '三语掾', source: '桓南郡每见人不快，辄嗔云：“君得哀家梨，当复不嚼也。”', translation: '桓南郡每当见人不称心，就责备说：“你得到鲜美的哀家梨，难道还会不咀嚼吗？”', question: '这句话借“哀家梨”表达什么？', choices: ['赞美梨子味道鲜美。', '比喻好的言语或机会应当认真体会。', '讽刺别人吃东西太慢。'], answer: 1, explain: '“得哀家梨”借物喻理，意在提醒人面对好的事物不能囫囵吞枣。' }
            ]
        },
        mountain: {
            label: '山林 · 隐逸', title: '在山水与任诞之间，辨认自我', footer: '任诞',
            lessons: [
                { title: '刘伶病酒', source: '刘伶恒纵酒放达，或脱衣裸形在屋中。', translation: '刘伶常常纵情饮酒、放任旷达，有时在屋中脱衣裸身。', question: '“放达”应当如何放回历史语境理解？', choices: ['就是鼓励后人随意饮酒。', '是人物对世俗礼法边界的独特回应。', '说明刘伶完全不关心世事。'], answer: 1, explain: '文本写任诞姿态背后的价值张力，不能把历史现象简单变成可模仿的生活方式。' },
                { title: '雪夜访戴', source: '即便门不通，亦欲乘兴而去。', translation: '即使知道门路不通，也还是想趁着兴致乘船前往。', question: '“乘兴”在这里最接近什么？', choices: ['一时冲动，不计后果。', '由景物和情感激发的雅兴。', '为了炫耀自己的洒脱。'], answer: 1, explain: '“兴”是审美与交游中由情境激发的兴致，不能简单解释成冲动或任性。' },
                { title: '支公好鹤', source: '支公好鹤，住剡东，畜一群鹤。', translation: '支遁喜爱鹤，住在剡县东边，养了一群鹤。', question: '“好鹤”在名士故事中还寄托了什么？', choices: ['只说明他喜欢饲养动物。', '借清远之物寄托对高洁、自由品格的欣赏。', '说明鹤是当时最贵重的宠物。'], answer: 1, explain: '鹤在传统文化中常与清远、高洁相连，文本也借此呈现人物的审美趣味。' }
            ]
        },
        court: {
            label: '庙堂 · 方正', title: '在言语交锋中，守住是非的尺度', footer: '方正',
            lessons: [
                { title: '陈元方责友', source: '日中不至，则是无信；对子骂父，则是无礼。', translation: '正午不到，就是不讲信用；当着孩子的面骂父亲，就是没有礼貌。', question: '元方责友的依据是什么？', choices: ['只因为友人年纪比他大。', '友人既失信，又当面失礼。', '因为父亲要求他这样做。'], answer: 1, explain: '元方的判断建立在“信”与“礼”两条明确标准上，体现方正而非任性。' },
                { title: '小时了了', source: '小时了了，大未必佳。', translation: '小时候聪明，长大后未必出众。', question: '孔融怎样回应这句带有试探的话？', choices: ['直接哭泣离开。', '以机敏反问，指出对方也可能是小时候聪明。', '沉默不作回答。'], answer: 1, explain: '孔融借对方的话反转回去，既有逻辑又有机锋，是言语应对中的方正与敏捷。' },
                { title: '陈太丘与友期', source: '君与家君期日中。日中不至，则是无信。', translation: '您和我父亲约定正午见面，正午却没有到，就是不讲信用。', question: '这段话最重要的表达方式是什么？', choices: ['用事实和判断构成清晰的论辩。', '用夸张故事博取同情。', '用委婉语气回避冲突。'], answer: 0, explain: '元方先陈述约定，再推出失信的判断，论辩层次清楚，语言简洁有力。' }
            ]
        },
        bearing: {
            label: '容止 · 风仪', title: '从一个姿态，读出人物的精神气象', footer: '容止',
            lessons: [
                { title: '东床坦腹', source: '唯有王郎在东床上坦腹卧，如不闻。', translation: '只有王羲之在东床上袒腹而卧，好像没有听见选婿之事。', question: '“坦腹”为何成为人物风仪的关键？', choices: ['因为他衣着最华贵。', '因为他的自然真率与众人的矜持形成对照。', '因为他故意失礼以拒绝婚事。'], answer: 1, explain: '众人都拘谨，王羲之却自然坦腹，细节显出不矫饰的精神气度。' },
                { title: '看杀卫玠', source: '京师人士闻其姿容，观者如堵墙。', translation: '京城人听说卫玠姿容出众，观看的人多得像墙一样。', question: '这段描写除了写容貌，还写了什么？', choices: ['写人物声望与社会观看的热烈。', '写卫玠喜欢被人围观。', '写京城城墙十分高大。'], answer: 0, explain: '“观者如堵墙”用夸张写出人物声名与公众凝视，也暗含外貌成为社会话题的现象。' },
                { title: '傅粉何郎', source: '何平叔美姿仪，面至白，魏明帝疑其傅粉。', translation: '何晏姿态容貌很美，脸色极白，魏明帝怀疑他涂了粉。', question: '这则故事的重点是什么？', choices: ['考证古人是否使用妆粉。', '通过容貌细节表现人物的风仪与时代审美。', '说明魏明帝不喜欢白色。'], answer: 1, explain: '文本借面色、姿仪等细节塑造人物，也让读者看到魏晋社会对容止的关注。' }
            ]
        }
    };
    var data = routeData[routeKey];
    var index = 0;
    var grace = 12;
    var answered = false;
    var app = document.getElementById('route-app');
    var backgrounds = ['bg_banboo.png', 'bg_ju.png', 'bg_lan.png', 'bg_lian.png', 'bg_mei.png'];
    document.body.style.setProperty('--game-background', "url('../assets/images/" + backgrounds[Math.floor(Math.random() * backgrounds.length)] + "')");

    app.innerHTML = '<header class="game-header"><a class="brand-mark" href="start.html" aria-label="返回线路总览"><span>世说</span><small>风流志</small></a><div class="header-title"><p>研学线路 / ' + data.label + '</p><h1>' + data.title + '</h1></div><div class="grace-meter"><span>风度</span><strong id="grace-value">12</strong><i>✦</i></div></header><main class="game-layout"><aside class="route-rail"><div class="rail-heading"><span>本卷三题</span><small>03 LESSONS</small></div><nav class="lesson-nav"><button class="lesson-tab is-active" data-index="0">第一题<em>01</em></button><button class="lesson-tab" data-index="1">第二题<em>02</em></button><button class="lesson-tab" data-index="2">第三题<em>03</em></button></nav><div class="rail-note"><span class="seal">知</span><p>读原文，<br>辨其意。</p></div></aside><section class="study-stage"><div class="stage-topline"><span>' + data.label + '</span><span id="chapter-progress">研读 01 / 03</span></div><article class="text-card"><div class="card-meta"><span>今日精读</span><span class="tag">原文</span></div><h2 id="story-title"></h2><p class="source-line" id="source-line"></p><p class="translation" id="translation"></p></article><section class="choice-section" aria-live="polite"><div class="choice-heading"><div><span class="overline">情境抉择</span><h3 id="question-title"></h3></div><span class="choice-count">选择你的理解</span></div><div class="choice-list" id="choice-list"></div><div class="feedback" id="feedback" hidden></div><button class="continue-button" id="continue-button" hidden>继续研读 <span>→</span></button></section></section><aside class="mentor-panel"><div class="mentor-header"><span class="overline">名士请教</span><span class="mentor-status">2 位可请教</span></div><div class="mentor-card"><div class="mentor-portrait"><span>谢</span><i>✦</i></div><h2>谢道韫</h2><p class="mentor-role">文学 · 雅量</p><p class="mentor-copy">从比喻、风神与女性书写的角度，帮你读懂字句。</p><button class="mentor-button" data-mentor="谢道韫">请教她 <span>＋ 3</span></button></div><div class="mentor-card"><div class="mentor-portrait mentor-portrait-court"><span>陈</span><i>✦</i></div><h2>陈太丘</h2><p class="mentor-role">方正 · 言语</p><p class="mentor-copy">从信、礼与论辩的角度，帮你厘清人物判断。</p><button class="mentor-button" data-mentor="陈太丘">请教他 <span>＋ 3</span></button></div><div class="lesson-note"><span>本卷札记</span><p id="lesson-note">先读原文，再让选择回答你的理解。</p></div></aside></main><footer class="game-footer"><span>《世说新语》 · ' + data.footer + '</span><span>无战力 / 无排行榜 / 只以理解抵达</span></footer>';

    function renderLesson() {
        var lesson = data.lessons[index];
        answered = false;
        document.getElementById('chapter-progress').textContent = '研读 0' + (index + 1) + ' / 03';
        document.getElementById('story-title').textContent = lesson.title;
        document.getElementById('source-line').textContent = lesson.source;
        document.getElementById('translation').textContent = lesson.translation;
        document.getElementById('question-title').textContent = lesson.question;
        document.getElementById('lesson-note').textContent = '先读原文，再让选择回答你的理解。';
        document.getElementById('feedback').hidden = true;
        document.getElementById('continue-button').hidden = true;
        document.querySelectorAll('.lesson-tab').forEach(function (tab, tabIndex) { tab.classList.toggle('is-active', tabIndex === index); });
        document.getElementById('choice-list').innerHTML = lesson.choices.map(function (choice, choiceIndex) { return '<button class="choice" data-index="' + choiceIndex + '"><span>' + String.fromCharCode(65 + choiceIndex) + '</span><strong>' + choice + '</strong><i>→</i></button>'; }).join('');
        document.querySelectorAll('.choice').forEach(function (choice) { choice.addEventListener('click', chooseAnswer); });
    }

    function chooseAnswer(event) {
        if (answered) return;
        answered = true;
        var lesson = data.lessons[index];
        var selected = Number(event.currentTarget.dataset.index);
        document.querySelectorAll('.choice').forEach(function (choice, choiceIndex) { choice.disabled = true; if (choiceIndex === lesson.answer) choice.classList.add('is-correct'); if (choiceIndex === selected && choiceIndex !== lesson.answer) choice.classList.add('is-wrong'); });
        var feedback = document.getElementById('feedback');
        if (selected === lesson.answer) { grace += 6; document.getElementById('grace-value').textContent = grace; feedback.className = 'feedback is-success'; feedback.innerHTML = '<strong>理解得其正。</strong><p>' + lesson.explain + '</p><span>风度 + 6</span>'; } else { feedback.className = 'feedback is-revise'; feedback.innerHTML = '<strong>进入复习模式。</strong><p>' + lesson.explain + '</p><span>请对照原文再读一遍</span>'; }
        feedback.hidden = false;
        document.getElementById('continue-button').hidden = false;
    }

    document.querySelectorAll('.lesson-tab').forEach(function (tab) { tab.addEventListener('click', function () { index = Number(tab.dataset.index); renderLesson(); }); });
    document.getElementById('continue-button').addEventListener('click', function () { index = (index + 1) % data.lessons.length; renderLesson(); });
    document.querySelectorAll('.mentor-button').forEach(function (button) { button.addEventListener('click', function () { if (button.disabled || grace < 3) return; grace -= 3; document.getElementById('grace-value').textContent = grace; button.disabled = true; button.innerHTML = '请教完成 <span>已记入札记</span>'; document.getElementById('lesson-note').textContent = button.dataset.mentor + '提醒你：回到原文，证据总在字句之间。'; }); });
    renderLesson();
}());