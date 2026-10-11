# 어드민 인수인계 · 부엉프로덕션 · 2026-10-11

사이트: https://rosekingdom.vercel.app/
어드민: https://rosekingdom.vercel.app/admin/  (비밀번호는 Vercel → Settings → Environment Variables → `ADMIN_PASSCODE` 에 있음. 이 문서에 값은 적지 않는다)

> **상태: 코드는 완성, DB 연결과 비밀번호 설정은 아직.** 아래 "남은 일"을 끝내야 어드민이 실제로 동작합니다.
> 그 전에는 사이트가 기존처럼(`data/data.js` 기본값) 동작하고, 의뢰·구독 폼은 예전 방식(메일 앱 / 브라우저 저장)으로 대신합니다. 배포해도 사이트가 깨지지 않습니다.

## 바꿀 수 있는 것
| 항목 | 종류 | 어디에 보이나 |
|---|---|---|
| 로즈여왕·헌터·부엉이 8마리 SNS 링크 (10곳) | 목록 | 월드 팝업, 카탈로그 카드, 캐릭터시트 팝업 |
| 왕립 상영관 영상 목록 | 목록 | 상영관 섹션, 월드 상영관 팝업 |
| 왕립기술연구소 아카이브 | 목록 | 연구소 섹션, 월드 연구소 팝업 |
| 로즈편지 지난 호 | 목록 | 알현실 "지난 편지" |
| 의뢰서 접수함 | 접수함 | /admin → 접수함 → 의뢰서 (새로 옴/확인/완료) |
| 로즈편지 구독자 | 접수함 | /admin → 접수함 → 구독자 (CSV 내려받기) |

안 바꾸는 것: 레이아웃 · 색 · 페이지 구조 · 월드 이미지 · 부엉이 소개글 · 서고 연대기 (바꾸려면 클로드에게. 서고·소개글은 `data/data.js` 를 고치면 됩니다)

- 상영관 영상은 **유튜브 주소를 그대로 붙여 넣으면** 됩니다 (영상 ID 로 자동 변환).
- 연구소 파일은 직접 올릴 수 없습니다. 드라이브·깃허브 등에 올린 뒤 주소를 링크로 넣습니다.
- 저장한 내용은 사이트에 최대 1분 안에 반영됩니다(공개 API 캐시 15초 + 재검증 60초).
- 어드민에서 항목을 저장한 적이 없으면 `data/data.js` 의 값이 그대로 보입니다("기본값" 표시). 저장하는 순간부터 DB 값이 우선합니다.

## 구조
```
index.html, css/, js/, assets/, data/     사이트 (정적)
js/content.js                              사이트가 /api/content 에서 어드민 내용을 받아 data.js 기본값 위에 덮어씀
admin/                                     어드민 화면 (/admin/)
api/content.js, inquiries.js, subscribe.js 공개 API (내용 읽기, 의뢰 접수, 구독)
api/admin/*.js                             로그인·내용 저장·접수함 (비밀번호 쿠키 필요)
api/_lib/                                  Supabase 호출, 로그인, 항목 허용 목록·검증(schema.js)
supabase/migrations/*.sql, seed.sql        표 만들기 + 현재 값 옮기기
```

## 표
- `site_content` (key, type, label, value, sort, updated_at) — 항목 13개(SNS 10 + 상영관 + 연구소 + 로즈편지)
- `inquiries` (id, kind, name, contact, message, extra, status, created_at) — `kind` 가 `commission`(의뢰) 또는 `newsletter`(구독). 삭제 권한 없음
- 두 표 모두 RLS 켜짐, anon/authenticated 권한 회수. 읽고 쓰는 건 서버 함수(service_role)뿐

환경변수 이름: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Vercel–Supabase 연동이 넣음), `ADMIN_PASSCODE`, `ADMIN_SESSION_SECRET` (직접 넣음)

## 남은 일 (이 순서로)
1. **Supabase 프로젝트** 만들기 (리전 Seoul). 무료 프로젝트 한도에 걸리면 기존 프로젝트를 같이 쓰고 표 이름에 접두사를 붙이는 방법이 있음
2. Supabase 대시보드 → Integrations → **Vercel 연동** (프로젝트 `rosekingdom`, Production). 그러면 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 가 자동으로 들어감
3. Supabase → SQL Editor 에서 순서대로 실행: `supabase/migrations/20261011000001_site_content.sql` → `20261011000002_inquiries.sql` → `supabase/seed.sql`
4. Vercel → Settings → Environment Variables → `ADMIN_PASSCODE`(12자 이상), `ADMIN_SESSION_SECRET`(32자 이상 랜덤, 예: `openssl rand -base64 32`) → **Production 만 체크, 값은 직접 입력**
5. 재배포 (환경변수는 다음 배포부터 적용)
6. `/admin/` 에서 로그인 → 헌터 SNS 링크 한 글자 바꾸고 저장 → 사이트 새로고침으로 확인 / 사이트에서 테스트 의뢰 1건 → 접수함 확인

## 확인한 것 (로컬, 메모리 가짜 DB)
- 로그인 없이 어드민 API 접근 → 401, 틀린 비밀번호 → 401, 연속 실패 → 제한
- 같은 사이트에서 온 요청이 아니거나 `X-Admin-Request` 헤더가 없는 쓰기 → 403
- 허용 목록에 없는 key, `javascript:` 주소, 잘못된 유튜브 주소 → 400 (저장 안 됨)
- 유튜브 주소 → 영상 ID 변환, 어드민에서 SNS 링크 수정·저장 → 공개 사이트에 반영
- 사이트 폼으로 의뢰 접수 → 접수함에 표시, 상태 변경, 구독 중복(대소문자 달라도 한 줄), 숨김 칸(봇) 무시
- 로그아웃 후 어드민 API → 401, 새로고침해도 로그인 유지
- 확인 못 한 것: **실제 Supabase 와 Vercel 환경에서의 동작**(위 "남은 일" 이후 확인 필요), 모바일에서의 어드민 화면, 비밀번호 5회 이상 연속 실패 시 차단의 실서버 동작(서버리스 인스턴스별 메모리라 완벽한 방어는 아님)

## 자체 점검 5줄
1. 열쇠는 서버에만: `SUPABASE_SERVICE_ROLE_KEY` 는 `api/_lib/supabase.js` 에서만 읽고, 브라우저 코드(`js/`, `admin/`)에는 없음
2. 어드민과 편집 API 는 비밀번호 뒤에: `api/admin/*` 는 첫 줄에서 세션 확인(`requireAdmin`), 비밀번호 값은 환경변수에만
3. 표는 RLS 켜짐 + 브라우저 권한 회수, 정책(policy) 없음
4. 저장 값은 서버가 허용 목록·길이·주소 형식으로 정리한 뒤에만 저장, 화면에서는 모두 이스케이프
5. 시크릿이 저장소에 없음(`.env*` 무시, 키처럼 보이는 문자열 없음)

## 테스트 데이터
- 로컬 가짜 DB 에만 테스트 데이터를 넣었고 실제 DB 에는 아직 아무것도 넣지 않았습니다.

## 오늘 막힌 것 / 다음에 할 것
- Supabase·Vercel 계정 로그인과 비밀번호 입력은 직접 해야 해서 "남은 일" 1~5번이 남아 있음
- 다음에: 연구소 파일 업로드(Supabase Storage), 서고·소개글 어드민 편집, 구독자에게 메일 발송(지금은 명단만 모음)
