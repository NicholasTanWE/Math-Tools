// Math Dungeon Adventure - script.js
// Full game logic moved from inline HTML

// --- Monster data ---
const monsterNames = [
  "Goblin Grumpus", "Dragon Mathicus", "Troll Calculon", "Orc Numberton",
  "Skeleton Subtractor", "Wizard Multiplicius", "Beast Dividor", "Demon Digitron",
  "Giant Equator", "Spider Sumnor", "Wolf Problemius", "Snake Solutius"
];
// map monster names to image paths (these point to the placeholder SVGs in images/)
const monsterImages = {
  "Goblin Grumpus": "images/goblin_grumpus.png",
  "Dragon Mathicus": "images/dragon_mathicus.png",
  "Troll Calculon": "images/troll_calculon.png",
  "Orc Numberton": "images/orc_numberton.png",
  "Skeleton Subtractor": "images/skeleton_subtractor.png",
  "Wizard Multiplicius": "images/wizard_multiplicius.png",
  "Beast Dividor": "images/beast_dividor.png",
  "Demon Digitron": "images/demon_digitron.png",
  "Giant Equator": "images/giant_equator.png",
  "Spider Sumnor": "images/spider_sumnor.png",
  "Wolf Problemius": "images/wolf_problemius.png",
  "Snake Solutius": "images/snake_solutius.png",
};

function getRandomMonster() {
  const idx = Math.floor(Math.random()*monsterNames.length);
  const name = monsterNames[idx];
  const imgPath = monsterImages[name] || "";
  const imgHtml = imgPath ? `<img src="${imgPath}" alt="${name}" style="max-width:100%; max-height:100%; border-radius:8px;" />` : "?";
  return { name: name, img: imgHtml };
}

// --- DOM refs ---
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const timesTableGroup = document.getElementById('times-table-group');
const multiplicationControls = document.getElementById('multiplication-controls');
const additionControls = document.getElementById('addition-controls');
const subtractionControls = document.getElementById('subtraction-controls');
const divisionControls = document.getElementById('division-controls');
const monsterNameEl = document.getElementById('monster-name');
const monsterImgEl = document.getElementById('monster-img');
const questionArea = document.getElementById('question-area');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const giveupBtn = document.getElementById('giveup-btn');
const feedbackEl = document.getElementById('feedback');
const monsterCounterEl = document.getElementById('monster-counter');
const attemptsRemainingEl = document.getElementById('attempts-remaining');
const scoreTrackerEl = document.getElementById('score-tracker');

// create times table checkboxes
for(let i=1;i<=10;i++){
  const label = document.createElement('label');
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.value = i;
  cb.name = 'times-table';
  label.appendChild(cb);
  label.appendChild(document.createTextNode(i + ' times table'));
  timesTableGroup.appendChild(label);
}
timesTableGroup.addEventListener('change', function(e){
  const checked = timesTableGroup.querySelectorAll('input[type="checkbox"]:checked');
  if(checked.length>5){
    e.target.checked = false;
    alert('You can select up to 5 times tables only.');
  }
});

// New: separate mode for scale multiplication/division (10/100/1000)
const scaleMultiplicationControls = document.getElementById('scale-multiplication-controls');
const scaleDivisionControls = document.getElementById('scale-division-controls');

