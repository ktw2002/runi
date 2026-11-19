/* =========================================================
   Runi 웹 – 화면 이동과 버튼 동작
   ========================================================= */

const phone = document.getElementById('phone');
const stage = document.querySelector('.stage');
const screens = [...document.querySelectorAll('.screen')];
const navStack = [];          // 지나온 화면 기록 (뒤로가기용)
let current = null;

/* ---------- 화면 크기 맞추기 ---------- */
function fit() {
  const w = window.innerWidth, h = window.innerHeight;
  const mobile = w < 520;
  stage.classList.toggle('desktop', !mobile);
  if (mobile) {
    // 휴대폰: 화면 너비에 꽉 차게
    const s = w / 402;
    // 홈 화면 앱으로 열면 휴대폰의 진짜 상태바가 이미 위를 차지하니까, 화면 속 상태바 자리(54px)만큼 위로 올려요
    const app = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
    const off = app ? 54 : 0;
    phone.style.transform = `translateY(${-off * s}px) scale(${s})`;
    phone.style.height = `${h / s + off}px`;
    stage.style.paddingTop = '0';
  } else {
    // 컴퓨터: 가운데에 휴대폰 모양으로
    const s = Math.min(1, (h - 40) / 874);
    phone.style.transform = `scale(${s})`;
    phone.style.height = '874px';
    stage.style.paddingTop = '20px';
  }
}
window.addEventListener('resize', fit);
fit();

/* ---------- 상태바 채우기 ---------- */
const sbTpl = document.getElementById('statusBarTpl');
const statusBar = document.getElementById('statusBar');
statusBar.appendChild(sbTpl.content.cloneNode(true));

// 화면을 내렸을 때만 상태바 뒤에 흰 배경을 깔아요 (스플래시 화면에서는 숨김)
function updateStatusBar() {
  if (!current) return;
  statusBar.classList.toggle('hidden', current.id === 'splash');
  statusBar.classList.toggle('scrolled', current.scrollTop > 4);
}
screens.forEach(sc => sc.addEventListener('scroll', () => { if (sc === current) updateStatusBar(); }));

/* ---------- 화면 이동 ---------- */
function show(id, mode = 'push') {
  const next = document.getElementById(id);
  if (!next || next === current) return;
  const prev = current;
  screens.forEach(s => s.classList.remove('in-push', 'out-push', 'in-back', 'out-back', 'in-fade', 'in-up', 'out-down', 'leaving'));
  // 아래에서 올라오는 창(운동 설정)은 뒤에 이전 화면을 그대로 보여줘요
  screens.forEach(s => { if (!(next.dataset.overlay && s === prev)) s.classList.remove('under'); });
  if (next.dataset.overlay && prev) prev.classList.add('under');

  next.scrollTop = 0;
  next.classList.add('active');
  if (prev) {
    prev.classList.remove('active');
    if (!next.dataset.overlay) prev.classList.add('leaving');
    if (mode === 'push') { next.classList.add('in-push'); prev.classList.add('out-push'); }
    if (mode === 'back') { next.classList.add('in-back'); prev.classList.add('out-back'); }
    if (mode === 'fade') { next.classList.add('in-fade'); }
    if (mode === 'up') { next.classList.add('in-up'); }
    if (mode === 'down') { prev.classList.add('out-down'); }
    setTimeout(() => prev.classList.remove('leaving', 'out-push', 'out-back', 'out-down'), 360);
  }
  current = next;
  updateStatusBar();
  if (typeof updateChrome === 'function') updateChrome();
  if (next.id === 'home') popBubble();

  // 스플래시처럼 일정 시간 뒤 자동으로 넘어가는 화면
  if (next.dataset.auto) setTimeout(() => current === next && go(next.dataset.auto, 'fade'), 2000);
  // 러닝 중 화면: 몇 초 뒤 다음 기록 화면으로 자동 진행
  runTimerOnShow(prev, next);
  if (typeof runVideoOnShow === 'function') runVideoOnShow(prev, next);
}

/* ---------- 러닝 기록 자동 진행 타이머 ----------
   운동 설정 창이 열려 있는 동안에는 멈추고, 닫으면 남은 시간부터 이어서 진행해요 */
const runTimer = { screen: null, to: null, left: 0, started: 0, handle: null, paused: false, userPaused: false };
function runTimerOnShow(prev, next) {
  // 기록 화면에서 설정 창(올라오는 창)을 열면 → 일시정지
  if (prev && prev === runTimer.screen && next.dataset.overlay) {
    if (!runTimer.paused) {
      clearTimeout(runTimer.handle);
      runTimer.left -= Date.now() - runTimer.started;
      runTimer.paused = true;
    }
    return;
  }
  // 설정 창을 닫고 같은 기록 화면으로 돌아오면 → 이어서 진행 (정지 버튼으로 멈춘 상태면 그대로 멈춤)
  if (next === runTimer.screen && runTimer.paused) {
    if (runTimer.userPaused) return;
    runTimer.paused = false;
    startRunTimer(Math.max(400, runTimer.left));
    return;
  }
  // 그 밖의 이동 → 타이머 정리 후, 새 기록 화면이면 새로 시작
  clearTimeout(runTimer.handle);
  runTimer.screen = null; runTimer.paused = false;
  // 설정 창 · 절전 화면을 오갈 때는 정지 상태를 그대로 둬요
  const side = el => el && (el.dataset.overlay || el.id === 'f-111-728');
  if (runTimer.userPaused && !side(next) && !side(prev)) setUserPaused(false);
  if (next.dataset.autoNext) {
    const [to, ms] = next.dataset.autoNext.split('|');
    runTimer.screen = next; runTimer.to = to;
    startRunTimer(Number(ms));
  }
}
function startRunTimer(ms) {
  runTimer.left = ms;
  runTimer.started = Date.now();
  const sc = runTimer.screen;
  runTimer.handle = setTimeout(() => { if (current === sc) go(runTimer.to, 'fade'); }, ms);
}

function go(id, mode = 'push') {
  if (current) navStack.push(current.id);
  show(id, mode);
}

function back() {
  const prevId = navStack.pop();
  if (prevId) show(prevId, 'back');
}

document.addEventListener('click', e => {
  const goBtn = e.target.closest('[data-go]');
  if (goBtn) { go(goBtn.dataset.go, goBtn.dataset.mode || (goBtn.hasAttribute('data-fade') ? 'fade' : 'push')); return; }
  if (e.target.closest('[data-back]')) { back(); return; }
  const toastBtn = e.target.closest('[data-toast]');
  if (toastBtn) toast(toastBtn.dataset.toast);
});

/* ---------- 알림 메시지 ---------- */
const toastEl = document.getElementById('toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

/* ---------- 로그인 화면 ---------- */
document.getElementById('pwToggle').addEventListener('click', () => {
  const pw = document.getElementById('pw');
  pw.type = pw.type === 'password' ? 'text' : 'password';
});
document.getElementById('keep').addEventListener('click', e => e.currentTarget.classList.toggle('on'));

/* ---------- 목표 설정 화면 ---------- */
document.querySelectorAll('#goalTypes .goal-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('on'));
});

// 목표 거리: 5km(x=56) ~ 25km(x=344), 0.5km 단위로 조절
const DIST_MIN = 5, DIST_MAX = 25, X_MIN = 56, X_MAX = 344;
const distBox = document.getElementById('dist');
const distHit = document.getElementById('distHit');
let distKm = 10;

function setKm(km, step = 0.5) {
  distKm = Math.min(DIST_MAX, Math.max(DIST_MIN, Math.round(km / step) * step));
  distKm = Math.round(distKm * 10) / 10;
  const x = X_MIN + (distKm - DIST_MIN) / (DIST_MAX - DIST_MIN) * (X_MAX - X_MIN);
  document.getElementById('distValue').textContent = distKm.toFixed(1);
  document.getElementById('distFill').style.width = `${Math.max(4, x - 52)}px`;
  document.getElementById('distKnob').style.left = `${x - 10}px`;
  distHit.setAttribute('aria-valuenow', distKm);
  document.querySelectorAll('.dist-label').forEach(b => b.classList.toggle('on', Number(b.dataset.km) === distKm));
  if (typeof updateFine === 'function') updateFine();
}
function kmFromPointer(e) {
  const r = distHit.getBoundingClientRect();
  const scale = r.width / 312;                       // 화면 확대/축소 비율 반영
  const x = 44 + (e.clientX - r.left) / scale;        // 화면(402px) 기준 x 좌표
  return DIST_MIN + (x - X_MIN) / (X_MAX - X_MIN) * (DIST_MAX - DIST_MIN);
}
distHit.addEventListener('pointerdown', e => {
  distHit.setPointerCapture(e.pointerId);
  distBox.classList.add('dragging'); distHit.classList.add('active');
  setKm(kmFromPointer(e));
});
distHit.addEventListener('pointermove', e => {
  if (distHit.hasPointerCapture(e.pointerId)) setKm(kmFromPointer(e));
});
const stopDist = () => { distBox.classList.remove('dragging'); distHit.classList.remove('active'); };
distHit.addEventListener('pointerup', stopDist);
distHit.addEventListener('pointercancel', stopDist);
distHit.addEventListener('keydown', e => {                    // 키보드 ← → 로도 조절
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setKm(distKm + 0.5); e.preventDefault(); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setKm(distKm - 0.5); e.preventDefault(); }
});
document.querySelectorAll('.dist-label').forEach(btn => btn.addEventListener('click', () => setKm(Number(btn.dataset.km))));

/* ---------- 기본 정보 화면 ---------- */
document.querySelectorAll('#gender button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#gender button').forEach(b => b.classList.toggle('on', b === btn));
  });
});
// 생년월일: 숫자만 입력해도 2000.01.01 형태로 맞춰줘요
document.getElementById('birth').addEventListener('input', e => {
  const d = e.target.value.replace(/\D/g, '').slice(0, 8);
  e.target.value = [d.slice(0, 4), d.slice(4, 6), d.slice(6, 8)].filter(Boolean).join('.');
});

/* ---------- 캐릭터 선택 화면 ---------- */
const cards = [...document.querySelectorAll('.char-card')];   // [왼쪽, 가운데, 오른쪽] 순서로 돌아가요
let order = [0, 1, 2];
function layoutCards() {
  const pos = ['pos-left', 'pos-center', 'pos-right'];
  order.forEach((cardIdx, slot) => {
    cards[cardIdx].classList.remove(...pos, 'selected');
    cards[cardIdx].classList.add(pos[slot]);
  });
  cards[order[1]].classList.add('selected');
}
cards.forEach((card, idx) => {
  card.addEventListener('click', () => {
    const slot = order.indexOf(idx);
    if (slot === 0) order = [order[2], order[0], order[1]];   // 왼쪽 카드 → 가운데로
    if (slot === 2) order = [order[1], order[2], order[0]];   // 오른쪽 카드 → 가운데로
    layoutCards();
  });
});

/* ---------- 시작 ---------- */
show('splash', 'none');

/* ---------- 소개 화면: 옆으로 넘기는 슬라이드 ---------- */
const slider = document.getElementById('introSlider');
const dots = [...document.querySelectorAll('#introDots button')];
const pageW = 362;

// 넘길 때마다 아래 점(●○○) 표시 바꾸기
slider.addEventListener('scroll', () => {
  const page = Math.round(slider.scrollLeft / pageW);
  dots.forEach((d, i) => d.classList.toggle('on', i === page));
});
// 점을 눌러도 해당 페이지로 이동
dots.forEach((d, i) => d.addEventListener('click', () => slider.scrollTo({ left: i * pageW })));

// 컴퓨터에서도 마우스로 끌어서 넘길 수 있게
let dragStartX = 0, dragStartScroll = 0, dragging = false;
slider.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse') return;          // 휴대폰 손가락은 기본 스와이프 사용
  dragging = true; dragStartX = e.clientX; dragStartScroll = slider.scrollLeft;
  slider.classList.add('dragging');
  slider.setPointerCapture(e.pointerId);
});
slider.addEventListener('pointermove', e => {
  if (!dragging) return;
  const scale = phone.getBoundingClientRect().width / 402;
  slider.scrollLeft = dragStartScroll - (e.clientX - dragStartX) / scale;
});
const endDrag = e => {
  if (!dragging) return;
  dragging = false;
  slider.classList.remove('dragging');
  const moved = dragStartScroll - slider.scrollLeft;
  let page = Math.round(dragStartScroll / pageW);
  if (moved < -40) page += 1;                      // 왼쪽으로 끌면 다음 페이지
  if (moved > 40) page -= 1;                       // 오른쪽으로 끌면 이전 페이지
  page = Math.max(0, Math.min(dots.length - 1, page));
  slider.scrollTo({ left: page * pageW });
};
slider.addEventListener('pointerup', endDrag);
slider.addEventListener('pointercancel', endDrag);

/* ---------- 간편 로그인 확인 창 (Apple / Google / 카카오) ---------- */
const sheetWrap = document.getElementById('sheet');
const sheetOk = document.getElementById('sheetOk');
const providers = {
  apple:  { name: 'Apple',  logo: 'assets/apple.png' },
  google: { name: 'Google', logo: 'assets/google.png' },
  kakao:  { name: '카카오',  logo: 'assets/kakao.png' },
};
function openSheet(key) {
  const p = providers[key];
  document.getElementById('sheetLogo').src = p.logo;
  document.getElementById('sheetTitle').textContent = `${p.name}로 계속하기`;
  sheetOk.textContent = '계속하기';
  sheetOk.classList.remove('loading');
  sheetWrap.classList.add('open');
  sheetWrap.setAttribute('aria-hidden', 'false');
}
function closeSheet() {
  sheetWrap.classList.remove('open');
  sheetWrap.setAttribute('aria-hidden', 'true');
}
document.querySelectorAll('[data-sheet]').forEach(btn => btn.addEventListener('click', () => openSheet(btn.dataset.sheet)));
document.querySelectorAll('[data-sheet-close]').forEach(el => el.addEventListener('click', closeSheet));
sheetOk.addEventListener('click', () => {
  sheetOk.textContent = '로그인 중…';
  sheetOk.classList.add('loading');
  setTimeout(() => { closeSheet(); go('goal'); }, 700);
});

