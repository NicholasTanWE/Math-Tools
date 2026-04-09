const canvas = document.getElementById('rollCanvas');
const context = canvas.getContext('2d');

const radiusInput = document.getElementById('radiusInput');
const rotationCount = document.getElementById('rotationCount');
const objectType = document.getElementById('objectType');
const speedType = document.getElementById('speedType');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const resetBtn = document.getElementById('resetBtn');
const mathReadout = document.getElementById('mathReadout');

let totalRotations = Number(rotationCount.value);
let currentPhase = 0;
let progress = 0;
let isAnimating = false;
let animationFrame = null;

function getPalette() {
  const styles = getComputedStyle(document.documentElement);
  return [
    styles.getPropertyValue('--primary-blue').trim(),
    styles.getPropertyValue('--primary-green').trim(),
    styles.getPropertyValue('--primary-red').trim(),
    styles.getPropertyValue('--primary-yellow').trim(),
    styles.getPropertyValue('--accent').trim()
  ];
}

function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getAnimationDuration() {
  const speed = speedType.value;
  if (speed === 'instant') {
    return 0;
  }
  if (speed === 'fast') {
    return 350;
  }
  if (speed === 'slow') {
    return 1100;
  }
  if (speed === 'very-slow') {
    return 1700;
  }
  return 700;
}

function getScene() {
  const safeRadius = clampValue(Number(radiusInput.value) || 20, 5, 100);
  const leftPadding = 90;
  const rightPadding = 50;
  const availableWidth = canvas.width - leftPadding - rightPadding;
  const rawCircumference = 2 * Math.PI * safeRadius;
  const maxDistance = totalRotations * rawCircumference;
  const scale = maxDistance > availableWidth ? availableWidth / maxDistance : 1;

  const visualRadius = safeRadius * scale;
  const circumferencePx = 2 * Math.PI * visualRadius;

  return {
    radius: safeRadius,
    visualRadius,
    circumference: rawCircumference,
    circumferencePx,
    startX: leftPadding,
    groundY: 250,
    scale
  };
}

function drawGroundAndSegments(scene) {
  const palette = getPalette();
  const segmentLength = scene.circumferencePx;
  const endX = scene.startX + segmentLength * totalRotations;

  context.strokeStyle = '#222';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(scene.startX, scene.groundY);
  context.lineTo(endX, scene.groundY);
  context.stroke();

  for (let i = 0; i < totalRotations; i += 1) {
    if (i >= currentPhase) {
      continue;
    }

    const x1 = scene.startX + i * segmentLength;
    const x2 = x1 + segmentLength;

    context.strokeStyle = palette[i % palette.length];
    context.lineWidth = 8;
    context.beginPath();
    context.moveTo(x1, scene.groundY);
    context.lineTo(x2, scene.groundY);
    context.stroke();
  }

  for (let i = 0; i <= totalRotations; i += 1) {
    const x = scene.startX + i * segmentLength;

    context.strokeStyle = '#000';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(x, scene.groundY - 14);
    context.lineTo(x, scene.groundY + 14);
    context.stroke();

    if (i > 0) {
      context.fillStyle = '#222';
      context.font = '18px Segoe UI';
      context.textAlign = 'center';
      context.fillText(`${i}C`, x, scene.groundY + 38);
    }
  }
}

function drawCircle(scene) {
  const distancePx = progress * scene.circumferencePx;
  const centerX = scene.startX + distancePx;
  const centerY = scene.groundY - scene.visualRadius;
  const markerAngle = Math.PI / 2 + progress * Math.PI * 2;

  const selectedObject = objectType.value;
  if (selectedObject === 'car-wheel') {
    drawCarWheel(centerX, centerY, scene.visualRadius, markerAngle);
    return;
  }

  if (selectedObject === 'wagon-wheel') {
    drawWagonWheel(centerX, centerY, scene.visualRadius, markerAngle);
    return;
  }

  drawDefaultCircle(centerX, centerY, scene.visualRadius, markerAngle);
}

function drawMarker(centerX, centerY, radius, markerAngle, markerColor = '#e94f37') {
  const markerX = centerX + radius * Math.cos(markerAngle);
  const markerY = centerY + radius * Math.sin(markerAngle);

  context.strokeStyle = '#000';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(centerX, centerY);
  context.lineTo(markerX, markerY);
  context.stroke();

  context.fillStyle = markerColor;
  context.beginPath();
  context.arc(markerX, markerY, Math.max(4, radius * 0.12), 0, Math.PI * 2);
  context.fill();
}

