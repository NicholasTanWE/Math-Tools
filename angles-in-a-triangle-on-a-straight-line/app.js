// Triangle Angles Explorer - app.js
// Handles angle input, triangle drawing, drag/rotate, and randomization

const angle1Input = document.getElementById('angle1');
const angle2Input = document.getElementById('angle2');
const angle3Input = document.getElementById('angle3');
const randomizeBtn = document.getElementById('randomize');
const generateBtn = document.getElementById('generate');
const svg = document.getElementById('triangles-canvas');

let triangles = [];
const colors = ['#e74c3c', '#27ae60', '#2980b9'];

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function calcThirdAngle(a1, a2) {
    let a3 = 180 - a1 - a2;
    return a3 > 0 ? a3 : 0;
}

function updateAngle3() {
    let a1 = parseInt(angle1Input.value);
    let a2 = parseInt(angle2Input.value);
    let a3 = calcThirdAngle(a1, a2);
    angle3Input.value = a3 > 0 ? a3 : '';
    return a3;
}

function randomizeAngles() {
    let a1 = Math.floor(Math.random() * 177) + 1;
    let a2 = Math.floor(Math.random() * (179 - a1)) + 1;
    angle1Input.value = a1;
    angle2Input.value = a2;
    updateAngle3();
    drawTriangles();
}

function toRadians(deg) {
    return deg * Math.PI / 180;
}

function trianglePoints(a, b, c, size=120) {
    // Law of Sines to get side lengths
    // a, b, c are angles in degrees
    // size is the base length (between angle B and C)
    let A = toRadians(a), B = toRadians(b), C = toRadians(c);
    let sideA = size;
    let sideB = sideA * Math.sin(B) / Math.sin(A);
    let sideC = sideA * Math.sin(C) / Math.sin(A);
    // Place point A at (0,0), B at (sideC,0), C calculated
    let Ax = 0, Ay = 0;
    let Bx = sideC, By = 0;
    // Find C
    let angle_BAC = Math.PI - B;
    let Cx = sideB * Math.cos(angle_BAC);
    let Cy = sideB * Math.sin(angle_BAC);
    return [
        {x: Ax, y: Ay},
        {x: Bx, y: By},
        {x: Cx, y: Cy}
    ];
}

function clearSVG() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
}

function drawTriangles() {
    clearSVG();
    // Draw alignment line
    let alignLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    alignLine.setAttribute('x1', 80);
    alignLine.setAttribute('y1', 350);
    alignLine.setAttribute('x2', 720);
    alignLine.setAttribute('y2', 350);
    alignLine.setAttribute('class', 'align-line');
    svg.appendChild(alignLine);

    triangles = [];
    let a1 = parseInt(angle1Input.value);
    let a2 = parseInt(angle2Input.value);
    let a3 = calcThirdAngle(a1, a2);
    if (a3 <= 0) return;
    let points = trianglePoints(a1, a2, a3, 120);
    // Center positions for 3 triangles
    let centers = [
        {x: 200, y: 200},
        {x: 400, y: 200},
        {x: 600, y: 200}
    ];
    for (let i = 0; i < 3; i++) {
        let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'triangle-group');
        group.setAttribute('data-index', i);
        group.setAttribute('transform', `translate(${centers[i].x},${centers[i].y}) rotate(0)`);
        let poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
        poly.setAttribute('fill', colors[i]);
        poly.setAttribute('stroke', '#222');
        poly.setAttribute('stroke-width', '2');
        group.appendChild(poly);
        // Add rotate handle (circle)
        let handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        // Place handle above triangle's first vertex
        let hx = points[0].x + (points[1].x - points[0].x) * 0.5;
        let hy = points[0].y - 30;
        handle.setAttribute('cx', hx);
        handle.setAttribute('cy', hy);
        handle.setAttribute('r', 12);
        handle.setAttribute('class', 'rotate-handle');
        handle.setAttribute('data-index', i);
        group.appendChild(handle);
        svg.appendChild(group);
        triangles.push({
            group,
            center: {...centers[i]},
            rotation: 0,
            dragging: false,
            dragOffset: {x:0, y:0},
            rotating: false,
            rotateStart: 0,
            angleStart: 0
        });
    }
}

