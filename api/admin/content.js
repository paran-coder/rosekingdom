'use strict';
/* 어드민: 내용 읽기(GET) / 저장(PUT { key, value }) */
var util = require('../_lib/util');
var auth = require('../_lib/auth');
var db = require('../_lib/supabase');
var KEYS = require('../_lib/schema').KEYS;

module.exports = async function (req, res) {
  if (!auth.requireAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      var rows = await db.rest('site_content?select=key,value,updated_at');
      var out = {};
      (rows || []).forEach(function (r) { if (KEYS[r.key]) out[r.key] = { value: r.value, updated_at: r.updated_at }; });
      var defs = Object.keys(KEYS).map(function (k) { return { key: k, label: KEYS[k].label, type: KEYS[k].type, group: KEYS[k].group, sort: KEYS[k].sort }; });
      return util.send(res, 200, { defs: defs, content: out });
    }
    if (req.method === 'PUT') {
      var b = util.readBody(req), def = Object.prototype.hasOwnProperty.call(KEYS, b.key) ? KEYS[b.key] : null;
      if (!def) return util.send(res, 400, { error: '알 수 없는 항목입니다.' });
      var value;
      try { value = def.validate(b.value); }
      catch (e) { if (e.code === 'INVALID') return util.send(res, 400, { error: e.message }); throw e; }
      if (JSON.stringify(value).length > 60000) return util.send(res, 400, { error: '내용이 너무 큽니다.' });
      await db.rest('site_content?on_conflict=key', {
        method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal',
        body: { key: b.key, type: def.type, label: def.label, value: value, sort: def.sort, updated_at: new Date().toISOString() }
      });
      return util.send(res, 200, { ok: true, value: value });
    }
    util.send(res, 405, { error: '허용되지 않은 방식입니다.' });
  } catch (e) {
    util.send(res, e.code === 'NO_DB' ? 503 : 500, { error: e.code === 'NO_DB' ? 'DB 가 연결되지 않았습니다.' : '저장하지 못했습니다.' });
  }
};