// operation buttons behavior
document.getElementById('op-mult').addEventListener('click',()=>{
  multiplicationControls.style.display = 'block';
  scaleMultiplicationControls.style.display = 'none';
  scaleDivisionControls.style.display = 'none';
  divisionControls.style.display = 'none';
  additionControls.style.display = 'none';
  subtractionControls.style.display = 'none';
  ['op-mult','op-add','op-sub','op-div','op-scale-mult','op-scale-div'].forEach(id=>document.getElementById(id).classList.remove('selected'));
  document.getElementById('op-mult').classList.add('selected');
});
// new button: Multiply by 10/100/1000 (separate from standard multiplication)
document.getElementById('op-scale-mult').addEventListener('click', ()=>{
  multiplicationControls.style.display = 'none';
  scaleMultiplicationControls.style.display = 'block';
  divisionControls.style.display = 'none';
  scaleDivisionControls.style.display = 'none';
  additionControls.style.display = 'none';
  subtractionControls.style.display = 'none';
  // manage selected classes
  ['op-mult','op-add','op-sub','op-div','op-scale-mult','op-scale-div'].forEach(id=>document.getElementById(id).classList.remove('selected'));
  document.getElementById('op-scale-mult').classList.add('selected');
});
// new button: Division of 10/100/1000 (placeholder)
document.getElementById('op-scale-div').addEventListener('click', ()=>{
  multiplicationControls.style.display = 'none';
  scaleMultiplicationControls.style.display = 'none';
  divisionControls.style.display = 'none';
  scaleDivisionControls.style.display = 'block';
  additionControls.style.display = 'none';
  subtractionControls.style.display = 'none';
  ['op-mult','op-add','op-sub','op-div','op-scale-mult','op-scale-div'].forEach(id=>document.getElementById(id).classList.remove('selected'));
  document.getElementById('op-scale-div').classList.add('selected');
});
document.getElementById('op-add').addEventListener('click',()=>{
  multiplicationControls.style.display = 'none';
  scaleMultiplicationControls.style.display = 'none';
  scaleDivisionControls.style.display = 'none';
  divisionControls.style.display = 'none';
  subtractionControls.style.display = 'none';
  document.getElementById('coming-soon-add').style.display='none';
  ['op-mult','op-add','op-sub','op-div','op-scale-mult','op-scale-div'].forEach(id=>document.getElementById(id).classList.remove('selected'));
  const opAddBtn = document.getElementById('op-add');
  opAddBtn.classList.remove('disabled');
  opAddBtn.classList.add('selected');
  document.getElementById('op-sub').classList.remove('selected');
  document.getElementById('op-div').classList.remove('selected');
  additionControls.style.display = 'block';
});
// show/hide addition decimal select only when decimal radio is selected
{
  const addRadios = document.getElementsByName('add-diff');
  const addDecimalEl = document.getElementById('addition-decimal-places').parentElement;
  function updateAddDecimalVisibility(){
    let isDecimal = false; for(const r of addRadios) if(r.checked && r.value === '999.999') isDecimal = true;
    addDecimalEl.style.display = isDecimal ? 'block' : 'none';
  }
  addRadios.forEach(r=>r.addEventListener('change', updateAddDecimalVisibility));
  // initial state
  updateAddDecimalVisibility();
}
document.getElementById('op-sub').addEventListener('click',()=>{
  multiplicationControls.style.display = 'none';
  scaleMultiplicationControls.style.display = 'none';
  scaleDivisionControls.style.display = 'none';
  additionControls.style.display = 'none';
  divisionControls.style.display = 'none';
  document.getElementById('coming-soon-sub').style.display='none';
  ['op-mult','op-add','op-sub','op-div','op-scale-mult','op-scale-div'].forEach(id=>document.getElementById(id).classList.remove('selected'));
  const opSubBtn = document.getElementById('op-sub');
  opSubBtn.classList.remove('disabled');
  opSubBtn.classList.add('selected');
  subtractionControls.style.display = 'block';
});
// show/hide subtraction decimal select only when decimal radio is selected
{
  const subRadios = document.getElementsByName('sub-diff');
  const subDecimalEl = document.getElementById('subtraction-decimal-places').parentElement;
  function updateSubDecimalVisibility(){
    let isDecimal = false; for(const r of subRadios) if(r.checked && r.value === '999.999') isDecimal = true;
    subDecimalEl.style.display = isDecimal ? 'block' : 'none';
  }
  subRadios.forEach(r=>r.addEventListener('change', updateSubDecimalVisibility));
  // initial state
  updateSubDecimalVisibility();
}
const divisorGroup = document.getElementById('divisor-group');
for(let i=1;i<=10;i++){
  const label = document.createElement('label');
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.value = i;
  cb.name = 'divisor';
  label.appendChild(cb);
  label.appendChild(document.createTextNode(i + ' divisor'));
  divisorGroup.appendChild(label);
}
divisorGroup.addEventListener('change', function(e){
  const checked = divisorGroup.querySelectorAll('input[type="checkbox"]:checked');
  if(checked.length>5){
    e.target.checked = false;
    alert('You can select up to 5 divisors only.');
  }
});
document.getElementById('op-div').addEventListener('click',()=>{
  divisionControls.style.display = 'block';
  multiplicationControls.style.display = 'none';
  scaleMultiplicationControls.style.display = 'none';
  scaleDivisionControls.style.display = 'none';
  additionControls.style.display = 'none';
  subtractionControls.style.display = 'none';
  document.getElementById('coming-soon-div').style.display='none';
  ['op-mult','op-add','op-sub','op-div','op-scale-mult','op-scale-div'].forEach(id=>document.getElementById(id).classList.remove('selected'));
  document.getElementById('op-div').classList.add('selected');
});

// --- Helpers ---
function getSelectedTables(){
  return Array.from(timesTableGroup.querySelectorAll('input[type="checkbox"]:checked')).map(cb=>parseInt(cb.value));
}
function getMonsterCount(){
  return parseInt(document.getElementById('monster-count').value);
}
function getScaleMonsterCount(){
  const el = document.getElementById('scale-monster-count');
  return el ? parseInt(el.value,10) : 10;
}