/* ---------- 회원가입 화면 ---------- */
const su = {
  email: document.getElementById('suEmail'),
  nick: document.getElementById('suNick'),
  pw: document.getElementById('suPw'),
  pw2: document.getElementById('suPw2'),
  hint: document.getElementById('suHint'),
  btn: document.getElementById('signupBtn'),
};
const termBtns = [...document.querySelectorAll('#terms .term')];
const termAll = termBtns.find(b => b.dataset.term === 'all');
const termItems = termBtns.filter(b => b !== termAll);

termAll.addEventListener('click', () => {
  const on = !termAll.classList.contains('on');
  termBtns.forEach(b => b.classList.toggle('on', on));
  checkSignup();
});
termItems.forEach(b => b.addEventListener('click', () => {
  b.classList.toggle('on');
  termAll.classList.toggle('on', termItems.every(t => t.classList.contains('on')));
  checkSignup();
}));

function checkSignup() {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(su.email.value.trim());
  const nickOk = su.nick.value.trim().length >= 2;
  const pw = su.pw.value, pw2 = su.pw2.value;
  const pwOk = pw.length >= 8 && /[a-zA-Z]/.test(pw) && /\d/.test(pw);
  const same = pwOk && pw === pw2;
  const termsOk = termItems.filter(b => b.dataset.term === 'req').every(b => b.classList.contains('on'));

  su.hint.classList.remove('ok', 'bad');
  if (!pw) su.hint.textContent = '영문, 숫자를 섞어 8자 이상 입력해주세요';
  else if (!pwOk) { su.hint.textContent = '영문과 숫자를 섞어 8자 이상이어야 해요'; su.hint.classList.add('bad'); }
  else if (!pw2) su.hint.textContent = '비밀번호를 한 번 더 입력해주세요';
  else if (!same) { su.hint.textContent = '비밀번호가 서로 달라요'; su.hint.classList.add('bad'); }
  else { su.hint.textContent = '사용할 수 있는 비밀번호예요 ✓'; su.hint.classList.add('ok'); }

  su.btn.disabled = !(emailOk && nickOk && same && termsOk);
}
[su.email, su.nick, su.pw, su.pw2].forEach(i => i.addEventListener('input', checkSignup));
su.btn.addEventListener('click', () => { toast('가입을 환영해요! 🎉'); go('goal'); });

/* ---------- 비밀번호 찾기 (3단계) ---------- */
const fp = {
  step: 1,
  email: document.getElementById('fpEmail'),
  send: document.getElementById('fpSend'),
  codes: [...document.querySelectorAll('#fpCode input')],
  verify: document.getElementById('fpVerify'),
  timer: document.getElementById('fpTimer'),
  pw: document.getElementById('fpPw'),
  pw2: document.getElementById('fpPw2'),
  hint: document.getElementById('fpHint'),
  done: document.getElementById('fpDone'),
};
let fpTimerId = null;

function fpShow(step) {
  fp.step = step;
  document.querySelectorAll('.fp-step').forEach(el => el.classList.toggle('on', Number(el.dataset.step) === step));
  document.querySelectorAll('#fpDots i').forEach((d, i) => d.classList.toggle('on', i === step - 1));
}
function fpReset() {
  fp.email.value = ''; fp.send.disabled = true;
  fp.codes.forEach(c => (c.value = '')); fp.verify.disabled = true;
  fp.pw.value = ''; fp.pw2.value = ''; fp.done.disabled = true;
  fp.hint.textContent = '영문, 숫자를 섞어 8자 이상 입력해주세요'; fp.hint.classList.remove('ok', 'bad');
  clearInterval(fpTimerId);
  fpShow(1);
}
// 로그인 화면에서 "비밀번호 찾기"를 누를 때마다 처음 단계부터
document.querySelectorAll('[data-go="findpw"]').forEach(b => b.addEventListener('click', fpReset));

// 뒤로가기: 2·3단계에서는 이전 단계로, 1단계에서는 로그인 화면으로
document.getElementById('fpBack').addEventListener('click', () => {
  if (fp.step > 1) fpShow(fp.step - 1); else back();
});

// 1단계: 이메일
fp.email.addEventListener('input', () => {
  fp.send.disabled = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fp.email.value.trim());
});
function startTimer() {
  let left = 180;
  clearInterval(fpTimerId);
  const tick = () => {
    fp.timer.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
    if (left-- <= 0) { clearInterval(fpTimerId); toast('시간이 지났어요. 다시 보내기를 눌러주세요'); }
  };
  tick(); fpTimerId = setInterval(tick, 1000);
}
fp.send.addEventListener('click', () => {
  document.getElementById('fpEmailShow').textContent = fp.email.value.trim();
  fp.codes.forEach(c => (c.value = '')); fp.verify.disabled = true;
  fpShow(2); startTimer(); toast('인증번호를 보냈어요');
  setTimeout(() => fp.codes[0].focus(), 250);
});
document.getElementById('fpResend').addEventListener('click', () => { startTimer(); toast('인증번호를 다시 보냈어요'); });

// 2단계: 6자리 인증번호 (한 칸 입력하면 다음 칸으로 자동 이동)
fp.codes.forEach((box, i) => {
  box.addEventListener('input', () => {
    box.value = box.value.replace(/\D/g, '').slice(-1);
    if (box.value && i < fp.codes.length - 1) fp.codes[i + 1].focus();
    fp.verify.disabled = !fp.codes.every(c => c.value);
  });
  box.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !box.value && i > 0) fp.codes[i - 1].focus();
  });
  box.addEventListener('paste', e => {
    const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    e.preventDefault();
    fp.codes.forEach((c, k) => (c.value = digits[k] || ''));
    fp.verify.disabled = !fp.codes.every(c => c.value);
  });
});
fp.verify.addEventListener('click', () => { clearInterval(fpTimerId); fpShow(3); setTimeout(() => fp.pw.focus(), 250); });

// 3단계: 새 비밀번호
function fpCheck() {
  const pw = fp.pw.value, pw2 = fp.pw2.value;
  const pwOk = pw.length >= 8 && /[a-zA-Z]/.test(pw) && /\d/.test(pw);
  fp.hint.classList.remove('ok', 'bad');
  if (!pw) fp.hint.textContent = '영문, 숫자를 섞어 8자 이상 입력해주세요';
  else if (!pwOk) { fp.hint.textContent = '영문과 숫자를 섞어 8자 이상이어야 해요'; fp.hint.classList.add('bad'); }
  else if (!pw2) fp.hint.textContent = '비밀번호를 한 번 더 입력해주세요';
  else if (pw !== pw2) { fp.hint.textContent = '비밀번호가 서로 달라요'; fp.hint.classList.add('bad'); }
  else { fp.hint.textContent = '사용할 수 있는 비밀번호예요 ✓'; fp.hint.classList.add('ok'); }
  fp.done.disabled = !(pwOk && pw === pw2);
}
[fp.pw, fp.pw2].forEach(i => i.addEventListener('input', fpCheck));
fp.done.addEventListener('click', () => { toast('비밀번호가 바뀌었어요. 새 비밀번호로 로그인해주세요'); back(); });


/* ---------- 목표 거리 세밀 조절 (화살표를 누르면 펼쳐져요) ---------- */
const goalScreen = document.getElementById('goal');
const goalCanvas = document.getElementById('goalCanvas');
const distToggle = document.getElementById('distToggle');
const fineHit = document.getElementById('fineHit');
const fineInput = document.getElementById('fineInput');
const FINE_X0 = 62, FINE_X1 = 340;                    // 큰 막대: 5km(x=62) ~ 25km(x=340)

// 1km마다 눈금, 5km마다 숫자
(function drawTicks() {
  const box = document.getElementById('fineTicks');
  for (let km = DIST_MIN; km <= DIST_MAX; km++) {
    const x = FINE_X0 + (km - DIST_MIN) / (DIST_MAX - DIST_MIN) * (FINE_X1 - FINE_X0);
    const t = document.createElement('i');
    t.style.left = `${x}px`;
    if (km % 5 === 0) {
      t.className = 'major';
      const label = document.createElement('span');
      label.style.left = `${x}px`; label.textContent = `${km}km`;
      box.appendChild(label);
    }
    box.appendChild(t);
  }
})();

function updateFine() {
  const ratio = (distKm - DIST_MIN) / (DIST_MAX - DIST_MIN);
  const w = 278 * ratio;                              // 막대 길이(트랙 278px) 기준
  document.getElementById('fineFill').style.width = `${w}px`;
  document.getElementById('fineKnob').style.left = `${12 + w}px`;
  fineHit.setAttribute('aria-valuenow', distKm);
  if (document.activeElement !== fineInput) fineInput.value = distKm.toFixed(1);
}

function toggleDetail(open = !goalScreen.classList.contains('expanded')) {
  goalScreen.classList.toggle('expanded', open);
  distToggle.setAttribute('aria-expanded', open);
  document.getElementById('distDetail').setAttribute('aria-hidden', !open);
  fineHit.tabIndex = open ? 0 : -1;
  goalCanvas.style.height = open ? '1271px' : '1156px';
  updateFine();
}
distToggle.addEventListener('click', () => toggleDetail());

// 큰 막대 끌기 (0.1km 단위)
function fineKmFromPointer(e) {
  const r = fineHit.getBoundingClientRect();
  const scale = r.width / 302;
  const x = 50 + (e.clientX - r.left) / scale;
  return DIST_MIN + (x - FINE_X0) / (FINE_X1 - FINE_X0) * (DIST_MAX - DIST_MIN);
}
fineHit.addEventListener('pointerdown', e => {
  fineHit.setPointerCapture(e.pointerId); fineHit.classList.add('active');
  setKm(fineKmFromPointer(e), 0.1);
});
fineHit.addEventListener('pointermove', e => {
  if (fineHit.hasPointerCapture(e.pointerId)) setKm(fineKmFromPointer(e), 0.1);
});
['pointerup', 'pointercancel'].forEach(t => fineHit.addEventListener(t, () => fineHit.classList.remove('active')));
fineHit.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setKm(distKm + 0.1, 0.1); e.preventDefault(); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setKm(distKm - 0.1, 0.1); e.preventDefault(); }
});

// −/+ 버튼: 한 번 누르면 0.1km, 꾹 누르고 있으면 계속 바뀌어요
document.querySelectorAll('.step-btn').forEach(btn => {
  let holdTimer, repeatTimer;
  const step = Number(btn.dataset.step);
  const stop = () => { clearTimeout(holdTimer); clearInterval(repeatTimer); };
  btn.addEventListener('pointerdown', e => {
    e.preventDefault();
    setKm(distKm + step, 0.1);
    holdTimer = setTimeout(() => { repeatTimer = setInterval(() => setKm(distKm + step, 0.1), 70); }, 400);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => btn.addEventListener(t, stop));
});

// 숫자 직접 입력 (예: 12.3)
fineInput.addEventListener('input', () => {
  fineInput.value = fineInput.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 4);
});
const applyFine = () => {
  const v = parseFloat(fineInput.value);
  if (!isNaN(v)) {
    if (v < DIST_MIN || v > DIST_MAX) toast(`${DIST_MIN}~${DIST_MAX}km 사이로 맞췄어요`);
    setKm(v, 0.1);
  }
  fineInput.value = distKm.toFixed(1);
};
fineInput.addEventListener('change', applyFine);
fineInput.addEventListener('keydown', e => { if (e.key === 'Enter') { applyFine(); fineInput.blur(); } });
updateFine();

/* ---------- 기본 정보: 프로필 사진 바꾸기 ---------- */
document.getElementById('avatarInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('사진 파일만 올릴 수 있어요'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    const img = document.getElementById('avatarPhoto');
    img.src = reader.result;
    img.classList.add('show');
    toast('프로필 사진을 바꿨어요');
  };
  reader.readAsDataURL(file);
});

/* ---------- 기본 정보: 생년월일 달력 ---------- */
const cal = {
  wrap: document.getElementById('calSheet'),
  year: document.getElementById('calYear'),
  month: document.getElementById('calMonth'),
  grid: document.getElementById('calGrid'),
  picked: document.getElementById('calPicked'),
  done: document.getElementById('calDone'),
  birth: document.getElementById('birth'),
  sel: null,                                   // 고른 날짜
};
const today = new Date();
for (let y = today.getFullYear(); y >= 1930; y--) cal.year.add(new Option(`${y}년`, y));
for (let m = 1; m <= 12; m++) cal.month.add(new Option(`${m}월`, m - 1));

