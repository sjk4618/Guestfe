# Club Guestlist 🎵

프리미엄 다크모드 기반 멀티 클럽용 게스트 리스트 & 도어 체크인 & 통계 시스템

## 🌟 주요 기능

### 역할 기반 접근 제어
- **ADMIN**: 전체 시스템 관리, 스태프 관리, 통계 대시보드
- **STAFF**: 게스트 관리, 도어 체크인, 통계 조회
- **DJ**: 본인 게스트 관리
- **PROMOTER**: 본인 게스트 관리
- **EXTERNAL_EVENT**: 외부 행사 게스트 관리

### 핵심 기능
- ✅ 게스트 등록 및 관리 (무료/유료)
- ✅ 도어 체크인 시스템 (빠른 검색 및 터치 체크인)
- ✅ 영업일(business_date) 기반 통계
- ✅ 기간별 대시보드 (일간/주간/월간)
- ✅ 클럽별 완전 데이터 분리
- ✅ 모바일/태블릿 반응형 디자인

## 🎨 디자인

프리미엄 다크모드 테마:
- **배경**: 깊은 차콜 (#0d0d12, #18181b)
- **액센트**: 초록 네온 (#10b981)
- **Secondary**: 보라 (#6366f1)
- **미니멀하고 고급스러운 UI/UX**
- **큰 터치 타겟 (모바일/태블릿 최적화)**

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

## 🔐 데모 계정

로그인 시 아래 계정으로 테스트할 수 있습니다:

| 역할 | 아이디 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin | admin123 |
| 스태프 | staff | staff123 |
| DJ | dj | dj123 |
| 프로모터 | promoter | promoter123 |
| 외부행사 | external | external123 |

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── App.tsx                    # 메인 앱 컴포넌트
│   └── components/
│       ├── LoginPage.tsx          # 로그인 페이지
│       ├── MainLayout.tsx         # 메인 레이아웃 (사이드바, 모바일 네비)
│       ├── GuestsPage.tsx         # 게스트 리스트
│       ├── DoorPage.tsx           # 도어 체크인
│       ├── AdminDashboard.tsx     # 통계 대시보드
│       ├── AdminStaffPage.tsx     # 스태프 관리
│       ├── AdminSettingsPage.tsx  # 설정
│       └── ui/                    # UI 컴포넌트 라이브러리
└── styles/
    ├── theme.css                  # 디자인 시스템 토큰
    ├── tailwind.css               # Tailwind 설정
    └── fonts.css                  # 폰트 설정
```

## 🛠 기술 스택

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Charts**: Recharts
- **Date Utils**: date-fns
- **Toast**: Sonner
- **Build Tool**: Vite
- **Backend (예정)**: Supabase

## 📱 모바일 최적화

- 반응형 레이아웃 (Desktop / Tablet / Mobile)
- 큰 터치 타겟 (최소 44px)
- 모바일 하단 네비게이션
- 빠른 검색 및 필터링

## 🔜 다음 단계

- [ ] Supabase 프로젝트 설정
- [ ] 데이터베이스 스키마 구축
- [ ] Row Level Security (RLS) 정책 적용
- [ ] 실시간 체크인 동기화
- [ ] PWA 지원

## 📄 라이선스

MIT License

## 🤝 기여

이슈와 PR은 언제나 환영합니다!
