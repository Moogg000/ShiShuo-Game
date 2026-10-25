(function () {
    // 《世说》编书人：新玩法的共享状态与数据加载模块。
    // 旧玩法的 state.js（风度值）保持不动，两套互不影响。
    var STORAGE_KEY = 'shishuo-book-v1';

    function freshState() {
        return {
            version: 1,
            name: '无名客',
            originDone: false,
            axes: { lijiao: 0, qingli: 0, kuangshen: 0 },
            closest: null,
            farthest: null,
            chapter: 2,
            eventIndex: 0,
            records: [],
            pressure: 0,
            finale: null
        };
    }

    function readState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            var state = JSON.parse(raw);
            if (!state || state.version !== 1) return null;
            // 补齐可能缺失的字段，容忍旧档
            var fresh = freshState();
            Object.keys(fresh).forEach(function (key) {
                if (!(key in state)) state[key] = fresh[key];
            });
            return state;
        } catch (error) {
            console.warn('书稿存档读取失败：', error);
            return null;
        }
    }

    function writeState(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.warn('书稿存档写入失败：', error);
        }
    }

    function clearState() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.warn('书稿存档清除失败：', error);
        }
    }

    function fetchJson(url) {
        return fetch(url).then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status + ' @ ' + url);
            return response.json();
        });
    }

    var dataPromise = null;
    function loadData() {
        if (dataPromise) return dataPromise;
        dataPromise = Promise.all([
            fetchJson('data/axes.json'),
            fetchJson('data/origin.json'),
            fetchJson('data/sages.json'),
            fetchJson('data/gates.json'),
            fetchJson('data/events.json'),
            fetchJson('data/pressure.json')
        ]).then(function (loaded) {
            var data = {
                axes: loaded[0].axes,
                origin: loaded[1],
                sages: loaded[2].sages,
                gates: loaded[3].gates,
                eventsData: loaded[4],
                pressure: loaded[5]
            };
            data.events = data.eventsData.events;
            data.chapters = data.eventsData.chapters;
            data.finale = data.eventsData.finale;
            return data;
        });
        return dataPromise;
    }

    function clampAxis(value) {
        var num = Number(value) || 0;
        return Math.max(-3, Math.min(3, num));
    }

    // 名士亲和：玩家各轴坐标（夹在 -3..3）与名士坐标的曼哈顿距离。
    function affinity(sages, axes) {
        var scored = sages.map(function (sage) {
            var distance = Object.keys(sage.axes).reduce(function (sum, axisId) {
                var sageValue = sage.axes[axisId] || 0;
                var playerValue = clampAxis(axes[axisId] || 0);
                return sum + Math.abs(sageValue - playerValue);
            }, 0);
            return { sage: sage, distance: distance };
        });
        scored.sort(function (a, b) { return a.distance - b.distance; });
        return {
            closest: scored[0].sage,
            farthest: scored[scored.length - 1].sage
        };
    }

    // 结局：书稿归门统计（仅记入的条目，含微词/削事/降门，不含留白）。
    function gateTally(state, data) {
        var tally = {};
        state.records.forEach(function (record) {
            if (!record.gate) return;
            if (record.mode === 'omit') return;
            tally[record.gate] = (tally[record.gate] || 0) + 1;
        });
        return tally;
    }

    function dominantGate(state, data) {
        var tally = gateTally(state, data);
        var best = null;
        var bestCount = 0;
        data.gates.forEach(function (gate) {
            var count = tally[gate.id] || 0;
            if (count > bestCount) { best = gate; bestCount = count; }
        });
        return best;
    }

    function eventById(events, eventId) {
        return events.find(function (item) { return item.id === eventId; }) || null;
    }

    function sageById(sages, sageId) {
        return sages.find(function (item) { return item.id === sageId; }) || null;
    }

    function gateById(gates, gateId) {
        return gates.find(function (item) { return item.id === gateId; }) || null;
    }

    window.Book = {
        loadData: loadData,
        freshState: freshState,
        readState: readState,
        writeState: writeState,
        clearState: clearState,
        affinity: affinity,
        gateTally: gateTally,
        dominantGate: dominantGate,
        eventById: eventById,
        sageById: sageById,
        gateById: gateById
    };
}());
