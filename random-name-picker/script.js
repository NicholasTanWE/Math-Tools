// script.js

document.addEventListener('DOMContentLoaded', function() {
    // Landing page logic
    const numbersBtn = document.getElementById('numbers-btn');
    const namesBtn = document.getElementById('names-btn');
    const numbersSection = document.getElementById('numbers-section');
    const namesSection = document.getElementById('names-section');
    const uploadBtn = document.getElementById('upload-btn');
    const csvUpload = document.getElementById('csv-upload');
    const minInput = document.getElementById('min-input');
    const maxInput = document.getElementById('max-input');
    const proceedNumbersBtn = document.getElementById('proceed-numbers-btn');

    if (numbersBtn) {
        numbersBtn.addEventListener('click', function() {
            numbersSection.classList.remove('hidden');
        });
    }

    if (namesBtn) {
        namesBtn.addEventListener('click', function() {
            namesSection.classList.remove('hidden');
        });
    }

    // Cached names controls on landing page
    const useCachedBtn = document.getElementById('use-cached-names');
    const clearCachedBtn = document.getElementById('clear-cached-names');
    const cachedCountSpan = document.getElementById('cached-names-count');
    function refreshCachedCount() {
        let cached = [];
        try { cached = JSON.parse(localStorage.getItem('names') || '[]'); } catch(e) { cached = []; }
        if (cachedCountSpan) cachedCountSpan.textContent = cached.length ? `${cached.length} names cached` : 'No cached names';
        if (useCachedBtn) useCachedBtn.disabled = !cached.length;
        if (clearCachedBtn) clearCachedBtn.disabled = !cached.length;
    }
    refreshCachedCount();
    if (useCachedBtn) {
        useCachedBtn.addEventListener('click', function() {
            const cached = JSON.parse(localStorage.getItem('names') || '[]');
            if (!cached || cached.length === 0) {
                showToast('No cached names available. Please upload a CSV.', 'warn');
                return;
            }
            // navigate to selection page which will read localStorage.names
            window.location.href = 'selection.html';
        });
    }
    if (clearCachedBtn) {
        clearCachedBtn.addEventListener('click', function() {
            localStorage.removeItem('names');
            refreshCachedCount();
            showToast('Cached names cleared.', 'success');
        });
    }

    if (proceedNumbersBtn) {
        proceedNumbersBtn.addEventListener('click', function() {
            const min = parseInt(minInput.value);
            const max = parseInt(maxInput.value);
            if (isNaN(min) || isNaN(max) || min >= max) {
                showToast('Please enter valid range with min < max.', 'warn');
            } else {
                localStorage.setItem('numberRange', JSON.stringify({ min, max }));
                window.location.href = 'number-selection.html';
            }
        });
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            const file = csvUpload.files[0];
            if (file) {
                const reader = new FileReader();
                if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
                    // parse Excel using SheetJS
                    reader.onload = function(e) {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        // flatten first column values
                        const names = json.map(row => (row[0] ? String(row[0]).trim() : '')).filter(Boolean);
                        localStorage.setItem('names', JSON.stringify(names));
                        window.location.href = 'selection.html';
                    };
                    reader.readAsArrayBuffer(file);
                } else {
                    reader.onload = function(e) {
                        const csv = e.target.result;
                        const names = csv.split('\n').map(line => line.trim()).filter(line => line);
                        localStorage.setItem('names', JSON.stringify(names));
                        window.location.href = 'selection.html';
                    };
                    reader.readAsText(file);
                }
            } else {
                showToast('Please select a CSV file.', 'warn');
            }
        });
    }

    // Toast container and helper
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    function showToast(message, type = 'info', duration = 3000) {
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.textContent = message;
        toastContainer.appendChild(t);
        // show
        requestAnimationFrame(() => t.classList.add('show'));
        // auto-remove
        setTimeout(() => {
            t.classList.remove('show');
            setTimeout(() => { try { toastContainer.removeChild(t); } catch(e){} }, 220);
        }, duration);
    }

    // --- Persistence: load persisted state for names and numbers ---
    // Load names and selection history if present
    const persistedNames = JSON.parse(localStorage.getItem('names') || 'null');
    if (persistedNames && persistedNames.length) {
        // leave in localStorage; selection page will read when opened
    }
    // Number persistence handled on number-selection page when it loads

    // Selection page logic
    const randomizeRepeat = document.getElementById('randomize-repeat');
    const randomizeNoRepeat = document.getElementById('randomize-no-repeat');
    const uploadNew = document.getElementById('upload-new');
    const toggleAnimationsNamesBtn = document.getElementById('toggle-animations-names');
    const displayArea = document.getElementById('display-area');
    let selectedName = document.getElementById('selected-name');

    let names = [];
    let usedNames = [];
    let selectedNames = [];

    // load persisted name state
    try {
        names = JSON.parse(localStorage.getItem('names') || '[]');
    } catch (e) { names = []; }
    try {
        selectedNames = JSON.parse(localStorage.getItem('selectedNames') || '[]');
    } catch (e) { selectedNames = []; }
    try {
        usedNames = JSON.parse(localStorage.getItem('usedNames') || '[]');
    } catch (e) { usedNames = []; }

    // animation toggle for names (persisted)
    let animationsEnabledNames = true;
    try { const v = localStorage.getItem('animationsEnabledNames'); if (v !== null) animationsEnabledNames = JSON.parse(v); } catch(e){}
    if (toggleAnimationsNamesBtn) {
        toggleAnimationsNamesBtn.textContent = animationsEnabledNames ? 'Disable Animations' : 'Enable Animations';
        toggleAnimationsNamesBtn.addEventListener('click', function() {
            animationsEnabledNames = !animationsEnabledNames;
            localStorage.setItem('animationsEnabledNames', JSON.stringify(animationsEnabledNames));
            toggleAnimationsNamesBtn.textContent = animationsEnabledNames ? 'Disable Animations' : 'Enable Animations';
        });
    }

    function updateNameHistory() {
        const list = document.getElementById('name-history-list');
        if (list) {
            list.innerHTML = '';
            selectedNames.forEach(name => {
                const li = document.createElement('li');
                li.textContent = name;
                list.appendChild(li);
            });
        }
    }

    // render any persisted history immediately
    updateNameHistory();

    if (randomizeRepeat || randomizeNoRepeat) {
        names = JSON.parse(localStorage.getItem('names')) || [];
        if (names.length === 0) {
            showToast('No names loaded. Please upload a CSV first.', 'warn');
            window.location.href = 'index.html';
        }
    }

    // helper to enable/disable controls during flicker
    function setNameControlsEnabled(enabled) {
        [randomizeRepeat, randomizeNoRepeat, uploadNew, clearNamesBtn].forEach(btn => {
            if (btn) btn.disabled = !enabled;
        });
    }
    // slot-roll animation helper
    function slotRoll(items, finalValue, duration = 1500, itemHeight = 56) {
        return new Promise(resolve => {
            // build slot DOM
            const container = document.createElement('div');
            container.className = 'slot-container';
            const list = document.createElement('div');
            list.className = 'slot-list';

            const steps = 30; // how many random steps before final
            const seq = [];
            for (let i = 0; i < steps; i++) {
                seq.push(items[Math.floor(Math.random() * items.length)]);
            }
            seq.push(finalValue);

            seq.forEach(v => {
                const it = document.createElement('div');
                it.className = 'slot-item';
                it.textContent = v;
                list.appendChild(it);
            });

            container.appendChild(list);
            // replace display content
            displayArea.innerHTML = '';
            displayArea.appendChild(container);

            // trigger transition
            const totalTranslate = (seq.length - 1) * itemHeight;
            // ensure starting position
            list.style.transform = 'translateY(0px)';
            list.style.transition = 'none';
            // force reflow
            // eslint-disable-next-line no-unused-expressions
            list.offsetHeight;
            list.style.transition = `transform ${duration}ms cubic-bezier(0.2,0.8,0.2,1)`;
            requestAnimationFrame(() => {
                list.style.transform = `translateY(-${totalTranslate}px)`;
            });

            list.addEventListener('transitionend', function handler() {
                list.removeEventListener('transitionend', handler);
                // cleanup and show final — replace the slot container in-place to avoid flash
                const p = document.createElement('p');
                // keep same id where possible
                p.id = (typeof finalValue === 'number') ? 'selected-number' : 'selected-name';
                p.textContent = finalValue;
                try {
                    if (container.parentNode === displayArea) {
                        displayArea.replaceChild(p, container);
                    } else {
                        // fallback
                        displayArea.innerHTML = '';
                        displayArea.appendChild(p);
                    }
                } catch (e) {
                    // fallback
                    displayArea.innerHTML = '';
                    displayArea.appendChild(p);
                }
                resolve(finalValue);
            });
        });
    }

    // Helpers to reliably set the displayed name/number even if slotRoll replaced DOM
    function setDisplayedName(value) {
        let el = document.getElementById('selected-name');
        if (!el) {
            // recreate element inside displayArea
            displayArea.innerHTML = '';
            el = document.createElement('p');
            el.id = 'selected-name';
            displayArea.appendChild(el);
        }
        el.textContent = value;
        return el;
    }

    function setDisplayedNumber(value) {
        let el = document.getElementById('selected-number');
        if (!el) {
            displayArea.innerHTML = '';
            el = document.createElement('p');
            el.id = 'selected-number';
            displayArea.appendChild(el);
        }
        el.textContent = value;
        return el;
    }

    // Compute an itemHeight (px) for name items to accommodate wrapping (maxLines default 2)
    function computeItemHeightForNames(namesArray, maxLines = 2) {
        try {
            // create hidden measurer
            const measurer = document.createElement('div');
            measurer.style.position = 'absolute';
            measurer.style.visibility = 'hidden';
            measurer.style.width = `${displayArea.clientWidth}px`;
            measurer.style.fontSize = '48px';
            measurer.style.lineHeight = '1';
            measurer.style.padding = '0.25rem 0.5rem';
            measurer.style.boxSizing = 'border-box';
            measurer.style.whiteSpace = 'normal';
            measurer.style.overflowWrap = 'break-word';
            measurer.style.textAlign = 'center';
            // clamp lines by capping max-height
            const lineHeightPx = 48; // approximate because font-size 48px with line-height ~1
            const maxHeight = lineHeightPx * maxLines + 8; // padding allowance
            measurer.style.maxHeight = `${maxHeight}px`;
            document.body.appendChild(measurer);

            // test a few longest candidates
            const candidates = namesArray.slice().sort((a,b) => b.length - a.length).slice(0,5);
            let maxMeasured = 56;
            candidates.forEach(c => {
                measurer.textContent = c;
                const h = Math.min(measurer.scrollHeight, maxHeight);
                if (h > maxMeasured) maxMeasured = h;
            });
            document.body.removeChild(measurer);
            return Math.ceil(maxMeasured);
        } catch (e) {
            return 56; // fallback
        }
    }

    if (randomizeRepeat) {
        randomizeRepeat.addEventListener('click', function() {
            if (names.length === 0) return;
            const finalIdx = Math.floor(Math.random() * names.length);
            const finalName = names[finalIdx];
            if (!animationsEnabledNames) {
                // instant
                setDisplayedName(finalName);
                selectedNames.push(finalName);
                try { localStorage.setItem('selectedNames', JSON.stringify(selectedNames)); } catch(e){}
                updateNameHistory();
                displayArea.classList.add('flourish');
                setTimeout(() => displayArea.classList.remove('flourish'), 500);
            } else {
                setNameControlsEnabled(false);
                const itemH = computeItemHeightForNames(names, 2);
                slotRoll(names, finalName, undefined, itemH).then(name => {
                    selectedNames.push(name);
                    try { localStorage.setItem('selectedNames', JSON.stringify(selectedNames)); } catch(e){}
                    updateNameHistory();
                    // rebind cached selectedName to the newly-created element
                    selectedName = document.getElementById('selected-name');
                    displayArea.classList.add('flourish');
                    setTimeout(() => displayArea.classList.remove('flourish'), 500);
                    setNameControlsEnabled(true);
                });
            }
        });
    }

    if (randomizeNoRepeat) {
        randomizeNoRepeat.addEventListener('click', function() {
            if (names.length === 0) return;
            if (usedNames.length >= names.length) {
                showToast('All names have been used. Resetting.', 'info');
                usedNames = [];
                try { localStorage.removeItem('usedNames'); } catch(e){}
            }
            let availableNames = names.filter(name => !usedNames.includes(name));
            if (availableNames.length === 0) return;
            // slot-roll over available names
            const finalIdx = Math.floor(Math.random() * availableNames.length);
            const finalName = availableNames[finalIdx];
            if (!animationsEnabledNames) {
                // instant
                setDisplayedName(finalName);
                usedNames.push(finalName);
                selectedNames.push(finalName);
                try { localStorage.setItem('usedNames', JSON.stringify(usedNames)); } catch(e){}
                try { localStorage.setItem('selectedNames', JSON.stringify(selectedNames)); } catch(e){}
                updateNameHistory();
                displayArea.classList.add('flourish');
                setTimeout(() => displayArea.classList.remove('flourish'), 500);
            } else {
                setNameControlsEnabled(false);
                const itemH2 = computeItemHeightForNames(availableNames, 2);
                slotRoll(availableNames, finalName, undefined, itemH2).then(name => {
                    usedNames.push(name);
                    selectedNames.push(name);
                    try { localStorage.setItem('usedNames', JSON.stringify(usedNames)); } catch(e){}
                    try { localStorage.setItem('selectedNames', JSON.stringify(selectedNames)); } catch(e){}
                    updateNameHistory();
                    // rebind cached selectedName to the newly-created element
                    selectedName = document.getElementById('selected-name');
                    displayArea.classList.add('flourish');
                    setTimeout(() => displayArea.classList.remove('flourish'), 500);
                    setNameControlsEnabled(true);
                });
            }
        });
    }

    if (uploadNew) {
        uploadNew.addEventListener('click', function() {
            // keep names but clear selection history when uploading new file
            selectedNames = [];
            try { localStorage.removeItem('selectedNames'); } catch(e){}
            try { localStorage.removeItem('usedNames'); } catch(e){}
            updateNameHistory();
            window.location.href = 'index.html';
        });
    }

    // Clear generated names button
    const clearNamesBtn = document.getElementById('clear-names');
    if (clearNamesBtn) {
        clearNamesBtn.addEventListener('click', function() {
            selectedNames = [];
            try { localStorage.removeItem('selectedNames'); } catch(e){}
            updateNameHistory();
            showToast('Generated names cleared.', 'success');
        });
    }

    // Number selection page logic
    const randomizeNumberRepeat = document.getElementById('randomize-number-repeat');
    const randomizeNumberNoRepeat = document.getElementById('randomize-number-no-repeat');
    const toggleAnimationsNumbersBtn = document.getElementById('toggle-animations-numbers');
    const clearHistory = document.getElementById('clear-history');
    let selectedNumber = document.getElementById('selected-number');

    let range = {};
    let usedNumbers = [];
    let generatedNumbers = [];
    // load persisted number state
    try { range = JSON.parse(localStorage.getItem('numberRange') || '{}'); } catch(e){ range = {}; }
    try { generatedNumbers = JSON.parse(localStorage.getItem('generatedNumbers') || '[]'); } catch(e){ generatedNumbers = []; }
    try { usedNumbers = JSON.parse(localStorage.getItem('usedNumbers') || '[]'); } catch(e){ usedNumbers = []; }
    function updateHistory() {
        const list = document.getElementById('history-list');
        if (list) {
            list.innerHTML = '';
            generatedNumbers.forEach(num => {
                const li = document.createElement('li');
                li.textContent = num;
                list.appendChild(li);
            });
        }
    }

    // animation toggle for numbers (persisted)
    let animationsEnabledNumbers = true;
    try { const v = localStorage.getItem('animationsEnabledNumbers'); if (v !== null) animationsEnabledNumbers = JSON.parse(v); } catch(e){}
    if (toggleAnimationsNumbersBtn) {
        toggleAnimationsNumbersBtn.textContent = animationsEnabledNumbers ? 'Disable Animations' : 'Enable Animations';
        toggleAnimationsNumbersBtn.addEventListener('click', function() {
            animationsEnabledNumbers = !animationsEnabledNumbers;
            localStorage.setItem('animationsEnabledNumbers', JSON.stringify(animationsEnabledNumbers));
            toggleAnimationsNumbersBtn.textContent = animationsEnabledNumbers ? 'Disable Animations' : 'Enable Animations';
        });
    }

    // Range update controls on number-selection page
    const currentRangeSpan = document.getElementById('current-range');
    const rangeMinInput = document.getElementById('range-min-input');
    const rangeMaxInput = document.getElementById('range-max-input');
    const updateRangeBtn = document.getElementById('update-range-btn');
    function refreshCurrentRangeUI() {
        if (currentRangeSpan) currentRangeSpan.textContent = (range && typeof range.min === 'number' && typeof range.max === 'number') ? `${range.min} — ${range.max}` : 'Not set';
        if (rangeMinInput) rangeMinInput.value = (range && typeof range.min === 'number') ? range.min : '';
        if (rangeMaxInput) rangeMaxInput.value = (range && typeof range.max === 'number') ? range.max : '';
    }
    refreshCurrentRangeUI();
    if (updateRangeBtn) {
        updateRangeBtn.addEventListener('click', function() {
            const newMin = parseInt(rangeMinInput.value);
            const newMax = parseInt(rangeMaxInput.value);
            if (isNaN(newMin) || isNaN(newMax) || newMin >= newMax) {
                showToast('Please enter a valid min < max range.', 'warn');
                return;
            }
            range = { min: newMin, max: newMax };
            try { localStorage.setItem('numberRange', JSON.stringify(range)); } catch(e){}
            refreshCurrentRangeUI();
            showToast('Number range updated.', 'success');
        });
    }

    if (randomizeNumberRepeat || randomizeNumberNoRepeat) {
        range = JSON.parse(localStorage.getItem('numberRange')) || {};
        if (!range.min || !range.max) {
            showToast('No range set. Please set range first.', 'warn');
            window.location.href = 'index.html';
        }
    }

    if (randomizeNumberRepeat) {
        randomizeNumberRepeat.addEventListener('click', function() {
            if (!range || typeof range.min !== 'number' || typeof range.max !== 'number') return;
            const finalNum = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
            if (!animationsEnabledNumbers) {
                // instant
                setDisplayedNumber(finalNum);
                generatedNumbers.push(finalNum);
                try { localStorage.setItem('generatedNumbers', JSON.stringify(generatedNumbers)); } catch(e){}
                updateHistory();
                displayArea.classList.add('flourish');
                setTimeout(() => displayArea.classList.remove('flourish'), 500);
            } else {
                // disable number controls
                [randomizeNumberRepeat, randomizeNumberNoRepeat, clearHistory].forEach(btn => { if (btn) btn.disabled = true; });
                // build a sampled items array for visual rolling
                const items = [];
                const sampleCount = Math.min(40, range.max - range.min + 1);
                for (let i = 0; i < sampleCount; i++) {
                    items.push(Math.floor(Math.random() * (range.max - range.min + 1)) + range.min);
                }
                slotRoll(items, finalNum).then(num => {
                    generatedNumbers.push(num);
                    try { localStorage.setItem('generatedNumbers', JSON.stringify(generatedNumbers)); } catch(e){}
                    updateHistory();
                    // rebind cached selectedNumber after animation replaced DOM
                    selectedNumber = document.getElementById('selected-number');
                    displayArea.classList.add('flourish');
                    setTimeout(() => displayArea.classList.remove('flourish'), 500);
                    [randomizeNumberRepeat, randomizeNumberNoRepeat, clearHistory].forEach(btn => { if (btn) btn.disabled = false; });
                });
            }
        });
    }

    if (randomizeNumberNoRepeat) {
        randomizeNumberNoRepeat.addEventListener('click', function() {
            if (!range || typeof range.min !== 'number' || typeof range.max !== 'number') return;
            const totalNumbers = range.max - range.min + 1;
            if (usedNumbers.length >= totalNumbers) {
                showToast('All numbers have been used. Clearing history.', 'info');
                usedNumbers = [];
                try { localStorage.removeItem('usedNumbers'); } catch(e){}
            }
            let availableNumbers = [];
            for (let i = range.min; i <= range.max; i++) {
                if (!usedNumbers.includes(i)) {
                    availableNumbers.push(i);
                }
            }
            if (availableNumbers.length === 0) return;
            const finalIdx = Math.floor(Math.random() * availableNumbers.length);
            const finalNum = availableNumbers[finalIdx];
            if (!animationsEnabledNumbers) {
                setDisplayedNumber(finalNum);
                usedNumbers.push(finalNum);
                generatedNumbers.push(finalNum);
                try { localStorage.setItem('usedNumbers', JSON.stringify(usedNumbers)); } catch(e){}
                try { localStorage.setItem('generatedNumbers', JSON.stringify(generatedNumbers)); } catch(e){}
                updateHistory();
                displayArea.classList.add('flourish');
                setTimeout(() => displayArea.classList.remove('flourish'), 500);
            } else {
                const duration = 1500;
                [randomizeNumberRepeat, randomizeNumberNoRepeat, clearHistory].forEach(btn => { if (btn) btn.disabled = true; });
                slotRoll(availableNumbers, finalNum, duration).then(num => {
                    usedNumbers.push(num);
                    generatedNumbers.push(num);
                    try { localStorage.setItem('usedNumbers', JSON.stringify(usedNumbers)); } catch(e){}
                    try { localStorage.setItem('generatedNumbers', JSON.stringify(generatedNumbers)); } catch(e){}
                    updateHistory();
                    // rebind cached selectedNumber after animation replaced DOM
                    selectedNumber = document.getElementById('selected-number');
                    displayArea.classList.add('flourish');
                    setTimeout(() => displayArea.classList.remove('flourish'), 500);
                    [randomizeNumberRepeat, randomizeNumberNoRepeat, clearHistory].forEach(btn => { if (btn) btn.disabled = false; });
                });
            }
        });
    }

    if (clearHistory) {
        clearHistory.addEventListener('click', function() {
            usedNumbers = [];
            generatedNumbers = [];
            try { localStorage.removeItem('usedNumbers'); } catch(e){}
            try { localStorage.removeItem('generatedNumbers'); } catch(e){}
            updateHistory();
            showToast('History cleared.', 'success');
        });
    }
});