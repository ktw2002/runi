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
      const sec0 = canvas.parentElement;
      const wrap0 = sec0.querySelector(':scope > .pin-wrap');
      if (wrap0) [...wrap0.children].forEach(b => { b.style.top = b.dataset.top; b.classList.remove('pinned-btn'); canvas.appendChild(b); });
      const kids = [...canvas.children].filter(el => el.classList.contains('abs') || getComputedStyle(el).position === 'absolute');
      kids.forEach(el => { el.style.translate = ''; el.style.zIndex = ''; });
      const lower = kids.filter(el => el.offsetTop >= split);
      // 위쪽 내용: 화면 전체 배경 그림 · 글자 없는 장식 상자는 빼고 계산해요
      const deco = el => (el.offsetTop < 60 && el.offsetHeight > 500) || (el.tagName === 'DIV' && !el.children.length && !el.textContent.trim());
      const upper = kids.filter(el => el.offsetTop < split && !deco(el));
      let shift = (id === 'intro' || id === 'login') ? Math.min(0, H - base) : 0;   // 소개 · 로그인만 끌어올리고, 나머지는 버튼만 아래에 고정 (칸 간격이 어긋나지 않게)
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
      if (ch > H + 1 && btns.length) {
        const b = btns[btns.length - 1];
        const gap = 874 - (b.offsetTop + b.offsetHeight);          // 원래 디자인의 버튼 아래 여백
        const want = H - Math.max(gap, 30) - b.offsetHeight;          // 화면 안에서 버튼이 있을 자리
        ch += b.offsetHeight + 24;                                    // 맨 끝 내용이 버튼에 가리지 않게
        // 스크롤과 상관없이 제자리에 붙어 있는 받침(sticky)에 버튼을 옮겨 담아요 → 스크롤해도 흔들리지 않아요
        let wrap = sec.querySelector(':scope > .pin-wrap');
        if (!wrap) { wrap = document.createElement('div'); wrap.className = 'pin-wrap'; sec.insertBefore(wrap, sec.firstChild); }
        wrap.style.top = `${want}px`;
        if (b.dataset.top === undefined) b.dataset.top = b.style.top;
        b.style.top = '0px'; b.style.translate = '';
        b.classList.add('pinned-btn');
        wrap.appendChild(b);
      }
      canvas.style.height = `${ch}px`;
    });
  }
  window.runiLayout = layout;
  addEventListener('resize', layout);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', layout); else layout();
  addEventListener('load', layout);
})();
