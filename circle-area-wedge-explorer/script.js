const canvas = document.getElementById('wedgeCanvas');
const context = canvas.getContext('2d');

const radiusInput = document.getElementById('radiusInput');
const sliceCountInput = document.getElementById('sliceCount');
const sliceValue = document.getElementById('sliceValue');
const speedType = document.getElementById('speedType');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const resetBtn = document.getElementById('resetBtn');
const phaseReadout = document.getElementById('phaseReadout');
const mathReadout = document.getElementById('mathReadout');

const TOTAL_PHASES = 5;

let currentPhase = 0;
let displayPhase = 0;
let isAnimating = false;
let animationFrame = null;

function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round2(value) {
  return Number(value.toFixed(2));
}

function getAnimationDuration() {
  const speed = speedType.value;
  if (speed === 'instant') return 0;
  if (speed === 'fast') return 350;
  if (speed === 'slow') return 1100;
  if (speed === 'very-slow') return 1700;
  return 700;
}

function getScene() {
  const radius = clampValue(Number(radiusInput.value) || 10, 1, 200);
  const slices = clampValue(Number(sliceCountInput.value) || 24, 6, 60);
  const visualRadius = clampValue(radius * 7, 45, 110);

  const circleCenter = { x: 250, y: 210 };

  const rectangleHeight = visualRadius;
  const rectCenterY = 220;
  const topY = rectCenterY - rectangleHeight / 2;
  const bottomY = rectCenterY + rectangleHeight / 2;

  const widthApprox = Math.PI * visualRadius;
  const slotWidth = widthApprox / (slices / 2);
  const rectStartX = 640 - widthApprox / 2;

  return {
    radius,
    slices,
    visualRadius,
    rectangleHeight,
    circleCenter,
    topY,
    bottomY,
    slotWidth,
    rectStartX,
    circumference: 2 * Math.PI * radius,
    area: Math.PI * radius * radius
  };
}