const pad = n => String(n).padStart(2, '0');
const fmt = d => `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();

function drawCalendar() {
  const y = Number(cal.year.value), m = Number(cal.month.value);
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  cal.grid.innerHTML = '';
  for (let i = 0; i < first; i++) cal.grid.appendChild(document.createElement('span'));
  for (let d = 1; d <= days; d++) {
    const date = new Date(y, m, d);
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = d;
    const dow = date.getDay();
    if (dow === 0) b.classList.add('sun');
    if (dow === 6) b.classList.add('sat');
    if (sameDay(date, today)) b.classList.add('today');
    if (sameDay(date, cal.sel)) b.classList.add('picked');
    if (date > today) b.disabled = true;               // 미래 날짜는 고를 수 없어요
    b.addEventListener('click', () => {
      cal.sel = date;
      cal.picked.textContent = `${fmt(date)} 선택됨`;
      cal.done.disabled = false;
      drawCalendar();
    });
    cal.grid.appendChild(b);
  }
}
function moveMonth(diff) {
  let y = Number(cal.year.value), m = Number(cal.month.value) + diff;
  if (m < 0) { m = 11; y--; }
  if (m > 11) { m = 0; y++; }
  if (y > today.getFullYear() || y < 1930) return;
  cal.year.value = y; cal.month.value = m;
  drawCalendar();
}
function openCalendar() {
  // 이미 입력한 날짜가 있으면 그 달을, 없으면 2000년 1월을 보여줘요
  const m = cal.birth.value.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
  cal.sel = m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  const base = cal.sel || new Date(2000, 0, 1);
  cal.year.value = base.getFullYear(); cal.month.value = base.getMonth();
  cal.picked.textContent = cal.sel ? `${fmt(cal.sel)} 선택됨` : '날짜를 골라주세요';
  cal.done.disabled = !cal.sel;
  drawCalendar();
  cal.wrap.classList.add('open'); cal.wrap.setAttribute('aria-hidden', 'false');
}
function closeCalendar() { cal.wrap.classList.remove('open'); cal.wrap.setAttribute('aria-hidden', 'true'); }

document.getElementById('calOpen').addEventListener('click', e => { e.preventDefault(); openCalendar(); });
document.getElementById('calPrev').addEventListener('click', () => moveMonth(-1));
document.getElementById('calNext').addEventListener('click', () => moveMonth(1));
cal.year.addEventListener('change', drawCalendar);
cal.month.addEventListener('change', drawCalendar);
document.querySelectorAll('[data-cal-close]').forEach(el => el.addEventListener('click', closeCalendar));
cal.done.addEventListener('click', () => {
  if (!cal.sel) return;
  cal.birth.value = fmt(cal.sel);
  closeCalendar();
});

/* ---------- 시작하기 화면: 고른 캐릭터에 맞게 바꾸기 ---------- */
const startInfo = {
  '루니': { title: '활발한 루니' },
  '버니': { title: '민첩한 버니' },
  '모니': { title: '에너지 넘치는 모니' },
};
function applyStartChar() {
  const name = document.querySelector('.char-card.selected').dataset.name;
  const startEl = document.getElementById('start');
  startEl.dataset.char = name;
  document.getElementById('startTitle').textContent = startInfo[name].title;
  document.getElementById('startHello').textContent = name;
  document.querySelectorAll('.start-char').forEach(el => el.classList.toggle('show', el.dataset.char === name));
}
document.querySelectorAll('#character [data-go="start"]').forEach(b => b.addEventListener('click', applyStartChar));
applyStartChar();


/* =========================================================
   러닝 · 메달 · 상점 · 기록 · 소통 · 알림/설정 연결
   ========================================================= */
// 하단 탭바는 탭이 있는 화면(홈·상점·메달·프로필·소통 등)에서만 보여요
function updateChrome() {
  const showTab = current && (current.id === 'home' || current.dataset.tab === '1');
  document.getElementById('tabbar').classList.toggle('hidden', !showTab);
  statusBar.classList.toggle('dark', !!(current && current.dataset.dark));
}

// 탭 전환: 쌓인 화면 기록을 비우고 바로 바꿔요
function switchTab(id) {
  if (current && current.id === id) { current.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  navStack.length = 0;
  show(id, 'none');
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab-go]');
  if (t) switchTab(t.dataset.tabGo);
});

// 가운데 홈 버튼: 홈에서는 러닝 시작, 다른 탭에서는 홈으로
document.getElementById('tabCenter').addEventListener('click', () => {
  if (current && current.id === 'home') go('f-676-3844', 'up');
  else switchTab('home');
});

// 로그아웃 → 로그인 화면
document.addEventListener('click', e => {
  if (!e.target.closest('[data-logout]')) return;
  navStack.length = 0;
  show('login', 'fade');
  toast('로그아웃했어요');
});

// 상세 화면의 구매하기 → 구매 완료 후 이동
document.addEventListener('click', e => {
  const b = e.target.closest('[data-buy]');
  if (!b) return;
  toast('구매했어요! 🎉');
  if (b.dataset.buy === 'B') back(); else go(b.dataset.buy, 'fade');
});

/* ---------- 상품 팝업 ---------- */
const popLayer = document.getElementById('popLayer');
let popInfo = null;
function placeBtn(el, [x, y, w, h]) { el.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`; }
function openPopup(key) {
  popInfo = FLOW_POPUPS[key];
  const img = document.getElementById('popImg');
  img.src = `screens/pop-${key}.png`;
  // 그림에는 그림자 여백이 포함돼 있어서 그만큼 바깥으로 놓아요
  img.style.cssText = `left:${popInfo.x - 12.8}px;top:${popInfo.y - 6.4}px;width:381px;height:auto`;
  placeBtn(document.getElementById('popBuy'), popInfo.buy);
  placeBtn(document.getElementById('popClose'), popInfo.close);
  popLayer.classList.add('open');
}
function closePopup() { popLayer.classList.remove('open'); }
document.addEventListener('click', e => {
  const p = e.target.closest('[data-popup]');
  if (p) openPopup(p.dataset.popup);
});
document.querySelectorAll('[data-pop-close]').forEach(el => el.addEventListener('click', closePopup));
document.getElementById('popClose').addEventListener('click', closePopup);
document.getElementById('popBuy').addEventListener('click', () => { closePopup(); toast('구매했어요! 🎉'); });

updateChrome();

/* ---------- 홈 말풍선: 화면이 켜질 때 뿅! ---------- */
function popBubble() {
  const b = document.getElementById('homeBubble');
  b.classList.remove('pop');
  void b.offsetWidth;            // 애니메이션을 처음부터 다시 시작하게 하는 줄
  b.classList.add('pop');
}
document.getElementById('homeBubble').addEventListener('click', popBubble);   // 말풍선을 눌러도 다시 뿅

/* ---------- 홈 루니: 누르면 손 흔들고 꼬리 흔들며 깡총! ---------- */
const runi = document.getElementById('runi');
let runiTimer;
runi.addEventListener('click', () => {
  runi.classList.remove('happy');
  void runi.offsetWidth;          // 연속으로 눌러도 처음부터 다시
  runi.classList.add('happy');
  popBubble();
  clearTimeout(runiTimer);
  runiTimer = setTimeout(() => runi.classList.remove('happy'), 1700);
});

/* ---------- 러닝 목표 거리: 직접 입력 ---------- */
(function runGoalInput() {
  const canvas = document.querySelector('#f-676-3844 .canvas');
  const box = document.createElement('div');
  box.className = 'run-goal';
  box.innerHTML = `
    <button type="button" class="rg-step" data-d="-0.5" aria-label="0.5km 줄이기">−</button>
    <label class="rg-field">
      <input id="runGoal" type="text" inputmode="decimal" value="5.0" maxlength="4" aria-label="목표 거리 (km)" />
      <span>km</span>
    </label>
    <button type="button" class="rg-step" data-d="0.5" aria-label="0.5km 늘리기">+</button>`;
  canvas.appendChild(box);

  const input = box.querySelector('#runGoal');
  const MIN = 0.5, MAX = 42.2;
  let goal = 5;
  const show = () => { input.value = goal.toFixed(1); };
  const set = v => { goal = Math.min(MAX, Math.max(MIN, Math.round(v * 10) / 10)); show(); };

  // 숫자와 점만 입력되게
  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 4);
  });
  input.addEventListener('focus', () => input.select());
  const apply = () => {
    const v = parseFloat(input.value);
    if (isNaN(v)) { show(); return; }
    if (v < MIN || v > MAX) toast(`${MIN}~${MAX}km 사이로 맞췄어요`);
    set(v);
  };
  input.addEventListener('change', apply);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { apply(); input.blur(); } });

  // −/+ : 한 번 누르면 0.5km, 꾹 누르면 계속
  box.querySelectorAll('.rg-step').forEach(btn => {
    let hold, rep;
    const d = Number(btn.dataset.d);
    const stop = () => { clearTimeout(hold); clearInterval(rep); };
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      set(goal + d);
      hold = setTimeout(() => { rep = setInterval(() => set(goal + d), 90); }, 400);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => btn.addEventListener(t, stop));
  });

  // 시작하기를 누르면 정한 목표로 출발
  const startBtn = [...canvas.querySelectorAll('.hs')].find(b => b.dataset.go === 'f-574-2137');
  startBtn.addEventListener('click', () => { apply(); toast(`목표 ${goal.toFixed(1)}km, 출발! 🏃`); }, true);
})();


/* ---------- 운동 설정: 스위치 · 알림 값 고르기 · 아래로 닫기 ---------- */
let powerToggle = null;
(function runSettings() {
  const canvas = document.querySelector('#f-111-475 .canvas');

  // 운동 계속하기 → 설정 창이 아래로 내려가며 닫혀요
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-back-down]')) return;
    const prevId = navStack.pop();
    if (prevId) show(prevId, 'down');
  });

  // 켜기/끄기 스위치 (그림 속 스위치 위에 겹쳐요)
  [['음성 안내', 251, true], ['화면 잠금', 321, true], ['절전 모드', 391, false], ['자동 일시정지', 671, true]].forEach(([name, row, on]) => {
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'rs-toggle' + (on ? ' on' : '');
    t.setAttribute('role', 'switch');
    t.setAttribute('aria-label', name);
    t.setAttribute('aria-checked', on);
    t.style.top = `${row + 17.5}px`;
    t.innerHTML = '<i></i>';
    t.addEventListener('click', () => {
      const v = !t.classList.contains('on');
      t.classList.toggle('on', v);
      t.setAttribute('aria-checked', v);
      toast(`${name} ${v ? '켰어요' : '껐어요'}`);
      // 절전 모드를 켜면 → 잠깐 뒤 검은 절전 화면으로
      if (name === '절전 모드' && v) {
        setTimeout(() => {
          if (current && current.id === 'f-111-475') show('f-111-728', 'fade');   // 설정 창은 닫고 이동 (뒤로가면 러닝 화면)
        }, 450);
      }
    });
    if (name === '절전 모드') powerToggle = t;
    canvas.appendChild(t);
  });

  // 알림 값 (누르면 아래에서 고르는 창이 올라와요)
  const rows = [
    { name: '거리 알림', row: 461, value: '1.00km', opts: ['0.50km', '1.00km', '2.00km', '3.00km', '5.00km', '끄기'] },
    { name: '시간 알림', row: 531, value: '10분', opts: ['5분', '10분', '15분', '20분', '30분', '끄기'] },
    { name: '심박수 알림', row: 601, value: '160BPM', opts: ['140BPM', '150BPM', '160BPM', '170BPM', '180BPM', '끄기'] },
  ];
  const sheet = document.createElement('div');
  sheet.className = 'sheet-wrap rs-sheet';
  sheet.innerHTML = `<div class="sheet-backdrop" data-rs-close></div>
    <div class="rs-panel"><span class="cal-handle"></span><p class="rs-title t-bold"></p><div class="rs-opts"></div></div>`;
  document.getElementById('phone').insertBefore(sheet, document.getElementById('statusBar'));
  const close = () => sheet.classList.remove('open');
  sheet.querySelector('[data-rs-close]').addEventListener('click', close);

  rows.forEach(r => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rs-row';
    btn.style.top = `${r.row}px`;
    btn.setAttribute('aria-label', `${r.name} 바꾸기`);
    btn.innerHTML = `<span class="rs-val">${r.value}</span>`;
    btn.addEventListener('click', () => {
      sheet.querySelector('.rs-title').textContent = r.name;
      const box = sheet.querySelector('.rs-opts');
      box.innerHTML = '';
      r.opts.forEach(o => {
        const ob = document.createElement('button');
        ob.type = 'button';
        ob.className = 'rs-opt' + (o === r.value ? ' on' : '');
        ob.textContent = o;
        ob.addEventListener('click', () => {
          r.value = o;
          btn.querySelector('.rs-val').textContent = o;
          btn.classList.toggle('off', o === '끄기');
          close();
          toast(o === '끄기' ? `${r.name}을 껐어요` : `${r.name}: ${o}`);
        });
        box.appendChild(ob);
      });
      sheet.classList.add('open');
    });
    canvas.appendChild(btn);
  });
})();

/* ---------- 절전 화면: 루니를 오른쪽으로 끝까지 밀면 다시 켜져요 ---------- */
(function sleepSlider() {
  const canvas = document.querySelector('#f-111-728 .canvas');
  const START = 48, END = 270, SIZE = 84, TOP = 680;   // 그림 속 동그라미 위치
  canvas.insertAdjacentHTML('beforeend', `
    <div class="sl-cover" style="left:${START - 3}px;top:${TOP - 3}px"></div>
    <div class="sl-trail" id="slTrail"></div>
    <div class="sl-knob" id="slKnob" role="slider" aria-label="오른쪽으로 밀어서 화면 켜기"
         style="left:${START}px;top:${TOP}px;background-position:-${START}px -${TOP}px"></div>`);
  const knob = document.getElementById('slKnob');
  const trail = document.getElementById('slTrail');
  let startX = 0, pos = 0, dragging = false;

  const place = (x, anim) => {
    pos = Math.max(0, Math.min(END - START, x));
    knob.classList.toggle('anim', !!anim);
    trail.classList.toggle('anim', !!anim);
    knob.style.transform = `translateX(${pos}px)`;
    trail.style.width = `${pos + SIZE / 2}px`;
    trail.style.opacity = pos > 2 ? 1 : 0;
  };
  const scale = () => knob.getBoundingClientRect().width / SIZE;

  knob.addEventListener('pointerdown', e => {
    dragging = true; startX = e.clientX - pos * scale();
    knob.setPointerCapture(e.pointerId); knob.classList.add('grab');
  });
  knob.addEventListener('pointermove', e => {
    if (dragging) place((e.clientX - startX) / scale());
  });
  const release = () => {
    if (!dragging) return;
    dragging = false; knob.classList.remove('grab');
    if (pos > (END - START) * 0.75) {
      place(END - START, true);                 // 끝까지 쏙
      setTimeout(() => {
        if (powerToggle) { powerToggle.classList.remove('on'); powerToggle.setAttribute('aria-checked', 'false'); }
        back();                                 // 원래 러닝 화면으로
        setTimeout(() => place(0), 400);
      }, 220);
    } else {
      place(0, true);                           // 덜 밀면 제자리로 쓱
    }
  };
  knob.addEventListener('pointerup', release);
  knob.addEventListener('pointercancel', release);
  // 키보드 → 키로도 켤 수 있게
  knob.tabIndex = 0;
  knob.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'Enter') { dragging = true; pos = END; release(); } });
})();

