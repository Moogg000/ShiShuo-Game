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
            + '<a href="index.html">回建康城去</a>'
            + '<button id="btn-export-pdf">另存为PDF</button></div>');
        actions.querySelector('#btn-restart').addEventListener('click', function () {
            window.Book.clearState();
            window.location.href = 'origin.html';
        });
        actions.querySelector('#btn-export-pdf').addEventListener('click', exportBookAsPDF);
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

// ── 导出书籍为PDF ──
async function exportBookAsPDF() {
    setTimeout(async function () {
        var printWindow = window.open("", "_blank");

        // 从 DOM 提取玩家名字
        var sceneCard = document.querySelector('.scene-card');
        var playerName = '门客';
        if (sceneCard) {
            var placeText = sceneCard.querySelector('.place') ? sceneCard.querySelector('.place').textContent : '';
            var match = placeText.match(/门客(.+?)撰/);
            if (match) playerName = match[1].trim();
        }

        // 加载真实数据
        var state = window.Book.readState();
        var data = await window.Book.loadData();

        if (!state || !data) {
            printWindow.document.write('<h1 style="font-family:sans-serif;padding:2em">数据加载失败，无法生成 PDF</h1>');
            printWindow.document.close();
            return;
        }

        // 筛选记录：recorded（非 omit），blanks（omit）
        var recorded = state.records.filter(function (r) { return r.mode !== 'omit'; });
        var blanks = state.records.filter(function (r) { return r.mode === 'omit'; });

        // 按 events.json 的 chapters 顺序构建章节数据（洛阳、山阳、会稽三章）
        var chaptersData = [];
        var chapterIds = [2, 3, 4];

        for (var i = 0; i < chapterIds.length; i++) {
            var chapterId = chapterIds[i];
            var chapterInfo = data.chapters.find(function (ch) { return ch.id === chapterId; });
            if (!chapterInfo) continue;

            var chapterEvents = [];

            for (var j = 0; j < recorded.length; j++) {
                var record = recorded[j];
                var event = window.Book.eventById(data.events, record.eventId);
                if (event && event.chapter === chapterId) {
                    var choice = event.choices[record.choiceIndex];
                    chapterEvents.push({
                        title: event.title,
                        place: event.place,
                        ancientText: event.source,
                        modernText: event.translation,
                        choiceText: choice ? choice.text : '无记录',
                        axes: choice ? choice.axes : {lijiao: 0, qingli: 0, kuangshen: 0},
                        mode: record.mode,
                        gate: record.gate,
                        zhuan: choice ? choice.zhuan : '',
                        censored: !!event.censored
                    });
                }
            }

            if (chapterEvents.length > 0) {
                chaptersData.push({
                    title: chapterInfo.title,
                    intro: chapterInfo.intro,
                    events: chapterEvents
                });
            }
        }

        // 模式标记映射
        var modeMarks = {
            record: '直书',
            euphemism: '微词',
            cut: '削事存言',
            demoted: '降门',
            omit: '阙'
        };

        // 门别名称映射
        var gateNames = {};
        data.gates.forEach(function (g) { gateNames[g.id] = g.name; });

        // 生成打印 HTML
        var printHTML = generatePrintHTML({
            playerName: playerName,
            recorded: recorded,
            blanks: blanks,
            chaptersData: chaptersData,
            modeMarks: modeMarks,
            gateNames: gateNames,
            state: state,
            data: data
        });

        printWindow.document.write(printHTML);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }, 300);
}

