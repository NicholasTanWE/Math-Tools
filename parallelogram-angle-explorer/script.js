// Parallelogram Angle Explorer
// Handles SVG rendering, dragging, and angle calculations

// --- Constants ---
const svgNS = "http://www.w3.org/2000/svg";
const wrapper = document.getElementById('svg-wrapper');
const eqDiv = document.getElementById('angle-equations');

// Helper to compute current inner bounds based on wrapper size
function getBounds(padding = 40){
  const rect = wrapper.getBoundingClientRect();
  // Use wrapper's inner coordinate system; points are in SVG coordinates matching width/height
  const width = Math.max(200, wrapper.clientWidth || 700);
  const height = Math.max(200, wrapper.clientHeight || 500);
  return { minX: padding, maxX: Math.max(padding+10, width - padding), minY: padding, maxY: Math.max(padding+10, height - padding), width, height };
}

// Initial parallelogram points (centered, medium size)
const defaultPoints = [
  {x: 150, y: 120},   // A (top-left)
  {x: 400, y: 120},   // B (top-right)
  {x: 480, y: 300},   // C (bottom-right)
  {x: 230, y: 300}    // D (bottom-left)
];
// Default rhombus with acute angle ≈45° at A and C, obtuse ≈135° at B and D
// Constructed with side length ~160 and AD rotated +45° from AB
const defaultRhombusPoints = [
  {x: 150, y: 120},            // A
  {x: 310, y: 120},            // B = A + (160, 0)
  {x: 423.14, y: 233.14},      // C = B + (113.14, 113.14)
  {x: 263.14, y: 233.14}       // D = A + (113.14, 113.14)
];
// Default trapezium: AB and CD parallel, AB shorter than CD
const defaultTrapeziumPoints = [
  {x: 180, y: 110}, // A (top-left)
  {x: 360, y: 110}, // B (top-right) -> AB length 180
  {x: 440, y: 300}, // C (bottom-right) -> CD length 260
  {x: 120, y: 300}  // D (bottom-left)
];
let points = JSON.parse(JSON.stringify(defaultPoints));
let currentShape = 'parallelogram'; // or 'rhombus'

