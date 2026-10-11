'use strict';
/* 공통 도우미: 응답, 본문 읽기, 쿠키, 간단한 호출 제한 */

function send(res, status, body, headers) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (headers) Object.keys(headers).forEach(function (k) { res.setHeader(k, headers[k]); });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  var b = req.body;
  if (b && typeof b === 'object' && !Buffer.isBuffer(b)) return b;
  if (typeof b === 'string') { try { return JSON.parse(b); } catch (e) { return {}; } }
  return {};
}

function parseCookies(req) {
  var out = {}, h = req.headers.cookie || '';
  h.split(';').forEach(function (p) {
    var i = p.indexOf('='); if (i < 0) return;
    out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

function clientIp(req) {
  var f = req.headers['x-forwarded-for'];
  return (f ? String(f).split(',')[0] : req.socket && req.socket.remoteAddress || 'unknown').trim();
}

/* 인스턴스별 메모리 제한. 완벽한 방어가 아니라 연타를 늦추는 용도 */
var buckets = new Map();
function limited(key, max, windowMs) {
  var now = Date.now(), b = buckets.get(key);
  if (!b || now > b.reset) { b = { n: 0, reset: now + windowMs }; buckets.set(key, b); }
  b.n += 1;
  if (buckets.size > 5000) buckets.clear();
  return b.n > max;
}
function peekLimited(key, max) { var b = buckets.get(key); return !!b && Date.now() <= b.reset && b.n >= max; }
function reset(key) { buckets.delete(key); }

var EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
function clean(s, max) { return String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max); }

module.exports = { send, readBody, parseCookies, clientIp, limited, peekLimited, reset, EMAIL, clean };