function onAngleInput() {
    let a3 = updateAngle3();
    if (a3 > 0) drawTriangles();
}


// Only update angle3 on input, but generate triangles on button click
angle1Input.addEventListener('input', updateAngle3);
angle2Input.addEventListener('input', updateAngle3);
randomizeBtn.addEventListener('click', randomizeAngles);
generateBtn.addEventListener('click', function() {
    let a3 = updateAngle3();
    if (a3 > 0) drawTriangles();
});

// Drag and rotate logic
let current = null;
let dragType = null; // 'move' or 'rotate'

svg.addEventListener('mousedown', function(e) {
    let isHandle = e.target.classList && e.target.classList.contains('rotate-handle');
    if (isHandle) {
        let idx = parseInt(e.target.getAttribute('data-index'));
        let t = triangles[idx];
        let pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        let svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
        dragType = 'rotate';
        t.rotating = true;
        t.rotateStart = Math.atan2(svgP.y - t.center.y, svgP.x - t.center.x);
        t.angleStart = t.rotation;
        current = t;
        svg.style.cursor = 'crosshair';
    } else if (e.target.tagName === 'polygon') {
        let group = e.target.parentNode;
        let idx = parseInt(group.getAttribute('data-index'));
        let t = triangles[idx];
        let pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        let svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
        dragType = 'move';
        t.dragging = true;
        t.dragOffset.x = svgP.x - t.center.x;
        t.dragOffset.y = svgP.y - t.center.y;
        current = t;
        svg.style.cursor = 'move';
    }
});

svg.addEventListener('mousemove', function(e) {
    if (!current) return;
    let pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    let svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    if (dragType === 'move' && current.dragging) {
        current.center.x = svgP.x - current.dragOffset.x;
        current.center.y = svgP.y - current.dragOffset.y;
        current.group.setAttribute('transform', `translate(${current.center.x},${current.center.y}) rotate(${current.rotation})`);
    } else if (dragType === 'rotate' && current.rotating) {
        let angle = Math.atan2(svgP.y - current.center.y, svgP.x - current.center.x);
        let deg = ((angle - current.rotateStart) * 180 / Math.PI) + current.angleStart;
        current.rotation = deg;
        current.group.setAttribute('transform', `translate(${current.center.x},${current.center.y}) rotate(${current.rotation})`);
    }
});

svg.addEventListener('mouseup', function(e) {
    if (current) {
        current.dragging = false;
        current.rotating = false;
        current = null;
        svg.style.cursor = '';
    }
});
svg.addEventListener('mouseleave', function(e) {
    if (current) {
        current.dragging = false;
        current.rotating = false;
        current = null;
        svg.style.cursor = '';
    }
});

// Touch support
svg.addEventListener('touchstart', function(e) {
    let touch = e.touches[0];
    let target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.tagName === 'polygon') {
        let group = target.parentNode;
        let idx = parseInt(group.getAttribute('data-index'));
        let t = triangles[idx];
        let pt = svg.createSVGPoint();
        pt.x = touch.clientX;
        pt.y = touch.clientY;
        let svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
        dragType = 'move';
        t.dragging = true;
        t.dragOffset.x = svgP.x - t.center.x;
        t.dragOffset.y = svgP.y - t.center.y;
        current = t;
    }
}, {passive: false});
svg.addEventListener('touchmove', function(e) {
    if (!current) return;
    let touch = e.touches[0];
    let pt = svg.createSVGPoint();
    pt.x = touch.clientX;
    pt.y = touch.clientY;
    let svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    if (dragType === 'move' && current.dragging) {
        current.center.x = svgP.x - current.dragOffset.x;
        current.center.y = svgP.y - current.dragOffset.y;
        current.group.setAttribute('transform', `translate(${current.center.x},${current.center.y}) rotate(${current.rotation})`);
    }
}, {passive: false});
svg.addEventListener('touchend', function(e) {
    if (current) {
        current.dragging = false;
        current = null;
    }
}, {passive: false});

// Initial setup
updateAngle3();
drawTriangles();
