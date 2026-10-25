(function () {
    var flow = document.getElementById('flow');
    var progress = document.getElementById('journey-progress');
    var chapterSub = document.getElementById('chapter-sub');
    var chapterTitle = document.getElementById('chapter-title');
    var stagePlace = document.getElementById('stage-place');
    var stageStep = document.getElementById('stage-step');
    var manuscriptBox = document.getElementById('manuscript');
    var pressureDots = document.getElementById('pressure-dots');
    var pressureLabel = document.getElementById('pressure-label');
    var affinityMini = document.getElementById('affinity-mini');

    var MODE_MARKS = {
        record: '直书',
        euphemism: '微词',
        cut: '削事存言',
        demoted: '降门',
        omit: '留白'
    };

    var data = null;
    var state = null;

    function el(html) {
        var template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    }

    function currentChapterMeta() {
        if (state.chapter === 5) return { title: data.finale.title, count: 0 };
        return data.chapters.find(function (chapter) { return chapter.id === state.chapter; });
    }

    function currentChapterEvents() {
        var chapter = currentChapterMeta();
        return (chapter && chapter.events) ? chapter.events.map(function (id) {
            return window.Book.eventById(data.events, id);
        }) : [];
    }

    // ── 侧栏 ─────────────────────────────
    function renderRail() {
        renderManuscript();
        renderPressure();
        renderAffinity();
    }

    function renderManuscript() {
        manuscriptBox.innerHTML = '';
        if (state.records.length === 0) {
            manuscriptBox.appendChild(el('<p class="ms-empty">行囊空空，尚未落笔。</p>'));
            return;
        }
        state.records.forEach(function (record) {
            var event = window.Book.eventById(data.events, record.eventId);
            var gate = record.gate ? window.Book.gateById(data.gates, record.gate) : null;
            var isBlank = record.mode === 'omit';
            var item = el('<div class="ms-item' + (isBlank ? ' ms-blank' : '') + '">'
                + '<span class="ms-title">' + event.title + '</span>'
                + '<span class="ms-gate">' + (isBlank ? '阙' : '《' + gate.name + '》') + '</span>'
                + '<span class="ms-mode">' + MODE_MARKS[record.mode] + '</span>'
                + '</div>');
            manuscriptBox.appendChild(item);
        });
    }

    function renderPressure() {
        pressureDots.innerHTML = '';
        var max = data.pressure.max;
        for (var i = 0; i < max; i += 1) {
            pressureDots.appendChild(el('<i class="' + (i < state.pressure ? 'on' : '') + '"></i>'));
        }
        pressureLabel.textContent = data.pressure.meterLabel + ' ' + state.pressure + ' / ' + max;
    }

    function renderAffinity() {
        var match = window.Book.affinity(data.sages, state.axes);
        state.closest = match.closest.id;
        state.farthest = match.farthest.id;
        affinityMini.innerHTML = '知音 <strong>' + match.closest.name + '</strong> 与你同调。<br>诤友 <strong>' + match.farthest.name + '</strong> 与你道殊——路上多听他辩。';
    }

    function refreshHeader() {
        var chapter = currentChapterMeta();
        chapterSub.textContent = chapter ? chapter.title : '游历';
        chapterTitle.textContent = state.chapter === 5 ? '复命' : '在' + (chapter ? chapter.title.split('·')[1].trim() : '') + '的道上';
        var events = currentChapterEvents();
        var total = events.length || 1;
        progress.textContent = state.chapter === 5 ? '终章' : '事 ' + String(Math.min(state.eventIndex + 1, total)) + ' / ' + total;
    }

    // ── 章节推进 ─────────────────────────────
    function showChapterIntro() {
        var chapter = currentChapterMeta();
        refreshHeader();
        stagePlace.textContent = chapter.title;
        stageStep.textContent = '章首';
        flow.innerHTML = '';
        flow.appendChild(el('<div class="scene-card">'
            + '<span class="place">' + chapter.title + '</span>'
            + '<h2>' + chapter.title.split('·')[1].trim() + '</h2>'
            + '<p class="scene-text">' + chapter.intro + '</p></div>'));
        var actions = el('<div class="flow-actions"><button class="continue-button">入其境<span>→</span></button></div>');
        actions.querySelector('button').addEventListener('click', function () {
            state.eventIndex = 0;
            showEvent();
        });
        flow.appendChild(actions);
    }

    function finishChapter() {
        state.chapter += 1;
        state.eventIndex = 0;

        // 第三章（山阳）结束后的风声节点
        var warning = data.pressure.warning;
        var calm = data.pressure.calmNote;
        if (warning.afterChapter === state.chapter - 1) {
            window.Book.writeState(state);
            var hit = state.pressure >= warning.minPressure;
            var note = hit ? warning : calm;
            refreshHeader();
            stageStep.textContent = '途中';
            flow.innerHTML = '';
            flow.appendChild(el('<div class="scene-card">'
                + '<span class="place">途中 · ' + warning.title + '</span>'
                + '<h2>' + (hit ? '风声' : '无事') + '</h2>'
                + '<p class="scene-text">' + note.lead + '</p>'
                + '<p class="scene-text" style="margin-top:0.8rem">' + note.text + '</p></div>'));
            var actions = el('<div class="flow-actions"><button class="continue-button">继续南下<span>→</span></button></div>');
            actions.querySelector('button').addEventListener('click', function () {
                if (state.chapter === 5) showFinale();
                else showChapterIntro();
            });
            flow.appendChild(actions);
            return;
        }

        window.Book.writeState(state);
        if (state.chapter === 5) showFinale();
        else showChapterIntro();
    }

    // ── 事件流程：遇事 → 应对 → 后话 → 落笔 ─────────────────────────────
    function showEvent() {
        var events = currentChapterEvents();
        if (state.eventIndex >= events.length) {
            finishChapter();
            return;
        }
        var event = events[state.eventIndex];
        refreshHeader();
        stagePlace.textContent = event.place;
        stageStep.textContent = '遇事';

        flow.innerHTML = '';
        flow.appendChild(el('<div class="scene-card">'
            + '<span class="place">' + event.place + '</span>'
            + '<h2>' + event.title + '</h2>'
            + '<p class="scene-text">' + event.scene + '</p></div>'));

        // 行状原文随场景出示：编书人先读行状，再谈看法
        flow.appendChild(el('<div class="quote-block">'
            + '<span class="qlabel">行状原文 · 入书底本</span>'
            + '<p class="qtext">' + event.source + '</p>'
            + '<p class="qtrans">' + event.translation + '</p>'
            + '</div>'));

        var choiceSection = el('<div class="choice-section">'
            + '<div class="choice-heading"><div><span class="overline">你的应对</span><h3>' + event.prompt + '</h3></div><span class="choice-count">无对错 · 有立场</span></div>'
            + '<div class="choice-list">'
            + event.choices.map(function (choice, index) {
                return '<button class="choice" data-choice="' + index + '"><span>'
                    + String.fromCharCode(65 + index) + '</span><strong>' + choice.text + '</strong><i>→</i></button>';
            }).join('')
            + '</div></div>');
        Array.prototype.forEach.call(choiceSection.querySelectorAll('.choice'), function (button) {
            button.addEventListener('click', function () {
                showAftermath(event, Number(button.dataset.choice));
            });
        });
        flow.appendChild(choiceSection);
        window.scrollTo({ top: 0 });
    }

    function showAftermath(event, choiceIndex) {
        var choice = event.choices[choiceIndex];
        var aftermath = choice.aftermath;
        var sage = window.Book.sageById(data.sages, aftermath.sage);
        stageStep.textContent = '后话';

        var sceneCard = flow.querySelector('.scene-card');
        // 标记已选立场
        var chosen = flow.querySelectorAll('.choice');
        chosen.forEach(function (button, index) {
            button.disabled = true;
            if (index === choiceIndex) button.classList.add('is-correct');
        });

        var card = el('<div class="aftermath-card">'
            + '<div class="aftermath-head"><div class="portrait"><span>' + sage.name.charAt(0) + '</span></div>'
            + '<div class="who"><h3>' + sage.name + (sage.zi ? ' · ' + sage.zi : '') + '</h3><span class="role">' + sage.gate + '篇人物</span></div></div>'
            + '<p class="lead">' + aftermath.lead + '</p>'
            + '<p class="say">' + aftermath.text + '</p>'
            + '<blockquote><p>' + aftermath.quote + '</p><small>' + aftermath.quoteSource + ' —— ' + aftermath.quoteTrans + '</small></blockquote>'
            + '</div>');
        sceneCard.parentNode.insertBefore(card, sceneCard.nextSibling);

        var recordPanel = buildRecordPanel(event, choiceIndex);
        card.parentNode.insertBefore(recordPanel, card.nextSibling);
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function buildRecordPanel(event, choiceIndex) {
        var recordConfig = data.eventsData.record;
        var config = event.censored ? recordConfig.censored : recordConfig.normal;
        var panel = el('<div class="record-panel">'
            + '<p class="record-prompt">' + config.prompt + '</p>'
            + '<div class="mode-list"></div>'
            + '</div>');

        var modeList = panel.querySelector('.mode-list');
        var modes = [];
        if (event.censored) {
            modes = [
                { mode: 'record', label: config.recordLabel, desc: config.recordDesc },
                { mode: 'euphemism', label: config.euphemismLabel, desc: config.euphemismDesc },
                { mode: 'omit', label: config.omitLabel, desc: config.omitDesc }
            ];
        } else {
            modes = [
                { mode: 'record', label: config.recordLabel, desc: '具书其事，原文入卷。' },
                { mode: 'omit', label: config.omitLabel, desc: '此事不取，另待他篇。' }
            ];
        }

        modes.forEach(function (item) {
            var button = el('<button class="mode-option" data-mode="' + item.mode + '">'
                + '<strong>' + item.label + '</strong><small>' + item.desc + '</small></button>');
            button.addEventListener('click', function () {
                pickGate(panel, event, choiceIndex, item.mode);
            });
            modeList.appendChild(button);
        });
        return panel;
    }

    function pickGate(panel, event, choiceIndex, mode) {
        if (mode === 'omit') {
            commitRecord(event, choiceIndex, mode, null, panel);
            return;
        }
        if (panel.dataset.picking === '1') return;
        panel.dataset.picking = '1';
        panel.querySelectorAll('.mode-option').forEach(function (button) { button.disabled = true; });
        var gatePromptText = data.eventsData.record.gatePrompt;
        var picker = el('<div class="gate-pick"><p class="record-prompt" style="margin:0 0 0.6rem">' + gatePromptText + '</p></div>');
        event.suggested_gates.forEach(function (gateId) {
            var gate = window.Book.gateById(data.gates, gateId);
            if (!gate) return;
            var button = el('<button class="gate-option" data-gate="' + gateId + '">'
                + '<strong>《' + gate.name + '》</strong><small>' + gate.figures + '</small></button>');
            button.addEventListener('click', function () {
                commitRecord(event, choiceIndex, mode, gateId, panel);
            });
            picker.appendChild(button);
        });
        panel.querySelector('.mode-list').hidden = true;
        panel.querySelector('.record-prompt').hidden = true;
        panel.appendChild(picker);
    }

    function commitRecord(event, choiceIndex, mode, gateId, panel) {
        var record = { eventId: event.id, choiceIndex: choiceIndex, mode: mode, gate: gateId };
        state.records.push(record);

        var choice = event.choices[choiceIndex];
        Object.keys(choice.axes || {}).forEach(function (axisId) {
            state.axes[axisId] = (state.axes[axisId] || 0) + choice.axes[axisId];
        });

        var pressureDelta = 0;
        if (event.censored) {
            pressureDelta = data.eventsData.record.pressureLabels[mode] || 0;
            state.pressure = Math.min(data.pressure.max, state.pressure + pressureDelta);
        }

        // 锁定按钮
        panel.querySelectorAll('button').forEach(function (button) { button.disabled = true; });

        var note = mode === 'omit'
            ? '此页留白。'
            : '已记入《' + window.Book.gateById(data.gates, gateId).name + '》。';
        if (pressureDelta > 0) note += ' 风声 +' + pressureDelta + '。';

        var actions = el('<div class="flow-actions"><p class="record-prompt">' + note + '</p>'
            + '<button class="continue-button">' + nextLabel() + '<span>→</span></button></div>');
        actions.querySelector('button').addEventListener('click', function () {
            state.eventIndex += 1;
            window.Book.writeState(state);
            renderRail();
            showEvent();
        });
        panel.appendChild(actions);
        renderRail();
    }

    function nextLabel() {
        var events = currentChapterEvents();
        if (state.eventIndex + 1 < events.length) return '遇下一事';
        if (state.chapter < 4) return '离此地，往前去';
        return '南下归建康';
    }

    // ── 终章：复命 ─────────────────────────────
    function showFinale() {
        refreshHeader();
        stagePlace.textContent = '建康 · 临川王园';
        stageStep.textContent = '复命';
        flow.innerHTML = '';
        var finale = data.finale;

        flow.appendChild(el('<div class="scene-card">'
            + '<span class="place">' + finale.title + '</span>'
            + '<h2>复命</h2>'
            + '<p class="scene-text">' + finale.intro + '</p></div>'));

        var beatsBox = el('<div style="margin-top:1.4rem"></div>');
        flow.appendChild(beatsBox);

        var actionsBox = el('<div class="flow-actions"></div>');
        flow.appendChild(actionsBox);

        var beatIndex = 0;
        function nextBeat() {
            if (beatIndex < finale.beats.length) {
                var beat = finale.beats[beatIndex];
                beatIndex += 1;
                beatsBox.appendChild(el('<div class="beat' + (beat.speaker === '旁白' ? ' narration' : '') + '">'
                    + '<span class="speaker">' + beat.speaker + (beat.speaker === '旁白' ? '' : ' 曰') + '</span>'
                    + '<p>' + beat.text + '</p></div>'));
                actionsBox.innerHTML = '';
                var button = el('<button class="continue-button">继续<span>→</span></button>');
                button.addEventListener('click', nextBeat);
                actionsBox.appendChild(button);
                return;
            }
            decideDeletion();
        }
        nextBeat();
    }

    function decideDeletion() {
        var request = data.finale.requestDelete;
        var target = findCensorTarget();
        if (state.pressure >= request.minPressure && target) {
            var panel = el('<div class="record-panel">'
                + '<p class="record-prompt">' + request.lead + '</p>'
                + '<p class="record-prompt" style="color:#762f27">' + request.prompt + '</p>'
                + '<div class="mode-list"></div></div>');
            var modeList = panel.querySelector('.mode-list');
            request.options.forEach(function (option) {
                var button = el('<button class="mode-option" data-mode="' + option.mode + '">'
                    + '<strong>' + option.label + '</strong><small>' + option.desc + '</small></button>');
                button.addEventListener('click', function () {
                    applyDeletion(target, option.mode);
                    panel.querySelectorAll('button').forEach(function (item) { item.disabled = true; });
                    panel.appendChild(el('<p class="record-prompt">书稿已改。你看着那处墨迹，很久。</p>'));
                    decideSubmission();
                });
                modeList.appendChild(button);
            });
            flow.appendChild(panel);
            panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        decideSubmission();
    }

    function findCensorTarget() {
        var preference = ['record', 'euphemism'];
        for (var i = 0; i < preference.length; i += 1) {
            var found = state.records.find(function (record) {
                var event = window.Book.eventById(data.events, record.eventId);
                return event && event.censored && record.mode === preference[i];
            });
            if (found) return found;
        }
        return null;
    }

    function applyDeletion(record, mode) {
        record.mode = mode;
        if (mode === 'demoted') {
            var event = window.Book.eventById(data.events, record.eventId);
            var lightGates = ['rendan', 'qiyi'];
            record.gate = lightGates.find(function (gateId) {
                return event.suggested_gates.indexOf(gateId) !== -1;
            }) || 'rendan';
        }
        if (mode === 'omit') record.gate = null;
        state.finale = state.finale || {};
        state.finale.deletion = mode;
        window.Book.writeState(state);
        renderManuscript();
    }

    function decideSubmission() {
        var submission = data.finale.submission;
        var panel = el('<div class="record-panel">'
            + '<p class="record-prompt">' + submission.lead + '</p>'
            + '<p class="record-prompt" style="color:#762f27">' + submission.prompt + '</p>'
            + '<div class="mode-list"></div></div>');
        var modeList = panel.querySelector('.mode-list');
        submission.options.forEach(function (option) {
            var button = el('<button class="mode-option" data-fate="' + option.fate + '">'
                + '<strong>' + option.label + '</strong><small>' + option.desc + '</small></button>');
            button.addEventListener('click', function () {
                state.finale = state.finale || {};
                state.finale.fate = option.fate;
                window.Book.writeState(state);
                window.location.href = 'ending.html';
            });
            modeList.appendChild(button);
        });
        flow.appendChild(panel);
        panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ── 启动 ─────────────────────────────
    window.Book.loadData().then(function (loaded) {
        data = loaded;
        state = window.Book.readState();
        if (!state || !state.originDone) {
            window.location.href = 'origin.html';
            return;
        }
        if (state.finale && state.finale.fate) {
            window.location.href = 'ending.html';
            return;
        }
        renderRail();
        if (state.chapter === 5) showFinale();
        else showEvent();
    }).catch(function (error) {
        console.error('游历数据加载失败：', error);
        flow.innerHTML = '<div class="scene-card"><p class="scene-text">数据加载失败，请通过本地服务器访问后刷新重试。</p></div>';
    });
}());