// generators
function generateProblems(tables, count) {
  let pool = [];
  tables.forEach(table => {
    for(let i=1;i<=12;i++) pool.push({x:table, y:i});
  });
  for(let i=pool.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count);
}
function generateDivisionProblems(divisors, count) {
  let pool = [];
  divisors.forEach(divisor => {
    for(let i=1;i<=9;i++) pool.push({x:divisor*i, y:divisor});
  });
  for(let i=pool.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count);
}
// generate problems for scale multiplication (×10, ×100, ×1000)
function generateScaleMultiplicationProblems(scales, count){
  // whole numbers should not exceed 1000
  const pool = [];
  for(let s of scales){
    for(let i=0;i<Math.ceil(count*2);i++){
      const whole = Math.floor(Math.random()*1001); // 0..1000
      pool.push({x: whole, y: parseInt(s,10)});
    }
  }
  // shuffle
  for(let i=pool.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count);
}
// multiples of 10/100/1000 × whole number (e.g., 30 × 7)
function generateScaleMultiplesTimesWhole(scales, count){
  const pool = [];
  for(let s of scales){
    for(let i=0;i<Math.ceil(count*2);i++){
      // multiple should be a single digit times the scale: 1..9
      const digit = Math.floor(Math.random()*9) + 1; // 1..9
      const multiple = digit * parseInt(s,10);
      // wholes may be larger here (allow up to 9999 to match examples like 9023)
      const whole = Math.floor(Math.random()*9999) + 1; // 1..9999
      pool.push({x: multiple, y: whole});
      // Note: stored as x=multiple, y=whole to follow other generators (x op y)
    }
  }
  for(let i=pool.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count);
}
// 10/100/1000 × decimals (e.g., 10 × 3.75)
function generateScaleTimesDecimals(scales, count, decimalPlaces){
  const pool = [];
  for(let s of scales){
    for(let i=0;i<Math.ceil(count*2);i++){
      // randomly pick decimal places 1..3 for each question
      const dp = Math.floor(Math.random()*3) + 1; // 1..3
      const factor = Math.pow(10, dp);
      // generate a decimal number in range 0.001 .. 9999.999 depending on dp; keep it reasonable (0..1000)
      const val = Math.round((Math.random()*1000) * factor) / factor;
      // store as x = scale (integer), y = val (decimal), and record decimalPlaces
      pool.push({x: parseInt(s,10), y: val, decimalPlaces: dp});
    }
  }
  for(let i=pool.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count);
}
// multiples × decimals (e.g., 30 × 3.5)
function generateScaleMultiplesTimesDecimals(scales, count){
  const pool = [];
  for(let s of scales){
    for(let i=0;i<Math.ceil(count*2);i++){
      // multiple should be a single-digit times the scale: 1..9
      const digit = Math.floor(Math.random()*9) + 1; // 1..9
      const multiple = digit * parseInt(s,10);
      // random decimal places 1..3
      const dp = Math.floor(Math.random()*3) + 1;
      const factor = Math.pow(10, dp);
      // allow decimal factor to be up to 9999.999
      const val = Math.round((Math.random()*9999) * factor) / factor;
      // store as x = multiple (integer), y = decimal value
      pool.push({x: multiple, y: val, decimalPlaces: dp});
    }
  }
  for(let i=pool.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count);
}
// generate division problems for scales: e.g. 120 ÷ 10, where dividend is whole*scale
function generateScaleDivisionProblems(scales, count){
  const pool = [];
  for(let s of scales){
    for(let i=0;i<Math.ceil(count*2);i++){
      const whole = Math.floor(Math.random()*1001); // 0..1000
      pool.push({x: whole * parseInt(s,10), y: parseInt(s,10)});
    }
  }
  for(let i=pool.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count);
}
// generate scale division variants
// 1) whole ÷ scale  -> ensure integer answers
function generateScaleWholeDivides(scales, count){
  const pool = [];
  for(let s of scales){
    for(let i=0;i<Math.ceil(count*2);i++){
      // pick a whole quotient up to 1000, then multiply by scale to make dividend
      const quotient = Math.floor(Math.random()*1001); // 0..1000
      const dividend = quotient * parseInt(s,10);
      pool.push({x: dividend, y: parseInt(s,10)});
    }
  }
  for(let i=pool.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count);
}
// 2) whole ÷ multiples of scale (e.g., 450 ÷ 50) -> ensure integer answers
function generateScaleWholeDividesByMultiples(scales, count){
  const pool = [];
  for(let s of scales){
    for(let i=0;i<Math.ceil(count*2);i++){
      const digit = Math.floor(Math.random()*9) + 1; // 1..9
      const multiple = digit * parseInt(s,10); // e.g., 50, 200, 3000
      // choose quotient up to 1000
      const quotient = Math.floor(Math.random()*1001); // 0..1000
      const dividend = quotient * multiple;
      pool.push({x: dividend, y: multiple});
    }
  }
  for(let i=pool.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count);
}
// 3) decimals and whole ÷ scale -> allow decimal answers up to 3 dp
function generateScaleDecimalsDividedByScale(scales, count){
  const pool = [];
  for(let s of scales){
    for(let i=0;i<Math.ceil(count*2);i++){
      // allow dividend to be whole or decimal; to produce quotient with <=3 dp, we'll pick
      // a numerator that is a multiple of (scale / 10^k) where k <=3
      const dp = Math.floor(Math.random()*4); // 0..3 decimal places for dividend
      const factor = Math.pow(10, dp);
      // choose a quotient up to 1000 with up to 3 dp
      const quotient = Math.round((Math.random()*1000) * Math.pow(10, Math.floor(Math.random()*3)))/Math.pow(10, Math.floor(Math.random()*3));
      // dividend = quotient * scale
      const dividend = Math.round(quotient * parseInt(s,10) * factor) / factor;
      pool.push({x: dividend, y: parseInt(s,10), decimalPlaces: Math.min(3, dp)});
    }
  }
  for(let i=pool.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count);
}
// 4) decimals and whole ÷ multiples of scale -> allow decimal answers up to 3 dp
function generateScaleDecimalsDividedByMultiples(scales, count){
  const pool = [];
  for(let s of scales){
    for(let i=0;i<Math.ceil(count*2);i++){
      const digit = Math.floor(Math.random()*9) + 1; // 1..9
      const multiple = digit * parseInt(s,10);
      const dp = Math.floor(Math.random()*4); // 0..3
      const factor = Math.pow(10, dp);
      const quotient = Math.round((Math.random()*1000) * Math.pow(10, Math.floor(Math.random()*3)))/Math.pow(10, Math.floor(Math.random()*3));
      const dividend = Math.round(quotient * multiple * factor) / factor;
      pool.push({x: dividend, y: multiple, decimalPlaces: Math.min(3, dp)});
    }
  }
  for(let i=pool.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count);
}
function generateAdditionProblems(maxValue, count){
  let pool = [];
  // support integer ranges or decimal-up-to-3 option (maxValue may be a float like 999.999)
  const isDecimalMode = String(maxValue).includes('.');
  // determine decimal places from the UI when in decimal mode
  const decimalPlacesEl = document.getElementById('addition-decimal-places');
  const defaultPlaces = 3;
  const places = decimalPlacesEl ? parseInt(decimalPlacesEl.value, 10) : defaultPlaces;
  for(let i=0;i<count*3;i++){
    if(isDecimalMode){
      // generate two numbers where each has a random decimal length between 1 and 'places'
      const max = parseFloat(maxValue);
      const ka = Math.floor(Math.random()*places) + 1; // 1..places
      const kb = Math.floor(Math.random()*places) + 1; // 1..places
      const factorA = Math.pow(10, ka);
      const factorB = Math.pow(10, kb);
      const a = Math.round(Math.random() * max * factorA) / factorA;
      const b = Math.round(Math.random() * max * factorB) / factorB;
      const probPlaces = Math.max(ka, kb);
      pool.push({x:a,y:b, decimalPlaces:probPlaces});
    } else {
      const a = Math.floor(Math.random()*(parseInt(maxValue)+1));
      const b = Math.floor(Math.random()*(parseInt(maxValue)+1));
      pool.push({x:a,y:b});
    }
  }
  for(let i=pool.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count);
}
function generateSubtractionProblems(maxValue, count){
  let pool = [];
  const isDecimalMode = String(maxValue).includes('.');
  // determine decimal places from UI when in decimal mode
  const decimalPlacesEl = document.getElementById('subtraction-decimal-places');
  const defaultPlaces = 3;
  const places = decimalPlacesEl ? parseInt(decimalPlacesEl.value, 10) : defaultPlaces;
  for(let i=0;i<count*3;i++){
    if(isDecimalMode){
      const max = parseFloat(maxValue);
      const factor = Math.pow(10, places);
      const a = Math.round(Math.random() * max * factor) / factor;
      const b = Math.round(Math.random() * max * factor) / factor;
      const x = Math.max(a,b); const y = Math.min(a,b);
      pool.push({x:x,y:y, decimalPlaces:places});
    } else {
      const a = Math.floor(Math.random()*(parseInt(maxValue)+1));
      const b = Math.floor(Math.random()*(parseInt(maxValue)+1));
      const x = Math.max(a,b); const y = Math.min(a,b);
      pool.push({x:x,y:y});
    }
  }
  for(let i=pool.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count);
}

