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

// operation buttons behavior
document.getElementById('op-mult').addEventListener('click',()=>{
  multiplicationControls.style.display = 'block';
  divisionControls.style.display = 'none';
  additionControls.style.display = 'none';
  subtractionControls.style.display = 'none';
  document.getElementById('op-mult').classList.add('selected');
  document.getElementById('op-add').classList.remove('selected');
  document.getElementById('op-sub').classList.remove('selected');
  document.getElementById('op-div').classList.remove('selected');
});
document.getElementById('op-add').addEventListener('click',()=>{
  multiplicationControls.style.display = 'none';
  divisionControls.style.display = 'none';
  subtractionControls.style.display = 'none';
  document.getElementById('coming-soon-add').style.display='none';
  document.getElementById('op-mult').classList.remove('selected');
  const opAddBtn = document.getElementById('op-add');
  opAddBtn.classList.remove('disabled');
  opAddBtn.classList.add('selected');
  document.getElementById('op-sub').classList.remove('selected');
  document.getElementById('op-div').classList.remove('selected');
  additionControls.style.display = 'block';
});
document.getElementById('op-sub').addEventListener('click',()=>{
  multiplicationControls.style.display = 'none';
  additionControls.style.display = 'none';
  divisionControls.style.display = 'none';
  document.getElementById('coming-soon-sub').style.display='none';
  document.getElementById('op-mult').classList.remove('selected');
  const opSubBtn = document.getElementById('op-sub');
  opSubBtn.classList.remove('disabled');
  opSubBtn.classList.add('selected');
  const opAddBtn2 = document.getElementById('op-add');
  opAddBtn2.classList.remove('selected');
  document.getElementById('op-div').classList.remove('selected');
  subtractionControls.style.display = 'block';
});
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
  additionControls.style.display = 'none';
  subtractionControls.style.display = 'none';
  document.getElementById('coming-soon-div').style.display='none';
  document.getElementById('op-mult').classList.remove('selected');
  document.getElementById('op-add').classList.remove('selected');
  document.getElementById('op-sub').classList.remove('selected');
  document.getElementById('op-div').classList.add('selected');
});

