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

    if (proceedNumbersBtn) {
        proceedNumbersBtn.addEventListener('click', function() {
            const min = parseInt(minInput.value);
            const max = parseInt(maxInput.value);
            if (isNaN(min) || isNaN(max) || min >= max) {
                alert('Please enter valid range with min < max.');
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
                alert('Please select a CSV file.');
            }
        });
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
    const displayArea = document.getElementById('display-area');
    const selectedName = document.getElementById('selected-name');

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
            alert('No names loaded. Please upload a CSV first.');
            window.location.href = 'index.html';
        }
    }

    if (randomizeRepeat) {
        randomizeRepeat.addEventListener('click', function() {
            if (names.length > 0) {
                const randomIndex = Math.floor(Math.random() * names.length);
                selectedName.textContent = names[randomIndex];
                selectedNames.push(names[randomIndex]);
                try { localStorage.setItem('selectedNames', JSON.stringify(selectedNames)); } catch(e){}
                updateNameHistory();
                displayArea.classList.add('flourish');
                setTimeout(() => displayArea.classList.remove('flourish'), 500);
            }
        });
    }

    if (randomizeNoRepeat) {
        randomizeNoRepeat.addEventListener('click', function() {
            if (usedNames.length >= names.length) {
                alert('All names have been used. Resetting.');
                usedNames = [];
            }
            let availableNames = names.filter(name => !usedNames.includes(name));
            if (availableNames.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableNames.length);
                const selected = availableNames[randomIndex];
                selectedName.textContent = selected;
                usedNames.push(selected);
                selectedNames.push(selected);
                try { localStorage.setItem('usedNames', JSON.stringify(usedNames)); } catch(e){}
                try { localStorage.setItem('selectedNames', JSON.stringify(selectedNames)); } catch(e){}
                updateNameHistory();
                displayArea.classList.add('flourish');
                setTimeout(() => displayArea.classList.remove('flourish'), 500);
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
            alert('Generated names cleared.');
        });
    }

    // Number selection page logic
    const randomizeNumberRepeat = document.getElementById('randomize-number-repeat');
    const randomizeNumberNoRepeat = document.getElementById('randomize-number-no-repeat');
    const clearHistory = document.getElementById('clear-history');
    const selectedNumber = document.getElementById('selected-number');

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

    if (randomizeNumberRepeat || randomizeNumberNoRepeat) {
        range = JSON.parse(localStorage.getItem('numberRange')) || {};
        if (!range.min || !range.max) {
            alert('No range set. Please set range first.');
            window.location.href = 'index.html';
        }
    }

    if (randomizeNumberRepeat) {
        randomizeNumberRepeat.addEventListener('click', function() {
            const num = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
            selectedNumber.textContent = num;
            generatedNumbers.push(num);
            try { localStorage.setItem('generatedNumbers', JSON.stringify(generatedNumbers)); } catch(e){}
            updateHistory();
            displayArea.classList.add('flourish');
            setTimeout(() => displayArea.classList.remove('flourish'), 500);
        });
    }

    if (randomizeNumberNoRepeat) {
        randomizeNumberNoRepeat.addEventListener('click', function() {
            const totalNumbers = range.max - range.min + 1;
            if (usedNumbers.length >= totalNumbers) {
                alert('All numbers have been used. Clearing history.');
                usedNumbers = [];
            }
            let availableNumbers = [];
            for (let i = range.min; i <= range.max; i++) {
                if (!usedNumbers.includes(i)) {
                    availableNumbers.push(i);
                }
            }
            if (availableNumbers.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableNumbers.length);
                const selected = availableNumbers[randomIndex];
                selectedNumber.textContent = selected;
                usedNumbers.push(selected);
                generatedNumbers.push(selected);
                try { localStorage.setItem('usedNumbers', JSON.stringify(usedNumbers)); } catch(e){}
                try { localStorage.setItem('generatedNumbers', JSON.stringify(generatedNumbers)); } catch(e){}
                updateHistory();
                displayArea.classList.add('flourish');
                setTimeout(() => displayArea.classList.remove('flourish'), 500);
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
            alert('History cleared.');
        });
    }
});