// --- Utility Functions ---
function distance(p1, p2) {
  return Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2);
}
function projectToCircle(point, center, radius){
  const vx = point.x - center.x;
  const vy = point.y - center.y;
  const mag = Math.sqrt(vx*vx + vy*vy);
  if (mag === 0) return { x: center.x + radius, y: center.y };
  const scale = radius / mag;
  return { x: center.x + vx * scale, y: center.y + vy * scale };
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
  const bounds = getBounds(40);
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', bounds.width);
  svg.setAttribute('height', bounds.height);
  svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
  svg.setAttribute('style', 'background: #f9f9f9; border-radius: 12px; box-shadow: 0 2px 8px #0001;');

  // Ensure all points fit within bounds by shifting if necessary. Do NOT shift while a side
  // drag is active (dragSideIdx is non-null) so the opposite side stays visually anchored
  const xs = points.map(p=>p.x); const ys = points.map(p=>p.y);
  const curMinX = Math.min(...xs); const curMaxX = Math.max(...xs);
  const curMinY = Math.min(...ys); const curMaxY = Math.max(...ys);
  let shiftX = 0; let shiftY = 0;
  if (dragSideIdx === null) {
    if (curMinX < bounds.minX) shiftX = bounds.minX - curMinX;
    if (curMaxX > bounds.maxX) shiftX = bounds.maxX - curMaxX;
    if (curMinY < bounds.minY) shiftY = bounds.minY - curMinY;
    if (curMaxY > bounds.maxY) shiftY = bounds.maxY - curMaxY;
    if (shiftX !== 0 || shiftY !== 0) { points = points.map(p=>({x: p.x + shiftX, y: p.y + shiftY})); }
  }

  // Draw parallelogram
  const poly = document.createElementNS(svgNS, 'polygon');
  poly.setAttribute('points', points.map(p=>`${p.x},${p.y}`).join(' '));
  poly.setAttribute('fill', '#e3f2fd');
  poly.setAttribute('stroke', '#1976d2');
  poly.setAttribute('stroke-width', 3);
  svg.appendChild(poly);

  // Draw draggable sides (invisible lines for dragging) and visible sides with color
  for (let i = 0; i < 4; i++) {
    const p1 = points[i];
    const p2 = points[(i+1)%4];
  // Visible side
  const sideLine = document.createElementNS(svgNS, 'line');
  sideLine.setAttribute('id', `side-${i}`);
    sideLine.setAttribute('x1', p1.x);
    sideLine.setAttribute('y1', p1.y);
    sideLine.setAttribute('x2', p2.x);
    sideLine.setAttribute('y2', p2.y);
    // AD (3-0) and BC (1-2) in red, others default
    if ((i === 3) || (i === 1)) {
      sideLine.setAttribute('stroke', '#d32f2f'); // Red
    } else {
      sideLine.setAttribute('stroke', '#1976d2'); // Default blue
    }
  sideLine.setAttribute('stroke-width', 3);
    svg.appendChild(sideLine);

  // Invisible line for dragging
    const dragLine = document.createElementNS(svgNS, 'line');
    dragLine.setAttribute('x1', p1.x);
    dragLine.setAttribute('y1', p1.y);
    dragLine.setAttribute('x2', p2.x);
    dragLine.setAttribute('y2', p2.y);
    dragLine.setAttribute('stroke', 'rgba(0,0,0,0)'); // Invisible
    dragLine.setAttribute('stroke-width', 20);
    dragLine.setAttribute('cursor', 'grab');
    // For trapezium mode, only AB (i===0) and CD (i===2) are draggable
    if (currentShape === 'trapezium'){
      if (i === 0 || i === 2) dragLine.addEventListener('pointerdown', e => startSideDrag(e, i));
    } else {
      dragLine.addEventListener('pointerdown', e => startSideDrag(e, i));
    }
    svg.appendChild(dragLine);
  }

  // Draw parallel / direction arrows based on the selected shape.
  // - Trapezium: arrows on AB (A->B) and CD (D->C => flipped)
  // - Rhombus: arrows on AB (A->B), CD (D->C flipped), AD (A->D flipped), BC (B->C)
  // - Parallelogram: arrows on AB (A->B), CD (D->C flipped), AD (A->D flipped), BC (B->C)
  if (currentShape === 'trapezium' || currentShape === 'rhombus' || currentShape === 'parallelogram'){
    const arrowBase = Math.min(bounds.width, bounds.height);
    const arrowLen = Math.max(12, 0.03 * arrowBase);
    let sideIndices = [];
    const dirMul = {};
    if (currentShape === 'trapezium'){
      sideIndices = [0,2];
      dirMul[0] = 1; dirMul[2] = -1; // flip CD
    } else if (currentShape === 'rhombus'){
      // AB (A->B) is side index 0, CD (D->C) is side index 2 (flipped)
      // AD (A->D) corresponds to side index 3 but we want A->D so flip side3
      // BC is side index 1 and keeps natural direction B->C
      sideIndices = [0,2,3,1];
      dirMul[0] = 1; dirMul[2] = -1; dirMul[3] = -1; dirMul[1] = 1;
    } else {
      // parallelogram: AB (0) A->B, CD (2) D->C (flip), AD (3) A->D (flip), BC (1) B->C
      sideIndices = [0,2,3,1];
      dirMul[0] = 1; dirMul[2] = -1; dirMul[3] = -1; dirMul[1] = 1;
    }

    sideIndices.forEach(i=>{
      const p1 = points[i];
      const p2 = points[(i+1)%4];
      const mid = { x: (p1.x + p2.x)/2, y: (p1.y + p2.y)/2 };
      const vx = p2.x - p1.x; const vy = p2.y - p1.y;
      const mag = Math.sqrt(vx*vx + vy*vy) || 1;
      const ux = vx / mag; const uy = vy / mag;
      // perpendicular for base width
      const perp = { x: -uy, y: ux };
      const dm = dirMul[i] || 1;
      const tip = { x: mid.x + ux * (arrowLen/2) * dm, y: mid.y + uy * (arrowLen/2) * dm };
      const baseCenter = { x: mid.x - ux * (arrowLen/2) * dm, y: mid.y - uy * (arrowLen/2) * dm };
      const left = { x: baseCenter.x + perp.x * (arrowLen/4), y: baseCenter.y + perp.y * (arrowLen/4) };
      const right = { x: baseCenter.x - perp.x * (arrowLen/4), y: baseCenter.y - perp.y * (arrowLen/4) };
      const arrow = document.createElementNS(svgNS, 'polygon');
      arrow.setAttribute('points', `${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`);
      arrow.setAttribute('class', 'parallel-arrow');
      arrow.setAttribute('pointer-events','none');
      arrow.setAttribute('id', `arrow-side-${i}`);
      svg.appendChild(arrow);
    });
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
  label.setAttribute('font-weight', 'normal');
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
  angleLabel.setAttribute('font-weight', 'normal');
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
  // If trapezium mode, mark the anchored side visually
  if (currentShape === 'trapezium'){
    let anchoredIdx = (sideIdx === 0) ? 2 : (sideIdx === 2 ? 0 : null);
    if (anchoredIdx !== null){
      const anchoredEl = document.getElementById(`side-${anchoredIdx}`);
      if (anchoredEl) anchoredEl.classList.add('anchored');
    }
  }
}

function onSideDrag(e) {
  if (dragSideIdx === null) return;
  // Calculate drag delta - allow movement in all directions
  let dx = e.clientX - dragStart.x;
  let dy = e.clientY - dragStart.y;

  // Start with original points
  let tempPoints = dragStart.points.map(p => ({...p}));

  // Move both endpoints of dragged side by the delta, but ensure both endpoints
  // remain within the allowed SVG bounds together to avoid asymmetric clamping.
  let i1 = dragSideIdx;
  let i2 = (dragSideIdx+1)%4;
  const b = getBounds(40);

  // Compute allowed dx range so both endpoints stay within [minX, maxX]
  const allowedDxMin = Math.max(b.minX - dragStart.points[i1].x, b.minX - dragStart.points[i2].x);
  const allowedDxMax = Math.min(b.maxX - dragStart.points[i1].x, b.maxX - dragStart.points[i2].x);
  const allowedDyMin = Math.max(b.minY - dragStart.points[i1].y, b.minY - dragStart.points[i2].y);
  const allowedDyMax = Math.min(b.maxY - dragStart.points[i1].y, b.maxY - dragStart.points[i2].y);

  const ndx = clamp(dx, allowedDxMin, allowedDxMax);
  const ndy = clamp(dy, allowedDyMin, allowedDyMax);

  // Instead of freely moving both endpoints, project their tentative positions
  // onto circles so their adjacent side lengths remain the same and the
  // opposite side remains anchored.
  const tentativeA = { x: dragStart.points[i1].x + ndx, y: dragStart.points[i1].y + ndy };
  const tentativeB = { x: dragStart.points[i2].x + ndx, y: dragStart.points[i2].y + ndy };

  // anchors: A is connected to prev = (i1+3)%4, B is connected to next = (i2+1)%4
  const anchorAIdx = (i1+3)%4;
  const anchorBIdx = (i2+1)%4;
  const anchorA = dragStart.points[anchorAIdx];
  const anchorB = dragStart.points[anchorBIdx];
  const lenA = distance(dragStart.points[i1], anchorA);
  const lenB = distance(dragStart.points[i2], anchorB);

  const newA = projectToCircle(tentativeA, anchorA, lenA);
  const newB = projectToCircle(tentativeB, anchorB, lenB);

  tempPoints[i1] = newA;
  tempPoints[i2] = newB;

  // Opposite side remains anchored at its original positions
  let opp1 = (dragSideIdx+2)%4;
  let opp2 = (dragSideIdx+3)%4;
  tempPoints[opp1] = dragStart.points[opp1];
  tempPoints[opp2] = dragStart.points[opp2];
  
  // The adjacent sides automatically adjust since they share endpoints
  // Side i1->opp2 and side i2->opp1 will stretch/skew to maintain connections
  
  // Prevent degenerate parallelogram (angles 30°-150°)
  // If rhombus mode, convert tempPoints to nearest rhombus anchored at the dragged side's first vertex
  if (currentShape === 'rhombus'){
    // Keep opposite side anchored. We'll derive the new rhombus from the dragged side and the fixed opposite side.
    const Aidx = i1;
    const Bidx = i2;
    const Cidx = opp1; // opposite of i1 is i1+2
    const Didx = opp2;
    // Use current dragged positions for A/B (tempPoints[i1], tempPoints[i2])
    const Apos = tempPoints[Aidx];
    const Bpos = tempPoints[Bidx];
    // Opposite side stays at original dragStart positions
    const Cpos = dragStart.points[Cidx];
    const Dpos = dragStart.points[Didx];
    // Desired side length is distance between A and B
    const sideLen = Math.max(30, Math.sqrt((Bpos.x - Apos.x)**2 + (Bpos.y - Apos.y)**2));
    // Compute direction from D to C to keep that orientation for opposite side
    const oppDir = { x: (Cpos.x - Dpos.x), y: (Cpos.y - Dpos.y) };
    const oppMag = Math.sqrt(oppDir.x*oppDir.x + oppDir.y*oppDir.y) || 1;
    const oppUnit = { x: oppDir.x/oppMag, y: oppDir.y/oppMag };
    // Build new D and C from A using the oppUnit scaled to sideLen
    const newD = { x: Apos.x + oppUnit.x * sideLen, y: Apos.y + oppUnit.y * sideLen };
    const newC = { x: Bpos.x + oppUnit.x * sideLen, y: Bpos.y + oppUnit.y * sideLen };
    // Assign: A/B from drag, C/D anchored should remain dragStart positions — but to keep a proper rhombus we place C/D using oppUnit derived from anchored opp side direction
    tempPoints[Aidx] = Apos;
    tempPoints[Bidx] = Bpos;
    tempPoints[Cidx] = newC;
    tempPoints[Didx] = newD;
  }

  // Trapezium behavior: only AB (i===0) and CD (i===2) are draggable; keep them parallel
  if (currentShape === 'trapezium'){
    // If dragging AB (i1===0), anchor CD (keep both C and D as in dragStart) and make AB parallel to CD
    if (i1 === 0) {
      let A_tent = tempPoints[0];
      let B_tent = tempPoints[1];
      // anchored CD from dragStart
      const C_anchor = dragStart.points[2];
      const D_anchor = dragStart.points[3];
      // direction of anchored CD (unit)
      const cdDir = { x: C_anchor.x - D_anchor.x, y: C_anchor.y - D_anchor.y };
      const cdMag = Math.sqrt(cdDir.x*cdDir.x + cdDir.y*cdDir.y) || 1;
      const cdUnit = { x: cdDir.x / cdMag, y: cdDir.y / cdMag };
      // perpendicular (unit) to CD pointing towards AB's side
      const normal = { x: -cdUnit.y, y: cdUnit.x };
      // Determine start sign from dragStart so we keep AB on the same side of CD
      const startDist = (dragStart.points[0].x - D_anchor.x) * normal.x + (dragStart.points[0].y - D_anchor.y) * normal.y;
      const startSign = Math.sign(startDist) || 1;
      // Current signed distance of tentative A to anchored CD line
      const currDist = (A_tent.x - D_anchor.x) * normal.x + (A_tent.y - D_anchor.y) * normal.y;
      // Allow the perpendicular distance between AB and CD to vary so AD/BC stretch freely.
      // Only prevent AB from crossing the anchored CD: if the signed distance flipped sign,
      // nudge AB back to a small epsilon on the original side scaled to the canvas size.
      const canvasScale = Math.min(b.width, b.height) / 600; // baseline 600 -> scale 1
      const epsilon = Math.max(1, 2 * canvasScale); // scaled epsilon
      if (Math.sign(currDist) !== startSign) {
        const desired = startSign * epsilon;
        const shift = desired - currDist;
        A_tent = { x: A_tent.x + normal.x * shift, y: A_tent.y + normal.y * shift };
        B_tent = { x: B_tent.x + normal.x * shift, y: B_tent.y + normal.y * shift };
      }
      // Enforce a minimum AB length relative to canvas so it doesn't become degenerate
      const abLenTent = Math.sqrt((B_tent.x - A_tent.x)**2 + (B_tent.y - A_tent.y)**2);
      const minLen = Math.max(20, 0.05 * Math.min(b.width, b.height));
      if (abLenTent < minLen) {
        // extend B along cdUnit to meet minLen
        B_tent = { x: A_tent.x + cdUnit.x * minLen, y: A_tent.y + cdUnit.y * minLen };
      }
      // Project the tentative AB vector onto the line parallel to CD through adjusted A_tent
      const tVec = { x: B_tent.x - A_tent.x, y: B_tent.y - A_tent.y };
      const projLen = tVec.x * cdUnit.x + tVec.y * cdUnit.y; // signed length along cdUnit
      const newB = { x: A_tent.x + cdUnit.x * projLen, y: A_tent.y + cdUnit.y * projLen };
      // Clamp A and newB to bounds so they stay visible
      const clampedA = { x: clamp(A_tent.x, b.minX, b.maxX), y: clamp(A_tent.y, b.minY, b.maxY) };
      const clampedB = { x: clamp(newB.x, b.minX, b.maxX), y: clamp(newB.y, b.minY, b.maxY) };
      tempPoints[0] = clampedA;
      tempPoints[1] = clampedB;
      // Keep CD anchored exactly at original positions
      tempPoints[2] = { x: C_anchor.x, y: C_anchor.y };
      tempPoints[3] = { x: D_anchor.x, y: D_anchor.y };
      // If clamping occurred, show clamp feedback
      if (clampedA.x !== A_tent.x || clampedA.y !== A_tent.y || clampedB.x !== newB.x || clampedB.y !== newB.y) {
        const svgWrap = document.getElementById('svg-wrapper');
        svgWrap.classList.add('clamped'); setTimeout(()=>svgWrap.classList.remove('clamped'),700);
      }
    }
    // If dragging CD (i1===2), anchor AB (keep A and B as in dragStart) and make CD parallel to AB
    if (i1 === 2) {
      let C_tent = tempPoints[2];
      let D_tent = tempPoints[3];
      // anchored AB from dragStart
      const A_anchor = dragStart.points[0];
      const B_anchor = dragStart.points[1];
      // direction of anchored AB (unit)
      const abDir = { x: B_anchor.x - A_anchor.x, y: B_anchor.y - A_anchor.y };
      const abMag = Math.sqrt(abDir.x*abDir.x + abDir.y*abDir.y) || 1;
      const abUnit = { x: abDir.x / abMag, y: abDir.y / abMag };
      // Project the tentative CD vector onto the line parallel to AB through C_tent
      const tVec = { x: D_tent.x - C_tent.x, y: D_tent.y - C_tent.y };
      const projLen = tVec.x * abUnit.x + tVec.y * abUnit.y;
      const newD = { x: C_tent.x + abUnit.x * projLen, y: C_tent.y + abUnit.y * projLen };
  const canvasScale = Math.min(b.width, b.height) / 600;
  const epsilon = Math.max(1, 2 * canvasScale);
      // Ensure CD doesn't cross AB: compute perpendicular from AB and prevent sign flip
      const abDirCheck = abUnit; // unit
      const abNormal = { x: -abDirCheck.y, y: abDirCheck.x };
      const startDistCD = (dragStart.points[2].x - B_anchor.x) * abNormal.x + (dragStart.points[2].y - B_anchor.y) * abNormal.y;
      const startSignCD = Math.sign(startDistCD) || 1;
      const currDistC = (C_tent.x - B_anchor.x) * abNormal.x + (C_tent.y - B_anchor.y) * abNormal.y;
      if (Math.sign(currDistC) !== startSignCD) {
        const desiredC = startSignCD * epsilon;
        const shiftC = desiredC - currDistC;
        // shift C_tent and newD along abNormal
        C_tent = { x: C_tent.x + abNormal.x * shiftC, y: C_tent.y + abNormal.y * shiftC };
        newD.x += abNormal.x * shiftC; newD.y += abNormal.y * shiftC;
      }
      // Enforce a minimum CD length relative to canvas
      const cdLenTent = Math.sqrt((newD.x - C_tent.x)**2 + (newD.y - C_tent.y)**2);
      const minLenCD = Math.max(20, 0.05 * Math.min(b.width, b.height));
      if (cdLenTent < minLenCD) {
        newD.x = C_tent.x + abUnit.x * minLenCD; newD.y = C_tent.y + abUnit.y * minLenCD;
      }
      // Clamp C and newD to bounds
      const clampedC = { x: clamp(C_tent.x, b.minX, b.maxX), y: clamp(C_tent.y, b.minY, b.maxY) };
      const clampedD = { x: clamp(newD.x, b.minX, b.maxX), y: clamp(newD.y, b.minY, b.maxY) };
      tempPoints[2] = clampedC;
      tempPoints[3] = clampedD;
      // Keep AB anchored
      tempPoints[0] = { x: A_anchor.x, y: A_anchor.y };
      tempPoints[1] = { x: B_anchor.x, y: B_anchor.y };
      if (clampedC.x !== C_tent.x || clampedC.y !== C_tent.y || clampedD.x !== newD.x || clampedD.y !== newD.y) {
        const svgWrap = document.getElementById('svg-wrapper');
        svgWrap.classList.add('clamped'); setTimeout(()=>svgWrap.classList.remove('clamped'),700);
      }
    }
  }

  // For non-trapezium shapes, restore opposite side anchors so the opposite side is fixed during drag.
  // In trapezium mode we intentionally let the trapezium logic compute the opposite pair
  // (so AB and CD can remain parallel while AD/BC stretch to connect), therefore skip
  // this overwrite when currentShape === 'trapezium'.
  if (currentShape !== 'trapezium') {
    tempPoints[opp1] = dragStart.points[opp1];
    tempPoints[opp2] = dragStart.points[opp2];
  }

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
  // Remove anchored visual from any side
  ['side-0','side-1','side-2','side-3'].forEach(id=>{
    const el = document.getElementById(id); if (el) el.classList.remove('anchored');
  });
}

// --- Length Adjustment Functions ---
function adjustSideLength(sideType, delta) {
  const svgEl = document.getElementById('svg-wrapper');
  if (sideType === 'AB') {
    // Adjust sides AB and CD (opposite sides)
    const currentLength = distance(points[0], points[1]);
    const newLength = Math.max(50, currentLength + delta);
    const ratio = newLength / currentLength;
    
    // Get the direction vector for AB
    const ABvector = {x: points[1].x - points[0].x, y: points[1].y - points[0].y};
    const newABvector = {x: ABvector.x * ratio, y: ABvector.y * ratio};
    
  const b = getBounds(40);
  if (currentShape === 'trapezium'){
    // Adjust AB only; keep CD anchored and parallel
    const currentLengthAB = distance(points[0], points[1]);
    const minLenAB = Math.max(20, 0.05 * Math.min(b.width, b.height));
    const newLengthAB = Math.max(minLenAB, currentLengthAB + delta);
    const abDir = { x: (points[1].x - points[0].x)/currentLengthAB, y: (points[1].y - points[0].y)/currentLengthAB };
    points[1].x = points[0].x + abDir.x * newLengthAB;
    points[1].y = points[0].y + abDir.y * newLengthAB;
    // Keep CD anchored; ensure CD is parallel to AB by projecting C and D direction
    const cdLen = distance(points[2], points[3]);
    const Dpos = points[3];
    points[2].x = Dpos.x + abDir.x * cdLen;
    points[2].y = Dpos.y + abDir.y * cdLen;
    renderParallelogram();
    return;
  }
  if (currentShape === 'rhombus'){
    // For rhombus: all sides equal. We'll keep A fixed and set B at newABvector,
    // then set AD vector to have same length as AB but keep its direction.
    let intendedB = {x: points[0].x + newABvector.x, y: points[0].y + newABvector.y};
    // clamp B to bounds first
    const clampedB = { x: clamp(intendedB.x, b.minX, b.maxX), y: clamp(intendedB.y, b.minY, b.maxY) };
    let clamped = (clampedB.x !== intendedB.x) || (clampedB.y !== intendedB.y);
    // compute moved length
    const movedLen = Math.max(30, Math.sqrt((clampedB.x - points[0].x)**2 + (clampedB.y - points[0].y)**2));
    // AD original direction
    const ADvec = { x: points[3].x - points[0].x, y: points[3].y - points[0].y };
    const ADmag = Math.sqrt(ADvec.x*ADvec.x + ADvec.y*ADvec.y) || 1;
    const ADdir = { x: ADvec.x/ADmag, y: ADvec.y/ADmag };
    const newAD = { x: ADdir.x * movedLen, y: ADdir.y * movedLen };
    // Reconstruct rhombus anchored at A
    const A = { x: points[0].x, y: points[0].y };
    const B = { x: A.x + (clampedB.x - points[0].x), y: A.y + (clampedB.y - points[0].y) };
    const D = { x: A.x + newAD.x, y: A.y + newAD.y };
    const C = { x: B.x + newAD.x, y: B.y + newAD.y };
    points[0] = A; points[1] = B; points[3] = D; points[2] = C;
    // If any vertex outside bounds, shift whole shape back inside
    const xs = points.map(p=>p.x), ys = points.map(p=>p.y);
    const curMinX = Math.min(...xs), curMaxX = Math.max(...xs);
    const curMinY = Math.min(...ys), curMaxY = Math.max(...ys);
    let shiftX = 0, shiftY = 0;
    if (curMinX < b.minX) shiftX = b.minX - curMinX;
    if (curMaxX > b.maxX) shiftX = b.maxX - curMaxX;
    if (curMinY < b.minY) shiftY = b.minY - curMinY;
    if (curMaxY > b.maxY) shiftY = b.maxY - curMaxY;
    if (shiftX !== 0 || shiftY !== 0) points = points.map(p=>({x: p.x + shiftX, y: p.y + shiftY}));
    if (clamped || shiftX !== 0 || shiftY !== 0){ svgEl.classList.add('clamped'); setTimeout(()=>svgEl.classList.remove('clamped'),700); }
  } else {
    // Adjust AB: keep A fixed, move B, but ensure B stays within bounds together with A
    let intendedB = {x: points[0].x + newABvector.x, y: points[0].y + newABvector.y};
    // compute clamped coordinates using dynamic bounds
    const clampedB = { x: clamp(intendedB.x, b.minX, b.maxX), y: clamp(intendedB.y, b.minY, b.maxY) };
    let clamped = (clampedB.x !== intendedB.x) || (clampedB.y !== intendedB.y);
    // apply clamped coordinates
    points[1].x = clampedB.x;
    points[1].y = clampedB.y;
    // Adjust CD: use the same vector (CD should be parallel and equal to AB)
    points[2].x = points[3].x + (points[1].x - points[0].x);
    points[2].y = points[3].y + (points[1].y - points[0].y);
    // If CD falls outside bounds, shift entire shape left/up as needed so all vertices fit
    const xs = points.map(p=>p.x), ys = points.map(p=>p.y);
    const curMinX = Math.min(...xs), curMaxX = Math.max(...xs);
    const curMinY = Math.min(...ys), curMaxY = Math.max(...ys);
    let shiftX = 0, shiftY = 0;
    if (curMinX < b.minX) shiftX = b.minX - curMinX;
    if (curMaxX > b.maxX) shiftX = b.maxX - curMaxX;
    if (curMinY < b.minY) shiftY = b.minY - curMinY;
    if (curMaxY > b.maxY) shiftY = b.maxY - curMaxY;
    if (shiftX !== 0 || shiftY !== 0) points = points.map(p=>({x: p.x + shiftX, y: p.y + shiftY}));
    if (clamped || shiftX !== 0 || shiftY !== 0){ svgEl.classList.add('clamped'); setTimeout(()=>svgEl.classList.remove('clamped'),700); }
  }
    
  } else if (sideType === 'AD') {
    // Adjust sides AD and BC (opposite sides)
    const currentLength = distance(points[0], points[3]);
    const newLength = Math.max(50, currentLength + delta);
    const ratio = newLength / currentLength;
    
    // Get the direction vector for AD
    const ADvector = {x: points[3].x - points[0].x, y: points[3].y - points[0].y};
    const newADvector = {x: ADvector.x * ratio, y: ADvector.y * ratio};
    
    const b = getBounds(40);
    if (currentShape === 'trapezium'){
      // Here AD button will control CD length for trapezium mode
      const currentLengthCD = distance(points[2], points[3]);
      const minLenCD = Math.max(20, 0.05 * Math.min(b.width, b.height));
      const newLengthCD = Math.max(minLenCD, currentLengthCD + delta);
      const cdDir = { x: (points[2].x - points[3].x)/currentLengthCD, y: (points[2].y - points[3].y)/currentLengthCD };
      // keep D fixed, move C
      points[2].x = points[3].x + cdDir.x * newLengthCD;
      points[2].y = points[3].y + cdDir.y * newLengthCD;
      // Ensure AB remains parallel to CD: reposition B relative to A using cdDir
      const abLen = distance(points[0], points[1]);
      points[1].x = points[0].x + cdDir.x * abLen;
      points[1].y = points[0].y + cdDir.y * abLen;
      renderParallelogram();
      return;
    }
    if (currentShape === 'rhombus'){
      // For rhombus: change AD length and make AB match its length (keeping directions)
      let intendedD = {x: points[0].x + newADvector.x, y: points[0].y + newADvector.y};
      const clampedD = { x: clamp(intendedD.x, b.minX, b.maxX), y: clamp(intendedD.y, b.minY, b.maxY) };
      let clamped = (clampedD.x !== intendedD.x) || (clampedD.y !== intendedD.y);
      const newLen = Math.max(30, Math.sqrt((clampedD.x - points[0].x)**2 + (clampedD.y - points[0].y)**2));
      // AB original direction
      const ABvec = { x: points[1].x - points[0].x, y: points[1].y - points[0].y };
      const ABmag = Math.sqrt(ABvec.x*ABvec.x + ABvec.y*ABvec.y) || 1;
      const ABdir = { x: ABvec.x/ABmag, y: ABvec.y/ABmag };
      const newAB = { x: ABdir.x * newLen, y: ABdir.y * newLen };
      // Reconstruct rhombus anchored at A
      const A = { x: points[0].x, y: points[0].y };
      const D = { x: A.x + (clampedD.x - points[0].x), y: A.y + (clampedD.y - points[0].y) };
      const B = { x: A.x + newAB.x, y: A.y + newAB.y };
      const C = { x: B.x + D.x - A.x, y: B.y + D.y - A.y };
      points[0] = A; points[3] = D; points[1] = B; points[2] = C;
      // Shift whole shape if any vertex outside
      const xs2 = points.map(p=>p.x), ys2 = points.map(p=>p.y);
      const curMinX2 = Math.min(...xs2), curMaxX2 = Math.max(...xs2);
      const curMinY2 = Math.min(...ys2), curMaxY2 = Math.max(...ys2);
      let shiftX2 = 0, shiftY2 = 0;
      if (curMinX2 < b.minX) shiftX2 = b.minX - curMinX2;
      if (curMaxX2 > b.maxX) shiftX2 = b.maxX - curMaxX2;
      if (curMinY2 < b.minY) shiftY2 = b.minY - curMinY2;
      if (curMaxY2 > b.maxY) shiftY2 = b.maxY - curMaxY2;
      if (shiftX2 !== 0 || shiftY2 !== 0) points = points.map(p=>({x: p.x + shiftX2, y: p.y + shiftY2}));
      if (clamped || shiftX2 !== 0 || shiftY2 !== 0){ svgEl.classList.add('clamped'); setTimeout(()=>svgEl.classList.remove('clamped'),700); }
    } else {
      let intendedD = {x: points[0].x + newADvector.x, y: points[0].y + newADvector.y};
      let clamped = false;
      const clampedD = { x: clamp(intendedD.x, b.minX, b.maxX), y: clamp(intendedD.y, b.minY, b.maxY) };
      if (clampedD.x !== intendedD.x || clampedD.y !== intendedD.y) clamped = true;
      points[3].x = clampedD.x;
      points[3].y = clampedD.y;
      // Adjust BC accordingly
      points[2].x = points[1].x + (points[3].x - points[0].x);
      points[2].y = points[1].y + (points[3].y - points[0].y);
      // Shift whole shape if any vertex outside
      const xs2 = points.map(p=>p.x), ys2 = points.map(p=>p.y);
      const curMinX2 = Math.min(...xs2), curMaxX2 = Math.max(...xs2);
      const curMinY2 = Math.min(...ys2), curMaxY2 = Math.max(...ys2);
      let shiftX2 = 0, shiftY2 = 0;
      if (curMinX2 < b.minX) shiftX2 = b.minX - curMinX2;
      if (curMaxX2 > b.maxX) shiftX2 = b.maxX - curMaxX2;
      if (curMinY2 < b.minY) shiftY2 = b.minY - curMinY2;
      if (curMaxY2 > b.maxY) shiftY2 = b.maxY - curMaxY2;
      if (shiftX2 !== 0 || shiftY2 !== 0) points = points.map(p=>({x: p.x + shiftX2, y: p.y + shiftY2}));
      if (clamped || shiftX2 !== 0 || shiftY2 !== 0){ svgEl.classList.add('clamped'); setTimeout(()=>svgEl.classList.remove('clamped'),700); }
    }
  }
  renderParallelogram();
}

function resetParallelogram() {
  // Reset to the default for the currently selected shape
  if (currentShape === 'rhombus') points = JSON.parse(JSON.stringify(defaultRhombusPoints));
  else if (currentShape === 'trapezium') points = JSON.parse(JSON.stringify(defaultTrapeziumPoints));
  else points = JSON.parse(JSON.stringify(defaultPoints));
  renderParallelogram();
}

// --- Event Listeners for Controls ---
document.getElementById('ab-plus').addEventListener('click', () => adjustSideLength('AB', 20));
document.getElementById('ab-minus').addEventListener('click', () => adjustSideLength('AB', -20));
document.getElementById('ad-plus').addEventListener('click', () => adjustSideLength('AD', 20));
document.getElementById('ad-minus').addEventListener('click', () => adjustSideLength('AD', -20));
document.getElementById('reset-btn').addEventListener('click', resetParallelogram);

// --- Shape selection logic ---
const btnPar = document.getElementById('btn-parallelogram');
const btnRhomb = document.getElementById('btn-rhombus');
const btnTrap = document.getElementById('btn-trapezium');
const controlsSection = document.getElementById('controls-section');
const svgWrapperEl = document.getElementById('svg-wrapper');
const placeholderNote = document.getElementById('placeholder-note');
const resetBtn = document.getElementById('reset-btn');

// Angle input elements (added in HTML)
const angleACInput = document.getElementById('angle-ac'); // Angle BAD and DCB (A & C)
const angleBDInput = document.getElementById('angle-bd'); // Angle ABC and ADC (B & D)
const updateACBtn = document.getElementById('update-ac');
const updateBDBtn = document.getElementById('update-bd');

// Helper: convert degrees to radians
function deg2rad(d){ return d * Math.PI / 180; }

// Build a parallelogram given A position, side lengths AB and AD, and angle at A (between AB and AD)
// Points order: A (0), B (1), C (2), D (3)
function buildParallelogramFromA(A, lenAB, lenAD, angleAdeg){
  const ang = deg2rad(angleAdeg);
  const B = { x: A.x + lenAB, y: A.y }; // build AB horizontally then rotate whole shape to match angle
  // Instead we'll place AB along +x and AD at angle ang from AB
  const B2 = { x: A.x + lenAB, y: A.y };
  const D = { x: A.x + lenAD * Math.cos(ang), y: A.y + lenAD * Math.sin(ang) };
  const C = { x: B2.x + (D.x - A.x), y: B2.y + (D.y - A.y) };
  return [A, B2, C, D];
}

// Given desired opposite angles at A and C, update the current parallelogram while preserving parallelism
function updateParallelogramByAC(angleAdeg, angleCdeg){
  // For a parallelogram, angleA + angleB = 180 and opposite angles equal: angleA == angleC
  // We will enforce angleAdeg and angleCdeg to be equal by averaging; but user supplies both - we'll check and use average
  let a = clamp(Number(angleAdeg) || 0, 1, 179);
  let c = clamp(Number(angleCdeg) || 0, 1, 179);
  const avg = Math.round((a + c)/2);
  a = c = avg;
  // Keep A near its current position (points[0]). Determine side lengths from current AB and AD
  const A = { x: points[0].x, y: points[0].y };
  let lenAB = distance(points[0], points[1]);
  let lenAD = distance(points[0], points[3]);
  // Rebuild using angle at A
  points = buildParallelogramFromA(A, lenAB, lenAD, a);
  renderParallelogram();
}

// Given desired opposite angles at B and D, update parallelogram
function updateParallelogramByBD(angleBdeg, angleDdeg){
  // Opposite B and D should be equal; average inputs
  let b = clamp(Number(angleBdeg) || 0, 1, 179);
  let d = clamp(Number(angleDdeg) || 0, 1, 179);
  const avg = Math.round((b + d)/2);
  b = d = avg;
  // Use relationship angleA = 180 - angleB
  const angleA = 180 - b;
  // Use current side lengths
  const A = { x: points[0].x, y: points[0].y };
  let lenAB = distance(points[0], points[1]);
  let lenAD = distance(points[0], points[3]);
  points = buildParallelogramFromA(A, lenAB, lenAD, angleA);
  renderParallelogram();
}

function setControlsEnabled(enabled){
  ['ab-plus','ab-minus','ad-plus','ad-minus'].forEach(id=>{
    const el = document.getElementById(id); if(!el) return;
    if(enabled){ el.classList.remove('disabled'); el.disabled = false; } else { el.classList.add('disabled'); el.disabled = true; }
  });
}

btnPar.addEventListener('click', ()=>{
  // show controls and svg
  controlsSection.style.display = '';
  svgWrapperEl.style.display = '';
  placeholderNote.style.display = 'none';
  setControlsEnabled(true);
  currentShape = 'parallelogram';
  points = JSON.parse(JSON.stringify(defaultPoints));
  // render now
  resetBtn.textContent = 'Reset Parallelogram';
  // restore control labels
  const lblAB = document.getElementById('label-ab');
  const lblAD = document.getElementById('label-ad');
  if (lblAB) lblAB.textContent = 'AB & CD (Horizontal sides):';
  if (lblAD) lblAD.textContent = 'AD & BC (Vertical sides):';
  // restore button tooltips
  const abPlus = document.getElementById('ab-plus');
  const abMinus = document.getElementById('ab-minus');
  const adPlus = document.getElementById('ad-plus');
  const adMinus = document.getElementById('ad-minus');
  if (abPlus) { abPlus.title = 'Increase AB'; abPlus.setAttribute('aria-label','Increase AB'); }
  if (abMinus) { abMinus.title = 'Decrease AB'; abMinus.setAttribute('aria-label','Decrease AB'); }
  if (adPlus) { adPlus.title = 'Increase AD'; adPlus.setAttribute('aria-label','Increase AD'); }
  if (adMinus) { adMinus.title = 'Decrease AD'; adMinus.setAttribute('aria-label','Decrease AD'); }
  renderParallelogram();
});

// Update Rhombus button handler to initialize rhombus state
btnRhomb.addEventListener('click', ()=>{
  // enable rhombus mode
  controlsSection.style.display = '';
  svgWrapperEl.style.display = '';
  placeholderNote.style.display = 'none';
  setControlsEnabled(true);
  currentShape = 'rhombus';
  points = JSON.parse(JSON.stringify(defaultRhombusPoints));
  resetBtn.textContent = 'Reset Rhombus';
  // restore control labels
  const lblAB = document.getElementById('label-ab');
  const lblAD = document.getElementById('label-ad');
  if (lblAB) lblAB.textContent = 'AB & CD (Horizontal sides):';
  if (lblAD) lblAD.textContent = 'AD & BC (Vertical sides):';
  // restore button tooltips
  const abPlus = document.getElementById('ab-plus');
  const abMinus = document.getElementById('ab-minus');
  const adPlus = document.getElementById('ad-plus');
  const adMinus = document.getElementById('ad-minus');
  if (abPlus) { abPlus.title = 'Increase AB'; abPlus.setAttribute('aria-label','Increase AB'); }
  if (abMinus) { abMinus.title = 'Decrease AB'; abMinus.setAttribute('aria-label','Decrease AB'); }
  if (adPlus) { adPlus.title = 'Increase AD'; adPlus.setAttribute('aria-label','Increase AD'); }
  if (adMinus) { adMinus.title = 'Decrease AD'; adMinus.setAttribute('aria-label','Decrease AD'); }
  renderParallelogram();
});

btnTrap.addEventListener('click', ()=>{
  // enable trapezium mode
  controlsSection.style.display = '';
  svgWrapperEl.style.display = '';
  placeholderNote.style.display = 'none';
  setControlsEnabled(true);
  currentShape = 'trapezium';
  points = JSON.parse(JSON.stringify(defaultTrapeziumPoints));
  resetBtn.textContent = 'Reset Trapezium';
  // update control labels for trapezium semantics and button tooltips
  const lblAB = document.getElementById('label-ab');
  const lblAD = document.getElementById('label-ad');
  if (lblAB) lblAB.textContent = 'Line AB';
  if (lblAD) lblAD.textContent = 'Line CD';
  const abPlus = document.getElementById('ab-plus');
  const abMinus = document.getElementById('ab-minus');
  const adPlus = document.getElementById('ad-plus');
  const adMinus = document.getElementById('ad-minus');
  if (abPlus) { abPlus.title = 'Increase Line AB'; abPlus.setAttribute('aria-label','Increase Line AB'); }
  if (abMinus) { abMinus.title = 'Decrease Line AB'; abMinus.setAttribute('aria-label','Decrease Line AB'); }
  if (adPlus) { adPlus.title = 'Increase Line CD'; adPlus.setAttribute('aria-label','Increase Line CD'); }
  if (adMinus) { adMinus.title = 'Decrease Line CD'; adMinus.setAttribute('aria-label','Decrease Line CD'); }
  renderParallelogram();
});

// Ensure controls are initially disabled and svg hidden until selection
setControlsEnabled(false);

// Wire up new angle update buttons if present
if (updateACBtn) {
  updateACBtn.addEventListener('click', ()=>{
    const val = Number(angleACInput.value);
    if (!val || val < 1 || val > 179) { angleACInput.classList.add('invalid'); return; }
    angleACInput.classList.remove('invalid');
    // Update only in parallelogram or rhombus mode
    if (currentShape === 'parallelogram' || currentShape === 'rhombus') updateParallelogramByAC(val, val);
  });
}
if (updateBDBtn) {
  updateBDBtn.addEventListener('click', ()=>{
    const val = Number(angleBDInput.value);
    if (!val || val < 1 || val > 179) { angleBDInput.classList.add('invalid'); return; }
    angleBDInput.classList.remove('invalid');
    if (currentShape === 'parallelogram' || currentShape === 'rhombus') updateParallelogramByBD(val, val);
  });
}
