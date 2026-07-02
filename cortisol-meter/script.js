'use strict';

// ── Canvas setup ──────────────────────────────────────────────────────────────
const canvas     = document.getElementById('gauge');
const ctx        = canvas.getContext('2d');
const valueInput = document.getElementById('valueInput');
const levelBadge = document.getElementById('levelBadge');

// ── Gauge geometry ────────────────────────────────────────────────────────────
const CX         = canvas.width / 2;          // 220  – horizontal centre
const CY         = canvas.height - 15;        // 265  – pivot sits near bottom edge
const OUTER_R    = 195;
const INNER_R    = 110;
const NEEDLE_LEN = 183;                       // tip reaches near outer arc
const NEEDLE_BACK = 18;                       // backward extension past pivot
const NEEDLE_BASE = 5;                        // half-width at pivot
const PIVOT_R    = 12;
const LABEL_R    = OUTER_R + 22;             // radius for LOW / NORMAL / HIGH text

// ── Colour palette ────────────────────────────────────────────────────────────
// Six equal segments, left (LOW) → right (HIGH)
const SEGMENT_COLORS = [
    '#4CAF50',   // bright green
    '#8BC34A',   // lime green
    '#CDDC39',   // yellow-lime
    '#FFC107',   // amber
    '#FF7043',   // deep orange
    '#EF5350',   // red
];
const NUM_SEGS  = SEGMENT_COLORS.length;   // 6
const SEG_SPAN  = Math.PI / NUM_SEGS;      // π/6 rad per segment
const SEG_GAP   = 0.026;                   // small gap between segments (rad)

const LEVEL_THRESHOLDS = { LOW: 33, NORMAL: 66 };  // ≤33 LOW, ≤66 NORMAL, else HIGH
const LEVEL_COLORS     = { LOW: '#4CAF50', NORMAL: '#FFC107', HIGH: '#EF5350' };

// Arc labels shown around the gauge face
const ARC_LABELS = [
    { text: 'LOW',    value: 16 },
    { text: 'NORMAL', value: 50 },
    { text: 'HIGH',   value: 83 },
];

// ── Angle helpers ─────────────────────────────────────────────────────────────

/**
 * Map a value [0–100] to a canvas arc angle.
 *   value=0   → π     (9 o'clock  / left)
 *   value=50  → 3π/2  (12 o'clock / top)
 *   value=100 → 2π    (3 o'clock  / right)
 */
function valueToAngle(value) {
    return Math.PI + (value / 100) * Math.PI;
}

/**
 * Map a raw Math.atan2 angle to a gauge value [0–100].
 * The valid gauge arc is the TOP semicircle (left → top → right).
 * Angles in the bottom half are clamped to the nearest extreme.
 */
function atan2ToValue(rawAngle) {
    // Normalise to [0, 2π)
    let a = rawAngle < 0 ? rawAngle + 2 * Math.PI : rawAngle;

    if (a === 0) return 100;                      // exact right edge

    if (a > 0 && a < Math.PI) {
        // Bottom half – snap to nearest gauge extreme
        return a < Math.PI / 2 ? 100 : 0;
    }

    // Top semicircle: a ∈ [π, 2π)  →  value ∈ [0, 100)
    return Math.round(((a - Math.PI) / Math.PI) * 100);
}

// ── Level helpers ─────────────────────────────────────────────────────────────
function getLevel(value) {
    if (value <= LEVEL_THRESHOLDS.LOW)    return 'LOW';
    if (value <= LEVEL_THRESHOLDS.NORMAL) return 'NORMAL';
    return 'HIGH';
}