/* ---------- 러닝 중: 정지 / 다시 달리기 버튼 ---------- */
const PAUSE_ICON = '<svg width="30" height="34" viewBox="0 0 30 34" aria-hidden="true"><rect x="2" y="0" width="9" height="34" rx="4.5" fill="#F0F3FF"/><rect x="19" y="0" width="9" height="34" rx="4.5" fill="#F0F3FF"/></svg>';
const PLAY_ICON  = '<svg width="30" height="34" viewBox="0 0 30 34" aria-hidden="true"><path d="M6 3.2C6 1.1 8.3-.2 10.1.9l17.4 11.9c1.6 1.1 1.6 3.4 0 4.5L10.1 29.2C8.3 30.3 6 29 6 26.9z" transform="translate(-1 2)" fill="#F0F3FF"/></svg>';
const runScreens = ['f-574-2137', 'f-576-2359', 'f-628-3834'];
runScreens.forEach(id => {
  const canvas = document.querySelector(`#${id} .canvas`);
  canvas.insertAdjacentHTML('beforeend', `
    <button type="button" class="run-pause" aria-label="정지">${PAUSE_ICON}</button>
    <span class="run-paused-chip">일시정지 중</span>`);
});
function setUserPaused(v) {
  runTimer.userPaused = v;
  document.querySelectorAll('.run-pause').forEach(b => {
    b.innerHTML = v ? PLAY_ICON : PAUSE_ICON;
    b.setAttribute('aria-label', v ? '다시 달리기' : '정지');
  });
  runScreens.forEach(id => document.getElementById(id).classList.toggle('run-stopped', v));
}
document.addEventListener('click', e => {
  if (!e.target.closest('.run-pause')) return;
  if (!runTimer.userPaused) {
    // 정지: 기록 진행 멈추기
    if (runTimer.screen && !runTimer.paused) {
      clearTimeout(runTimer.handle);
      runTimer.left -= Date.now() - runTimer.started;
      runTimer.paused = true;
    }
    setUserPaused(true);
    toast('러닝을 잠시 멈췄어요');
  } else {
    // 다시 달리기: 남은 시간부터 이어서
    setUserPaused(false);
    if (runTimer.screen && runTimer.paused) {
      runTimer.paused = false;
      startRunTimer(Math.max(400, runTimer.left));
    }
    toast('다시 달려요! 🏃');
  }
});

/* ---------- 도전 메달: 전체 · 완료 · 진행 중 · 잠김 ----------
   메달 30개를 완료 10 · 진행 중 10 · 잠김 10으로 나눴어요.
   상태를 바꾸려면 아래 목록의 'done' / 'prog' / 'lock'만 고치면 돼요. */
const MEDALS = [
  ['첫 발걸음', 'done'], ['3일 연속 달리기', 'done'], ['일주일 루틴', 'done'],
  ['10km 달성', 'done'], ['50km 러너', 'prog', 30, 50, 'km'], ['100km 클럽', 'prog', 30, 100, 'km'],
  ['오늘은 3km', 'done'], ['5km 완주자', 'done'], ['조금 더 빠르게', 'lock'],
  ['내 최고 기록', 'lock'], ['아침형 러너', 'done'], ['밤하늘 러너', 'prog', 2, 5, '회'],
  ['주말 러너', 'prog', 3, 5, '회'], ['미션 헌터', 'prog', 7, 10, '개'], ['메달 수집가', 'done'],
  ['꾸미기 입문자', 'lock'], ['나만의 방', 'prog', 4, 10, '개'], ['테마 완성', 'lock'],
  ['다양한 테마', 'lock'], ['패션 러너', 'prog', 2, 5, '개'], ['오늘의 코디', 'prog', 2, 3, '개'],
  ['친구가 생겼어요', 'done'], ['셋이서 함께', 'lock'], ['첫 응원', 'lock'],
  ['커뮤니티 데뷔', 'lock'], ['우정 시작', 'lock'], ['랭킹 도전자', 'lock'],
  ['꾸준한 한 달', 'prog', 8, 12, '회'], ['루니와 30일', 'prog', 21, 30, '일'], ['오늘도 달릴래?', 'done'],
];
(function medalFilter() {
  const canvas = document.querySelector('#f-1-1041 .canvas');
  const LIST_TOP = 639, CARD_W = 111, CARD_H = 182.4, GAP_Y = 9, COLS_X = [23, 145.5, 268];
  const tabs = [
    { name: '전체', x: 67.5, f: () => true },
    { name: '완료', x: 154.5, f: m => m[1] === 'done' },
    { name: '진행 중', x: 247.5, f: m => m[1] === 'prog' },
    { name: '잠김', x: 340.5, f: m => m[1] === 'lock' },
  ];
  canvas.insertAdjacentHTML('beforeend', `
    <div class="mf-bar" role="tablist">
      <i class="mf-pill" id="mfPill"></i>
      ${tabs.map((t, i) => `<button type="button" class="mf-tab${i === 0 ? ' on' : ''}" role="tab" data-i="${i}" style="left:${t.x - 23 - 40.5}px">${t.name}</button>`).join('')}
    </div>
    <div class="mf-grid" id="mfGrid"></div>`);
  const grid = document.getElementById('mfGrid');

  // 카드 만들기
  const cards = MEDALS.map((m, i) => {
    const [name, st, now, goal, unit] = m;
    const el = document.createElement('div');
    el.className = `mf-card ${st}`;
    el.setAttribute('aria-label', `${name} - ${st === 'done' ? '완료' : st === 'prog' ? `진행 중 ${now}/${goal}${unit}` : '잠김'}`);
    let chip = '';
    if (st === 'prog') chip = `<div class="mf-chip prog"><span>${now} / ${goal}${unit}</span><i><b style="width:${Math.round(now / goal * 100)}%"></b></i></div>`;
    if (st === 'lock') chip = `<div class="mf-chip lock">🔒 잠김</div><span class="mf-lock">🔒</span>`;
    el.innerHTML = `<img src="medals/m${String(i + 1).padStart(2, '0')}.jpg" alt="${name}" loading="lazy" />${chip}`;
    return el;
  });
  cards.forEach(c => grid.appendChild(c));

  function layout(filter) {
    let n = 0;
    cards.forEach((c, i) => {
      const on = filter(MEDALS[i]);
      c.style.display = on ? 'block' : 'none';
      if (on) {
        c.style.left = `${COLS_X[n % 3]}px`;
        c.style.top = `${Math.floor(n / 3) * (CARD_H + GAP_Y)}px`;
        n++;
      }
    });
    const rows = Math.ceil(n / 3);
    const h = rows * (CARD_H + GAP_Y);
    grid.style.height = `${h}px`;
    canvas.style.height = `${LIST_TOP + h + 130}px`;   // 아래 탭바에 가리지 않게 여유
    grid.classList.remove('fade'); void grid.offsetWidth; grid.classList.add('fade');
  }
  canvas.querySelectorAll('.mf-tab').forEach(btn => btn.addEventListener('click', () => {
    const t = tabs[Number(btn.dataset.i)];
    canvas.querySelectorAll('.mf-tab').forEach(b => b.classList.toggle('on', b === btn));
    document.getElementById('mfPill').style.transform = `translateX(${t.x - 67.5}px)`;
    layout(t.f);
  }));
  layout(tabs[0].f);
})();

/* ---------- 메달을 누르면 크게 보기 ---------- */
const MEDAL_DESC = [
  '첫 러닝 완료', '3일 연속 러닝 성공', '7일 동안 4회 이상 달리기', '누적 10km 달리기', '누적 50km 달리기',
  '누적 100km 달리기', '한 번에 3km 완주', '한 번에 5km 완주', '이전 평균 페이스보다 기록 단축', '개인 최고 페이스 갱신',
  '오전 러닝 5회 완료', '저녁 러닝 5회 완료', '주말 러닝 5회 완료', '일일 미션 10개 완료', '메달 5개 획득',
  '첫 인테리어 아이템 구매', '방 소품 10개 배치', '하나의 방 테마 세트 완성', '두 개의 테마 세트 완성', '의상 아이템 5개 보유',
  '상·하의·신발 모두 변경', '캐릭터 1개 해금', '루니·모니·라비 모두 보유', '다른 러너에게 응원 보내기', '첫 게시물 작성',
  '친구 기능 1회 사용', '주간 랭킹 참여', '한 달 동안 12회 이상 러닝', '가입 후 30일 동안 활동', '러닝 30회 완료',
];
const MEDAL_DATES = { 1: '2026.03.02', 2: '2026.03.04', 3: '2026.03.09', 4: '2026.03.11', 7: '2026.03.03',
  8: '2026.03.15', 11: '2026.03.21', 15: '2026.03.28', 22: '2026.04.02', 30: '2026.05.31' };

(function medalViewer() {
  const phone = document.getElementById('phone');
  phone.insertBefore(Object.assign(document.createElement('div'), {
    className: 'mv-wrap', id: 'mvWrap',
    innerHTML: `<div class="mv-dim" data-mv-close></div>
      <div class="mv-card" role="dialog" aria-labelledby="mvName">
        <div class="mv-stage"><i class="mv-glow"></i><img id="mvImg" alt="" /><span class="mv-lock">🔒</span><i class="mv-shine"></i></div>
        <span class="mv-badge" id="mvBadge"></span>
        <p class="mv-name t-bold" id="mvName"></p>
        <p class="mv-desc t-medium" id="mvDesc"></p>
        <div class="mv-status" id="mvStatus"></div>
        <button type="button" class="btn-primary mv-close" data-mv-close>닫기</button>
      </div>`,
  }), document.getElementById('statusBar'));
  const wrap = document.getElementById('mvWrap');

  function open(i) {
    const [name, st, now, goal, unit] = MEDALS[i];
    const n = i + 1;
    wrap.dataset.st = st;
    document.getElementById('mvImg').src = `medals/big/b${String(n).padStart(2, '0')}.png`;
    document.getElementById('mvImg').alt = name;
    document.getElementById('mvName').textContent = name;
    document.getElementById('mvDesc').textContent = MEDAL_DESC[i];
    const badge = document.getElementById('mvBadge');
    const box = document.getElementById('mvStatus');
    if (st === 'done') {
      badge.textContent = '획득 완료';
      box.innerHTML = `<div class="mv-done">🏅 <b>${MEDAL_DATES[n] || '2026.04.01'}</b> 에 획득했어요</div>`;
    } else if (st === 'prog') {
      const pct = Math.round(now / goal * 100);
      badge.textContent = '진행 중';
      box.innerHTML = `<div class="mv-prog">
          <div class="mv-prog-top"><span>${now} / ${goal}${unit}</span><b>${pct}%</b></div>
          <i><b style="width:0%"></b></i>
          <small>${goal - now}${unit}만 더 하면 메달을 받아요! 💪</small></div>`;
      requestAnimationFrame(() => setTimeout(() => { box.querySelector('i b').style.width = `${pct}%`; }, 250));
    } else {
      badge.textContent = '잠김';
      box.innerHTML = `<div class="mv-lockbox"><b>🔒 아직 잠겨 있어요</b><small>획득 조건 · ${MEDAL_DESC[i]}</small></div>`;
    }
    wrap.classList.remove('open'); void wrap.offsetWidth;
    wrap.classList.add('open');
  }
  const close = () => wrap.classList.remove('open');
  wrap.querySelectorAll('[data-mv-close]').forEach(el => el.addEventListener('click', close));

  document.querySelectorAll('#mfGrid .mf-card').forEach((card, i) => {
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.addEventListener('click', () => open(i));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') open(i); });
  });
})();

/* ---------- 러닝 영상 ----------
   러닝 화면에 달리기 영상을 넣었어요 (0.00km → 5.02km, 12.5초).
   설정 창·절전 화면에 다녀오면 이어서 재생하고, 처음 들어오면 처음부터 재생해요. */
var runVideo = (() => {
  const canvas = document.querySelector('#f-574-2137 .canvas');
  const v = document.createElement('video');
  v.className = 'run-video';
  v.src = 'screens/running.mp4';
  v.poster = 'screens/running-poster.jpg';
  v.muted = true; v.playsInline = true; v.preload = 'auto';
  v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
  canvas.insertBefore(v, canvas.querySelector('.hs'));   // 버튼들보다 아래에
  return v;
})();
var VIDEO_SCREEN = 'f-574-2137';
function runVideoOnShow(prev, next) {
  if (!runVideo) return;   // 페이지가 처음 열릴 때(영상 준비 전)는 건너뛰어요
  const keepSpot = el => el && (el.dataset.overlay || el.id === 'f-111-728');   // 설정 창 · 절전 화면
  if (next.id === VIDEO_SCREEN) {
    if (keepSpot(prev)) {
      if (!runTimer.userPaused) runVideo.play().catch(() => {});
    } else {
      setUserPaused(false);
      runVideo.currentTime = 0;
      runVideo.play().catch(() => {});
    }
  } else if (prev && prev.id === VIDEO_SCREEN) {
    runVideo.pause();
    if (!keepSpot(next)) runVideo.currentTime = 0;
  }
}
// 정지 / 다시 달리기 버튼 → 영상도 같이 멈추고 다시 재생
document.addEventListener('click', () => {
  if (!current || current.id !== VIDEO_SCREEN) return;
  if (runTimer.userPaused && !runVideo.paused) runVideo.pause();
  else if (!runTimer.userPaused && runVideo.paused && !runVideo.ended) runVideo.play().catch(() => {});
});

