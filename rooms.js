/* =========================================================
   상점 › 인테리어 테마 방 (소품 구매 · 방 미리보기 · 홈 배경 적용)
   community.js 다음에 불러와요
   ========================================================= */
(function rooms() {
  const R = 'assets/rooms/';
  const ROOMS = {
    sunny: { name: '햇살 가득 방', desc: '창문 가득 햇살이 쏟아지는 노란 방이에요. 바구니 담요와 꽃 조명이 있어 아침 러닝 전 기지개 켜기 딱 좋아요.',
      items: [['01', '햇살 동그라미 러그', 72, '발끝까지 포근한 크림빛 러그예요. 아침 스트레칭 자리로 딱이에요.'], ['02', '노란 피크닉 가방', 84, '물병과 간식을 쏙 넣고 공원 러닝을 떠나요.'], ['03', '체크 담요 바구니', 96, '러닝 후 낮잠 잘 때 덮는 노란 체크 담요예요.'],
        ['04', '버터 크림 소파', 148, '햇살을 받으며 쉬기 좋은 말랑한 1인 소파예요.'], ['05', '초록 숲 창문', 142, '창밖으로 초록 나무가 살랑이는 커튼 창문이에요.'], ['06', '데이지 꽃 조명', 104, '꽃잎 모양 갓에서 따뜻한 빛이 퍼져요.'],
        ['07', '오늘도 행거', 88, '에코백과 모자를 걸어두는 나무 행거예요.'], ['08', '작은 액자 선반', 92, '추억 사진과 작은 집 장식을 올려둬요.'], ['09', '햇님 썬캐처', 76, '햇빛이 닿으면 방 안에 무지개가 반짝여요.'],
        ['10', '화분 협탁', 118, '작은 화분을 올려둔 크림색 협탁이에요.'], ['11', '레몬 스트라이프 벽지', 156, '은은한 노란 줄무늬가 방을 환하게 밝혀요.'], ['12', '밀크 우드 플로어', 162, '밝은 원목 바닥으로 방이 한층 넓어 보여요.']] },
    cherry: { name: '벚꽃 산책 방', desc: '창밖으로 벚꽃이 흩날리는 분홍빛 방이에요. 봄 산책 러닝을 마치고 꽃잎 쿠션에 폭 안겨 쉬어요.',
      items: [['01', '벚꽃 송이 러그', 78, '꽃송이 모양으로 폭신한 분홍 러그예요.'], ['02', '꽃잎 쿠션 침대', 132, '고양이도 반한 몽글몽글 꽃잎 쿠션이에요.'], ['03', '꽃잎 발매트', 58, '침대 옆에 두는 작은 꽃잎 매트예요.'],
        ['04', '벚꽃 화병 서랍장', 138, '벚꽃 가지를 꽂아둔 분홍 서랍장이에요.'], ['05', '벚꽃 풍경 창문', 146, '창밖 가득 벚꽃길이 펼쳐지는 창문이에요.'], ['06', '분홍 튤립 조명', 102, '튤립처럼 오므린 갓에서 분홍빛이 새어 나와요.'],
        ['07', '봄 나들이 행거', 94, '꽃 모자와 가방을 걸어두는 봄 행거예요.'], ['08', '분홍 책 선반', 86, '좋아하는 봄 책을 꽂아두는 선반이에요.'],
        ['10', '꽃잎 수납장', 124, '작은 소품을 정리하는 분홍 수납장이에요.'], ['11', '벚꽃 우유 벽지', 154, '은은한 분홍빛 벽지로 방이 화사해져요.'], ['12', '살구빛 원목 바닥', 160, '부드러운 살구빛 원목 바닥이에요.']] },
    autumn: { name: '노을 단풍 방', desc: '창밖으로 붉은 노을과 단풍이 물든 방이에요. 따뜻한 차 한 잔과 함께 가을 러닝의 여운을 즐겨요.',
      items: [['01', '단풍 체크 러그', 82, '주황 체크무늬가 따뜻한 동그란 러그예요.'], ['02', '책 위 낮잠 고양이', 94, '쌓아둔 책 위에서 고양이가 꾸벅꾸벅 졸아요.'], ['03', '단풍 찻상', 88, '단풍잎을 띄운 차를 올려두는 작은 찻상이에요.'],
        ['04', '체크 방석 소파', 136, '폭신한 체크 방석을 겹쳐 만든 좌식 소파예요.'], ['05', '노을빛 창문', 148, '붉게 물든 노을과 단풍이 보이는 창문이에요.'], ['06', '단풍 등불 조명', 112, '단풍잎 무늬가 비치는 한지 등불이에요.'],
        ['07', '가을 랜턴', 78, '바닥에 두면 은은하게 빛나는 랜턴이에요.'], ['08', '가을 책 선반', 90, '가을에 읽기 좋은 책들을 꽂아둔 선반이에요.'], ['09', '단풍 장식 선반', 96, '랜턴과 단풍 가지로 꾸민 선반이에요.'],
        ['10', '단풍 화병 협탁', 126, '단풍 가지와 호박을 올린 라탄 협탁이에요.'], ['11', '살구 노을 벽지', 158, '노을빛 살구색 벽지예요.'], ['12', '진한 원목 플로어', 166, '깊은 갈색 원목으로 가을 분위기를 더해요.']] },
    winter: { name: '포근한 눈꽃 방', desc: '창밖에 함박눈이 내리는 하늘색 방이에요. 벽난로 앞에서 몸을 녹이며 겨울 러닝 준비를 해요.',
      items: [['01', '눈꽃 러그', 84, '눈송이 무늬가 수놓인 하얀 러그예요.'], ['02', '구름 쿠션 침대', 128, '고양이가 웅크린 하늘색 구름 쿠션이에요.'], ['03', '코코아 찻상', 86, '따뜻한 코코아를 올려두는 작은 찻상이에요.'],
        ['04', '눈꽃 쿠션 소파', 146, '체크 담요와 눈꽃 쿠션이 놓인 소파예요.'], ['05', '눈 내리는 창문', 150, '눈 덮인 마을이 보이는 아치 창문이에요.'], ['06', '눈송이 조명', 104, '부드러운 빛이 눈처럼 내려앉는 조명이에요.'],
        ['07', '겨울 랜턴', 76, '호랑가시 잎으로 장식한 작은 랜턴이에요.'], ['08', '겨울 책 선반', 92, '액자와 겨울 책을 올려둔 선반이에요.'], ['09', '겨울 추억 사진', 68, '눈 오는 날의 러닝 사진을 붙여둬요.'],
        ['10', '따뜻한 벽난로', 172, '타닥타닥 불꽃이 방을 따뜻하게 데워요.'], ['11', '눈꽃 하늘 벽지', 156, '하늘색 바탕에 눈송이가 흩날리는 벽지예요.'], ['12', '복숭아빛 원목 바닥', 162, '포근한 복숭아빛 원목 바닥이에요.']] },
    star: { name: '별빛 꿈꾸는 방', desc: '별과 달이 반짝이는 보랏빛 꿈나라 방이에요. 오늘 달린 하루를 떠올리며 구름 침대에서 꿈을 꿔요.',
      items: [['01', '구름 별빛 러그', 86, '구름과 별이 수놓인 보랏빛 러그예요.'], ['02', '꿈나라 구름 쿠션', 118, '얼굴을 묻으면 바로 잠드는 구름 쿠션이에요.'], ['03', '달빛 티테이블', 92, '달 장식이 올라간 작은 티테이블이에요.'],
        ['04', '별빛 침대', 168, '별무늬 이불이 덮인 포근한 침대예요.'], ['05', '밤하늘 창문', 152, '달과 별이 가득한 밤하늘이 보이는 창문이에요.'], ['06', '별 가랜드', 98, '천장을 가로지르는 반짝이 별 장식이에요.'],
        ['07', '달님 태피스트리', 84, '초승달이 그려진 벽걸이 장식이에요.'], ['08', '꿈 책장 선반', 94, '잠들기 전 읽는 동화책 선반이에요.'], ['09', '반짝 별 무드등', 88, '은은하게 깜빡이는 별 모양 무드등이에요.'],
        ['10', '달빛 수납장', 134, '스노우볼과 달 장식을 올린 수납장이에요.'], ['11', '밤하늘 벽지', 164, '깊은 남보라빛 밤하늘 벽지예요.'], ['12', '라벤더 플로어', 158, '연보랏빛이 감도는 바닥이에요.']] },
    breeze: { name: '바람 솔솔 방', desc: '창밖으로 파란 바다가 보이는 시원한 방이에요. 바닷바람을 맞으며 달린 날, 푹신한 소파에서 쉬어가요.',
      items: [['01', '파도 줄무늬 러그', 74, '바다 물결처럼 줄무늬가 들어간 러그예요.'], ['02', '비치볼 쿠션', 82, '통통 튀는 비치볼 모양 쿠션이에요.'], ['03', '바다 찻상', 90, '시원한 아이스티와 책을 올려두는 찻상이에요.'],
        ['04', '하늘빛 소파', 146, '구름처럼 폭신한 하늘색 소파예요.'], ['05', '바다 풍경 창문', 150, '파란 바다와 하늘이 펼쳐지는 창문이에요.'], ['06', '파란 펜던트 조명', 98, '바다색 갓이 달린 조명이에요.'],
        ['07', '바다 사진 액자', 72, '여름 바닷가 러닝의 추억을 담은 액자예요.'], ['08', '바다 소품 선반', 88, '산호와 책을 올려둔 선반이에요.'], ['09', '등대 무드등', 94, '등대처럼 은은하게 빛나는 무드등이에요.'],
        ['10', '스노우볼 책장', 124, '스노우볼과 책을 정리하는 작은 책장이에요.'], ['11', '하늘빛 벽지', 152, '맑은 하늘을 닮은 연파랑 벽지예요.'], ['12', '화이트 우드 플로어', 158, '바닷가 오두막 같은 하얀 원목 바닥이에요.']] },
    xmas: { name: '메리 루니 크리스마스 방', desc: '반짝이는 트리와 선물이 가득한 크리스마스 방이에요. 산타 루니와 함께 따뜻한 겨울밤을 보내요.',
      items: [['01', '호랑가시 러그', 80, '빨간 열매 무늬가 수놓인 동그란 러그예요.'], ['02', '루니의 선물 상자', 96, '리본을 풀면 어떤 선물이 나올까요?'], ['03', '쿠키 파티 찻상', 92, '쿠키와 코코아로 차린 크리스마스 찻상이에요.'],
        ['04', '산타 썰매', 168, '선물을 가득 싣고 달리는 빨간 썰매예요.'], ['05', '눈 오는 밤 창문', 152, '체크 커튼 너머로 눈 내리는 밤이 보여요.'], ['06', '징글벨 조명', 104, '흔들면 딸랑 소리가 날 것 같은 종 조명이에요.'],
        ['07', '겨울 마을 그림', 86, '눈 덮인 마을을 그린 따뜻한 그림이에요.'], ['08', '산타 장식 선반', 98, '산타와 작은 트리로 꾸민 선반이에요.'], ['09', '반짝 크리스마스 트리', 178, '별과 오너먼트가 반짝이는 트리예요.'],
        ['10', '양말 벽난로', 172, '선물 양말이 걸린 따뜻한 벽난로예요.'], ['11', '캔디 스트라이프 벽지', 154, '달콤한 캔디처럼 줄무늬가 들어간 벽지예요.'], ['12', '체리 우드 플로어', 162, '붉은빛이 도는 따뜻한 원목 바닥이에요.']] },
    tidy: { name: '오늘은 정리 내일 할게 방', desc: '빨래도 양말도 여기저기! 러닝 다녀와서 지친 날의 솔직한 방이에요. 정리는 내일의 루니에게 맡겨요.',
      items: [['01', '구깃구깃 러그', 58, '발에 차여 구겨진 채로 둔 러그예요. 그래도 폭신해요.'], ['02', '던져둔 운동 가방', 74, '다녀오자마자 툭 던져둔 러닝 가방이에요.'], ['03', '책 쌓인 티테이블', 82, '읽다 만 책과 식은 커피가 그대로 있어요.'],
        ['04', '쉬지 않는 세탁기', 138, '러닝복 빨래가 끝없이 돌아가는 세탁기예요.'], ['05', '바람 솔솔 창문', 132, '환기하려고 열어둔 창문이에요. 커튼이 살랑여요.'], ['06', '노란 갓 조명', 96, '어질러진 방도 따뜻하게 비춰주는 조명이에요.'],
        ['07', '짝 잃은 양말', 42, '나머지 한 짝은 어디 갔을까요?'], ['08', '빨래 바구니', 88, '개지 않은 빨래가 수북이 쌓인 바구니예요.'], ['09', '주렁주렁 옷걸이', 92, '모자, 수건, 장바구니가 한가득 걸려 있어요.'],
        ['10', '작은 액자 선반', 86, '이것만은 깔끔한 액자와 책 선반이에요.'], ['11', '크림 베이지 벽지', 144, '어떤 물건도 잘 어울리는 무난한 벽지예요.'], ['12', '허니 우드 플로어', 152, '양말이 굴러다녀도 예쁜 원목 바닥이에요.']] },
    animal: { name: '우당탕 동물 친구 방', desc: '사자, 호랑이, 코끼리 인형 친구들이 함께 사는 정글 방이에요. 오늘은 누가 루니랑 같이 달릴까요?',
      items: [['01', '발바닥 러그', 76, '동그란 발바닥 무늬가 콕콕 찍힌 러그예요.'], ['02', '발바닥 랜턴', 84, '발바닥 모양 빛이 새어 나오는 랜턴이에요.'], ['03', '동물 친구 티테이블', 98, '곰돌이와 사자가 차를 마시는 티테이블이에요.'],
        ['04', '표범 무늬 쿠션 집', 142, '동물 친구들이 쏙 들어가 낮잠 자는 집이에요.'], ['05', '초원 아치 창문', 150, '창밖으로 넓은 초원이 펼쳐지는 창문이에요.'], ['06', '발바닥 조명', 102, '말랑한 발바닥 모양 조명이에요.'],
        ['07', '투칸 친구 선반', 88, '부리가 멋진 투칸이 앉아 있는 선반이에요.'], ['08', '아기 호랑이 선반', 92, '아기 호랑이 인형이 낮잠 자는 선반이에요.'], ['09', '코끼리 인형', 118, '귀가 팔랑팔랑, 꼭 안아주고 싶은 코끼리예요.'],
        ['10', '사자 책장', 132, '사자 인형이 지키는 정글 책장이에요.'], ['11', '발자국 벽지', 150, '작은 발자국이 콩콩 찍힌 벽지예요.'], ['12', '정글 우드 플로어', 158, '따뜻한 갈색 원목 바닥이에요.']] },
  };
  Object.values(ROOMS).forEach(r => { r.owned = new Set(); });
  // 상점 화면 그리드 순서 (행 × 열)
  const GRID = [['cozy', 'tidy', 'sunny'], ['cherry', 'breeze', 'autumn'], ['winter', 'star', 'animal'], ['xmas']];
  const SOON = {};
  const COLX = [23, 146, 269];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const COIN = '<img class="rm-coin" src="assets/coin.png" alt="코인" />';

  /* ---------- 상점 · 인테리어 샵 그리드에 연결 ---------- */
  function wireGrid(screenId, top0) {
    const canvas = document.querySelector(`#${screenId} .canvas`);
    GRID.forEach((row, r) => row.forEach((key, c) => {
      const x = COLX[c], y = top0 + r * 208.3;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'hs rm-card-hs'; b.dataset.room = key;
      b.style.cssText = `left:${x}px;top:${y}px;width:111px;height:196px`;
      b.setAttribute('aria-label', ROOMS[key] ? ROOMS[key].name : (SOON[key] || '포근한 시작의 방'));
      canvas.appendChild(b);
      if (ROOMS[key]) {
        const p = document.createElement('span');
        p.className = 'rm-prog'; p.dataset.prog = key;
        p.style.cssText = `left:${x + 12}px;top:${y + 168.5}px`;
        canvas.appendChild(p);
      }
    }));
    canvas.addEventListener('click', e => {
      const b = e.target.closest('[data-room]'); if (!b) return;
      e.stopPropagation();
      const key = b.dataset.room;
      if (key === 'cozy') go('f-603-3586');
      else if (ROOMS[key]) openRoom(key);
      else toast(`${SOON[key]}은 곧 오픈 예정이에요 🛠`);
    });
  }
  wireGrid('f-278-3841', 453);
  wireGrid('f-609-3854', 187);
  function paintProgress() {
    document.querySelectorAll('[data-prog]').forEach(p => {
      const r = ROOMS[p.dataset.prog];
      p.textContent = `${r.owned.size} / ${r.items.length}`;
      p.classList.toggle('some', r.owned.size > 0);
      p.classList.toggle('full', r.owned.size === r.items.length);
    });
  }
  paintProgress();

  /* ---------- 방 상세 ---------- */
  const det = document.querySelector('#roomDetail .canvas');
  let cur = null;
  function openRoom(key) {
    cur = key;
    renderRoom();
    document.getElementById('roomDetail').scrollTop = 0;
    if (!current || current.id !== 'roomDetail') go('roomDetail');
  }
  function renderRoom() {
    const r = ROOMS[cur];
    const left = r.items.filter(([n]) => !r.owned.has(n));
    const total = left.reduce((s, it) => s + it[2], 0);
    det.innerHTML = `
      <button type="button" class="rd-thumb" data-preview aria-label="방 미리보기">
        <img src="${R}${cur}-bg.jpg" alt="" /><span class="rd-zoom"><svg width="16" height="16" viewBox="0 0 16 16"><circle cx="7" cy="7" r="5.2" fill="none" stroke="#4270f6" stroke-width="1.8"/><path d="m11 11 3.5 3.5" stroke="#4270f6" stroke-width="1.8" stroke-linecap="round"/></svg></span>
      </button>
      <div class="rd-info"><b>${r.name}</b><p>${r.desc}</p>
        <span class="rd-count">모은 소품 <em>${r.owned.size}</em> / ${r.items.length}</span></div>
      <div class="rd-grid">${r.items.map(([n, name, price]) => `
        <button type="button" class="rd-item ${r.owned.has(n) ? 'owned' : ''}" data-item="${n}">
          <img src="${R}${cur}-${n}.png" alt="" />
          <span class="rd-name">${name}</span>
          ${r.owned.has(n) ? '<span class="rd-own">✔ 보유 중</span>' : `<span class="rd-price">${COIN}${price}</span>`}
        </button>`).join('')}</div>
      <p class="rd-total">${left.length ? `총 ${COIN}<b>${total}</b> 개` : '모든 소품을 모았어요! 🎉'}</p>
      <button type="button" class="rd-buyall ${left.length ? '' : 'apply'}" data-buyall>${left.length ? '전체 구매하기' : '홈 배경으로 꾸미기'}</button>`;
    det.style.height = `${Math.max(874, det.querySelector('.rd-buyall').offsetTop + 160)}px`;
    paintProgress();
  }
  det.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-preview]')) { openPreview(cur); return; }
    const it = t.closest('[data-item]'); if (it) { itemPopup(cur, it.dataset.item); return; }
    if (t.closest('[data-buyall]')) {
      const r = ROOMS[cur], left = r.items.filter(([n]) => !r.owned.has(n));
      if (!left.length) { applyHome(cur); return; }
      const total = left.reduce((s, x) => s + x[2], 0);
      confirmPop(`${r.name}`, `<p class="rp-q">남은 소품 <b>${left.length}개</b>를<br>${COIN}<b>${total}</b> 코인으로 모두 살까요?</p>`, '전체 구매', () => {
        if (coins < total) { toast(`코인이 ${total - coins}개 부족해요 🥲`); return false; }
        addCoins(-total); left.forEach(([n]) => r.owned.add(n)); renderRoom();
        toast(`${r.name} 소품을 모두 모았어요! 🎉`);
      });
    }
  });

  /* ---------- 소품 팝업 ---------- */
  const pop = document.createElement('div');
  pop.className = 'rm-pop';
  pop.innerHTML = '<div class="rm-pop-card" role="dialog" aria-modal="true"></div>';
  document.getElementById('phone').appendChild(pop);
  const card = pop.querySelector('.rm-pop-card');
  const closePop = () => pop.classList.remove('show');
  pop.addEventListener('click', e => { if (e.target === pop) closePop(); });
  function itemPopup(key, n) {
    const r = ROOMS[key], [, name, price, desc] = r.items.find(x => x[0] === n), own = r.owned.has(n);
    card.innerHTML = `
      <p class="rm-pop-room">${r.name}</p>
      <img class="rm-pop-img" src="${R}${key}-${n}.png" alt="" />
      <b class="rm-pop-name">${name}</b>
      <p class="rm-pop-desc">${desc}</p>
      <p class="rm-pop-price">${own ? '<span class="rd-own big">✔ 이미 가지고 있어요</span>' : `${COIN}<b>${price}</b>`}</p>
      <div class="rm-pop-btns"><button type="button" class="rm-btn line" data-rclose>닫기</button>
        <button type="button" class="rm-btn" data-rbuy ${own ? 'disabled' : ''}>${own ? '보유 중' : '구매하기'}</button></div>`;
    pop.classList.add('show');
    card.querySelector('[data-rclose]').onclick = closePop;
    card.querySelector('[data-rbuy]').onclick = () => {
      if (coins < price) { toast(`코인이 ${price - coins}개 부족해요 🥲`); return; }
      addCoins(-price); r.owned.add(n); closePop(); renderRoom();
      toast(`${name}을(를) 샀어요! ${r.owned.size}/${r.items.length}`);
    };
  }
  function confirmPop(title, html, okLabel, onOk) {
    card.innerHTML = `<p class="rm-pop-room">${title}</p>${html}
      <div class="rm-pop-btns"><button type="button" class="rm-btn line" data-rclose>취소</button><button type="button" class="rm-btn" data-rok>${okLabel}</button></div>`;
    pop.classList.add('show');
    card.querySelector('[data-rclose]').onclick = closePop;
    card.querySelector('[data-rok]').onclick = () => { if (onOk() !== false) closePop(); };
  }

  /* ---------- 방 미리보기 ---------- */
  const prv = document.querySelector('#roomPreview .canvas');
  let prvKey = null;
  function openPreview(key) {
    prvKey = key;
    const name = key === 'cozy' ? '포근한 시작의 방' : ROOMS[key].name;
    prv.innerHTML = `
      <img class="rp-bg" src="${key === 'cozy' ? 'assets/room-empty.jpg' : R + key + '-bg.jpg'}" alt="${name} 미리보기" />
      <button type="button" class="rp-back" data-back aria-label="뒤로"><svg width="12" height="22" viewBox="0 0 12 22"><path d="M10.5 1.5 1.5 11l9 9.5" fill="none" stroke="#111" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <p class="rp-title">${name}</p>
      <button type="button" class="rp-apply" data-apply>🏠 홈 배경으로 꾸미기</button>`;
    go('roomPreview', 'up');
  }
  prv.addEventListener('click', e => { if (e.target.closest('[data-apply]')) applyHome(prvKey); });

  /* ---------- 홈 배경 적용 ---------- */
  const homeBg = document.querySelector('#home img[src*="room-empty"]');
  let homeKey = 'cozy';
  // 테마별 홈 아이콘 색
  const TONE = { sunny: '#e2a637', cherry: '#ee7b9c', autumn: '#e06a34', winter: '#5aa0e6', star: '#8463d8',
    breeze: '#3b92e0', xmas: '#d6403c', tidy: '#b5865c', animal: '#e0853a' };
  const phone = document.getElementById('phone');
  const tabCenter = document.getElementById('tabCenter');
  tabCenter.querySelector('img').insertAdjacentHTML('afterend', '<span class="tc-circle" aria-hidden="true"></span>');
  const matrix = document.querySelector('#toBlue feColorMatrix');
  const BLUE = '#4270f6';
  function setTone(hex) {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    const L = [0.2126, 0.7152, 0.0722];
    matrix.setAttribute('values', c.map(v => `${L.map(l => (l * (1 - v)).toFixed(4)).join(' ')} 0 ${v.toFixed(4)}`).join(' ') + ' 0 0 0 1 0');
    phone.style.setProperty('--tc', hex);
    phone.classList.toggle('themed', hex !== BLUE);
  }
  function applyHome(key) {
    homeKey = key;
    homeBg.src = key === 'cozy' ? 'assets/room-empty.jpg' : `${R}${key}-bg.jpg`;
    const name = key === 'cozy' ? '포근한 시작의 방' : ROOMS[key].name;
    const full = ROOMS[key] && ROOMS[key].owned.size === ROOMS[key].items.length;
    setTone(full ? TONE[key] : BLUE);
    switchTab('home');
    if (full) toast(`${name} 완성! 아이콘 색도 바뀌었어요 🎨`);
    else if (ROOMS[key]) toast(`${name}으로 꾸몄어요 ✨ (소품 ${ROOMS[key].owned.size}/${ROOMS[key].items.length})`);
    else toast(`홈이 ${name}으로 바뀌었어요 ✨`);
  }
  // 포근한 시작의 방 그림 미리보기에도 '홈 배경으로 꾸미기' 버튼
  const oldPrev = document.querySelector('#f-603-5208 .canvas');
  if (oldPrev) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'rp-apply'; b.textContent = '🏠 홈 배경으로 꾸미기';
    b.addEventListener('click', () => applyHome('cozy'));
    oldPrev.appendChild(b);
  }
  window.RUNI_ROOMS = { openRoom, openPreview, applyHome, ROOMS };
})();
