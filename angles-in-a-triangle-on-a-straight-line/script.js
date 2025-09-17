// Angles in a Triangle on a Straight Line Explorer
// Interactive SVG triangle with draggable vertices and live angle calculation

const wrapper = document.getElementById('svg-wrapper');
const eqDiv = document.getElementById('angle-equations');

// Default triangle vertices
let points = [
  {x: 120, y: 80},   // A
  {x: 360, y: 80},   // B
  {x: 240, y: 320}   // C
];
const defaultPoints = JSON.parse(JSON.stringify(points));

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
  let angle = Math.acos(dot/(mag1*mag2));
  return Math.round(angle*180/Math.PI);
}

function renderTriangle() {
  wrapper.innerHTML = '';
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', 480);
  svg.setAttribute('height', 400);
  svg.setAttribute('style', 'background: none;');

  // Draw triangle
  const poly = document.createElementNS(svgNS, 'polygon');
  poly.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
  poly.setAttribute('fill', '#1976d2');
  poly.setAttribute('stroke', '#fff');
  poly.setAttribute('stroke-width', 3);
  svg.appendChild(poly);

  // Draw draggable vertices
  points.forEach((p, i) => {
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', p.x);
    circle.setAttribute('cy', p.y);
    circle.setAttribute('r', 12);
    circle.setAttribute('fill', '#fff');
    circle.setAttribute('stroke', '#1976d2');
    circle.setAttribute('stroke-width', 3);
    circle.setAttribute('cursor', 'grab');
    circle.addEventListener('pointerdown', e => startDrag(e, i));
    svg.appendChild(circle);
  });

  // Draw angle markers (arcs)
  const angleRadius = 32;
  points.forEach((p, i) => {
    const prev = points[(i+2)%3];
    const next = points[(i+1)%3];
    const v1 = {x: prev.x-p.x, y: prev.y-p.y};
    const v2 = {x: next.x-p.x, y: next.y-p.y};
    const angle1 = Math.atan2(v1.y, v1.x);
    const angle2 = Math.atan2(v2.y, v2.x);
    let angleDiff = angle2-angle1;
    if (angleDiff <= 0) angleDiff += 2*Math.PI;
    const arc = document.createElementNS(svgNS, 'path');
    const x1 = p.x + angleRadius*Math.cos(angle1);
    const y1 = p.y + angleRadius*Math.sin(angle1);
    const x2 = p.x + angleRadius*Math.cos(angle2);
    const y2 = p.y + angleRadius*Math.sin(angle2);
    const largeArcFlag = angleDiff > Math.PI ? 1 : 0;
    const pathData = `M ${x1} ${y1} A ${angleRadius} ${angleRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
    arc.setAttribute('d', pathData);
    arc.setAttribute('stroke', '#fff');
    arc.setAttribute('stroke-width', 2);
    arc.setAttribute('fill', 'none');
    svg.appendChild(arc);
  });

  // Draw vertex labels
  const labels = ['A', 'B', 'C'];
  points.forEach((p, i) => {
    const label = document.createElementNS(svgNS, 'text');
    label.setAttribute('x', p.x + (i===1?18:-22));
    label.setAttribute('y', p.y + (i===2?28:-16));
    label.setAttribute('fill', '#fff');
    label.setAttribute('font-size', '1.3rem');
    label.setAttribute('font-family', 'inherit');
    label.setAttribute('font-weight', 'bold');
    label.textContent = labels[i];
    svg.appendChild(label);
  });

  wrapper.appendChild(svg);

  // Display equations
  const angles = [
    angleAt(points[0], points[1], points[2]), // A
    angleAt(points[1], points[2], points[0]), // B
    angleAt(points[2], points[0], points[1])  // C
  ];
  eqDiv.innerHTML = `
    <div class="eq-row">∠A + ∠B + ∠C = <span>${angles[0]}° + ${angles[1]}° + ${angles[2]}° = 180°</span></div>
    <div class="eq-row">∠A = <span>${angles[0]}°</span></div>
    <div class="eq-row">∠B = <span>${angles[1]}°</span></div>
    <div class="eq-row">∠C = <span>${angles[2]}°</span></div>
  `;
}

// --- Dragging Logic ---
let dragIdx = null;
function startDrag(e, idx) {
  dragIdx = idx;
  document.addEventListener('pointermove', onDrag);
  document.addEventListener('pointerup', endDrag);
}
function onDrag(e) {
  if (dragIdx === null) return;
  const rect = wrapper.getBoundingClientRect();
  points[dragIdx].x = e.clientX - rect.left;
  points[dragIdx].y = e.clientY - rect.top;
  renderTriangle();
}
function endDrag() {
  dragIdx = null;
  document.removeEventListener('pointermove', onDrag);
  document.removeEventListener('pointerup', endDrag);
}

// --- Initial Render ---
renderTriangle();
