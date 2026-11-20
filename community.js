/* =========================================================
   소통 탭: 피드 · 메시지 · 랭킹 · 이벤트 · 대화방
   (script.js 다음에 불러와요)
   ========================================================= */
(function community() {
  const A = 'assets/comm/';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const me = () => ({
    name: document.getElementById('homeNick').textContent || '숨참혜성',
    av: document.getElementById('homeAv').src,
  });
  const nowTime = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const AV = name => name === '지훈' ? A + 'av-jihoon.png' : A + 'av-dog.png';

  /* ---------- 아이콘 ---------- */
  const IC = {
    heart: '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" fill="var(--hf,none)" stroke="#ec5a72" stroke-width="2" stroke-linejoin="round"/></svg>',
    comment: '<svg width="17" height="17" viewBox="0 0 24 24"><path d="M12 3.5c-5 0-8.8 3.4-8.8 7.7 0 2.1.9 4 2.4 5.4L4.8 20.5l4.5-1.8c.9.2 1.8.3 2.7.3 5 0 8.8-3.4 8.8-7.8S17 3.5 12 3.5z" fill="none" stroke="#222" stroke-width="2" stroke-linejoin="round"/></svg>',
    dots: '<svg width="18" height="4" viewBox="0 0 18 4"><circle cx="2" cy="2" r="1.8" fill="#888"/><circle cx="9" cy="2" r="1.8" fill="#888"/><circle cx="16" cy="2" r="1.8" fill="#888"/></svg>',
    back: '<svg width="12" height="22" viewBox="0 0 12 22"><path d="M10.5 1.5 1.5 11l9 9.5" fill="none" stroke="#4270f6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chev: '<svg width="10" height="18" viewBox="0 0 10 18"><path d="M1.5 1.5 8.5 9l-7 7.5" fill="none" stroke="#4270f6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 2v12M2 8h12" stroke="#444" stroke-width="1.8" stroke-linecap="round"/></svg>',
    send: '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M3 11.5 21 3l-6.5 18-3.2-7.3z" fill="#fff"/></svg>',
    check: '<svg width="11" height="9" viewBox="0 0 11 9"><path d="M1.2 4.6 4.2 7.5 9.8 1.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  /* ---------- 사람 정보 ---------- */
  const LV = { '지훈': 12, '러닝 메이트': 7, '러닝메이트': 7, '오늘도러닝': 11, '오늘도 러닝': 11, '바람처럼': 8, '러너123': 15, '하늘을달리다': 5, '민지': 9 };
  const KM = { '지훈': 56.3, '오늘도 러닝': 43.3, '오늘도러닝': 43.3, '러너123': 32.1, '러닝메이트': 30.6, '러닝 메이트': 30.6, '바람처럼': 20.2, '하늘을달리다': 10.23 };
  const following = new Set(['지훈', '러닝 메이트']);

  function openPerson(name) {
    if (name === me().name) { pSheet.close(); switchTab('f-67-1562'); return; }
    const lv = LV[name] || 6, km = KM[name] || (8 + lv * 1.7).toFixed(1);
    const body = pSheet.open('', `
      <div class="cp-top"><img src="${AV(name)}" alt="" /><b>${esc(name)}</b><span class="lv-pill">Lv.${lv}</span></div>
      <div class="pl-sum cp-sum"><span><em>${km}</em>이번 주 km</span><span><em>${lv * 4 + 3}</em>누적 러닝</span><span><em>${Math.round(lv * 1.6)}</em>메달</span></div>
      <div class="cp-btns">
        <button type="button" class="pl-btn ${following.has(name) ? 'on' : ''}" data-follow>${following.has(name) ? '팔로잉' : '팔로우'}</button>
        <button type="button" class="pl-btn" data-cheer>💙 응원하기</button>
      </div>
      <button type="button" class="btn-primary ps-btn" data-msg>메시지 보내기</button>`);
    body.querySelector('[data-follow]').addEventListener('click', e => {
      const b = e.currentTarget, on = !following.has(name);
      on ? following.add(name) : following.delete(name);
      b.classList.toggle('on', on); b.textContent = on ? '팔로잉' : '팔로우';
      toast(on ? `${name}님을 팔로우했어요` : '팔로우를 취소했어요');
    });
    body.querySelector('[data-cheer]').addEventListener('click', e => {
      e.currentTarget.disabled = true; e.currentTarget.textContent = '💙 응원 완료';
      toast(`${name}님에게 응원을 보냈어요`);
    });
    body.querySelector('[data-msg]').addEventListener('click', () => { pSheet.close(); openChat(chatIdFor(name)); });
  }

  /* =========================================================
     카테고리 버튼 (피드 · 메시지 공통)
     ========================================================= */
  const CATS = [['all', '전체', 48, null], ['run', '러닝 일상', 119, 'chip-run'], ['rec', '기록공유', 195, 'chip-rec'], ['qa', '질문/팁', 274, 'chip-qa'], ['free', '자유게시판', 349, 'chip-free']];
  function makeChips(canvas, onPick) {
    const box = document.createElement('div');
    box.className = 'cm-chips';
    box.innerHTML = CATS.map(([k, label, cx, ic]) => `
      <button type="button" class="cm-chip ${k === 'all' ? 'on' : ''}" data-cat="${k}" style="left:${cx - 36}px">
        <i class="cm-chip-bg"></i>
        ${ic ? `<img src="${A}${ic}.png" alt="" />` : '<span class="cm-all"><u></u><u></u><u></u><u></u></span>'}
        <span class="cm-chip-label">${label}</span>
      </button>`).join('');
    canvas.appendChild(box);
    box.addEventListener('click', e => {
      const b = e.target.closest('.cm-chip'); if (!b) return;
      box.querySelectorAll('.cm-chip').forEach(x => x.classList.toggle('on', x === b));
      onPick(b.dataset.cat);
    });
    return box;
  }
  const fitCanvas = (canvas, list, min) => { canvas.style.height = `${Math.max(min, list.offsetTop + list.offsetHeight + 130)}px`; };

  /* =========================================================
     피드
     ========================================================= */
  const POSTS = [
    { u: '러닝 메이트', cat: 'rec', time: '10분전', title: '오늘 한강 10km 완주! 👍', body: '날씨도 좋고 바람도 신선해서 너무 좋았어요!\n모두 오늘도 수고하셨습니다!', tags: ['한강러닝', '10km', '주말러닝'], likes: 28,
      cm: [['지훈', '와 10km 대단해요! 👏'], ['오늘도러닝', '저도 다음엔 한강 가볼게요'], ['바람처럼', '페이스 어떻게 되셨어요?'], ['러닝 메이트', '6분 초반이었어요 😊'], ['하늘을달리다', '멋져요!! 저도 자극받고 갑니다']] },
    { u: '지훈', cat: 'run', time: '1시간 전', title: '서울 숲 코스 추천해요', body: '초보자도 뛰기 좋은 코스 정리해봤어요!\n사진과 함께 공유 합니다.', tags: [], likes: 28, photo: 'screens/map2.jpg',
      cm: [['러닝 메이트', '서울숲 진짜 좋죠 🌳'], ['러너123', '몇 km 코스인가요?'], ['지훈', '한 바퀴에 약 3km예요!'], ['초보러너', '초보인데 이번 주말에 가볼게요'], ['오늘도러닝', '공유 감사합니다~']] },
    { u: '오늘도러닝', cat: 'qa', time: '3시간 전', title: '러닝 할때 추천', body: '러닝할때 사용하면 좋은 물품 정리\n1. 무릎 보호대\n2. 러닝 벨트 (휴대폰 · 물)\n3. 땀 흡수 잘 되는 양말', tags: ['러닝꿀팁'], likes: 28,
      cm: [['바람처럼', '러닝 벨트 진짜 필수예요'], ['지훈', '양말 중요하죠!'], ['러닝 메이트', '무릎 보호대 추천 제품 있나요?'], ['오늘도러닝', '저는 얇은 슬리브형 써요'], ['하늘을달리다', '꿀팁 감사합니다 🙏']] },
    { u: '바람처럼', cat: 'rec', time: '5시간 전', title: '첫 하프 마라톤 완주했어요 🏅', body: '2시간 10분 기록!\n내년엔 풀코스에 도전해볼게요.', tags: ['하프마라톤', '첫완주'], likes: 41,
      cm: [['지훈', '축하드려요!! 🎉'], ['러닝 메이트', '풀코스도 응원할게요'], ['오늘도러닝', '대단하세요 👍']] },
    { u: '러너123', cat: 'free', time: '어제', title: '러닝화 뭐 신으세요?', body: '쿠션 좋은 러닝화 추천 부탁드려요 🙏\n발볼이 넓은 편이에요.', tags: ['러닝화'], likes: 12,
      cm: [['바람처럼', '발볼 넓으면 와이드 모델 추천해요'], ['지훈', '매장에서 꼭 신어보세요!'], ['하늘을달리다', '저도 궁금했어요'], ['러너123', '감사합니다 참고할게요!']] },
    { u: '하늘을달리다', cat: 'run', time: '어제', title: '새벽 러닝 6일째 성공 🌅', body: '아침 공기가 정말 상쾌해요.\n같이 달릴 분 구해요!', tags: ['새벽러닝'], likes: 9,
      cm: [['러닝 메이트', '저도 새벽파예요!'], ['오늘도러닝', '꾸준함 최고 👏']] },
  ];
  POSTS.forEach((p, i) => { p.id = 'p' + i; p.liked = false; });
  const feedCanvas = document.querySelector('#f-136-1566 .canvas');
  const feed = { cat: 'all', tag: null, list: null };
  makeChips(feedCanvas, c => { feed.cat = c; feed.tag = null; renderFeed(); });
  feed.list = Object.assign(document.createElement('div'), { className: 'fd-list' });
  feedCanvas.appendChild(feed.list);

  function postHTML(p) {
    const mine = p.u === me().name && p.mine;
    return `<article class="fd-post" data-id="${p.id}">
      <img class="fd-av" data-person="${esc(p.u)}" src="${mine ? me().av : AV(p.u)}" alt="" />
      <div class="fd-head"><b data-person="${esc(p.u)}">${esc(p.u)}</b><span class="lv-pill">Lv.${mine ? 10 : (LV[p.u] || 6)}</span>
        <span class="fd-time">${p.time}</span><button type="button" class="fd-more" aria-label="더보기" data-more>${IC.dots}</button></div>
      <div class="fd-main" data-open>
        <p class="fd-title">${esc(p.title)}</p>
        <p class="fd-body">${esc(p.body).replace(/\n/g, '<br>')}</p>
        ${p.photo ? `<img class="fd-photo" src="${p.photo}" alt="" />` : ''}
      </div>
      ${p.tags.length ? `<div class="fd-tags">${p.tags.map(t => `<button type="button" data-tag="${esc(t)}">#${esc(t)}</button>`).join('')}</div>` : ''}
      <div class="fd-acts">
        <button type="button" class="fd-like ${p.liked ? 'on' : ''}" data-like aria-label="좋아요">${IC.heart}<span>${p.likes}</span></button>
        <button type="button" class="fd-cm" data-open aria-label="댓글">${IC.comment}<span>${p.cm.length}</span></button>
      </div>
    </article>`;
  }
  function renderFeed() {
    const items = POSTS.filter(p => !p.hidden && (feed.cat === 'all' || p.cat === feed.cat) && (!feed.tag || p.tags.includes(feed.tag)));
    feed.list.innerHTML =
      (feed.tag ? `<div class="fd-filter">#${esc(feed.tag)} 게시글 ${items.length}개 <button type="button" data-clear-tag aria-label="필터 지우기">✕</button></div>` : '') +
      (items.length ? items.map(postHTML).join('') : '<p class="cm-empty">아직 게시글이 없어요.<br>첫 글을 올려보세요! ✏️</p>');
    fitCanvas(feedCanvas, feed.list, 983);
  }
  renderFeed();
  const postOf = el => POSTS.find(p => p.id === el.closest('.fd-post').dataset.id);

  feed.list.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-clear-tag]')) { feed.tag = null; renderFeed(); return; }
    const person = t.closest('[data-person]');
    if (person) { openPerson(person.dataset.person); return; }
    const like = t.closest('[data-like]');
    if (like) {
      const p = postOf(like); p.liked = !p.liked; p.likes += p.liked ? 1 : -1;
      like.classList.toggle('on', p.liked); like.querySelector('span').textContent = p.likes;
      like.classList.remove('pop'); void like.offsetWidth; like.classList.add('pop');
      return;
    }
    const tag = t.closest('[data-tag]');
    if (tag) { feed.tag = tag.dataset.tag; renderFeed(); feedCanvas.parentElement.scrollTo({ top: 300, behavior: 'smooth' }); return; }
    if (t.closest('[data-more]')) { openPostMenu(postOf(t)); return; }
    if (t.closest('[data-open]')) openPost(postOf(t));
  });

  function openPost(p) {
    const body = pSheet.open('게시글', `
      <div class="pd-head"><img src="${p.mine ? me().av : AV(p.u)}" alt="" /><div><b>${esc(p.u)}</b><small>${p.time}</small></div></div>
      <p class="fd-title">${esc(p.title)}</p>
      <p class="fd-body">${esc(p.body).replace(/\n/g, '<br>')}</p>
      ${p.photo ? `<img class="fd-photo" src="${p.photo}" alt="" />` : ''}
      <p class="pd-count">댓글 <b>${p.cm.length}</b></p>
      <div class="pd-cms">${p.cm.map(cmHTML).join('')}</div>
      <form class="pd-write"><input type="text" placeholder="댓글을 남겨주세요" maxlength="80" /><button type="submit">등록</button></form>`);
    const form = body.querySelector('.pd-write');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input'), v = input.value.trim();
      if (!v) return;
      p.cm.push([me().name, v, true]);
      body.querySelector('.pd-cms').insertAdjacentHTML('beforeend', cmHTML(p.cm[p.cm.length - 1]));
      body.querySelector('.pd-count b').textContent = p.cm.length;
      input.value = '';
      body.scrollTop = body.scrollHeight;
      renderFeed();
    });
  }
  function cmHTML([u, t, mine]) {
    return `<div class="pd-cm"><img src="${mine ? me().av : AV(u)}" alt="" /><div><b>${esc(u)}</b><p>${esc(t)}</p></div></div>`;
  }
  function openPostMenu(p) {
    const body = pSheet.open('', p.mine
      ? `<button type="button" class="ps-btn2" data-share>🔗 링크 복사하기</button><button type="button" class="ps-btn2 danger" data-del>🗑 게시글 삭제하기</button>`
      : `<button type="button" class="ps-btn2" data-share>🔗 링크 복사하기</button><button type="button" class="ps-btn2" data-hide>🙈 이 글 숨기기</button><button type="button" class="ps-btn2 danger" data-report>🚨 신고하기</button>`);
    const on = (sel, fn) => { const b = body.querySelector(sel); if (b) b.addEventListener('click', fn); };
    on('[data-share]', () => { pSheet.close(); toast('링크를 복사했어요'); });
    on('[data-hide]', () => { p.hidden = true; pSheet.close(); renderFeed(); toast('게시글을 숨겼어요'); });
    on('[data-del]', () => { POSTS.splice(POSTS.indexOf(p), 1); pSheet.close(); renderFeed(); toast('게시글을 삭제했어요'); });
    on('[data-report]', () => { pSheet.close(); toast('신고가 접수됐어요. 확인 후 조치할게요'); });
  }

  // 글쓰기 버튼
  const fab = document.createElement('button');
  fab.type = 'button'; fab.className = 'fd-fab'; fab.id = 'feedFab'; fab.setAttribute('aria-label', '글쓰기');
  fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 22 22"><path d="M11 3v16M3 11h16" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>';
  document.getElementById('phone').insertBefore(fab, document.getElementById('tabbar'));
  fab.addEventListener('click', () => {
    let cat = feed.cat === 'all' ? 'run' : feed.cat;
    const body = pSheet.open('글쓰기', `
      <p class="wr-label">카테고리</p>
      <div class="wr-cats">${CATS.slice(1).map(([k, l]) => `<button type="button" class="wr-c ${k === cat ? 'on' : ''}" data-c="${k}">${l}</button>`).join('')}</div>
      <input class="wr-in" data-title type="text" maxlength="30" placeholder="제목을 입력해주세요" />
      <textarea class="ask-box" data-body maxlength="300" placeholder="오늘의 러닝 이야기를 들려주세요"></textarea>
      <input class="wr-in" data-tags type="text" maxlength="40" placeholder="#태그 (띄어쓰기로 구분)" />
      <button type="button" class="btn-primary ps-btn" data-post disabled>올리기</button>`);
    const title = body.querySelector('[data-title]'), text = body.querySelector('[data-body]'), btn = body.querySelector('[data-post]');
    const check = () => { btn.disabled = !(title.value.trim() && text.value.trim()); };
    title.addEventListener('input', check); text.addEventListener('input', check);
    body.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => {
      cat = b.dataset.c; body.querySelectorAll('[data-c]').forEach(x => x.classList.toggle('on', x === b));
    }));
    btn.addEventListener('click', () => {
      const tags = body.querySelector('[data-tags]').value.split(/\s+/).map(t => t.replace(/^#+/, '')).filter(Boolean).slice(0, 4);
      POSTS.unshift({ id: 'p' + Date.now(), u: me().name, mine: true, cat, time: '방금 전', title: title.value.trim(), body: text.value.trim(), tags, likes: 0, liked: false, cm: [] });
      pSheet.close();
      feed.tag = null; feed.cat = 'all';
      feedCanvas.querySelectorAll('.cm-chip').forEach(x => x.classList.toggle('on', x.dataset.cat === 'all'));
      renderFeed();
      document.getElementById('f-136-1566').scrollTo({ top: 300, behavior: 'smooth' });
      toast('게시글을 올렸어요! ✨');
    });
  });

  /* =========================================================
     대화방 데이터
     ========================================================= */
  const CHATS = [
    { id: 'jihoon', name: '지훈', lv: 12, av: A + 'av-jihoon.png', cat: 'run', time: '오전 09:40', unread: 2, card: true, date: '2026 5월 20일 (월)',
      msgs: [['지훈', '안녕하세요!', '09:30'], ['지훈', '오늘 저녁 7시에 같이 러닝 어때요?', '09:30'], ['me', '좋아요! 어디서 만날까요?', '09:31'],
        ['지훈', '한강공원 잠실나들목 어때요?', '09:31'], ['지훈', { loc: ['한강공원 잠실나들목', '서울 송파구 잠실동 1-1'] }, '09:31'],
        ['me', '좋아요! 7시에 뵐게요', '09:33'], ['지훈', '네! 얼마 안 남았으니 파이팅이에요!', '09:34'], ['지훈', '오늘 저녁 7시에 같이 러닝해요!', '09:40']],
      replies: ['좋아요! 😊', '오늘도 파이팅이에요 💪', '그럼 그때 봬요!', '저도 방금 5km 뛰고 왔어요 🏃'] },
    { id: 'group', name: '10km 챌린지방', av: A + 'av-group.png', cat: 'rec', time: '오전 08:15', unread: 3, group: 4, date: '2026 5월 21일 (화)',
      msgs: [['러닝 메이트', '다들 오늘 기록 공유해요!', '08:02'], ['오늘도러닝', '저는 7.2km 뛰었어요 🔥', '08:05'], ['바람처럼', '오늘 코스 사진이에요', '08:15'], ['바람처럼', { img: 'screens/map1.jpg' }, '08:15']],
      replies: ['오 멋져요! 👏', '다들 대단해요 🔥', '내일도 같이 달려요!'], from: ['러닝 메이트', '오늘도러닝', '바람처럼'] },
    { id: 'mate', name: '러닝 메이트', lv: 7, av: A + 'av-dog.png', cat: 'run', time: '어제', unread: 0, card: true, date: '2026 5월 19일 (일)',
      msgs: [['러닝 메이트', '이번 주 벌써 3번 뛰셨네요!', '20:10'], ['me', '네 요즘 재밌어요 ㅎㅎ', '20:12'], ['러닝 메이트', '이번 주 목표 달성 응원해요!', '20:13']],
      replies: ['화이팅이에요! 💙', '같이 꾸준히 달려봐요', '오 좋네요!'] },
    { id: 'today', name: '오늘도러닝', lv: 11, av: A + 'av-dog2.png', cat: 'qa', time: '어제', unread: 1, card: true, date: '2026 5월 19일 (일)',
      msgs: [['me', '내일 아침에 같이 뛸래요?', '18:40'], ['오늘도러닝', '좋아요! 몇 시가 좋아요?', '18:42'], ['me', '7시 어때요?', '18:43'], ['오늘도러닝', '좋아요! 그럼 공원 입구에서 만나요', '18:45']],
      replies: ['넵! 내일 봬요 😄', '물 꼭 챙기세요!', '좋아요 👍'] },
    { id: 'admin', name: '운영팀', av: A + 'av-flag.png', cat: 'free', time: '05.18', unread: 1, date: '2026 5월 18일 (토)',
      msgs: [['me', '메달이 안 들어왔어요', '10:02'], ['운영팀', '안녕하세요, 루니 운영팀입니다 😊', '14:20'], ['운영팀', '문의하신 내용에 답변드려요. 메달은 기록 동기화 후 최대 1시간 안에 지급돼요.', '14:21']],
      replies: ['문의 감사합니다! 확인 후 빠르게 답변드릴게요 😊'] },
    { id: 'heart', name: '하트 알림', av: A + 'av-heart.png', cat: 'rec', time: '05.18', unread: 0, system: true, date: '2026 5월 18일 (토)',
      msgs: [['하트 알림', '바람처럼님이 회원님의 기록에 하트를 보냈어요. 💗', '09:12'], ['하트 알림', '지훈님이 회원님의 기록에 하트를 보냈어요. 💗', '12:40'], ['하트 알림', '민지님이 회원님의 기록에 하트를 보냈어요. 💗', '18:03']] },
  ];
  const chatById = id => CHATS.find(c => c.id === id);
  function chatIdFor(name) {
    const found = CHATS.find(c => c.name === name || c.name.replace(/\s/g, '') === name.replace(/\s/g, ''));
    if (found) return found.id;
    const c = { id: 'u' + Date.now(), name, lv: LV[name] || 6, av: AV(name), cat: 'run', time: '방금', unread: 0, card: true, date: '오늘', msgs: [],
      replies: ['안녕하세요! 반가워요 😊', '같이 달려요!', '좋아요 👍'] };
    CHATS.unshift(c); renderMsgList();
    return c.id;
  }
  const lastText = c => {
    const m = c.msgs[c.msgs.length - 1]; if (!m) return '대화를 시작해보세요';
    const who = c.group && m[0] !== 'me' ? `${m[0]}님이 ` : '';
    if (typeof m[1] === 'string') return m[1];
    return m[1].img ? `${who}사진을 보냈습니다.` : m[1].loc ? `${who}위치를 공유했습니다.` : `${who}러닝 기록을 공유했습니다.`;
  };

  /* =========================================================
     메시지 목록
     ========================================================= */
  const msgCanvas = document.querySelector('#f-146-1918 .canvas');
  const msgState = { cat: 'all' };
  makeChips(msgCanvas, c => { msgState.cat = c; renderMsgList(); });
  const notice = document.createElement('button');
  notice.type = 'button'; notice.className = 'hs'; notice.setAttribute('aria-label', '공지사항');
  notice.style.cssText = 'left:22px;top:306px;width:358px;height:46px';
  msgCanvas.appendChild(notice);
  notice.addEventListener('click', () => {
    pSheet.open('📌 공지사항', `<div class="doc">
      <h4>5월 챌린지 안내</h4><p>5월 한 달 동안 누적 50km를 달리면 한정 메달을 드려요. 기록은 앱에서 측정한 러닝만 인정돼요.</p>
      <h4>인증 방법</h4><p>러닝을 마친 뒤 기록 화면에서 ‘공유하기’를 누르면 피드에 자동으로 인증돼요.</p>
      <h4>보상 지급</h4><p>챌린지가 끝난 다음 날까지 메달과 코인이 지급돼요.</p>
      <p class="doc-date">2026.05.01 · 루니 운영팀</p></div>`);
  });
  const msgList = Object.assign(document.createElement('div'), { className: 'ms-list' });
  msgCanvas.appendChild(msgList);
  function renderMsgList() {
    const items = CHATS.filter(c => msgState.cat === 'all' || c.cat === msgState.cat);
    msgList.innerHTML = items.length ? items.map(c => `
      <button type="button" class="ms-row" data-chat="${c.id}">
        <img src="${c.av}" alt="" />
        <span class="ms-name"><b>${esc(c.name)}</b>${c.lv ? `<span class="lv-pill">Lv.${c.lv}</span>` : ''}${c.group ? `<em>${c.group}</em>` : ''}</span>
        <span class="ms-time">${c.time}</span>
        <span class="ms-last">${esc(lastText(c))}</span>
        ${c.unread ? `<span class="ms-badge">${c.unread}</span>` : ''}
      </button>`).join('') : '<p class="cm-empty">이 카테고리의 대화가 없어요</p>';
    fitCanvas(msgCanvas, msgList, 977);
  }
  renderMsgList();
  msgList.addEventListener('click', e => { const r = e.target.closest('[data-chat]'); if (r) openChat(r.dataset.chat); });

  /* =========================================================
     대화방
     ========================================================= */
  const chatSec = document.getElementById('chat');
  const cc = chatSec.querySelector('.ch-canvas');
  cc.innerHTML = `
    <div class="ch-top">
      <button type="button" class="ch-back" data-back aria-label="뒤로">${IC.back}</button>
      <button type="button" class="ch-who" data-who><img alt="" /><b></b><span class="lv-pill"></span></button>
      <button type="button" class="ch-gear" data-cset aria-label="대화방 설정"><img src="assets/ic-gear.svg" alt="" /></button>
      <button type="button" class="ch-card" data-rank>
        <span class="ch-shoe"><img src="assets/tab-home-shoe.svg" alt="" /></span>
        <small>이번 주 활동</small><b><em></em> km</b><span class="ch-recent"></span>
        <i>${IC.chev}</i>
      </button>
    </div>
    <div class="ch-scroll"><div class="ch-msgs"></div></div>
    <form class="ch-bar">
      <button type="button" class="ch-plus" data-plus aria-label="더하기">${IC.plus}</button>
      <input type="text" placeholder="메시지 입력" maxlength="200" aria-label="메시지 입력" />
      <button type="button" class="ch-hash" data-hash aria-label="빠른 답장">#</button>
      <button type="submit" class="ch-send" aria-label="보내기">${IC.send}</button>
    </form>`;
  const scroller = cc.querySelector('.ch-scroll'), msgsEl = cc.querySelector('.ch-msgs');
  const bar = cc.querySelector('.ch-bar'), input = bar.querySelector('input');
  let chat = null, typingTimer = null;

  function bubble(m, prev) {
    const [from, content, time] = m, mine = from === 'me';
    const first = !prev || prev[0] !== from;
    let inner;
    if (typeof content === 'string') inner = `<p class="ch-b">${esc(content)}</p>`;
    else if (content.loc) inner = `<div class="ch-b ch-loc"><img src="${A}map.jpg" alt="" /><div><b>${esc(content.loc[0])}</b><small>${esc(content.loc[1])}</small></div></div>`;
    else if (content.img) inner = `<img class="ch-img" src="${content.img}" alt="사진" />`;
    else if (content.run) inner = `<div class="ch-b ch-run"><small>🏃 러닝 기록</small><b>${content.run[0]} km</b><span>${content.run[1]} · 평균 ${content.run[2]}</span></div>`;
    const who = !mine && first && !chat.system ? `<img class="ch-av" src="${chat.group ? AV(from) : chat.av}" alt="" /><span class="ch-name">${esc(from)}</span>` : '';
    return `<div class="ch-m ${mine ? 'me' : 'you'} ${first ? 'first' : ''}">${who}<div class="ch-row">${inner}<span class="ch-t">${time}</span></div></div>`;
  }
  function renderChat() {
    msgsEl.innerHTML = `<p class="ch-date">${chat.date}</p>` + chat.msgs.map((m, i) => bubble(m, chat.msgs[i - 1])).join('');
    requestAnimationFrame(() => { scroller.scrollTop = scroller.scrollHeight; });
  }
  function openChat(id) {
    chat = chatById(id); if (!chat) return;
    chat.unread = 0; renderMsgList();
    chatSec.classList.toggle('no-card', !chat.card);
    chatSec.classList.toggle('system', !!chat.system);
    const who = cc.querySelector('.ch-who');
    who.querySelector('img').src = chat.av;
    who.querySelector('b').textContent = chat.name + (chat.group ? ` ${chat.group}` : '');
    who.querySelector('.lv-pill').textContent = chat.lv ? `Lv.${chat.lv}` : '';
    who.querySelector('.lv-pill').style.display = chat.lv ? '' : 'none';
    cc.querySelector('.ch-card em').textContent = KM[chat.name] || (8 + (chat.lv || 5) * 1.7).toFixed(1);
    cc.querySelector('.ch-recent').textContent = `최근 기록 ${(3 + (chat.lv || 5) * .18).toFixed(2)} km`;
    input.value = ''; bar.classList.remove('typing');
    clearTimeout(typingTimer);
    renderChat();
    if (!current || current.id !== 'chat') go('chat');
  }
  window.openChat = openChat;

  function send(content) {
    const t = nowTime();
    if (chat.date !== '오늘' && !chat.today) { chat.today = true; msgsEl.insertAdjacentHTML('beforeend', '<p class="ch-date">오늘</p>'); }
    const m = ['me', content, t];
    msgsEl.insertAdjacentHTML('beforeend', bubble(m, chat.msgs[chat.msgs.length - 1]));
    chat.msgs.push(m); chat.time = t; renderMsgList();
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
    // 상대방 답장
    if (!chat.replies) return;
    const room = chat;
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      if (chat !== room) return;
      msgsEl.insertAdjacentHTML('beforeend', '<div class="ch-m you ch-typing"><div class="ch-row"><p class="ch-b"><i></i><i></i><i></i></p></div></div>');
      scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
      typingTimer = setTimeout(() => {
        if (chat !== room) return;
        msgsEl.querySelector('.ch-typing')?.remove();
        const from = room.from ? room.from[Math.floor(Math.random() * room.from.length)] : room.name;
        const r = [from, room.replies[Math.floor(Math.random() * room.replies.length)], nowTime()];
        msgsEl.insertAdjacentHTML('beforeend', bubble(r, room.msgs[room.msgs.length - 1]));
        room.msgs.push(r); renderMsgList();
        scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
      }, 1300);
    }, 700);
  }
  input.addEventListener('input', () => bar.classList.toggle('typing', !!input.value.trim()));
  bar.addEventListener('submit', e => {
    e.preventDefault();
    const v = input.value.trim(); if (!v) return;
    input.value = ''; bar.classList.remove('typing');
    send(v); input.focus();
  });
  const photoIn = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*', hidden: true });
  cc.appendChild(photoIn);
  photoIn.addEventListener('change', () => {
    const f = photoIn.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => send({ img: r.result }); r.readAsDataURL(f); photoIn.value = '';
  });
  cc.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-who]')) { if (!chat.group && !chat.system && chat.name !== '운영팀') openPerson(chat.name); return; }
    if (t.closest('[data-rank]')) { switchTab('f-181-3907'); return; }
    if (t.closest('[data-plus]')) {
      const body = pSheet.open('보내기', `
        <button type="button" class="ps-btn2" data-a="photo">🖼 사진 보내기</button>
        <button type="button" class="ps-btn2" data-a="loc">📍 위치 공유하기</button>
        <button type="button" class="ps-btn2" data-a="run">🏃 내 러닝 기록 공유하기</button>`);
      body.addEventListener('click', ev => {
        const a = ev.target.closest('[data-a]'); if (!a) return;
        pSheet.close();
        if (a.dataset.a === 'photo') photoIn.click();
        if (a.dataset.a === 'loc') send({ loc: ['내 위치', '서울 송파구 올림픽로 25'] });
        if (a.dataset.a === 'run') send({ run: ['5.21', '31분 42초', `6'05"`] });
      });
      return;
    }
    if (t.closest('[data-hash]')) {
      const Q = ['#같이달려요 🏃', '#오늘도파이팅 💪', '#기록인증 ✅', '#내일봐요 👋', '#수고했어요 👏'];
      const body = pSheet.open('빠른 답장', `<div class="wr-cats">${Q.map(q => `<button type="button" class="pl-btn" data-q="${q}">${q}</button>`).join('')}</div>`);
      body.addEventListener('click', ev => { const q = ev.target.closest('[data-q]'); if (q) { pSheet.close(); send(q.dataset.q); } });
      return;
    }
    if (t.closest('[data-cset]')) {
      const room = chat;
      const body = pSheet.open('대화방 설정', `
        <button type="button" class="ps-btn2" data-mute>${room.muted ? '🔔 알림 켜기' : '🔕 알림 끄기'}</button>
        <button type="button" class="ps-btn2" data-clear>🧹 대화 내용 지우기</button>
        <button type="button" class="ps-btn2 danger" data-leave>🚪 대화방 나가기</button>`);
      body.querySelector('[data-mute]').addEventListener('click', () => { room.muted = !room.muted; pSheet.close(); toast(room.muted ? '이 대화방 알림을 껐어요' : '알림을 다시 켰어요'); });
      body.querySelector('[data-clear]').addEventListener('click', () => { room.msgs = []; room.today = false; pSheet.close(); renderChat(); renderMsgList(); toast('대화 내용을 지웠어요'); });
      body.querySelector('[data-leave]').addEventListener('click', () => {
        CHATS.splice(CHATS.indexOf(room), 1); pSheet.close(); renderMsgList(); back(); toast('대화방에서 나왔어요');
      });
    }
  });
  // 알림 · 친구 목록의 '지훈과의 대화' 그림 화면 대신 진짜 대화방으로
  const _go = go;
  go = function (id, mode) { if (id === 'f-148-1782') { openChat('jihoon'); return; } return _go(id, mode); };

  /* =========================================================
     랭킹
     ========================================================= */
  const rkCanvas = document.querySelector('#f-181-3907 .canvas');
  const RK = {
    dist: { label: '이번 주 총 거리', mine: ['15.00', 'km'], unit: 'km', pod: ['43.3', '56.3', '32.1'], list: ['30.6', '20.2', '15.0', '10.23'] },
    time: { label: '이번 주 총 시간', mine: ['1:32', '시간'], unit: 'h', pod: ['4:21', '5:38', '3:15'], list: ['3:02', '2:05', '1:32', '1:01'] },
    kcal: { label: '이번 주 소모 칼로리', mine: ['1,020', 'kcal'], unit: 'kcal', pod: ['2,940', '3,820', '2,180'], list: ['2,080', '1,370', '1,020', '695'] },
  };
  const PODIUM = [['오늘도 러닝', 22, 440, 103, 183, 73, 'blue'], ['지훈', 141, 425, 126, 198, 204, 'gold'], ['러너123', 282, 450, 98, 173, 331, 'pink']];
  const LIST = [['러닝메이트', 7], ['바람처럼', 8], [null, 10], ['하늘을달리다', 5]];
  rkCanvas.insertAdjacentHTML('beforeend', `
    <div class="rk-mine"><small></small><b><em></em> <span></span></b></div>
    <button type="button" class="hs" data-myrank aria-label="내 순위 보기" style="left:42px;top:300px;width:100px;height:26px"></button>
    <div class="rk-seg">${[['dist', '거리'], ['time', '시간'], ['kcal', '칼로리']].map(([k, l], i) => `<button type="button" class="${i ? '' : 'on'}" data-m="${k}">${l}</button>`).join('')}</div>
    ${PODIUM.map(([n, x, y, w, h, cx, c], i) => `
      <button type="button" class="hs rk-pod" data-person="${n}" aria-label="${n}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></button>
      <span class="rk-pv ${c}" style="left:${cx - 34}px;top:${i === 1 ? 600 : i === 0 ? 604 : 606}px"></span>`).join('')}
    <div class="rk-list"></div>
    <button type="button" class="hs" data-runnow aria-label="러닝 시작하기" style="left:22px;top:860px;width:358px;height:95px"></button>`);
  const rkList = rkCanvas.querySelector('.rk-list');
  let metric = 'dist';
  function paintRank() {
    const d = RK[metric];
    rkCanvas.querySelector('.rk-mine small').textContent = d.label;
    rkCanvas.querySelector('.rk-mine em').textContent = d.mine[0];
    rkCanvas.querySelector('.rk-mine span').textContent = d.mine[1];
    rkCanvas.querySelectorAll('.rk-pv').forEach((el, i) => { el.innerHTML = `<b>${d.pod[i]}</b> ${d.unit}`; });
    rkList.innerHTML = LIST.map(([n, lv], i) => {
      const mine = !n, name = mine ? me().name : n;
      return `<button type="button" class="rk-row ${mine ? 'me' : ''}" data-person="${esc(name)}">
        <span class="rk-n">${i + 4}</span><img src="${mine ? me().av : A + 'av-dog.png'}" alt="" />
        <span class="rk-name">${esc(name)}</span><span class="lv-pill">Lv.${lv}</span>
        <span class="rk-v"><b>${d.list[i]}</b> ${d.unit}</span></button>`;
    }).join('');
  }
  paintRank();
  rkCanvas.addEventListener('click', e => {
    const t = e.target;
    const m = t.closest('[data-m]');
    if (m) {
      metric = m.dataset.m;
      rkCanvas.querySelectorAll('.rk-seg button').forEach(b => b.classList.toggle('on', b === m));
      paintRank();
      rkCanvas.querySelectorAll('.rk-pv, .rk-mine, .rk-v').forEach(el => { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); });
      return;
    }
    const p = t.closest('[data-person]'); if (p) { openPerson(p.dataset.person); return; }
    if (t.closest('[data-myrank]')) {
      const row = rkList.querySelector('.me');
      document.getElementById('f-181-3907').scrollTo({ top: 430, behavior: 'smooth' });
      row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash');
      return;
    }
    if (t.closest('[data-runnow]')) go('f-676-3844', 'up');
  });

  /* =========================================================
     이벤트
     ========================================================= */
  const E = 'assets/event/';
  const evCanvas = document.querySelector('#event .ev-canvas');
  const evState = { tab: 'now', att: 3, attToday: false, challengeKm: 32.4, gift: false, joined: false, alarm: {} };
  const EVENTS = {
    now: [
      { id: 'att', img: 'ev1.jpg', title: '11월 출석 챌린지', desc: '11월 한 달간 앱에 접속하고<br>출석하여 보상을 받아요!', reward: ['gift.png', '포인트 200P'] },
      { id: 'run', img: 'ev2.jpg', title: '11월 러닝 챌린지', desc: '11월에 50km를 달려보세요!', reward: ['medal.png', '한정 배지<br>(11월 러너)'] },
      { id: 'gift', img: 'ev3.jpg', title: '11월 스페셜 선물 이벤트', desc: '11월 러닝에 참여하고<br>특별한 선물을 받아요!', reward: ['ticket.png', '추가 포인트<br>500P'] },
    ],
    soon: [
      { id: 'xmas', img: 'ev3.jpg', title: '크리스마스 러닝 이벤트', desc: '12.20 - 12.25<br>산타 루니와 함께 달려요!', reward: ['gift.png', '한정 스킨'] },
      { id: 'winter', img: 'ev2.jpg', title: '12월 새벽 러닝 챌린지', desc: '12.01 - 12.31<br>새벽 6시 전에 10번 달리기', reward: ['medal.png', '한정 배지<br>(겨울 러너)'] },
    ],
    done: [
      { id: 'oct-run', img: 'ev2.jpg', title: '10월 러닝 챌린지', desc: '10월에 40km 달리기<br>42.8km 달성!', reward: ['medal.png', '받기 완료'] },
      { id: 'oct-att', img: 'ev1.jpg', title: '10월 출석 챌린지', desc: '7일 출석하고<br>보상 받기 · 7/7일', reward: ['gift.png', '받기 완료'] },
    ],
  };
  const STATUS = { now: '진행중', soon: '예정', done: '완료' };
  evCanvas.innerHTML = `
    <div class="cm-seg">${[['f-136-1566', '피드'], ['f-146-1918', '메시지'], ['f-181-3907', '랭킹'], ['event', '이벤트']].map(([id, l]) => `<button type="button" class="${id === 'event' ? 'on' : ''}" data-tab-go="${id}">${l}</button>`).join('')}</div>
    <div class="ev-banner"><img src="${E}banner.jpg" alt="11월 러닝 이벤트 · 참여 기간 11.01 - 11.30" />
      <button type="button" class="ev-join" data-join aria-label="참여하기"></button></div>
    <div class="ev-tabs">${Object.entries(STATUS).map(([k, l]) => `<button type="button" class="${k === 'now' ? 'on' : ''}" data-et="${k}">${l}</button>`).join('')}</div>
    <div class="ev-list"></div>`;
  const evList = evCanvas.querySelector('.ev-list');

  function evExtra(e) {
    if (evState.tab === 'now') {
      if (e.id === 'att') return `<div class="ev-dots">${Array.from({ length: 7 }, (_, i) => `<i class="${i < evState.att ? 'on' : ''}">${i < evState.att ? IC.check : ''}</i>`).join('')}</div>
        <button type="button" class="ev-pill" data-act="att">${evState.att}/7일</button>`;
      if (e.id === 'run') return `<span class="ev-goal"><svg width="14" height="14" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="#333" stroke-width="1.5"/><circle cx="8" cy="8" r="3" fill="none" stroke="#333" stroke-width="1.5"/></svg>목표 거리 <b>50.0 km</b></span>
        <button type="button" class="ev-btn" data-act="run">도전하기 ›</button>`;
      if (e.id === 'gift') return `<button type="button" class="ev-btn light ${evState.gift ? 'done' : ''}" data-act="gift" ${evState.gift ? 'disabled' : ''}>${evState.gift ? '받기 완료' : '선물받기 ›'}</button>`;
    }
    if (evState.tab === 'soon') { const on = evState.alarm[e.id]; return `<button type="button" class="ev-btn light ${on ? 'done' : ''}" data-act="alarm">${on ? '🔔 알림 신청됨' : '알림 받기 ›'}</button>`; }
    return `<span class="ev-pill done">✔ 완료</span>`;
  }
  function renderEvents() {
    evList.innerHTML = EVENTS[evState.tab].map(e => `
      <div class="ev-card ${evState.tab}" data-ev="${e.id}">
        <img class="ev-img" src="${E}${e.img}" alt="" />
        <span class="ev-st">${STATUS[evState.tab]}</span>
        <b class="ev-title">${e.title}</b>
        <p class="ev-desc">${e.desc}</p>
        <div class="ev-reward"><img src="${E}${e.reward[0]}" alt="" /><span>보상</span><small>${e.reward[1]}</small></div>
        ${evExtra(e)}
      </div>`).join('');
    evCanvas.style.height = `${Math.max(874, evList.offsetTop + evList.offsetHeight + 130)}px`;
  }
  renderEvents();

  function eventAction(act, card) {
    if (act === 'att') {
      if (evState.attToday) { toast('오늘은 이미 출석했어요 ✅'); return; }
      evState.attToday = true; evState.att = Math.min(7, evState.att + 1);
      renderEvents();
      const dot = evList.querySelectorAll('.ev-dots i')[evState.att - 1]; if (dot) dot.classList.add('pop');
      toast(`출석 완료! ${evState.att}/7일 🎉`);
      return;
    }
    if (act === 'run') {
      const pct = Math.round(evState.challengeKm / 50 * 100);
      const body = pSheet.open('11월 러닝 챌린지', `
        <div class="bk-box"><span>🏅</span><b>${evState.challengeKm} km / 50 km</b><small>${(50 - evState.challengeKm).toFixed(1)} km 더 달리면 한정 배지를 받아요!</small><i><em style="width:${pct}%"></em></i></div>
        <button type="button" class="btn-primary ps-btn" data-go-run>지금 달리러 가기</button>`);
      body.querySelector('[data-go-run]').addEventListener('click', () => { pSheet.close(); go('f-676-3844', 'up'); });
      return;
    }
    if (act === 'gift') {
      evState.gift = true; renderEvents();
      addCoins(500);
      toast('선물 도착! 500코인을 받았어요 🎁');
      return;
    }
    if (act === 'alarm') {
      const id = card.dataset.ev; evState.alarm[id] = !evState.alarm[id]; renderEvents();
      toast(evState.alarm[id] ? '이벤트가 시작되면 알려드릴게요 🔔' : '알림을 취소했어요');
    }
  }
  function openEvent(id) {
    const e = Object.values(EVENTS).flat().find(x => x.id === id);
    const body = pSheet.open(e.title, `
      <img class="ev-detail-img" src="${E}${e.img}" alt="" />
      <p class="ev-detail-desc">${e.desc}</p>
      <div class="ev-reward big"><img src="${E}${e.reward[0]}" alt="" /><span>보상</span><small>${e.reward[1]}</small></div>
      ${evState.tab === 'now' ? `<button type="button" class="btn-primary ps-btn" data-do>${id === 'att' ? '오늘 출석하기' : id === 'run' ? '도전 현황 보기' : '선물받기'}</button>` : ''}`);
    const b = body.querySelector('[data-do]');
    if (b) b.addEventListener('click', () => { if (id !== 'run') pSheet.close(); eventAction(id, null); });
  }
  evCanvas.addEventListener('click', e => {
    const t = e.target;
    const et = t.closest('[data-et]');
    if (et) {
      evState.tab = et.dataset.et;
      evCanvas.querySelectorAll('[data-et]').forEach(b => b.classList.toggle('on', b === et));
      renderEvents(); return;
    }
    if (t.closest('[data-join]')) {
      if (evState.joined) { toast('이미 참여 중이에요! 🍂'); return; }
      const body = pSheet.open('11월 러닝 이벤트', `
        <img class="ev-detail-img wide" src="${E}banner.jpg" alt="" />
        <p class="ev-detail-desc">참여 기간 <b>11.01 - 11.30</b><br>출석 · 러닝 · 선물 이벤트에 한 번에 참여해요.<br>모든 미션을 완료하면 한정 배지와 포인트를 드려요!</p>
        <button type="button" class="btn-primary ps-btn" data-ok>이벤트 참여하기</button>`);
      body.querySelector('[data-ok]').addEventListener('click', () => { evState.joined = true; pSheet.close(); toast('11월 러닝 이벤트에 참여했어요! 🍂'); });
      return;
    }
    const act = t.closest('[data-act]');
    if (act) { eventAction(act.dataset.act, act.closest('.ev-card')); return; }
    const card = t.closest('.ev-card');
    if (card) openEvent(card.dataset.ev);
  });

  /* =========================================================
     알림
     ========================================================= */
  const NOTI = [
    { id: 'n1', type: 'msg', icon: A + 'av-dog.png', text: '친구 지훈님이 메시지를 보냈어요', time: '방금 전', date: '2026.11.18  09:40', unread: true,
      quote: '오늘 저녁 같이 러닝 어때요?', btn: '메시지 확인하기', friend: '지훈', act: () => openChat('jihoon') },
    { id: 'n2', type: 'comm', icon: A + 'av-group.png', text: '러닝 크루 🔥 커뮤니티에 새 글이 올라왔어요', time: '5분 전', date: '2026.11.18  09:35', unread: true,
      quote: '오늘 한강 10km 완주! 👍', btn: '게시글 보러가기', act: () => { switchTab('f-136-1566'); setTimeout(() => openPost(POSTS.find(p => p.u === '러닝 메이트') || POSTS[0]), 250); } },
    { id: 'n3', type: 'msg', icon: A + 'av-dog2.png', text: '친구 태현님이 메시지를 보냈어요', time: '1시간 전', date: '2026.11.18  08:40', unread: true,
      quote: '이번 주말에 같이 10km 뛰어요!', btn: '메시지 확인하기', friend: '태현', act: () => {
        const id = chatIdFor('태현'), c = chatById(id);
        if (!c.msgs.length) { c.msgs.push(['태현', '안녕하세요! 저 태현이에요 😊', '08:39'], ['태현', '이번 주말에 같이 10km 뛰어요!', '08:40']); c.time = '오전 08:40'; renderMsgList(); }
        openChat(id);
      } },
    { id: 'n4', type: 'comm', icon: A + 'av-heart.png', text: '하트 10개를 받았어요', time: '3시간 전', date: '2026.11.18  06:40',
      quote: '바람처럼님 외 9명이 회원님의 기록에 하트를 보냈어요 💗', btn: '하트 알림 보기', act: () => openChat('heart') },
    { id: 'n5', type: 'sys', icon: A + 'av-flag.png', text: '내가 참여한 챌린지에 새 소식이 있어요', time: '5시간 전', date: '2026.11.18  04:40',
      quote: '11월 러닝 챌린지 · 목표까지 17.6km 남았어요!', btn: '이벤트 보러가기', act: () => switchTab('event') },
    { id: 'n6', type: 'sys', icon: 'notice', text: '시스템 업데이트 안내', time: '1일 전', date: '2026.11.17  10:00',
      quote: 'v1.2 업데이트 · 소통 탭 이벤트, 대화방 기능이 추가됐어요', btn: '확인', notes: true, act: () => back() },
  ];
  const NOTICE_IC = '<svg width="26" height="24" viewBox="0 0 26 24"><path d="M3 9h4l9-6v18l-9-6H3z" fill="#3f6df5"/><path d="M7 15l2 6h3l-2-6" fill="#3f6df5"/><circle cx="21" cy="12" r="1.6" fill="#3f6df5"/></svg>';
  const notiCanvas = document.querySelector('#f-118-4072 .canvas');
  const noti = { tab: 'all', prefs: { msg: true, comm: true, sys: true, sound: true } };
  notiCanvas.insertAdjacentHTML('beforeend', `
    <button type="button" class="hs" data-nset aria-label="알림 설정" style="left:348px;top:66px;width:40px;height:40px"></button>
    <button type="button" class="nt-readall" data-readall>모두 읽음</button>
    <div class="nt-tabs">${[['all', '전체'], ['msg', '메시지'], ['comm', '커뮤니티'], ['sys', '시스템']].map(([k, l]) => `<button type="button" class="${k === 'all' ? 'on' : ''}" data-nt="${k}">${l}</button>`).join('')}</div>
    <div class="nt-list"></div>`);
  const ntList = notiCanvas.querySelector('.nt-list');
  const unreadCount = () => NOTI.filter(n => n.unread).length;
  function paintBell() {
    const n = unreadCount();
    document.querySelectorAll('#appHeader .badge-num, #appHeader img[src*="badge-bell"]').forEach(el => {
      el.classList.toggle('nt-zero', !n);
      if (el.classList.contains('badge-num')) el.textContent = n;
    });
  }
  function renderNoti() {
    const items = NOTI.filter(n => noti.tab === 'all' || n.type === noti.tab);
    ntList.innerHTML = items.map(n => `
      <button type="button" class="nt-row ${n.unread ? 'unread' : ''}" data-noti="${n.id}">
        <span class="nt-ic ${n.icon === 'notice' ? 'notice' : ''}">${n.icon === 'notice' ? NOTICE_IC : `<img src="${n.icon}" alt="" />`}</span>
        <span class="nt-text">${esc(n.text)}</span>
        <span class="nt-time">${n.time}</span><i class="nt-chev"></i>
      </button>`).join('') +
      (items.length ? '' : '<p class="cm-empty">이 분류의 알림이 없어요</p>') +
      `<p class="nt-foot">${unreadCount() ? `읽지 않은 알림 ${unreadCount()}개` : '모든 알림을 읽었습니다'}</p>`;
    notiCanvas.querySelector('.nt-readall').classList.toggle('show', unreadCount() > 0);
    fitCanvas(notiCanvas, ntList, 874);
    paintBell();
  }
  renderNoti();
  notiCanvas.addEventListener('click', e => {
    const t = e.target;
    const tab = t.closest('[data-nt]');
    if (tab) { noti.tab = tab.dataset.nt; notiCanvas.querySelectorAll('[data-nt]').forEach(b => b.classList.toggle('on', b === tab)); renderNoti(); return; }
    if (t.closest('[data-readall]')) { NOTI.forEach(n => { n.unread = false; }); renderNoti(); toast('모든 알림을 읽음 처리했어요'); return; }
    const row = t.closest('[data-noti]');
    if (row) { openNoti(NOTI.find(n => n.id === row.dataset.noti)); return; }
    if (t.closest('[data-nset]')) {
      const P = noti.prefs;
      const body = pSheet.open('알림 설정', [['msg', '메시지 알림', '친구가 보낸 메시지'], ['comm', '커뮤니티 알림', '새 글 · 댓글 · 하트'], ['sys', '시스템 알림', '챌린지 소식 · 업데이트 안내'], ['sound', '알림 소리', '알림이 올 때 소리 내기']]
        .map(([k, l, d]) => `<div class="nt-pref"><div><b>${l}</b><small>${d}</small></div><button type="button" class="nt-sw ${P[k] ? 'on' : ''}" data-pk="${k}" aria-label="${l}"><i></i></button></div>`).join(''));
      body.querySelectorAll('[data-pk]').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.pk; P[k] = !P[k]; b.classList.toggle('on', P[k]);
        toast(`${b.getAttribute('aria-label')}을 ${P[k] ? '켰어요' : '껐어요'}`);
      }));
    }
  });

  // 알림 상세
  const nd = document.querySelector('#notiDetail .nd-canvas');
  let ndCur = null;
  function openNoti(n) {
    ndCur = n;
    n.unread = false; renderNoti();
    const f = n.friend;
    nd.innerHTML = `
      <button type="button" class="nd-back" data-back aria-label="뒤로"><svg width="12" height="22" viewBox="0 0 12 22"><path d="M10.5 1.5 1.5 11l9 9.5" fill="none" stroke="#111" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <p class="nd-title">알림 상세</p>
      <button type="button" class="nd-del" data-del aria-label="알림 삭제"><svg width="24" height="26" viewBox="0 0 24 26"><path d="M3 6h18M9 6V3h6v3M5 6l1.2 17h11.6L19 6M10 11v8M14 11v8" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <img class="nd-hero" src="${A}noti-hero.jpg" alt="" />
      <div class="nd-card">
        <span class="nt-ic ${n.icon === 'notice' ? 'notice' : ''}">${n.icon === 'notice' ? NOTICE_IC : `<img src="${n.icon}" alt="" />`}</span>
        <b class="nd-text">${esc(n.text)}</b>
        <small class="nd-date">${n.date}</small>
        <p class="nd-quote">“ ${esc(n.quote)} ”</p>
        <button type="button" class="btn-primary nd-btn" data-act>${n.btn}</button>
      </div>
      ${f ? `<p class="nd-sec">친구 정보</p>
        <div class="nd-friend"><img src="${f === '지훈' ? A + 'av-jihoon.png' : A + 'av-dog2.png'}" alt="" />
          <b>${f}</b><span class="lv-pill">Lv.${LV[f] || 9}</span>
          <span class="nd-st"><small>함께한 거리</small><em>${f === '지훈' ? '56.3' : '21.4'}km</em><small>최근 기록</small><em>${f === '지훈' ? '5.21' : '4.80'}km</em></span>
          <button type="button" class="nd-prof" data-prof>프로필 보기</button></div>
        <button type="button" class="nd-reply" data-act>답장하기</button>` : ''}
      ${n.notes ? `<div class="doc nd-notes"><h4>이번 업데이트에서 달라진 점</h4><p>· 소통 탭에 이벤트 페이지가 생겼어요<br>· 메시지 대화방에서 사진 · 위치 · 러닝 기록을 보낼 수 있어요<br>· 피드에서 글쓰기, 댓글, 태그 모아보기가 가능해요<br>· 상단 바 위치를 모든 화면에서 똑같이 맞췄어요</p></div>` : ''}`;
    if (!current || current.id !== 'notiDetail') go('notiDetail');
    document.getElementById('notiDetail').scrollTop = 0;
  }
  nd.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-act]')) { ndCur.act(); return; }
    if (t.closest('[data-prof]')) { if (ndCur.friend === '지훈') openPerson('지훈'); else { LV['태현'] = 9; openPerson('태현'); } return; }
    if (t.closest('[data-del]')) {
      NOTI.splice(NOTI.indexOf(ndCur), 1); renderNoti(); back(); toast('알림을 삭제했어요');
    }
  });
  // 예전 그림 알림 상세 화면으로 가던 버튼은 새 상세 화면으로
  const _go2 = go;
  go = function (id, mode) { if (id === 'f-125-4436') { openNoti(NOTI[0]); return; } return _go2(id, mode); };

  /* =========================================================
     온보딩을 마치고 홈에 도착하면 혜성에게서 메시지가 와요 (졸업전시 인사)
     ========================================================= */
  (function thanksMessage() {
    const HS_AV = 'assets/profile-hs.jpg';
    const MSG = '졸업전시 보러 와줘서 고마워';
    const banner = document.createElement('button');
    banner.type = 'button'; banner.className = 'push-banner'; banner.setAttribute('aria-label', '새 메시지 열기');
    banner.innerHTML = `<img class="pb-app" src="assets/app-icon.png" alt="" />
      <span class="pb-top"><b>RUNI</b><small>지금</small></span>
      <span class="pb-who"><img src="${HS_AV}" alt="" />혜성</span>
      <span class="pb-msg">${MSG} 💙</span>`;
    document.getElementById('phone').appendChild(banner);
    let hideTimer = null;
    const hide = () => { banner.classList.remove('show'); clearTimeout(hideTimer); };
    banner.addEventListener('click', () => { hide(); openChat('hyeseong'); });
    // 위로 밀면 닫혀요
    let y0 = null;
    banner.addEventListener('pointerdown', e => { y0 = e.clientY; });
    banner.addEventListener('pointerup', e => { if (y0 !== null && y0 - e.clientY > 20) { e.preventDefault(); hide(); } y0 = null; });

    function arrive() {
      const t = nowTime();
      CHATS.unshift({ id: 'hyeseong', name: '혜성', av: HS_AV, cat: 'run', time: t, unread: 1, date: '오늘',
        msgs: [['혜성', `${MSG} 💙`, t]],
        replies: ['와줘서 정말 고마워 😊', '천천히 둘러보고 가!', '루니 재밌게 봐줘서 고마워 🙏', '응원 고마워! 오늘도 좋은 하루 보내 🏃'] });
      renderMsgList();
      NOTI.unshift({ id: 'n-hs', type: 'msg', icon: HS_AV, text: '혜성님이 메시지를 보냈어요', time: '방금 전', date: '2026.11.18  ' + t, unread: true,
        quote: MSG, btn: '메시지 확인하기', act: () => openChat('hyeseong') });
      renderNoti();
      banner.classList.add('show');
      try { navigator.vibrate && navigator.vibrate(80); } catch (e) {}
      hideTimer = setTimeout(hide, 7000);
    }
    // 온보딩을 마치고 홈 화면에 처음 도착하면 메시지가 와요
    let sent = false;
    const _goHome = go;
    go = function (id, mode) {
      const r = _goHome(id, mode);
      if (id === 'home' && !sent) { sent = true; setTimeout(arrive, 1500); }
      return r;
    };
  })();

  /* =========================================================
     상점 상단 탭: 누르면 해당 구역으로 스크롤
     ========================================================= */
  (function shopTabs() {
    const sec = document.getElementById('f-278-3841');
    const canvas = sec.querySelector('.canvas');
    const TABS = [['interior', '인테리어', 80, 424], ['props', '소품', 200, 1095], ['char', '캐릭터', 320, 1478]];
    const box = document.createElement('div');
    box.className = 'sh-tabs';
    box.innerHTML = TABS.map(([k, l, cx], i) => `
      <button type="button" class="${i ? '' : 'on'}" data-st="${i}" style="left:${cx - 60}px">
        <i><img src="assets/shop/tab-${k}.png" alt="" /><img class="on-ic" src="assets/shop/tab-${k}-on.png" alt="" /></i><span>${l}</span>
      </button>`).join('') + '<b class="sh-bar"></b>';
    canvas.appendChild(box);
    const bar = box.querySelector('.sh-bar');
    const btns = [...box.querySelectorAll('button')];
    let lock = 0;
    function setActive(i) {
      btns.forEach((b, j) => b.classList.toggle('on', j === i));
      bar.style.transform = `translateX(${TABS[i][2] - 80}px)`;
    }
    box.addEventListener('click', e => {
      const b = e.target.closest('[data-st]'); if (!b) return;
      const i = +b.dataset.st;
      setActive(i);
      lock = Date.now() + 900;
      sec.scrollTo({ top: TABS[i][3] - 140, behavior: 'smooth' });
    });
    sec.addEventListener('scroll', () => {
      if (Date.now() < lock) return;
      const y = sec.scrollTop + 160;
      let i = 0;
      TABS.forEach(([, , , top], j) => { if (y >= top) i = j; });
      if (sec.scrollTop + sec.clientHeight >= sec.scrollHeight - 4) i = TABS.length - 1;
      setActive(i);
    });
  })();

  /* ---------- 화면별 표시 (글쓰기 버튼 · 이름 바뀌면 다시 그리기) ---------- */
  const _uc = updateChrome;
  updateChrome = function () {
    _uc();
    fab.classList.toggle('show', !!current && current.id === 'f-136-1566');
    if (current && current.id === 'f-181-3907') paintRank();
    if (current && current.id === 'f-136-1566') renderFeed();
  };
  updateChrome();
})();
