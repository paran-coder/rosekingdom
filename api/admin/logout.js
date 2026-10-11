'use strict';
var util = require('../_lib/util');
var auth = require('../_lib/auth');

module.exports = async function (req, res) {
  util.send(res, 200, { ok: true }, { 'Set-Cookie': auth.clearCookie() });
};