/* ---------- 상단 프로필 (온보딩에서 정한 닉네임 · 사진 그대로) ---------- */
const HEADER_SCREENS = {
  'f-1-1041': '#fff', 'f-628-3399': '#fff', 'f-136-1566': '#fff', 'f-146-1918': '#fff', 'f-181-3907': '#fff',
  'f-632-4904': '#f4f7fe', 'f-632-4646': '#f4f7fe', 'f-632-4374': '#f4f7fe', 'f-632-4121': '#f4f7fe', 'f-67-1562': '#f4f2ff',
};
Object.entries(HEADER_SCREENS).forEach(([id, bg]) => {
  const canvas = document.querySelector(`#${id} .canvas`);
  if (!canvas) return;
  canvas.insertAdjacentHTML('beforeend',
    `<img class="hdr-av" alt="내 프로필 사진" /><span class="hdr-name" style="background:${bg}"></span>`);
});
function updateHeaderProfile() {
  const nick = (document.getElementById('nickInput').value || '').trim();
  const photo = document.getElementById('avatarPhoto');
  const hasPhoto = photo.classList.contains('show') && photo.src;
  document.querySelectorAll('.hdr-name').forEach(el => {
    el.textContent = nick;
    el.classList.toggle('show', !!nick);          // 비워두면 원래 이름(숨참혜성) 그대로
  });
  document.querySelectorAll('.hdr-av').forEach(el => {
    if (hasPhoto) el.src = photo.src;
    el.classList.toggle('show', !!hasPhoto);      // 사진을 안 바꾸면 원래 사진 그대로
  });
  // 홈 화면 프로필
  document.getElementById('homeNick').textContent = nick || '숨참혜성';
  document.getElementById('homeAv').src = hasPhoto ? photo.src : 'assets/profile-hs.jpg';
}
document.getElementById('nickInput').addEventListener('input', updateHeaderProfile);
document.getElementById('avatarInput').addEventListener('change', () => setTimeout(updateHeaderProfile, 300));

/* ---------- 도전 메달 요약: 완료 개수 · 달성률을 메달 목록에 맞춰서 ---------- */
(function medalSummary() {
  const canvas = document.querySelector('#f-1-1041 .canvas');
  const done = MEDALS.filter(m => m[1] === 'done').length;
  const pct = Math.round(done / MEDALS.length * 100);
  const R = 18.5, C = 2 * Math.PI * R;
  canvas.insertAdjacentHTML('beforeend', `
    <div class="ms-count"><b>${done}</b>개 획득</div>
    <div class="ms-ring" aria-label="전체 달성률 ${pct}%">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="${R}" fill="none" stroke="#a9cdf7" stroke-width="8.5"/>
        <circle class="ms-arc" cx="24" cy="24" r="${R}" fill="none" stroke="#4a72f5" stroke-width="8.5"
          stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 24 24)"/>
      </svg>
    </div>
    <div class="ms-pct"><b>${pct}</b>%</div>`);
  const arc = canvas.querySelector('.ms-arc');
  // 메달 화면이 열릴 때마다 링이 채워지는 모션
  const fill = () => {
    arc.style.transition = 'none'; arc.style.strokeDashoffset = C;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      arc.style.transition = 'stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1)';
      arc.style.strokeDashoffset = C * (1 - done / MEDALS.length);
    }));
  };
  document.addEventListener('click', e => { if (e.target.closest('[data-tab-go="f-1-1041"]')) setTimeout(fill, 50); });
  fill();
})();

/* ---------- 기본 정보: 닉네임을 입력해야 '다음'으로 넘어가요 ---------- */
(function nickRequired() {
  const input = document.getElementById('nickInput');
  const next = document.getElementById('infoNext');
  const hint = document.getElementById('nickHint');
  const field = input.closest('.field-info');
  const ok = () => input.value.trim().length >= 2;
  const check = () => {
    next.classList.toggle('locked', !ok());
    if (ok()) { hint.classList.remove('show'); field.classList.remove('need'); }
  };
  input.addEventListener('input', check);
  // 잠겨 있을 때 누르면: 넘어가지 않고, 닉네임 칸을 흔들어 알려줘요
  next.addEventListener('click', e => {
    if (ok()) return;
    e.stopImmediatePropagation(); e.preventDefault();
    hint.classList.add('show');
    field.classList.remove('need'); void field.offsetWidth; field.classList.add('need');
    toast('닉네임을 먼저 정해주세요 🙂');
    input.focus();
  }, true);
  check();
})();

/* ---------- 미션: 누를 때마다 +1, 다 채우면 CLEAR + 코인 ---------- */
let coins = 406;
const MISSIONS = [
  { now: 2.1, goal: 3,  unit: 'km', fmt: v => v.toFixed(1), goalTxt: '3.0 km', reward: 8 },
  { now: 0,   goal: 20, unit: '분', fmt: v => String(v),    goalTxt: '20분',   reward: 5 },
  { now: 2.1, goal: 5,  unit: 'km', fmt: v => v.toFixed(1), goalTxt: '5.0 km', reward: 15 },
  { now: 1,   goal: 1,  unit: '',   fmt: v => String(v),    goalTxt: '1',      reward: 10, cleared: true },
  { now: 2.1, goal: 10, unit: 'km', fmt: v => v.toFixed(1), goalTxt: '10 km',  reward: 20 },
];
let missionsDone = 12;
(function missions() {
  const canvas = document.querySelector('#f-628-3399 .canvas');
  canvas.insertAdjacentHTML('beforeend', `<span class="mi-count" id="miCount"></span>`);
  const countEl = document.getElementById('miCount');
  const paintTop = () => {
    countEl.innerHTML = `<b>${missionsDone}</b> / 30`;
  };

  MISSIONS.forEach((m, i) => {
    const top = 357 + 99 * i;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'mi-card';
    card.style.top = `${top}px`;
    card.innerHTML = `
      <span class="mi-bar"><b></b></span>
      <span class="mi-val"></span>
      <span class="mi-reward">+${m.reward}C</span>`;
    canvas.appendChild(card);
    const bar = card.querySelector('.mi-bar b');
    const val = card.querySelector('.mi-val');
    const paint = () => {
      bar.style.width = `${Math.min(100, m.now / m.goal * 100)}%`;
      val.textContent = `${m.fmt(m.now)} / ${m.goalTxt}`;
      card.classList.toggle('done', !!m.cleared);
      card.setAttribute('aria-label', `미션 ${i + 1}: ${val.textContent}${m.cleared ? ' 완료' : ''}`);
    };
    card.addEventListener('click', () => {
      if (m.cleared) { toast(`이미 완료한 미션이에요 (+${m.reward}C 받음)`); return; }
      m.now = Math.min(m.goal, Math.round((m.now + 1) * 10) / 10);   // 누를 때마다 +1
      card.classList.remove('bump'); void card.offsetWidth; card.classList.add('bump');
      if (m.now >= m.goal) {
        m.cleared = true;
        missionsDone += 1;
        addCoins(m.reward);
        // +코인 날아오르기
        const fly = document.createElement('span');
        fly.className = 'mi-fly';
        fly.textContent = `+${m.reward} 코인`;
        fly.style.top = `${top + 10}px`;
        canvas.appendChild(fly);
        setTimeout(() => fly.remove(), 1300);
        toast(`미션 클리어! 🎉 ${m.reward}코인을 받았어요`);
      }
      paint(); paintTop();
    });
    paint();
  });
  paintTop();
})();

/* ---------- 코인: 모든 화면에 같은 값으로 ----------
   미션에서 받은 코인이 홈 · 메달 · 미션 · 상점 화면 위쪽 코인에 모두 반영돼요 */
const COIN_SCREENS = {
  'f-1-1041': 'n', 'f-628-3399': 'n', 'f-278-3841': 'n', 'f-609-3854': 'n',
  'f-603-3586': 'n', 'f-603-4688': 'n', 'f-603-4888': 'n',
  'f-608-2766': 'dim', 'f-608-1928': 'dim', 'f-608-2147': 'dim',   // 팝업이 열린 상태라 어둡게 보이는 화면
};
Object.entries(COIN_SCREENS).forEach(([id, kind]) => {
  const canvas = document.querySelector(`#${id} .canvas`);
  if (canvas) canvas.insertAdjacentHTML('beforeend', `<span class="coin-num ${kind}"></span>`);
});
function paintCoins(pop) {
  const els = [...document.querySelectorAll('.coin-num'), document.querySelector('#appHeader .pill span')];
  els.forEach(el => {
    if (!el) return;
    el.textContent = coins >= COIN_MAX ? '10K' : coins;
    el.classList.toggle('long', coins >= 1000 && coins < COIN_MAX);
    if (pop) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  });
}
const COIN_MAX = 10000;   // 코인은 최대 10,000개 (10K)
function addCoins(n) { coins = Math.max(0, Math.min(COIN_MAX, coins + n)); paintCoins(true); }
paintCoins(false);

/* ---------- 하단 탭바: 지금 있는 탭을 파랗게 표시 ---------- */
const TAB_OF = id => {
  if (id === 'home') return 'home';
  if (/^f-(278-3841|609-3854|603-3586|603-4688|603-4888|608-2766|608-1928|608-2147)$/.test(id)) return 'shop';
  if (id === 'f-1-1041' || id === 'f-628-3399') return 'medal';
  if (id === 'f-67-1562' || id.startsWith('f-632-')) return 'profile';
  if (/^f-(136-1566|146-1918|181-3907)$/.test(id) || id === 'event') return 'chat';
    if (id === 'roomDetail' || id === 'closetShop') return 'shop';
  return null;                       // 알림·설정 등은 직전 탭 표시를 그대로 둬요
};
const tabButtons = {
  shop: document.querySelector('#tabbar [data-tab-go="f-278-3841"]'),
  medal: document.querySelector('#tabbar [data-tab-go="f-1-1041"]'),
  home: document.getElementById('tabCenter'),
  profile: document.querySelector('#tabbar [data-tab-go="f-67-1562"]'),
  chat: document.querySelector('#tabbar [data-tab-go="f-136-1566"]'),
};
const tabLabels = [...document.querySelectorAll('#tabbar .tab-label')];   // 상점 메달 홈 프로필 소통 순서
const tabOrder = ['shop', 'medal', 'home', 'profile', 'chat'];
let activeTab = 'home';
function updateTabbar() {
  if (!current) return;
  const t = TAB_OF(current.id);
  if (t) activeTab = t;
  tabOrder.forEach((k, i) => {
    tabButtons[k] && tabButtons[k].classList.toggle('active', k === activeTab);
    tabLabels[i] && tabLabels[i].classList.toggle('active', k === activeTab);
  });
  // 메달 탭에 들어가면 빨간 숫자 배지는 확인한 것으로 처리
  if (activeTab === 'medal') document.querySelector('#tabbar [data-tab-go="f-1-1041"]').classList.add('seen');
}
const _updateChrome = updateChrome;
updateChrome = function () { _updateChrome(); updateTabbar(); };
updateTabbar();

/* =========================================================
   프로필 화면: 누르면 자세히 볼 수 있게
   ========================================================= */
// 아래에서 올라오는 공통 창
const pSheet = (() => {
  const wrap = document.createElement('div');
  wrap.className = 'sheet-wrap ps-sheet';
  wrap.innerHTML = `<div class="sheet-backdrop" data-ps-close></div>
    <div class="ps-panel"><span class="cal-handle"></span><p class="ps-title t-bold"></p><div class="ps-body"></div></div>`;
  document.getElementById('phone').insertBefore(wrap, document.getElementById('statusBar'));
  wrap.querySelector('[data-ps-close]').addEventListener('click', () => wrap.classList.remove('open'));
  return {
    open(title, html) {
      wrap.querySelector('.ps-title').textContent = title;
      wrap.querySelector('.ps-body').innerHTML = html;
      wrap.querySelector('.ps-body').scrollTop = 0;
      wrap.classList.add('open');
      return wrap.querySelector('.ps-body');
    },
    close() { wrap.classList.remove('open'); },
  };
})();

/* ---------- 러닝 기록 데이터 (달력 · 목록에서 같이 써요) ---------- */
const RUNS = (() => {
  const runs = {};
  const today = new Date();
  // 이번 주: 월~목 달림
  const mon = new Date(today); mon.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  // 지난 4달: 주 2~3회 정도 (늘 같은 결과가 나오게 날짜로 계산)
  for (let d = 1; d <= 120; d++) {
    const day = new Date(mon); day.setDate(mon.getDate() - d);
    const k = day.getFullYear() * 400 + day.getMonth() * 31 + day.getDate();
    if ((k * 37) % 7 < 3) runs[day.toDateString()] = 0;
  }
  for (let i = 0; i < 4; i++) { const d = new Date(mon); d.setDate(mon.getDate() + i); if (d <= today) runs[d.toDateString()] = 0; }   // 오늘까지만
  // 각 날의 거리 · 시간
  Object.keys(runs).forEach((k, i) => {
    const km = Math.round((2.5 + ((i * 53) % 37) / 10) * 100) / 100;
    const pace = 5.3 + ((i * 17) % 11) / 10;                // 분/km
    runs[k] = { km, min: Math.round(km * pace) };
  });
  return { map: runs, mon };
})();
const fmtMin = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:00`;
const fmtPace = r => { const p = r.min / r.km; return `${Math.floor(p)}'${String(Math.round((p % 1) * 60)).padStart(2, '0')}"`; };