function drawCarWheel(centerX, centerY, radius, markerAngle) {
  const rimRadius = radius * 0.68;
  const hubRadius = radius * 0.18;

  context.fillStyle = '#222';
  context.strokeStyle = '#000';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.fillStyle = '#d9d9d9';
  context.beginPath();
  context.arc(centerX, centerY, rimRadius, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.strokeStyle = '#000';
  context.lineWidth = 3;
  const spokeCount = 6;
  for (let i = 0; i < spokeCount; i += 1) {
    const angle = markerAngle + (i * Math.PI * 2) / spokeCount;
    const x2 = centerX + rimRadius * Math.cos(angle);
    const y2 = centerY + rimRadius * Math.sin(angle);
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(x2, y2);
    context.stroke();
  }

  context.fillStyle = '#8a8a8a';
  context.beginPath();
  context.arc(centerX, centerY, hubRadius, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  drawMarker(centerX, centerY, radius, markerAngle);
}

function drawWagonWheel(centerX, centerY, radius, markerAngle) {
  const woodColor = '#c8924c';
  const spokeRadius = radius * 0.82;
  const hubRadius = radius * 0.14;

  context.fillStyle = woodColor;
  context.strokeStyle = '#000';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.fillStyle = '#f0d6a7';
  context.beginPath();
  context.arc(centerX, centerY, radius * 0.86, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.strokeStyle = '#000';
  context.lineWidth = 3;
  const spokeCount = 8;
  for (let i = 0; i < spokeCount; i += 1) {
    const angle = markerAngle + (i * Math.PI * 2) / spokeCount;
    const x2 = centerX + spokeRadius * Math.cos(angle);
    const y2 = centerY + spokeRadius * Math.sin(angle);
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(x2, y2);
    context.stroke();
  }

  context.fillStyle = '#b0742f';
  context.beginPath();
  context.arc(centerX, centerY, hubRadius, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  drawMarker(centerX, centerY, radius, markerAngle);
}

function drawDefaultCircle(centerX, centerY, radius, markerAngle) {
  context.fillStyle = '#fff';
  context.strokeStyle = '#000';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  drawMarker(centerX, centerY, radius, markerAngle, '#e94f37');
}

function updateMathReadout(scene) {
  const completed = currentPhase;
  const distance = completed * scene.circumference;

  mathReadout.innerHTML = `
    <div><strong>Circumference:</strong> C = 2πr = ${(scene.circumference).toFixed(2)}</div>
    <div><strong>Distance traveled:</strong> d = nC = ${completed}C = ${(distance).toFixed(2)}</div>
  `;
}

function updateButtons() {
  rewindBtn.disabled = isAnimating || currentPhase <= 0;
  forwardBtn.disabled = isAnimating || currentPhase >= totalRotations;
  resetBtn.disabled = isAnimating || (currentPhase === 0 && Math.abs(progress) < 0.0001);
}

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  const scene = getScene();
  drawGroundAndSegments(scene);
  drawCircle(scene);
  updateMathReadout(scene);
  updateButtons();
}

function animateToPhase(targetPhase) {
  if (isAnimating) {
    return;
  }

  const duration = getAnimationDuration();
  if (duration === 0) {
    currentPhase = targetPhase;
    progress = targetPhase;
    render();
    return;
  }

  const start = performance.now();
  const startProgress = progress;
  const targetProgress = targetPhase;
  isAnimating = true;

  function step(timestamp) {
    const elapsed = timestamp - start;
    const ratio = clampValue(elapsed / duration, 0, 1);
    const eased = 1 - Math.pow(1 - ratio, 3);

    progress = startProgress + (targetProgress - startProgress) * eased;
    render();

    if (ratio < 1) {
      animationFrame = requestAnimationFrame(step);
      return;
    }

    currentPhase = targetPhase;
    progress = targetPhase;
    isAnimating = false;
    animationFrame = null;
    render();
  }

  animationFrame = requestAnimationFrame(step);
}

function normalizeRadiusInput() {
  const safeValue = clampValue(Number(radiusInput.value) || 20, 5, 100);
  radiusInput.value = String(Math.round(safeValue));
}

rewindBtn.addEventListener('click', () => {
  if (currentPhase <= 0) {
    return;
  }

  animateToPhase(currentPhase - 1);
});

forwardBtn.addEventListener('click', () => {
  if (currentPhase >= totalRotations) {
    return;
  }

  animateToPhase(currentPhase + 1);
});

resetBtn.addEventListener('click', () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    isAnimating = false;
  }

  currentPhase = 0;
  progress = 0;
  render();
});

radiusInput.addEventListener('change', () => {
  normalizeRadiusInput();
  render();
});

rotationCount.addEventListener('change', () => {
  totalRotations = Number(rotationCount.value);

  if (currentPhase > totalRotations) {
    currentPhase = totalRotations;
    progress = totalRotations;
  }

  render();
});

objectType.addEventListener('change', () => {
  render();
});

window.addEventListener('resize', render);

normalizeRadiusInput();
render();
