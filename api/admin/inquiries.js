'use strict';
/* 어드민: 접수함 목록(GET ?kind=commission|newsletter) / 상태 변경(PATCH { id, status }). 삭제는 없습니다. */
var util = require('../_lib/util');
var auth = require('../_lib/auth');
var db = require('../_lib/supabase');

var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var STATUS = ['new', 'checked', 'done'];

module.exports = async function (req, res) {
  if (!auth.requireAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      var kind = (req.query && req.query.kind) || new URL(req.url, 'http://x').searchParams.get('kind') || 'commission';
      if (['commission', 'newsletter'].indexOf(kind) < 0) kind = 'commission';
      var rows = await db.rest('inquiries?select=id,kind,name,contact,message,extra,status,created_at&kind=eq.' + kind + '&order=created_at.desc&limit=500');
      return util.send(res, 200, { items: rows || [] });
    }
    if (req.method === 'PATCH') {
      var b = util.readBody(req);
      if (!UUID.test(String(b.id)) || STATUS.indexOf(b.status) < 0) return util.send(res, 400, { error: '잘못된 요청입니다.' });
      await db.rest('inquiries?id=eq.' + b.id, { method: 'PATCH', prefer: 'return=minimal', body: { status: b.status } });
      return util.send(res, 200, { ok: true });
    }
    util.send(res, 405, { error: '허용되지 않은 방식입니다.' });
  } catch (e) {
    util.send(res, e.code === 'NO_DB' ? 503 : 500, { error: e.code === 'NO_DB' ? 'DB 가 연결되지 않았습니다.' : '처리하지 못했습니다.' });
  }
};
