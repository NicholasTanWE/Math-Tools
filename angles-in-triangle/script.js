// Angles in a Triangle interactive demo
// Adapted for Math Tools Repository style guide

const canvas = document.getElementById('triangleCanvas');
const ctx = canvas.getContext('2d');
const angleInfo = document.getElementById('angle-info');
const randomizeBtn = document.getElementById('randomizeBtn');

let vertices = [
  { x: 100, y: 300 },
  { x: 300, y: 300 },
  { x: 200, y: 100 }
];
let dragging = null;

function drawTriangle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw triangle
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  ctx.lineTo(vertices[1].x, vertices[1].y);
  ctx.lineTo(vertices[2].x, vertices[2].y);
  ctx.closePath();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--primary-red');
  ctx.fill();
  // Do NOT draw vertices or green circles
  // Draw angles
  const angles = getAngles();
  vertices.forEach((v, i) => {
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.fillText(angles[i].toFixed(1) + '°', v.x + 12, v.y - 12);
  });
  // Show angle info
  angleInfo.textContent = `Angles: ${angles.map(a => a.toFixed(1)).join('°, ')}° | Sum: ${angles.reduce((a,b)=>a+b,0).toFixed(1)}°`;
}

function getAngles() {
  // Law of Cosines
  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  const a = dist(vertices[1], vertices[2]);
  const b = dist(vertices[0], vertices[2]);
  const c = dist(vertices[0], vertices[1]);
  // Angles at A, B, C
  const angleA = Math.acos((b*b + c*c - a*a) / (2*b*c)) * 180 / Math.PI;
  const angleB = Math.acos((a*a + c*c - b*b) / (2*a*c)) * 180 / Math.PI;
  const angleC = 180 - angleA - angleB;
  return [angleA, angleB, angleC];
}

canvas.addEventListener('mousedown', e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  dragging = vertices.findIndex(v => Math.hypot(v.x - mx, v.y - my) < 15);
});
canvas.addEventListener('mousemove', e => {
  if (dragging !== null) {
    const rect = canvas.getBoundingClientRect();
    vertices[dragging].x = Math.max(20, Math.min(canvas.width - 20, e.clientX - rect.left));
    vertices[dragging].y = Math.max(20, Math.min(canvas.height - 20, e.clientY - rect.top));
    drawTriangle();
  }
});
canvas.addEventListener('mouseup', () => {
  dragging = null;
});
canvas.addEventListener('mouseleave', () => {
  dragging = null;
});

randomizeBtn.addEventListener('click', () => {
  vertices = [
    { x: 60 + Math.random() * 280, y: 60 + Math.random() * 280 },
    { x: 60 + Math.random() * 280, y: 60 + Math.random() * 280 },
    { x: 60 + Math.random() * 280, y: 60 + Math.random() * 280 }
  ];
  drawTriangle();
});

drawTriangle();