/* ---------- 이번주 러닝 → 달력 ---------- */
function openRunCalendar() {
  let view = new Date(); view.setDate(1);
  const body = pSheet.open('러닝 달력', `
    <div class="rc-head">
      <button type="button" class="cal-nav" data-m="-1" aria-label="이전 달">‹</button>
      <b class="rc-month"></b>
      <button type="button" class="cal-nav" data-m="1" aria-label="다음 달">›</button>
    </div>
    <div class="cal-week"><span class="sun">일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span class="sat">토</span></div>
    <div class="rc-grid"></div>
    <div class="rc-sum"></div>
    <div class="rc-detail">달린 날짜를 누르면 그날 기록을 볼 수 있어요</div>`);
  const today = new Date();
  const weekStart = RUNS.mon, weekEnd = new Date(RUNS.mon); weekEnd.setDate(weekEnd.getDate() + 6);
  function draw() {
    const y = view.getFullYear(), m = view.getMonth();
    body.querySelector('.rc-month').textContent = `${y}년 ${m + 1}월`;
    const grid = body.querySelector('.rc-grid'); grid.innerHTML = '';
    for (let i = 0; i < new Date(y, m, 1).getDay(); i++) grid.appendChild(document.createElement('span'));
    let cnt = 0, km = 0;
    const days = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const date = new Date(y, m, d);
      const run = RUNS.map[date.toDateString()];
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = d;
      if (run && date <= today) { b.classList.add('ran'); cnt++; km += run.km; }
      if (date.toDateString() === today.toDateString()) b.classList.add('today');
      if (date >= weekStart && date <= weekEnd) b.classList.add('wk');
      if (date > today) b.disabled = true;
      b.addEventListener('click', () => {
        grid.querySelectorAll('.pick').forEach(x => x.classList.remove('pick'));
        b.classList.add('pick');
        const box = body.querySelector('.rc-detail');
        box.innerHTML = run
          ? `<b>${m + 1}월 ${d}일 러닝 🏃</b><div class="rc-stats"><span><em>${run.km.toFixed(2)}</em>km</span><span><em>${fmtMin(run.min)}</em>시간</span><span><em>${fmtPace(run)}</em>페이스</span><span><em>${Math.round(run.km * 68)}</em>kcal</span></div>`
          : `<b>${m + 1}월 ${d}일</b><small>이날은 쉬었어요 😴</small>`;
      });
      grid.appendChild(b);
    }
    // 항상 6줄(42칸)로 그려서 달마다 달력 크기가 바뀌지 않게
    while (grid.children.length < 42) grid.appendChild(Object.assign(document.createElement('span'), { className: 'rc-blank' }));
    body.querySelector('.rc-detail').innerHTML = '달린 날짜를 누르면 그날 기록을 볼 수 있어요';
    body.querySelector('.rc-sum').innerHTML = `이번 달 <b>${cnt}회</b> · 총 <b>${km.toFixed(1)}km</b> 달렸어요`;
    body.querySelector('[data-m="1"]').disabled = y === today.getFullYear() && m === today.getMonth();
  }
  body.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { view.setMonth(view.getMonth() + Number(b.dataset.m)); draw(); }));
  draw();
}

/* ---------- 누적 러닝 · 친구 · 팔로잉 · 팔로우 ---------- */
const PEOPLE = [
  ['지훈', 12, '#ffb36b'], ['러닝메이트', 7, '#7fa8ff'], ['오늘도러닝', 11, '#8fd19e'], ['바람처럼', 8, '#c59bff'],
  ['하늘을달리다', 5, '#ff9cb8'], ['한강러너', 9, '#6fcfe0'], ['새벽조깅', 6, '#f5c84c'], ['5km요정', 4, '#ff8a7a'],
  ['달려라하니', 13, '#9ad0ff'], ['페이스메이커', 10, '#b4e08a'], ['주말러너', 3, '#ffc2e0'], ['꾸준히한걸음', 7, '#a5b4fc'],
  ['초보러너', 2, '#ffd59a'], ['마라톤꿈나무', 6, '#86e3c3'], ['러닝일기', 8, '#e0b0ff'], ['공원한바퀴', 5, '#9fc5ff'],
  ['아침햇살', 9, '#ffcf7a'], ['밤달리기', 4, '#b9a7ff'],
];
function personRow(p, action) {
  return `<div class="pl-row"><i style="background:${p[2]}">${p[0][0]}</i><div><b>${p[0]}</b><small>Lv.${p[1]} · 최근 기록 ${(3 + p[1] * .3).toFixed(1)}km</small></div>${action}</div>`;
}
function openPeople(kind) {
  if (kind === 'runs') {
    const list = Object.entries(RUNS.map).sort((a, b) => new Date(b[0]) - new Date(a[0])).slice(0, 8);
    const body = pSheet.open('누적 러닝 32회', `
      <div class="pl-sum"><span><em>32</em>회</span><span><em>135.4</em>km</span><span><em>17:37</em>시간</span></div>
      ${list.map(([k, r]) => { const d = new Date(k); return `<div class="run-row"><i>🏃</i><div><b>${d.getMonth() + 1}월 ${d.getDate()}일 ${['일', '월', '화', '수', '목', '금', '토'][d.getDay()]}요일 러닝</b><small>${fmtMin(r.min)} · ${fmtPace(r)}/km</small></div><em>${r.km.toFixed(2)}km</em></div>`; }).join('')}
      <button type="button" class="btn-primary ps-btn" data-all>전체 기록 보기</button>`);
    body.querySelector('[data-all]').addEventListener('click', () => { pSheet.close(); go('f-632-4121'); });
    return;
  }
  const cfg = {
    friends: ['친구 5명', PEOPLE.slice(0, 5), p => `<button type="button" class="pl-btn" data-msg>메시지</button>`],
    following: ['팔로잉 12명', PEOPLE.slice(0, 12), () => `<button type="button" class="pl-btn on" data-follow>팔로잉</button>`],
    followers: ['팔로우 18명', PEOPLE.slice(0, 18), (p, i) => i < 12 ? `<button type="button" class="pl-btn on" data-follow>팔로잉</button>` : `<button type="button" class="pl-btn" data-follow>맞팔로우</button>`],
  }[kind];
  const body = pSheet.open(cfg[0], cfg[1].map((p, i) => personRow(p, cfg[2](p, i))).join(''));
  body.querySelectorAll('[data-msg]').forEach(b => b.addEventListener('click', () => { pSheet.close(); go('f-148-1782'); }));
  body.querySelectorAll('[data-follow]').forEach(b => b.addEventListener('click', () => {
    const on = !b.classList.contains('on');
    b.classList.toggle('on', on);
    b.textContent = on ? '팔로잉' : '팔로우';
    toast(on ? '팔로우했어요' : '팔로우를 취소했어요');
  }));
}

/* ---------- 올해 러닝 인사이트 ---------- */
function bars(items, unit, hi) {
  const max = Math.max(...items.map(x => x[1]));
  return `<div class="ib-chart">${items.map(([l, v], i) => `<div class="ib-col${i === hi ? ' hi' : ''}"><span>${v}${unit}</span><i style="height:${Math.round(v / max * 100)}%"></i><b>${l}</b></div>`).join('')}</div>`;
}
function openInsight(kind) {
  if (kind === 'time') pSheet.open('가장 많이 달린 시간대', `<p class="ib-lead">주로 <b>오전 7시~9시</b>에 달렸어요 ☀️</p>${bars([['새벽', 3], ['아침', 14], ['낮', 4], ['저녁', 8], ['밤', 3]], '회', 1)}<p class="ib-tip">아침 러닝은 하루를 활기차게 시작하는 데 좋아요!</p>`);
  if (kind === 'day') pSheet.open('가장 활발한 요일', `<p class="ib-lead"><b>일요일</b>에 가장 많이 달렸어요 📅</p>${bars([['월', 4], ['화', 3], ['수', 5], ['목', 4], ['금', 2], ['토', 6], ['일', 8]], '회', 6)}<p class="ib-tip">평일에도 한 번 더 달리면 주간 목표를 채울 수 있어요.</p>`);
  if (kind === 'month') pSheet.open('평균 월간 거리', `<p class="ib-lead">한 달에 평균 <b>20.61km</b> 달렸어요 👟</p>${bars([['7월', 16.2], ['8월', 18.4], ['9월', 21.0], ['10월', 23.5], ['11월', 24.0]], '', 4)}<p class="ib-tip">지난달보다 거리가 늘었어요. 이 페이스 그대로!</p>`);
}

/* ---------- 총 거리 · 총 시간 · 총 칼로리 · 평균 페이스 → 기록 화면의 같은 칸으로 ---------- */
function goStat(i) {
  go('f-632-4904');
  const sc = document.getElementById('f-632-4904');
  const cell = [[22, 463], [200, 463], [22, 550], [200, 550]][i];
  setTimeout(() => {
    sc.scrollTo({ top: cell[1] - 220, behavior: 'smooth' });
    const hl = document.createElement('div');
    hl.className = 'stat-hl';
    hl.style.cssText = `left:${cell[0]}px;top:${cell[1]}px`;
    sc.querySelector('.canvas').appendChild(hl);
    setTimeout(() => hl.remove(), 2200);
  }, 350);
}

/* ---------- 프로필 화면에 누를 수 있는 영역 만들기 ---------- */
(function profileHotspots() {
  const canvas = document.querySelector('#f-67-1562 .canvas');
  const add = (x, y, w, h, fn, label) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'hs';
    b.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    b.setAttribute('aria-label', label);
    b.addEventListener('click', fn);
    canvas.appendChild(b);
  };
  add(22, 330, 98, 58, () => openPeople('runs'), '누적 러닝');
  add(120, 330, 85, 58, () => openPeople('friends'), '친구');
  add(205, 330, 87, 58, () => openPeople('following'), '팔로잉');
  add(292, 330, 88, 58, () => openPeople('followers'), '팔로우');
  add(22, 420, 280, 125, openRunCalendar, '이번주 러닝 달력');
  add(302, 470, 78, 75, openRunCalendar, '주간 목표');
  add(304, 430, 70, 34, () => go('f-632-4904'), '기록 보기');
  add(22, 559, 178, 78, () => goStat(0), '총 거리');
  add(200, 559, 180, 78, () => goStat(1), '총 시간');
  add(22, 645, 178, 78, () => goStat(2), '총 칼로리');
  add(200, 645, 180, 78, () => goStat(3), '평균 페이스');
  add(30, 778, 105, 50, () => openInsight('time'), '가장 많이 달린 시간대');
  add(148, 778, 105, 50, () => openInsight('day'), '가장 활발한 요일');
  add(267, 778, 105, 50, () => openInsight('month'), '평균 월간 거리');
})();

/* =========================================================
   활동 기록 화면 (주 · 월 · 년 · 전체): 누르면 자세히 보기
   ========================================================= */
const REC = {
  'f-632-4904': { label: '3월 30일 ~ 4월 5일', km: 15.0, runs: 2, time: '1:31:40', kcal: 1480, pace: "6'07\"",
    chart: [['월', 0], ['화', 0], ['수', 0], ['목', 5.0], ['금', 0], ['토', 10.0], ['일', 0]], unit: '요일별',
    periods: ['3월 30일 ~ 4월 5일', '3월 23일 ~ 3월 29일', '3월 16일 ~ 3월 22일', '3월 9일 ~ 3월 15일'] },
  'f-632-4646': { label: '2026년 4월', km: 30.0, runs: 4, time: '2:57:30', kcal: 3790, pace: "5'55\"",
    chart: [['1주', 5.0], ['2주', 10.0], ['3주', 0], ['4주', 15.0], ['5주', 0]], unit: '주별',
    periods: ['2026년 4월', '2026년 3월', '2026년 2월', '2026년 1월'] },
  'f-632-4374': { label: '2026년', km: 83.0, runs: 12, time: '8:08:57', kcal: 9890, pace: "5'53\"",
    chart: [['1월', 8.2], ['2월', 12.5], ['3월', 22.3], ['4월', 30.0], ['5월', 10.0]], unit: '월별',
    periods: ['2026년', '2025년', '2024년', '2023년'] },
  'f-632-4121': { label: '2023년 ~ 2026년', km: 135.4, runs: 32, time: '17:37:53', kcal: 12890, pace: "7'49\"",
    chart: [['2023', 32.2], ['2024', 7.5], ['2025', 13.3], ['2026', 83.0]], unit: '연도별',
    periods: ['2023년 ~ 2026년'] },
};
const RECENT = [
  { date: '5/18/26', name: '일요일 야간 러닝', km: 10.00, pace: "6'15\"", time: '1:02:28', map: 'screens/map1.jpg' },
  { date: '5/10/26', name: '일요일 야간 러닝', km: 5.02, pace: "5'15\"", time: '25:46', map: 'screens/map2.jpg' },
  { date: '4/26/26', name: '일요일 야간 러닝', km: 5.00, pace: "5'00\"", time: '25:00', map: 'screens/map3.jpg' },
];

