/* =========================================================
   Runi 웹 – 러닝 · 메달 · 상점 · 기록 · 소통 · 알림/설정 화면
   피그마 화면 이미지 위에 누를 수 있는 영역(버튼)을 올려서 만들었어요.
   연결은 피그마 프로토타입 연결과 똑같아요.

   [x, y, 너비, 높이, 동작]
     'B'            → 뒤로가기
     'go:화면'       → 그 화면으로 이동
     'fade:화면'     → 그 화면으로 이동 (페이드)
     'tab:화면'      → 아래 탭처럼 바로 전환
     'pop:번호'      → 상품 팝업 열기
   ========================================================= */

const TOP_BELL = [304, 71, 30, 31, 'go:f-118-4072'];   // 상단 알림 🔔
const TOP_GEAR = [356, 75, 24, 25, 'go:f-1-2966'];     // 상단 설정 ⚙️
const BACK_SHOP = [24, 76, 10, 18, 'B'];

const FLOW_SCREENS = {
  /* ---------- 러닝 ---------- */
  'f-676-3844': { name: '러닝 목표설정', h: 874, hs: [[24, 95, 10, 21, 'B'], [26, 776, 353, 60, 'fade:f-574-2137']] },
  'f-574-2137': { name: '러닝 중 (영상)', h: 874,
    hs: [[347, 58, 40, 40, 'up:f-111-475'], [32, 765, 68, 68, 'fade:f-111-728'], [302, 765, 68, 68, 'fade:f-578-2412']] },
  'f-576-2359': { name: '러닝 중 2.43km', h: 874, auto: ['f-628-3834', 2500],
    hs: [[347, 58, 40, 40, 'up:f-111-475'], [32, 765, 68, 68, 'fade:f-111-728'], [302, 765, 68, 68, 'fade:f-578-2412']] },
  'f-628-3834': { name: '러닝 중 5.02km', h: 874,
    hs: [[347, 58, 40, 40, 'up:f-111-475'], [32, 765, 68, 68, 'fade:f-111-728'], [302, 765, 68, 68, 'fade:f-578-2412']] },
  'f-578-2412': { name: '러닝 완료', h: 874, hs: [[30, 768, 353, 60, 'tab:home']] },
  'f-111-475':  { name: '러닝 중 설정', h: 874, sheetTop: 174, hs: [[0, 0, 402, 174, 'down'], [25, 753, 353, 60, 'down']] },
  'f-111-728':  { name: '절전 화면', h: 874, dark: true, hs: [] },   // 루니를 오른쪽으로 밀어서 돌아가요 (script.js)

  /* ---------- 메달 / 미션 ---------- */
  'f-1-1041':   { name: '도전 메달', h: 639, tab: true, hs: [[279, 52, 25, 148, 'tab:f-628-3399'], [180, 140, 120, 70, 'tab:f-628-3399'], TOP_BELL, TOP_GEAR] },
  'f-628-3399': { name: '미션', h: 1081, tab: true, hs: [[60, 140, 140, 70, 'tab:f-1-1041'], TOP_BELL, TOP_GEAR] },

  /* ---------- 상점 ---------- */
  'f-278-3841': { name: '상점', h: 2045, tab: true, hs: [
    [331, 230, 35, 22, 'go:f-278-4724'], [23, 264, 357, 130, 'go:f-278-4724'],
    [331, 419, 35, 22, 'go:f-609-3854'], [331, 1091, 35, 22, 'go:f-603-4688'], [331, 1474, 35, 22, 'go:f-603-4888'],
    TOP_BELL, TOP_GEAR] },
  'f-609-3854': { name: '인테리어 샵', h: 1137, tab: true, hs: [
    [23, 187, 357, 196, 'go:f-603-3586'], [24, 395, 356, 196, 'go:f-603-3586'],
    [24, 604, 111, 196, 'go:f-603-3586'], [147, 604, 111, 196, 'go:f-603-3586'], [269, 604, 111, 196, 'go:f-603-3586'],
    [24, 812, 111, 196, 'go:f-603-3586'], BACK_SHOP, TOP_BELL, TOP_GEAR] },
  'f-603-3586': { name: '포근한 시작의 방', h: 1270, tab: true, hs: [
    [22, 384, 111, 156, 'fade:f-608-2766'], [145, 384, 111, 156, 'pop:608-3212'], [268, 384, 111, 156, 'pop:608-3213'],
    [22, 552, 111, 156, 'pop:608-3206'], [145, 552, 111, 156, 'pop:608-3207'], [268, 552, 111, 156, 'pop:608-3208'],
    [22, 720, 111, 156, 'pop:608-3211'], [145, 720, 111, 156, 'pop:608-3205'], [268, 720, 111, 156, 'pop:608-3209'],
    [22, 888, 111, 156, 'pop:608-3210'], [145, 888, 111, 156, 'pop:608-3204'], [268, 888, 111, 156, 'pop:608-3203'],
    [23, 1090, 356, 51, 'go:f-603-5208'], BACK_SHOP, TOP_BELL, TOP_GEAR] },
  'f-608-2766': { name: '첫걸음 러그', h: 875, tab: true, hs: [
    [208, 599, 151, 54, 'buy:f-603-5208'], [45, 599, 151, 54, 'B'], BACK_SHOP, TOP_BELL, TOP_GEAR] },
  'f-603-5208': { name: '방 미리보기', h: 875, hs: [[24, 77, 10, 18, 'B']] },
  'f-603-4688': { name: '루니의 옷가게', h: 875, tab: true, hs: [
    [23, 187, 111, 156, 'fade:f-608-1928'], [146, 187, 111, 156, 'pop:608-3274'], [268, 187, 111, 156, 'pop:608-3393'],
    [23, 355, 111, 156, 'pop:608-3257'], [146, 355, 111, 156, 'pop:608-3325'], [268, 355, 111, 156, 'pop:608-3308'],
    [23, 523, 111, 156, 'pop:615-4365'], [146, 523, 111, 156, 'pop:608-3342'], BACK_SHOP, TOP_BELL, TOP_GEAR] },
  'f-608-1928': { name: '첫걸음 헤어밴드', h: 875, tab: true, hs: [
    [207, 612, 151, 54, 'buy:B'], [44, 612, 151, 54, 'B'], BACK_SHOP, TOP_BELL, TOP_GEAR] },
  'f-603-4888': { name: '루니의 친구들', h: 875, tab: true, hs: [
    [23, 187, 111, 188, 'fade:f-608-2147'], [146, 187, 111, 188, 'pop:619-4413'], [269, 187, 111, 188, 'pop:619-4412'],
    BACK_SHOP, TOP_BELL, TOP_GEAR] },
  'f-608-2147': { name: '루니 소개', h: 875, tab: true, hs: [[45, 625, 313, 54, 'B'], BACK_SHOP, TOP_BELL, TOP_GEAR] },
  'f-278-4724': { name: '피팅룸', h: 875, hs: [[24, 78, 10, 18, 'B']] },

  /* ---------- 프로필 / 기록 ---------- */
  'f-67-1562':  { name: '프로필', h: 969, tab: true, hs: [TOP_BELL, TOP_GEAR] },   // 나머지 버튼은 script.js '프로필 화면'에서 만들어요
  'f-632-4904': { name: '기록 - 주', h: 1708, tab: true, hs: [
    [140, 213, 60, 32, 'tab:f-632-4646'], [212, 213, 60, 32, 'tab:f-632-4374'], [290, 213, 70, 32, 'tab:f-632-4121'], TOP_BELL, TOP_GEAR] },
  'f-632-4646': { name: '기록 - 월', h: 1708, tab: true, hs: [
    [40, 213, 70, 32, 'tab:f-632-4904'], [212, 213, 60, 32, 'tab:f-632-4374'], [290, 213, 70, 32, 'tab:f-632-4121'], TOP_BELL, TOP_GEAR] },
  'f-632-4374': { name: '기록 - 년', h: 1708, tab: true, hs: [
    [40, 213, 70, 32, 'tab:f-632-4904'], [128, 213, 60, 32, 'tab:f-632-4646'], [290, 213, 70, 32, 'tab:f-632-4121'], TOP_BELL, TOP_GEAR] },
  'f-632-4121': { name: '기록 - 전체', h: 1708, tab: true, hs: [
    [40, 213, 70, 32, 'tab:f-632-4904'], [128, 213, 60, 32, 'tab:f-632-4646'], [212, 213, 60, 32, 'tab:f-632-4374'], TOP_BELL, TOP_GEAR] },

  /* ---------- 소통 ---------- */
  'f-136-1566': { name: '피드', h: 983, tab: true, hs: [[110, 147, 90, 35, 'tab:f-146-1918'], [196, 147, 90, 35, 'tab:f-181-3907'], [286, 147, 94, 35, 'tab:event'], [22, 306, 358, 46, 'tab:event'], TOP_BELL, TOP_GEAR] },
  'f-146-1918': { name: '메시지', h: 977, tab: true, hs: [
    [22, 147, 90, 35, 'tab:f-136-1566'], [196, 147, 90, 35, 'tab:f-181-3907'], [286, 147, 94, 35, 'tab:event'], TOP_BELL, TOP_GEAR] },
  'f-148-1782': { name: '지훈과의 대화', h: 1013, hs: [[22, 79, 10, 18, 'B']] },
  'f-181-3907': { name: '랭킹', h: 1083, tab: true, hs: [[22, 147, 90, 35, 'tab:f-136-1566'], [110, 147, 90, 35, 'tab:f-146-1918'], [286, 147, 94, 35, 'tab:event'], TOP_BELL, TOP_GEAR] },

  /* ---------- 알림 / 설정 ---------- */
  'f-118-4072': { name: '알림', h: 874, tab: true, hs: [[20, 82, 10, 18, 'B']] },   // 목록 · 탭 · 설정은 community.js에서 만들어요
  'f-125-4436': { name: '알림 상세', h: 943, tab: true, hs: [[20, 82, 10, 18, 'B'], [56, 514, 298, 51, 'go:f-148-1782'], [56, 767, 298, 47, 'go:f-148-1782']] },
  'f-1-2966':   { name: '설정', h: 1386, tab: true, hs: [[20, 82, 10, 18, 'B']] },   // 나머지는 script.js '설정 화면'
};

