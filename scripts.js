/* ------------- Global helpers ------------- */
const levels = [...document.querySelectorAll('.level')];
let currentLevel = 0;
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const scoreDisplay = document.getElementById('scoreDisplay');
const progressBar = document.getElementById('progressBar');
const toast = document.getElementById('toast');
const engineAudio = document.getElementById('engineAudio');
const beepAudio   = document.getElementById('beepAudio');
let score = 0;
function updateScore(delta){ score += delta; scoreDisplay.textContent = `Score: ${score}`; }
function showToast(msg){ toast.textContent = msg; toast.classList.remove('hidden'); toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),2000); }
function updateHUD(){ progressBar.style.width = ((currentLevel)/(levels.length-1))*100 + '%'; }


function updateLevelDisplay() {
  levels.forEach((lvl, idx) => lvl.classList.toggle('active', idx === currentLevel));
  prevBtn.style.display = currentLevel === 0 ? 'none' : 'inline-block';
  nextBtn.style.display = currentLevel === levels.length - 1 ? 'none' : 'inline-block';
  updateHUD();
  // Pause Level 2 video if we leave that level
  const vid = document.getElementById('mcqueenVideo');
  if(vid && typeof vid.pause === 'function' && currentLevel !== 1){ vid.pause(); vid.currentTime = 0; }
}
prevBtn.addEventListener('click', () => { currentLevel = Math.max(0, currentLevel - 1); updateLevelDisplay(); });
nextBtn.addEventListener('click', () => { currentLevel = Math.min(levels.length - 1, currentLevel + 1); updateLevelDisplay(); });
updateLevelDisplay();

/* ------------- Level 1 ------------- */
const startRaceBtn = document.getElementById('startRaceBtn');
const carBtns = [...document.querySelectorAll('.car-btn')];
carBtns.forEach(btn=>btn.addEventListener('click',()=>{
  carBtns.forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
}));
const raceTrack = document.getElementById('raceTrack');
const raceCars = [...document.querySelectorAll('.race-car')];
const raceResult = document.getElementById('raceResult');
const checkLevel1 = document.getElementById('checkLevel1');
const cheerAudio = document.getElementById('cheerAudio');

startRaceBtn?.addEventListener('click', () => {
  engineAudio.currentTime = 0;
  engineAudio.play();
  raceTrack.classList.remove('hidden');
  // reset positions
  raceCars.forEach(c=>{c.style.left='0px';});
  // shuffle car elements for random finish order
  const shuffled=[...raceCars].sort(()=>Math.random()-0.5);
  shuffled.forEach((car, idx) => {
    car.dataset.rank = idx + 1; // 1 = 1st place, etc.
    const lane = document.getElementById(`lane-${car.dataset.colour}`);
    lane.appendChild(car);
    const finishPx = 380 - idx*40; // furthest car (rank1) moves farthest
    setTimeout(() => { car.style.left = finishPx + 'px'; }, 200);
  });
  // Wait for animation then show selects
  setTimeout(() => { raceResult.classList.remove('hidden'); }, 2000);
});

checkLevel1?.addEventListener('click', () => {
  const first = document.getElementById('firstSelect').value;
  const second = document.getElementById('secondSelect').value;
  const third = document.getElementById('thirdSelect').value;
  if (!first || !second || !third) { showToast('Please fill all answers'); return; }
  // find correct answers
  const correct = raceCars.sort((a, b) => a.dataset.rank - b.dataset.rank).map(c => c.dataset.colour);
  const user = [first, second, third];
  if (correct.join() === user.join()) {
    beepAudio.play(); updateScore(10); showToast('Great job!'); engineAudio.pause();
    cheerAudio.play();
    currentLevel++; updateLevelDisplay();
  } else {
    showToast('Try again!');
  }
});

/* ------------- Level 2 ------------- */
const mcqueenVideo = document.getElementById('mcqueenVideo');
const snapshotArea = document.getElementById('snapshotArea');
const snapshotQuestion = document.getElementById('snapshotQuestion');
const nextSnapshotBtn = document.getElementById('nextSnapshot');
let snapshotIdx = 0;
const snapshots = [
  { ask: '1st', correct: 0 },
  { ask: '2nd', correct: 1 },
  { ask: '3rd', correct: 2 }
];
nextSnapshotBtn?.addEventListener('click', () => showSnapshot());
function showSnapshot() {
  if (snapshotIdx >= snapshots.length) { beepAudio.play(); updateScore(10); showToast('Level 2 complete! +10'); currentLevel++; updateLevelDisplay(); return; }
  const snap = snapshots[snapshotIdx];
  snapshotQuestion.textContent = snap.ask;
  snapshotArea.classList.remove('hidden');
  snapshotArea.innerHTML = '';
  const order = ['orange', 'green', 'blue'].sort(() => Math.random() - 0.5);
  order.forEach((col, idx) => {
    const img = document.createElement('img');
    img.src = `https://dummyimage.com/120x60/${col}/fff&text=${idx+1}`;
    img.dataset.idx = idx;
    img.addEventListener('click', () => {
      if (idx === snap.correct) { beepAudio.play(); updateScore(5); showToast('Correct!'); snapshotIdx++; showSnapshot(); }
      else { showToast('Oops, not quite!'); }
    });
    snapshotArea.appendChild(img);
  });
  nextSnapshotBtn.classList.add('hidden');
}
// Show Next Snapshot button when the video ends (HTML5) or after a fallback timeout (iframe/YT)
if(mcqueenVideo){
  if(typeof mcqueenVideo.addEventListener === 'function'){
    mcqueenVideo.addEventListener('ended', () => { nextSnapshotBtn.classList.remove('hidden'); });
  }
  // Fallback for iframe (YouTube embeds do not emit 'ended' on the element)
  setTimeout(()=>{ nextSnapshotBtn.classList.remove('hidden'); }, 30000); // 30-sec fallback
}

