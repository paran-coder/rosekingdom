'use strict';
/* 공개: 사이트가 읽어 가는 내용. 값이 없는 항목은 사이트의 data/data.js 기본값을 씁니다. */
var util = require('./_lib/util');
var db = require('./_lib/supabase');
var KEYS = require('./_lib/schema').KEYS;

module.exports = async function (req, res) {
  if (req.method !== 'GET') return util.send(res, 405, { error: 'GET 만 가능합니다.' });
  if (!db.configured()) return util.send(res, 200, { content: {}, db: false }, { 'Cache-Control': 'no-store' });
  try {
    var rows = await db.rest('site_content?select=key,value');
    var out = {};
    (rows || []).forEach(function (r) { if (KEYS[r.key]) out[r.key] = r.value; });
    util.send(res, 200, { content: out, db: true }, { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60' });
  } catch (e) {
    util.send(res, 200, { content: {}, db: false }, { 'Cache-Control': 'no-store' });
  }
};
