(function () {
  'use strict';
  var D = window;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  var SNS_TYPES = { youtube: 'YouTube', instagram: 'Instagram', tiktok: 'TikTok', x: 'X', threads: 'Threads', blog: 'Blog' };
  var LAB_TYPES = { program: '프로그램', skill: '공개 스킬', workflow: '워크플로우', template: '템플릿' };
  var LAB_STATUS = { public: '공개', beta: '베타', wip: '제작중' };

  var state = { defs: [], content: {}, tab: 'inbox', kind: 'commission', dirty: false };

  /* ---------- 공통 ---------- */
  function api(path, opts) {
    opts = opts || {};
    var h = { Accept: 'application/json' };
    if (opts.body) h['Content-Type'] = 'application/json';
    if (opts.method && opts.method !== 'GET') h['X-Admin-Request'] = '1';
    return fetch(path, { method: opts.method || 'GET', headers: h, credentials: 'same-origin', body: opts.body ? JSON.stringify(opts.body) : undefined })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (r.status === 401 && path.indexOf('/login') < 0) showLogin();
          return { ok: r.ok, status: r.status, body: j };
        });
      })
      .catch(function () { return { ok: false, status: 0, body: { error: '네트워크 오류입니다. 연결을 확인해 주세요.' } }; });
  }
  var toastT;
  function toast(msg, err) {
    var t = $('#toast'); t.textContent = msg; t.className = 'toast show' + (err ? ' err' : '');
    clearTimeout(toastT); toastT = setTimeout(function () { t.className = 'toast'; }, 2800);
  }
  window.addEventListener('beforeunload', function (e) { if (state.dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- 기본값(data.js) ---------- */
  function defaultFor(key) {
    if (key.indexOf('sns.') === 0) {
      var id = key.slice(4), p = id === 'rose' ? D.QUEEN : id === 'hunter' ? D.HUNTER : (D.OWLS || []).filter(function (o) { return o.id === id; })[0];
      return clone((p && p.sns) || []);
    }
    return clone({ screenings: D.SCREENINGS, lab: D.LAB, letters: D.LETTERS }[key] || []);
  }
  function current(key) {
    var c = state.content[key];
    return c ? { value: clone(c.value), saved: true } : { value: defaultFor(key), saved: false };
  }

  /* ---------- 로그인 ---------- */
  function showLogin() { $('#appView').hidden = true; $('#loginView').hidden = false; $('#passcode').focus(); }
  function showApp() { $('#loginView').hidden = true; $('#appView').hidden = false; }

  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var note = $('#loginNote'), btn = $('button[type=submit]', e.target);
    btn.disabled = true; note.textContent = '';
    api('/api/admin/login', { method: 'POST', body: { passcode: $('#passcode').value } }).then(function (r) {
      btn.disabled = false;
      if (r.ok) { $('#passcode').value = ''; start(); } else note.textContent = r.body.error || '로그인하지 못했습니다.';
    });
  });
  $('#logoutBtn').addEventListener('click', function () {
    if (state.dirty && !confirm('저장하지 않은 변경이 있습니다. 로그아웃할까요?')) return;
    state.dirty = false;
    api('/api/admin/logout', { method: 'POST', body: {} }).then(function () { showLogin(); });
  });

  /* ---------- 시작 ---------- */
  function start() {
    api('/api/admin/me').then(function (m) {
      var b = m.body || {};
      if (!b.loggedIn) { showLogin(); if (b.envReady === false) $('#loginNote').textContent = '서버에 어드민 비밀번호 환경변수가 설정되지 않았습니다.'; return; }
      showApp();
      var banner = $('#banner');
      if (b.db === false) { banner.hidden = false; banner.className = 'banner err'; banner.textContent = 'DB 가 연결되지 않아 저장하거나 접수함을 볼 수 없습니다. (Supabase 연결을 확인하세요)'; }
      else banner.hidden = true;
      api('/api/admin/content').then(function (r) {
        if (r.ok) { state.defs = r.body.defs; state.content = r.body.content; }
        render();
        refreshNewCount();
      });
    });
  }

  function refreshNewCount() {
    api('/api/admin/inquiries?kind=commission').then(function (r) {
      var n = r.ok ? (r.body.items || []).filter(function (i) { return i.status === 'new'; }).length : 0, el = $('#newCount');
      el.hidden = !n; el.textContent = n;
    });
  }

  $('#tabs').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-tab]'); if (!b) return;
    if (state.dirty && !confirm('저장하지 않은 변경이 있습니다. 이동할까요? (변경은 사라집니다)')) return;
    state.dirty = false; state.tab = b.dataset.tab;
    $$('#tabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
    render();
  });

  function render() {
    var p = $('#panel'); p.innerHTML = '';
    if (state.tab === 'inbox') renderInbox(p);
    else if (state.tab === 'sns') renderSns(p);
    else renderList(p, state.tab);
  }

  /* ---------- 접수함 ---------- */
  var STATUS = { 'new': '새로 옴', checked: '확인', done: '완료' };
  function fmtDate(s) { var d = new Date(s); return isNaN(d) ? '' : d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }

  function renderInbox(p) {
    p.innerHTML = '<div class="sub-tabs"><button class="pill" data-k="commission">의뢰서</button><button class="pill" data-k="newsletter">로즈편지 구독자</button><span class="state" id="inboxState"></span></div><div id="inboxList"><p class="empty">불러오는 중…</p></div>';
    $$('.pill', p).forEach(function (b) {
      b.classList.toggle('on', b.dataset.k === state.kind);
      b.addEventListener('click', function () { state.kind = b.dataset.k; renderInbox(p); });
    });
    api('/api/admin/inquiries?kind=' + state.kind).then(function (r) {
      var box = $('#inboxList');
      if (!r.ok) { box.innerHTML = '<p class="empty">' + esc(r.body.error || '불러오지 못했습니다.') + '</p>'; return; }
      var items = r.body.items || [];
      if (!items.length) { box.innerHTML = '<p class="empty">' + (state.kind === 'commission' ? '아직 접수된 의뢰서가 없습니다.' : '아직 구독자가 없습니다.') + '</p>'; return; }
      if (state.kind === 'newsletter') return renderSubscribers(box, items);
      box.innerHTML = '';
      items.forEach(function (it) {
        var x = it.extra || {}, c = document.createElement('article');
        c.className = 'card inq ' + it.status;
        c.innerHTML = '<div class="row between"><div><h3>' + esc(it.name) + ' <span class="badge ' + (it.status === 'new' ? 'new' : '') + '">' + esc(STATUS[it.status]) + '</span></h3>' +
          '<p class="meta">' + esc(fmtDate(it.created_at)) + ' · <a href="mailto:' + esc(it.contact) + '">' + esc(it.contact) + '</a></p></div>' +
          '<select aria-label="상태">' + Object.keys(STATUS).map(function (k) { return '<option value="' + k + '"' + (k === it.status ? ' selected' : '') + '>' + STATUS[k] + '</option>'; }).join('') + '</select></div>' +
          '<p class="meta" style="margin-top:6px">' + esc(x.work || '') + (x.budget ? ' · 예산/일정: ' + esc(x.budget) : '') + '</p><p class="msg">' + esc(it.message || '') + '</p>';
        $('select', c).addEventListener('change', function (e) {
          var v = e.target.value;
          api('/api/admin/inquiries', { method: 'PATCH', body: { id: it.id, status: v } }).then(function (r2) {
            if (r2.ok) { it.status = v; c.className = 'card inq ' + v; $('.badge', c).textContent = STATUS[v]; $('.badge', c).className = 'badge ' + (v === 'new' ? 'new' : ''); toast('상태를 바꿨습니다.'); refreshNewCount(); }
            else { toast(r2.body.error || '바꾸지 못했습니다.', true); e.target.value = it.status; }
          });
        });
        box.appendChild(c);
      });
    });
  }

  function renderSubscribers(box, items) {
    box.innerHTML = '<div class="card"><div class="row between"><h3>구독자 ' + items.length + '명</h3><button class="btn sm" id="csvBtn" type="button">CSV 내려받기</button></div>' +
      '<table class="sub-table"><thead><tr><th>이메일</th><th>신청일</th></tr></thead><tbody>' +
      items.map(function (i) { return '<tr><td>' + esc(i.contact) + '</td><td>' + esc(fmtDate(i.created_at)) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    $('#csvBtn', box).addEventListener('click', function () {
      var csv = '﻿이메일,신청일\n' + items.map(function (i) { return '"' + String(i.contact).replace(/"/g, '""') + '","' + fmtDate(i.created_at) + '"'; }).join('\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      a.download = 'rose-letter-subscribers.csv'; document.body.appendChild(a); a.click(); a.remove();
    });
  }

  /* ---------- 저장 공통 ---------- */
  function saveBar(key, getItems, setItems) {
    var bar = document.createElement('div'); bar.className = 'save-bar';
    bar.innerHTML = '<button class="btn primary" type="button">저장</button><span class="state"></span>';
    var btn = $('button', bar), st = $('.state', bar);
    btn.addEventListener('click', function () {
      btn.disabled = true; st.className = 'state'; st.textContent = '저장 중…';
      api('/api/admin/content', { method: 'PUT', body: { key: key, value: getItems() } }).then(function (r) {
        btn.disabled = false;
        if (r.ok) { state.content[key] = { value: r.body.value }; state.dirty = false; setItems(r.body.value); st.className = 'state ok'; st.textContent = '저장했습니다'; toast('저장했습니다. 사이트에는 곧 반영됩니다.'); }
        else { st.className = 'state err'; st.textContent = r.body.error || '저장하지 못했습니다.'; toast(r.body.error || '저장하지 못했습니다.', true); }
      });
    });
    bar._mark = function () { st.className = 'state'; st.textContent = '저장하지 않은 변경이 있습니다'; state.dirty = true; };
    return bar;
  }

  /* ---------- SNS ---------- */
  function renderSns(p) {
    var defs = state.defs.filter(function (d) { return d.group === 'sns'; }).sort(function (a, b) { return a.sort - b.sort; });
    if (!defs.length) { p.innerHTML = '<p class="empty">항목을 불러오지 못했습니다.</p>'; return; }
    p.innerHTML = '<p class="state" style="margin-bottom:12px">캐릭터마다 채널 링크를 추가·수정·삭제할 수 있습니다. 주소는 https:// 로 시작해야 합니다.</p>';
    defs.forEach(function (d) {
      var cur = current(d.key), items = cur.value, card = document.createElement('section'); card.className = 'card';
      var bar = saveBar(d.key, function () { return items; }, function (v) { items = v; draw(); });
      function draw() {
        card.innerHTML = '<div class="row between"><h3>' + esc(d.label.replace(' · SNS 링크', '')) + (cur.saved ? '' : '<span class="default-tag">기본값</span>') + '</h3><button class="btn sm" data-add type="button">+ 링크 추가</button></div><div data-rows></div>';
        var rows = $('[data-rows]', card);
        items.forEach(function (it, i) {
          var r = document.createElement('div'); r.className = 'sns-row';
          r.innerHTML = '<select aria-label="채널">' + Object.keys(SNS_TYPES).map(function (k) { return '<option value="' + k + '"' + (k === it.type ? ' selected' : '') + '>' + SNS_TYPES[k] + '</option>'; }).join('') + '</select>' +
            '<input type="url" placeholder="https://" value="' + esc(it.url) + '" aria-label="주소"><button class="btn sm danger" type="button">삭제</button>';
          $('select', r).addEventListener('change', function (e) { it.type = e.target.value; bar._mark(); });
          $('input', r).addEventListener('input', function (e) { it.url = e.target.value; bar._mark(); });
          $('button', r).addEventListener('click', function () { items.splice(i, 1); bar._mark(); draw(); });
          rows.appendChild(r);
        });
        if (!items.length) rows.innerHTML = '<p class="state" style="margin-top:8px">링크가 없습니다. 사이트에는 SNS 버튼이 나오지 않습니다.</p>';
        $('[data-add]', card).addEventListener('click', function () { if (items.length >= 8) return toast('링크는 최대 8개입니다.', true); items.push({ type: 'instagram', url: '' }); bar._mark(); draw(); });
        card.appendChild(bar);
      }
      draw(); p.appendChild(card);
    });
  }

  /* ---------- 목록형(상영관·연구소·로즈편지) ---------- */
  function linkField(i, part) {
    return { n: 'link' + i + part, l: (i === 0 ? '링크 ' : '링크 2 ') + (part === 'label' ? '이름 (예: 다운로드)' : '주소 (https://)'),
      get: function (it) { return ((it.links || [])[i] || {})[part] || ''; },
      set: function (it, v) { it.links = it.links || []; while (it.links.length <= i) it.links.push({ label: '', url: '' }); it.links[i][part] = v; } };
  }
  var SPECS = {
    screenings: {
      title: '왕립 상영관 · 영상 목록', add: '+ 영상 추가', head: function (it) { return it.title || '(새 영상)'; },
      blank: function () { return { title: '', owl: '', tag: '', year: String(new Date().getFullYear()), youtube: '', thumb: '', desc: '' }; },
      help: '유튜브 영상 주소를 그대로 붙여 넣으면 됩니다. (일부공개 영상도 가능)',
      fields: [
        { n: 'title', l: '제목', wide: true }, { n: 'owl', l: '만든 사람 (예: 액션대가 부엉이)' }, { n: 'tag', l: '분류 (예: 액션)' },
        { n: 'youtube', l: '유튜브 주소 또는 영상 ID', wide: true }, { n: 'year', l: '연도' }, { n: 'thumb', l: '썸네일 주소 (선택, 비우면 유튜브 썸네일)' },
        { n: 'desc', l: '한 줄 소개', k: 'textarea', wide: true }
      ]
    },
    lab: {
      title: '왕립기술연구소 · 아카이브', add: '+ 항목 추가', head: function (it) { return (it.title || '(새 항목)') + (it.ver ? ' · ' + it.ver : ''); },
      blank: function () { return { type: 'program', title: '', ver: 'v0.1', status: 'wip', date: new Date().toISOString().slice(0, 7), desc: '', tags: [], links: [] }; },
      help: '파일은 직접 올릴 수 없습니다. 구글 드라이브·깃허브 등에 올린 뒤 그 주소를 링크로 넣어 주세요.',
      fields: [
        { n: 'title', l: '이름', wide: true }, { n: 'type', l: '종류', k: 'select', opts: LAB_TYPES }, { n: 'status', l: '공개 상태', k: 'select', opts: LAB_STATUS },
        { n: 'ver', l: '버전 (예: v1.0)' }, { n: 'date', l: '날짜 (예: 2026-10)' },
        { n: 'desc', l: '설명', k: 'textarea', wide: true },
        { n: 'tags', l: '태그 (쉼표로 구분)', wide: true, get: function (it) { return (it.tags || []).join(', '); }, set: function (it, v) { it.tags = v.split(',').map(function (s) { return s.trim(); }).filter(Boolean); } },
        linkField(0, 'label'), linkField(0, 'url'), linkField(1, 'label'), linkField(1, 'url')
      ]
    },
    letters: {
      title: '로즈편지 · 지난 호', add: '+ 편지 추가', head: function (it) { return 'No.' + (it.no || '?') + ' ' + (it.title || '(새 편지)'); },
      blank: function () { return { no: 0, date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'), title: '', body: '' }; },
      help: '사이트의 "지난 편지" 목록에 보이는 내용입니다. (구독자에게 메일을 보내는 기능은 아닙니다)',
      fields: [
        { n: 'no', l: '호수', k: 'number' }, { n: 'date', l: '날짜 (예: 2026.10.11)' },
        { n: 'title', l: '제목', wide: true }, { n: 'body', l: '내용', k: 'textarea', wide: true }
      ]
    }
  };

  function renderList(p, key) {
    var spec = SPECS[key], cur = current(key), items = cur.value;
    var card = document.createElement('section'); card.className = 'card';
    var bar = saveBar(key, function () { return items; }, function (v) { items = v; draw(); });
    function draw() {
      card.innerHTML = '<div class="row between"><h3>' + esc(spec.title) + (cur.saved ? '' : '<span class="default-tag">기본값</span>') + '</h3><button class="btn sm" data-add type="button">' + esc(spec.add) + '</button></div>' +
        '<p class="state" style="margin-top:6px">' + esc(spec.help) + '</p><div data-items></div>';
      var box = $('[data-items]', card);
      items.forEach(function (it, i) {
        var el = document.createElement('div'); el.className = 'item';
        el.innerHTML = '<div class="item-head"><b></b><div class="item-tools"><button class="btn sm ghost" data-up type="button" aria-label="위로">&uarr;</button><button class="btn sm ghost" data-down type="button" aria-label="아래로">&darr;</button><button class="btn sm danger" data-del type="button">삭제</button></div></div><div class="grid"></div>';
        $('b', el).textContent = spec.head(it);
        var g = $('.grid', el);
        spec.fields.forEach(function (f) {
          var val = f.get ? f.get(it) : (it[f.n] == null ? '' : it[f.n]), lab = document.createElement('label');
          lab.className = 'f' + (f.wide ? ' wide' : '');
          var ctl = f.k === 'textarea' ? '<textarea rows="3">' + esc(val) + '</textarea>'
            : f.k === 'select' ? '<select>' + Object.keys(f.opts).map(function (k) { return '<option value="' + k + '"' + (k === val ? ' selected' : '') + '>' + esc(f.opts[k]) + '</option>'; }).join('') + '</select>'
            : '<input type="' + (f.k === 'number' ? 'number' : 'text') + '" value="' + esc(val) + '">';
          lab.innerHTML = esc(f.l) + ctl;
          $('input,textarea,select', lab).addEventListener('input', function (e) {
            var v = e.target.value;
            if (f.set) f.set(it, v); else it[f.n] = f.k === 'number' ? Number(v) : v;
            $('b', el).textContent = spec.head(it); bar._mark();
          });
          g.appendChild(lab);
        });
        $('[data-up]', el).addEventListener('click', function () { if (i > 0) { items.splice(i - 1, 0, items.splice(i, 1)[0]); bar._mark(); draw(); } });
        $('[data-down]', el).addEventListener('click', function () { if (i < items.length - 1) { items.splice(i + 1, 0, items.splice(i, 1)[0]); bar._mark(); draw(); } });
        $('[data-del]', el).addEventListener('click', function () { if (confirm('이 항목을 삭제할까요? (저장해야 사이트에 반영됩니다)')) { items.splice(i, 1); bar._mark(); draw(); } });
        box.appendChild(el);
      });
      if (!items.length) box.innerHTML = '<p class="empty">항목이 없습니다. 추가해 주세요.</p>';
      $('[data-add]', card).addEventListener('click', function () { var b = spec.blank(); if (key === 'letters') b.no = items.reduce(function (m, x) { return Math.max(m, Number(x.no) || 0); }, 0) + 1; items.push(b); bar._mark(); draw(); var last = $$('.item', card).pop(); if (last) last.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
      card.appendChild(bar);
    }
    draw(); p.appendChild(card);
  }

  start();
})();
