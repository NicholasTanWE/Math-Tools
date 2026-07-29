// Stopwatch & Timer – Math Tools mini-project
// Lap times persist in localStorage
// Dual timers with Simultaneous / Asynchronous start + Digital / Clock / Progress displays

document.addEventListener('DOMContentLoaded', () => {
  const btnStopwatch = document.getElementById('btnStopwatch');
  const btnTimer     = document.getElementById('btnTimer');
  const btnCountdown = document.getElementById('btnCountdown');
  const stopwatchSection = document.getElementById('stopwatchSection');
  const timerSection     = document.getElementById('timerSection');
  const countdownSection = document.getElementById('countdownSection');
  const timerOptions     = document.getElementById('timerOptions');
  const countdownOptions = document.getElementById('countdownOptions');

  function setMode(mode) {
    if (btnStopwatch) btnStopwatch.classList.toggle('active', mode === 'stopwatch');
    if (btnTimer) btnTimer.classList.toggle('active', mode === 'timer');
    if (btnCountdown) btnCountdown.classList.toggle('active', mode === 'countdown');
    if (stopwatchSection) stopwatchSection.style.display = mode === 'stopwatch' ? '' : 'none';
    if (timerSection) timerSection.style.display = mode === 'timer' ? '' : 'none';
    if (countdownSection) countdownSection.style.display = mode === 'countdown' ? '' : 'none';
    if (timerOptions) timerOptions.style.display = mode === 'timer' ? '' : 'none';
    if (countdownOptions) countdownOptions.style.display = mode === 'countdown' ? '' : 'none';
  }

  if (btnStopwatch) btnStopwatch.addEventListener('click', () => setMode('stopwatch'));
  if (btnTimer) btnTimer.addEventListener('click', () => setMode('timer'));
  if (btnCountdown) btnCountdown.addEventListener('click', () => setMode('countdown'));

  // STOPWATCH
  const swDisplay   = document.getElementById('stopwatchDisplay');
  const swStartBtn  = document.getElementById('swStartBtn');
  const swStopBtn   = document.getElementById('swStopBtn');
  const swLapBtn    = document.getElementById('swLapBtn');
  const swResetBtn  = document.getElementById('swResetBtn');
  const lapsList    = document.getElementById('lapsList');
  const noLapsMsg   = document.getElementById('noLapsMsg');
  const clearLapsBtn = document.getElementById('clearLapsBtn');

  let swRunning = false, swStartTime = 0, swElapsed = 0, swRafId = null, laps = [];
  const LAPS_KEY = 'mathTools_stopwatchLaps';

  function loadLaps() {
    try { const raw = localStorage.getItem(LAPS_KEY); if (raw) { laps = JSON.parse(raw); renderLaps(); } } catch (e) { laps = []; }
  }
  function saveLaps() { try { localStorage.setItem(LAPS_KEY, JSON.stringify(laps)); } catch (e) {} }
  function formatMs(ms) {
    const totalCs = Math.floor(ms / 10), cs = totalCs % 100, totalSec = Math.floor(totalCs / 100);
    const s = totalSec % 60, m = Math.floor(totalSec / 60) % 60, h = Math.floor(totalSec / 3600);
    const pad = (n, w = 2) => String(n).padStart(w, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}` : `${pad(m)}:${pad(s)}.${pad(cs)}`;
  }
  function updateSwDisplay() {
    const now = performance.now();
    swDisplay.textContent = formatMs(swRunning ? swElapsed + (now - swStartTime) : swElapsed);
  }
  function swTick() { updateSwDisplay(); if (swRunning) swRafId = requestAnimationFrame(swTick); }
  function startStopwatch() {
    if (swRunning) return;
    swRunning = true; swStartTime = performance.now();
    swStartBtn.disabled = true; swStopBtn.disabled = false; swLapBtn.disabled = false;
    swRafId = requestAnimationFrame(swTick);
  }
  function stopStopwatch() {
    if (!swRunning) return;
    swRunning = false; swElapsed += performance.now() - swStartTime; cancelAnimationFrame(swRafId);
    swStartBtn.disabled = false; swStopBtn.disabled = true; swLapBtn.disabled = true; updateSwDisplay();
  }
  function resetStopwatch() { stopStopwatch(); swElapsed = 0; updateSwDisplay(); }
  function addLap() {
    const now = performance.now();
    const current = swRunning ? swElapsed + (now - swStartTime) : swElapsed;
    laps.unshift({ time: current, label: formatMs(current) }); saveLaps(); renderLaps();
  }
  function renderLaps() {
    lapsList.innerHTML = '';
    if (!laps.length) { noLapsMsg.style.display = ''; return; }
    noLapsMsg.style.display = 'none';
    laps.forEach((lap, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="lap-num">Lap ${laps.length - idx}</span><span class="lap-time">${lap.label}</span>`;
      lapsList.appendChild(li);
    });
  }
  function clearLaps() { laps = []; saveLaps(); renderLaps(); }
  if (swStartBtn) {
    swStartBtn.addEventListener('click', startStopwatch);
    swStopBtn.addEventListener('click', stopStopwatch);
    swLapBtn.addEventListener('click', addLap);
    swResetBtn.addEventListener('click', resetStopwatch);
    clearLapsBtn.addEventListener('click', clearLaps);
    loadLaps();
  }

  // TIMER helpers
  function formatTimer(ms) {
    if (ms < 0) ms = 0;
    const totalSec = Math.ceil(ms / 1000), s = totalSec % 60;
    const totalMin = Math.floor(totalSec / 60), m = totalMin % 60, h = Math.floor(totalMin / 60);
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }
  function buildClockMarkers(svg) {
    const minuteG = svg.querySelector('.minute-markers'), hourG = svg.querySelector('.hour-markers');
    if (!minuteG || !hourG) return;
    minuteG.innerHTML = ''; hourG.innerHTML = '';
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6) * Math.PI / 180, isHour = i % 5 === 0;
      const outer = 140, inner = isHour ? 120 : 130;
      const x1 = 150 + outer * Math.sin(angle), y1 = 150 - outer * Math.cos(angle);
      const x2 = 150 + inner * Math.sin(angle), y2 = 150 - inner * Math.cos(angle);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1); line.setAttribute('y1', y1);
      line.setAttribute('x2', x2); line.setAttribute('y2', y2);
      line.setAttribute('stroke', '#222'); line.setAttribute('stroke-width', isHour ? 3 : 1.5);
      (isHour ? hourG : minuteG).appendChild(line);
    }
  }

  const MUTE_KEY = 'mathTools_timerMute';
  let soundMuted = false;
  try { soundMuted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) {}
  const muteCheckbox = document.getElementById('muteChimes');
  if (muteCheckbox) {
    muteCheckbox.checked = soundMuted;
    muteCheckbox.addEventListener('change', () => {
      soundMuted = muteCheckbox.checked;
      try { localStorage.setItem(MUTE_KEY, soundMuted ? '1' : '0'); } catch (e) {}
    });
  }
  let lastChimeAt = 0;
  function playTone(ctx, startTime, duration, freq) {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.28, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.start(startTime); osc.stop(startTime + duration);
  }
  function playChime(count) {
    if (soundMuted) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      playTone(ctx, now, 0.35, 880);
      if (count >= 2) playTone(ctx, now + 0.45, 0.35, 880);
    } catch (e) {}
  }
  function handleFinishChime(timerId, otherTimer) {
    if (soundMuted) return;
    const now = performance.now();
    const otherAlmostDone = otherTimer && ((typeof otherTimer.getRemainingMs === 'function' && otherTimer.getRemainingMs() <= 200) || otherTimer.isFinished());
    if (otherAlmostDone || (now - lastChimeAt < 200)) {
      if (now - lastChimeAt >= 200) { lastChimeAt = now; playChime(1); }
      return;
    }
    lastChimeAt = now;
    playChime(timerId === '2' ? 2 : 1);
  }

  const timers = {};
  function createTimer(id) {
    const hoursInput = document.getElementById(`t${id}Hours`);
    const minutesInput = document.getElementById(`t${id}Minutes`);
    const secondsInput = document.getElementById(`t${id}Seconds`);
    const digitalEl = document.getElementById(`t${id}Digital`);
    const statusEl = document.getElementById(`t${id}Status`);
    const clockSvg = document.getElementById(`t${id}ClockSvg`);
    const clockHint = document.getElementById(`t${id}ClockHint`);
    const clockStatus = document.getElementById(`t${id}ClockStatus`);
    const progressLabel = document.getElementById(`t${id}ProgressLabel`);
    const progressFill = document.getElementById(`t${id}ProgressFill`);
    const progressStatus = document.getElementById(`t${id}ProgressStatus`);
    const panel = document.querySelector(`.timer-${id}`);
    const minuteHand = clockSvg.querySelector('.minute-hand');
    const secondHand = clockSvg.querySelector('.second-hand');
    const startBtn = document.querySelector(`.tm-start[data-timer="${id}"]`);
    const pauseBtn = document.querySelector(`.tm-pause[data-timer="${id}"]`);
    const resetBtn = document.querySelector(`.tm-reset[data-timer="${id}"]`);
    buildClockMarkers(clockSvg);
    let running = false, endTime = 0, remaining = 0, totalDuration = 0, rafId = null, finished = false;
    function getDurationMs() {
      const h = Math.max(0, parseInt(hoursInput.value, 10) || 0);
      const m = Math.max(0, parseInt(minutesInput.value, 10) || 0);
      const s = Math.max(0, parseInt(secondsInput.value, 10) || 0);
      return ((h * 3600) + (m * 60) + s) * 1000;
    }
    function updateClockHands(ms) {
      if (ms < 0) ms = 0;
      const seconds = (ms / 1000) % 60, minutes = (ms / 60000) % 60;
      secondHand.setAttribute('transform', `rotate(${(seconds / 60) * 360} 150 150)`);
      minuteHand.setAttribute('transform', `rotate(${(minutes / 60) * 360} 150 150)`);
    }
    function setDisplays(ms) {
      const text = formatTimer(ms);
      digitalEl.textContent = text; clockHint.textContent = text; progressLabel.textContent = text;
      updateClockHands(ms);
      if (totalDuration > 0) {
        const elapsed = totalDuration - Math.max(0, ms);
        progressFill.style.width = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) + '%';
      } else progressFill.style.width = '0%';
    }
    function clearFinished() {
      finished = false; panel.classList.remove('finished');
      statusEl.textContent = ''; clockStatus.textContent = ''; progressStatus.textContent = '';
    }
    function tick() {
      const left = endTime - performance.now();
      if (left <= 0) {
        setDisplays(0); running = false; finished = true;
        pauseBtn.disabled = true; startBtn.disabled = false;
        panel.classList.add('finished');
        statusEl.textContent = clockStatus.textContent = progressStatus.textContent = "Time's up!";
        progressFill.style.width = '100%';
        handleFinishChime(id, timers[id === '1' ? '2' : '1']);
        updateSharedButtons();
        return;
      }
      setDisplays(left); rafId = requestAnimationFrame(tick);
    }
    function start() {
      if (running) return; clearFinished();
      let duration = remaining > 0 ? remaining : getDurationMs();
      if (remaining <= 0) {
        if (duration <= 0) { alert(`Timer ${id}: please set a duration greater than zero.`); return false; }
        totalDuration = duration;
      }
      endTime = performance.now() + duration; running = true; remaining = 0;
      startBtn.disabled = true; pauseBtn.disabled = false;
      hoursInput.disabled = minutesInput.disabled = secondsInput.disabled = true;
      rafId = requestAnimationFrame(tick); updateSharedButtons(); return true;
    }
    function pause() {
      if (!running) return;
      running = false; cancelAnimationFrame(rafId);
      remaining = Math.max(0, endTime - performance.now()); setDisplays(remaining);
      startBtn.disabled = false; pauseBtn.disabled = true; updateSharedButtons();
    }
    function reset() {
      running = false; cancelAnimationFrame(rafId); remaining = 0; totalDuration = 0; clearFinished();
      setDisplays(getDurationMs());
      startBtn.disabled = false; pauseBtn.disabled = true;
      hoursInput.disabled = minutesInput.disabled = secondsInput.disabled = false;
      updateSharedButtons();
    }
    function onDurationChange() { if (running || finished) return; totalDuration = 0; setDisplays(getDurationMs()); }
    hoursInput.addEventListener('input', onDurationChange);
    minutesInput.addEventListener('input', onDurationChange);
    secondsInput.addEventListener('input', onDurationChange);
    startBtn.addEventListener('click', start); pauseBtn.addEventListener('click', pause); resetBtn.addEventListener('click', reset);
    setDisplays(getDurationMs());
    return { start, pause, reset, isRunning: () => running, isFinished: () => finished, hasRemaining: () => remaining > 0 || running, getRemainingMs: () => running ? Math.max(0, endTime - performance.now()) : remaining };
  }

  const timer1 = createTimer('1'), timer2 = createTimer('2');
  timers['1'] = timer1; timers['2'] = timer2;

  document.querySelectorAll('input[name="displayMode"]').forEach(r => r.addEventListener('change', () => {
    const mode = (document.querySelector('input[name="displayMode"]:checked') || {}).value || 'digital';
    document.querySelectorAll('.digital-wrap').forEach(el => { el.style.display = mode === 'digital' ? '' : 'none'; });
    document.querySelectorAll('.clock-wrap').forEach(el => { el.style.display = mode === 'clock' ? '' : 'none'; });
    document.querySelectorAll('.progress-wrap').forEach(el => { el.style.display = mode === 'progress' ? '' : 'none'; });
  }));
  // init display mode
  (function(){ const mode = (document.querySelector('input[name="displayMode"]:checked') || {}).value || 'digital';
    document.querySelectorAll('.digital-wrap').forEach(el => { el.style.display = mode === 'digital' ? '' : 'none'; });
    document.querySelectorAll('.clock-wrap').forEach(el => { el.style.display = mode === 'clock' ? '' : 'none'; });
    document.querySelectorAll('.progress-wrap').forEach(el => { el.style.display = mode === 'progress' ? '' : 'none'; });
  })();

  const tmStartBothBtn = document.getElementById('tmStartBothBtn');
  const tmPauseBothBtn = document.getElementById('tmPauseBothBtn');
  const tmResetBothBtn = document.getElementById('tmResetBothBtn');
  function updateSharedButtons() {
    if (!tmPauseBothBtn) return;
    const anyRunning = timer1.isRunning() || timer2.isRunning();
    tmPauseBothBtn.disabled = !anyRunning;
    tmStartBothBtn.disabled = timer1.isRunning() && timer2.isRunning();
  }
  document.querySelectorAll('input[name="startMode"]').forEach(r => r.addEventListener('change', () => {
    const mode = (document.querySelector('input[name="startMode"]:checked') || {}).value || 'simultaneous';
    document.body.classList.toggle('async-mode', mode === 'async');
    updateSharedButtons();
  }));
  if ((document.querySelector('input[name="startMode"]:checked') || {}).value === 'async') document.body.classList.add('async-mode');
  if (tmStartBothBtn) {
    tmStartBothBtn.addEventListener('click', () => { if (!timer1.isRunning()) timer1.start(); if (!timer2.isRunning()) timer2.start(); updateSharedButtons(); });
    tmPauseBothBtn.addEventListener('click', () => { if (timer1.isRunning()) timer1.pause(); if (timer2.isRunning()) timer2.pause(); updateSharedButtons(); });
    tmResetBothBtn.addEventListener('click', () => { timer1.reset(); timer2.reset(); updateSharedButtons(); });
  }

  // COUNTDOWN – full logic loaded from inline implementation
  // (compact version)
  (function initCountdown() {
    const cdDateInput = document.getElementById('cdDate');
    const cdHoursInput = document.getElementById('cdHours');
    const cdMinutesInput = document.getElementById('cdMinutes');
    const cdTargetLabel = document.getElementById('cdTargetLabel');
    const cdDigital = document.getElementById('cdDigital');
    const cdStatus = document.getElementById('cdStatus');
    const cdClockSvg = document.getElementById('cdClockSvg');
    const cdClockHint = document.getElementById('cdClockHint');
    const cdClockStatus = document.getElementById('cdClockStatus');
    const cdProgressLabel = document.getElementById('cdProgressLabel');
    const cdProgressFill = document.getElementById('cdProgressFill');
    const cdProgressStatus = document.getElementById('cdProgressStatus');
    const cdPanel = document.querySelector('.countdown-panel');
    const cdStartBtn = document.getElementById('cdStartBtn');
    const cdPauseBtn = document.getElementById('cdPauseBtn');
    const cdResetBtn = document.getElementById('cdResetBtn');
    const cdFullscreenBtn = document.getElementById('cdFullscreenBtn');
    const cdMuteCheckbox = document.getElementById('cdMuteChimes');
    if (!cdDateInput || !cdStartBtn) return;

    if (cdClockSvg) buildClockMarkers(cdClockSvg);
    const cdMinuteHand = cdClockSvg ? cdClockSvg.querySelector('.minute-hand') : null;
    const cdSecondHand = cdClockSvg ? cdClockSvg.querySelector('.second-hand') : null;

    if (cdMuteCheckbox) {
      cdMuteCheckbox.checked = soundMuted;
      cdMuteCheckbox.addEventListener('change', () => {
        soundMuted = cdMuteCheckbox.checked;
        if (muteCheckbox) muteCheckbox.checked = soundMuted;
        try { localStorage.setItem(MUTE_KEY, soundMuted ? '1' : '0'); } catch (e) {}
      });
    }
    if (muteCheckbox) muteCheckbox.addEventListener('change', () => { if (cdMuteCheckbox) cdMuteCheckbox.checked = muteCheckbox.checked; });

    let cdRunning = false, cdTargetMs = 0, cdTotalDuration = 0, cdRemaining = 0, cdRafId = null, cdFinished = false;
    function pad2(n) { return String(n).padStart(2, '0'); }
    function formatDateInput(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
    function formatTargetLabel(date) {
      const opts = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
      return 'Until ' + pad2(date.getHours()) + ':' + pad2(date.getMinutes()) + ', ' + date.toLocaleDateString(undefined, opts);
    }
    function resolveTargetDate() {
      const now = new Date();
      let y, m, d;
      if (cdDateInput.value) {
        const parts = cdDateInput.value.split('-');
        y = parseInt(parts[0], 10); m = parseInt(parts[1], 10) - 1; d = parseInt(parts[2], 10);
      } else { y = now.getFullYear(); m = now.getMonth(); d = now.getDate(); }
      const h = Math.max(0, Math.min(23, parseInt(cdHoursInput.value, 10) || 0));
      const min = Math.max(0, Math.min(59, parseInt(cdMinutesInput.value, 10) || 0));
      let target = new Date(y, m, d, h, min, 0, 0);
      while (target.getTime() <= Date.now()) target = new Date(target.getTime() + 24 * 60 * 60 * 1000);
      return target;
    }
    function formatCountdown(ms) {
      if (ms < 0) ms = 0;
      const totalSec = Math.ceil(ms / 1000), s = totalSec % 60;
      const totalMin = Math.floor(totalSec / 60), m = totalMin % 60;
      const totalH = Math.floor(totalMin / 60), h = totalH % 24, days = Math.floor(totalH / 24);
      return days + 'd ' + pad2(h) + ':' + pad2(m) + ':' + pad2(s);
    }
    function updateCdClockHands(ms) {
      if (!cdMinuteHand || !cdSecondHand) return;
      if (ms < 0) ms = 0;
      const seconds = (ms / 1000) % 60, minutes = (ms / 60000) % 60;
      cdSecondHand.setAttribute('transform', 'rotate(' + ((seconds / 60) * 360) + ' 150 150)');
      cdMinuteHand.setAttribute('transform', 'rotate(' + ((minutes / 60) * 360) + ' 150 150)');
    }
    function setCdDisplays(ms) {
      const text = formatCountdown(ms);
      cdDigital.textContent = text; cdClockHint.textContent = text; cdProgressLabel.textContent = text;
      updateCdClockHands(ms);
      if (cdTotalDuration > 0) {
        const elapsed = cdTotalDuration - Math.max(0, ms);
        cdProgressFill.style.width = Math.min(100, Math.max(0, (elapsed / cdTotalDuration) * 100)) + '%';
      } else cdProgressFill.style.width = '0%';
    }
    function clearCdFinished() {
      cdFinished = false; if (cdPanel) cdPanel.classList.remove('finished');
      cdStatus.textContent = ''; cdClockStatus.textContent = ''; cdProgressStatus.textContent = '';
    }
    function refreshCdPreview() {
      if (cdRunning || cdFinished) return;
      const target = resolveTargetDate();
      cdTargetMs = target.getTime();
      cdTargetLabel.textContent = formatTargetLabel(target);
      cdTotalDuration = 0;
      setCdDisplays(Math.max(0, cdTargetMs - Date.now()));
    }
    function cdTick() {
      const left = cdTargetMs - Date.now();
      if (left <= 0) {
        setCdDisplays(0); cdRunning = false; cdFinished = true;
        cdPauseBtn.disabled = true; cdStartBtn.disabled = false;
        if (cdPanel) cdPanel.classList.add('finished');
        cdStatus.textContent = cdClockStatus.textContent = cdProgressStatus.textContent = "Time's up!";
        cdProgressFill.style.width = '100%';
        playChime(1);
        return;
      }
      setCdDisplays(left); cdRafId = requestAnimationFrame(cdTick);
    }
    function startCountdown() {
      if (cdRunning) return; clearCdFinished();
      if (cdRemaining > 0) { cdTargetMs = Date.now() + cdRemaining; cdRemaining = 0; }
      else {
        const target = resolveTargetDate();
        cdTargetMs = target.getTime();
        cdTotalDuration = cdTargetMs - Date.now();
        if (cdTotalDuration <= 0) { alert('Please choose a future date and time.'); return; }
        cdTargetLabel.textContent = formatTargetLabel(target);
        cdDateInput.value = formatDateInput(target);
      }
      cdRunning = true; cdStartBtn.disabled = true; cdPauseBtn.disabled = false;
      cdDateInput.disabled = cdHoursInput.disabled = cdMinutesInput.disabled = true;
      cdRafId = requestAnimationFrame(cdTick);
    }
    function pauseCountdown() {
      if (!cdRunning) return;
      cdRunning = false; cancelAnimationFrame(cdRafId);
      cdRemaining = Math.max(0, cdTargetMs - Date.now()); setCdDisplays(cdRemaining);
      cdStartBtn.disabled = false; cdPauseBtn.disabled = true;
    }
    function resetCountdown() {
      cdRunning = false; cancelAnimationFrame(cdRafId); cdRemaining = 0; cdTotalDuration = 0; clearCdFinished();
      cdDateInput.disabled = cdHoursInput.disabled = cdMinutesInput.disabled = false;
      cdStartBtn.disabled = false; cdPauseBtn.disabled = true; refreshCdPreview();
    }
    if (!cdDateInput.value) cdDateInput.value = formatDateInput(new Date());
    cdDateInput.addEventListener('change', refreshCdPreview);
    cdHoursInput.addEventListener('input', refreshCdPreview);
    cdMinutesInput.addEventListener('input', refreshCdPreview);
    cdStartBtn.addEventListener('click', startCountdown);
    cdPauseBtn.addEventListener('click', pauseCountdown);
    cdResetBtn.addEventListener('click', resetCountdown);
    document.querySelectorAll('input[name="cdDisplayMode"]').forEach(r => r.addEventListener('change', () => {
      const mode = (document.querySelector('input[name="cdDisplayMode"]:checked') || {}).value || 'digital';
      document.querySelectorAll('#countdownSection .digital-wrap').forEach(el => { el.style.display = mode === 'digital' ? '' : 'none'; });
      document.querySelectorAll('#countdownSection .clock-wrap').forEach(el => { el.style.display = mode === 'clock' ? '' : 'none'; });
      document.querySelectorAll('#countdownSection .progress-wrap').forEach(el => { el.style.display = mode === 'progress' ? '' : 'none'; });
    }));
    refreshCdPreview();

    // Fullscreen wiring for countdown
    window.__cdFullscreenBtn = cdFullscreenBtn;
  })();

  // FULLSCREEN
  const swFullscreenBtn = document.getElementById('swFullscreenBtn');
  const tmFullscreenBtn = document.getElementById('tmFullscreenBtn');
  const tmFullscreenBtnAsync = document.getElementById('tmFullscreenBtnAsync');
  const cdFullscreenBtn = document.getElementById('cdFullscreenBtn');

  function getFsTimerCount() {
    const checked = document.querySelector('input[name="fsTimerCount"]:checked');
    return checked ? checked.value : '1';
  }
  function applyFsTimerCount() {
    if (getFsTimerCount() === '1') { document.body.classList.add('fs-one-timer'); document.body.classList.remove('fs-two-timers'); }
    else { document.body.classList.add('fs-two-timers'); document.body.classList.remove('fs-one-timer'); }
  }
  document.querySelectorAll('input[name="fsTimerCount"]').forEach(r => r.addEventListener('change', () => {
    if (document.body.classList.contains('fs-active')) applyFsTimerCount();
  }));
  function updateFsButtonLabels(active) {
    const label = active ? 'Exit Fullscreen' : 'Fullscreen';
    [swFullscreenBtn, tmFullscreenBtn, tmFullscreenBtnAsync, cdFullscreenBtn].forEach(b => { if (b) b.textContent = label; });
  }
  function enterFullscreen(mode) {
    document.body.classList.add('fs-active');
    if (mode === 'timer') applyFsTimerCount();
    else document.body.classList.remove('fs-one-timer', 'fs-two-timers');
    updateFsButtonLabels(true);
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }
  function exitFullscreen() {
    document.body.classList.remove('fs-active', 'fs-one-timer', 'fs-two-timers');
    updateFsButtonLabels(false);
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }
  function toggleFullscreen(mode) {
    if (document.body.classList.contains('fs-active')) exitFullscreen();
    else enterFullscreen(mode);
  }
  if (swFullscreenBtn) swFullscreenBtn.addEventListener('click', () => toggleFullscreen('stopwatch'));
  if (tmFullscreenBtn) tmFullscreenBtn.addEventListener('click', () => toggleFullscreen('timer'));
  if (tmFullscreenBtnAsync) tmFullscreenBtnAsync.addEventListener('click', () => toggleFullscreen('timer'));
  if (cdFullscreenBtn) cdFullscreenBtn.addEventListener('click', () => toggleFullscreen('countdown'));
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && document.body.classList.contains('fs-active')) exitFullscreen();
  });
  document.addEventListener('webkitfullscreenchange', () => {
    if (!document.webkitFullscreenElement && document.body.classList.contains('fs-active')) exitFullscreen();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('fs-active')) exitFullscreen();
  });
});
