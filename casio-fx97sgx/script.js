'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   Casio fx-97SG X Simulator — Script
   ═══════════════════════════════════════════════════════════════════════════ */

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  expr:      '',       // Expression string shown on display
  result:    '0',      // Result string shown on display
  ans:       0,        // Stored Ans value
  shift:     false,
  alpha:     false,
  angleMode: 'D',      // 'D'=degrees, 'R'=radians, 'G'=grads
  memory:    { A:0, B:0, C:0, D:0, E:0, F:0, X:0, Y:0, M:0 },
  waitSto:   false,
  waitRcl:   false,
  justCalc:  false,    // True immediately after '='; next non-op starts fresh
  history:   [],
  histIdx:   -1,
};

// ── DOM refs ───────────────────────────────────────────────────────────────
const exprEl   = document.getElementById('expr-line');
const resultEl = document.getElementById('result-line');

// ── Math helpers ───────────────────────────────────────────────────────────
function toRad(x) {
  if (state.angleMode === 'D') return x * Math.PI / 180;
  if (state.angleMode === 'G') return x * Math.PI / 200;
  return x;
}
function fromRad(x) {
  if (state.angleMode === 'D') return x * 180 / Math.PI;
  if (state.angleMode === 'G') return x * 200 / Math.PI;
  return x;
}
function _sin(x)      { return Math.sin(toRad(x)); }
function _cos(x)      { return Math.cos(toRad(x)); }
function _tan(x)      {
  const r = toRad(x), c = Math.cos(r);
  if (Math.abs(c) < 1e-14) return Infinity * Math.sign(Math.sin(r));
  return Math.sin(r) / c;
}
function _asin(x)     { return fromRad(Math.asin(x)); }
function _acos(x)     { return fromRad(Math.acos(x)); }
function _atan(x)     { return fromRad(Math.atan(x)); }
function _atan2(y, x) { return fromRad(Math.atan2(y, x)); }