// --- State ---
let problems = [], currentIdx = 0, attemptsLeft = 3, score = 0, errorFacts = {}, attemptedFacts = {};
let wrongExample = {};
let monster = null;
let gameMode = 'mult';

// --- Game flow ---
function startGame(){
  let mode = 'mult';
  if(scaleMultiplicationControls.style.display === 'block') mode = 'scale-mult';
  else if(scaleDivisionControls.style.display === 'block') mode = 'scale-div';
  else if(divisionControls.style.display === 'block') mode = 'div';
  else if(additionControls.style.display === 'block') mode = 'add';
  else if(subtractionControls.style.display === 'block') mode = 'sub';
  gameMode = mode;
  if(mode === 'mult'){
    const tables = getSelectedTables(); if(tables.length===0){ alert('Select at least one times table!'); return; }
    const count = getMonsterCount(); problems = generateProblems(tables, count);
  } else if(mode === 'scale-mult'){
    // By default test all three scales: 10, 100, 1000
    const scales = [10,100,1000];
    const count = getScaleMonsterCount();
    // read difficulty
    const sd = document.getElementsByName('scale-diff'); let scaleDiff = 'scale-whole'; for(const r of sd) if(r.checked) scaleDiff = r.value;
  if(scaleDiff === 'scale-whole') problems = generateScaleMultiplicationProblems(scales, count);
  else if(scaleDiff === 'scale-mults') problems = generateScaleMultiplesTimesWhole(scales, count);
  else if(scaleDiff === 'scale-dec') problems = generateScaleTimesDecimals(scales, count);
  else if(scaleDiff === 'scale-mult-dec') problems = generateScaleMultiplesTimesDecimals(scales, count);
  } else if(mode === 'scale-div'){
    const scales = [10,100,1000];
    const count = parseInt(document.getElementById('scale-div-monster-count') ? document.getElementById('scale-div-monster-count').value : 10,10);
    // read difficulty selection for scale division
    const sdd = document.getElementsByName('scale-div-diff'); let scaleDivDiff = 'scale-div-whole'; for(const r of sdd) if(r.checked) scaleDivDiff = r.value;
    if(scaleDivDiff === 'scale-div-whole') problems = generateScaleWholeDivides(scales, count);
    else if(scaleDivDiff === 'scale-div-mults') problems = generateScaleWholeDividesByMultiples(scales, count);
    else if(scaleDivDiff === 'scale-div-dec') problems = generateScaleDecimalsDividedByScale(scales, count);
    else if(scaleDivDiff === 'scale-div-mult-dec') problems = generateScaleDecimalsDividedByMultiples(scales, count);
  } else if(mode === 'div'){
    const divisors = Array.from(document.getElementById('divisor-group').querySelectorAll('input[type="checkbox"]:checked')).map(cb=>parseInt(cb.value));
    if(divisors.length===0){ alert('Select at least one divisor!'); return; }
    const count = parseInt(document.getElementById('division-monster-count').value);
    problems = generateDivisionProblems(divisors, count);
  } else if(mode === 'add'){
    const radios = document.getElementsByName('add-diff'); let maxVal = 100; for(const r of radios) if(r.checked) maxVal = parseFloat(r.value);
    const addCountEl = document.getElementById('addition-monster-count'); const count = addCountEl ? parseInt(addCountEl.value) : getMonsterCount();
    problems = generateAdditionProblems(maxVal, count);
  } else if(mode === 'sub'){
    const radios = document.getElementsByName('sub-diff'); let maxVal = 100; for(const r of radios) if(r.checked) maxVal = parseFloat(r.value);
    const subCountEl = document.getElementById('subtraction-monster-count'); const count = subCountEl ? parseInt(subCountEl.value) : getMonsterCount();
    problems = generateSubtractionProblems(maxVal, count);
  }
  currentIdx = 0; score = 0; errorFacts = {}; attemptedFacts = {}; wrongExample = {};
  startScreen.style.display = 'none'; gameScreen.style.display = '';
  nextQuestion();
}
document.getElementById('start-btn').addEventListener('click', startGame);

