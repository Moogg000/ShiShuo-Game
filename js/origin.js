(function () {
    var beatsBox = document.getElementById('beats');
    var beatsActions = document.getElementById('beats-actions');
    var quizBox = document.getElementById('quiz');
    var quizCard = document.getElementById('quiz-card');
    var resultBox = document.getElementById('result');
    var progress = document.getElementById('origin-progress');
    var resumePanel = document.getElementById('resume-panel');
    var resumeText = document.getElementById('resume-text');
    var resumeActions = document.getElementById('resume-actions');

    var chineseNumerals = ['一', '二', '三', '四', '五', '六'];

    // 局内进度（未落存档）：本轮选择累计的轴值
    var pickedAxes = { lijiao: 0, qingli: 0, kuangshen: 0 };

    function el(html) {
        var template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    }

    function renderBeat(beat) {
        var isNarration = beat.speaker === '旁白';
        var node = el('<div class="beat' + (isNarration ? ' narration' : '') + '">'
            + '<span class="speaker">' + beat.speaker + (isNarration ? '' : ' 曰') + '</span>'
            + '<p>' + beat.text + '</p></div>');
        beatsBox.appendChild(node);
    }

    function showBeats(data, index) {
        if (index >= data.origin.beats.length) {
            beatsBox.hidden = true;
            beatsActions.hidden = true;
            quizBox.hidden = false;
            showQuestion(data, 0);
            return;
        }
        beatsBox.hidden = false;
        renderBeat(data.origin.beats[index]);
        progress.textContent = '问对 ' + String(index + 1) + ' / ' + data.origin.beats.length;
        beatsActions.innerHTML = '';
        var button = el('<button class="continue-button">' + (index === data.origin.beats.length - 1 ? '领受三试' : '继续') + '<span>→</span></button>');
        button.addEventListener('click', function () { showBeats(data, index + 1); });
        beatsActions.appendChild(button);
        beatsActions.hidden = false;
    }

    function showQuestion(data, index) {
        var questions = data.origin.questions;
        var question = questions[index];
        progress.textContent = '三试之问 ' + chineseNumerals[index] + ' / ' + chineseNumerals[questions.length - 1];
        quizCard.innerHTML =
            '<span class="place">临川王的三试 · ' + (index + 1) + '</span>'
            + '<h2>换作是你</h2>'
            + '<p class="scene-text">' + question.prompt + '</p>'
            + '<div class="choice-list" style="margin-top:1.4rem">'
            + question.choices.map(function (choice, choiceIndex) {
                return '<button class="choice" data-choice="' + choiceIndex + '"><span>'
                    + String.fromCharCode(65 + choiceIndex) + '</span><strong>' + choice.text + '</strong><i>→</i></button>';
            }).join('')
            + '</div>';
        Array.prototype.forEach.call(quizCard.querySelectorAll('.choice'), function (button) {
            button.addEventListener('click', function () {
                var choice = question.choices[Number(button.dataset.choice)];
                Object.keys(choice.axes || {}).forEach(function (axisId) {
                    pickedAxes[axisId] = (pickedAxes[axisId] || 0) + choice.axes[axisId];
                });
                if (index + 1 < questions.length) {
                    showQuestion(data, index + 1);
                } else {
                    quizBox.hidden = true;
                    showResult(data);
                }
            });
        });
    }

    function axisMarkerPercent(value) {
        // -6..6 映射到 8%..92%
        var clamped = Math.max(-6, Math.min(6, value));
        return 50 + (clamped / 6) * 42;
    }

    function showResult(data) {
        progress.textContent = '底色已成';
        var match = window.Book.affinity(data.sages, pickedAxes);
        document.getElementById('result-lead').textContent =
            data.origin.resultLead + ' '
            + data.origin.resultTemplate.closest.replace('{name}', match.closest.name) + ' '
            + data.origin.resultTemplate.farthest.replace('{name}', match.farthest.name);

        var axisRows = document.getElementById('axis-rows');
        axisRows.innerHTML = '';
        data.axes.forEach(function (axis) {
            var value = pickedAxes[axis.id] || 0;
            axisRows.appendChild(el('<div class="axis-row">'
                + '<div class="axis-name"><span>' + axis.left.label + '</span>' + axis.name + '<span>' + axis.right.label + '</span></div>'
                + '<div class="axis-bar"><i style="left:' + axisMarkerPercent(value) + '%"></i></div>'
                + '<div class="axis-desc"><span>' + axis.left.desc + '</span><span>' + axis.right.desc + '</span></div>'
                + '</div>'));
        });

        var cards = document.getElementById('affinity-cards');
        cards.innerHTML = '';
        cards.appendChild(el('<div class="affinity-card">'
            + '<span class="rel">知音 · 与你同调</span>'
            + '<h3>' + match.closest.name + '</h3><p>' + match.closest.bio + '</p></div>'));
        cards.appendChild(el('<div class="affinity-card far">'
            + '<span class="rel">诤友 · 与你道殊</span>'
            + '<h3>' + match.farthest.name + '</h3><p>' + match.farthest.bio + '</p></div>'));

        document.getElementById('result-sendoff').textContent = data.origin.resultTemplate.sendOff;
        document.getElementById('btn-depart').addEventListener('click', function () {
            var nameInput = document.getElementById('player-name');
            var name = (nameInput.value || '').trim() || '无名客';
            var state = window.Book.freshState();
            state.name = name;
            state.axes = pickedAxes;
            state.closest = match.closest.id;
            state.farthest = match.farthest.id;
            state.originDone = true;
            window.Book.writeState(state);
            window.location.href = 'journey.html';
        });

        resultBox.hidden = false;
    }

    function showResume(state) {
        var finished = state.finale && state.finale.fate;
        resumeText.textContent = finished
            ? '《世说新书》已成。门客' + state.name + '的旅程已了。'
            : '门客' + state.name + '行至第' + chineseNumerals[state.chapter - 1] + '章，书稿' + state.records.length + '条在囊。';
        resumeActions.innerHTML = '';
        if (finished) {
            resumeActions.appendChild(el('<button class="continue-button" data-go="ending">重读书末<span>→</span></button>'));
        } else {
            resumeActions.appendChild(el('<button class="continue-button" data-go="journey">继续游历<span>→</span></button>'));
        }
        var restart = el('<button class="continue-button" data-go="restart">焚稿重来<span>→</span></button>');
        resumeActions.appendChild(restart);
        resumeActions.addEventListener('click', function (event) {
            var go = event.target.closest('[data-go]');
            if (!go) return;
            if (go.dataset.go === 'restart') {
                window.Book.clearState();
                window.location.reload();
            } else {
                window.location.href = go.dataset.go === 'ending' ? 'ending.html' : 'journey.html';
            }
        });
        resumePanel.hidden = false;
    }

    window.Book.loadData().then(function (data) {
        var state = window.Book.readState();
        if (state && state.originDone) {
            showResume(state);
            document.getElementById('origin-flow').hidden = true;
            return;
        }
        showBeats(data, 0);
    }).catch(function (error) {
        console.error('开场数据加载失败：', error);
        beatsBox.innerHTML = '<div class="beat narration"><p>数据加载失败，请通过本地服务器访问后刷新重试。</p></div>';
    });
}());
