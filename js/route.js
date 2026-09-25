(function () {
    var gameLayout = document.querySelector('.game-layout');
    var routeKey = gameLayout.dataset.route;
    var lessons = Array.from(document.querySelectorAll('.lesson'));
    var tabs = Array.from(document.querySelectorAll('.lesson-tab'));
    var completionPanel = document.querySelector('.completion-panel');
    var lessonList = document.querySelector('.lesson-list');
    var progress = document.getElementById('chapter-progress');
    var adviceNote = document.querySelector('.lesson-note p');
    var currentIndex = 0;
    var results = lessons.map(function () { return null; });
    var correctCount = 0;
    var lessonCount = lessons.length;
    var adviceCost = 3;
    var resultsStorageKey = 'shishuo-results-' + routeKey;
    var backgrounds = ['bg_banboo.png', 'bg_ju.png', 'bg_lan.png', 'bg_lian.png', 'bg_mei.png'];

    var answerData = {
        mountain: {
            'mountain-q1': {
                answer: 1,
                explain: '文本写任诞姿态背后的价值张力，不能把历史现象简单变成可模仿的生活方式。',
                advice: {
                    '谢道韫': '“放达”不是一句轻率的赞美。先看“恒”“或”等字，再看刘伶如何用身体姿态回应礼法边界。',
                    '王羲之': '刘伶的行为有不矫饰的一面，却不能因此说他完全脱离世事；判断人物，要把姿态和语境放在一起。'
                }
            },
            'mountain-q2': {
                answer: 1,
                explain: '“兴”是审美与交游中由情境激发的兴致，不能简单解释成冲动或任性。',
                advice: {
                    '谢道韫': '“乘兴”由雪夜、思友和当下情境共同生发，重点是情感与景物相遇后的雅兴。',
                    '王羲之': '兴尽而返并不等于后悔或鲁莽，王子猷把交游的心意放在相见之前。'
                }
            },
            'mountain-q3': {
                answer: 1,
                explain: '鹤在传统文化中常与清远、高洁相连，文本也借此呈现人物的审美趣味。',
                advice: {
                    '谢道韫': '“好鹤”先是一个具体爱好，但清远之物也会成为人物精神趣味的投影，不能只作宠物来读。',
                    '王羲之': '支公与鹤的关系让人物显得疏朗自由；读名士小事，要留意物与人的气质如何互相映照。'
                }
            }
        },
        court: {
            'court-q1': {
                answer: 1,
                explain: '元方的判断建立在“信”与“礼”两条明确标准上，体现方正而非任性。',
                advice: {
                    '谢道韫': '元方没有只凭情绪责备友人，而是先指出“无信”，再指出“无礼”，两层判断都紧扣原文。',
                    '王羲之': '方正不等于逞强。元方的力量来自清楚的事实和尺度，而不是来自身份或声量。'
                }
            },
            'court-q2': {
                answer: 1,
                explain: '孔融借对方的话反转回去，既有逻辑又有机锋，是言语应对中的方正与敏捷。',
                advice: {
                    '谢道韫': '孔融没有被“小时了了”牵着走，而是把判断的标准反问回去，机锋建立在句式的回转上。',
                    '王羲之': '这句回应看似顽皮，实则保持了人物的主动和分寸；好的应对不是只求尖刻，而是让对方重新面对自己的话。'
                }
            },
            'court-q3': {
                answer: 0,
                explain: '元方先陈述约定，再推出失信的判断，论辩层次清楚，语言简洁有力。',
                advice: {
                    '谢道韫': '“期日中”是事实，“不至”是变化，“无信”是判断，三步连起来，论辩自然就站稳了。',
                    '王羲之': '方正的语言不必繁复。把约定、事实和结论排清楚，便能在冲突中守住自己的尺度。'
                }
            }
        }
    };

    function currentLessonId() {
        return lessons[currentIndex].dataset.questionId;
    }

    function loadResults() {
        var storedResults;
        try {
            storedResults = JSON.parse(localStorage.getItem(resultsStorageKey));
        } catch (error) {
            storedResults = null;
        }
        if (!Array.isArray(storedResults)) return;

        results = lessons.map(function (lesson, lessonIndex) {
            var storedResult = storedResults[lessonIndex];
            if (!storedResult || !Number.isInteger(storedResult.selected) || storedResult.selected < 0 || storedResult.selected > 2) {
                return null;
            }
            var answer = answerData[routeKey][lesson.dataset.questionId].answer;
            var correct = storedResult.selected === answer;
            if (correct) correctCount += 1;
            return { selected: storedResult.selected, correct: correct };
        });
    }

    function readStorage(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function writeStorage(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
        }
    }

    function setBackground() {
        var background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        document.body.style.setProperty('--game-background', "url('../assets/images/" + background + "')");
    }

    function showLesson(index) {
        if (completionPanel.hidden === false) return;
        currentIndex = index;
        lessons.forEach(function (lesson, lessonIndex) {
            lesson.hidden = lessonIndex !== index;
            lesson.classList.toggle('is-active', lessonIndex === index);
        });
        tabs.forEach(function (tab, tabIndex) {
            tab.classList.toggle('is-active', tabIndex === index);
        });
        progress.textContent = '研读 0' + (index + 1) + ' / 0' + lessonCount;
        renderResult(index);
        adviceNote.textContent = '先读原文，再让选择回答你的理解。';
        updateMentorButtons();
    }

    function renderResult(index) {
        var lesson = lessons[index];
        var feedback = lesson.querySelector('.feedback');
        var translation = lesson.querySelector('.translation');
        var continueButton = lesson.querySelector('.continue-button');
        var choices = Array.from(lesson.querySelectorAll('.choice'));
        var result = results[index];
        var answer = answerData[routeKey][lesson.dataset.questionId].answer;
        choices.forEach(function (choice, choiceIndex) {
            choice.disabled = result !== null;
            choice.classList.remove('is-correct', 'is-wrong');
            if (result !== null && choiceIndex === answer) choice.classList.add('is-correct');
            if (result !== null && choiceIndex === result.selected && choiceIndex !== answer) choice.classList.add('is-wrong');
        });
        if (result === null) {
            translation.hidden = true;
            feedback.hidden = true;
            feedback.innerHTML = '';
            continueButton.hidden = true;
            return;
        }
        translation.hidden = false;
        feedback.className = result.correct ? 'feedback is-success' : 'feedback is-revise';
        feedback.innerHTML = result.correct
            ? '<strong>理解得其正。</strong><p>' + answerData[routeKey][lesson.dataset.questionId].explain + '</p><span>风度 + 6</span>'
            : '<strong>进入复习模式。</strong><p>' + answerData[routeKey][lesson.dataset.questionId].explain + '</p><span>请对照原文再读一遍</span>';
        feedback.hidden = false;
        continueButton.hidden = index >= lessonCount - 1;
    }

    function chooseAnswer(event) {
        var lesson = event.currentTarget.closest('.lesson');
        var lessonIndex = lessons.indexOf(lesson);
        if (results[lessonIndex] !== null) return;
        var selected = Number(event.currentTarget.dataset.choiceIndex);
        var correct = selected === answerData[routeKey][lesson.dataset.questionId].answer;
        results[lessonIndex] = { selected: selected, correct: correct };
        if (correct) {
            correctCount += 1;
            window.ShiShuoState.addGrace(6);
        }
        writeStorage(resultsStorageKey, JSON.stringify(results));
        currentIndex = lessonIndex;
        renderResult(lessonIndex);
        updateMentorButtons();
        if (results.every(function (result) { return result !== null; })) renderCompletion();
    }

    function renderCompletion() {
        lessonList.hidden = true;
        completionPanel.hidden = false;
        progress.textContent = '研读完成 / 0' + lessonCount;
        document.querySelector('.completion-score').textContent = '答对 ' + correctCount + ' / ' + lessonCount + ' 题，正确率：' + Math.round(correctCount / lessonCount * 100) + '%';
        tabs.forEach(function (tab) { tab.disabled = true; });
    }

    function adviceStorageKey(mentor) {
        return 'shishuo-advice-' + routeKey + '-' + currentLessonId() + '-' + mentor;
    }

    function updateMentorButtons() {
        document.querySelectorAll('.mentor-button').forEach(function (button) {
            var used = readStorage(adviceStorageKey(button.dataset.mentor)) === '1';
            button.disabled = used || window.ShiShuoState.getGrace() < adviceCost;
            if (used) button.innerHTML = '请教完成 <span>已记入札记</span>';
        });
    }

    function askMentor(event) {
        var button = event.currentTarget;
        var mentor = button.dataset.mentor;
        var key = adviceStorageKey(mentor);
        if (readStorage(key) === '1') return;
        if (!window.ShiShuoState.spendGrace(adviceCost)) {
            adviceNote.textContent = '风度不足，暂时无法请教这位名士。';
            updateMentorButtons();
            return;
        }
        writeStorage(key, '1');
        adviceNote.textContent = mentor + '说：' + answerData[routeKey][currentLessonId()].advice[mentor];
        button.disabled = true;
        button.innerHTML = '请教完成 <span>已记入札记</span>';
        updateMentorButtons();
    }

    setBackground();
    tabs.forEach(function (tab) { tab.addEventListener('click', function () { showLesson(Number(tab.dataset.index)); }); });
    document.querySelectorAll('.choice').forEach(function (choice) { choice.addEventListener('click', chooseAnswer); });
    document.querySelectorAll('.continue-button').forEach(function (button) {
        button.addEventListener('click', function () { showLesson(currentIndex + 1); });
    });
    document.querySelectorAll('.mentor-button').forEach(function (button) { button.addEventListener('click', askMentor); });
    completionPanel.hidden = true;
    window.ShiShuoState.refresh();
    loadResults();
    var firstUnanswered = results.findIndex(function (result) { return result === null; });
    if (firstUnanswered === -1) {
        renderCompletion();
    } else {
        showLesson(firstUnanswered);
    }
}());