function nextQuestion(){
  if(currentIdx>=problems.length){ showResults(); return; }
  attemptsLeft = 3; monster = getRandomMonster(); const prob = problems[currentIdx];
  monsterNameEl.textContent = monster.name;
  monsterImgEl.innerHTML = monster.img;
  const operator = (gameMode === 'mult' || gameMode === 'scale-mult') ? '×' : ((gameMode === 'div' || gameMode === 'scale-div') ? '÷' : (gameMode === 'sub' ? '−' : '+'));
  // helper to format values according to problem precision
  const formatForProblem = (val, p) => {
    if(typeof val !== 'number') return String(val);
    // Only apply decimal padding when the value is not an integer.
    // This prevents showing scales like 10/100/1000 as 10.00/100.00/1000.00
    if(p && p.decimalPlaces && !Number.isInteger(val)){
      return val.toFixed(p.decimalPlaces);
    }
    return String(val);
  };
  questionArea.textContent = `${formatForProblem(prob.x, prob)} ${operator} ${formatForProblem(prob.y, prob)} = ?`;
  answerInput.value = ''; feedbackEl.textContent = '';
  monsterCounterEl.textContent = `Monster ${currentIdx+1} of ${problems.length}`;
  attemptsRemainingEl.textContent = `Attempts left: ${attemptsLeft}`; scoreTrackerEl.textContent = `Score: ${score}`;
  answerInput.focus();
  const factKey = (gameMode === 'mult' || gameMode === 'scale-mult') ? `${prob.x}×${prob.y}` : ((gameMode === 'div' || gameMode === 'scale-div') ? `${prob.x}÷${prob.y}` : (gameMode === 'sub' ? `${prob.x}-${prob.y}` : `${prob.x}+${prob.y}`));
  attemptedFacts[factKey] = (attemptedFacts[factKey]||0)+1;
}

function checkAnswer(){
  const prob = problems[currentIdx]; let correct;
  if(gameMode === 'mult' || gameMode === 'scale-mult') correct = prob.x * prob.y;
  else if(gameMode === 'div' || gameMode === 'scale-div') correct = prob.x / prob.y;
  else if(gameMode === 'sub') correct = prob.x - prob.y;
  else correct = prob.x + prob.y;
  // parse user answer: allow integer or float (for decimal addition mode)
  const raw = answerInput.value.trim();
  const userAns = raw === '' ? NaN : (raw.includes('.') ? parseFloat(raw) : parseInt(raw, 10));
  // determine epsilon based on decimal places (if present on problem)
  const eps = (prob && prob.decimalPlaces) ? Math.pow(10, -prob.decimalPlaces) / 2 : 1e-3;
  const nearlyEqual = (a,b,epsVal=eps)=> Math.abs(a-b) <= epsVal;
  if((typeof correct === 'number') && !isNaN(userAns) && (Number.isInteger(correct) ? userAns === correct : nearlyEqual(userAns, correct))){ score++; feedbackEl.textContent = 'Monster defeated!'; feedbackEl.style.color = '#3bb273';
    gameScreen.classList.add('monster-defeat'); setTimeout(()=>{ gameScreen.classList.remove('monster-defeat'); currentIdx++; nextQuestion(); },700);
  } else {
    attemptsLeft--;
    // format answers: when decimalPlaces is provided, show the minimal representation
    const formatAns = (val, p) => {
      if(p && typeof p.decimalPlaces === 'number'){
        // use toFixed for consistent rounding then trim unnecessary trailing zeros
        const fixed = Number(val).toFixed(p.decimalPlaces);
        // trim trailing zeros after decimal point, then remove trailing dot if any
        const trimmed = fixed.replace(/(\.\d*?[1-9])0+$/,'$1').replace(/\.0+$/,'').replace(/\.$/,'');
        return trimmed;
      }
      return Number.isInteger(val) ? String(val) : String(val);
    };
    feedbackEl.textContent = attemptsLeft>0 ? `Try again! (${attemptsLeft} attempts left)` : `Monster escapes! The correct answer was ${formatAns(correct, prob)}.`;
    feedbackEl.style.color = attemptsLeft>0 ? '#e94f37' : '#7c5e3c'; attemptsRemainingEl.textContent = `Attempts left: ${attemptsLeft}`;
  const factKey = (gameMode === 'mult' || gameMode === 'scale-mult') ? `${prob.x}×${prob.y}` : ((gameMode === 'div' || gameMode === 'scale-div') ? `${prob.x}÷${prob.y}` : (gameMode === 'sub' ? `${prob.x}-${prob.y}` : `${prob.x}+${prob.y}`));
    errorFacts[factKey] = (errorFacts[factKey]||0)+1;
  if(gameMode === 'add' || gameMode === 'sub'){ const parsed = raw.includes('.') ? parseFloat(raw) : parseInt(raw,10); if(!isNaN(parsed)) wrongExample[factKey] = parsed; }
    if(attemptsLeft<=0){ setTimeout(()=>{ currentIdx++; nextQuestion(); },900); } else { gameScreen.classList.add('shake'); setTimeout(()=>gameScreen.classList.remove('shake'),400); }
  }
}
submitBtn.addEventListener('click', checkAnswer);
answerInput.addEventListener('keydown', function(e){ if(e.key==='Enter') checkAnswer(); });