// ── Drawing ───────────────────────────────────────────────────────────────────
function draw(value) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // — Coloured arc segments ————————————————————————————————————————————————
    for (let i = 0; i < NUM_SEGS; i++) {
        const sa = Math.PI + i * SEG_SPAN + SEG_GAP;
        const ea = Math.PI + (i + 1) * SEG_SPAN - SEG_GAP;

        ctx.beginPath();
        ctx.arc(CX, CY, OUTER_R, sa, ea);           // outer edge (clockwise)
        ctx.arc(CX, CY, INNER_R, ea, sa, true);     // inner edge (counter-clockwise)
        ctx.closePath();
        ctx.fillStyle = SEGMENT_COLORS[i];
        ctx.fill();
    }

    // — Arc labels (LOW / NORMAL / HIGH) ————————————————————————————————————
    ctx.font         = 'bold 13px "Segoe UI", Arial, sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = '#444';

    for (const { text, value: v } of ARC_LABELS) {
        const a = valueToAngle(v);
        ctx.fillText(text, CX + LABEL_R * Math.cos(a), CY + LABEL_R * Math.sin(a));
    }

    // — Needle ————————————————————————————————————————————————————————————————
    const na   = valueToAngle(value);
    const tipX = CX + NEEDLE_LEN  * Math.cos(na);
    const tipY = CY + NEEDLE_LEN  * Math.sin(na);
    const bakX = CX - NEEDLE_BACK * Math.cos(na);
    const bakY = CY - NEEDLE_BACK * Math.sin(na);

    // Two base-width points perpendicular to the needle at the pivot
    const perp = na + Math.PI / 2;
    const bx1  = CX + NEEDLE_BASE * Math.cos(perp);
    const by1  = CY + NEEDLE_BASE * Math.sin(perp);
    const bx2  = CX - NEEDLE_BASE * Math.cos(perp);
    const by2  = CY - NEEDLE_BASE * Math.sin(perp);

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.28)';
    ctx.shadowBlur  = 7;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.moveTo(bakX, bakY);   // narrow back tip
    ctx.lineTo(bx1,  by1);   // wide base – left
    ctx.lineTo(tipX, tipY);   // pointed front tip
    ctx.lineTo(bx2,  by2);   // wide base – right
    ctx.closePath();
    ctx.fillStyle = '#222222';
    ctx.fill();
    ctx.restore();

    // — Pivot circle ——————————————————————————————————————————————————————————
    ctx.beginPath();
    ctx.arc(CX, CY, PIVOT_R, 0, 2 * Math.PI);
    ctx.fillStyle   = '#ffffff';
    ctx.strokeStyle = '#bbbbbb';
    ctx.lineWidth   = 2;
    ctx.fill();
    ctx.stroke();

    // Pivot centre dot
    ctx.beginPath();
    ctx.arc(CX, CY, PIVOT_R * 0.38, 0, 2 * Math.PI);
    ctx.fillStyle = '#222222';
    ctx.fill();
}

// ── State update ──────────────────────────────────────────────────────────────
let currentValue = 20;

function updateAll(rawValue) {
    const value = Math.max(0, Math.min(100, Math.round(rawValue)));
    if (value === currentValue) return;   // skip redundant redraws
    currentValue = value;

    valueInput.value = value;

    const level = getLevel(value);
    levelBadge.textContent        = level;
    levelBadge.style.backgroundColor = LEVEL_COLORS[level];

    draw(value);
}

// ── Input field ───────────────────────────────────────────────────────────────
valueInput.addEventListener('input', () => {
    const v = parseInt(valueInput.value, 10);
    if (!isNaN(v)) {
        const clamped = Math.max(0, Math.min(100, v));
        // Redraw directly to keep input field value as-typed
        currentValue = clamped;
        const level = getLevel(clamped);
        levelBadge.textContent           = level;
        levelBadge.style.backgroundColor = LEVEL_COLORS[level];
        draw(clamped);
    }
});

valueInput.addEventListener('change', () => {
    const v = parseInt(valueInput.value, 10);
    const clamped = isNaN(v) ? 0 : Math.max(0, Math.min(100, v));
    valueInput.value = clamped;
    currentValue = clamped;
    const level = getLevel(clamped);
    levelBadge.textContent           = level;
    levelBadge.style.backgroundColor = LEVEL_COLORS[level];
    draw(clamped);
});

// ── Pointer helpers ───────────────────────────────────────────────────────────
function canvasCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top)  * scaleY,
    };
}

function applyPointerAngle(clientX, clientY) {
    const { x, y } = canvasCoords(clientX, clientY);
    const angle = Math.atan2(y - CY, x - CX);
    updateAll(atan2ToValue(angle));
}

// ── Mouse drag ────────────────────────────────────────────────────────────────
let isDragging = false;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    applyPointerAngle(e.clientX, e.clientY);
});
canvas.addEventListener('mousemove', (e) => {
    if (isDragging) applyPointerAngle(e.clientX, e.clientY);
});
canvas.addEventListener('mouseup',    () => { isDragging = false; });
canvas.addEventListener('mouseleave', () => { isDragging = false; });

// ── Touch drag ────────────────────────────────────────────────────────────────
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDragging = true;
    const t = e.touches[0];
    applyPointerAngle(t.clientX, t.clientY);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDragging) return;
    const t = e.touches[0];
    applyPointerAngle(t.clientX, t.clientY);
}, { passive: false });

canvas.addEventListener('touchend', () => { isDragging = false; });

// ── Boot ──────────────────────────────────────────────────────────────────────
// Force initial draw bypassing the currentValue guard
currentValue = -1;
updateAll(20);
