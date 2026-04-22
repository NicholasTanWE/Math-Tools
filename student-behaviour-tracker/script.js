// ── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'studentBehaviourTracker_v1';

// ── State ────────────────────────────────────────────────────────────────────
let state = {
    students: [],       // ['Alice', 'Bob', ...]
    behaviours: {}      // { 'Alice': [{type:'positive'|'negative', ts:'...'}, ...] }
};

// ── DOM refs ─────────────────────────────────────────────────────────────────
const uploadSection   = document.getElementById('upload-section');
const trackerSection  = document.getElementById('tracker-section');
const csvFileInput    = document.getElementById('csv-file');
const uploadBtn       = document.getElementById('upload-btn');
const cachedNotice    = document.getElementById('cached-notice');
const loadCachedBtn   = document.getElementById('load-cached-btn');
const studentList     = document.getElementById('student-list');
const exportBtn       = document.getElementById('export-btn');
const resetBtn        = document.getElementById('reset-btn');
const studentCountEl  = document.getElementById('student-count');

// ── Init ─────────────────────────────────────────────────────────────────────
(function init() {
    const saved = loadFromCache();
    if (saved && saved.students && saved.students.length > 0) {
        cachedNotice.classList.remove('hidden');
    }
})();

// ── CSV Parsing ───────────────────────────────────────────────────────────────
function parseCSV(text) {
    const lines = text
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);

    // If the first line looks like a header (contains the word "name"), skip it
    const firstLower = lines[0] ? lines[0].toLowerCase() : '';
    const start = /^["']?name["']?$/i.test(firstLower) ? 1 : 0;

    // Take only the first column value from each row (handle comma-delimited rows)
    return lines.slice(start).map(line => {
        const col = line.split(',')[0].replace(/^["']|["']$/g, '').trim();
        return col;
    }).filter(name => name.length > 0);
}

// ── Timestamp ────────────────────────────────────────────────────────────────
function formatTimestamp() {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const h = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${d}/${mo}/${y} ${h}:${mi}:${s}`;
}

// ── Storage ───────────────────────────────────────────────────────────────────
function saveToCache() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('localStorage unavailable:', e);
    }
}

function loadFromCache() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function clearCache() {
    localStorage.removeItem(STORAGE_KEY);
}

// ── Drag-and-Drop state ──────────────────────────────────────────────────────
let dragSrc = null;

function onDragStart(e) {
    dragSrc = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.name);
}

function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.currentTarget;
    if (target === dragSrc) return;
    const rect = target.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    if (e.clientY < mid) {
        studentList.insertBefore(dragSrc, target);
    } else {
        studentList.insertBefore(dragSrc, target.nextSibling);
    }
}

function onDragEnd() {
    this.classList.remove('dragging');
    // Sync state.students order from DOM
    state.students = Array.from(studentList.querySelectorAll('.student-row'))
        .map(r => r.dataset.name);
    saveToCache();
}

// ── Render ────────────────────────────────────────────────────────────────
function renderStudentList() {
    studentList.innerHTML = '';

    state.students.forEach(name => {
        const row = document.createElement('div');
        row.className = 'student-row';
        row.draggable = true;
        row.dataset.name = name;

        // Drag handle
        const handle = document.createElement('div');
        handle.className = 'drag-handle';
        handle.title = 'Drag to reorder';
        handle.innerHTML = '&#8942;&#8942;'; // ⋮⋮

        // Name cell
        const nameCell = document.createElement('div');
        nameCell.className = 'student-name';
        nameCell.textContent = name;

        // Button group
        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';

        const posBtn = document.createElement('button');
        posBtn.className = 'behaviour-btn btn-positive';
        posBtn.textContent = '+';
        posBtn.title = 'Record positive behaviour';
        posBtn.addEventListener('click', () => recordBehaviour(name, 'positive'));

        const negBtn = document.createElement('button');
        negBtn.className = 'behaviour-btn btn-negative';
        negBtn.textContent = '−';
        negBtn.title = 'Record negative behaviour';
        negBtn.addEventListener('click', () => recordBehaviour(name, 'negative'));

        const topBtn = document.createElement('button');
        topBtn.className = 'behaviour-btn btn-top';
        topBtn.textContent = '⬆';
        topBtn.title = 'Send to top of list';
        topBtn.addEventListener('click', () => sendToTop(name));

        btnGroup.appendChild(posBtn);
        btnGroup.appendChild(negBtn);

        // Timestamps container
        const tsContainer = document.createElement('div');
        tsContainer.className = 'ts-container';
        tsContainer.id = `ts-${sanitiseId(name)}`;

        const entries = state.behaviours[name] || [];
        entries.forEach(entry => {
            tsContainer.appendChild(createBadge(entry, name));
        });

        row.appendChild(handle);
        row.appendChild(topBtn);
        row.appendChild(nameCell);
        row.appendChild(btnGroup);
        row.appendChild(tsContainer);

        row.addEventListener('dragstart', onDragStart);
        row.addEventListener('dragover', onDragOver);
        row.addEventListener('dragend', onDragEnd);

        studentList.appendChild(row);
    });

    studentCountEl.textContent = `${state.students.length} student${state.students.length !== 1 ? 's' : ''}`;
}

function createBadge(entry, name) {
    const badge = document.createElement('span');
    badge.className = `badge ${entry.type === 'positive' ? 'badge-positive' : 'badge-negative'} badge-removable`;
    const symbol = entry.type === 'positive' ? '+' : '−';
    badge.textContent = `${symbol} ${entry.ts}`;
    badge.title = 'Click to remove this entry';
    badge.addEventListener('click', () => {
        if (!confirm(`Remove this entry?\n${symbol} ${entry.ts}`)) return;
        const list = state.behaviours[name];
        const idx = list.findIndex(e => e.type === entry.type && e.ts === entry.ts);
        if (idx !== -1) list.splice(idx, 1);
        saveToCache();
        badge.remove();
    });
    return badge;
}

function sanitiseId(name) {
    return name.replace(/[^a-zA-Z0-9]/g, '_');
}

// ── Send to Top ──────────────────────────────────────────────────────────────
function sendToTop(name) {
    const idx = state.students.indexOf(name);
    if (idx <= 0) return;
    state.students.splice(idx, 1);
    state.students.unshift(name);
    saveToCache();
    renderStudentList();
}

// ── Record Behaviour ──────────────────────────────────────────────────────────
function recordBehaviour(name, type) {
    const entry = { type, ts: formatTimestamp() };

    if (!state.behaviours[name]) {
        state.behaviours[name] = [];
    }
    state.behaviours[name].push(entry);
    saveToCache();

    // Append badge without full re-render
    const container = document.getElementById(`ts-${sanitiseId(name)}`);
    if (container) {
        container.appendChild(createBadge(entry, name));
        // Scroll the container to show the newest badge
        container.scrollLeft = container.scrollWidth;
    }
}

// ── Show Tracker ──────────────────────────────────────────────────────────────
function showTracker() {
    uploadSection.classList.add('hidden');
    trackerSection.classList.remove('hidden');
    renderStudentList();
}

// ── Export ────────────────────────────────────────────────────────────────────
function exportData() {
    const rows = ['Student Name,Behaviour,Date,Time'];

    state.students.forEach(name => {
        const entries = state.behaviours[name] || [];
        if (entries.length === 0) {
            rows.push(`"${name}",,,""`);
        } else {
            entries.forEach(entry => {
                const [date, time] = entry.ts.split(' ');
                const typeLabel = entry.type === 'positive' ? 'Positive' : 'Negative';
                rows.push(`"${name}","${typeLabel}","${date}","${time}"`);
            });
        }
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `behaviour_data_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ── Reset ─────────────────────────────────────────────────────────────────────
function resetAll() {
    if (!confirm('Reset all behaviour data? Student names will be kept but all timestamps will be cleared.')) return;
    state.students.forEach(name => {
        state.behaviours[name] = [];
    });
    saveToCache();
    renderStudentList();
}

// ── Event Listeners ───────────────────────────────────────────────────────────
uploadBtn.addEventListener('click', () => {
    const file = csvFileInput.files[0];
    if (!file) {
        alert('Please select a CSV file first.');
        return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        const names = parseCSV(e.target.result);
        if (names.length === 0) {
            alert('No student names found in the CSV file.');
            return;
        }
        state.students = names;
        state.behaviours = {};
        names.forEach(n => { state.behaviours[n] = []; });
        saveToCache();
        showTracker();
    };
    reader.readAsText(file);
});

loadCachedBtn.addEventListener('click', () => {
    const saved = loadFromCache();
    if (saved) {
        state = saved;
        showTracker();
    }
});

exportBtn.addEventListener('click', exportData);
resetBtn.addEventListener('click', resetAll);