/* 상품 팝업: 카드 위치(팝업 화면 기준)와 버튼 위치 */
const FLOW_POPUPS = {};
['608-3213', '608-3206', '608-3211', '608-3207', '608-3212', '608-3209', '608-3205', '608-3204', '608-3203', '608-3210',
 '608-3208', '608-3257', '608-3274', '608-3308', '608-3325', '608-3342', '608-3393', '615-4365'].forEach(id => {
  FLOW_POPUPS[id] = { x: 23, y: 188, h: 499, buy: [207, 612, 151, 54], close: [44, 612, 151, 54] };
});
FLOW_POPUPS['619-4413'] = { x: 24, y: 175, h: 526, buy: [208, 626, 151, 54], close: [45, 626, 151, 54] };
FLOW_POPUPS['619-4412'] = { x: 24, y: 175, h: 526, buy: [208, 626, 151, 54], close: [45, 626, 151, 54] };

/* ---------- 화면 만들기 ---------- */
(function buildFlowScreens() {
  const phone = document.getElementById('phone');
  const anchor = document.getElementById('statusBar');
  for (const [id, s] of Object.entries(FLOW_SCREENS)) {
    const sec = document.createElement('section');
    sec.className = 'screen flow-screen';
    sec.id = id;
    if (s.tab) sec.dataset.tab = '1';
    if (s.dark) sec.dataset.dark = '1';
    if (s.sheetTop) { sec.dataset.overlay = '1'; sec.style.setProperty('--sheet-top', `${s.sheetTop}px`); }
    if (s.auto) sec.dataset.autoNext = `${s.auto[0]}|${s.auto[1]}`;
    const canvas = document.createElement('div');
    canvas.className = 'canvas';
    canvas.style.height = `${s.h}px`;
    const img = document.createElement('img');
    img.className = 'flow-img';
    img.src = `screens/s-${id.slice(2)}.jpg?v=${Date.now()}`;   // 바뀐 그림이 바로 보이게 (캐시 방지)
    img.alt = s.name;
    img.loading = s.sheetTop ? 'eager' : 'lazy';   // 올라오는 창은 미리 불러두기
    img.style.height = `${s.h}px`;
    canvas.appendChild(img);
    for (const [x, y, w, h, act] of s.hs) canvas.appendChild(makeHotspot(x, y, w, h, act));
    sec.appendChild(canvas);
    phone.insertBefore(sec, anchor);
  }

  function makeHotspot(x, y, w, h, act) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hs';
    // 너무 작은 버튼은 누르기 쉽게 44px까지 넓혀요
    const W = Math.max(w, 44), H = Math.max(h, 44);
    b.style.cssText = `left:${x - (W - w) / 2}px;top:${y - (H - h) / 2}px;width:${W}px;height:${H}px`;
    const [type, target] = act.includes(':') ? act.split(/:(.+)/) : [act, ''];
    if (type === 'B') b.dataset.back = '';
    else if (type === 'down') b.dataset.backDown = '';
    else if (type === 'go') b.dataset.go = target;
    else if (type === 'fade') { b.dataset.go = target; b.dataset.mode = 'fade'; }
    else if (type === 'up') { b.dataset.go = target; b.dataset.mode = 'up'; }
    else if (type === 'tab') b.dataset.tabGo = target;
    else if (type === 'pop') b.dataset.popup = target;
    else if (type === 'buy') b.dataset.buy = target;
    else if (type === 'logout') b.dataset.logout = '';
    return b;
  }

  /* 상품 팝업 레이어 */
  const layer = document.createElement('div');
  layer.className = 'pop-layer';
  layer.id = 'popLayer';
  layer.innerHTML = `
    <div class="pop-dim" data-pop-close></div>
    <div class="pop-card" id="popCard">
      <img id="popImg" alt="" />
      <button type="button" class="hs" id="popClose" aria-label="닫기"></button>
      <button type="button" class="hs" id="popBuy" aria-label="구매하기"></button>
    </div>`;
  phone.insertBefore(layer, anchor);
})();

