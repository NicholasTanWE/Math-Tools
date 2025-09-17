// Parallelogram Angle Explorer
// Handles SVG rendering, dragging, and angle calculations

// --- Constants ---
const svgNS = "http://www.w3.org/2000/svg";
const wrapper = document.getElementById('svg-wrapper');
const eqDiv = document.getElementById('angle-equations');

// Initial parallelogram points (centered, medium size)
const defaultPoints = [
  {x: 150, y: 120},   // A (top-left)
  {x: 400, y: 120},   // B (top-right)
  {x: 480, y: 300},   // C (bottom-right)
  {x: 230, y: 300}    // D (bottom-left)
];
let points = JSON.parse(JSON.stringify(defaultPoints));

// --- Utility Functions ---
function distance(p1, p2) {
  return Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2);
}
function angleAt(p, p1, p2) {
  // Returns angle at p (degrees) between vectors p->p1 and p->p2
  const v1 = {x: p1.x-p.x, y: p1.y-p.y};
  const v2 = {x: p2.x-p.x, y: p2.y-p.y};
  const dot = v1.x*v2.x + v1.y*v2.y;
  const mag1 = Math.sqrt(v1.x**2 + v1.y**2);
  const mag2 = Math.sqrt(v2.x**2 + v2.y**2);
  let ang = Math.acos(dot/(mag1*mag2)) * 180/Math.PI;
  return Math.round(ang);
}
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// --- Main Render Function ---
function renderParallelogram() {
  wrapper.innerHTML = '';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', 700);
  svg.setAttribute('height', 500);
  svg.setAttribute('style', 'background: #f9f9f9; border-radius: 12px; box-shadow: 0 2px 8px #0001;');

  // Draw parallelogram
  const poly = document.createElementNS(svgNS, 'polygon');
  poly.setAttribute('points', points.map(p=>`${p.x},${p.y}`).join(' '));
  poly.setAttribute('fill', '#e3f2fd');
  poly.setAttribute('stroke', '#1976d2');
  poly.setAttribute('stroke-width', 3);
  svg.appendChild(poly);

  // Draw draggable sides (invisible lines for dragging)
  for (let i = 0; i < 4; i++) {
    const p1 = points[i];
    const p2 = points[(i+1)%4];
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', p1.x);
    line.setAttribute('y1', p1.y);
    line.setAttribute('x2', p2.x);
    line.setAttribute('y2', p2.y);
    line.setAttribute('stroke', 'rgba(0,0,0,0)'); // Invisible
    line.setAttribute('stroke-width', 20);
    line.setAttribute('cursor', 'grab');
    line.addEventListener('pointerdown', e => startSideDrag(e, i));
    svg.appendChild(line);
  }

  // Draw angle markers (arcs) for internal angles
  const angleRadius = 25;
  points.forEach((p, i) => {
    const prev = points[(i+3)%4]; // Previous vertex
    const next = points[(i+1)%4]; // Next vertex
    
    // Calculate vectors from current vertex to adjacent vertices
    const v1 = {x: prev.x - p.x, y: prev.y - p.y};
    const v2 = {x: next.x - p.x, y: next.y - p.y};
    
    // Calculate angles
    const angle1 = Math.atan2(v1.y, v1.x);
    const angle2 = Math.atan2(v2.y, v2.x);
    
    // Calculate the internal angle (always less than π)
    let angleDiff = angle2 - angle1;
    
    // Normalize to get the interior angle
    if (angleDiff > Math.PI) {
      angleDiff -= 2 * Math.PI;
    } else if (angleDiff < -Math.PI) {
      angleDiff += 2 * Math.PI;
    }
    
    // Determine start and end angles for the arc
    let startAngle, endAngle;
    if (angleDiff > 0) {
      startAngle = angle1;
      endAngle = angle2;
    } else {
      startAngle = angle2;
      endAngle = angle1;
      angleDiff = -angleDiff;
    }
    
    // Create the arc path
    const arc = document.createElementNS(svgNS, 'path');
    const largeArcFlag = angleDiff > Math.PI ? 1 : 0;
    
    const x1 = p.x + angleRadius * Math.cos(startAngle);
    const y1 = p.y + angleRadius * Math.sin(startAngle);
    const x2 = p.x + angleRadius * Math.cos(endAngle);
    const y2 = p.y + angleRadius * Math.sin(endAngle);
    
    const pathData = `M ${x1} ${y1} A ${angleRadius} ${angleRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
    arc.setAttribute('d', pathData);
    arc.setAttribute('stroke', '#666');
    arc.setAttribute('stroke-width', 2);
    arc.setAttribute('fill', 'none');
    svg.appendChild(arc);
  });

  // Calculate angles
  const angles = [
    angleAt(points[0], points[1], points[3]), // A
    angleAt(points[1], points[2], points[0]), // B
    angleAt(points[2], points[3], points[1]), // C
    angleAt(points[3], points[0], points[2])  // D
  ];

  // Color coding: A & C blue, B & D red
  const angleColors = ['#1976d2', '#d32f2f', '#1976d2', '#d32f2f'];
  const angleLabels = ['A', 'B', 'C', 'D'];
  // Place angle labels outside parallelogram, beside the corners
  points.forEach((p, i) => {
    const label = document.createElementNS(svgNS, 'text');
    // Position labels outside corners
    let offsetX = 0, offsetY = 0;
    if (i === 0) { offsetX = -25; offsetY = -10; } // A: top-left
    if (i === 1) { offsetX = 15; offsetY = -10; }  // B: top-right
    if (i === 2) { offsetX = 15; offsetY = 25; }   // C: bottom-right
    if (i === 3) { offsetX = -25; offsetY = 25; }  // D: bottom-left
    
    label.setAttribute('x', p.x + offsetX);
    label.setAttribute('y', p.y + offsetY);
    label.setAttribute('fill', angleColors[i]);
    label.setAttribute('font-size', '1.4rem');
    label.setAttribute('font-family', 'inherit');
    label.setAttribute('font-weight', 'bold');
    label.textContent = `${angleLabels[i]}`;
    svg.appendChild(label);
    
    // Add angle measurement near the angle arc
    const angleLabel = document.createElementNS(svgNS, 'text');
    const next = points[(i+1)%4];
    const prev = points[(i+3)%4];
    const dx = (next.x + prev.x)/2 - p.x;
    const dy = (next.y + prev.y)/2 - p.y;
    angleLabel.setAttribute('x', p.x + dx*0.4);
    angleLabel.setAttribute('y', p.y + dy*0.4);
    angleLabel.setAttribute('fill', '#333');
    angleLabel.setAttribute('font-size', '0.9rem');
    angleLabel.setAttribute('font-family', 'inherit');
    angleLabel.textContent = `${angles[i]}°`;
    svg.appendChild(angleLabel);
  });

  wrapper.appendChild(svg);

  // Display equations with proper angle names
  eqDiv.innerHTML = `
    <div class="eq-row">∠BAD + ∠ABC = <span>${angles[0]}° + ${angles[1]}° = ${angles[0]+angles[1]}°</span></div>
    <div class="eq-row">∠ABC + ∠BCD = <span>${angles[1]}° + ${angles[2]}° = ${angles[1]+angles[2]}°</span></div>
    <div class="eq-row">∠BCD + ∠CDA = <span>${angles[2]}° + ${angles[3]}° = ${angles[2]+angles[3]}°</span></div>
    <div class="eq-row">∠CDA + ∠BAD = <span>${angles[3]}° + ${angles[0]}° = ${angles[3]+angles[0]}°</span></div>
  `;
}

// --- Dragging Logic ---
let dragSideIdx = null;
let dragStart = null;
let dragVec = null;

function startSideDrag(e, sideIdx) {
  dragSideIdx = sideIdx;
  dragStart = {x: e.clientX, y: e.clientY, points: JSON.parse(JSON.stringify(points))};
  // Calculate direction vector of the side
  const p1 = dragStart.points[sideIdx];
  const p2 = dragStart.points[(sideIdx+1)%4];
  dragVec = {x: p2.x - p1.x, y: p2.y - p1.y};
  document.addEventListener('pointermove', onSideDrag);
  document.addEventListener('pointerup', endSideDrag);
}

function onSideDrag(e) {
  if (dragSideIdx === null) return;
  // Calculate drag delta - allow movement in all directions
  let dx = e.clientX - dragStart.x;
  let dy = e.clientY - dragStart.y;
  
  // Start with original points
  let tempPoints = dragStart.points.map(p => ({...p}));
  
  // Move both endpoints of dragged side by the full drag delta
  let i1 = dragSideIdx;
  let i2 = (dragSideIdx+1)%4;
  tempPoints[i1].x = clamp(dragStart.points[i1].x + dx, 40, 660);
  tempPoints[i1].y = clamp(dragStart.points[i1].y + dy, 40, 460);
  tempPoints[i2].x = clamp(dragStart.points[i2].x + dx, 40, 660);
  tempPoints[i2].y = clamp(dragStart.points[i2].y + dy, 40, 460);
  
  // Opposite side (opp1 to opp2) remains FIXED at original positions
  let opp1 = (dragSideIdx+2)%4;
  let opp2 = (dragSideIdx+3)%4;
  // Don't move opposite side - it stays anchored
  tempPoints[opp1] = dragStart.points[opp1];
  tempPoints[opp2] = dragStart.points[opp2];
  
  // The adjacent sides automatically adjust since they share endpoints
  // Side i1->opp2 and side i2->opp1 will stretch/skew to maintain connections
  
  // Prevent degenerate parallelogram (angles 30°-150°)
  const tempAngles = [
    angleAt(tempPoints[0], tempPoints[1], tempPoints[3]),
    angleAt(tempPoints[1], tempPoints[2], tempPoints[0]),
    angleAt(tempPoints[2], tempPoints[3], tempPoints[1]),
    angleAt(tempPoints[3], tempPoints[0], tempPoints[2])
  ];
  if (tempAngles.every(a => a >= 30 && a <= 150)) {
    points = tempPoints;
    renderParallelogram();
  }
}

function endSideDrag() {
  dragSideIdx = null;
  dragStart = null;
  dragVec = null;
  document.removeEventListener('pointermove', onSideDrag);
  document.removeEventListener('pointerup', endSideDrag);
}

// --- Length Adjustment Functions ---
function adjustSideLength(sideType, delta) {
  if (sideType === 'AB') {
    // Adjust sides AB and CD (opposite sides)
    const currentLength = distance(points[0], points[1]);
    const newLength = Math.max(50, currentLength + delta);
    const ratio = newLength / currentLength;
    
    // Get the direction vector for AB
    const ABvector = {x: points[1].x - points[0].x, y: points[1].y - points[0].y};
    const newABvector = {x: ABvector.x * ratio, y: ABvector.y * ratio};
    
    // Adjust AB: keep A fixed, move B
    points[1].x = points[0].x + newABvector.x;
    points[1].y = points[0].y + newABvector.y;
    
    // Adjust CD: use the same vector (CD should be parallel and equal to AB)
    points[2].x = points[3].x + newABvector.x;
    points[2].y = points[3].y + newABvector.y;
    
  } else if (sideType === 'AD') {
    // Adjust sides AD and BC (opposite sides)
    const currentLength = distance(points[0], points[3]);
    const newLength = Math.max(50, currentLength + delta);
    const ratio = newLength / currentLength;
    
    // Get the direction vector for AD
    const ADvector = {x: points[3].x - points[0].x, y: points[3].y - points[0].y};
    const newADvector = {x: ADvector.x * ratio, y: ADvector.y * ratio};
    
    // Adjust AD: keep A fixed, move D
    points[3].x = points[0].x + newADvector.x;
    points[3].y = points[0].y + newADvector.y;
    
    // Adjust BC: use the same vector (BC should be parallel and equal to AD)
    points[2].x = points[1].x + newADvector.x;
    points[2].y = points[1].y + newADvector.y;
  }
  renderParallelogram();
}

function resetParallelogram() {
  points = JSON.parse(JSON.stringify(defaultPoints));
  renderParallelogram();
}

// --- Event Listeners for Controls ---
document.getElementById('ab-plus').addEventListener('click', () => adjustSideLength('AB', 20));
document.getElementById('ab-minus').addEventListener('click', () => adjustSideLength('AB', -20));
document.getElementById('ad-plus').addEventListener('click', () => adjustSideLength('AD', 20));
document.getElementById('ad-minus').addEventListener('click', () => adjustSideLength('AD', -20));
document.getElementById('reset-btn').addEventListener('click', resetParallelogram);

// --- Initial Render ---
renderParallelogram();
