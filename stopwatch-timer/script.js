// Stopwatch & Timer – Math Tools mini-project
// Lap times persist in localStorage

document.addEventListener('DOMContentLoaded', () => {
  // ---------- DOM refs ----------
  const btnStopwatch = document.getElementById('btnStopwatch');
  const btnTimer     = document.getElementById('btnTimer');
  const stopwatchSection = document.getElementById('stopwatchSection');
  const timerSection     = document.getElementById('timerSection');

  // Stopwatch
  const swDisplay   = document.getElementById('stopwatchDisplay');
  const swStartBtn  = document.getElementById('swStartBtn');
  const swStopBtn   = document.getElementById('swStopBtn');
  const swLapBtn    = document.getElementById('swLapBtn');
  const swResetBtn  = document.getElementById('swResetBtn');
  const lapsList    = document.getElementById('lapsList');
  const noLapsMsg   = document.getElementById('noLapsMsg');
  const clearLapsBtn = document.getElementById('clearLapsBtn');

  // Timer
  const hoursInput   = document.getElementById('hoursInput');
  const minutesInput = document.getElementById('minutesInput');
  const secondsInput = document.getElementById('secondsInput');
  const timerDisplay = document.getElementById('timerDisplay');
  const timerStatus  = document.getElementById('timerStatus');
  const timerClockStatus = document.getElementById('timerClockStatus');
  const tmStartBtn   = document.getElementById('tmStartBtn');
  const tmPauseBtn   = document.getElementById('tmPauseBtn');
  const tmResetBtn   = document.getElementById('tmResetBtn');
  const timerDigitalWrap = document.getElementById('timerDigitalWrap');
  const timerClockWrap   = document.getElementById('timerClockWrap');
  const clockHint        = document.getElementById('clockDigitalHint');
  const minuteHand       = document.getElementById('minuteHand');
  const secondHand       = document.getElementById('secondHand');
  const displayModeRadios = document.querySelectorAll('input[name="displayMode"]');

  // ---------- Mode switcher ----------
  btnStopwatch.addEventListener('click', () => {
    btnStopwatch.classList.add('active');
    btnTimer.classList.remove('active');
    stopwatchSection.style.display = '';
    timerSection.style.display = 'none';
  });

  btnTimer.addEventListener('click', () => {
    btnTimer.classList.add('active');
    btnStopwatch.classList.remove('active');
    timerSection.style.display = '';
    stopwatchSection.style.display = 'none';
  });

  // =====================================================
  // STOPWATCH
  // =====================================================
  let swRunning = false;
  let swStartTime = 0;       // performance.now() when started / resumed
  let swElapsed = 0;         // accumulated ms while stopped
  let swRafId = null;
  let laps = [];             // array of { time: ms, label: string }

  const LAPS_KEY = 'mathTools_stopwatchLaps';

  function loadLaps() {
    try {
      const raw = localStorage.getItem(LAPS_KEY);
      if (raw) {
        laps = JSON.parse(raw);
        renderLaps();
      }
    } catch (e) {
      laps = [];
    }
  }

  function saveLaps() {
    try {
      localStorage.setItem(LAPS_KEY, JSON.stringify(laps));
    } catch (e) { /* quota or private mode */ }
  }

  function formatMs(ms) {
    const totalCs = Math.floor(ms / 10); // centiseconds
    const cs = totalCs % 100;
    const totalSec = Math.floor(totalCs / 100);
    const s = totalSec % 60;
    const m = Math.floor(totalSec / 60) % 60;
    const h = Math.floor(totalSec / 3600);

    const pad = (n, w = 2) => String(n).padStart(w, '0');
    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
    }
    return `${pad(m)}:${pad(s)}.${pad(cs)}`;
  }

  function updateSwDisplay() {
    const now = performance.now();
    const current = swRunning ? swElapsed + (now - swStartTime) : swElapsed;
    swDisplay.textContent = formatMs(current);
  }

  function swTick() {
    updateSwDisplay();
    if (swRunning) {
      swRafId = requestAnimationFrame(swTick);
    }
  }

  function startStopwatch() {
    if (swRunning) return;
    swRunning = true;
    swStartTime = performance.now();
    swStartBtn.disabled = true;
    swStopBtn.disabled = false;
    swLapBtn.disabled = false;
    swRafId = requestAnimationFrame(swTick);
  }

  function stopStopwatch() {
    if (!swRunning) return;
    swRunning = false;
    swElapsed += performance.now() - swStartTime;
    cancelAnimationFrame(swRafId);
    swStartBtn.disabled = false;
    swStopBtn.disabled = true;
    swLapBtn.disabled = true;
    updateSwDisplay();
  }

  function resetStopwatch() {
    stopStopwatch();
    swElapsed = 0;
    updateSwDisplay();
  }

  function addLap() {
    const now = performance.now();
    const current = swRunning ? swElapsed + (now - swStartTime) : swElapsed;
    const label = formatMs(current);
    laps.unshift({ time: current, label }); // newest first
    saveLaps();
    renderLaps();
  }

  function renderLaps() {
    lapsList.innerHTML = '';
    if (laps.length === 0) {
      noLapsMsg.style.display = '';
      return;
    }
    noLapsMsg.style.display = 'none';
    laps.forEach((lap, idx) => {
      const li = document.createElement('li');
      const num = laps.length - idx; // Lap 1 is oldest
      li.innerHTML = `<span class="lap-num">Lap ${num}</span><span class="lap-time">${lap.label}</span>`;
      lapsList.appendChild(li);
    });
  }

  function clearLaps() {
    laps = [];
    saveLaps();
    renderLaps();
  }

  swStartBtn.addEventListener('click', startStopwatch);
  swStopBtn.addEventListener('click', stopStopwatch);
  swLapBtn.addEventListener('click', addLap);
  swResetBtn.addEventListener('click', resetStopwatch);
  clearLapsBtn.addEventListener('click', clearLaps);

  // Load persisted laps on start
  loadLaps();

  // =====================================================
  // TIMER
  // =====================================================
  let tmRunning = false;
  let tmEndTime = 0;         // performance.now() when timer should finish
  let tmRemaining = 0;       // ms left when paused
  let tmTotalDuration = 0;   // original duration in ms (for clock face)
  let tmRafId = null;
  let tmFinished = false;

  function getDurationMs() {
    const h = Math.max(0, parseInt(hoursInput.value, 10) || 0);
    const m = Math.max(0, parseInt(minutesInput.value, 10) || 0);
    const s = Math.max(0, parseInt(secondsInput.value, 10) || 0);
    return ((h * 3600) + (m * 60) + s) * 1000;
  }

  function formatTimer(ms) {
    if (ms < 0) ms = 0;
    const totalSec = Math.ceil(ms / 1000);
    const s = totalSec % 60;
    const totalMin = Math.floor(totalSec / 60);
    const m = totalMin % 60;
    const h = Math.floor(totalMin / 60);
    const pad = (n) => String(n).padStart(2, '0');
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  }

  function getDisplayMode() {
    const checked = document.querySelector('input[name="displayMode"]:checked');
    return checked ? checked.value : 'digital';
  }

  function updateDisplayModeUI() {
    const mode = getDisplayMode();
    if (mode === 'clock') {
      timerDigitalWrap.style.display = 'none';
      timerClockWrap.style.display = '';
    } else {
      timerDigitalWrap.style.display = '';
      timerClockWrap.style.display = 'none';
    }
  }

  displayModeRadios.forEach(r => {
    r.addEventListener('change', () => {
      updateDisplayModeUI();
      // refresh current remaining value on the new display
      if (!tmRunning && !tmFinished) {
        const ms = getDurationMs();
        timerDisplay.textContent = formatTimer(ms);
        clockHint.textContent = formatTimer(ms);
        updateClockHands(ms, ms || 1);
      }
    });
  });

  // Build static clock markers once
  function buildClockMarkers() {
    const minuteMarkers = document.getElementById('minuteMarkers');
    const hourMarkers = document.getElementById('hourMarkers');
    minuteMarkers.innerHTML = '';
    hourMarkers.innerHTML = '';

    for (let i = 0; i < 60; i++) {
      const angle = (i * 6) * Math.PI / 180;
      const isHour = i % 5 === 0;
      const outer = 140;
      const inner = isHour ? 120 : 130;
      const x1 = 150 + outer * Math.sin(angle);
      const y1 = 150 - outer * Math.cos(angle);
      const x2 = 150 + inner * Math.sin(angle);
      const y2 = 150 - inner * Math.cos(angle);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', '#222');
      line.setAttribute('stroke-width', isHour ? 3 : 1.5);
      if (isHour) {
        hourMarkers.appendChild(line);
      } else {
        minuteMarkers.appendChild(line);
      }
    }
  }
  buildClockMarkers();

  /**
   * Update analog hands based on remaining milliseconds.
   * Second hand: full circle = 60 seconds (smooth sweep)
   * Minute hand: full circle = 60 minutes
   * When remaining > 60 min we still map minutes mod 60 for the minute hand.
   */
  function updateClockHands(remainingMs, totalMs) {
    if (remainingMs < 0) remainingMs = 0;

    // Seconds (including fraction) for smooth sweep
    const totalSeconds = remainingMs / 1000;
    const seconds = totalSeconds % 60;
    const minutes = (remainingMs / 60000) % 60; // fractional minutes

    // Angles: 0 at top, clockwise
    const secAngle = (seconds / 60) * 360;
    const minAngle = (minutes / 60) * 360;

    // Rotate around center (150,150)
    secondHand.setAttribute('transform', `rotate(${secAngle} 150 150)`);
    minuteHand.setAttribute('transform', `rotate(${minAngle} 150 150)`);
  }

  function setTimerDisplays(ms) {
    const text = formatTimer(ms);
    timerDisplay.textContent = text;
    clockHint.textContent = text;
    updateClockHands(ms, tmTotalDuration || ms || 1);
  }

  function clearFinishedState() {
    tmFinished = false;
    timerDigitalWrap.classList.remove('finished');
    timerClockWrap.classList.remove('finished');
    timerStatus.textContent = '';
    timerClockStatus.textContent = '';
  }

  function tmTick() {
    const now = performance.now();
    const left = tmEndTime - now;

    if (left <= 0) {
      // Finished
      setTimerDisplays(0);
      tmRunning = false;
      tmFinished = true;
      tmPauseBtn.disabled = true;
      tmStartBtn.disabled = false;
      timerDigitalWrap.classList.add('finished');
      timerClockWrap.classList.add('finished');
      timerStatus.textContent = "Time's up!";
      timerClockStatus.textContent = "Time's up!";
      // Simple beep using Web Audio if available
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
      } catch (e) { /* ignore */ }
      return;
    }

    setTimerDisplays(left);
    tmRafId = requestAnimationFrame(tmTick);
  }

  function startTimer() {
    if (tmRunning) return;

    clearFinishedState();

    let duration;
    if (tmRemaining > 0) {
      // Resuming from pause
      duration = tmRemaining;
    } else {
      duration = getDurationMs();
      if (duration <= 0) {
        alert('Please set a duration greater than zero.');
        return;
      }
      tmTotalDuration = duration;
    }

    tmEndTime = performance.now() + duration;
    tmRunning = true;
    tmRemaining = 0;
    tmStartBtn.disabled = true;
    tmPauseBtn.disabled = false;
    // Disable inputs while running
    hoursInput.disabled = true;
    minutesInput.disabled = true;
    secondsInput.disabled = true;
    displayModeRadios.forEach(r => r.disabled = true);

    tmRafId = requestAnimationFrame(tmTick);
  }

  function pauseTimer() {
    if (!tmRunning) return;
    tmRunning = false;
    cancelAnimationFrame(tmRafId);
    tmRemaining = Math.max(0, tmEndTime - performance.now());
    setTimerDisplays(tmRemaining);
    tmStartBtn.disabled = false;
    tmPauseBtn.disabled = true;
    // Re-enable inputs? Keep disabled until reset for clarity
  }

  function resetTimer() {
    tmRunning = false;
    cancelAnimationFrame(tmRafId);
    tmRemaining = 0;
    tmTotalDuration = 0;
    clearFinishedState();
    const ms = getDurationMs();
    setTimerDisplays(ms);
    tmStartBtn.disabled = false;
    tmPauseBtn.disabled = true;
    hoursInput.disabled = false;
    minutesInput.disabled = false;
    secondsInput.disabled = false;
    displayModeRadios.forEach(r => r.disabled = false);
  }

  // Live preview when inputs change (only when not running)
  function onDurationChange() {
    if (tmRunning || tmFinished) return;
    const ms = getDurationMs();
    setTimerDisplays(ms);
  }

  hoursInput.addEventListener('input', onDurationChange);
  minutesInput.addEventListener('input', onDurationChange);
  secondsInput.addEventListener('input', onDurationChange);

  tmStartBtn.addEventListener('click', startTimer);
  tmPauseBtn.addEventListener('click', pauseTimer);
  tmResetBtn.addEventListener('click', resetTimer);

  // Initial state
  updateDisplayModeUI();
  setTimerDisplays(getDurationMs());
});
