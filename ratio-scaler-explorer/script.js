// Global state
let mode = 'multiply'; // 'multiply' or 'add'
let baseA = 1;
let baseB = 2;
let scaleFactor = 1;
let labelA = 'A';
let labelB = 'B';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeEventListeners();
  updateDisplay();
});

function initializeEventListeners() {
  // Input listeners
  document.getElementById('labelA').addEventListener('input', handleLabelChange);
  document.getElementById('labelB').addEventListener('input', handleLabelChange);
  document.getElementById('baseA').addEventListener('input', handleRatioChange);
  document.getElementById('baseB').addEventListener('input', handleRatioChange);
  document.getElementById('scaleSlider').addEventListener('input', handleScaleChange);
}

function handleLabelChange() {
  labelA = document.getElementById('labelA').value.trim() || 'A';
  labelB = document.getElementById('labelB').value.trim() || 'B';
  
  // Update all label displays
  document.getElementById('labelADisplay1').textContent = labelA;
  document.getElementById('labelBDisplay1').textContent = labelB;
  
  updateDisplay();
}

function handleRatioChange() {
  let inputA = parseInt(document.getElementById('baseA').value);
  let inputB = parseInt(document.getElementById('baseB').value);
  
  // Validate inputs
  if (isNaN(inputA) || inputA < 1 || inputA > 12) {
    document.getElementById('baseA').value = baseA;
    return;
  }
  if (isNaN(inputB) || inputB < 1 || inputB > 12) {
    document.getElementById('baseB').value = baseB;
    return;
  }
  
  baseA = inputA;
  baseB = inputB;
  
  updateDisplay();
}

function handleScaleChange() {
  scaleFactor = parseInt(document.getElementById('scaleSlider').value);
  
  if (mode === 'multiply') {
    document.getElementById('scaleLabel').textContent = `Scale Factor: x${scaleFactor}`;
  } else {
    document.getElementById('scaleLabel').textContent = `Scale Factor: +${scaleFactor}`;
  }
  
  updateDisplay();
}

function changeMode(newMode) {
  mode = newMode;
  
  // Update button states
  document.getElementById('btnMultiply').classList.toggle('active', mode === 'multiply');
  document.getElementById('btnAdd').classList.toggle('active', mode === 'add');
  
  // Reset scale factor to 1
  scaleFactor = 1;
  document.getElementById('scaleSlider').value = 1;
  
  // Update label
  if (mode === 'multiply') {
    document.getElementById('scaleLabel').textContent = `Scale Factor: x${scaleFactor}`;
  } else {
    document.getElementById('scaleLabel').textContent = `Scale Factor: +${scaleFactor}`;
  }
  
  updateDisplay();
}

function updateDisplay() {
  updateBars();
  updateCircles();
  updateConfirmation();
}

function updateBars() {
  // Original bar
  const totalOriginal = baseA + baseB;
  const percentA = (baseA / totalOriginal) * 100;
  const percentB = (baseB / totalOriginal) * 100;
  
  document.getElementById('originalSegmentA').style.width = percentA + '%';
  document.getElementById('originalSegmentB').style.width = percentB + '%';
  document.getElementById('originalLabel').textContent = `${baseA} : ${baseB}`;
  
  // Scaling bar
  let scaledA, scaledB;
  
  if (mode === 'multiply') {
    scaledA = baseA * scaleFactor;
    scaledB = baseB * scaleFactor;
  } else {
    scaledA = baseA + scaleFactor;
    scaledB = baseB + scaleFactor;
  }
  
  const totalScaled = scaledA + scaledB;
  const scaledPercentA = (scaledA / totalScaled) * 100;
  const scaledPercentB = (scaledB / totalScaled) * 100;
  
  document.getElementById('scalingSegmentA').style.width = scaledPercentA + '%';
  document.getElementById('scalingSegmentB').style.width = scaledPercentB + '%';
  document.getElementById('scalingLabel').textContent = `${scaledA} : ${scaledB}`;
  
  // Update border color based on equivalence
  const scalingBar = document.getElementById('scalingBar');
  const isEquivalent = checkEquivalence(baseA, baseB, scaledA, scaledB);
  
  if (isEquivalent) {
    scalingBar.classList.add('equivalent');
    scalingBar.classList.remove('not-equivalent');
  } else {
    scalingBar.classList.add('not-equivalent');
    scalingBar.classList.remove('equivalent');
  }
}

function updateCircles() {
  let scaledA, scaledB;
  
  if (mode === 'multiply') {
    scaledA = baseA * scaleFactor;
    scaledB = baseB * scaleFactor;
  } else {
    scaledA = baseA + scaleFactor;
    scaledB = baseB + scaleFactor;
  }
  
  // Update counts
  document.getElementById('countA').textContent = scaledA;
  document.getElementById('countB').textContent = scaledB;
  
  // Generate circles
  const circlesAContainer = document.getElementById('circlesA');
  const circlesBContainer = document.getElementById('circlesB');
  
  circlesAContainer.innerHTML = '';
  circlesBContainer.innerHTML = '';
  
  for (let i = 0; i < scaledA; i++) {
    const circle = document.createElement('div');
    circle.className = 'circle circle-a';
    circlesAContainer.appendChild(circle);
  }
  
  for (let i = 0; i < scaledB; i++) {
    const circle = document.createElement('div');
    circle.className = 'circle circle-b';
    circlesBContainer.appendChild(circle);
  }
}

function updateConfirmation() {
  let scaledA, scaledB;
  
  if (mode === 'multiply') {
    scaledA = baseA * scaleFactor;
    scaledB = baseB * scaleFactor;
  } else {
    scaledA = baseA + scaleFactor;
    scaledB = baseB + scaleFactor;
  }
  
  const isEquivalent = checkEquivalence(baseA, baseB, scaledA, scaledB);
  const confirmationBox = document.getElementById('confirmationBox');
  const confirmationMessage = document.getElementById('confirmationMessage');
  
  if (isEquivalent) {
    confirmationBox.className = 'confirmation-box success';
    confirmationMessage.innerHTML = `
      <strong>✓ Ratio is Equivalent!</strong><br>
      ${baseA} : ${baseB} = ${scaledA} : ${scaledB}
    `;
  } else {
    confirmationBox.className = 'confirmation-box error';
    confirmationMessage.innerHTML = `
      <strong>✗ Ratio has Changed!</strong><br>
      ${baseA} : ${baseB} ≠ ${scaledA} : ${scaledB}
    `;
  }
}

function checkEquivalence(a1, b1, a2, b2) {
  // Check if a1/b1 === a2/b2 (with floating point tolerance)
  const ratio1 = a1 / b1;
  const ratio2 = a2 / b2;
  return Math.abs(ratio1 - ratio2) < 0.0001;
}

function resetTool() {
  // Reset all values to defaults
  baseA = 1;
  baseB = 2;
  scaleFactor = 1;
  labelA = 'A';
  labelB = 'B';
  mode = 'multiply';
  
  // Reset inputs
  document.getElementById('labelA').value = 'A';
  document.getElementById('labelB').value = 'B';
  document.getElementById('baseA').value = 1;
  document.getElementById('baseB').value = 2;
  document.getElementById('scaleSlider').value = 1;
  
  // Reset mode buttons
  document.getElementById('btnMultiply').classList.add('active');
  document.getElementById('btnAdd').classList.remove('active');
  
  // Reset label displays
  document.getElementById('labelADisplay1').textContent = 'A';
  document.getElementById('labelBDisplay1').textContent = 'B';
  document.getElementById('scaleLabel').textContent = 'Scale Factor: x1';
  
  updateDisplay();
}