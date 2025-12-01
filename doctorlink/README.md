# 🌐 DoctorLink Web Application

> React SPA + Node.js/Express 기반 의료 예약 웹 애플리케이션

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)

---

## 📖 개요

DoctorLink 웹 애플리케이션은 환자와 의료진을 연결하는 현대적인 의료 예약 및 건강 관리 플랫폼입니다.

### 주요 특징

- ✅ **SPA (Single Page Application)**: 빠르고 부드러운 사용자 경험
- 🎨 **Styled Components**: CSS-in-JS로 모듈화된 스타일링
- 🗺️ **카카오맵 API**: 병원 위치 확인 및 길찾기
- 🔐 **JWT 인증**: 안전한 토큰 기반 인증
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원

---

## 🚀 시작하기

### 필수 요구사항

- **Node.js** 18.x 이상
- **Microsoft SQL Server** 2019 이상
- **npm** 또는 **yarn**
- **카카오 개발자 계정** (카카오맵 API 사용)

### 설치 및 실행

1. **의존성 설치**
   ```bash
   cd doctorlink
   npm install
   ```

2. **데이터베이스 설정**
   
   SQL Server Management Studio (SSMS)에서 스크립트 실행:
   ```bash
   cd database
   # 순서대로 실행:
   # 1. create_database.sql
   # 2. create_stored_procedures.sql
   # 3. insert_sample_data.sql
   ```
   
   자세한 가이드는 [database/README.md](./database/README.md) 참조

3. **환경 변수 설정**
   
   프로젝트 루트에 `.env` 파일 생성:
   ```env
   # 데이터베이스 설정
   DB_USER=sa
   DB_PASSWORD=your_password
   DB_SERVER=localhost
   DB_NAME=DoctorLink
   DB_ENCRYPT=false
   
   # JWT 비밀키
   JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
   
   # 서버 설정
   PORT=5000
   NODE_ENV=development
   
   # 카카오 API 키 (선택)
   KAKAO_API_KEY=your_kakao_api_key
   ```

4. **카카오맵 API 키 설정**
   
   `public/index.html` 파일에서 카카오맵 API 키 교체:
   ```html
   <script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_API_KEY"></script>
   ```
   
   자세한 가이드는 [KAKAO_API_SETUP.md](./KAKAO_API_SETUP.md) 참조

5. **개발 모드 실행**
   ```bash
   # 프론트엔드 + 백엔드 동시 실행
   npm run dev
   
   # 또는 개별 실행
   npm start        # 프론트엔드만
   npm run server   # 백엔드만
   ```

6. **접속**
   - 프론트엔드: http://localhost:3000
   - 백엔드 API: http://localhost:5000

---

## 📁 프로젝트 구조

```
doctorlink/
├── build/                       # 프로덕션 빌드 (npm run build 후)
│
├── database/                    # 데이터베이스 스크립트
│   ├── create_database.sql      # DB 및 테이블 생성
│   ├── create_stored_procedures.sql  # 저장 프로시저
│   ├── insert_sample_data.sql   # 샘플 데이터
│   ├── GUIDE.md                 # 설치 가이드
│   └── README.md
│
├── public/                      # 정적 파일
│   ├── index.html               # SPA 진입점
│   ├── icons/                   # SVG 아이콘
│   └── images/                  # 이미지
│
├── src/                         # 소스 코드
│   ├── pages/                   # 페이지 컴포넌트 (25개)
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── HospitalFinderPage.tsx
│   │   ├── HospitalDetailPage.tsx
│   │   ├── ReservationPage.tsx
│   │   ├── ReservationManagementPage.tsx
│   │   ├── MedicalRecordsPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   ├── MyPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── AdminLoginPage.tsx
│   │   ├── AdminDashboardPage.tsx
│   │   └── admin/               # 관리자 페이지 (10개)
│   │
│   ├── components/              # 재사용 컴포넌트 (30개 이상)
│   │   ├── common/              # 공통 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Loading.tsx
│   │   ├── layout/              # 레이아웃
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── ProtectedRoute.tsx   # 인증 라우트
│   │   └── AdminProtectedRoute.tsx  # 관리자 라우트
│   │
│   ├── context/                 # Context API
│   │   └── AuthContext.tsx      # 인증 상태 관리
│   │
│   ├── services/                # API 서비스 (8개)
│   │   ├── api.ts               # Axios 인스턴스
│   │   ├── authService.ts       # 인증 API
│   │   ├── userService.ts       # 사용자 API
│   │   ├── HospitalService.ts   # 병원 API
│   │   ├── reservationService.ts # 예약 API
│   │   ├── adminService.ts      # 관리자 API
│   │   └── kakaoService.ts      # 카카오맵 API
│   │
│   ├── styles/                  # 전역 스타일
│   │   ├── GlobalStyles.ts      # 전역 CSS
│   │   ├── theme.ts             # 테마 설정
│   │   └── styled.d.ts          # Styled Components 타입
│   │
│   ├── types/                   # TypeScript 타입 정의
│   │   └── index.ts
│   │
│   ├── utils/                   # 유틸리티 함수
│   │   └── validation.ts
│   │
│   ├── hooks/                   # 커스텀 훅
│   │   └── useAuth.ts
│   │
│   ├── server/                  # 백엔드 서버
│   │   ├── index.js             # Express 서버 진입점
│   │   ├── db/                  # DB 연결
│   │   │   └── index.js
│   │   ├── middleware/          # 미들웨어 (3개)
│   │   │   ├── auth.js          # JWT 인증
│   │   │   └── errorHandler.js
│   │   └── routes/api/          # API 라우터 (8개)
│   │       ├── auth.js          # 인증 API
│   │       ├── users.js         # 사용자 API
│   │       ├── hospitals.js     # 병원 API
│   │       ├── doctors.js       # 의사 API
│   │       ├── appointments.js  # 예약 API
│   │       ├── medicalRecords.js # 진료 기록 API
│   │       ├── reviews.js       # 리뷰 API
│   │       └── notifications.js # 알림 API
│   │
│   ├── App.tsx                  # 루트 컴포넌트
│   ├── AppRouter.tsx            # React Router 설정
│   └── index.tsx                # 프론트엔드 진입점
│
├── .env                         # 환경 변수 (git에서 제외됨)
├── .gitignore
├── package.json                 # 프로젝트 의존성
├── tsconfig.json                # TypeScript 설정
├── KAKAO_API_SETUP.md           # 카카오맵 API 설정 가이드
└── README.md                    # 이 파일
```

