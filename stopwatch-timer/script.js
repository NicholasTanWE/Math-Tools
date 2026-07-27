// Stopwatch & Timer – Math Tools mini-project
// Lap times persist in localStorage
// Dual timers with Simultaneous / Asynchronous start + Digital / Clock / Progress displays

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Mode switcher (Stopwatch / Timer) ----------
  const btnStopwatch = document.getElementById('btnStopwatch');
  const btnTimer     = document.getElementById('btnTimer');
  const stopwatchSection = document.getElementById('stopwatchSection');
  const timerSection     = document.getElementById('timerSection');

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
  // STOPWATCH (unchanged)
  // =====================================================
  const swDisplay   = document.getElementById('stopwatchDisplay');
  const swStartBtn  = document.getElementById('swStartBtn');
  const swStopBtn   = document.getElementById('swStopBtn');
  const swLapBtn    = document.getElementById('swLapBtn');
  const swResetBtn  = document.getElementById('swResetBtn');
  const lapsList    = document.getElementById('lapsList');
  const noLapsMsg   = document.getElementById('noLapsMsg');
  const clearLapsBtn = document.getElementById('clearLapsBtn');

  let swRunning = false;
  let swStartTime = 0;
  let swElapsed = 0;
  let swRafId = null;
  let laps = [];

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
    } catch (e) { /* ignore */ }
  }

  function formatMs(ms) {
    const totalCs = Math.floor(ms / 10);
    const cs = totalCs % 100;
    const totalSec = Math.floor(totalCs / 100);
    const s = totalSec % 60;
    const m = Math.floor(totalSec / 60) % 60;
    const h = Math.floor(totalSec / 3600);
    const pad = (n, w = 2) => String(n).padStart(w, '0');
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
    return `${pad(m)}:${pad(s)}.${pad(cs)}`;
  }

  function updateSwDisplay() {
    const now = performance.now();
    const current = swRunning ? swElapsed + (now - swStartTime) : swElapsed;
    swDisplay.textContent = formatMs(current);
  }

  function swTick() {
    updateSwDisplay();
    if (swRunning) swRafId = requestAnimationFrame(swTick);
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
    laps.unshift({ time: current, label });
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
      const num = laps.length - idx;
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
  loadLaps();

  // =====================================================
  // TIMER – dual independent engines
  // =====================================================

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

  function buildClockMarkers(svg) {
    const minuteG = svg.querySelector('.minute-markers');
    const hourG = svg.querySelector('.hour-markers');
    if (!minuteG || !hourG) return;
    minuteG.innerHTML = '';
    hourG.innerHTML = '';
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
      (isHour ? hourG : minuteG).appendChild(line);
    }
  }

  function playBeep() {
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
  }

  function createTimer(id) {
    const hoursInput   = document.getElementById(`t${id}Hours`);
    const minutesInput = document.getElementById(`t${id}Minutes`);
    const secondsInput = document.getElementById(`t${id}Seconds`);
    const digitalEl    = document.getElementById(`t${id}Digital`);
    const statusEl     = document.getElementById(`t${id}Status`);
    const clockSvg     = document.getElementById(`t${id}ClockSvg`);
    const clockHint    = document.getElementById(`t${id}ClockHint`);
    const clockStatus  = document.getElementById(`t${id}ClockStatus`);
    const progressLabel = document.getElementById(`t${id}ProgressLabel`);
    const progressFill  = document.getElementById(`t${id}ProgressFill`);
    const progressStatus = document.getElementById(`t${id}ProgressStatus`);
    const panel        = document.querySelector(`.timer-${id}`);
    const minuteHand   = clockSvg.querySelector('.minute-hand');
    const secondHand   = clockSvg.querySelector('.second-hand');

    const startBtn = document.querySelector(`.tm-start[data-timer="${id}"]`);
    const pauseBtn = document.querySelector(`.tm-pause[data-timer="${id}"]`);
    const resetBtn = document.querySelector(`.tm-reset[data-timer="${id}"]`);

    buildClockMarkers(clockSvg);

    let running = false;
    let endTime = 0;
    let remaining = 0;
    let totalDuration = 0;
    let rafId = null;
    let finished = false;

    function getDurationMs() {
      const h = Math.max(0, parseInt(hoursInput.value, 10) || 0);
      const m = Math.max(0, parseInt(minutesInput.value, 10) || 0);
      const s = Math.max(0, parseInt(secondsInput.value, 10) || 0);
      return ((h * 3600) + (m * 60) + s) * 1000;
    }

    function updateClockHands(ms) {
      if (ms < 0) ms = 0;
      const totalSeconds = ms / 1000;
      const seconds = totalSeconds % 60;
      const minutes = (ms / 60000) % 60;
      const secAngle = (seconds / 60) * 360;
      const minAngle = (minutes / 60) * 360;
      secondHand.setAttribute('transform', `rotate(${secAngle} 150 150)`);
      minuteHand.setAttribute('transform', `rotate(${minAngle} 150 150)`);
    }

    function setDisplays(ms) {
      const text = formatTimer(ms);
      digitalEl.textContent = text;
      clockHint.textContent = text;
      progressLabel.textContent = text;
      updateClockHands(ms);

      if (totalDuration > 0) {
        const elapsed = totalDuration - Math.max(0, ms);
        const pct = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        progressFill.style.width = pct + '%';
      } else {
        progressFill.style.width = '0%';
      }
    }

    function clearFinished() {
      finished = false;
      panel.classList.remove('finished');
      statusEl.textContent = '';
      clockStatus.textContent = '';
      progressStatus.textContent = '';
    }

    function tick() {
      const left = endTime - performance.now();
      if (left <= 0) {
        setDisplays(0);
        running = false;
        finished = true;
        pauseBtn.disabled = true;
        startBtn.disabled = false;
        panel.classList.add('finished');
        statusEl.textContent = "Time's up!";
        clockStatus.textContent = "Time's up!";
        progressStatus.textContent = "Time's up!";
        progressFill.style.width = '100%';
        playBeep();
        updateSharedButtons();
        return;
      }
      setDisplays(left);
      rafId = requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      clearFinished();
      let duration;
      if (remaining > 0) {
        duration = remaining;
      } else {
        duration = getDurationMs();
        if (duration <= 0) {
          alert(`Timer ${id}: please set a duration greater than zero.`);
          return false;
        }
        totalDuration = duration;
      }
      endTime = performance.now() + duration;
      running = true;
      remaining = 0;
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      hoursInput.disabled = true;
      minutesInput.disabled = true;
      secondsInput.disabled = true;
      rafId = requestAnimationFrame(tick);
      updateSharedButtons();
      return true;
    }

    function pause() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
      remaining = Math.max(0, endTime - performance.now());
      setDisplays(remaining);
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      updateSharedButtons();
    }

    function reset() {
      running = false;
      cancelAnimationFrame(rafId);
      remaining = 0;
      totalDuration = 0;
      clearFinished();
      const ms = getDurationMs();
      setDisplays(ms);
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      hoursInput.disabled = false;
      minutesInput.disabled = false;
      secondsInput.disabled = false;
      updateSharedButtons();
    }

    function onDurationChange() {
      if (running || finished) return;
      const ms = getDurationMs();
      totalDuration = 0;
      setDisplays(ms);
    }

    hoursInput.addEventListener('input', onDurationChange);
    minutesInput.addEventListener('input', onDurationChange);
    secondsInput.addEventListener('input', onDurationChange);

    startBtn.addEventListener('click', start);
    pauseBtn.addEventListener('click', pause);
    resetBtn.addEventListener('click', reset);

    setDisplays(getDurationMs());

    return {
      start,
      pause,
      reset,
      isRunning: () => running,
      isFinished: () => finished,
      hasRemaining: () => remaining > 0 || running
    };
  }

  const timer1 = createTimer('1');
  const timer2 = createTimer('2');

  // ---------- Display mode ----------
  const displayModeRadios = document.querySelectorAll('input[name="displayMode"]');

  function getDisplayMode() {
    const checked = document.querySelector('input[name="displayMode"]:checked');
    return checked ? checked.value : 'digital';
  }

  function updateDisplayModeUI() {
    const mode = getDisplayMode();
    document.querySelectorAll('.digital-wrap').forEach(el => {
      el.style.display = mode === 'digital' ? '' : 'none';
    });
    document.querySelectorAll('.clock-wrap').forEach(el => {
      el.style.display = mode === 'clock' ? '' : 'none';
    });
    document.querySelectorAll('.progress-wrap').forEach(el => {
      el.style.display = mode === 'progress' ? '' : 'none';
    });
  }

  displayModeRadios.forEach(r => r.addEventListener('change', updateDisplayModeUI));
  updateDisplayModeUI();

  // ---------- Start mode (Simultaneous / Asynchronous) ----------
  const startModeRadios = document.querySelectorAll('input[name="startMode"]');
  const simultaneousControls = document.getElementById('simultaneousControls');
  const tmStartBothBtn = document.getElementById('tmStartBothBtn');
  const tmPauseBothBtn = document.getElementById('tmPauseBothBtn');
  const tmResetBothBtn = document.getElementById('tmResetBothBtn');

  function getStartMode() {
    const checked = document.querySelector('input[name="startMode"]:checked');
    return checked ? checked.value : 'simultaneous';
  }

  function updateStartModeUI() {
    const mode = getStartMode();
    if (mode === 'async') {
      document.body.classList.add('async-mode');
    } else {
      document.body.classList.remove('async-mode');
    }
    updateSharedButtons();
  }

  function updateSharedButtons() {
    const anyRunning = timer1.isRunning() || timer2.isRunning();
    tmPauseBothBtn.disabled = !anyRunning;
    tmStartBothBtn.disabled = timer1.isRunning() && timer2.isRunning();
  }

  startModeRadios.forEach(r => r.addEventListener('change', updateStartModeUI));
  updateStartModeUI();

  tmStartBothBtn.addEventListener('click', () => {
    if (!timer1.isRunning()) timer1.start();
    if (!timer2.isRunning()) timer2.start();
    updateSharedButtons();
  });

  tmPauseBothBtn.addEventListener('click', () => {
    if (timer1.isRunning()) timer1.pause();
    if (timer2.isRunning()) timer2.pause();
    updateSharedButtons();
  });

  tmResetBothBtn.addEventListener('click', () => {
    timer1.reset();
    timer2.reset();
    updateSharedButtons();
  });
});
