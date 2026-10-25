(function () {
    var body = document.getElementById('ending-body');

    function el(html) {
        var template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    }

    var MODE_MARKS = {
        record: '直书',
        euphemism: '微词',
        cut: '削事存言',
        demoted: '降门',
        omit: '阙'
    };

    function renderEnding(data, state) {
        var recorded = state.records.filter(function (record) { return record.mode !== 'omit'; });
        var blanks = state.records.filter(function (record) { return record.mode === 'omit'; });
        var dominant = window.Book.dominantGate(state, data) || data.gates[0];
        var match = window.Book.affinity(data.sages, state.axes);
        var closest = match.closest;
        var farthest = match.farthest;
        var hadDirect = state.records.some(function (record) {
            var event = window.Book.eventById(data.events, record.eventId);
            return event && event.censored && record.mode === 'record';
        });

        // ── 卷首 ──
        body.appendChild(el('<div class="scene-card">'
            + '<span class="place">临川王刘义庆 命编 · 门客' + state.name + ' 撰</span>'
            + '<h2>书成</h2>'
            + '<p class="scene-text">建康的雪落下时，书稿誊清了。你把最后一卷合上，忽然想起出发那天书房里的烛火。'
            + '全书历九事，记' + recorded.length + '事，' + (blanks.length > 0 ? '阙' + blanks.length + '处。' : '无阙。') + '</p>'
            + '</div>'));

        // ── 目录 ──
        var toc = el('<div class="scene-card" style="margin-top:1.6rem">'
            + '<span class="place">目录</span><h2>你编成的书</h2><div class="toc"></div></div>');
        var tocBox = toc.querySelector('.toc');
        var emptyToc = true;
        data.gates.forEach(function (gate) {
            var items = state.records.filter(function (record) {
                return record.mode !== 'omit' && record.gate === gate.id;
            }).map(function (record) {
                var event = window.Book.eventById(data.events, record.eventId);
                return event.title + '（' + MODE_MARKS[record.mode] + '）';
            });
            if (items.length === 0) return;
            emptyToc = false;
            tocBox.appendChild(el('<div class="toc-row">'
                + '<span class="toc-gate">《' + gate.name + '》</span>'
                + '<span class="toc-items">' + items.join(' · ') + '</span>'
                + '<span class="toc-count">' + items.length + ' 则</span></div>'));
        });
        if (emptyToc) {
            tocBox.appendChild(el('<p class="ms-empty">一卷空书。你什么都没有记。这本身也是一种编法——但你确定吗？</p>'));
        }
        state.records.filter(function (record) { return record.mode === 'omit'; }).forEach(function () {
            tocBox.appendChild(el('<div class="toc-blank">此处有阙</div>'));
        });
        body.appendChild(toc);

        // ── 编者按 ──
        var zhuanClauses = recorded.map(function (record) {
            var event = window.Book.eventById(data.events, record.eventId);
            var choice = event.choices[record.choiceIndex];
            return '于《' + event.title + '》' + choice.zhuan;
        });
        var noteText = '门客' + state.name + '，受命采魏晋轶事。所历九事，记' + recorded.length + '，'
            + (blanks.length > 0 ? '阙' + blanks.length + '，' : '无阙，')
            + '其取舍曰：' + (zhuanClauses.length > 0 ? zhuanClauses.join('；') + '。' : '未着一字。')
            + '所记之卷，以《' + dominant.name + '》为最厚——' + dominant.closing
            + (blanks.length > 0 ? '阙处不书，阙即是书。' : '');
        if (!hadDirect) noteText += '通卷无一字直笔——书安全地美丽着。';
        body.appendChild(el('<div class="editor-note"><h3>编者按</h3><p>' + noteText + '</p></div>'));

        // ── 名士评 ──
        var closestLine = closest.lines[0];
        var farthestLine = farthest.lines[farthest.lines.length - 1];
        var comments = el('<div class="affinity-cards" style="margin-top:1.8rem"></div>');
        comments.appendChild(el('<div class="affinity-card">'
            + '<span class="rel">知音赠言 · ' + closest.name + '</span>'
            + '<h3>' + closestLine.text + '</h3>'
            + '<p>' + closestLine.trans + '（' + closestLine.source + '）</p></div>'));
        comments.appendChild(el('<div class="affinity-card far">'
            + '<span class="rel">诤友按语 · ' + farthest.name + '</span>'
            + '<h3>' + farthestLine.text + '</h3>'
            + '<p>' + farthestLine.trans + '（' + farthestLine.source + '）</p></div>'));
        body.appendChild(comments);

        // ── 书的命运 ──
        var fate = renderFate(data, state, hadDirect);
        body.appendChild(el('<div class="fate-card">'
            + '<span class="overline">书的命运</span>'
            + '<h3>' + fate.title + '</h3>'
            + '<p>' + fate.text + '</p></div>'));

        // ── 行动 ──
        var actions = el('<div class="ending-actions">'
            + '<button id="btn-restart">焚稿，另编一卷</button>'
            + '<a href="index.html">回建康城去</a></div>');
        actions.querySelector('#btn-restart').addEventListener('click', function () {
            window.Book.clearState();
            window.location.href = 'origin.html';
        });
        body.appendChild(actions);
    }

    function renderFate(data, state, hadDirect) {
        var submitted = state.finale && state.finale.fate === 'submitted';
        var deleted = state.finale && state.finale.deletion;

        if (!submitted) {
            return {
                title: '藏之名山',
                text: '呈上去的本子安然刊行，士林传抄。而原稿的副本，在你手里另誊了一册——'
                    + '你把它托给一位可信的山中僧寺，托给抄书人，托给时间。'
                    + '多年以后，若有人在残卷里读到那几段直笔，未必知道：那是一位门客在风声最紧的日子里，一笔一笔留下的。'
            };
        }
        if (deleted) {
            return {
                title: '有阙之书',
                text: '书成呈王，刻本行世。识书的读者翻到那几页，见墨迹忽然轻了、阙了、挪进玩笑里去了——'
                    + '他们停下来，想了想，明白了。阙处无声，而无声处，人人听见。'
                    + '这或许是你能想到的、既让书活下来、又不让真相全死的唯一办法。'
            };
        }
        if (!hadDirect) {
            return {
                title: '全本行世',
                text: '书成呈王，刻本行世，一时间洛阳纸贵。可你夜里翻检自己的书，总觉得它太干净了——'
                    + '风声从没为你停过，只是你从来没给过它理由。'
                    + '这本书会流传很久。它只是不太疼。'
            };
        }
        return {
            title: '全本行世',
            text: '书成呈王，一字未删，刻本行世。那些直笔就这样印在纸上，印在每一个后来者的眼睛里。'
                + '有司的目光扫过又移开——也许是不屑，也许是来不及。你不去想。'
                + '你只知道：那些险些死了第二遍的人，从今往后，死不掉了。'
        };
    }

    window.Book.loadData().then(function (data) {
        var state = window.Book.readState();
        if (!state || !state.originDone) {
            window.location.href = 'origin.html';
            return;
        }
        if (!state.finale || !state.finale.fate) {
            window.location.href = 'journey.html';
            return;
        }
        renderEnding(data, state);
    }).catch(function (error) {
        console.error('结局数据加载失败：', error);
        body.innerHTML = '<div class="scene-card"><p class="scene-text">数据加载失败，请通过本地服务器访问后刷新重试。</p></div>';
    });
}());
