/* 세로가 짧은 휴대폰에서 온보딩 화면의 아래쪽(버튼 · 카드)이 화면 밖으로 밀리지 않게
   - 위쪽 내용은 그대로 두고, 아래쪽 묶음만 남는 빈 공간만큼 위로 끌어올려요
   - 위쪽 내용과 겹치지 않을 만큼만 올려요 */
(function () {
  const SCREENS = { intro: 500, login: 560, signup: 560, findpw: 560, info: 560, character: 560, start: 560 };
  function layout() {
    const phone = document.getElementById('phone'); if (!phone) return;
    const H = parseFloat(phone.style.height) || 874;
    Object.entries(SCREENS).forEach(([id, split]) => {
      const canvas = document.querySelector(`#${id} > .canvas`); if (!canvas) return;
      if (!canvas.dataset.baseH) canvas.dataset.baseH = parseFloat(canvas.style.height) || canvas.offsetHeight || 874;
      const base = +canvas.dataset.baseH;
      const kids = [...canvas.children].filter(el => el.classList.contains('abs') || getComputedStyle(el).position === 'absolute');
      kids.forEach(el => { el.style.translate = ''; el.style.zIndex = ''; });
      const lower = kids.filter(el => el.offsetTop >= split);
      // 위쪽 내용: 화면 전체 배경 그림 · 글자 없는 장식 상자는 빼고 계산해요
      const deco = el => (el.offsetTop < 60 && el.offsetHeight > 500) || (el.tagName === 'DIV' && !el.children.length && !el.textContent.trim());
      const upper = kids.filter(el => el.offsetTop < split && !deco(el));
      let shift = id === 'character' ? 0 : Math.min(0, H - base);   // 캐릭터 고르기는 카드가 커서 버튼만 아래에 고정
      if (shift < 0 && lower.length) {
        const upperBottom = Math.max(0, ...upper.map(el => el.offsetTop + el.offsetHeight));
        const lowerTop = Math.min(...lower.map(el => el.offsetTop));
        shift = Math.max(shift, Math.min(0, upperBottom + 8 - lowerTop));
      }
      lower.forEach(el => { el.style.translate = shift ? `0 ${shift}px` : ''; if (shift) el.style.zIndex = '55'; });
      let ch = base + shift;
      // 그래도 화면보다 길면: 큰 파란 버튼은 화면 맨 아래에 붙여 두고, 내용은 그 위로 스크롤돼요
      const sec = canvas.parentElement;
      const btns = lower.filter(el => el.classList.contains('btn-primary'));
      pinned.set(sec, null);
      if (ch > H + 1 && btns.length) {
        const b = btns[btns.length - 1];
        const gap = 874 - (b.offsetTop + b.offsetHeight);          // 원래 디자인의 버튼 아래 여백
        const want = H - Math.max(gap, 30) - b.offsetHeight;          // 화면 안에서 버튼이 있을 자리
        ch += b.offsetHeight + 24;                                    // 맨 끝 내용이 버튼에 가리지 않게
        pinned.set(sec, { b, base: want - b.offsetTop });
        b.classList.add('pinned-btn');
      } else btns.forEach(x => x.classList.remove('pinned-btn'));
      canvas.style.height = `${ch}px`;
      pin(sec);
    });
  }
  window.runiLayout = layout;
  const pinned = new Map();
  function pin(sec) {
    const p = pinned.get(sec); if (!p) return;
    p.b.style.translate = `0 ${p.base + sec.scrollTop}px`;
  }
  document.addEventListener('scroll', e => { if (pinned.has(e.target)) pin(e.target); }, true);
  addEventListener('resize', layout);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', layout); else layout();
  addEventListener('load', layout);
})();