/* ------------- Level 3 ------------- */
const cars = [...document.querySelectorAll('.park-car')];
const slots = [...document.querySelectorAll('.parking-slot')];
let dragged = null;
cars.forEach(car => {
  car.addEventListener('dragstart', e => { dragged = car; });
});
slots.forEach(slot => {
  slot.addEventListener('dragover', e => { e.preventDefault(); });
  slot.addEventListener('drop', () => {
    if (slot.children.length === 0) slot.appendChild(dragged);
  });
});
const checkParking = document.getElementById('checkParking');
checkParking?.addEventListener('click', () => {
  const correct = slots.every((slot, idx) => {
    if (slot.children.length === 0) return false;
    return slot.children[0].dataset.num == idx + 1;
  });
  if (correct) { beepAudio.play(); updateScore(10); showToast('Perfect parking!'); currentLevel++; updateLevelDisplay(); }
  else { showToast('Try again – remember ordinal numbers! The 3rd car goes here…'); }
});

/* ------------- Level 4 ------------- */
const lights = document.querySelectorAll('.light');
const playerCar = document.getElementById('playerCar');
const redCountInfo = document.getElementById('redCountInfo');
let redCount = 0, lightIdx = 0;
function changeLight() {
  const sequence = ['green','yellow','red'];
  lights.forEach(l => l.classList.remove('active'));
  const colour = sequence[lightIdx];
  document.querySelector(`.light.${colour}`)?.classList.add('active');
  if (colour === 'red') {
    redCount++;
    redCountInfo.textContent = `Red light appeared ${redCount} time(s)`;
  }
  lightIdx = (lightIdx + 1) % sequence.length;
}
setInterval(changeLight, 3000);
let pos = 0;
window.addEventListener('keydown', e => {
  if (currentLevel !== 3) return; // level 4 index = 3
  const activeRed = document.querySelector('.red.active');
  if (e.code === 'ArrowRight' && !activeRed) {
    pos += 10; playerCar.style.left = pos + 'px';
    if (pos > 350) { beepAudio.play(); updateScore(10); showToast('You finished the road!'); currentLevel++; updateLevelDisplay(); }
  }
  if (e.code === 'Space') {
    // stop – no effect
  }
});

/* ------------- Level 5 ------------- */
const calendar = document.getElementById('calendar');
const calendarPuzzle = document.getElementById('calendarPuzzle');
const days = 10;
const calendarIcons = [...document.querySelectorAll('.cal-icon')];
calendarIcons.forEach(icon => icon.addEventListener('dragstart', () => { dragged = icon; }));
function checkCalendarPuzzle(){
  // success when the 4th day has at least one bus icon
  const fourth=document.querySelector('.calendar-day[data-day="4"]');
  if(fourth && [...fourth.querySelectorAll('[data-type="bus"]')].length>0){
    beepAudio.play(); updateScore(15); showToast('Calendar solved! +15'); currentLevel++; updateLevelDisplay();
  }
}

for (let i = 1; i <= days; i++) {
  const dayDiv = document.createElement('div');
  dayDiv.className = 'calendar-day';
  dayDiv.dataset.day = i;
  dayDiv.innerHTML = `<span>${i}${ordinalSuffix(i)}</span>`;
  dayDiv.addEventListener('dragover', e => e.preventDefault());
  dayDiv.addEventListener('drop', () => {
    if(!dragged) return;
    if (dayDiv.children.length < 2) dayDiv.appendChild(dragged.cloneNode(true));
    checkCalendarPuzzle();
  });
  calendar.appendChild(dayDiv);
}
function ordinalSuffix(n) {
  return n + (n%10===1 && n%100!==11 ? 'st' : n%10===2 && n%100!==12 ? 'nd' : n%10===3 && n%100!==13 ? 'rd' : 'th');
}
calendarPuzzle.textContent = 'Puzzle: Mark the 4th day of using public transport.';

/* Final celebration */
const certificate = document.getElementById('certificate');
const downloadCert = document.getElementById('downloadCert');
function showCertificate() {
  certificate.classList.remove('hidden');
  certificate.innerHTML = `<h3>Congratulations!</h3><p>You\'ve mastered ordinal numbers!</p>`;
  downloadCert.classList.remove('hidden');
}
levels[5]?.addEventListener('show', showCertificate);

// monitor level changes for certificate
setInterval(() => { if (currentLevel === 5 && certificate.classList.contains('hidden')) showCertificate(); }, 1000);

downloadCert?.addEventListener('click', () => {
  // simple print download
  window.print();
});

// ---------- Enhance select inputs with modern button choices ----------
function buildSelectButtons(){
  document.querySelectorAll('.ordinal-select').forEach(sel=>{
    if(sel.dataset.enhanced) return;
    sel.dataset.enhanced='1';
    const group=document.createElement('div');
    group.className='select-buttons';
    group.dataset.target=sel.id;
    [...sel.options].forEach(opt=>{
      if(!opt.value) return; // skip placeholder
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='choice-btn';
      btn.dataset.value=opt.value;
      if(['orange','green','blue'].includes(opt.value)){
        const img=document.createElement('img');
        img.src=`assets/car_${opt.value}.svg`;
        img.alt=opt.textContent;
        img.width=60;
        btn.appendChild(img);
      } else {
        btn.textContent=opt.textContent;
      }
      btn.addEventListener('click',()=>{
        sel.value=opt.value;
        group.querySelectorAll('.choice-btn').forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');
      });
      group.appendChild(btn);
    });
    sel.parentNode.insertBefore(group, sel.nextSibling);
  });
}

buildSelectButtons();
