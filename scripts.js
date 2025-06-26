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
}
prevBtn.addEventListener('click', () => { currentLevel = Math.max(0, currentLevel - 1); updateLevelDisplay(); });
nextBtn.addEventListener('click', () => { currentLevel = Math.min(levels.length - 1, currentLevel + 1); updateLevelDisplay(); });
updateLevelDisplay();

/* ------------- Level 1 ------------- */
const startRaceBtn = document.getElementById('startRaceBtn');
const raceTrack = document.getElementById('raceTrack');
const raceCars = [...document.querySelectorAll('.race-car')];
const raceResult = document.getElementById('raceResult');
const checkLevel1 = document.getElementById('checkLevel1');
const cheerAudio = document.getElementById('cheerAudio');

startRaceBtn?.addEventListener('click', () => {
  engineAudio.currentTime = 0;
  engineAudio.play();
  raceTrack.classList.remove('hidden');
  // random finish order
  const order = ['orange', 'green', 'blue'].sort(() => Math.random() - 0.5);
  raceCars.forEach((car, idx) => {
    const finish = 300 + idx * 40; // finish positions shorter offset
    const colour = order[idx];
    car.dataset.colour = colour;
    car.dataset.finish = idx + 1; // ordinal position
    const lane = document.getElementById(`lane-${colour}`);
    lane.appendChild(car);
    setTimeout(() => { car.style.left = finish + 'px'; }, 200);
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
  const correct = raceCars.sort((a, b) => a.dataset.finish - b.dataset.finish).map(c => c.dataset.colour || c.dataset.colour || c.getAttribute('data-colour'));
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
  if (snapshotIdx >= snapshots.length) { currentLevel++; updateLevelDisplay(); return; }
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
mcqueenVideo?.addEventListener('ended', () => { nextSnapshotBtn.classList.remove('hidden'); });

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
  lights.forEach(l => l.classList.remove('active'));
  const sequence = ['green', 'yellow', 'red'];
  lights[sequence.indexOf(sequence[lightIdx])]?.classList.add('active');
  if (sequence[lightIdx] === 'red') { redCount++; redCountInfo.textContent = `Red light appeared ${redCount} time(s)`; }
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
for (let i = 1; i <= days; i++) {
  const dayDiv = document.createElement('div');
  dayDiv.className = 'calendar-day';
  dayDiv.dataset.day = i;
  dayDiv.innerHTML = `<span>${i}${ordinalSuffix(i)}</span>`;
  dayDiv.addEventListener('dragover', e => e.preventDefault());
  dayDiv.addEventListener('drop', () => {
    if (dayDiv.children.length < 2) dayDiv.appendChild(dragged.cloneNode(true));
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
