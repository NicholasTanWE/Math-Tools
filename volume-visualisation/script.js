document.addEventListener('DOMContentLoaded', () => {
  try {
    (function main() {
      const el = id => document.getElementById(id);
      const lengthInput = el('length');
      const breadthInput = el('breadth');
      const heightInput = el('height');
      const generateBtn = el('generate');
      const exportBtn = el('exportBtn');
      const resetBtn = el('resetBtn');
      const scene = el('scene');
      const volumeLabel = el('volume');
      const layerRange = el('layerRange');
      const layerInfo = el('layerInfo');
      const showSplit = el('showSplit');

      let state = { L: 2, B: 3, H: 4, split: 'horizontal', splitOn: false, selected: 1 };

      function readSplitType() {
        const r = document.querySelector('input[name="split"]:checked');
        return r ? r.value : 'horizontal';
      }

      function createCanvas(w, h) {
        scene.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(200, Math.round(w));
        canvas.height = Math.max(150, Math.round(h));
        canvas.style.maxWidth = '100%';
        scene.appendChild(canvas);
        return canvas;
      }

      function drawCube(ctx, ox, oy, tileW, tileH, cubeH, colors, label) {
        const p1 = { x: ox, y: oy };
        const p2 = { x: ox + tileW / 2, y: oy + tileH / 2 };
        const p3 = { x: ox, y: oy + tileH };
        const p4 = { x: ox - tileW / 2, y: oy + tileH / 2 };

        // draw top first
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fillStyle = colors.top; ctx.fill();

        // left face
        ctx.beginPath();
        ctx.moveTo(p4.x, p4.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p3.x, p3.y + cubeH);
        ctx.lineTo(p4.x, p4.y + cubeH);
        ctx.closePath();
        ctx.fillStyle = colors.left; ctx.fill();

        // right face
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p3.x, p3.y + cubeH);
        ctx.lineTo(p2.x, p2.y + cubeH);
        ctx.closePath();
        ctx.fillStyle = colors.right; ctx.fill();

        // single crisp outline around the cube
        ctx.beginPath();
        ctx.moveTo(p4.x, p4.y + cubeH);
        ctx.lineTo(p3.x, p3.y + cubeH);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1; ctx.stroke();

        // small ambient shadow at base
        ctx.beginPath();
        ctx.moveTo(p4.x, p4.y + cubeH + 1);
        ctx.lineTo(p3.x, p3.y + cubeH + 1);
        ctx.lineTo(p3.x + 8, p3.y + cubeH + 6);
        ctx.lineTo(p4.x - 8, p4.y + cubeH + 6);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fill();
        // optional debug label on top
        if (label) {
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.font = '10px Segoe UI, Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, p1.x, p1.y + tileH/4);
        }
      }

      function render() {
        const L = state.L, B = state.B, H = state.H;
        const vol = L * B * H;
        volumeLabel.textContent = vol;
        // also show dims for quick debug
        const dimsLabel = document.getElementById('dims');
        if (dimsLabel) dimsLabel.textContent = `${L} × ${B} × ${H}`;

        const style = getComputedStyle(document.documentElement);
        const baseSize = parseInt(style.getPropertyValue('--cube-size')) || 28;
        const gap = parseInt(style.getPropertyValue('--gap')) || 4;

        const tileW = baseSize; // width of the top diamond
        const tileH = Math.round(baseSize * 0.55); // height of the top diamond
        const cubeH = tileH; // make cube side height equal to tile height so cubes sit flush

        const padding = 30;
        const approxWidth = (L + B) * tileW / 2 + padding * 2;
        const approxHeight = (L + B) * tileH / 2 + H * cubeH + padding * 2 + 40;

        const canvas = createCanvas(approxWidth, approxHeight);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;

        const originX = canvas.width / 2;
        // shift origin so the whole block is visible and centered vertically
        const originY = padding + (L + B) * tileH / 3;

        for (let z = 0; z < H; z++) {
          for (let y = B - 1; y >= 0; y--) {
            for (let x = 0; x < L; x++) {
              const sx = originX + (x - y) * tileW / 2;
              const sy = originY + (x + y) * tileH / 2 - z * cubeH;

              let highlighted = true;
              if (state.splitOn) {
                if (state.split === 'horizontal') highlighted = (z + 1) === state.selected;
                else if (state.split === 'vertical-length') highlighted = (x + 1) === state.selected;
                else highlighted = (y + 1) === state.selected;
              }

              const top = highlighted ? '#7aa3ff' : '#dbe8ff';
              const left = highlighted ? '#3b66d6' : '#e7eefc';
              const right = highlighted ? '#2b54c1' : '#d7e7ff';

              // draw cubes without artificial gaps so faces touch
              drawCube(ctx, sx, sy, tileW, tileH, cubeH, { top, left, right }, `${x},${y},${z}`);
            }
          }
        }
        
        // draw dims text on canvas for clarity
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.font = '14px Segoe UI, Arial';
        ctx.fillText(`${L}×${B}×${H}`, 10, 18);

        if (state.split === 'horizontal') {
          layerRange.max = H; if (state.selected > H) state.selected = H; layerRange.value = state.selected; layerInfo.textContent = `Layer ${layerRange.value} / ${H}`;
        } else if (state.split === 'vertical-length') {
          layerRange.max = L; if (state.selected > L) state.selected = L; layerRange.value = state.selected; layerInfo.textContent = `Slice ${layerRange.value} / ${L}`;
        } else {
          layerRange.max = B; if (state.selected > B) state.selected = B; layerRange.value = state.selected; layerInfo.textContent = `Slice ${layerRange.value} / ${B}`;
        }
      }

      function exportPNG() {
        const canvas = scene.querySelector('canvas');
        if (!canvas) { alert('No canvas to export'); return; }
        const link = document.createElement('a');
        link.download = `volume-${state.L}x${state.B}x${state.H}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }

      generateBtn.addEventListener('click', () => {
        const L = Math.max(1, Math.floor(Number(lengthInput.value) || 1));
        const B = Math.max(1, Math.floor(Number(breadthInput.value) || 1));
        const H = Math.max(1, Math.floor(Number(heightInput.value) || 1));
        state.L = L; state.B = B; state.H = H;
        state.split = readSplitType();
        state.splitOn = showSplit.checked;
        state.selected = 1;
        render();
      });

      document.querySelectorAll('input[name="split"]').forEach(r => r.addEventListener('change', () => {
        state.split = readSplitType();
        state.selected = 1;
        render();
      }));

      showSplit.addEventListener('change', () => { state.splitOn = showSplit.checked; render(); });

      layerRange.addEventListener('input', () => { state.selected = Number(layerRange.value); layerInfo.textContent = `${state.split === 'horizontal' ? 'Layer' : 'Slice'} ${state.selected} / ${layerRange.max}`; render(); });

      resetBtn && resetBtn.addEventListener('click', () => {
        lengthInput.value = 2; breadthInput.value = 3; heightInput.value = 4; showSplit.checked = false; state = { L: 2, B: 3, H: 4, split: 'horizontal', splitOn: false, selected: 1 }; render();
      });

      exportBtn && exportBtn.addEventListener('click', () => { exportPNG(); });

      // initial render
      render();

    })();
  } catch (err) {
    console.error('Volume visualiser error', err);
    const sceneEl = document.getElementById('scene');
    if (sceneEl) {
      sceneEl.innerHTML = '';
      const pre = document.createElement('pre');
      pre.style.color = '#b00';
      pre.textContent = 'Error: ' + (err && err.message ? err.message : String(err));
      sceneEl.appendChild(pre);
    }
  }
});

// Expose a small init helper for debugging
if (typeof window !== 'undefined') window.__volumeVisualiserReady = true;
