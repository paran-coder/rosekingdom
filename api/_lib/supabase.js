'use strict';
/* Supabase REST(PostgREST) 호출. 키는 서버 환경변수에서만 읽습니다. */

function configured() { return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY); }

async function rest(path, opts) {
  opts = opts || {};
  var url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { var e = new Error('DB 설정이 없습니다'); e.code = 'NO_DB'; throw e; }
  var headers = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  if (opts.prefer) headers.Prefer = opts.prefer;
  var r = await fetch(url.replace(/\/$/, '') + '/rest/v1/' + path, {
    method: opts.method || 'GET', headers: headers, body: opts.body === undefined ? undefined : JSON.stringify(opts.body)
  });
  var text = await r.text(), data = null;
  if (text) { try { data = JSON.parse(text); } catch (e) { data = text; } }
  if (!r.ok) { var err = new Error('DB ' + r.status); err.status = r.status; err.detail = data; throw err; }
  return data;
}

module.exports = { rest, configured };
