/* 부엉프로덕션 · 로즈왕국 — 콘텐츠 데이터
   링크(url)가 비어 있으면 '준비중' 상태로 표시됩니다. 여기만 고치면 사이트에 반영됩니다. */
window.CONFIG = {
  siteName: '부엉프로덕션',
  contactEmail: '',            // 의뢰 메일 수신 주소 (예: hello@owl.production)
  newsletterAction: ''         // 로즈편지 구독 폼 전송 URL (스티비/메일침프 등). 비우면 브라우저에만 저장
};

/* sns type: youtube | instagram | tiktok | x | threads | blog */
window.QUEEN = {
  id: 'rose', name: '로즈', title: '로즈왕국의 여왕', en: 'Queen Rose of the Rose Kingdom',
  avatar: 'assets/avatars/rose.jpg', sheet: 'assets/sheets/rose.jpg',
  quote: '장미는 아름답고, 그 아름다움은 모두를 위한 것입니다.',
  desc: '아름다움과 지혜로 로즈왕국을 다스리는 현명한 여왕. 장미 마법과 치유의 마법을 다루며, 왕국의 군주이자 부엉프로덕션의 크리에이터로서 직접 카메라 앞에 서기도 합니다.',
  tags: ['장미 마법', '치유', '장미차', '시·고전 음악'],
  sns: [
    { type: 'instagram', url: 'https://www.instagram.com/rose_ai_log' },
    { type: 'youtube', url: 'https://youtube.com/channel/UCAAaiXnTVeulMW0Q5Xd22iw' }
  ]
};

window.HUNTER = {
  id: 'hunter', name: '헌터', title: '부엉이즈 헌터 · 수석 조교', en: 'Hunter, the Owls\' Handler',
  avatar: 'assets/avatars/hunter.jpg', sheet: 'assets/sheets/hunter.jpg',
  quote: '계획, 실행, 촬영, 편집까지. 모든 미션은 완수한다.',
  desc: '부엉프로덕션의 실세이자 부엉이들의 조교. 가면과 후드 뒤에 표정을 감춘 채 콘텐츠 제작실의 하루를 지킵니다. 원칙주의에 단호하지만 장미 한 송이 앞에서는 약간 smug해집니다.',
  tags: ['원칙주의', '멀티 플레이어', '조교 모드', '카리스마'],
  sns: [{ type: 'instagram', url: 'https://www.instagram.com/white_ai_studio' }]
};

