(function () {
  'use strict';

  const tank      = document.getElementById('tank');
  const aquarium  = document.getElementById('aquarium');

  // ═══════════════════════════════════════════════
  // ASCII DEFINITIONS
  // ═══════════════════════════════════════════════

  const FISH = [
    // ── originals ──
    { r: '><(((º>',          l: '<º)))><',          spd: [0.5,  1.6]  },
    { r: '><>',              l: '<><',              spd: [0.8,  2.8]  },
    { r: '><((((((º>',      l: '<º))))))><',       spd: [0.25, 0.9]  },
    { r: '>°))彡',           l: '彡((°<',           spd: [0.6,  2.1]  },
    { r: '><{{{(º>',        l: '<º(}}}><',         spd: [0.4,  1.3]  },
    { r: '><º>',            l: '<º><',             spd: [1.0,  3.2]  },
    { r: '><((º>',          l: '<º))><',           spd: [0.5,  1.9]  },
    { r: '=><(((º>',        l: '<º)))>=',          spd: [0.3,  1.0]  },
    { r: '~><(º>',          l: '<º)<~',            spd: [1.2,  3.5]  },
    { r: '><**º>',          l: '<º**><',           spd: [0.9,  2.4]  },
    { r: ')(((º>',          l: '<º)))()',          spd: [0.4,  1.1]  },
    // ── swordfish / eel / streamlined ──
    { r: '----><(º>',       l: '<º(>----',         spd: [0.3,  1.0]  },
    { r: '~-~-~(º>',       l: '<º)~-~-~',         spd: [0.25, 0.8]  },
    { r: '><===(º>',        l: '<º)===><',         spd: [0.35, 1.0]  },
    { r: '-=><(((º>',      l: '<º)))><=-',        spd: [0.3,  0.9]  },
    // ── patterned bodies ──
    { r: '><|||º>',         l: '<º|||><',          spd: [0.7,  2.0]  },
    { r: '><O(º>',          l: '<º)O><',           spd: [0.2,  0.65] },
    { r: '><{==[º>',        l: '<º]==}><',         spd: [0.4,  1.2]  },
    { r: '><{{{º>',         l: '<º}}}><',          spd: [0.55, 1.7]  },
    { r: '><[[(º>',         l: '<º)]]><',          spd: [0.35, 1.1]  },
    { r: '><...º>',         l: '<º...><',          spd: [0.6,  1.8]  },
    // ── expressive faces ──
    { r: '><((·°·))>',      l: '<((·°·))><',       spd: [0.2,  0.6]  },
    { r: '><(OwO)>',        l: '<(OwO)><',         spd: [0.3,  0.8]  },
    { r: '><((º°))>',       l: '<((°º))><',        spd: [0.2,  0.65] },
    { r: '><(ºuº)>',        l: '<(ºuº)><',         spd: [0.25, 0.7]  },
    { r: '><(º~º)>',        l: '<(º~º)><',         spd: [0.3,  0.85] },
  ];

  // ── 3-row big fish (each row padded to equal width) ──
  // Row 1 = dorsal fin / top, Row 2 = body, Row 3 = belly / bottom
  const BIG_FISH = [
    { // Classic V-fins  (9 chars wide)
      r: '   /\\    \n><(((  º>\n   \\/    ',
      l: '   /\\    \n<º  )))><\n   \\/    ',
      spd: [0.15, 0.50],
    },
    { // Shark-like tall dorsal  (10 chars wide)
      r: '    /\\    \n><(((  º)>\n    \\/    ',
      l: '    /\\    \n<(º  )))><\n    \\/    ',
      spd: [0.12, 0.40],
    },
    { // Pufferfish  (10 chars wide)
      r: '   ___    \n><( OOº )>\n   ---    ',
      l: '   ___    \n<( ºOO )><\n   ---    ',
      spd: [0.10, 0.35],
    },
    { // Fancy tropical with forked tail  (12 chars wide)
      r: '     /\\     \n)><((( º··)>\n     \\/     ',
      l: '     /\\     \n<(··º )))><(\n     \\/     ',
      spd: [0.18, 0.55],
    },
    { // Whale-like  (13 chars wide)
      r: '      /~~\\   \n><((((  º~ )>\n      \\~~/   ',
      l: '      /~~\\   \n<( ~º  ))))><\n      \\~~/   ',
      spd: [0.08, 0.28],
    },
  ];

  // ─ The one-of-a-kind rainbow fish ─  (3-row, swims through screen once)
  const RAINBOW_FISH = {
    r: '    /\\/\\    \n><*((( º★ )))*>\n    \\/\\/    ',
    l: '    /\\/\\    \n<*(( ★º )))*><\n    \\/\\/    ',
    spd: [0.18, 0.38],
  };

  // Rare pass-through giants
  const SPECIAL = [
    { r: '><(((((((((º>',    l: '<º)))))))))><',    spd: [0.12, 0.35] },
    { r: '------><(((((º>',  l: '<º)))))------',    spd: [0.07, 0.22] },
  ];

  // Multi-line jellyfish (use \n)
  const JELLYFISH = [
    ' (°o°) \n /|||||\\\n  |||||',
    '  {°}  \n /|||/ \n  |||  ',
    ' (~°~) \n \\|||/ \n  |||  ',
    '  (·)  \n /|||\\\n  |||  ',
    ' (OwO) \n /|||||\\\n  |||||',
  ];

  const CRABS = [
    '(V)(;,;)(V)',
    'm(·,·)m',
    '(( º,º ))',
  ];

  const BUBBLES = ['o', 'O', '°', '·', '○', '◦'];

  const SEAWEEDS = [
    'ψ\nψ\n|',
    'Ψ\n|\n|',
    '*\n|\n|',
    'Y\n|\n|',
    'ψ\n|\n|',
  ];

  // ═══════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════

  const rnd     = (a, b) => Math.random() * (b - a) + a;
  const rndInt  = (a, b) => Math.floor(rnd(a, b + 1));
  const pick    = arr   => arr[rndInt(0, arr.length - 1)];

  function randomColor () {
    const options = [
      () => `hsl(${rndInt(165, 205)}, ${rndInt(80, 100)}%, ${rndInt(55, 75)}%)`,  // cyan/teal
      () => `hsl(${rndInt(280, 325)}, ${rndInt(80, 100)}%, ${rndInt(60, 80)}%)`,  // pink/magenta
      () => `hsl(${rndInt(35,   70)}, ${rndInt(80, 100)}%, ${rndInt(55, 75)}%)`,  // yellow/orange
      () => `hsl(${rndInt(100, 145)}, ${rndInt(65,  95)}%, ${rndInt(50, 70)}%)`,  // green
      () => `hsl(${rndInt(200, 245)}, ${rndInt(80, 100)}%, ${rndInt(60, 80)}%)`,  // blue/indigo
      () => `hsl(${rndInt(0,   28)},  ${rndInt(80, 100)}%, ${rndInt(55, 75)}%)`,  // red/coral
    ];
    return pick(options)();
  }

  // ═══════════════════════════════════════════════
  // CREATURE POOL
  // ═══════════════════════════════════════════════

  const pool = [];
  let W = window.innerWidth;
  let H = window.innerHeight;

  function makeEl (cls, text, color) {
    const el = document.createElement('div');
    el.className = `creature ${cls}`;
    el.textContent = text;
    if (color) el.style.color = color;
    tank.appendChild(el);
    return el;
  }

  // How close to the edge before a regular fish starts its U-turn
  const TURN_MARGIN = 160;
  // Turn-animation progress per frame  (~45 frames ≈ 0.75 s)
  const TURN_SPEED  = 0.022;

  // ── Fish ──
  function addFish (initial = false, def = null, big = false, passThrough = false) {
    const fishDef  = def || pick(FISH);
    const dir      = Math.random() < 0.5 ? 1 : -1;
    const speedMag = rnd(fishDef.spd[0], fishDef.spd[1]);
    const ascii    = dir === 1 ? fishDef.r : fishDef.l;
    const color    = randomColor();
    const el       = makeEl('fish', ascii, color);
    if (big) el.style.fontSize = '1.5rem';

    // Initial fish spawn inside the safe zone; entering fish spawn off-screen
    const x = initial
      ? rnd(0, W)
      : (dir === 1 ? rnd(-300, -60) : rnd(W + 60, W + 300));
    const y = rnd(40, H - 130);

    // wanderers exit the screen and re-enter; patrollers turn at the margin
    const behavior = passThrough ? 'passThrough'
                   : (Math.random() < 0.45 ? 'wanderer' : 'patroller');

    pool.push({
      el,
      x, y,
      vx: dir * speedMag, vy: 0,
      def: fishDef,
      dir,
      speedMag,
      type: 'fish',
      wobble: rnd(0, Math.PI * 2),
      // turn-animation state
      state: 'swimming',   // 'swimming' | 'turning'
      turnProgress: 0,     // 0 → 1
      turnFlipped:  false, // ASCII already swapped at midpoint?
      scaleX: 1,
      passThrough,
      behavior,
    });
  }

  // ── Rainbow fish ──  (rare one-off pass-through)
  function addRainbowFish () {
    const dir      = Math.random() < 0.5 ? 1 : -1;
    const speedMag = rnd(RAINBOW_FISH.spd[0], RAINBOW_FISH.spd[1]);
    const ascii    = dir === 1 ? RAINBOW_FISH.r : RAINBOW_FISH.l;

    const el = document.createElement('div');
    el.className   = 'creature fish rainbow-fish';
    el.textContent = ascii;
    el.style.fontSize   = '1.4rem';
    el.style.lineHeight = '1.35';
    tank.appendChild(el);

    const x = dir === 1 ? rnd(-420, -100) : rnd(W + 100, W + 420);
    const y = rnd(60, H - 180);

    pool.push({
      el, x, y,
      vx: dir * speedMag, vy: 0,
      def: RAINBOW_FISH,
      dir,
      speedMag,
      type: 'fish',
      wobble:       rnd(0, Math.PI * 2),
      state:        'swimming',
      turnProgress: 0,
      turnFlipped:  false,
      scaleX:       1,
      passThrough:  true,   // swims fully across then disappears
    });
  }

  // ── Big fish (3-row) ──
  function addBigFish (initial = false) {
    const fishDef  = pick(BIG_FISH);
    const dir      = Math.random() < 0.5 ? 1 : -1;
    const speedMag = rnd(fishDef.spd[0], fishDef.spd[1]);
    const ascii    = dir === 1 ? fishDef.r : fishDef.l;
    const color    = randomColor();
    const el       = makeEl('fish', ascii, color);
    el.style.fontSize   = '1.4rem';
    el.style.lineHeight = '1.35';

    const x = initial
      ? rnd(0, W)
      : (dir === 1 ? rnd(-400, -80) : rnd(W + 80, W + 400));
    const y = rnd(60, H - 180);

    pool.push({
      el, x, y,
      vx: dir * speedMag, vy: 0,
      def: fishDef,
      dir,
      speedMag,
      type: 'fish',
      wobble:       rnd(0, Math.PI * 2),
      state:        'swimming',
      turnProgress: 0,
      turnFlipped:  false,
      scaleX:       1,
      passThrough:  false,
      behavior:     'wanderer',  // big fish always roam freely
    });
  }

  // ── Jellyfish ──
  function addJellyfish (initial = false) {
    const ascii = pick(JELLYFISH);
    const color = randomColor();
    const el    = makeEl('jellyfish', ascii, color);

    const x = rnd(60, W - 120);
    const y = initial ? rnd(30, H - 200) : rnd(30, H * 0.6);

    pool.push({
      el, x, y,
      vx: rnd(-0.22, 0.22),
      vy: rnd(-0.12, 0.12),
      type: 'jellyfish',
      phase:      rnd(0, Math.PI * 2),
      phaseSpeed: rnd(0.008, 0.025),
    });
  }

  // ── Bubbles ──
  function addBubble (initial = false) {
    if (pool.filter(c => c.type === 'bubble').length >= 40) return;

    const char    = pick(BUBBLES);
    const el      = makeEl('bubble', char, null);
    const startX  = rnd(20, W - 30);
    const y       = initial ? rnd(H * 0.1, H - 70) : H - rnd(20, 90);
    const opacity = rnd(0.35, 0.75);
    el.style.opacity = opacity.toString();

    pool.push({
      el, x: startX, y,
      startX,
      vx: 0,
      vy: -rnd(0.3, 0.85),
      type: 'bubble',
      wobble:      rnd(0, Math.PI * 2),
      wobbleSpeed: rnd(0.03, 0.07),
      wobbleAmp:   rnd(12, 32),
      opacity,
    });
  }

  // ── Crabs ──
  function addCrab () {
    const ascii = pick(CRABS);
    const color = randomColor();
    const el    = makeEl('crab', ascii, color);

    const x     = rnd(30, W - 130);
    const baseY = H - 60;   // fixed seabed row – never recalculated per-frame
    const vx    = rnd(0.08, 0.28) * (Math.random() < 0.5 ? 1 : -1);

    pool.push({ el, x, y: baseY, baseY, vx, vy: 0, type: 'crab' });
  }

  // ═══════════════════════════════════════════════
  // SEABED & TITLE (built once at init)
  // ═══════════════════════════════════════════════

  function buildSeabed () {
    // Sandy floor – two rows of dots/punctuation
    const sandEl = document.createElement('div');
    sandEl.style.cssText = `
      position: absolute;
      bottom: 0; left: 0;
      width: 100%;
      pointer-events: none;
      user-select: none;
      line-height: 1.3;
      overflow: hidden;
    `;

    const sandPat = '. : · . : . · : . : · . ';
    const cols    = Math.ceil(W / 7);
    let   line    = (sandPat.repeat(Math.ceil(cols / sandPat.length))).slice(0, cols);

    [line, line.split('').reverse().join('')].forEach((txt, i) => {
      const row = document.createElement('div');
      row.style.cssText = `
        color: ${i === 0 ? '#7a6a5a' : '#5a4a3a'};
        font-size: 0.8rem;
        white-space: nowrap;
        font-family: 'Courier New', monospace;
      `;
      row.textContent = txt;
      sandEl.appendChild(row);
    });

    aquarium.appendChild(sandEl);

    // Seaweed
    const weedCount = Math.max(6, Math.floor(W / 140));
    for (let i = 0; i < weedCount; i++) {
      const weed  = document.createElement('div');
      weed.className = 'seaweed';
      weed.textContent = pick(SEAWEEDS);
      const hue   = rndInt(100, 140);
      const light = rndInt(28, 52);
      const col   = `hsl(${hue}, 58%, ${light}%)`;
      weed.style.color      = col;
      weed.style.textShadow = `0 0 7px ${col}`;
      weed.style.left       = `${rnd(20, W - 50)}px`;
      weed.style.bottom     = '20px';
      weed.style.animationDelay    = `${rnd(0, 3)}s`;
      weed.style.animationDuration = `${rnd(2, 5)}s`;
      aquarium.appendChild(weed);
    }
  }

  function addTitle () {
    const el = document.createElement('div');
    el.id          = 'title';
    el.textContent = '~ A S C I I   A Q U A R I U M ~';
    aquarium.appendChild(el);
  }

  // ═══════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════

  function init () {
    W = window.innerWidth;
    H = window.innerHeight;

    buildSeabed();
    addTitle();

    for (let i = 0; i < 22; i++) addFish(true);
    for (let i = 0; i < 3;  i++) addBigFish(true);
    for (let i = 0; i < 5;  i++) addJellyfish(true);
    for (let i = 0; i < 28; i++) addBubble(true);
    for (let i = 0; i < 4;  i++) addCrab();
  }

  // ═══════════════════════════════════════════════
  // ANIMATION LOOP
  // ═══════════════════════════════════════════════

  let lastBubble  = 0;
  let nextSpecial  = 20000 + rnd(0, 25000);   // first giant pass-through after ~20–45 s
  let nextBigFish  = 10000 + rnd(0, 8000);    // first new big fish after ~10–18 s
  let nextRainbow  = 90000 + rnd(0, 90000);   // rainbow fish first appears after ~90–180 s

  function tick (ts) {
    W = window.innerWidth;
    H = window.innerHeight;

    // Trickle in new bubbles
    if (ts - lastBubble > 700) {
      addBubble(false);
      lastBubble = ts;
    }

    // Rare special creature
    if (ts > nextSpecial) {
      addFish(false, pick(SPECIAL), true, true);  // passThrough giants
      nextSpecial = ts + 25000 + rnd(0, 25000);
    }

    // Periodically add a new big fish
    if (ts > nextBigFish) {
      addBigFish(false);
      nextBigFish = ts + 12000 + rnd(0, 8000);
    }

    // Legendary rainbow fish — very rare, passes through once then vanishes
    if (ts > nextRainbow) {
      addRainbowFish();
      nextRainbow = ts + 120000 + rnd(0, 120000);  // next visit: 2–4 minutes later
    }

    for (let i = pool.length - 1; i >= 0; i--) {
      const c = pool[i];

      // ── Fish ──────────────────────────────────
      if (c.type === 'fish') {

        if (c.state === 'turning') {
          // ── turn animation ──
          c.turnProgress += TURN_SPEED;
          const t = c.turnProgress;

          // |cos(t·π)| → 1 at t=0, dips to 0 at t=0.5, back to 1 at t=1
          c.scaleX = Math.abs(Math.cos(t * Math.PI));

          // At the invisible midpoint swap direction and ASCII art
          if (t >= 0.5 && !c.turnFlipped) {
            c.dir            *= -1;
            c.el.textContent  = c.dir === 1 ? c.def.r : c.def.l;
            c.turnFlipped     = true;
          }

          if (t >= 1) {
            c.state        = 'swimming';
            c.turnProgress = 0;
            c.turnFlipped  = false;
            c.scaleX       = 1;
            c.vx           = c.dir * c.speedMag;
          }

          // Gentle y drift while standing still during turn
          c.wobble += 0.018;
          c.y      += Math.sin(c.wobble) * 0.1;
          c.y       = Math.max(30, Math.min(H - 130, c.y));

        } else {
          // ── normal swimming ──
          c.wobble += 0.018;
          c.x      += c.vx;
          c.y      += Math.sin(c.wobble + i * 0.7) * 0.22;
          c.y       = Math.max(30, Math.min(H - 130, c.y));

          if (c.passThrough) {
            // Pass-through fish (giants/rainbow) – removed when off-screen
            if (c.vx > 0 && c.x > W + 350) {
              c.el.remove(); pool.splice(i, 1); continue;
            }
            if (c.vx < 0 && c.x < -350) {
              c.el.remove(); pool.splice(i, 1); continue;
            }
          } else if (c.behavior === 'wanderer') {
            // Swims freely in and out of the frame, re-entering from the opposite side
            if (c.vx > 0 && c.x > W + 260) {
              c.x = -260;
              c.y = rnd(40, H - 130);
            } else if (c.vx < 0 && c.x < -260) {
              c.x = W + 260;
              c.y = rnd(40, H - 130);
            }
          } else {
            // Patroller: turns around at the margin
            if ((c.vx > 0 && c.x >= W - TURN_MARGIN) ||
                (c.vx < 0 && c.x <= TURN_MARGIN)) {
              c.x            = c.vx > 0 ? W - TURN_MARGIN : TURN_MARGIN;
              c.vx           = 0;
              c.state        = 'turning';
              c.turnProgress = 0;
              c.turnFlipped  = false;
              c.scaleX       = 1;
            }
          }
        }

        c.el.style.transform =
          `translate(${Math.round(c.x)}px, ${Math.round(c.y)}px) scaleX(${c.scaleX.toFixed(3)})`;

      } else if (c.type === 'jellyfish') {
        c.phase += c.phaseSpeed;
        c.x     += c.vx;
        c.y     += c.vy + Math.sin(c.phase) * 0.35;

        if (c.x < 20 || c.x > W - 130) c.vx *= -1;
        if (c.y < 20 || c.y > H - 160) c.vy *= -1;

        c.el.style.transform = `translate(${Math.round(c.x)}px, ${Math.round(c.y)}px)`;

      } else if (c.type === 'bubble') {
        c.wobble += c.wobbleSpeed;
        c.x       = c.startX + Math.sin(c.wobble) * c.wobbleAmp;
        c.y      += c.vy;

        // Fade as it rises toward the surface
        const frac = Math.max(0, c.y / H);
        c.el.style.opacity = (c.opacity * (0.25 + frac * 0.75)).toFixed(3);

        if (c.y < -20) {
          c.el.remove();
          pool.splice(i, 1);
          continue;
        }

        c.el.style.transform = `translate(${Math.round(c.x)}px, ${Math.round(c.y)}px)`;

      } else if (c.type === 'crab') {
        c.x += c.vx;
        if (c.x < 20)      { c.x = 20;      c.vx =  Math.abs(c.vx); }
        if (c.x > W - 130) { c.x = W - 130; c.vx = -Math.abs(c.vx); }

        // Use stored baseY – no random call per frame, no vibration
        c.el.style.transform = `translate(${Math.round(c.x)}px, ${Math.round(c.baseY)}px)`;
      }
    }

    requestAnimationFrame(tick);
  }

  // ── Controls ──────────────────────────────────

  const FISH_MAX = 60;

  function fishCount () {
    return pool.filter(c => c.type === 'fish' && !c.passThrough).length;
  }

  function syncButtons () {
    document.getElementById('btn-remove').disabled = fishCount() <= 1;
    document.getElementById('btn-add').disabled    = fishCount() >= FISH_MAX;
  }

  function onAddFish () {
    if (fishCount() >= FISH_MAX) return;
    // 30 % chance of a big fish
    if (Math.random() < 0.3) addBigFish(false);
    else                      addFish(false);
    syncButtons();
  }

  function onRemoveFish () {
    // Remove the last regular (non-passThrough) fish from the pool
    for (let i = pool.length - 1; i >= 0; i--) {
      if (pool[i].type === 'fish' && !pool[i].passThrough) {
        pool[i].el.remove();
        pool.splice(i, 1);
        break;
      }
    }
    syncButtons();
  }

  function onReset () {
    // Remove all creature elements and clear the pool
    pool.forEach(c => c.el.remove());
    pool.length = 0;
    // Re-spawn default population
    for (let i = 0; i < 22; i++) addFish(true);
    for (let i = 0; i < 3;  i++) addBigFish(true);
    for (let i = 0; i < 5;  i++) addJellyfish(true);
    for (let i = 0; i < 28; i++) addBubble(true);
    for (let i = 0; i < 4;  i++) addCrab();
    // Reset timers
    lastBubble  = 0;
    nextSpecial = performance.now() + 20000 + rnd(0, 25000);
    nextBigFish = performance.now() + 10000 + rnd(0, 8000);
    nextRainbow = performance.now() + 90000 + rnd(0, 90000);
    syncButtons();
  }

  // ── Start ──
  init();
  syncButtons();
  requestAnimationFrame(tick);

  document.getElementById('btn-add').addEventListener('click', onAddFish);
  document.getElementById('btn-remove').addEventListener('click', onRemoveFish);
  document.getElementById('btn-reset').addEventListener('click', onReset);

  window.addEventListener('resize', () => {
    W = window.innerWidth;
    H = window.innerHeight;
    pool.forEach(c => {
      if (c.type === 'crab') {
        c.baseY = H - 60;
        c.x     = Math.min(c.x, W - 130);
      }
    });
  });

})();
