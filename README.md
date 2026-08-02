# Front-front

### 실핼방법

```

git clone https://github.com/Team-Yeoul/Front-front.git
cd meta-me
yarn
yarn dev

```

### 폴더 구조

```
metame/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # 로그인 전 영역 (URL에 포함 안 됨)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/              # 로그인 후 메인 영역
│   │   │   ├── layout.tsx            # 사이드바, 헤더 포함
│   │   │   ├── diary/
│   │   │   │   └── page.tsx          # 나의 첫 문장 / 데일리 질문 다이어리
│   │   │   ├── report/
│   │   │   │   └── page.tsx          # 리포트 미
│   │   │   └── objectify/
│   │   │       └── page.tsx          # 객관화 도감
│   │   ├── api/                      # Route Handler
│   │   │   ├── diary/
│   │   │   │   └── route.ts
│   │   │   └── ai/
│   │   │       └── route.ts          # FastAPI 연동 프록시
│   │   ├── layout.tsx                # 루트 레이아웃 (font, metadata)
│   │   └── page.tsx                  # 랜딩 페이지
│   ├── components/
│   │   ├── ui/                       # Button, Input, Card 등 공통 UI
│   │   ├── diary/                    # DiaryCard, QuestionBlock 등
│   │   └── layout/                   # Sidebar, Header, Footer
│   ├── lib/
│   │   ├── api.ts                    # fetch wrapper / axios 인스턴스
│   │   └── auth.ts                   # NextAuth 설정
│   ├── hooks/
│   │   ├── useDiary.ts
│   │   └── useAI.ts
│   ├── store/                        # Zustand 전역 상태
│   ├── types/                        # TypeScript 타입 정의
│   └── styles/                       # 전역 스타일
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local
```

### 커밋컨벤션
```
yarn add --dev commitlint
yarn add --dev conventional-changelog-conventionalcommits
```

### Git FLow 전략
```
master : 제품으로 출시될 수 있는 브랜치
develop : 다음 출시 버전을 개발하는 브랜치
feature : 기능을 개발하는 브랜치
release : 이번 출시 버전을 준비하는 브랜치
hotfix : 출시 버전에서 발생한 버그를 수정 하는 브랜치
fix : 수정한 부분 브랜치
```

### 브랜치 생성 후 커밋 방법
```
git checkout -b [브랜치명]
git add .
git commit -m [커밋 컨벤션]
git push origin [브랜치명]
```

### 브랜치 명 예시
```
ex. 로그인 기능 개발
- feature/login

ex2. 로그인 기능 버그 수정
- hotfix/login
```

### 브랜치 업데이트
```
git checkout main
git pull origin main
npm install         
npm run dev
```