function factorial(n) {
  n = Math.floor(n);
  if (n < 0 || n > 69) throw new RangeError('Out of range');
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
function nPr(n, r) {
  n = Math.floor(n); r = Math.floor(r);
  if (r < 0 || r > n) throw new RangeError('Invalid nPr');
  return factorial(n) / factorial(n - r);
}
function nCr(n, r) {
  n = Math.floor(n); r = Math.floor(r);
  if (r < 0 || r > n) throw new RangeError('Invalid nCr');
  return factorial(n) / (factorial(r) * factorial(n - r));
}
function gcd(a, b) { return b === 0 ? Math.abs(a) : gcd(b, a % b); }

function toFraction(decimal) {
  if (Number.isInteger(decimal)) return null;
  const sign = decimal < 0 ? '-' : '';
  const abs  = Math.abs(decimal);
  for (let d = 2; d <= 10000; d++) {
    const n = Math.round(abs * d);
    if (Math.abs(n / d - abs) < 1e-9) {
      const g = gcd(n, d), num = n / g, den = d / g;
      if (den === 1) return null;
      if (num > den) {
        const whole = Math.floor(num / den), rem = num % den;
        return rem === 0 ? `${sign}${whole}` : `${sign}${whole} ${rem}/${den}`;
      }
      return `${sign}${num}/${den}`;
    }
  }
  return null;
}

// ── Expression -> evaluable JS string ──────────────────────────────────────
function buildEvalStr(expr) {
  let e = expr;

  // % (percent)
  e = e.replace(/([0-9.Ee)]+)%/g, '($1)/100');

  // Inverse trig (before forward trig)
  e = e.replace(/sin⁻¹\(/g, '_asin(');
  e = e.replace(/cos⁻¹\(/g, '_acos(');
  e = e.replace(/tan⁻¹\(/g, '_atan(');

  // Forward trig
  e = e.replace(/sin\(/g, '_sin(');
  e = e.replace(/cos\(/g, '_cos(');
  e = e.replace(/tan\(/g, '_tan(');

  // Logarithms / exponentials
  e = e.replace(/log\(/g,  'Math.log10(');
  e = e.replace(/ln\(/g,   'Math.log(');
  e = e.replace(/10\^\(/g, '10**(');
  e = e.replace(/eˣ\(/g,   '(Math.E)**(');

  // Roots / abs
  e = e.replace(/√\(/g,   'Math.sqrt(');
  e = e.replace(/∛\(/g,   'Math.cbrt(');
  e = e.replace(/Abs\(/g, 'Math.abs(');

  // Superscript powers
  e = e.replace(/²/g,  '**2');
  e = e.replace(/³/g,  '**3');
  e = e.replace(/⁻¹/g, '**(-1)');

  // x10^ scientific notation
  e = e.replace(/×10\^/g, '*10**');

  // Generic caret
  e = e.replace(/\^/g, '**');

  // Factorial
  e = e.replace(/(\d+(?:\.\d+)?)!/g, 'factorial($1)');

  // Arithmetic operators
  e = e.replace(/×/g, '*');
  e = e.replace(/÷/g, '/');
  e = e.replace(/−/g, '-');

  // Rnd (round to 10 sig figs — Casio approximation)
  e = e.replace(/Rnd\(/g, 'Math.round(');

  // Constants
  e = e.replace(/π/g, '(' + Math.PI + ')');
  e = e.replace(/ℯ/g, '(' + Math.E + ')');

  // Ans
  e = e.replace(/Ans/g, '(' + state.ans + ')');

  // Memory variables
  for (const [k, v] of Object.entries(state.memory)) {
    e = e.replace(new RegExp('(?<![A-Za-z])' + k + '(?![A-Za-z])', 'g'), '(' + v + ')');
  }

  return e;
}

// ── Format result ──────────────────────────────────────────────────────────
function formatResult(n) {
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  if (Math.abs(n) >= 1e10 || (n !== 0 && Math.abs(n) < 1e-3)) {
    let s = n.toExponential(9).replace(/\.?0+(e)/, '$1');
    s = s.replace(/e([+-])(\d+)/, function(_, sg, exp) {
      return 'x10^' + (sg === '-' ? '-' : '') + parseInt(exp, 10);
    });
    return s;
  }
  return String(parseFloat(n.toPrecision(10)));
}

function formatShort(n) {
  if (n === 0) return '0';
  if (Number.isInteger(n) && Math.abs(n) < 1e6) return String(n);
  return parseFloat(n.toPrecision(5)).toString();
}

// ── Auto-close unclosed brackets (Casio behaviour on pressing =) ──────────
function autoClose(expr) {
  let depth = 0;
  for (const ch of expr) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
  }
  return depth > 0 ? expr + ')'.repeat(depth) : expr;
}

// ── Evaluate ───────────────────────────────────────────────────────────────
function evaluate() {
  let raw = state.expr.trim();
  if (!raw) return;

  // Auto-close brackets and update the display expression
  const closed = autoClose(raw);
  if (closed !== raw) {
    state.expr = closed;
    raw = closed;
  }

  const evalStr = buildEvalStr(raw);

  const scope = {
    _sin, _cos, _tan, _asin, _acos, _atan, _atan2,
    factorial, nPr, nCr, Math, Infinity,
  };

  try {
    const fn = new Function(
      ...Object.keys(scope),
      '"use strict"; return (' + evalStr + ');'
    );
    const r = fn(...Object.values(scope));

    if (typeof r !== 'number') throw new TypeError('Non-numeric');
    if (isNaN(r)) { state.result = 'Math ERROR'; showError(); return; }
    if (!isFinite(r)) { state.result = 'Math ERROR (' + (r > 0 ? '+' : '-') + 'inf)'; showError(); return; }

    state.ans = r;
    state.result = formatResult(r);
    state.justCalc = true;
    resultEl.classList.remove('error');

    if (state.history[0] !== state.expr) {
      state.history.unshift(state.expr);
      if (state.history.length > 30) state.history.pop();
    }
    state.histIdx = -1;

  } catch (_) {
    state.result = 'Syntax ERROR';
    showError();
  }

  updateDisplay();
}

function showError() {
  resultEl.classList.add('error');
  state.justCalc = false;
}

// ── Display update ─────────────────────────────────────────────────────────
function updateDisplay() {
  exprEl.textContent   = state.expr;
  resultEl.textContent = state.result;

  document.getElementById('status-shift').classList.toggle('active', state.shift);
  document.getElementById('status-alpha').classList.toggle('active', state.alpha);
  document.getElementById('status-m').classList.toggle(
    'active', Object.values(state.memory).some(function(v) { return v !== 0; })
  );
  document.getElementById('status-angle').textContent = state.angleMode;

  renderMemoryPanel();
}

function renderMemoryPanel() {
  const grid = document.getElementById('mem-grid');
  grid.innerHTML = '';
  for (const [k, v] of Object.entries(state.memory)) {
    const cell = document.createElement('div');
    cell.className = 'mem-cell';
    cell.innerHTML =
      '<div class="mem-cell-name">' + k + '</div>' +
      '<div class="mem-cell-val">' + formatShort(v) + '</div>';
    grid.appendChild(cell);
  }
}

// ── Angle mode ─────────────────────────────────────────────────────────────
function setAngleMode(mode) {
  state.angleMode = mode;
  ['D','R','G'].forEach(function(m) {
    document.getElementById('amode-' + m).classList.toggle('active', m === mode);
  });
  updateDisplay();
}
window.setAngleMode = setAngleMode;

// ── Insert text into expression ────────────────────────────────────────────
function insert(display) {
  if (state.justCalc) {
    const startsWithOp = /^[+\-x\xd7\xf7]/.test(display);
    state.expr     = startsWithOp ? 'Ans' : '';
    state.justCalc = false;
    resultEl.classList.remove('error');
  }
  state.expr += display;
  updateDisplay();
}

// ── Smart delete ──────────────────────────────────────────────────────────
const TOKEN_ENDS = [
  'sin\u207b\xb9(', 'cos\u207b\xb9(', 'tan\u207b\xb9(',
  'sin(', 'cos(', 'tan(',
  'log(', 'ln(', '10^(', 'e\u02e3(',
  '\u221a(', '\u221b(', 'Abs(',
  'nPr(', 'nCr(', 'Pol(', 'Rec(', 'Rnd(',
  '\xd710^', 'Ans', '\u207b\xb9',
];

function del() {
  if (!state.expr) return;
  state.justCalc = false;
  for (const tok of TOKEN_ENDS) {
    if (state.expr.endsWith(tok)) {
      state.expr = state.expr.slice(0, -tok.length);
      updateDisplay();
      return;
    }
  }
  state.expr = state.expr.slice(0, -1);
  updateDisplay();
}

function clearAll() {
  state.expr     = '';
  state.result   = '0';
  state.justCalc = false;
  resultEl.classList.remove('error');
  updateDisplay();
}

// ── SHIFT / ALPHA ──────────────────────────────────────────────────────────
function toggleShift() {
  state.shift = !state.shift;
  if (state.shift) state.alpha = false;
  document.getElementById('btn-shift').classList.toggle('mode-active', state.shift);
  document.getElementById('btn-alpha').classList.remove('mode-active');
  updateDisplay();
}
function toggleAlpha() {
  state.alpha = !state.alpha;
  if (state.alpha) state.shift = false;
  document.getElementById('btn-alpha').classList.toggle('mode-active', state.alpha);
  document.getElementById('btn-shift').classList.remove('mode-active');
  updateDisplay();
}
function clearMode() {
  state.shift = state.alpha = false;
  document.getElementById('btn-shift').classList.remove('mode-active');
  document.getElementById('btn-alpha').classList.remove('mode-active');
  updateDisplay();
}

// ── History ────────────────────────────────────────────────────────────────
function historyUp() {
  if (!state.history.length) return;
  if (state.histIdx < state.history.length - 1) {
    state.histIdx++;
    state.expr = state.history[state.histIdx];
    state.justCalc = false;
    updateDisplay();
  }
}
function historyDown() {
  if (state.histIdx > 0) {
    state.histIdx--;
    state.expr = state.history[state.histIdx];
  } else {
    state.histIdx = -1;
    state.expr = '';
  }
  state.justCalc = false;
  updateDisplay();
}

// ── S<->D ───────────────────────────────────────────────────────────────────
function handleSD() {
  const n = parseFloat(state.result);
  if (isNaN(n)) return;
  const frac = toFraction(n);
  state.result = (frac && state.result !== frac) ? frac : formatResult(state.ans);
  updateDisplay();
}

// ── ENG notation ──────────────────────────────────────────────────────────
function handleENG() {
  const n = parseFloat(state.result);
  if (isNaN(n) || n === 0) return;
  const exp   = Math.floor(Math.log10(Math.abs(n)) / 3) * 3;
  const coeff = parseFloat((n / Math.pow(10, exp)).toPrecision(9));
  state.result = exp === 0 ? formatResult(n) : (coeff + 'x10^' + exp);
  updateDisplay();
}

// ── DMS display ────────────────────────────────────────────────────────────
function handleDMS() {
  const n = parseFloat(state.result);
  if (isNaN(n)) return;
  const deg   = Math.floor(Math.abs(n)) * Math.sign(n);
  const mFrac = (Math.abs(n) - Math.abs(deg)) * 60;
  const min   = Math.floor(mFrac);
  const sec   = parseFloat(((mFrac - min) * 60).toFixed(4));
  state.result = deg + '\xb0' + min + "'" + sec + '"';
  updateDisplay();
}

// ── SETUP: cycle angle mode ─────────────────────────────────────────────────
function handleSetup() {
  const modes = ['D','R','G'];
  setAngleMode(modes[(modes.indexOf(state.angleMode) + 1) % 3]);
  const names = { D:'Degrees', R:'Radians', G:'Grads' };
  flashMessage(names[state.angleMode]);
}

// ── Flash a temporary message ───────────────────────────────────────────────
let flashTimer = null;
function flashMessage(msg) {
  const prev = state.result;
  state.result = msg;
  updateDisplay();
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(function() {
    state.result = formatResult(state.ans);
    updateDisplay();
  }, 1800);
}

// ── STO / RCL variable map ─────────────────────────────────────────────────
const VAR_MAP = {
  'btn-neg':   'A', 'btn-dms':   'B', 'btn-recip': 'C',
  'btn-sin':   'D', 'btn-cos':   'E', 'btn-tan':   'F',
  'btn-close': 'X', 'btn-sd':    'Y', 'btn-mplus': 'M',
};

// ── Main button handler ────────────────────────────────────────────────────
function handleButton(id) {
  const S = state.shift;
  const A = state.alpha;

  // STO / RCL waiting state
  if (state.waitSto || state.waitRcl) {
    const v = VAR_MAP[id];
    if (v) {
      if (state.waitSto) {
        // Always store state.ans — state.result may be a flash message string
        state.memory[v] = state.ans;
        flashMessage('Stored \u2192 ' + v + ' = ' + formatShort(state.ans));
      } else {
        insert(v);
      }
    }
    state.waitSto = state.waitRcl = false;
    clearMode();
    return;
  }

  switch (id) {
    case 'btn-shift':  toggleShift(); return;
    case 'btn-alpha':  toggleAlpha(); return;
    case 'btn-on':     clearAll(); clearMode(); return;
    case 'btn-ac':     clearAll(); clearMode(); return;
    case 'btn-del':    del(); clearMode(); return;
    case 'btn-eq':     evaluate(); clearMode(); return;

    case 'btn-0':  S ? insert('Rnd(') : insert('0'); break;
    case 'btn-1':  insert('1'); break;
    case 'btn-2':  insert('2'); break;
    case 'btn-3':  insert('3'); break;
    case 'btn-4':  insert('4'); break;
    case 'btn-5':  insert('5'); break;
    case 'btn-6':  insert('6'); break;
    case 'btn-7':  insert('7'); break;
    case 'btn-8':  insert('8'); break;
    case 'btn-9':  insert('9'); break;

    case 'btn-dot':
      S ? insert(String(parseFloat(Math.random().toPrecision(9)))) : insert('.');
      break;

    case 'btn-add': S ? insert('Pol(') : insert('+'); break;
    case 'btn-sub': S ? insert('Rec(') : insert('\u2212'); break;
    case 'btn-mul': S ? insert('nPr(') : insert('\xd7'); break;
    case 'btn-div': S ? insert('nCr(') : insert('\xf7'); break;

    case 'btn-exp':
      if (S)      insert('\u03c0');
      else if (A) insert('\u212f');
      else        insert('\xd710^');
      break;

    case 'btn-ans': S ? insert('%') : insert('Ans'); break;

    case 'btn-sin':
      if (A)      insert('D');
      else if (S) insert('sin\u207b\xb9(');
      else        insert('sin(');
      break;
    case 'btn-cos':
      if (A)      insert('E');
      else if (S) insert('cos\u207b\xb9(');
      else        insert('cos(');
      break;
    case 'btn-tan':
      if (A)      insert('F');
      else if (S) insert('tan\u207b\xb9(');
      else        insert('tan(');
      break;

    case 'btn-log': S ? insert('10^(') : insert('log('); break;
    case 'btn-ln':  S ? insert('e\u02e3(') : insert('ln('); break;

    case 'btn-sqrt':  S ? insert('\u221b(') : insert('\u221a('); break;
    case 'btn-sq':    insert('\xb2'); break;
    case 'btn-pow':   insert('^('); break;
    case 'btn-cube':  insert('\xb3'); break;

    case 'btn-abs':   insert('Abs('); break;
    case 'btn-fact':  insert('!'); break;
    case 'btn-recip': A ? insert('C') : insert('\u207b\xb9'); break;

    case 'btn-open':  S ? insert(',') : insert('('); break;
    case 'btn-close': A ? insert('X') : insert(')'); break;

    case 'btn-neg':   A ? insert('A') : insert('(-'); break;

    case 'btn-dms':
      if (A) { insert('B'); break; }
      handleDMS(); return;

    case 'btn-sd':
      if (A) { insert('Y'); break; }
      handleSD(); return;

    case 'btn-mplus': {
      const v = parseFloat(state.result);
      if (A) {
        insert('M');
      } else if (S) {
        if (!isNaN(v)) { state.memory.M -= v; flashMessage('M = ' + formatShort(state.memory.M)); }
      } else {
        if (!isNaN(v)) { state.memory.M += v; flashMessage('M = ' + formatShort(state.memory.M)); }
      }
      break;
    }

    case 'btn-sto':
      if (S) { state.waitRcl = true; flashMessage('RCL - press variable key'); }
      else   { state.waitSto = true; flashMessage('STO - press variable key'); }
      clearMode(); return;

    case 'btn-eng':
      S ? del() : handleENG();
      clearMode(); return;

    case 'btn-optn':
      flashMessage('sin cos tan log ln sqrt Abs nPr nCr');
      clearMode(); return;

    case 'btn-menu':
    case 'btn-setup':
      handleSetup(); clearMode(); return;

    case 'btn-frac':
      S ? handleSD() : insert('/');
      break;

    case 'dpad-up':     historyUp(); return;
    case 'dpad-down':   historyDown(); return;
    case 'dpad-left':
    case 'dpad-right':  return;
    case 'dpad-center': evaluate(); clearMode(); return;

    default: return;
  }

  clearMode();
}

// ── Wire up buttons ────────────────────────────────────────────────────────
document.querySelectorAll('.btn, .dpad-btn').forEach(function(btn) {
  btn.addEventListener('click', function() { handleButton(btn.id); });
});

// ── Keyboard support ──────────────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
  const map = {
    '0':'btn-0','1':'btn-1','2':'btn-2','3':'btn-3','4':'btn-4',
    '5':'btn-5','6':'btn-6','7':'btn-7','8':'btn-8','9':'btn-9',
    '.':'btn-dot','+':'btn-add','-':'btn-sub','*':'btn-mul','/':'btn-div',
    'Enter':'btn-eq','=':'btn-eq','Backspace':'btn-del','Escape':'btn-ac',
    '(':'btn-open',')':'btn-close',
    'ArrowUp':'dpad-up','ArrowDown':'dpad-down',
    'ArrowLeft':'dpad-left','ArrowRight':'dpad-right',
  };
  if (map[e.key]) {
    e.preventDefault();
    handleButton(map[e.key]);
    const el = document.getElementById(map[e.key]);
    if (el) { el.style.filter = 'brightness(1.6)'; setTimeout(function() { el.style.filter = ''; }, 100); }
  }
});

// ── Init ──────────────────────────────────────────────────────────────────
updateDisplay();
