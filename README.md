# 부엉프로덕션 · 로즈왕국

빌드가 필요 없는 정적 사이트입니다. 로컬 서버로 확인하세요.

```
python -m http.server 5173 --directory site
```

## 구조
- **월드** (`#world`): 파노라마 일러스트 위를 카메라가 날아다니는 스크롤 투어. 간판, 팝업 카드, 미니맵, 낮→밤 전환, 자동 둘러보기 포함
- **카탈로그** (`#catalog`): 월드에서 본 곳의 상세 목록 (궁전·훈련소·마을·상영관·연구소·서고·알현실)

## 콘텐츠 고치기 — `data/data.js`
- `QUEEN`, `HUNTER`, `OWLS[]` : 소개 문구와 `sns` 링크(`url`을 채우면 버튼 활성화, 비우면 "준비중")
- `SCREENINGS[]` : 상영관 영상. `youtube`에 영상 ID를 넣으면 재생
- `LAB[]` : 왕립기술연구소 아카이브 (type: program / skill / workflow / template, status: public / beta / wip)
- `LIBRARY.chapters[]` : 왕립서고 연대기
- `LETTERS[]` : 로즈편지 지난 호
- `CONFIG.contactEmail` : 의뢰서 수신 메일 / `CONFIG.newsletterAction` : 구독 폼 전송 URL

## 월드 이미지 — `assets/world/`
`day.jpg`, `night.jpg` (+ 모바일용 `-m`, 미니맵 `mini.jpg`). 만든 방법은 `../docs/magnific-scene-prompts.md` 참고.
카메라 지점/간판 위치는 `js/main.js`의 `NODES`에서 조정합니다.

## 어드민 (`/admin/`)
비밀번호 하나로 잠긴 관리자 페이지입니다. SNS 링크, 상영관 영상, 연구소 아카이브, 로즈편지 지난 호를 고치고 의뢰서·구독자 접수함을 볼 수 있습니다.
Supabase(DB)와 Vercel 환경변수 설정이 필요합니다 → 자세한 순서와 현재 상태는 `docs/HANDOFF.md`.
설정 전에는 사이트가 `data/data.js` 기본값으로 정상 동작합니다.

## 배포
GitHub `main` 에 push 하면 Vercel 이 자동 배포합니다. (어드민 API 때문에 Vercel 이 필요합니다. 정적 호스팅만으로는 `/admin` 이 동작하지 않습니다.)
