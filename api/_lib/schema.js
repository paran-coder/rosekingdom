'use strict';
/* 어드민으로 고칠 수 있는 항목의 "허용 목록"과 검증 규칙.
   목록에 없는 key 는 저장할 수 없고, 값은 모양을 맞춰 정리된 뒤에만 저장됩니다. */
var clean = require('./util').clean;

var SNS_TYPES = ['youtube', 'instagram', 'tiktok', 'x', 'threads', 'blog'];
var LAB_TYPES = ['program', 'skill', 'workflow', 'template'];
var LAB_STATUS = ['public', 'beta', 'wip'];

var SNS_OWNERS = [
  ['rose', '로즈여왕'], ['hunter', '헌터'], ['action', '1 액션대가'], ['kiss', '2 키스신대가'],
  ['costume', '3 의상대가'], ['eunseulbeot', '4 은슬벗대가'], ['idol', '5 아이돌대가'],
  ['background', '6 배경대가'], ['fairytale', '7 동화대가'], ['heroine', '9 여주맛집대가']
];

function fail(msg) { var e = new Error(msg); e.code = 'INVALID'; throw e; }

function url(v, label) {
  v = clean(v, 400);
  if (!v) return '';
  var u;
  try { u = new URL(v); } catch (e) { fail(label + ' 주소 형식이 올바르지 않습니다: ' + v); }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') fail(label + ' 주소는 http(s) 로 시작해야 합니다.');
  return v;
}
function oneOf(v, list, def) { v = clean(v, 30); return list.indexOf(v) >= 0 ? v : def; }

/* 유튜브 주소/ID 어느 쪽을 넣어도 영상 ID 로 맞춥니다 */
function youtubeId(v) {
  v = clean(v, 300);
  if (!v) return '';
  if (/^[\w-]{6,20}$/.test(v)) return v;
  var m = v.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{6,20})/);
  if (m) return m[1];
  fail('유튜브 영상 주소나 ID 를 확인해 주세요: ' + v);
}

function arr(v, max, label) {
  if (!Array.isArray(v)) fail(label + ' 는 목록이어야 합니다.');
  if (v.length > max) fail(label + ' 는 최대 ' + max + '개까지입니다.');
  return v;
}

var VALIDATORS = {
  sns: function (v) {
    return arr(v, 8, 'SNS 링크').map(function (it) {
      it = it || {};
      var u = url(it.url, 'SNS');
      return u ? { type: oneOf(it.type, SNS_TYPES, 'blog'), url: u } : null;
    }).filter(Boolean);
  },
  screenings: function (v) {
    return arr(v, 60, '상영작').map(function (it) {
      it = it || {};
      var title = clean(it.title, 80);
      if (!title) return null;
      return {
        title: title, owl: clean(it.owl, 60), tag: clean(it.tag, 20), year: clean(it.year, 10),
        youtube: youtubeId(it.youtube), thumb: url(it.thumb, '썸네일'), desc: clean(it.desc, 160)
      };
    }).filter(Boolean);
  },
  lab: function (v) {
    return arr(v, 60, '연구소 항목').map(function (it) {
      it = it || {};
      var title = clean(it.title, 80);
      if (!title) return null;
      var tags = Array.isArray(it.tags) ? it.tags : String(it.tags || '').split(',');
      var links = (Array.isArray(it.links) ? it.links : []).slice(0, 3).map(function (l) {
        l = l || {};
        var label = clean(l.label, 20);
        if (!label) return null;
        return { label: label, url: url(l.url, '링크') };
      }).filter(Boolean);
      return {
        type: oneOf(it.type, LAB_TYPES, 'program'), title: title, ver: clean(it.ver, 20),
        status: oneOf(it.status, LAB_STATUS, 'wip'), date: clean(it.date, 10), desc: clean(it.desc, 400),
        tags: tags.map(function (t) { return clean(t, 20); }).filter(Boolean).slice(0, 8), links: links
      };
    }).filter(Boolean);
  },
  letters: function (v) {
    return arr(v, 200, '로즈편지').map(function (it, i) {
      it = it || {};
      var title = clean(it.title, 80);
      if (!title) return null;
      return {
        no: Number(it.no) > 0 ? Math.floor(Number(it.no)) : i + 1,
        date: clean(it.date, 12), title: title, body: clean(it.body, 2000)
      };
    }).filter(Boolean);
  }
};

/* key → { label, type, sort, validate, group } */
var KEYS = {};
SNS_OWNERS.forEach(function (o, i) {
  KEYS['sns.' + o[0]] = { label: o[1] + ' · SNS 링크', type: 'list', sort: 10 + i, validate: VALIDATORS.sns, group: 'sns' };
});
KEYS.screenings = { label: '왕립 상영관 · 영상 목록', type: 'list', sort: 30, validate: VALIDATORS.screenings, group: 'screenings' };
KEYS.lab = { label: '왕립기술연구소 · 아카이브', type: 'list', sort: 40, validate: VALIDATORS.lab, group: 'lab' };
KEYS.letters = { label: '로즈편지 · 지난 호', type: 'list', sort: 50, validate: VALIDATORS.letters, group: 'letters' };

module.exports = { KEYS: KEYS, SNS_OWNERS: SNS_OWNERS, youtubeId: youtubeId };