---

## 🎨 주요 기능

### 🔐 인증 및 권한 관리
- **로그인/회원가입**: JWT 토큰 기반
- **역할 기반 접근 제어**: 환자, 의사, 관리자
- **비밀번호 해싱**: bcrypt 사용

### 🏥 병원 및 의사 검색
- **검색**: 병원명, 주소, 진료과
- **필터링**: 병원 유형, 시/도, 진료과
- **정렬**: 거리순, 평점순, 이름순, 리뷰 많은 순
- **카카오맵 연동**: 위치 확인 및 길찾기

### 📅 예약 시스템
- **실시간 가능 시간 조회**: 저장 프로시저 사용
- **다단계 예약**: 의사 → 날짜 → 시간 → 증상
- **예약 관리**: 조회, 수정, 취소
- **예약 상태**: 대기, 승인, 완료, 취소

### 📋 진료 기록
- **통합 관리**: 진단명, 치료 내용, 처방전
- **검색 기능**: 키워드 검색
- **인쇄 기능**: 진료 기록 인쇄

### ⭐ 리뷰 시스템
- **별점 평가**: 1~5점
- **텍스트 리뷰**: 500자 이내
- **평균 평점**: 트리거로 자동 계산

### 🔔 알림 시스템
- **예약 알림**: 생성, 승인, 변경, 취소
- **리마인더**: 예약 1일 전, 1시간 전 (예정)
- **시스템 공지**: 중요 공지사항
- **읽음 표시**: 읽음/안읽음 구분

### 👨‍💼 관리자 기능
- **대시보드**: 통계 (사용자, 병원, 예약)
- **사용자 관리**: 조회, 수정, 비활성화
- **병원 관리**: 등록, 수정, 의사 관리
- **예약 관리**: 전체 예약 조회 및 상태 변경
- **알림 발송**: 전체/개별 알림 발송
- **문의 관리**: 1:1 문의 답변
- **콘텐츠 관리**: 공지사항, FAQ 작성

---

## 🛠 기술 스택

### 프론트엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18.2.0 | UI 라이브러리 |
| TypeScript | 5.1.3 | 타입 안정성 |
| React Router DOM | 6.14.2 | 클라이언트 라우팅 |
| Styled Components | 6.0.7 | CSS-in-JS 스타일링 |
| Axios | 1.4.0 | HTTP 클라이언트 |
| Kakao Maps API | - | 지도 서비스 |

### 백엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| Node.js | 18.x | 런타임 환경 |
| Express.js | 4.18.2 | 웹 프레임워크 |
| MSSQL | 9.1.1 | SQL Server 드라이버 |
| JWT | 9.0.2 | 인증 토큰 |
| bcrypt | 5.1.0 | 비밀번호 해싱 |
| CORS | 2.8.5 | CORS 처리 |
| dotenv | 16.3.1 | 환경 변수 관리 |