function recSummary(r) {
  return `<div class="pl-sum rec-sum"><span><em>${r.km}</em>km</span><span><em>${r.runs}</em>회</span><span><em>${r.time}</em></span></div>`;
}
// 기간 고르기 (날짜 옆 ∨)
function openPeriod(id) {
  const r = REC[id];
  const body = pSheet.open('기간 선택', `
    ${r.periods.map((p, i) => `<button type="button" class="per-row${i === 0 ? ' on' : ''}" data-i="${i}"><span>${p}</span><b>${i === 0 ? '✓' : ''}</b></button>`).join('')}
    <div class="per-note">선택한 기간의 기록을 아래에서 미리 볼 수 있어요</div>
    <div class="per-prev"></div>`);
  const prev = body.querySelector('.per-prev');
  const showPrev = i => {
    const k = Math.max(.35, 1 - i * .22);
    prev.innerHTML = `<b>${r.periods[i]}</b>${recSummary({ km: (r.km * k).toFixed(1), runs: Math.max(1, Math.round(r.runs * k)), time: i === 0 ? r.time : '—' })}`;
  };
  body.querySelectorAll('.per-row').forEach(b => b.addEventListener('click', () => {
    body.querySelectorAll('.per-row').forEach(x => { x.classList.toggle('on', x === b); x.querySelector('b').textContent = x === b ? '✓' : ''; });
    showPrev(Number(b.dataset.i));
  }));
  showPrev(0);
}
// 요약 카드 / 통계 칸 → 자세한 그래프
function openRecStat(id, kind) {
  const r = REC[id];
  const cfg = {
    km: ['총 거리', `${r.km} km`, r.chart, 'km'],
    time: ['총 시간', r.time, r.chart.map(([l, v]) => [l, Math.round(v * 6.1)]), '분'],
    kcal: ['총 칼로리', `${r.kcal.toLocaleString()} kcal`, r.chart.map(([l, v]) => [l, Math.round(v * 98)]), ''],
    pace: ['평균 페이스', `${r.pace} /km`, r.chart.map(([l, v]) => [l, v ? +(5.2 + (l.length % 3) * .4).toFixed(1) : 0]), '′'],
    all: ['기간 요약', `${r.km} km`, r.chart, 'km'],
  }[kind];
  const vals = cfg[2];
  const hi = vals.reduce((m, x, i) => (x[1] > vals[m][1] ? i : m), 0);
  pSheet.open(`${cfg[0]} · ${r.label}`, `
    <p class="ib-lead"><b class="big">${cfg[1]}</b></p>
    ${recSummary(r)}
    <p class="rec-cap">${r.unit} ${cfg[0]}</p>
    ${bars(vals.map(([l, v]) => [l, v]), cfg[3], hi)}
    <p class="ib-tip">${kind === 'pace' ? '숫자가 작을수록 빠르게 달렸어요' : `가장 많이 달린 때는 <b>${vals[hi][0]}</b>이에요`}</p>`);
}
// 그래프 카드
function openChart(id, which) {
  const r = REC[id];
  if (which === 'add') {
    const body = pSheet.open('기록 직접 추가', `
      <label class="add-row"><span>날짜</span><input type="date" value="${new Date().toISOString().slice(0, 10)}" /></label>
      <label class="add-row"><span>거리 (km)</span><input type="number" step="0.1" min="0" placeholder="예: 5.0" data-km /></label>
      <label class="add-row"><span>시간 (분)</span><input type="number" min="0" placeholder="예: 30" data-min /></label>
      <button type="button" class="btn-primary ps-btn" data-save>저장하기</button>`);
    body.querySelector('[data-save]').addEventListener('click', () => {
      const km = parseFloat(body.querySelector('[data-km]').value);
      if (!km) { toast('거리를 입력해주세요'); return; }
      pSheet.close(); toast(`${km}km 기록을 추가했어요 🏃`);
    });
    return;
  }
  if (which === 'pace') { openRecStat(id, 'pace'); return; }
  openRecStat(id, 'km');
}
// 최근 활동 한 건
function openRun(i) {
  const r = RECENT[i];
  const [pm, ps] = r.pace.match(/\d+/g).map(Number);
  const baseSec = pm * 60 + ps;                                   // 평균 페이스(초)
  pSheet.open(`${r.date} ${r.name}`, `
    <img class="run-map" src="${r.map}" alt="러닝 경로" />
    <div class="pl-sum"><span><em>${r.km.toFixed(2)}</em>km</span><span><em>${r.pace}</em>/km</span><span><em>${r.time}</em></span></div>
    <p class="rec-cap">구간 기록</p>
    ${Array.from({ length: Math.ceil(r.km) }, (_, k) => {
      const d = k < Math.floor(r.km) ? 1 : +(r.km % 1).toFixed(2);
      const sec = baseSec + ((k * 7) % 5 - 2) * 6;                  // 구간마다 조금씩 다르게
      const sp = `${Math.floor(sec / 60)}'${String(sec % 60).padStart(2, '0')}"`;
      return `<div class="split-row"><span>${k + 1} km</span><i><b style="width:${Math.round(d * (70 + ((k * 13) % 30)))}%"></b></i><em>${sp}</em></div>`;
    }).join('')}`);
}
function openRecentAll() {
  const body = pSheet.open('최근 활동', RECENT.concat(RECENT.map(x => ({ ...x, date: x.date.replace('/26', '/26'), name: '주말 아침 러닝' }))).map((r, i) => `
    <button type="button" class="run-row rr" data-i="${i % 3}"><img src="${r.map}" alt="" /><div><b>${r.date} ${r.name}</b><small>${r.pace}/km · ${r.time}</small></div><em>${r.km.toFixed(2)}km</em></button>`).join(''));
  body.querySelectorAll('.rr').forEach(b => b.addEventListener('click', () => openRun(Number(b.dataset.i))));
}

(function recordHotspots() {
  Object.keys(REC).forEach(id => {
    const canvas = document.querySelector(`#${id} .canvas`);
    if (!canvas) return;
    const add = (x, y, w, h, fn, label) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'hs';
      b.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
      b.setAttribute('aria-label', label);
      b.addEventListener('click', fn);
      canvas.appendChild(b);
    };
    add(22, 300, 358, 148, () => openRecStat(id, 'all'), '기간 요약');
    add(30, 268, 150, 32, () => openPeriod(id), '기간 선택');
    add(22, 463, 178, 77, () => openRecStat(id, 'km'), '총 거리');
    add(200, 463, 180, 77, () => openRecStat(id, 'time'), '총 시간');
    add(22, 550, 178, 77, () => openRecStat(id, 'kcal'), '총 칼로리');
    add(200, 550, 180, 77, () => openRecStat(id, 'pace'), '평균 페이스');
    add(22, 685, 358, 220, () => openChart(id, 'km'), '거리 그래프');
    add(334, 650, 44, 40, () => openChart(id, 'add'), '기록 추가');
    add(22, 922, 358, 262, () => openChart(id, 'pace'), '페이스 그래프');
    add(316, 1204, 60, 30, openRecentAll, '최근 활동 더보기');
    [1238, 1316, 1394].forEach((y, i) => add(30, y - 4, 345, 70, () => openRun(i), `최근 활동 ${i + 1}`));
    add(30, 1515, 105, 52, () => openInsight('time'), '가장 많이 달린 시간대');
    add(148, 1515, 105, 52, () => openInsight('day'), '가장 활발한 요일');
    add(267, 1515, 105, 52, () => openInsight('month'), '평균 월간 거리');
  });
})();

/* =========================================================
   설정 화면: 모든 항목 사용 가능하게
   ========================================================= */
// 효과음 (켜져 있으면 버튼을 누를 때 '톡' 소리)
const sound = { fx: true, bgm: false, ctx: null, bgmTimer: null };
function audio() { if (!sound.ctx) sound.ctx = new (window.AudioContext || window.webkitAudioContext)(); return sound.ctx; }
function tick(freq = 880, len = .06, vol = .05) {
  try {
    const c = audio(), o = c.createOscillator(), g = c.createGain();
    o.frequency.value = freq; o.type = 'sine';
    g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + len);
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + len);
  } catch (e) {}
}
document.addEventListener('pointerdown', e => { if (sound.fx && e.target.closest('button')) tick(); });
// 배경 음악 (부드러운 반복 멜로디)
function bgm(on) {
  clearInterval(sound.bgmTimer);
  if (!on) return;
  const notes = [523, 659, 784, 659, 587, 698, 880, 698];
  let i = 0;
  const play = () => { tick(notes[i % notes.length], .5, .025); i++; };
  play(); sound.bgmTimer = setInterval(play, 520);
}

function setNickname(v) {
  const input = document.getElementById('nickInput');
  input.value = v;
  input.dispatchEvent(new Event('input'));       // 모든 화면 닉네임 같이 바뀜
}