window.OWLS = [
  { id: 'action', no: 1, name: '액션대가 부엉이', en: 'Action Master Owl', accent: '#e0a800',
    avatar: 'assets/avatars/action.jpg', sheet: 'assets/sheets/action.jpg',
    tagline: '액션은 예술이다! 안전은 기본, 멋은 필수!',
    desc: '액션의 모든 순간을 설계하고 완벽하게 연출하는 액션 연출 전문가. 위험 예측과 안전 확보, 스타일리시한 합까지 책임집니다. 클래퍼보드와 메가폰은 언제나 허리춤에.',
    tags: ['액션 연출', '위험 예측', '스타일리시'],
    sns: [
      { type: 'instagram', url: 'https://www.instagram.com/director_gom' },
      { type: 'youtube', url: 'https://youtube.com/@director_gom' },
      { type: 'x', url: 'https://x.com/director_gom' },
      { type: 'threads', url: 'https://www.threads.com/@director_gom' },
      { type: 'tiktok', url: 'https://www.tiktok.com/@director_gom' }
    ] },
  { id: 'kiss', no: 2, name: '키스신대가 부엉이', en: 'Kiss-Scene Master Owl', accent: '#e58aa0',
    avatar: 'assets/avatars/kiss.jpg', sheet: 'assets/sheets/kiss.jpg',
    tagline: '설렘 가득한 키스신, 준비는 완벽하게!',
    desc: '로맨틱한 순간을 연출하는 천재 부엉이. 장미와 하트 콤팩트, 향수로 분위기를 만들고 \'키스신 대본\'으로 완벽한 타이밍을 설계합니다.',
    tags: ['로맨스', '분위기 연출', '타이밍'],
    sns: [
      { type: 'youtube', url: 'https://youtube.com/@bside_bl' },
      { type: 'instagram', url: 'https://www.instagram.com/b_sidelove.ai' },
      { type: 'threads', url: 'https://www.threads.com/@b_sidelove.ai' },
      { type: 'tiktok', url: 'https://www.tiktok.com/@bside.ai' }
    ] },
  { id: 'costume', no: 3, name: '의상대가 부엉이', en: 'Costume Master Owl', accent: '#6a4688',
    avatar: 'assets/avatars/costume.jpg', sheet: 'assets/sheets/costume.jpg',
    tagline: '섬세한 감각과 완벽한 핏으로 최고의 무대를.',
    desc: '옷을 짓고 스타일을 창조하는 의상 전문가. 줄자, 핀쿠션, 원단 샘플, 재단 가위, 스케치북으로 모든 캐릭터에게 꼭 맞는 옷을 입힙니다.',
    tags: ['의상 디자인', '스타일링', '핏'],
    sns: [
      { type: 'youtube', url: 'https://www.youtube.com/@blio.studio' },
      { type: 'instagram', url: 'https://www.instagram.com/blio_studio' },
      { type: 'threads', url: 'https://www.threads.com/@blio_studio' }
    ] },
  { id: 'eunseulbeot', no: 4, name: '은슬벗대가 부엉이', en: 'Eunseulbeot Master Owl', accent: '#a8445a',
    avatar: 'assets/avatars/eunseulbeot.jpg', sheet: 'assets/sheets/eunseulbeot.jpg',
    tagline: '"벗기는 건 내가 아니야~ 네 마음이지~?"',
    desc: '은근슬쩍 분위기를 만들고 자연스럽게 유도하는 심리 마술의 달인. 장난기 많고 자유분방하며 눈치 백단. 오늘도 한 벌, 살며시~ 성공!',
    tags: ['심리 유도', '분위기 조성', '타이밍 마술'],
    sns: [
      { type: 'instagram', url: 'https://www.instagram.com/granny.moa' },
      { type: 'youtube', url: 'https://youtube.com/@grannymoa' },
      { type: 'threads', url: 'https://www.threads.com/@granny.moa' },
      { type: 'tiktok', url: 'https://www.tiktok.com/@granny.moa' }
    ] },
  { id: 'idol', no: 5, name: '아이돌대가 부엉이', en: 'Idol Master Owl', accent: '#8e63d6',
    avatar: 'assets/avatars/idol.jpg', sheet: 'assets/sheets/idol.jpg',
    tagline: '빛나는 무대, 함께하는 꿈!',
    desc: '무대를 사랑하는 아이돌 매니저이자 퍼포머. 빛나는 무대 위에서 모두의 꿈을 응원하는 반짝반짝 에너지 담당입니다.',
    tags: ['아이돌', '매니저 & 프로듀서', '응원 & 에너지'],
    sns: [
      { type: 'instagram', url: 'https://www.instagram.com/ppabamfilms' },
      { type: 'youtube', url: 'https://youtube.com/@ppabamfilms' },
      { type: 'threads', url: 'https://www.threads.com/@ppabamfilms' },
      { type: 'tiktok', url: 'https://www.tiktok.com/@ppabamfilms' }
    ] },
  { id: 'background', no: 6, name: '배경대가 부엉이', en: 'Background Master Owl', accent: '#5f7a3a',
    avatar: 'assets/avatars/background.jpg', sheet: 'assets/sheets/background.jpg',
    tagline: '그림으로 세상을 완성해요.',
    desc: '자연과 공간의 이야기를 그림으로 담아내는 배경 아트의 대가. 어디든 탐험하며 아름다운 풍경을 수집하고, 붓과 태블릿으로 세계를 완성합니다.',
    tags: ['배경 아트', '풍경 수집', '세계관 설계'],
    sns: [
      { type: 'instagram', url: 'https://www.instagram.com/luminaframe_2026' },
      { type: 'youtube', url: 'https://www.youtube.com/@루미나프레임' },
      { type: 'threads', url: 'https://www.threads.com/@luminaframe_2026' },
      { type: 'tiktok', url: 'https://www.tiktok.com/@your.drama92' }
    ] },
  { id: 'fairytale', no: 7, name: '동화대가 부엉이', en: 'Fairytale Master Owl', accent: '#4b4a8f',
    avatar: 'assets/avatars/fairytale.jpg', sheet: 'assets/sheets/fairytale.jpg',
    tagline: '스토리를 엮고, 상상을 현실로 만드는 마법의 이야기꾼.',
    desc: '동화책과 마법 지팡이, 별빛 랜턴을 든 이야기꾼. 이야기의 열쇠로 상상 속 문을 열고, 지혜의 왕관을 쓰고 이야기를 완성합니다.',
    tags: ['동화', '스토리텔링', '판타지'],
    sns: [{ type: 'instagram', url: 'https://www.instagram.com/shinestudio.tv' }] },
  { id: 'heroine', no: 9, name: '여주맛집대가 부엉이', en: 'Heroine Specialist Owl', accent: '#a8506a',
    avatar: 'assets/avatars/heroine.jpg', sheet: 'assets/sheets/heroine.jpg',
    tagline: '"여주의 이야기가 세상을 움직이게 할 거예요."',
    desc: '모든 여주의 서사를 빛나게 하는 스토리 장인. 매력적인 여주를 발굴하고 설계하고 완성하는 여주 전문 작가입니다. 취미는 여주 연구, 티타임, 명문장 수집.',
    tags: ['여주 서사', '시나리오', '캐릭터 설계'],
    sns: [
      { type: 'youtube', url: 'https://www.youtube.com/@omgj.studio' },
      { type: 'instagram', url: 'https://www.instagram.com/omgj0904' }
    ] }
];

