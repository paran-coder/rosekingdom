// data/data.js 의 현재 값을 읽어 supabase/seed.sql 을 만듭니다.  사용: node supabase/gen-seed.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', 'data.js'), 'utf8'), ctx);
const D = ctx.window;
const { KEYS } = require('../api/_lib/schema');

const values = {};
for (const p of [D.QUEEN, D.HUNTER].concat(D.OWLS)) values['sns.' + p.id] = p.sns || [];
values.screenings = D.SCREENINGS;
values.lab = D.LAB;
values.letters = D.LETTERS;

const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const rows = Object.keys(KEYS).map((k) => {
  if (!(k in values)) throw new Error('data.js 에 ' + k + ' 가 없습니다');
  const v = KEYS[k].validate(values[k]);
  return '  (' + [q(k), q(KEYS[k].type), q(KEYS[k].label), q(JSON.stringify(v)) + '::jsonb', KEYS[k].sort].join(', ') + ')';
});
const sql = '-- data/data.js 의 현재 값을 어드민 DB 로 옮깁니다. 이미 있는 항목은 건드리지 않습니다.\n' +
  'insert into public.site_content (key, type, label, value, sort) values\n' + rows.join(',\n') + '\non conflict (key) do nothing;\n';
fs.writeFileSync(path.join(__dirname, 'seed.sql'), sql);
console.log('seed.sql 생성: ' + rows.length + '개 항목');