### 데이터베이스

| 기술 | 버전 | 용도 |
|------|------|------|
| Microsoft SQL Server | 2019 | 관계형 데이터베이스 |
| SSMS | - | DB 관리 도구 |

---

## 📡 API 문서

### 주요 API 엔드포인트

**인증 (Authentication)**
```
POST /api/auth/login           # 로그인
POST /api/auth/register        # 회원가입
POST /api/auth/logout          # 로그아웃
GET  /api/auth/me              # 현재 사용자 정보
```

**병원 (Hospitals)**
```
GET  /api/hospitals            # 병원 목록
GET  /api/hospitals/:id        # 병원 상세
GET  /api/hospitals/search     # 병원 검색
GET  /api/hospitals/nearby     # 근처 병원 (예정)
```

**의사 (Doctors)**
```
GET  /api/doctors              # 의사 목록
GET  /api/doctors/:id          # 의사 상세
```

**예약 (Appointments)**
```
GET  /api/appointments/availability  # 예약 가능 시간
POST /api/appointments                # 예약 생성
GET  /api/appointments/patient        # 환자 예약 목록
GET  /api/appointments/doctor         # 의사 예약 목록
PUT  /api/appointments/:id/status     # 예약 상태 변경
```

**진료 기록 (Medical Records)**
```
GET  /api/medical-records/patient     # 환자 진료 기록
GET  /api/medical-records/:id         # 진료 기록 상세
POST /api/medical-records             # 진료 기록 생성 (의사)
```

**리뷰 (Reviews)**
```
GET  /api/reviews/hospital/:id   # 병원 리뷰 목록
GET  /api/reviews/doctor/:id     # 의사 리뷰 목록
POST /api/reviews                # 리뷰 작성
PUT  /api/reviews/:id            # 리뷰 수정
DELETE /api/reviews/:id          # 리뷰 삭제
```

**알림 (Notifications)**
```
GET  /api/notifications          # 알림 목록
PUT  /api/notifications/:id/read # 알림 읽음 처리
```

**관리자 (Admin)**
```
GET  /api/admin/stats            # 통계
GET  /api/admin/users            # 사용자 관리
GET  /api/admin/appointments     # 예약 관리
POST /api/admin/notifications    # 알림 발송
```

자세한 API 문서는 [docs/API_문서.md](../docs/API_문서.md) 참조

---

## 🗄️ 데이터베이스

### ERD 및 테이블 설계

- **Users**: 사용자 (환자, 의사, 관리자)
- **Hospitals**: 병원 정보
- **Doctors**: 의사 정보
- **Appointments**: 예약
- **MedicalRecords**: 진료 기록
- **Reviews**: 리뷰
- **Notifications**: 알림
- **Inquiries**: 문의

자세한 DB 설계는 [docs/데이터베이스_설계.md](../docs/데이터베이스_설계.md) 참조

---

## 📦 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `build/` 폴더에 생성됩니다.

### 배포 (예시)

**Vercel (프론트엔드)**
```bash
npm install -g vercel
vercel
```

**Heroku (백엔드)**
```bash
heroku create doctorlink-api
git push heroku main
```

**AWS / Azure / GCP**
- EC2 / App Service / Compute Engine에 배포
- RDS / SQL Database로 DB 마이그레이션

---

## 🧪 테스트

### 테스트 계정

개발 환경에서 사용 가능한 테스트 계정:

**환자**
- Email: `patient@test.com`
- Password: `test1234`

**의사**
- Email: `doctor@test.com`
- Password: `test1234`

**관리자**
- Email: `admin@test.com`
- Password: `admin1234`

---

## 🔧 개발 도구

### ESLint & Prettier

```bash
npm run lint       # ESLint 검사
npm run format     # Prettier 포맷팅
```

### 디버깅

- **Chrome DevTools**: React Developer Tools 확장 프로그램
- **Redux DevTools**: (향후 Redux 도입 시)
- **Postman**: API 테스트

---

## 📝 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다. 자세한 내용은 [LICENSE](../LICENSE) 파일을 참조하세요.

---

## 🔗 관련 링크

- [프로젝트 메인 README](../README.md)
- [모바일 프로젝트](../DoctorLinkApp/README.md)
- [API 문서](../docs/API_문서.md)
- [데이터베이스 설계](../docs/데이터베이스_설계.md)
- [졸업논문](../docs/README.md)

---

## 🙏 기여

이슈나 개선 사항은 [GitHub Issues](https://github.com/okos2580/-_-/issues)를 통해 제보해 주세요.

---

<div align="center">

**Made with ❤️ by 김태정**

</div>