/* 상영관 — 프로덕션 작품. youtube: 유튜브 영상 ID (비우면 '상영 준비중') */
window.SCREENINGS = [
  { title: '로즈왕국 대개봉 (예고편)', owl: '부엉프로덕션', tag: '트레일러', year: '2026', youtube: '', thumb: '', desc: '로즈왕국의 문이 열리는 순간.' },
  { title: '액션대가의 첫 합', owl: '액션대가 부엉이', tag: '액션', year: '2026', youtube: '', thumb: '', desc: '위험도 스타일이다, 준비, 액션!' },
  { title: '장미 한 송이의 고백', owl: '키스신대가 부엉이', tag: '로맨스', year: '2026', youtube: '', thumb: '', desc: '설렘 가득한 키스신 모음.' },
  { title: 'Once Upon a Time', owl: '동화대가 부엉이', tag: '동화', year: '2026', youtube: '', thumb: '', desc: '별빛 랜턴 아래 펼쳐지는 이야기.' },
  { title: '빛나는 무대', owl: '아이돌대가 부엉이', tag: '뮤직', year: '2026', youtube: '', thumb: '', desc: '왕국 최초의 라이브 스테이지.' },
  { title: '메이킹 필름: 부엉이의 하루', owl: '헌터', tag: '메이킹', year: '2026', youtube: '', thumb: '', desc: '조교 헌터가 지켜보는 제작실의 하루.' }
];

/* 왕립기술연구소 — 프로그램/공개 스킬 아카이브.
   type: program | skill | workflow | template */
