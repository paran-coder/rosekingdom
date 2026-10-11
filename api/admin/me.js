'use strict';
/* 로그인 상태 확인 */
var util = require('../_lib/util');
var auth = require('../_lib/auth');
var db = require('../_lib/supabase');

module.exports = async function (req, res) {
  var ok = false;
  try { ok = auth.verify(req); } catch (e) { return util.send(res, 200, { loggedIn: false, envReady: false }, { 'Cache-Control': 'no-store' }); }
  util.send(res, 200, { loggedIn: ok, envReady: true, db: db.configured() }, { 'Cache-Control': 'no-store' });
};