// 生成打印用 HTML 的核心函数
function generatePrintHTML(params) {
    var playerName = params.playerName;
    var recorded = params.recorded;
    var blanks = params.blanks;
    var chaptersData = params.chaptersData;
    var modeMarks = params.modeMarks;
    var gateNames = params.gateNames;
    var state = params.state;
    var data = params.data;

    var today = new Date().toLocaleDateString("zh-CN");
    var totalRecorded = recorded.length;
    var totalBlanks = blanks.length;

    // 统计各模式数量
    var modeCounts = {};
    recorded.forEach(function (r) { modeCounts[r.mode] = (modeCounts[r.mode] || 0) + 1; });

    // 统计各门别数量
    var gateCounts = {};
    recorded.forEach(function (r) { if (r.gate) gateCounts[r.gate] = (gateCounts[r.gate] || 0) + 1; });

    // 找出主要门别
    var dominantGateId = Object.keys(gateCounts).reduce(function (a, b) {
        return gateCounts[a] > gateCounts[b] ? a : b;
    }, null);
    var dominantGateName = dominantGateId ? gateNames[dominantGateId] : '无';
    var dominantGateInfo = dominantGateId ? data.gates.find(function (g) { return g.id === dominantGateId; }) : null;

    // 编者按文本
    var zhuanClauses = recorded.map(function (record) {
        var event = window.Book.eventById(data.events, record.eventId);
        var choice = event.choices[record.choiceIndex];
        return '于《' + event.title + '》' + choice.zhuan;
    });
    var noteText = '门客' + state.name + '，受命采魏晋轶事。所历九事，记' + totalRecorded + '，'
        + (totalBlanks > 0 ? '阙' + totalBlanks + '，' : '无阙，')
        + '其取舍曰：' + (zhuanClauses.length > 0 ? zhuanClauses.join('；') + '。' : '未着一字。')
        + '所记之卷，以《' + dominantGateName + '》为最厚——'
        + (dominantGateInfo ? dominantGateInfo.closing : '')
        + (totalBlanks > 0 ? '阙处不书，阙即是书。' : '');

    // 检查是否有直笔 censored 事件
    var hadDirect = recorded.some(function (record) {
        var event = window.Book.eventById(data.events, record.eventId);
        return event && event.censored && record.mode === 'record';
    });
    if (!hadDirect) noteText += '通卷无一字直笔——书安全地美丽着。';

    // 构建章节 HTML
    var chaptersHTML = chaptersData.map(function (chapter) {
        var events = chapter.events || [];
        if (events.length === 0) return '';

        return `
        <div class="chapter">
            <h3>${chapter.title}</h3>
            <p class="chapter-intro">${chapter.intro}</p>
            ${events.map(function (event, idx) {
                var axes = event.axes || {lijiao: 0, qingli: 0, kuangshen: 0};
                var mode = event.mode || 'record';
                var gateName = event.gate ? gateNames[event.gate] : '未分门';
                var censoredMark = event.censored ? ' <span class="censored-mark">【烫】</span>' : '';

                return `
                <div class="sub-section">
                    <h4>${event.title}${censoredMark}</h4>
                    <p class="event-place">${event.place}</p>

                    <h5>1. 故事文言文版</h5>
                    <p class="ancient-text">${event.ancientText}</p>

                    <h5>2. 故事现代文翻译版</h5>
                    <p class="modern-text">${event.modernText}</p>

                    <h5>3. 玩家选择与立场</h5>
                    <div class="choice">
                        <p><strong>记录模式：</strong>${modeMarks[mode] || mode} ${gateName ? '· 入《' + gateName + '》' : ''}</p>
                        <p>${event.choiceText}</p>
                        <p class="axis-indicator">轴向偏移：名教${formatAxis(axes.lijiao)} | 情理${formatAxis(axes.qingli)} | 狂慎${formatAxis(axes.kuangshen)}</p>
                    </div>

                    <h5>4. 编者按语</h5>
                    <p class="zhuan">${event.zhuan || '无'}</p>
                </div>
                `;
            }).join('')}
            <div class="divider"></div>
        </div>`;
    }).join('');

    // 目录生成
    var tocHTML = '';
    if (chaptersData.length > 0) {
        tocHTML = `
        <div style="text-align: left; margin: 2em auto; max-width: 90%;">
            <h2>目录</h2>
            <ol>
                ${chaptersData.map(function (ch, i) {
                    return '<li>' + ch.title + ' <span class="toc-count">(' + ch.events.length + ' 则)</span></li>';
                }).join('')}
            </ol>
        </div>`;
    }

    // 模式统计字符串
    var modeStats = Object.entries(modeCounts).map(function (entry) {
        return modeMarks[entry[0]] + ' ' + entry[1] + '则';
    }).join('、') || '无';

    return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <title>世说新书 · ${playerName}编</title>
        <style>
            @page {
                size: A4;
                margin: 2cm;
                @bottom-center {
                    font-family: "Georgia", "Times New Roman", simsun, "Microsoft YaHei", serif;
                    font-size: 9pt;
                    content: "世说新书 · ${playerName}编 · " counter(page);
                }
            }
            body {
                font-family: "Georgia", "Times New Roman", simsun, "Microsoft YaHei", serif;
                font-size: 12pt;
                line-height: 1.7;
                color: #2c2c2c;
                margin: 0;
                padding: 0 2cm;
            }
            h1, h2, h3, h4, h5 {
                font-family: "Georgia", "Times New Roman", simsun, "Microsoft YaHei", serif;
                font-weight: 600;
                color: #1a1a2e;
                margin: 1.2em 0 0.6em 0;
                page-break-after: avoid;
            }
            h1 { font-size: 26pt; }
            h2 { font-size: 18pt; color: #3a3a5c; }
            h3 { font-size: 14pt; color: #2c3e50; border-bottom: 2px solid #3a3a5c; padding-bottom: 0.3em; }
            h4 { font-size: 12.5pt; color: #2c3e50; margin: 1.5em 0 0.5em 0; }
            h5 { font-size: 11.5pt; color: #4a4a6a; margin: 1em 0 0.4em 0; font-weight: 500; }
            p { margin: 0 0 0.6em 0; text-indent: 2em; text-align: justify; }
            .title-page { text-align: center; margin: 5em 0 3em 0; page-break-after: always; }
            .title-page h1 { font-size: 30pt; margin-bottom: 0.4em; letter-spacing: 0.1em; }
            .title-page h2 { font-size: 16pt; margin-bottom: 1.5em; color: #555; font-weight: 400; }
            .meta { font-size: 11pt; color: #777; margin: 1.5em 0; }
            .chapter-intro { font-size: 11pt; color: #555; margin: 0.5em 0 1.5em 0; text-indent: 2em; font-style: italic; }
            .event-place { font-size: 10pt; color: #888; margin: 0 0 0.8em 0; text-indent: 0; font-style: italic; }
            .ancient-text { font-size: 11.5pt; margin: 0.8em 0; text-indent: 2em; color: #2a2a2a; line-height: 1.8; }
            .modern-text { font-size: 11pt; margin: 0.8em 0; color: #3a3a3a; line-height: 1.7; }
            .choice { background: #fafafa; border-left: 3px solid #555; padding: 0.8em 1em; margin: 0.8em 0; font-size: 11pt; page-break-inside: avoid; }
            .choice p { margin: 0.3em 0; text-indent: 0; }
            .axis-indicator { font-size: 10pt; color: #666; margin-top: 0.5em !important; }
            .zhuan { font-size: 10.5pt; color: #444; margin: 0.5em 0; padding-left: 1em; border-left: 2px solid #ddd; font-style: italic; text-indent: 0; }
            .aftermath { font-size: 10pt; color: #555; margin: 0.5em 0; text-indent: 0; }
            .divider { width: 100%; height: 1px; background: #e0e0e0; margin: 2.5em 0; }
            .censored-mark { color: #c00; font-size: 0.85em; font-weight: bold; }
            .toc-count { color: #888; font-weight: 400; font-size: 0.9em; }
            .chapter { page-break-before: always; margin-bottom: 2em; }
            .chapter:first-of-type { page-break-before: auto; }
            .editor-note-page { page-break-before: always; margin-top: 2em; }
            .last-page { text-align: center; margin: 5em 0; font-size: 14pt; color: #666; letter-spacing: 0.2em; }
            .stat-item { margin: 0.3em 0; text-indent: 0; }
        </style>
    </head>
    <body>
        <!-- ==== 第一页：标题页 ==== -->
        <div class="title-page">
            <h1>世说新书 · ${playerName}编</h1>
            <h2>南朝刘义庆组织编纂</h2>
            <div class="meta">成书于 ${today}</div>
            ${tocHTML}
        </div>

        <!-- ==== 第二页：编者信息 + 编者按 ==== -->
        <div class="chapter editor-note-page">
            <h2>编者信息</h2>
            <div class="section">
                <p class="stat-item"><strong>编者姓名：</strong>${playerName}</p>
                <p class="stat-item"><strong>编纂身份：</strong>南朝刘义庆门客</p>
                <p class="stat-item"><strong>成书时间：</strong>${today}</p>
                <p class="stat-item"><strong>书籍内容：</strong>九件魏晋轶事，记${totalRecorded}事${totalBlanks > 0 ? '，阙' + totalBlanks + '处' : '，无阙'}。</p>
                <p class="stat-item"><strong>主要门别：</strong>${dominantGateName}（${gateCounts[dominantGateId] || 0}则）</p>
                <p class="stat-item"><strong>记录模式：</strong>${modeStats}</p>
                <p class="stat-item"><strong>编写背景：</strong>受命编撰魏晋轶事集，游历洛阳—山阳—会稽，依三条轴线（名教↔自然、情↔理、狂↔慎）取舍，记或不记，风声贯穿全程，决定书成之日命运。</p>
            </div>

            <h2>编者按</h2>
            <p>${noteText}</p>
        </div>

        <!-- ==== 章节正文 ==== -->
        ${chaptersHTML}

        <!-- ==== 结尾 ==== -->
        <div class="last-page">
            ——全书完——
        </div>
    </body>
    </html>`;
}

// 辅助：格式化轴向显示
function formatAxis(val) {
    if (val > 0) return '右(' + val + ')';
    if (val < 0) return '左(' + Math.abs(val) + ')';
    return '中(0)';
}

// 辅助函数：根据章节ID获取标题（保留兼容）
function getChapterTitle(chapterId) {
    var titles = {
        2: '第二章 · 洛阳',
        3: '第三章 · 山阳',
        4: '第四章 · 会稽'
    };
    return titles[chapterId] || '未知章节';
}
