/* 홈 화면에 추가 버튼
   - 안드로이드(Chrome): 버튼 한 번에 바로 설치 창이 떠요
   - 아이폰(Safari): 사이트가 직접 추가할 수는 없어서, 어디를 누르면 되는지 안내창을 띄워요
   - 이미 홈 화면 앱으로 열었으면 버튼을 숨겨요 */
(function () {
  const standalone = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const inApp = /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Line\//i.test(ua);
  let deferred = null;

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
  addEventListener('appinstalled', () => { const b = document.getElementById('a2hsBtn'); if (b) b.remove(); });

  function sheet(html) {
    const ov = document.createElement('div');
    ov.className = 'a2hs-ov';
    ov.innerHTML = `<div class="a2hs-sheet" role="dialog" aria-label="홈 화면에 추가">
      <img class="a2hs-icon" src="assets/icon-180.png" alt="" />
      <h3>Runi를 앱처럼 열어보세요</h3>${html}
      <button type="button" class="a2hs-ok">알겠어요</button></div>
      ${isIOS && !inApp ? '<div class="a2hs-arrow" aria-hidden="true">⬇︎</div>' : ''}`;
    ov.addEventListener('click', e => { if (e.target === ov || e.target.classList.contains('a2hs-ok')) ov.remove(); });
    document.body.appendChild(ov);
  }

  async function onClick() {
    if (deferred) { deferred.prompt(); try { await deferred.userChoice; } catch (e) {} deferred = null; return; }
    if (inApp) return sheet(`<ol><li>오른쪽 위 <b>⋮</b> 또는 <b>공유</b> 메뉴를 눌러요</li><li><b>다른 브라우저로 열기</b>(Safari · Chrome)를 골라요</li><li>열린 화면에서 이 버튼을 다시 눌러요</li></ol>`);
    if (isIOS) return sheet(`<ol><li>화면 아래 주소창의 <b>공유 ⬆︎</b> 버튼을 눌러요<br><small>주소창 왼쪽 <b>≡</b> 를 먼저 눌러야 보일 수도 있어요</small></li><li>목록을 내려서 <b>홈 화면에 추가</b>를 눌러요</li><li>오른쪽 위 <b>추가</b>를 누르면 끝! 홈 화면의 Runi 아이콘으로 열어요</li></ol>`);
    sheet(`<ol><li>브라우저 오른쪽 위 <b>⋮</b> 메뉴를 눌러요</li><li><b>홈 화면에 추가</b> 또는 <b>앱 설치</b>를 눌러요</li></ol>`);
  }

  function mount() {
    if (standalone) return;
    const intro = document.querySelector('#intro .canvas');
    if (!intro || document.getElementById('a2hsBtn')) return;
    const b = document.createElement('button');
    b.type = 'button'; b.id = 'a2hsBtn'; b.className = 'abs a2hs-btn';
    b.innerHTML = '<img src="assets/icon-180.png" alt="" />홈 화면에 앱으로 추가하기';
    b.addEventListener('click', e => { e.stopPropagation(); onClick(); });
    intro.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
