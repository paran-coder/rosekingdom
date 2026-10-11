'use strict';
/* 공개: 로즈편지 구독 */
var util = require('./_lib/util');
var db = require('./_lib/supabase');

module.exports = async function (req, res) {
  if (req.method !== 'POST') return util.send(res, 405, { error: 'POST 만 가능합니다.' });
  var b = util.readBody(req);
  if (b.website) return util.send(res, 200, { ok: true });
  var ip = util.clientIp(req);
  if (util.limited('sub:' + ip, 8, 60 * 60 * 1000)) return util.send(res, 429, { error: '잠시 후 다시 시도해 주세요.' });
  var email = util.clean(b.email, 254).toLowerCase();
  if (!util.EMAIL.test(email)) return util.send(res, 400, { error: '올바른 이메일 주소를 입력해 주세요.' });
  try {
    await db.rest('inquiries', { method: 'POST', prefer: 'return=minimal', body: { kind: 'newsletter', name: '로즈편지 구독', contact: email } });
    util.send(res, 200, { ok: true });
  } catch (e) {
    if (e.status === 409) return util.send(res, 200, { ok: true, already: true }); // 이미 구독 중
    util.send(res, e.code === 'NO_DB' ? 503 : 500, { error: '구독 신청에 실패했어요. 잠시 후 다시 시도해 주세요.' });
  }
};