(function settings() {
  const canvas = document.querySelector('#f-1-2966 .canvas');
  const add = (x, y, w, h, fn, label) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'hs';
    b.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    b.setAttribute('aria-label', label);
    b.addEventListener('click', fn);
    canvas.appendChild(b);
    return b;
  };
  // 프로필 카드 닉네임 (온보딩 닉네임과 같게)
  canvas.insertAdjacentHTML('beforeend', '<span class="set-name" id="setName"></span>');
  const nameEl = document.getElementById('setName');
  const syncName = () => {
    const n = document.getElementById('nickInput').value.trim();
    nameEl.textContent = n; nameEl.classList.toggle('show', !!n);
  };
  document.getElementById('nickInput').addEventListener('input', syncName);

  // ---- 프로필 카드 ----
  const editName = () => {
    const body = pSheet.open('닉네임 바꾸기', `
      <label class="add-row"><span>닉네임</span><input type="text" maxlength="12" value="${document.getElementById('nickInput').value || '숨참혜성'}" data-nick /></label>
      <p class="per-note">2자 이상 12자 이하로 정해주세요</p>
      <button type="button" class="btn-primary ps-btn" data-save>저장하기</button>`);
    const inp = body.querySelector('[data-nick]');
    setTimeout(() => { inp.focus(); inp.select(); }, 350);
    body.querySelector('[data-save]').addEventListener('click', () => {
      const v = inp.value.trim();
      if (v.length < 2) { toast('닉네임을 2자 이상 입력해주세요'); return; }
      setNickname(v); pSheet.close(); toast('닉네임을 바꿨어요');
    });
  };
  const openLevel = () => pSheet.open('내 레벨', `
    <div class="lv-box"><b>Lv.10</b><span>러닝 루키</span>
      <i><em style="width:75%"></em></i><small>다음 레벨까지 <b>350 EXP</b> (75%)</small></div>
    <p class="rec-cap">경험치 얻는 방법</p>
    <div class="run-row"><i>🏃</i><div><b>러닝하기</b><small>1km 달릴 때마다</small></div><em>+10</em></div>
    <div class="run-row"><i>✅</i><div><b>미션 클리어</b><small>미션을 완료할 때마다</small></div><em>+20</em></div>
    <div class="run-row"><i>🏅</i><div><b>메달 획득</b><small>새 메달을 받을 때마다</small></div><em>+50</em></div>
    <div class="run-row"><i>💬</i><div><b>친구 응원</b><small>다른 러너를 응원할 때마다</small></div><em>+5</em></div>`);
  add(32, 127, 338, 138, openLevel, '레벨 보기');
  add(205, 140, 40, 38, editName, '닉네임 바꾸기');

  // ---- 계정 설정 ----
  add(32, 322, 338, 48, () => {
    const body = pSheet.open('프로필 관리', `
      <div class="pm-top"><img src="${document.getElementById('homeAv').src}" alt="" /><button type="button" class="pl-btn" data-photo>사진 바꾸기</button></div>
      <label class="add-row"><span>닉네임</span><input type="text" maxlength="12" value="${document.getElementById('nickInput').value || '숨참혜성'}" data-nick /></label>
      <label class="add-row"><span>한 줄 소개</span><input type="text" maxlength="20" value="오늘도 좋은 하루에요!" /></label>
      <button type="button" class="btn-primary ps-btn" data-save>저장하기</button>`);
    body.querySelector('[data-photo]').addEventListener('click', () => document.getElementById('avatarInput').click());
    document.getElementById('avatarInput').addEventListener('change', () => setTimeout(() => {
      const img = body.querySelector('.pm-top img'); if (img) img.src = document.getElementById('homeAv').src;
    }, 400), { once: true });
    body.querySelector('[data-save]').addEventListener('click', () => {
      const v = body.querySelector('[data-nick]').value.trim();
      if (v.length < 2) { toast('닉네임을 2자 이상 입력해주세요'); return; }
      setNickname(v); pSheet.close(); toast('프로필을 저장했어요');
    });
  }, '프로필 관리');

  let weekGoal = 4, distGoal = 5;
  add(32, 370, 338, 48, () => {
    const body = pSheet.open('목표 설정', `
      <div class="gs-row"><span>주간 러닝 목표</span><div><button type="button" class="step-btn" data-w="-1">−</button><b data-wv>${weekGoal}일</b><button type="button" class="step-btn" data-w="1">+</button></div></div>
      <div class="gs-row"><span>1회 목표 거리</span><div><button type="button" class="step-btn" data-d="-1">−</button><b data-dv>${distGoal}km</b><button type="button" class="step-btn" data-d="1">+</button></div></div>
      <button type="button" class="btn-primary ps-btn" data-save>저장하기</button>`);
    body.querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => { weekGoal = Math.min(7, Math.max(1, weekGoal + +b.dataset.w)); body.querySelector('[data-wv]').textContent = `${weekGoal}일`; }));
    body.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { distGoal = Math.min(42, Math.max(1, distGoal + +b.dataset.d)); body.querySelector('[data-dv]').textContent = `${distGoal}km`; }));
    body.querySelector('[data-save]').addEventListener('click', () => { pSheet.close(); toast(`주 ${weekGoal}일 · ${distGoal}km 목표로 저장했어요`); });
  }, '목표 설정');

  add(32, 418, 338, 48, () => {
    const apps = [['🍎', 'Apple 건강', true], ['💚', 'Google 피트니스', false], ['💙', 'Samsung Health', false], ['⌚', 'Garmin Connect', false]];
    const body = pSheet.open('데이터 연동', `<p class="per-note">연동하면 다른 앱의 러닝 기록도 Runi에 모여요</p>` +
      apps.map(([ic, n, on]) => `<div class="run-row"><i>${ic}</i><div><b>${n}</b><small>${on ? '연동됨 · 방금 동기화' : '연동 안 됨'}</small></div><button type="button" class="pl-btn${on ? ' on' : ''}" data-app="${n}">${on ? '연동 해제' : '연동하기'}</button></div>`).join(''));
    body.querySelectorAll('[data-app]').forEach(b => b.addEventListener('click', () => {
      const on = !b.classList.contains('on');
      b.classList.toggle('on', on); b.textContent = on ? '연동 해제' : '연동하기';
      b.previousElementSibling.querySelector('small').textContent = on ? '연동됨 · 방금 동기화' : '연동 안 됨';
      toast(`${b.dataset.app} ${on ? '연동했어요' : '연동을 해제했어요'}`);
    }));
  }, '데이터 연동');

  let lastBackup = '2026.11.10 21:30';
  add(32, 466, 338, 46, () => {
    const body = pSheet.open('백업 및 복원', `
      <div class="bk-box"><span>☁️</span><b>마지막 백업</b><small data-last>${lastBackup}</small><i><em data-bar></em></i></div>
      <button type="button" class="btn-primary ps-btn" data-backup>지금 백업하기</button>
      <button type="button" class="ps-btn2" data-restore>백업에서 복원하기</button>`);
    body.querySelector('[data-backup]').addEventListener('click', e => {
      const btn = e.currentTarget, bar = body.querySelector('[data-bar]');
      btn.disabled = true; btn.textContent = '백업 중…';
      bar.style.transition = 'none'; bar.style.width = '0'; void bar.offsetWidth;
      bar.style.transition = 'width 1.4s ease'; bar.style.width = '100%';
      setTimeout(() => {
        const d = new Date();
        lastBackup = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        body.querySelector('[data-last]').textContent = lastBackup;
        btn.disabled = false; btn.textContent = '지금 백업하기'; toast('백업을 완료했어요 ☁️');
      }, 1500);
    });
    body.querySelector('[data-restore]').addEventListener('click', () => { pSheet.close(); toast(`${lastBackup} 백업으로 복원했어요`); });
  }, '백업 및 복원');

  // ---- 알림 설정 (스위치) ----
  [['푸시 알림', 577], ['미션 리마인드', 625], ['이벤트 및 업데이트', 673]].forEach(([name, top]) => {
    const t = document.createElement('button');
    t.type = 'button'; t.className = 'set-toggle on'; t.style.top = `${top}px`;
    t.setAttribute('role', 'switch'); t.setAttribute('aria-checked', 'true'); t.setAttribute('aria-label', name);
    t.innerHTML = '<i></i>';
    t.addEventListener('click', () => {
      const on = !t.classList.contains('on');
      t.classList.toggle('on', on); t.setAttribute('aria-checked', on);
      toast(`${name} ${on ? '켰어요' : '껐어요'}`);
      if (name === '푸시 알림') {   // 알림 배지도 같이 숨기기
        document.querySelectorAll('img[src*="badge-bell"], .badge-num').forEach(el => { if (el.closest('.ic-btn')) el.style.visibility = on ? '' : 'hidden'; });
      }
    });
    canvas.appendChild(t);
    add(32, top - 13, 260, 46, () => t.click(), `${name} 줄`);
  });

  // ---- 앱 설정 (값 고르기) ----
  const val = (y, text) => {
    canvas.insertAdjacentHTML('beforeend', `<span class="set-val" style="top:${y - 10}px">${text}</span>`);
    return canvas.lastElementChild;
  };
  const choose = (title, opts, cur, onPick) => {
    const body = pSheet.open(title, opts.map(o => `<button type="button" class="per-row${o === cur ? ' on' : ''}"><span>${o}</span><b>${o === cur ? '✓' : ''}</b></button>`).join(''));
    body.querySelectorAll('.per-row').forEach(b => b.addEventListener('click', () => { onPick(b.querySelector('span').textContent); pSheet.close(); }));
  };
  const themeV = val(784, '라이트 모드'), langV = val(833, '한국어'), bgmV = val(880, '끄기'), fxV = val(928, '켜기');
  add(32, 760, 338, 48, () => choose('테마 설정', ['라이트 모드', '다크 모드', '시스템 설정'], themeV.textContent, v => {
    if (v === '다크 모드') { toast('다크 모드는 다음 업데이트에서 만나요 🌙'); return; }   // 아직 화면 디자인이 없어요
    themeV.textContent = v;
    toast(`${v}로 바꿨어요`);
  }), '테마 설정');
  add(32, 808, 338, 48, () => choose('언어 설정', ['한국어', 'English', '日本語'], langV.textContent, v => {
    langV.textContent = v; toast(v === '한국어' ? '한국어로 설정했어요' : `${v}는 다음 업데이트에서 지원돼요`);
  }), '언어 설정');
  add(32, 856, 338, 48, () => {
    sound.bgm = !sound.bgm; bgmV.textContent = sound.bgm ? '켜기' : '끄기'; bgm(sound.bgm);
    toast(`배경 음악 ${sound.bgm ? '켰어요 🎵' : '껐어요'}`);
  }, '배경 음악');
  add(32, 904, 338, 48, () => {
    sound.fx = !sound.fx; fxV.textContent = sound.fx ? '켜기' : '끄기';
    toast(`효과음 ${sound.fx ? '켰어요' : '껐어요'}`);
  }, '효과음');

  // ---- 기타 ----
  add(32, 1004, 338, 48, () => {
    const faq = [['러닝 기록이 저장되지 않아요', 'GPS가 켜져 있는지 확인해주세요. 러닝을 마친 뒤 깃발 버튼을 눌러야 기록이 저장돼요.'],
      ['코인은 어떻게 모으나요?', '미션을 완료하면 코인을 받을 수 있어요. 받은 코인으로 상점에서 방과 루니를 꾸며보세요.'],
      ['캐릭터를 바꾸고 싶어요', '상점 > 캐릭터에서 다른 친구를 만날 수 있어요.'],
      ['다른 앱 기록을 가져올 수 있나요?', '설정 > 데이터 연동에서 건강 앱을 연결하면 자동으로 가져와요.']];
    const body = pSheet.open('고객센터', faq.map(([q, a]) => `<details class="faq"><summary>${q}</summary><p>${a}</p></details>`).join('') +
      `<button type="button" class="btn-primary ps-btn" data-ask>1:1 문의하기</button>`);
    body.querySelector('[data-ask]').addEventListener('click', () => {
      const b2 = pSheet.open('1:1 문의하기', `<textarea class="ask-box" placeholder="궁금한 점이나 불편한 점을 적어주세요" maxlength="300"></textarea><button type="button" class="btn-primary ps-btn" data-send>보내기</button>`);
      b2.querySelector('[data-send]').addEventListener('click', () => {
        if (!b2.querySelector('textarea').value.trim()) { toast('내용을 입력해주세요'); return; }
        pSheet.close(); toast('문의를 보냈어요. 빠르게 답변드릴게요!');
      });
    });
  }, '고객센터');
  const doc = (title, parts) => pSheet.open(title, `<div class="doc">${parts.map(([h, t]) => `<h4>${h}</h4><p>${t}</p>`).join('')}<p class="doc-date">시행일 2026.01.01</p></div>`);
  add(32, 1052, 338, 48, () => doc('이용 약관', [
    ['제1조 (목적)', '이 약관은 Runi(이하 "서비스")를 이용하는 데 필요한 권리, 의무 및 책임 사항을 정하는 것을 목적으로 합니다.'],
    ['제2조 (서비스 내용)', '서비스는 러닝 기록, 미션, 메달, 캐릭터 꾸미기, 커뮤니티 기능을 제공합니다.'],
    ['제3조 (코인)', '코인은 서비스 안에서만 사용할 수 있으며 현금으로 바꿀 수 없습니다.'],
    ['제4조 (이용자의 의무)', '이용자는 다른 이용자를 존중하고, 서비스를 정상적인 방법으로 이용해야 합니다.']]), '이용 약관');
  add(32, 1100, 338, 48, () => doc('개인정보 처리방침', [
    ['1. 수집하는 정보', '닉네임, 성별, 생년월일, 키·몸무게(선택), 러닝 위치와 기록'],
    ['2. 이용 목적', '러닝 기록 분석, 맞춤 목표 추천, 서비스 개선'],
    ['3. 보관 기간', '회원 탈퇴 시 바로 삭제하며, 법령에 따라 보관이 필요한 정보는 정해진 기간 동안 보관합니다.'],
    ['4. 이용자의 권리', '언제든지 내 정보를 확인·수정·삭제할 수 있습니다.']]), '개인정보 처리방침');

  // ---- 로그아웃 (한 번 더 확인) ----
  add(32, 1168, 337, 51, () => {
    const body = pSheet.open('로그아웃', `<p class="ib-lead">정말 로그아웃 하시겠어요?</p>
      <div class="lo-btns"><button type="button" class="ps-btn2" data-no>취소</button><button type="button" class="btn-primary lo-yes" data-yes>로그아웃</button></div>`);
    body.querySelector('[data-no]').addEventListener('click', () => pSheet.close());
    body.querySelector('[data-yes]').addEventListener('click', () => {
      pSheet.close(); navStack.length = 0; show('login', 'fade'); toast('로그아웃했어요');
    });
  }, '로그아웃');
})();

/* =========================================================
   상단 바 하나로 통일: 모든 탭 화면이 같은 상단 바를 같이 써요
   (화면마다 그림 속 위치가 조금씩 달라 흔들려 보이던 문제 해결)
   ========================================================= */
(function sharedHeader() {
  const W = '#fff', REC = '#f4f7fe', PROF = '#f4f2ff';
  // bg: 배경색 · left: 'prof'(사진+닉네임) / 'back'(뒤로) · coin: 코인 표시 · dim: 팝업이 열린 어두운 화면
  const CFG = {
    'home':       { bg: W, left: 'prof', coin: 1 },
    'f-278-3841': { bg: W, left: 'prof', coin: 1 },
    'f-1-1041':   { bg: W, left: 'prof', coin: 1 },
    'f-628-3399': { bg: W, left: 'prof', coin: 1 },
    'f-609-3854': { bg: W, left: 'back', coin: 1 },
    'f-603-3586': { bg: '#f9faff', left: 'back', coin: 1 },
    'f-603-4688': { bg: W, left: 'back', coin: 1 },
    'f-603-4888': { bg: W, left: 'back', coin: 1 },
    'f-608-2766': { bg: '#f9faff', left: 'back', coin: 1, dim: 'rgb(175,174,179)' },
    'f-608-1928': { bg: W, left: 'back', coin: 1, dim: 'rgb(179,179,179)' },
    'f-608-2147': { bg: W, left: 'back', coin: 1, dim: 'rgb(179,179,179)' },
    'f-67-1562':  { bg: PROF, left: 'prof' },
    'f-632-4904': { bg: REC, left: 'prof' }, 'f-632-4646': { bg: REC, left: 'prof' },
    'f-632-4374': { bg: REC, left: 'prof' }, 'f-632-4121': { bg: REC, left: 'prof' },
    'f-136-1566': { bg: W, left: 'prof' }, 'f-146-1918': { bg: W, left: 'prof' }, 'f-181-3907': { bg: W, left: 'prof' },
    'event': { bg: W, left: 'prof' },
    'roomDetail': { bg: '#f9faff', left: 'back', coin: 1 },
    'closetShop': { bg: W, left: 'back', coin: 1 },
  };
  const phone = document.getElementById('phone');
  const homeBar = document.querySelector('#home .topbar');
  const hdr = document.createElement('header');
  hdr.className = 'app-header hidden';
  hdr.id = 'appHeader';
  hdr.innerHTML = `<button type="button" class="ah-back" aria-label="뒤로">
      <svg width="12" height="22" viewBox="0 0 12 22"><path d="M10.5 1.5 1.5 11l9 9.5" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>`;
  // 홈 화면에 있던 프로필 · 코인 · 알림 · 설정을 공통 바로 옮겨요 (위치 · 크기 그대로)
  [...homeBar.children].forEach(el => hdr.appendChild(el));
  hdr.querySelector('.home-prof').setAttribute('role', 'button');
  hdr.querySelector('.home-prof').setAttribute('aria-label', '내 프로필');
  hdr.querySelector('.home-prof').addEventListener('click', () => switchTab('f-67-1562'));
  hdr.querySelector('.ah-back').addEventListener('click', () => back());
  phone.insertBefore(hdr, document.getElementById('tabbar'));
  // 코인 버튼: 누를 때마다 1,000 코인 (최대 10K)
  const coinPill = hdr.querySelector('.pill');
  coinPill.setAttribute('role', 'button');
  coinPill.setAttribute('aria-label', '코인 1,000개 받기');
  coinPill.addEventListener('click', () => {
    if (coins >= COIN_MAX) { toast('코인은 최대 10K까지 모을 수 있어요 💰'); return; }
    const before = coins;
    addCoins(1000);
    toast(`+${(coins - before).toLocaleString()} 코인! 지금 ${coins >= COIN_MAX ? '10K' : coins.toLocaleString()} 코인이에요 🪙`);
    coinPill.classList.remove('tap'); void coinPill.offsetWidth; coinPill.classList.add('tap');
  });

  // 그림 위에 따로 얹었던 닉네임 · 사진 · 코인 숫자는 이제 필요 없어요
  document.querySelectorAll('.hdr-av, .hdr-name, .coin-num').forEach(el => el.remove());

  function paintHeader() {
    const c = current && CFG[current.id];
    hdr.classList.toggle('hidden', !c);
    statusBar.style.background = c ? (c.dim || c.bg) : '';
    statusBar.classList.toggle('with-hdr', !!c);
    if (!c) return;
    hdr.style.setProperty('--hb', c.bg);
    hdr.classList.toggle('is-back', c.left === 'back');
    hdr.classList.toggle('no-coin', !c.coin);
    hdr.classList.toggle('dim', !!c.dim);
    hdr.classList.toggle('scrolled', current.scrollTop > 4);
  }
  const _uc = updateChrome;
  updateChrome = function () { _uc(); paintHeader(); };
  screens.forEach(sc => sc.addEventListener('scroll', () => { if (sc === current) paintHeader(); }));
  paintHeader();
})();