giveupBtn.addEventListener('click', function(){
  const prob = problems[currentIdx]; let correct;
  if(gameMode === 'mult' || gameMode === 'scale-mult') correct = prob.x * prob.y; else if(gameMode === 'div' || gameMode === 'scale-div') correct = prob.x / prob.y; else if(gameMode === 'sub') correct = prob.x - prob.y; else correct = prob.x + prob.y;
  // format correct answer according to precision if present
  const formatAns = (val, p) => {
    if(p && typeof p.decimalPlaces === 'number'){
      const fixed = Number(val).toFixed(p.decimalPlaces);
      const trimmed = fixed.replace(/(\.\d*?[1-9])0+$/,'$1').replace(/\.0+$/,'').replace(/\.$/,'');
      return trimmed;
    }
    return Number.isInteger(val) ? String(val) : String(val);
  };
  feedbackEl.textContent = `Monster escapes! The correct answer was ${formatAns(correct, prob)}.`; feedbackEl.style.color = '#7c5e3c';
  const factKey = (gameMode === 'mult' || gameMode === 'scale-mult') ? `${prob.x}×${prob.y}` : ((gameMode === 'div' || gameMode === 'scale-div') ? `${prob.x}÷${prob.y}` : (gameMode === 'sub' ? `${prob.x}-${prob.y}` : `${prob.x}+${prob.y}`));
  errorFacts[factKey] = (errorFacts[factKey]||0)+1; if(gameMode === 'add' || gameMode === 'sub') wrongExample[factKey] = correct;
  setTimeout(()=>{ currentIdx++; nextQuestion(); },900);
});

