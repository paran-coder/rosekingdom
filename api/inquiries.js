'use strict';
/* 공개: 의뢰서 접수 */
var util = require('./_lib/util');
var db = require('./_lib/supabase');

var KINDS = ['AI 영상 제작', '캐릭터 디자인', '시나리오 · 연출', '뮤직 · 아이돌 콘텐츠', '기타 협업'];

module.exports = async function (req, res) {
  if (req.method !== 'POST') return util.send(res, 405, { error: 'POST 만 가능합니다.' });
  var b = util.readBody(req);
  if (b.website) return util.send(res, 200, { ok: true }); // 봇이 채우는 숨김 칸
  var ip = util.clientIp(req);
  if (util.limited('inq:' + ip, 5, 60 * 60 * 1000)) return util.send(res, 429, { error: '잠시 후 다시 시도해 주세요.' });
  var name = util.clean(b.name, 80), email = util.clean(b.email, 254), msg = util.clean(b.msg, 3000);
  if (!name || !util.EMAIL.test(email) || !msg) return util.send(res, 400, { error: '성함, 올바른 이메일, 의뢰 내용을 입력해 주세요.' });
  var kind = KINDS.indexOf(b.kind) >= 0 ? b.kind : '기타 협업';
  try {
    await db.rest('inquiries', {
      method: 'POST', prefer: 'return=minimal',
      body: { kind: 'commission', name: name, contact: email, message: msg, extra: { work: kind, budget: util.clean(b.budget, 120) } }
    });
    util.send(res, 200, { ok: true });
  } catch (e) {
    util.send(res, e.code === 'NO_DB' ? 503 : 500, { error: '접수에 실패했어요. 잠시 후 다시 시도해 주세요.' });
  }
};