function drawPlainCircle(scene) {
  context.fillStyle = '#fff';
  context.strokeStyle = '#000';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(scene.circleCenter.x, scene.circleCenter.y, scene.visualRadius, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.beginPath();
  context.moveTo(scene.circleCenter.x, scene.circleCenter.y);
  context.lineTo(scene.circleCenter.x + scene.visualRadius, scene.circleCenter.y);
  context.stroke();

  context.fillStyle = '#222';
  context.font = '18px Segoe UI';
  context.fillText('r', scene.circleCenter.x + scene.visualRadius / 2, scene.circleCenter.y - 8);
}

function drawOneWedge(center, radius, startAngle, endAngle, color, rotation = 0) {
  context.save();
  context.translate(center.x, center.y);
  context.rotate(rotation);

  context.beginPath();
  context.moveTo(0, 0);
  context.arc(0, 0, radius, startAngle, endAngle);
  context.closePath();

  context.fillStyle = color;
  context.fill();
  context.strokeStyle = '#000';
  context.lineWidth = 1;
  context.stroke();

  context.restore();
}

function drawWedges(scene, phaseValue) {
  const angleSize = (Math.PI * 2) / scene.slices;

  const explode = clampValue(phaseValue - 1, 0, 1);
  const moveToBands = clampValue(phaseValue - 2, 0, 1);
  const combineToRectangle = clampValue(phaseValue - 3, 0, 1);

  let blueIndex = 0;
  let redIndex = 0;

  for (let i = 0; i < scene.slices; i += 1) {
    const start = -Math.PI / 2 + i * angleSize;
    const end = start + angleSize;
    const mid = (start + end) / 2;

    const isBlue = i % 2 === 0;
    const color = isBlue ? '#2a6edb' : '#e94f37';

    const radialOffset = scene.visualRadius * 0.2 * explode;
    const circlePos = {
      x: scene.circleCenter.x + Math.cos(mid) * radialOffset,
      y: scene.circleCenter.y + Math.sin(mid) * radialOffset
    };

    const targetX = isBlue
      ? scene.rectStartX + scene.slotWidth * (blueIndex + 0.5)
      : scene.rectStartX + scene.slotWidth * redIndex;

    const bandCenter = {
      x: targetX,
      y: isBlue
        ? scene.bottomY + scene.rectangleHeight * 1.25
        : scene.topY - scene.rectangleHeight * 1.25
    };

    const finalCenter = {
      x: targetX,
      y: isBlue ? scene.topY : scene.bottomY
    };

    const afterBands = {
      x: circlePos.x + (bandCenter.x - circlePos.x) * moveToBands,
      y: circlePos.y + (bandCenter.y - circlePos.y) * moveToBands
    };

    const center = {
      x: afterBands.x + (finalCenter.x - afterBands.x) * combineToRectangle,
      y: afterBands.y + (finalCenter.y - afterBands.y) * combineToRectangle
    };

    const targetRotation = isBlue
      ? Math.PI / 2 - mid
      : -Math.PI / 2 - mid;

    const rotationProgress = clampValue(phaseValue - 2, 0, 1);
    const rotation = targetRotation * rotationProgress;

    drawOneWedge(center, scene.visualRadius, start, end, color, rotation);

    if (isBlue) blueIndex += 1;
    else redIndex += 1;
  }
}

function drawRectangleGuides(scene) {
  const width = Math.PI * scene.visualRadius;
  const left = scene.rectStartX;
  const top = scene.topY;
  const height = scene.rectangleHeight;
  const bottom = scene.bottomY;
  const green = '#3bb273';

  context.strokeStyle = '#000';
  context.lineWidth = 3;
  context.strokeRect(left, top, width, height);

  const barY = bottom + 42;
  context.strokeStyle = green;
  context.lineWidth = 3;

  context.beginPath();
  context.moveTo(left, bottom + 28);
  context.lineTo(left, bottom + 56);
  context.stroke();

  context.beginPath();
  context.moveTo(left + width, bottom + 28);
  context.lineTo(left + width, bottom + 56);
  context.stroke();

  context.beginPath();
  context.moveTo(left, barY);
  context.lineTo(left + width, barY);
  context.stroke();

  context.fillStyle = '#222';
  context.font = '17px Segoe UI';
  context.textAlign = 'center';
  const widthLabel = currentPhase >= 5
    ? '1/2 circumference = πr'
    : '1/2 circumference';
  context.fillText(widthLabel, left + width / 2, bottom + 70);

  const hBarX = left - 30;
  context.beginPath();
  context.moveTo(left - 16, top);
  context.lineTo(left - 44, top);
  context.stroke();

  context.beginPath();
  context.moveTo(left - 16, bottom);
  context.lineTo(left - 44, bottom);
  context.stroke();

  context.beginPath();
  context.moveTo(hBarX, top);
  context.lineTo(hBarX, bottom);
  context.stroke();

  context.save();
  context.translate(hBarX - 16, top + height / 2);
  context.rotate(-Math.PI / 2);
  context.fillStyle = '#222';
  context.font = '17px Segoe UI';
  context.textAlign = 'center';
  context.fillText('r', 0, 0);
  context.restore();

  context.textAlign = 'start';
}

function updateReadout(scene) {
  const p = currentPhase;

  const phaseMessages = [
    'Phase 0: Start with a circle of radius r.',
    `Phase 1: Circle is sliced into ${scene.slices} wedges.`,
    'Phase 2: Wedges separate to show individual slices clearly.',
    'Phase 3: Wedges move further apart into top and bottom bands.',
    'Phase 4: Wedges combine into the rectangle shape.',
    'Phase 5: Rectangle view is fixed for the final area explanation.'
  ];

  phaseReadout.textContent = phaseMessages[p] || phaseMessages[0];

  const radius = round2(scene.radius);
  const circumference = round2(scene.circumference);
  const halfCircumference = round2(scene.circumference / 2);
  const area = round2(scene.area);

  if (p <= 4) {
    mathReadout.innerHTML = `
      <div><strong>Radius:</strong> r = ${radius}</div>
      <div><strong>Circumference:</strong> 2πr = ${circumference}</div>
    `;
    return;
  }

  mathReadout.innerHTML = `
    <div><strong>Width:</strong> 1/2 circumference = 1/2(2πr) = πr = ${halfCircumference}</div>
    <div><strong>Height:</strong> r = ${radius}</div>
    <div><strong>Area:</strong> A = πr × r = πr² = ${area}</div>
  `;
}

function updateButtons() {
  rewindBtn.disabled = isAnimating || currentPhase <= 0;
  forwardBtn.disabled = isAnimating || currentPhase >= TOTAL_PHASES;
  resetBtn.disabled = isAnimating || (currentPhase === 0 && Math.abs(displayPhase) < 0.0001);
}

function render() {
  const scene = getScene();
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (displayPhase < 0.5) {
    drawPlainCircle(scene);
  } else {
    drawWedges(scene, displayPhase);
  }

  if (displayPhase >= 3.5) {
    drawRectangleGuides(scene);
  }

  updateReadout(scene);
  updateButtons();
}

function animateToPhase(targetPhase) {
  if (isAnimating) return;

  const duration = getAnimationDuration();
  if (duration === 0) {
    currentPhase = targetPhase;
    displayPhase = targetPhase;
    render();
    return;
  }

  const start = performance.now();
  const beginPhase = displayPhase;
  isAnimating = true;

  function step(timestamp) {
    const elapsed = timestamp - start;
    const ratio = clampValue(elapsed / duration, 0, 1);
    const eased = 1 - Math.pow(1 - ratio, 3);

    displayPhase = beginPhase + (targetPhase - beginPhase) * eased;
    render();

    if (ratio < 1) {
      animationFrame = requestAnimationFrame(step);
      return;
    }

    currentPhase = targetPhase;
    displayPhase = targetPhase;
    isAnimating = false;
    animationFrame = null;
    render();
  }

  animationFrame = requestAnimationFrame(step);
}

function normalizeInputs() {
  const safeRadius = clampValue(Number(radiusInput.value) || 10, 1, 200);
  radiusInput.value = safeRadius.toFixed(2);

  const safeSlices = clampValue(Number(sliceCountInput.value) || 24, 6, 60);
  const evenSlices = safeSlices % 2 === 0 ? safeSlices : safeSlices + 1;
  sliceCountInput.value = String(evenSlices);
  sliceValue.textContent = String(evenSlices);
}

rewindBtn.addEventListener('click', () => {
  if (currentPhase > 0) animateToPhase(currentPhase - 1);
});

forwardBtn.addEventListener('click', () => {
  if (currentPhase < TOTAL_PHASES) animateToPhase(currentPhase + 1);
});

resetBtn.addEventListener('click', () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    isAnimating = false;
  }

  currentPhase = 0;
  displayPhase = 0;
  render();
});

radiusInput.addEventListener('change', () => {
  normalizeInputs();
  render();
});

sliceCountInput.addEventListener('input', () => {
  normalizeInputs();
  render();
});

speedType.addEventListener('change', () => {
  render();
});

window.addEventListener('resize', render);

normalizeInputs();
render();