// --- Results & heuristics ---
function showResults(){
  gameScreen.style.display = 'none';
  // determine effective mode from recorded keys if possible
  let mode = gameMode;
  // normalize scale modes to base modes so results use correct labels
  if(mode === 'scale-mult') mode = 'mult';
  if(mode === 'scale-div') mode = 'div';
  const attemptedKeys = Object.keys(attemptedFacts || {});
  const errorKeys = Object.keys(errorFacts || {});
  const combined = attemptedKeys.concat(errorKeys);
  if(combined.length>0){
    // prefer multiplication/division indicators over +/- when mixed keys exist
    if(combined.some(k=>k.includes('×')||k.includes('*'))) mode = 'mult';
    else if(combined.some(k=>k.includes('÷')||k.includes('/'))) mode = 'div';
    else if(combined.some(k=>k.includes('+'))) mode = 'add';
    else if(combined.some(k=>k.includes('-'))) mode = 'sub';
  }
  let resultHtml = `<div class='container' style='background:#f5ecd6; border:4px solid #7c5e3c; box-shadow:0 0 0 8px #c2b280;'>`;
  resultHtml += `<h2 style='font-family:Cinzel,serif;color:#e94f37;'>Dungeon Results</h2>`;
  resultHtml += `<div style='font-size:1.3rem;color:#e94f37;font-weight:bold;text-shadow:1px 1px 0 #fff;'>Score: ${score} / ${problems.length} (${Math.round(score/problems.length*100)}%)</div>`;
  // breakdown
  let tableStats = {};
  problems.forEach(prob=>{
    let key;
    if(mode === 'mult') key = prob.x; else if(mode === 'div') key = prob.y; else if(mode === 'add') key = 'addition'; else if(mode === 'sub') key = 'subtraction'; else key='addition';
    if(!tableStats[key]) tableStats[key] = {total:0, missed:0}; tableStats[key].total++;
    const factKey = mode === 'mult' ? `${prob.x}×${prob.y}` : (mode === 'div' ? `${prob.x}÷${prob.y}` : (mode === 'sub' ? `${prob.x}-${prob.y}` : `${prob.x}+${prob.y}`));
    if(errorFacts[factKey]) tableStats[key].missed++;
  });
  let tableResults = [];
  const label = mode === 'mult' ? 'times table' : (mode === 'div' ? 'divisor' : (mode === 'sub' ? 'subtraction' : 'addition'));
  Object.keys(tableStats).sort((a,b)=>{ const na = isNaN(parseInt(a))?a:parseInt(a); const nb = isNaN(parseInt(b))?b:parseInt(b); if(typeof na === 'number' && typeof nb === 'number') return na-nb; return (''+na).localeCompare(''+nb); }).forEach(k=>{
    const correct = tableStats[k].total - tableStats[k].missed; const percent = Math.round(correct/tableStats[k].total*100);
    let displayTitle; if(mode === 'mult' || mode === 'div') displayTitle = `${k} ${label}`; else displayTitle = label.charAt(0).toUpperCase()+label.slice(1);
    tableResults.push(`<strong>${displayTitle}:</strong> ${correct}/${tableStats[k].total} correct (${percent}%)`);
  });
  const sectionTitle = mode === 'mult' ? 'Score by Times Table' : (mode === 'div' ? 'Score by Divisor' : (mode === 'sub' ? 'Subtraction Summary' : 'Score Summary'));
  resultHtml += `<div style='margin-top:1em;'><strong style='color:#3bb273;'>${sectionTitle}:</strong><ul>`;
  tableResults.forEach(s=>{ resultHtml+=`<li style='color:#3bb273;font-weight:bold;'>${s}</li>`; }); resultHtml += `</ul></div>`;

  // suggestions
  let errorTables = {};
  Object.keys(errorFacts).forEach(fact=>{
    const operator = mode === 'mult' ? '×' : (mode === 'div' ? '÷' : (mode === 'sub' ? '-' : '+'));
    const parts = fact.split(operator); let key;
    if(mode === 'mult') key = parseInt(parts[0]); else if(mode === 'div') key = parseInt(parts[1]); else if(mode === 'add') key='addition'; else if(mode === 'sub') key='subtraction'; else key='addition';
    errorTables[key] = (errorTables[key]||0)+errorFacts[fact];
  });
  let suggestions = [];
  const skillType = mode === 'mult' ? 'times table' : (mode === 'div' ? 'division' : (mode === 'sub' ? 'subtraction' : 'addition'));
  Object.keys(errorTables).sort((a,b)=>errorTables[b]-errorTables[a]).forEach(x=>{
    if(errorTables[x]>1){
      let feedbackPhrases = [];
      if(mode === 'add'){
        feedbackPhrases = [
          `Work on regrouping when adding larger ${skillType} to speed up your answers.`,
          `Practice calculating the ${skillType} carefully to avoid place-value mistakes.`,
          `Sharpen your ${skillType} strategies (regrouping, column addition) to slay more monsters!`,
          `Focus on column addition technique for ${skillType} to improve accuracy.`
        ];
        const regroupingDetected = Object.keys(wrongExample).some(factKey=>{
          if(!factKey.includes('+')) return false; const parts = factKey.split('+'); const a = parseInt(parts[0]); const b = parseInt(parts[1]); const correct = a+b; const user = wrongExample[factKey]; if(typeof user !== 'number' || isNaN(user)) return false;
          let aa = String(Math.abs(a)).split('').reverse(); let bb = String(Math.abs(b)).split('').reverse(); const maxLen = Math.max(aa.length, bb.length); let withoutCarry = [];
          for(let i=0;i<maxLen;i++){ const da = parseInt(aa[i]||'0'); const db = parseInt(bb[i]||'0'); withoutCarry.push((da+db)%10); }
          const userStr = String(Math.abs(user)).split('').reverse(); let matches = 0; for(let i=0;i<withoutCarry.length;i++){ const ud = parseInt(userStr[i]||'0'); if(ud === withoutCarry[i]) matches++; }
          return matches >= 2 && String(correct) !== String(user);
        });
        if(regroupingDetected) feedbackPhrases.unshift('We detected likely regrouping (carry) errors in some addition mistakes — practice column addition and carrying.');
      } else if(mode === 'sub'){
        feedbackPhrases = [
          `Work on column subtraction and borrowing when solving ${skillType} problems.`,
          `Practice borrowing across zeros and place-value columns to avoid common mistakes.`,
          `Use column subtraction (right-to-left) and check for necessary borrows to defeat more monsters!`,
          `Review subtraction strategies (borrowing, regrouping) for more accurate answers.`
        ];
        const borrowingDetected = Object.keys(wrongExample).some(factKey=>{
          if(!factKey.includes('-')) return false; const parts = factKey.split('-'); const a = parseInt(parts[0]); const b = parseInt(parts[1]); const correct = a-b; const user = wrongExample[factKey]; if(typeof user !== 'number' || isNaN(user)) return false;
          let aa = String(Math.abs(a)).split('').reverse(); let bb = String(Math.abs(b)).split('').reverse(); const maxLen = Math.max(aa.length, bb.length); let withoutBorrow = [];
          for(let i=0;i<maxLen;i++){ const da = parseInt(aa[i]||'0'); const db = parseInt(bb[i]||'0'); withoutBorrow.push(((da - db) + 10) % 10); }
          const userStr = String(Math.abs(user)).split('').reverse(); let matches = 0; for(let i=0;i<withoutBorrow.length;i++){ const ud = parseInt(userStr[i]||'0'); if(ud === withoutBorrow[i]) matches++; }
          return matches >= 2 && String(correct) !== String(user);
        });
        if(borrowingDetected) feedbackPhrases.unshift('We detected likely borrowing (missing-borrow) errors in some subtraction mistakes — practice column subtraction and borrowing.');
      } else {
        feedbackPhrases = [
          `Sharpen your ${x} ${skillType} skills to slay more monsters!`,
          `Hone your ${x} ${skillType} mastery to defeat tougher foes!`,
          `Practice your ${x} ${skillType} to conquer the dungeon depths!`,
          `Master the ${x} ${skillType} to vanquish the mathematical beasts!`,
          `Strengthen your ${x} ${skillType} knowledge to emerge victorious!`,
          `Train harder with ${x} ${skillType} problems to level up your skills!`,
          `Focus on ${x} ${skillType} to become an unstoppable warrior!`,
          `Conquer the ${x} ${skillType} challenges to claim your victory!`
        ];
      }
      const randomPhrase = feedbackPhrases[Math.floor(Math.random()*feedbackPhrases.length)]; suggestions.push(randomPhrase);
    }
  });
  if(suggestions.length===0) suggestions.push('Great job! No major weaknesses detected.');
  resultHtml += `<div style='margin-top:1em;'><strong style='color:#e94f37;'>Practice Suggestions:</strong><ul>`;
  suggestions.forEach(s=>{ resultHtml += `<li style='color:#e94f37;font-weight:bold;'>${s}</li>`; }); resultHtml += `</ul></div>`;
  resultHtml += `<button class='start-btn' id='play-again-btn'>Play Again</button>`;
  resultHtml += `<div class='footer'>&copy; Nicholas Tan</div></div>`;
  document.body.innerHTML = resultHtml;
  document.getElementById('play-again-btn').onclick = ()=>location.reload();
}

