/* 어드민에서 고친 내용을 불러와 data/data.js 기본값 위에 덮어씁니다.
   불러오지 못해도(오프라인, DB 미연결, 로컬 확인 중) 기본값으로 정상 동작합니다. */
(function () {
  'use strict';
  var D = window;

  function apply(c) {
    function sns(id, target) { if (target && Array.isArray(c['sns.' + id])) target.sns = c['sns.' + id]; }
    sns('rose', D.QUEEN);
    sns('hunter', D.HUNTER);
    (D.OWLS || []).forEach(function (o) { sns(o.id, o); });
    if (Array.isArray(c.screenings)) D.SCREENINGS = c.screenings;
    if (Array.isArray(c.lab)) D.LAB = c.lab;
    if (Array.isArray(c.letters)) D.LETTERS = c.letters;
  }

  D.CONTENT_READY = new Promise(function (resolve) {
    var done = false;
    function fin() { if (!done) { done = true; resolve(); } }
    var timer = setTimeout(fin, 1500); // 오래 걸리면 기본값으로 먼저 보여 줍니다
    fetch('/api/content', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.content && !done) apply(j.content); })
      .catch(function () {})
      .then(function () { clearTimeout(timer); fin(); });
  });
})();
