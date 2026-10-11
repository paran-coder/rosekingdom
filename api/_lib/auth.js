'use strict';
/* 비밀번호 하나짜리 어드민 잠금: 서명된 쿠키 세션 */
var crypto = require('crypto');
var util = require('./util');

var COOKIE = 'rk_admin';
var MAX_AGE = 60 * 60 * 24 * 7; // 7일

function secret() {
  var s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) { var e = new Error('ADMIN_SESSION_SECRET 이 없거나 32자 미만'); e.code = 'NO_ADMIN_ENV'; throw e; }
  return s;
}
function mac(v) { return crypto.createHmac('sha256', secret()).update(v).digest('hex'); }
function safeEq(a, b) { var x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); }

function checkPasscode(input) {
  var want = process.env.ADMIN_PASSCODE || '';
  if (want.length < 8) { var e = new Error('ADMIN_PASSCODE 가 없거나 짧습니다'); e.code = 'NO_ADMIN_ENV'; throw e; }
  // 길이가 달라도 같은 시간이 걸리도록 해시끼리 비교
  var h = function (s) { return crypto.createHash('sha256').update(String(s)).digest(); };
  return crypto.timingSafeEqual(h(input), h(want));
}

function issueCookie() {
  var exp = Date.now() + MAX_AGE * 1000, body = 'v1.' + exp;
  var token = body + '.' + mac(body);
  return COOKIE + '=' + token + '; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=' + MAX_AGE;
}
function clearCookie() { return COOKIE + '=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'; }

function verify(req) {
  var t = util.parseCookies(req)[COOKIE];
  if (!t) return false;
  var p = t.split('.');
  if (p.length !== 3 || p[0] !== 'v1') return false;
  var exp = Number(p[1]);
  if (!exp || Date.now() > exp) return false;
  return safeEq(p[2], mac(p[0] + '.' + p[1]));
}

/* 관리자 API 입구: 세션 확인 + (쓰기라면) 같은 사이트에서 온 요청인지 확인 */
function requireAdmin(req, res) {
  var ok;
  try { ok = verify(req); } catch (e) { util.send(res, 503, { error: '어드민 환경변수가 설정되지 않았습니다.' }); return false; }
  if (!ok) { util.send(res, 401, { error: '로그인이 필요합니다.' }); return false; }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    var origin = req.headers.origin, host = req.headers.host;
    if (origin && host) { try { if (new URL(origin).host !== host) { util.send(res, 403, { error: '허용되지 않은 요청입니다.' }); return false; } } catch (e) { util.send(res, 403, { error: '허용되지 않은 요청입니다.' }); return false; } }
    if (req.headers['x-admin-request'] !== '1') { util.send(res, 403, { error: '허용되지 않은 요청입니다.' }); return false; }
  }
  return true;
}

module.exports = { checkPasscode, issueCookie, clearCookie, verify, requireAdmin };