// --- Quick tests ---
function runQuickTests(){
  const testMode = document.getElementById('op-scale-mult').classList.contains('selected') ? 'scale-mult'
                 : (document.getElementById('op-scale-div').classList.contains('selected') ? 'scale-div'
                 : (document.getElementById('op-add').classList.contains('selected') ? 'add'
                 : (document.getElementById('op-sub').classList.contains('selected') ? 'sub'
                 : (document.getElementById('op-div').classList.contains('selected') ? 'div' : 'mult'))));
  gameMode = testMode;
  let problemsToUse = [];
  if(gameMode === 'mult'){
    const tables = getSelectedTables(); const useTables = tables.length ? tables.slice(0,2) : [2,3]; problemsToUse = generateProblems(useTables, 6);
  } else if(gameMode === 'scale-mult'){
    const scales = [10,100,1000];
  const sd = document.getElementsByName('scale-diff'); let scaleDiff = 'scale-whole'; for(const r of sd) if(r.checked) scaleDiff = r.value;
  if(scaleDiff === 'scale-whole') problemsToUse = generateScaleMultiplicationProblems(scales, 6);
  else if(scaleDiff === 'scale-mults') problemsToUse = generateScaleMultiplesTimesWhole(scales, 6);
  else if(scaleDiff === 'scale-dec') problemsToUse = generateScaleTimesDecimals(scales, 6);
  else problemsToUse = generateScaleMultiplesTimesDecimals(scales, 6);
  } else if(gameMode === 'scale-div'){
    const scales = [10,100,1000];
    const sdd = document.getElementsByName('scale-div-diff'); let scaleDivDiff = 'scale-div-whole'; for(const r of sdd) if(r.checked) scaleDivDiff = r.value;
    if(scaleDivDiff === 'scale-div-whole') problemsToUse = generateScaleWholeDivides(scales, 6);
    else if(scaleDivDiff === 'scale-div-mults') problemsToUse = generateScaleWholeDividesByMultiples(scales, 6);
    else if(scaleDivDiff === 'scale-div-dec') problemsToUse = generateScaleDecimalsDividedByScale(scales, 6);
    else problemsToUse = generateScaleDecimalsDividedByMultiples(scales, 6);
  } else if(gameMode === 'div'){
    const divisors = Array.from(document.getElementById('divisor-group').querySelectorAll('input[type="checkbox"]:checked')).map(cb=>parseInt(cb.value)); const useDivs = divisors.length ? divisors.slice(0,2) : [3,4]; problemsToUse = generateDivisionProblems(useDivs, 6);
  } else {
    let maxVal = 100;
  if(gameMode === 'add'){ const radios = document.getElementsByName('add-diff'); for(const r of radios) if(r.checked) maxVal = parseFloat(r.value); problemsToUse = generateAdditionProblems(maxVal, 6); }
  else { const radios = document.getElementsByName('sub-diff'); for(const r of radios) if(r.checked) maxVal = parseFloat(r.value); problemsToUse = generateSubtractionProblems(maxVal, 6); }
  }
  problems = problemsToUse; currentIdx = 0; score = 0; errorFacts = {}; attemptedFacts = {}; startScreen.style.display='none'; gameScreen.style.display='';
  for(let i=0;i<problems.length;i++){
    const prob = problems[i]; let correct; let factKey;
    if(gameMode === 'mult' || gameMode === 'scale-mult'){ correct = prob.x * prob.y; factKey = `${prob.x}×${prob.y}`; }
    else if(gameMode === 'div' || gameMode === 'scale-div'){ correct = prob.x / prob.y; factKey = `${prob.x}÷${prob.y}`; }
    else if(gameMode === 'add'){ correct = prob.x + prob.y; factKey = `${prob.x}+${prob.y}`; }
    else { correct = prob.x - prob.y; factKey = `${prob.x}-${prob.y}`; }
    const giveWrong = (i%2===0);
    if(giveWrong){ errorFacts[factKey] = (errorFacts[factKey]||0)+1; if(gameMode === 'add' || gameMode === 'sub'){
        if(prob.decimalPlaces){ wrongExample[factKey] = Math.max(0, Math.round((correct - 10) * Math.pow(10, prob.decimalPlaces)) / Math.pow(10, prob.decimalPlaces)); }
        else { wrongExample[factKey] = Math.max(0, correct-10); }
      }
    }
    else score++; currentIdx = i+1;
  }
  showResults(); document.getElementById('test-results').innerHTML = 'Simulation complete — results shown.';
}
document.getElementById('run-tests-btn').addEventListener('click', runQuickTests);
