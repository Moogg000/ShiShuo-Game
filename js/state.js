(function () {
    var storageKey = 'shishuo-grace';
    var initialGrace = 12;

    function readGrace() {
        var storedGrace;
        try {
            storedGrace = Number(localStorage.getItem(storageKey));
        } catch (error) {
            storedGrace = initialGrace;
        }
        return Number.isFinite(storedGrace) && storedGrace >= 0 ? storedGrace : initialGrace;
    }

    function writeGrace(value) {
        var grace = Math.max(0, Math.floor(Number(value) || 0));
        try {
            localStorage.setItem(storageKey, String(grace));
        } catch (error) {
        }
        updateDisplays(grace);
        return grace;
    }

    function updateDisplays(grace) {
        document.querySelectorAll('[data-grace-value], #grace-value').forEach(function (element) {
            element.textContent = grace;
        });
    }

    window.ShiShuoState = {
        getGrace: readGrace,
        setGrace: writeGrace,
        addGrace: function (amount) {
            return writeGrace(readGrace() + Number(amount || 0));
        },
        spendGrace: function (amount) {
            var cost = Math.max(0, Number(amount) || 0);
            var currentGrace = readGrace();
            if (currentGrace < cost) return false;
            writeGrace(currentGrace - cost);
            return true;
        },
        refresh: function () {
            updateDisplays(readGrace());
        }
    };

    updateDisplays(readGrace());
}());