window.LAB = [
  { type: 'skill', title: '캐릭터시트 프롬프트 스킬', ver: 'v1.0', status: 'public', date: '2026-10',
    desc: '정면·후면·얼굴 클로즈업·소품이 한 장에 담긴 캐릭터시트를 일관된 톤으로 뽑아내는 프롬프트 스킬.',
    tags: ['캐릭터', '프롬프트', 'AI 이미지'], links: [{ label: '자세히', url: '' }] },
  { type: 'workflow', title: '부엉이 한 편 제작 파이프라인', ver: 'v0.9', status: 'beta', date: '2026-10',
    desc: '시나리오 → 캐릭터 → 컷 이미지 → 영상 → 편집까지, 한 편을 만드는 부엉프로덕션의 표준 공정.',
    tags: ['파이프라인', '영상 제작'], links: [{ label: '문서 보기', url: '' }] },
  { type: 'program', title: '로즈 컷 플래너', ver: 'v0.1', status: 'wip', date: '2026-11',
    desc: '장면 설명을 넣으면 샷 리스트와 프롬프트 초안을 만들어 주는 연출 보조 도구.',
    tags: ['연출', '도구'], links: [{ label: '곧 공개', url: '' }] },
  { type: 'template', title: '로즈왕국 캐릭터 설정 템플릿', ver: 'v1.0', status: 'public', date: '2026-10',
    desc: '직업·특기·소품·성격·컬러 팔레트를 채우면 세계관에 맞는 부엉이가 완성되는 템플릿.',
    tags: ['템플릿', '세계관'], links: [{ label: '다운로드', url: '' }] }
];

/* 왕립서고 — 로즈왕국 연대기. 내용은 자유롭게 고쳐 쓰세요. */
window.LIBRARY = {
  intro: '장미가 피어나는 한, 로즈왕국은 영원히 아름다우리라. 왕국의 기록은 이 서고에 보관됩니다.',
  chapters: [
    { era: '제1장 · 장미의 씨앗', title: '로즈왕국의 건국',
      text: '오래전, 이야기가 꽃이 되어 피어나던 땅에 첫 장미가 뿌리를 내렸다. 사람들은 그 향기를 따라 모여들었고, 마을은 곧 왕국이 되었다.' },
    { era: '제2장 · 여왕의 즉위', title: '여왕 로즈',
      text: '장미 마법과 치유의 마법을 다루는 로즈가 왕좌에 올랐다. 그녀는 왕국을 지키는 군주이자, 이야기를 사랑하는 한 명의 창작자였다.' },
    { era: '제3장 · 부엉이들의 숲', title: '여덟 마리 부엉이',
      text: '왕국의 숲에는 이야기를 만드는 재주를 가진 부엉이들이 살았다. 액션, 로맨스, 의상, 무대, 풍경, 동화, 여주의 서사. 저마다 하나씩 대가의 길을 걸었다.' },
    { era: '제4장 · 조교의 등장', title: '헌터, 훈련소의 문을 열다',
      text: '흩어져 있던 부엉이들을 하나의 제작실로 모은 이는 가면 쓴 헌터였다. 그의 호루라기 아래에서 부엉프로덕션의 하루가 시작되었다.' },
    { era: '제5장 · 왕립기술연구소', title: '기술의 등불',
      text: '여왕은 부엉이들이 쌓은 기술을 기록해 모두에게 나누기로 했다. 연구소의 문이 열리고, 프로그램과 스킬이 하나둘 공개되기 시작했다.' },
    { era: '제6장 · 상영관의 개관', title: '첫 번째 상영',
      text: '만들어진 이야기는 상영관의 불이 꺼질 때 비로소 완성된다. 왕국 최초의 상영회에는 온 마을이 모였다.' },
    { era: '다음 장', title: '아직 쓰이지 않은 페이지',
      text: '서고의 마지막 장은 비어 있다. 그것은 앞으로 부엉프로덕션이 함께 써 내려갈 이야기다.' }
  ]
};

/* 로즈편지 — 지난 편지 아카이브 */
window.LETTERS = [
  { no: 1, date: '2026.10.11', title: '창간호 · 왕국의 문이 열렸습니다',
    body: '안녕하세요, 로즈입니다. 오늘부터 부엉프로덕션의 소식을 장미 향과 함께 편지로 보내드립니다. 새 영상, 공개 스킬, 부엉이들의 근황을 한 통에 담아 드릴게요.' }
];

window.SNS_LABEL = { youtube: 'YouTube', instagram: 'Instagram', tiktok: 'TikTok', x: 'X', threads: 'Threads', blog: 'Blog' };