// --- Helpers ---
function getSelectedTables(){
  return Array.from(timesTableGroup.querySelectorAll('input[type="checkbox"]:checked')).map(cb=>parseInt(cb.value));
}
function getMonsterCount(){
  return parseInt(document.getElementById('monster-count').value);
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
function generateAdditionProblems(maxValue, count){
  let pool = [];
  for(let i=0;i<count*3;i++){
    const a = Math.floor(Math.random()*(maxValue+1));
    const b = Math.floor(Math.random()*(maxValue+1));
    pool.push({x:a,y:b});
  }
  for(let i=pool.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count);
}
function generateSubtractionProblems(maxValue, count){
  let pool = [];
  for(let i=0;i<count*3;i++){
    const a = Math.floor(Math.random()*(maxValue+1));
    const b = Math.floor(Math.random()*(maxValue+1));
    const x = Math.max(a,b); const y = Math.min(a,b);
    pool.push({x:x,y:y});
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
  if(divisionControls.style.display === 'block') mode = 'div';
  if(additionControls.style.display === 'block') mode = 'add';
  if(subtractionControls.style.display === 'block') mode = 'sub';
  gameMode = mode;
  if(mode === 'mult'){
    const tables = getSelectedTables(); if(tables.length===0){ alert('Select at least one times table!'); return; }
    const count = getMonsterCount(); problems = generateProblems(tables, count);
  } else if(mode === 'div'){
    const divisors = Array.from(document.getElementById('divisor-group').querySelectorAll('input[type="checkbox"]:checked')).map(cb=>parseInt(cb.value));
    if(divisors.length===0){ alert('Select at least one divisor!'); return; }
    const count = parseInt(document.getElementById('division-monster-count').value);
    problems = generateDivisionProblems(divisors, count);
  } else if(mode === 'add'){
    const radios = document.getElementsByName('add-diff'); let maxVal = 100; for(const r of radios) if(r.checked) maxVal = parseInt(r.value);
    const addCountEl = document.getElementById('addition-monster-count'); const count = addCountEl ? parseInt(addCountEl.value) : getMonsterCount();
    problems = generateAdditionProblems(maxVal, count);
  } else if(mode === 'sub'){
    const radios = document.getElementsByName('sub-diff'); let maxVal = 100; for(const r of radios) if(r.checked) maxVal = parseInt(r.value);
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
  const operator = gameMode === 'mult' ? '×' : (gameMode === 'div' ? '÷' : (gameMode === 'sub' ? '−' : '+'));
  questionArea.textContent = `${prob.x} ${operator} ${prob.y} = ?`;
  answerInput.value = ''; feedbackEl.textContent = '';
  monsterCounterEl.textContent = `Monster ${currentIdx+1} of ${problems.length}`;
  attemptsRemainingEl.textContent = `Attempts left: ${attemptsLeft}`; scoreTrackerEl.textContent = `Score: ${score}`;
  answerInput.focus();
  const factKey = gameMode === 'mult' ? `${prob.x}×${prob.y}` : (gameMode === 'div' ? `${prob.x}÷${prob.y}` : (gameMode === 'sub' ? `${prob.x}-${prob.y}` : `${prob.x}+${prob.y}`));
  attemptedFacts[factKey] = (attemptedFacts[factKey]||0)+1;
}

function checkAnswer(){
  const prob = problems[currentIdx]; let correct;
  if(gameMode === 'mult') correct = prob.x * prob.y;
  else if(gameMode === 'div') correct = prob.x / prob.y;
  else if(gameMode === 'sub') correct = prob.x - prob.y;
  else correct = prob.x + prob.y;
  const userAns = parseInt(answerInput.value);
  if(userAns===correct){ score++; feedbackEl.textContent = 'Monster defeated!'; feedbackEl.style.color = '#3bb273';
    gameScreen.classList.add('monster-defeat'); setTimeout(()=>{ gameScreen.classList.remove('monster-defeat'); currentIdx++; nextQuestion(); },700);
  } else {
    attemptsLeft--; feedbackEl.textContent = attemptsLeft>0 ? `Try again! (${attemptsLeft} attempts left)` : `Monster escapes! The correct answer was ${correct}.`;
    feedbackEl.style.color = attemptsLeft>0 ? '#e94f37' : '#7c5e3c'; attemptsRemainingEl.textContent = `Attempts left: ${attemptsLeft}`;
    const factKey = gameMode === 'mult' ? `${prob.x}×${prob.y}` : (gameMode === 'div' ? `${prob.x}÷${prob.y}` : (gameMode === 'sub' ? `${prob.x}-${prob.y}` : `${prob.x}+${prob.y}`));
    errorFacts[factKey] = (errorFacts[factKey]||0)+1;
    if(gameMode === 'add' || gameMode === 'sub'){ const parsed = parseInt(answerInput.value); if(!isNaN(parsed)) wrongExample[factKey] = parsed; }
    if(attemptsLeft<=0){ setTimeout(()=>{ currentIdx++; nextQuestion(); },900); } else { gameScreen.classList.add('shake'); setTimeout(()=>gameScreen.classList.remove('shake'),400); }
  }
}
submitBtn.addEventListener('click', checkAnswer);
answerInput.addEventListener('keydown', function(e){ if(e.key==='Enter') checkAnswer(); });

giveupBtn.addEventListener('click', function(){
  const prob = problems[currentIdx]; let correct;
  if(gameMode === 'mult') correct = prob.x * prob.y; else if(gameMode === 'div') correct = prob.x / prob.y; else if(gameMode === 'sub') correct = prob.x - prob.y; else correct = prob.x + prob.y;
  feedbackEl.textContent = `Monster escapes! The correct answer was ${correct}.`; feedbackEl.style.color = '#7c5e3c';
  const factKey = gameMode === 'mult' ? `${prob.x}×${prob.y}` : (gameMode === 'div' ? `${prob.x}÷${prob.y}` : (gameMode === 'sub' ? `${prob.x}-${prob.y}` : `${prob.x}+${prob.y}`));
  errorFacts[factKey] = (errorFacts[factKey]||0)+1; if(gameMode === 'add' || gameMode === 'sub') wrongExample[factKey] = correct;
  setTimeout(()=>{ currentIdx++; nextQuestion(); },900);
});

// --- Results & heuristics ---
function showResults(){
  gameScreen.style.display = 'none';
  // determine effective mode from recorded keys if possible
  let mode = gameMode;
  const attemptedKeys = Object.keys(attemptedFacts || {});
  const errorKeys = Object.keys(errorFacts || {});
  const combined = attemptedKeys.concat(errorKeys);
  if(combined.length>0){
    if(combined.some(k=>k.includes('-'))) mode = 'sub';
    else if(combined.some(k=>k.includes('+'))) mode = 'add';
    else if(combined.some(k=>k.includes('÷')||k.includes('/'))) mode = 'div';
    else if(combined.some(k=>k.includes('×')||k.includes('*'))) mode = 'mult';
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
  const testMode = document.getElementById('op-add').classList.contains('selected') ? 'add'
                 : (document.getElementById('op-sub').classList.contains('selected') ? 'sub'
                 : (document.getElementById('op-div').classList.contains('selected') ? 'div' : 'mult'));
  gameMode = testMode;
  let problemsToUse = [];
  if(gameMode === 'mult'){
    const tables = getSelectedTables(); const useTables = tables.length ? tables.slice(0,2) : [2,3]; problemsToUse = generateProblems(useTables, 6);
  } else if(gameMode === 'div'){
    const divisors = Array.from(document.getElementById('divisor-group').querySelectorAll('input[type="checkbox"]:checked')).map(cb=>parseInt(cb.value)); const useDivs = divisors.length ? divisors.slice(0,2) : [3,4]; problemsToUse = generateDivisionProblems(useDivs, 6);
  } else {
    let maxVal = 100;
    if(gameMode === 'add'){ const radios = document.getElementsByName('add-diff'); for(const r of radios) if(r.checked) maxVal = parseInt(r.value); problemsToUse = generateAdditionProblems(maxVal, 6); }
    else { const radios = document.getElementsByName('sub-diff'); for(const r of radios) if(r.checked) maxVal = parseInt(r.value); problemsToUse = generateSubtractionProblems(maxVal, 6); }
  }
  problems = problemsToUse; currentIdx = 0; score = 0; errorFacts = {}; attemptedFacts = {}; startScreen.style.display='none'; gameScreen.style.display='';
  for(let i=0;i<problems.length;i++){
    const prob = problems[i]; let correct; let factKey;
    if(gameMode === 'mult'){ correct = prob.x * prob.y; factKey = `${prob.x}×${prob.y}`; }
    else if(gameMode === 'div'){ correct = prob.x / prob.y; factKey = `${prob.x}÷${prob.y}`; }
    else if(gameMode === 'add'){ correct = prob.x + prob.y; factKey = `${prob.x}+${prob.y}`; }
    else { correct = prob.x - prob.y; factKey = `${prob.x}-${prob.y}`; }
    const giveWrong = (i%2===0);
    if(giveWrong){ errorFacts[factKey] = (errorFacts[factKey]||0)+1; if(gameMode === 'add' || gameMode === 'sub') wrongExample[factKey]=Math.max(0, correct-10); }
    else score++; currentIdx = i+1;
  }
  showResults(); document.getElementById('test-results').innerHTML = 'Simulation complete — results shown.';
}
document.getElementById('run-tests-btn').addEventListener('click', runQuickTests);
