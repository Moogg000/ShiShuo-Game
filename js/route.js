(function () {
    const gameLayout = document.querySelector('.game-layout');
    const routeKey = gameLayout ? gameLayout.dataset.route : '';
    const lessonNav = document.querySelector('.lesson-nav');
    const lessonList = document.querySelector('.lesson-list');
    const completionPanel = document.querySelector('.completion-panel');
    const progress = document.getElementById('chapter-progress');
    const adviceNote = document.querySelector('.lesson-note p');

    const chineseNumerals = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

    function padTwo(value) {
        return String(value).padStart(2, '0');
    }

    function numeralFor(count) {
        return count >= 1 && count <= chineseNumerals.length ? chineseNumerals[count - 1] : String(count);
    }

    function loadRouteData() {
        return fetch('data/routes.json').then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        });
    }

    Promise.all([window.ShiShuoConfigReady, loadRouteData()])
        .then(function (loaded) { init(loaded[0], loaded[1]); })
        .catch(function (error) {
            console.error('线路题目数据加载失败：', error);
            if (progress) progress.textContent = '数据加载失败';
            if (adviceNote) adviceNote.textContent = '题目数据加载失败，请通过本地服务器访问后刷新重试。';
        });

    function init(config, routesData) {
        const lessonsData = routesData[routeKey];
        if (!Array.isArray(lessonsData) || lessonsData.length === 0 || !lessonList || !lessonNav || !completionPanel) {
            console.error('未找到线路题目数据：' + routeKey);
            if (progress) progress.textContent = '数据缺失';
            return;
        }

        const adviceCost = Math.max(0, Number(config.grace.adviceCost) || 0);
        const correctBonus = Math.max(0, Number(config.grace.correctAnswerBonus) || 0);
        const resultsStorageKey = 'shishuo-results-' + routeKey;
        const lessonCount = lessonsData.length;

        let currentIndex = 0;
        let results = [];
        let correctCount = 0;
        let lessons = [];
        let tabs = [];

        // 依据数据更新页面上的计数文案（侧栏标题与请教消耗）。
        const mentorStatus = document.querySelector('.mentor-status');
        if (mentorStatus) mentorStatus.textContent = '每次请教 - ' + adviceCost + ' 风度';
        const railHeading = document.querySelector('.rail-heading');
        if (railHeading) {
            const railCount = railHeading.querySelector('span');
            const railLabel = railHeading.querySelector('small');
            if (railCount) railCount.textContent = '本卷' + numeralFor(lessonCount) + '题';
            if (railLabel) railLabel.textContent = padTwo(lessonCount) + ' LESSONS';
        }

        function lessonDataById(questionId) {
            return lessonsData.find(function (item) { return item.id === questionId; });
        }

        function buildChoiceButtons(lessonData) {
            return lessonData.choices.map(function (choiceText, choiceIndex) {
                return '<button class="choice" data-choice-index="' + choiceIndex + '"><span>'
                    + String.fromCharCode(65 + choiceIndex)
                    + '</span><strong>' + choiceText + '</strong><i>→</i></button>';
            }).join('');
        }

        function buildLesson(lessonData, index) {
            const article = document.createElement('article');
            article.className = 'lesson text-card' + (index === 0 ? ' is-active' : '');
            if (index !== 0) article.hidden = true;
            article.dataset.questionId = lessonData.id;
            article.innerHTML =
                '<div class="card-meta"><span>今日精读</span><span class="tag">原文</span></div>'
                + '<h2>' + lessonData.title + '</h2>'
                + '<p class="source-line">' + lessonData.source + '</p>'
                + '<p class="translation" hidden>' + lessonData.translation + '</p>'
                + '<section class="choice-section" aria-live="polite">'
                + '<div class="choice-heading"><div><span class="overline">情境抉择</span><h3>' + lessonData.question + '</h3></div><span class="choice-count">选择你的理解</span></div>'
                + '<div class="choice-list">' + buildChoiceButtons(lessonData) + '</div>'
                + '<div class="feedback" hidden></div>'
                + '<button class="continue-button" hidden>下一题 <span>→</span></button>'
                + '</section>';
            return article;
        }

        function buildLessons() {
            lessonsData.forEach(function (lessonData, index) {
                lessonList.appendChild(buildLesson(lessonData, index));
            });
            lessons = Array.from(lessonList.querySelectorAll('.lesson'));
            results = lessons.map(function () { return null; });
        }

        function buildTabs() {
            for (let index = 0; index < lessonCount; index += 1) {
                const tab = document.createElement('button');
                tab.className = 'lesson-tab' + (index === 0 ? ' is-active' : '');
                tab.dataset.index = String(index);
                tab.innerHTML = '第' + numeralFor(index + 1) + '题<em>' + padTwo(index + 1) + '</em>';
                lessonNav.appendChild(tab);
            }
            tabs = Array.from(lessonNav.querySelectorAll('.lesson-tab'));
        }

        function currentLessonId() {
            return lessons[currentIndex].dataset.questionId;
        }

        function readStorage(key) {
            try {
                return localStorage.getItem(key);
            } catch (error) {
                console.warn('localStorage 不可用:', error);
                return null;
            }
        }

        function writeStorage(key, value) {
            try {
                localStorage.setItem(key, value);
            } catch (error) {
                console.warn('localStorage 不可用:', error);
            }
        }

        function setBackground() {
            const backgrounds = window.ShiShuoBackgrounds || [];
            if (backgrounds.length === 0) return;
            const background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
            document.body.style.setProperty('--game-background', "url('../assets/images/" + background + "')");
        }

        function loadResults() {
            let storedResults;
            try {
                storedResults = JSON.parse(localStorage.getItem(resultsStorageKey));
            } catch (error) {
                console.warn('localStorage 不可用:', error);
                storedResults = null;
            }
            if (!Array.isArray(storedResults)) return;

            results = lessons.map(function (lesson, lessonIndex) {
                const storedResult = storedResults[lessonIndex];
                const lessonData = lessonDataById(lesson.dataset.questionId);
                const maxSelected = lessonData ? lessonData.choices.length - 1 : -1;
                if (!lessonData || !storedResult || !Number.isInteger(storedResult.selected) || storedResult.selected < 0 || storedResult.selected > maxSelected) {
                    return null;
                }
                const correct = storedResult.selected === lessonData.answer;
                if (correct) correctCount += 1;
                return { selected: storedResult.selected, correct: correct };
            });
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
            progress.textContent = '研读 ' + padTwo(index + 1) + ' / ' + padTwo(lessonCount);
            renderResult();
            adviceNote.textContent = '先读原文，再让选择回答你的理解。';
            updateMentorButtons();
        }

        function renderResult() {
            const lesson = lessons[currentIndex];
            const lessonData = lessonDataById(lesson.dataset.questionId);
            const feedback = lesson.querySelector('.feedback');
            const translation = lesson.querySelector('.translation');
            const continueButton = lesson.querySelector('.continue-button');
            const choices = Array.from(lesson.querySelectorAll('.choice'));
            const result = results[currentIndex];
            choices.forEach(function (choice, choiceIndex) {
                choice.disabled = result !== null;
                choice.classList.remove('is-correct', 'is-wrong');
                if (result !== null && choiceIndex === lessonData.answer) choice.classList.add('is-correct');
                if (result !== null && choiceIndex === result.selected && choiceIndex !== lessonData.answer) choice.classList.add('is-wrong');
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
                ? '<strong>理解得其正。</strong><p>' + lessonData.explain + '</p><span>风度 +' + correctBonus + '</span>'
                : '<strong>进入复习模式。</strong><p>' + lessonData.explain + '</p><span>请对照原文再读一遍</span>';
            feedback.hidden = false;
            continueButton.hidden = currentIndex >= lessonCount - 1;
        }

        function chooseAnswer(event) {
            const lesson = event.currentTarget.closest('.lesson');
            const lessonIndex = lessons.indexOf(lesson);
            if (results[lessonIndex] !== null) return;
            const selected = Number(event.currentTarget.dataset.choiceIndex);
            const lessonData = lessonDataById(lesson.dataset.questionId);
            const correct = selected === lessonData.answer;
            results[lessonIndex] = { selected: selected, correct: correct };
            if (correct) {
                correctCount += 1;
                window.ShiShuoState.addGrace(correctBonus);
            }
            writeStorage(resultsStorageKey, JSON.stringify(results));
            currentIndex = lessonIndex;
            renderResult();
            updateMentorButtons();
            if (results.every(function (result) { return result !== null; })) renderCompletion();
        }

        function renderCompletion() {
            lessonList.hidden = true;
            completionPanel.hidden = false;
            progress.textContent = '研读完成 / ' + lessonCount;
            document.querySelector('.completion-score').textContent = '答对 ' + correctCount + ' / ' + lessonCount + ' 题，正确率：' + Math.round(correctCount / lessonCount * 100) + '%';
            tabs.forEach(function (tab) { tab.disabled = true; });
        }

        function adviceStorageKey(mentor) {
            return 'shishuo-advice-' + routeKey + '-' + currentLessonId() + '-' + mentor;
        }

        function updateMentorButtons() {
            document.querySelectorAll('.mentor-button').forEach(function (button) {
                const used = readStorage(adviceStorageKey(button.dataset.mentor)) === '1';
                button.disabled = used || window.ShiShuoState.getGrace() < adviceCost;
                if (used) button.innerHTML = '请教完成 <span>已记入札记</span>';
            });
        }

        function askMentor(event) {
            const button = event.currentTarget;
            const mentor = button.dataset.mentor;
            const key = adviceStorageKey(mentor);
            if (readStorage(key) === '1') return;
            if (!window.ShiShuoState.spendGrace(adviceCost)) {
                adviceNote.textContent = '风度不足，暂时无法请教这位名士。';
                updateMentorButtons();
                return;
            }
            writeStorage(key, '1');
            const advice = lessonDataById(currentLessonId()).advice;
            adviceNote.textContent = mentor + '说：' + (advice && advice[mentor] ? advice[mentor] : '');
            button.disabled = true;
            button.innerHTML = '请教完成 <span>已记入札记</span>';
            updateMentorButtons();
        }

        // 初始化：根据数据构建界面并绑定事件。
        setBackground();
        buildTabs();
        buildLessons();
        tabs.forEach(function (tab) { tab.addEventListener('click', function () { showLesson(Number(tab.dataset.index)); }); });
        lessonList.querySelectorAll('.choice').forEach(function (choice) { choice.addEventListener('click', chooseAnswer); });
        lessonList.querySelectorAll('.continue-button').forEach(function (button) {
            button.addEventListener('click', function () { showLesson(currentIndex + 1); });
        });
        document.querySelectorAll('.mentor-button').forEach(function (button) { button.addEventListener('click', askMentor); });
        completionPanel.hidden = true;
        window.ShiShuoState.refresh();
        loadResults();
        const firstUnanswered = results.findIndex(function (result) { return result === null; });
        if (firstUnanswered === -1) {
            renderCompletion();
        } else {
            showLesson(firstUnanswered);
        }
    }
}());
