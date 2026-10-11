'use strict';
/* 어드민 로그인: 비밀번호 하나. 틀리면 연타를 늦춥니다. */
var util = require('../_lib/util');
var auth = require('../_lib/auth');

module.exports = async function (req, res) {
  if (req.method !== 'POST') return util.send(res, 405, { error: 'POST 만 가능합니다.' });
  var ip = util.clientIp(req), key = 'login:' + ip;
  if (util.peekLimited(key, 8)) return util.send(res, 429, { error: '잠시 후 다시 시도해 주세요.' });
  var pass = String(util.readBody(req).passcode || '');
  var ok;
  try { ok = pass.length > 0 && pass.length < 200 && auth.checkPasscode(pass); }
  catch (e) { return util.send(res, 503, { error: '어드민 환경변수가 설정되지 않았습니다.' }); }
  if (!ok) { util.limited(key, 8, 10 * 60 * 1000); return util.send(res, 401, { error: '비밀번호가 맞지 않습니다.' }); }
  util.reset(key);
  util.send(res, 200, { ok: true }, { 'Set-Cookie': auth.issueCookie() });
};
