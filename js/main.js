function __boot() {
  'use strict';
  var D = window;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var safeUrl = function (u) { return /^(https?:|mailto:)/i.test(u) ? u : ''; };
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var smoothRange = function (v, a, b) { return smooth((v - a) / (b - a)); };

  /* =====================================================================
     공통 렌더 헬퍼
     ===================================================================== */
  function snsHtml(list) {
    return '<div class="sns">' + (list || []).map(function (s) {
      var label = (D.SNS_LABEL && D.SNS_LABEL[s.type]) || s.type;
      var u = safeUrl(s.url || '');
      return u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(label) + ' &#8599;</a>'
               : '<span class="pending" title="링크 준비중">' + esc(label) + ' · 준비중</span>';
    }).join('') + '</div>';
  }
  function tagsHtml(t) { return '<div class="tags">' + (t || []).map(function (x) { return '<span class="tag">' + esc(x) + '</span>'; }).join('') + '</div>'; }

  /* =====================================================================
     월드: 하나의 큰 일러스트 위를 카메라가 날아다닙니다
     cx,cy  : 카메라가 바라보는 지점 (이미지 0~1)
     k      : 확대(이미지 너비가 화면 너비의 몇 배인지, 0이면 화면을 꽉 채움)
     ax,ay  : 간판이 서는 지점
     side   : 팝업 카드가 뜨는 쪽 (카메라는 반대쪽으로 비켜서 비춥니다)
     ===================================================================== */
  var ASPECT = 6048 / 2592;
  var NODES = [
    { id: 'hero', name: '전경', cx: .50, cy: .50, k: 0 },
    { id: 'palace', name: '장미 궁전', sub: '로즈여왕', cx: .445, cy: .22, k: 2.9, side: 'right', ax: .445, ay: .275, go: 'palace' },
    { id: 'training', name: '부엉이 훈련소', sub: '헌터', cx: .375, cy: .53, k: 3.0, side: 'right', ax: .365, ay: .64, go: 'training' },
    { id: 'village', name: '부엉이 마을', sub: '8마리 크리에이터', cx: .54, cy: .46, k: 2.8, side: 'left', ax: .545, ay: .60, go: 'village' },
    { id: 'theater', name: '왕립 상영관', sub: '작품 상영', cx: .79, cy: .60, k: 2.9, side: 'left', ax: .785, ay: .74, go: 'theater' },
    { id: 'lab', name: '왕립기술연구소', sub: '프로그램 · 스킬', cx: .71, cy: .26, k: 3.0, side: 'left', ax: .71, ay: .39, go: 'lab' },
    { id: 'library', name: '왕립서고', sub: '로즈왕국 연대기', cx: .885, cy: .29, k: 3.0, side: 'left', ax: .885, ay: .46, go: 'library' },
    { id: 'hall', name: '알현실', sub: '의뢰 · 로즈편지', cx: .55, cy: .74, k: 3.0, side: 'right', ax: .515, ay: .80, go: 'hall' }
  ];
  var N = NODES.length;

  var world = $('#world'), sticky = $('#worldSticky'), map = $('#map');
  var imgDay = $('#mapDay'), imgNight = $('#mapNight'), dusk = $('#mapDusk');
  var scrim = $('#heroScrim'), heroEl = $('#heroText'), hint = $('#scrollHint'), pop = $('#pop');
  var vw = 0, vh = 0, coverW = 0, portrait = false;
  var cam = null, target = { cx: 0, cy: 0, lw: 0, sx: .5, sy: .5 };
  var curNode = -1, popNode = -1, popContent = -1;
  var worldRange = 1, worldTop = 0;

  var mobileImg = window.innerWidth <= 820;
  imgDay.src = 'assets/world/' + (mobileImg ? 'day-m.jpg' : 'day.jpg');
  imgDay.addEventListener('load', function () { document.documentElement.classList.add('world-ready'); imgNight.src = 'assets/world/' + (mobileImg ? 'night-m.jpg' : 'night.jpg'); });
  imgDay.addEventListener('error', function () { imgDay.remove(); });
  imgNight.addEventListener('error', function () { imgNight.remove(); });

  /* 간판 */
  var signsEl = $('#signs');
  NODES.forEach(function (n, i) {
    if (!n.ax) return;
    var s = document.createElement('div');
    s.className = 'sign';
    s.innerHTML = '<span class="plate"><b>' + esc(n.name) + '</b><small>' + esc(n.sub) + '</small></span>';
    signsEl.appendChild(s);
    n.signEl = s;
  });

  /* 미니맵 */
  var mmDots = $('#mmDots'), mmView = $('#mmView'), mmLabel = $('#mmLabel');
  NODES.forEach(function (n, i) {
    if (!n.ax) return;
    var b = document.createElement('button');
    b.className = 'mm-dot'; b.type = 'button'; b.title = n.name; b.setAttribute('aria-label', n.name + '으로 이동');
    b.style.left = (n.cx * 100) + '%'; b.style.top = (n.cy * 100) + '%';
    b.addEventListener('click', function () { jumpTo(i); });
    mmDots.appendChild(b); n.dotEl = b;
  });

  /* 지도 패널 */
  var mapBtn = $('#mapBtn'), mapPanel = $('#mapPanel'), mapList = $('#mapList');
  NODES.forEach(function (n, i) {
    var li = document.createElement('li');
    li.innerHTML = '<button type="button">' + esc(n.name) + '</button>';
    li.firstChild.addEventListener('click', function () { jumpTo(i); closeMap(); });
    mapList.appendChild(li); n.mapEl = li.firstChild;
  });
  function closeMap() { mapPanel.hidden = true; mapBtn.setAttribute('aria-expanded', 'false'); }
  mapBtn.addEventListener('click', function () { var o = mapPanel.hidden; mapPanel.hidden = !o; mapBtn.setAttribute('aria-expanded', String(o)); });
  document.addEventListener('click', function (e) { if (!mapPanel.hidden && !mapPanel.contains(e.target) && e.target !== mapBtn) closeMap(); });
  $('.map-list-link').addEventListener('click', closeMap);

  /* 좌표 계산 */
  function measure() {
    vw = window.innerWidth; vh = window.innerHeight; portrait = vw < 720 || vh > vw * 1.1;
    coverW = Math.max(vw, vh * ASPECT);
    map.style.width = coverW + 'px'; map.style.height = (coverW / ASPECT) + 'px';
    var mult = portrait ? 2 : 1;
    NODES.forEach(function (n) {
      n.W = Math.max(coverW, n.k * vw * mult);
      n.lw = Math.log(n.W);
      if (!n.side) { n.sx = portrait ? .5 : .62; n.sy = .5; }
      else if (portrait) { n.sx = .5; n.sy = .32; }
      else { n.sx = n.side === 'right' ? .33 : .67; n.sy = .52; }
    });
    var r = world.getBoundingClientRect();
    worldTop = r.top + window.scrollY;
    worldRange = Math.max(1, world.offsetHeight - vh);
  }

  function progress() { return clamp((window.scrollY - worldTop) / worldRange, 0, 1); }

  function computeTarget(f) {
    var i = clamp(Math.floor(f), 0, N - 2), t = f - i;
    var te = smooth((t - .2) / .6);
    var a = NODES[i], b = NODES[i + 1];
    target.cx = lerp(a.cx, b.cx, te);
    target.cy = lerp(a.cy, b.cy, te);
    var lw = lerp(a.lw, b.lw, te);
    if (!reduced) lw -= .3 * Math.sin(Math.PI * te); // 이동 중에는 살짝 떠올랐다 내려앉습니다
    target.lw = Math.max(lw, Math.log(coverW));
    target.sx = lerp(a.sx, b.sx, te);
    target.sy = lerp(a.sy, b.sy, te);
  }

  /* 팝업 카드 내용 */
  function popHtml(n) {
    var q = D.QUEEN, h = D.HUNTER, go = function (id, label) { return '<a class="btn" href="#' + id + '" data-go>' + label + ' &darr;</a>'; };
    var head = function (p, no) {
      return '<div class="pop-head"><img class="avatar" src="' + esc(p.avatar) + '" alt="' + esc(p.name) + '"><div><p class="no">' + no + '</p><h3>' + esc(p.title) + '</h3></div></div>' +
        '<p class="quote">&ldquo;' + esc(p.quote) + '&rdquo;</p>' + tagsHtml(p.tags) + snsHtml(p.sns) +
        '<div class="pop-actions"><button class="btn" type="button" data-sheet="' + p.id + '">캐릭터시트</button>' + go(n.go, '자세히') + '</div>';
    };
    switch (n.id) {
      case 'palace': return head(q, 'QUEEN');
      case 'training': return head(h, 'HANDLER');
      case 'village':
        return '<p class="no">OWL VILLAGE</p><h3>부엉이 마을</h3><p class="t">저마다 한 분야의 대가인 여덟 마리 크리에이터. 얼굴을 눌러 소개와 채널을 확인하세요.</p>' +
          '<div class="owl-chips">' + D.OWLS.map(function (o) { return '<button class="owl-chip" type="button" data-owl="' + o.id + '" style="--ac:' + o.accent + '"><img src="' + esc(o.avatar) + '" alt="' + esc(o.name) + '"><span>' + esc(o.name.replace(' 부엉이', '')) + '</span></button>'; }).join('') + '</div>' +
          '<div class="pop-actions">' + go(n.go, '마을 전체 보기') + '</div>';
      case 'theater':
        return '<p class="no">ROYAL THEATER</p><h3>왕립 상영관</h3><p class="t">프로덕션이 만든 영상을 상영합니다.</p><ul class="mini-list">' +
          D.SCREENINGS.slice(0, 4).map(function (f) { return '<li><b>' + esc(f.title) + '</b><small>' + esc(f.tag) + '</small></li>'; }).join('') + '</ul>' +
          '<div class="pop-actions">' + go(n.go, '상영관 가기') + '</div>';
      case 'lab':
        return '<p class="no">ROYAL INSTITUTE</p><h3>왕립기술연구소</h3><p class="t">프로덕션이 만든 프로그램과 공개 스킬을 기록하고 나눕니다.</p><ul class="mini-list">' +
          D.LAB.slice(0, 4).map(function (x) { return '<li><b>' + esc(x.title) + '</b><small>' + esc(x.ver) + '</small></li>'; }).join('') + '</ul>' +
          '<div class="pop-actions">' + go(n.go, '연구소 전체 보기') + '</div>';
      case 'library':
        return '<p class="no">ROYAL LIBRARY</p><h3>왕립서고</h3><p class="t">' + esc(D.LIBRARY.intro) + '</p><ul class="mini-list">' +
          D.LIBRARY.chapters.slice(0, 4).map(function (c) { return '<li><b>' + esc(c.title) + '</b><small>' + esc(c.era.split('·')[0].trim()) + '</small></li>'; }).join('') + '</ul>' +
          '<div class="pop-actions">' + go(n.go, '서고 열기') + '</div>';
      case 'hall':
        return '<p class="no">AUDIENCE HALL</p><h3>알현실</h3><p class="t">영상 제작을 맡기거나, 왕국의 소식을 편지로 받아 보세요.</p>' +
          '<div class="pop-actions">' + go('commissionForm', '의뢰하기') + go('letterPanel', '로즈편지 구독') + '</div>';
    }
    return '';
  }
  pop.addEventListener('click', function (e) {
    var sh = e.target.closest('[data-sheet]'), ow = e.target.closest('[data-owl]');
    if (sh) openProfile(sh.dataset.sheet === 'rose' ? D.QUEEN : D.HUNTER);
    if (ow) openProfile(D.OWLS.filter(function (o) { return o.id === ow.dataset.owl; })[0]);
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-go]');
    if (!a) return;
    e.preventDefault();
    var t = $(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  });
  $$('a[href="#catalog"], a[href="#world"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault(); stopTour();
      var t = $(a.getAttribute('href')); if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });

  function setNode(i) {
    if (i === curNode) return;
    curNode = i;
    var n = NODES[i];
    $('#coords').textContent = '로즈왕국 · ' + n.name;
    mmLabel.textContent = n.name;
    NODES.forEach(function (m, k) {
      if (m.signEl) m.signEl.classList.toggle('on', k === i);
      if (m.dotEl) m.dotEl.classList.toggle('on', k === i);
      if (m.mapEl) m.mapEl.classList.toggle('cur', k === i);
    });
  }

  function showPop(want) {
    if (want === popNode) return;
    popNode = want;
    pop.classList.remove('show');
    if (want < 1) return;
    var n = NODES[want];
    if (popContent !== want) { pop.innerHTML = popHtml(n); popContent = want; }
    pop.classList.toggle('left', n.side === 'left'); pop.classList.toggle('right', n.side === 'right');
    requestAnimationFrame(function () { if (popNode === want) pop.classList.add('show'); });
  }

  /* 프레임 갱신 */
  var last = performance.now(), visible = true;
  function frame(now) {
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    var r = world.getBoundingClientRect();
    visible = r.bottom > -100 && r.top < vh + 100;
    if (visible) {
      var p = progress(), f = p * (N - 1);
      computeTarget(f);
      if (!cam) cam = { cx: target.cx, cy: target.cy, lw: target.lw, sx: target.sx, sy: target.sy };
      var k = reduced ? 1 : 1 - Math.exp(-dt * 5.5);
      cam.cx += (target.cx - cam.cx) * k; cam.cy += (target.cy - cam.cy) * k; cam.lw += (target.lw - cam.lw) * k;
      cam.sx += (target.sx - cam.sx) * k; cam.sy += (target.sy - cam.sy) * k;

      var W = Math.exp(cam.lw), H = W / ASPECT, s = W / coverW;
      var tx = clamp(cam.sx * vw - cam.cx * W, vw - W, 0), ty = clamp(cam.sy * vh - cam.cy * H, vh - H, 0);
      map.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';

      /* 낮 → 노을 → 밤 */
      imgNight.style.opacity = smoothRange(f, 4.15, 4.95).toFixed(3);
      dusk.style.opacity = (Math.sin(Math.PI * clamp((f - 3.5) / 1.8, 0, 1)) * .9).toFixed(3);

      /* 히어로 문구 */
      var hf = smoothRange(f, 0, .38);
      heroEl.style.opacity = (1 - hf).toFixed(3);
      heroEl.style.filter = hf > .01 ? 'blur(' + (hf * 12).toFixed(1) + 'px)' : 'none';
      heroEl.style.transform = 'translateY(calc(-52% - ' + (hf * 70).toFixed(0) + 'px))';
      heroEl.style.visibility = hf >= .99 ? 'hidden' : 'visible';
      scrim.style.opacity = (1 - hf).toFixed(3);
      hint.style.opacity = f < .08 ? 1 : 0;

      /* 간판 */
      var sf = smoothRange(f, .15, .7), sc = clamp(Math.sqrt(W / (vw * 3.2)), .62, 1.05);
      NODES.forEach(function (n) {
        if (!n.signEl) return;
        var x = tx + n.ax * W, y = ty + n.ay * H, off = x < -160 || x > vw + 160 || y < -40 || y > vh + 220;
        n.signEl.style.opacity = off ? 0 : sf.toFixed(2);
        if (!off) n.signEl.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) translate(-50%,-100%) scale(' + sc.toFixed(3) + ')';
      });

      /* 미니맵 시야 */
      mmView.style.left = (clamp(-tx / W, 0, 1) * 100).toFixed(2) + '%'; mmView.style.top = (clamp(-ty / H, 0, 1) * 100).toFixed(2) + '%';
      mmView.style.width = (Math.min(1, vw / W) * 100).toFixed(2) + '%'; mmView.style.height = (Math.min(1, vh / H) * 100).toFixed(2) + '%';

      /* 현재 지점 / 팝업 */
      var a = Math.round(f), d = Math.abs(f - a);
      setNode(a);
      showPop(d < .17 && a > 0 ? a : -1);
    } else if (popNode !== -1) { showPop(-1); }

    if (touring) tourStep(dt);
    requestAnimationFrame(frame);
  }

  function jumpTo(i) {
    stopTour();
    var y = worldTop + (i / (N - 1)) * worldRange;
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  }

  /* 자동으로 둘러보기 */
  var touring = false, tourBtn = $('#tourBtn'), tourY = 0;
  function startTour() {
    if (progress() >= .995 || window.scrollY < worldTop - 10 || window.scrollY > worldTop + worldRange) { window.scrollTo(0, worldTop); }
    touring = true; tourY = window.scrollY;
    tourBtn.setAttribute('aria-pressed', 'true'); tourBtn.innerHTML = '&#10074;&#10074; 둘러보기 멈춤';
  }
  function stopTour() {
    if (!touring) return;
    touring = false; tourBtn.setAttribute('aria-pressed', 'false'); tourBtn.innerHTML = '&#9654; 자동으로 둘러보기';
  }
  function tourStep(dt) {
    var f = progress() * (N - 1), d = Math.abs(f - Math.round(f));
    var perSeg = worldRange / (N - 1), speed = perSeg / 5.2 * (.12 + .88 * smoothRange(d, .02, .3));
    tourY = Math.max(tourY, window.scrollY - 2) + speed * dt;
    window.scrollTo(0, tourY);
    if (progress() >= .999) stopTour();
  }
  tourBtn.addEventListener('click', function () { touring ? stopTour() : startTour(); });
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, stopTour, { passive: true }); });

  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  setNode(0);
  requestAnimationFrame(frame);

  /* =====================================================================
     카탈로그 (월드 아래 상세 목록)
     ===================================================================== */
  function profileCard(p, root) {
    root.innerHTML =
      '<img class="avatar" src="' + esc(p.avatar) + '" alt="' + esc(p.name) + '">' +
      '<div><h3>' + esc(p.title) + '</h3><p class="en">' + esc(p.en) + '</p>' +
      '<p class="quote">&ldquo;' + esc(p.quote) + '&rdquo;</p>' +
      '<p class="desc">' + esc(p.desc) + '</p>' + tagsHtml(p.tags) + snsHtml(p.sns) +
      '<button class="link-sheet" type="button">캐릭터시트 보기</button></div>';
    root.querySelector('.link-sheet').addEventListener('click', function () { openProfile(p); });
  }
  profileCard(D.QUEEN, $('#queenCard'));
  profileCard(D.HUNTER, $('#hunterCard'));

  var grid = $('#owlGrid');
  D.OWLS.forEach(function (o) {
    var c = document.createElement('article');
    c.className = 'owl-card'; c.tabIndex = 0; c.style.setProperty('--ac', o.accent);
    c.setAttribute('role', 'button'); c.setAttribute('aria-label', o.name + ' 소개 열기');
    c.innerHTML = '<span class="owl-no">#' + o.no + '</span>' +
      '<img class="avatar" src="' + esc(o.avatar) + '" alt="' + esc(o.name) + '" loading="lazy">' +
      '<h3>' + esc(o.name) + '</h3><p class="en">' + esc(o.en) + '</p>' +
      '<p class="tagline">' + esc(o.tagline) + '</p>' + tagsHtml(o.tags) + snsHtml(o.sns);
    c.addEventListener('click', function (e) { if (e.target.closest('a')) return; openProfile(o); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProfile(o); } });
    grid.appendChild(c);
  });

  var sg = $('#screenGrid');
  if (!D.SCREENINGS.length) sg.innerHTML = '<p class="empty">곧 개봉 예정입니다.</p>';
  D.SCREENINGS.forEach(function (f) {
    var b = document.createElement('button');
    b.className = 'film'; b.type = 'button';
    var thumb = f.thumb ? '<img src="' + esc(f.thumb) + '" alt="" loading="lazy">' :
      (f.youtube ? '<img src="https://i.ytimg.com/vi/' + esc(f.youtube) + '/hqdefault.jpg" alt="" loading="lazy">' : '');
    b.innerHTML = '<div class="poster">' + thumb + (f.youtube ? '' : '<span class="soon">상영 준비중</span>') + '<span class="play">&#9654;</span></div>' +
      '<div class="meta"><small>' + esc(f.tag) + ' · ' + esc(f.year) + '</small><h3>' + esc(f.title) + '</h3><p>' + esc(f.owl) + ' — ' + esc(f.desc) + '</p></div>';
    b.addEventListener('click', function () { openVideo(f); });
    sg.appendChild(b);
  });

  var TYPES = { all: '전체', program: '프로그램', skill: '공개 스킬', workflow: '워크플로우', template: '템플릿' };
  var STATUS = { public: '공개', beta: '베타', wip: '제작중' };
  var chips = $('#labChips'), labGrid = $('#labGrid'), labFilter = 'all';
  Object.keys(TYPES).forEach(function (k) {
    var b = document.createElement('button');
    b.className = 'chip' + (k === 'all' ? ' on' : ''); b.type = 'button'; b.textContent = TYPES[k];
    b.addEventListener('click', function () {
      labFilter = k; $$('.chip', chips).forEach(function (c) { c.classList.toggle('on', c === b); }); renderLab();
    });
    chips.appendChild(b);
  });
  function renderLab() {
    var items = D.LAB.filter(function (x) { return labFilter === 'all' || x.type === labFilter; });
    labGrid.innerHTML = items.length ? items.map(function (x) {
      var links = (x.links || []).map(function (l) {
        var u = safeUrl(l.url || '');
        return u ? '<a class="btn" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(l.label) + ' &#8599;</a>' : '<span class="btn pending">' + esc(l.label) + '</span>';
      }).join('');
      return '<article class="lab-card"><div class="top"><span class="badge type">' + esc(TYPES[x.type] || x.type) + '</span>' +
        '<span class="badge ' + esc(x.status) + '">' + esc(STATUS[x.status] || x.status) + '</span><span class="ver">' + esc(x.ver) + ' · ' + esc(x.date) + '</span></div>' +
        '<h3>' + esc(x.title) + '</h3><p>' + esc(x.desc) + '</p>' + tagsHtml(x.tags) + '<div class="links">' + links + '</div></article>';
    }).join('') : '<p class="empty">아직 이 분류의 기록이 없습니다.</p>';
  }
  renderLab();

  $('#libIntro').textContent = D.LIBRARY.intro;
  $('#timeline').innerHTML = D.LIBRARY.chapters.map(function (c) {
    return '<li><p class="era">' + esc(c.era) + '</p><h3>' + esc(c.title) + '</h3><p>' + esc(c.text) + '</p></li>';
  }).join('');

  var ll = $('#letterList');
  D.LETTERS.slice().sort(function (a, b) { return b.no - a.no; }).forEach(function (l) {
    var li = document.createElement('li');
    li.innerHTML = '<button type="button"><span class="d">No.' + l.no + ' · ' + esc(l.date) + '</span><br><span class="t">' + esc(l.title) + '</span></button><p class="b">' + esc(l.body) + '</p>';
    li.querySelector('button').addEventListener('click', function () { li.classList.toggle('open'); });
    ll.appendChild(li);
  });

  /* ---------- 모달 ---------- */
  var modal = $('#modal'), body = $('#modalBody'), lastFocus = null;
  function openModal(html, cls) {
    lastFocus = document.activeElement;
    body.innerHTML = html; modal.className = 'modal ' + (cls || ''); modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.modal-x', modal).focus();
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true; body.innerHTML = ''; document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  modal.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); closeMap(); } });

  function openProfile(p) {
    openModal('<img class="modal-sheet" src="' + esc(p.sheet) + '" alt="' + esc(p.name) + ' 캐릭터시트">' +
      '<div class="modal-info"><h3>' + esc(p.name) + '</h3><p class="en">' + esc(p.en) + '</p>' +
      '<p class="quote">&ldquo;' + esc(p.tagline || p.quote) + '&rdquo;</p><p>' + esc(p.desc) + '</p>' + tagsHtml(p.tags) + snsHtml(p.sns) + '</div>');
  }
  function openVideo(f) {
    if (f.youtube && /^[\w-]{6,20}$/.test(f.youtube)) {
      openModal('<iframe class="modal-video" src="https://www.youtube-nocookie.com/embed/' + f.youtube + '?autoplay=1&rel=0" title="' + esc(f.title) + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>' +
        '<h3 style="font-family:var(--serif);margin-top:14px">' + esc(f.title) + '</h3><p style="opacity:.8">' + esc(f.owl) + '</p>', 'video');
    } else {
      openModal('<div style="text-align:center;padding:50px 10px"><p style="font-size:3rem">&#127916;</p><h3 style="font-family:var(--serif);font-size:1.5rem;color:var(--rose)">상영 준비중입니다</h3><p style="margin-top:8px">&lsquo;' + esc(f.title) + '&rsquo; 은(는) 곧 개봉합니다.</p></div>');
    }
  }

  /* ---------- 폼 ---------- */
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  /* 서버(/api)로 보냅니다. 서버가 없거나 DB 가 연결되지 않았으면(로컬 확인 등) 예전 방식으로 대신합니다. */
  function postJson(url, data) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, body: j }; }); })
      .catch(function () { return { status: 0, body: {} }; });
  }
  function serverDown(res) { return res.status === 0 || res.status === 404 || res.status === 503 || res.status === 405; }

  $('#commissionForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, note = $('#commissionNote'), btn = $('button[type=submit]', f), v = function (n) { return f.elements[n].value.trim(); };
    if (!v('name') || !emailRe.test(v('email')) || !v('msg')) { note.textContent = '성함, 올바른 이메일, 의뢰 내용을 입력해 주세요.'; return; }
    btn.disabled = true; note.textContent = '보내는 중…';
    postJson('/api/inquiries', { name: v('name'), email: v('email'), kind: v('kind'), budget: v('budget'), msg: v('msg'), website: v('website') }).then(function (res) {
      btn.disabled = false;
      if (res.status === 200) { note.textContent = '의뢰서가 접수되었습니다. 헌터가 확인하고 회신드릴게요!'; f.reset(); return; }
      if (!serverDown(res)) { note.textContent = res.body.error || '접수에 실패했어요. 잠시 후 다시 시도해 주세요.'; return; }
      var text = '[부엉프로덕션 의뢰]\n성함/팀: ' + v('name') + '\n이메일: ' + v('email') + '\n종류: ' + v('kind') + '\n예산·일정: ' + (v('budget') || '-') + '\n\n' + v('msg');
      var to = D.CONFIG.contactEmail;
      if (to) {
        location.href = 'mailto:' + encodeURIComponent(to) + '?subject=' + encodeURIComponent('[의뢰] ' + v('kind') + ' - ' + v('name')) + '&body=' + encodeURIComponent(text);
        note.textContent = '메일 앱이 열립니다. 전송을 눌러 주세요.';
      } else {
        try { navigator.clipboard.writeText(text); } catch (err) {}
        note.textContent = '의뢰 접수가 아직 연결되지 않았습니다. 내용은 복사해 두었어요.';
      }
    });
  });
  $('#letterForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, note = $('#letterNote'), btn = $('button[type=submit]', f), mail = f.elements.email.value.trim();
    if (!emailRe.test(mail)) { note.textContent = '올바른 이메일 주소를 입력해 주세요.'; return; }
    btn.disabled = true; note.textContent = '신청 중…';
    postJson('/api/subscribe', { email: mail, website: f.elements.website.value }).then(function (res) {
      btn.disabled = false;
      if (res.status === 200) { note.textContent = res.body.already ? '이미 구독 중인 이메일이에요. 편지를 기다려 주세요!' : '구독 신청이 접수되었습니다. 장미 향 가득한 편지로 만나요!'; f.reset(); return; }
      if (!serverDown(res)) { note.textContent = res.body.error || '구독 신청에 실패했어요. 잠시 후 다시 시도해 주세요.'; return; }
      try { var k = 'rose-letter-subs', a = JSON.parse(localStorage.getItem(k) || '[]'); if (a.indexOf(mail) < 0) a.push(mail); localStorage.setItem(k, JSON.stringify(a)); } catch (err) {}
      note.textContent = '구독 신청을 받았습니다. (구독 서비스 연결 전이라 이 브라우저에만 저장돼요)'; f.reset();
    });
  });

  /* ---------- 장미 꽃잎 ---------- */
  (function petals() {
    if (reduced) return;
    var cv = $('#petals'), cx = cv.getContext('2d'), W = 0, H = 0, P = [], dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() { W = sticky.clientWidth; H = sticky.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    var cols = ['#c9405a', '#e58aa0', '#a3203a', '#f4b6c2'];
    var n = W < 720 ? 16 : 30;
    function mk(init) { return { x: Math.random() * W, y: init ? Math.random() * H : -20, r: 5 + Math.random() * 8, s: .5 + Math.random() * 1.1, w: Math.random() * 6, ws: .008 + Math.random() * .015, a: Math.random() * 6, as: (Math.random() - .5) * .04, c: cols[(Math.random() * cols.length) | 0], o: .5 + Math.random() * .4 }; }
    for (var i = 0; i < n; i++) P.push(mk(true));
    function loop() {
      if (visible && !document.hidden) {
        cx.clearRect(0, 0, W, H);
        P.forEach(function (p, i) {
          p.y += p.s; p.w += p.ws; p.x += Math.sin(p.w) * .8; p.a += p.as;
          if (p.y > H + 20) P[i] = mk(false);
          cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.globalAlpha = p.o; cx.fillStyle = p.c;
          cx.beginPath(); cx.ellipse(0, 0, p.r, p.r * .55, 0, 0, Math.PI * 2); cx.fill(); cx.restore();
        });
      }
      requestAnimationFrame(loop);
    }
    loop();
  })();
}
/* 어드민에서 고친 내용(js/content.js)을 먼저 받아 온 뒤 화면을 그립니다 */
(window.CONTENT_READY || Promise.resolve()).then(__boot);