/* ---------- 소통 > 이벤트 · 대화방 (직접 만든 화면) ---------- */
(function buildCommunityScreens() {
  const phone = document.getElementById('phone');
  const anchor = document.getElementById('statusBar');
  const ev = document.createElement('section');
  ev.className = 'screen ev-screen'; ev.id = 'event'; ev.dataset.tab = '1';
  ev.innerHTML = '<div class="canvas ev-canvas"></div>';
  phone.insertBefore(ev, anchor);
  const ch = document.createElement('section');
  ch.className = 'screen chat-screen'; ch.id = 'chat';
  ch.innerHTML = '<div class="canvas ch-canvas"></div>';
  phone.insertBefore(ch, anchor);
  const nd = document.createElement('section');
  nd.className = 'screen nd-screen'; nd.id = 'notiDetail';
  nd.innerHTML = '<div class="canvas nd-canvas"></div>';
  phone.insertBefore(nd, anchor);
  [['roomDetail', 'rd-screen', '1'], ['roomPreview', 'rp-screen', ''], ['closetShop', 'cs-screen', '1'], ['fitting', 'ft-screen', '']].forEach(([id, cls, tab]) => {
    const sc = document.createElement('section');
    sc.className = 'screen ' + cls; sc.id = id; if (tab) sc.dataset.tab = tab;
    sc.innerHTML = '<div class="canvas"></div>';
    phone.insertBefore(sc, anchor);
  });
})();
