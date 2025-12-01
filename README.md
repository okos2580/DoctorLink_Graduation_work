# 🏥 DoctorLink - 의료 예약 통합 플랫폼

> **컴퓨터공학과 졸업 프로젝트 (2025)**  
> 환자와 의료진을 연결하는 웹/모바일 통합 의료 예약 시스템

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.74.5-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-2019-CC2927?style=flat-square&logo=microsoft-sql-server&logoColor=white)](https://www.microsoft.com/sql-server)

---

## 📑 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [프로젝트 구조](#-프로젝트-구조)
- [설치 및 실행](#-설치-및-실행)
- [스크린샷](#-스크린샷)
- [졸업논문](#-졸업논문)
- [개발자](#-개발자)
- [라이센스](#-라이센스)

---

## 📖 프로젝트 소개

**DoctorLink**는 현대 사회의 의료 서비스 접근성 문제를 해결하기 위해 개발된 **크로스플랫폼 의료 예약 시스템**입니다. 

### 개발 배경

- **병원 예약의 불편함**: 전화 예약, 긴 대기 시간, 복잡한 절차
- **의료 정보 분산**: 병원마다 다른 시스템, 진료 기록 관리의 어려움
- **디지털 전환 필요성**: 코로나19 이후 비대면 의료 서비스 수요 증가

### 프로젝트 목표

1. **사용자 친화적 인터페이스**: 직관적이고 쉬운 병원 예약
2. **통합 의료 정보 관리**: 한 곳에서 모든 진료 기록 관리
3. **크로스플랫폼 지원**: 웹과 모바일에서 동일한 경험 제공
4. **확장 가능한 아키텍처**: 향후 기능 추가 용이

---

## ✨ 주요 기능

### 🔐 사용자 인증 및 권한 관리
- JWT 기반 안전한 로그인/회원가입
- 역할 기반 접근 제어 (환자/의사/관리자)
- 생체 인증 지원 (모바일)

### 🏥 병원 및 의사 검색
- **GPS 기반 근처 병원 찾기**
- 진료과, 병원 유형별 필터링
- 카카오맵 API 연동으로 위치 확인 및 길찾기
- 의사 프로필 및 경력 정보 제공

### 📅 예약 관리
- **실시간 예약 가능 시간 확인**
- 다단계 예약 프로세스 (의사 선택 → 날짜 → 시간 → 증상 입력)
- 예약 수정/취소 기능 (예약 시간 1시간 전까지)
- 예약 현황 및 이력 조회

### 📋 진료 기록 관리
- 진단명, 치료 내용, 처방전 통합 관리
- 검색 및 필터링 기능
- 의료 기록 조회 및 인쇄

### 🔔 알림 시스템
- 예약 확인 알림
- 예약 1일 전/1시간 전 리마인더
- 시스템 공지사항
- 푸시 알림 (모바일)

### ⭐ 리뷰 시스템
- 병원 및 의사 평가
- 별점 및 후기 작성
- 평균 평점 자동 계산

### 👨‍💼 관리자 기능
- 통계 대시보드 (사용자, 예약, 병원 현황)
- 사용자 관리
- 병원 및 의사 관리
- 예약 관리 및 상태 변경
- 문의 관리 및 답변
- 공지사항/FAQ 관리

### 🆘 고객 지원
- 1:1 문의하기
- FAQ (자주 묻는 질문)
- 공지사항
- 앱 소개

---

## 🛠 기술 스택

### 프론트엔드

#### 웹 (doctorlink)
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18.2.0 | UI 라이브러리 |
| TypeScript | 5.1.3 | 타입 안정성 |
| React Router DOM | 6.14.2 | 라우팅 |
| Styled Components | 6.0.7 | CSS-in-JS 스타일링 |
| Axios | 1.4.0 | HTTP 클라이언트 |
| Kakao Maps API | - | 지도 서비스 |

#### 모바일 (DoctorLinkApp)
| 기술 | 버전 | 용도 |
|------|------|------|
| React Native | 0.74.5 | 모바일 프레임워크 |
| Expo | 51.0.28 | 개발 도구 |
| TypeScript | 5.1.3 | 타입 안정성 |
| React Navigation | 6.x | 네비게이션 |
| React Native Paper | 5.12.3 | Material Design UI |
| Expo Location | - | GPS 위치 서비스 |

### 백엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| Node.js | 18.x | 런타임 환경 |
| Express.js | 4.18.2 | 웹 프레임워크 |
| TypeScript | 5.1.3 | 타입 안정성 |
| JWT | 9.0.2 | 인증 토큰 |
| bcrypt | 5.1.0 | 비밀번호 해싱 |
| MSSQL | 9.1.1 | SQL Server 드라이버 |

### 데이터베이스

| 기술 | 버전 | 용도 |
|------|------|------|
| Microsoft SQL Server | 2019 | 관계형 데이터베이스 |
| SQL Server Management Studio | - | DB 관리 도구 |

### 개발 도구

- **버전 관리**: Git, GitHub
- **코드 에디터**: Cursor IDE, Visual Studio Code
- **API 테스트**: Postman
- **디자인**: Figma (UI/UX 설계)

---

## 🏗 시스템 아키텍처

### 전체 시스템 구성도

```
┌──────────────────────────────────────────────────────────┐
│                     클라이언트 계층                        │
├─────────────────┬────────────────┬──────────────────────┤
│   웹 브라우저    │  Android 앱     │    iOS 앱            │
│   (React SPA)   │ (React Native) │  (React Native)      │
└─────────────────┴────────────────┴──────────────────────┘
           │                │                │
           └────────────────┼────────────────┘
                            │
                    HTTPS / REST API
                            │
┌───────────────────────────▼───────────────────────────────┐
│                    애플리케이션 계층                        │
│           Node.js + Express.js (Port: 5000)              │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Routes → Controllers → Services → Models          │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────────┬───────────────────────────────┘
                            │
                    SQL Queries (TCP/IP)
                            │
┌───────────────────────────▼───────────────────────────────┐
│                      데이터 계층                           │
│       Microsoft SQL Server 2019 (Port: 1433)             │
│  Database: DoctorLink                                    │
│  - Users, Hospitals, Doctors, Appointments               │
│  - MedicalRecords, Reviews, Notifications, Inquiries     │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│                    외부 서비스 계층                        │
├─────────────────┬────────────────┬──────────────────────┤
│  카카오맵 API    │  FCM (푸시알림)  │   SMTP (이메일)      │
│  (지도/길찾기)   │  (예정)         │   (예정)             │
└─────────────────┴────────────────┴──────────────────────┘
```

### 3-Tier 아키텍처

- **Presentation Tier**: React (웹), React Native (모바일)
- **Application Tier**: Node.js + Express.js (RESTful API)
- **Data Tier**: Microsoft SQL Server

---

## 📁 프로젝트 구조

```
cusor_project/
│
├── 📱 DoctorLinkApp/                 # 모바일 애플리케이션 (React Native + Expo)
│   ├── src/
│   │   ├── screens/                 # 화면 컴포넌트 (44개)
│   │   │   ├── auth/                # 인증 (로그인, 회원가입)
│   │   │   ├── main/                # 메인 (홈)
│   │   │   ├── hospital/            # 병원 (검색, 상세)
│   │   │   ├── reservation/         # 예약 (생성, 관리)
│   │   │   ├── medical/             # 진료 기록
│   │   │   ├── profile/             # 프로필 (마이페이지)
│   │   │   ├── notification/        # 알림
│   │   │   ├── info/                # 정보 (공지, FAQ, 문의)
│   │   │   └── admin/               # 관리자 (14개 화면)
│   │   ├── navigation/              # 네비게이션 설정
│   │   ├── contexts/                # Context API
│   │   ├── services/                # API 서비스
│   │   ├── components/              # 공통 컴포넌트
│   │   └── types/                   # TypeScript 타입
│   ├── backend/                     # 백엔드 서버 (Node.js + Express)
│   ├── app.json                     # Expo 설정
│   └── package.json
│
├── 🌐 doctorlink/                    # 웹 애플리케이션 (React SPA)
│   ├── src/
│   │   ├── pages/                   # 페이지 컴포넌트 (25개)
│   │   ├── components/              # 재사용 컴포넌트 (30개 이상)
│   │   │   ├── common/              # 공통 컴포넌트
│   │   │   └── layout/              # 레이아웃 (Header, Footer)
│   │   ├── context/                 # Context API
│   │   ├── services/                # API 서비스 (8개)
│   │   ├── styles/                  # 전역 스타일
│   │   └── server/                  # 백엔드 서버
│   │       ├── db/                  # DB 연결
│   │       ├── middleware/          # 미들웨어 (JWT 인증 등)
│   │       └── routes/api/          # API 라우터 (8개)
│   ├── database/                    # 데이터베이스 스크립트
│   │   ├── create_database.sql      # DB 및 테이블 생성
│   │   ├── create_stored_procedures.sql  # 저장 프로시저
│   │   ├── insert_sample_data.sql   # 샘플 데이터
│   │   └── README.md                # DB 설치 가이드
│   ├── public/                      # 정적 파일
│   ├── build/                       # 프로덕션 빌드
│   └── package.json
│
├── 📄 docs/                          # 문서 폴더
│   ├── 졸업논문_통합본.md             # 전체 졸업논문 (마크다운)
│   ├── 섹션1_서론.md
│   ├── 섹션2_요구분석.md
│   ├── 섹션3_소프트웨어설계.md
│   ├── 섹션4_매뉴얼.md
│   ├── 섹션5_부록및결론.md
│   ├── API_문서.md                  # API 상세 문서
│   ├── 데이터베이스_설계.md          # ERD 및 테이블 설계
│   └── 사용자_가이드.md              # 사용자 매뉴얼
│
├── 🖼️ screenshots/                  # 스크린샷 (추후 추가 예정)
│   ├── web/                         # 웹 화면
│   └── mobile/                      # 모바일 화면
│
├── .gitignore                       # Git 제외 파일
├── LICENSE                          # 라이센스
└── README.md                        # 이 파일
```

---

## 🚀 설치 및 실행

### 필수 요구사항

- **Node.js** 18.x 이상
- **Microsoft SQL Server** 2019 이상
- **npm** 또는 **yarn**
- **(모바일 개발 시)** Android Studio 또는 Xcode

### 1️⃣ 저장소 클론

```bash
git clone https://github.com/okos2580/-_-.git
cd -_-
```

### 2️⃣ 데이터베이스 설정

1. SQL Server Management Studio (SSMS) 실행
2. `doctorlink/database/` 폴더의 스크립트를 순서대로 실행:
   ```sql
   -- 1. 데이터베이스 생성
   create_database.sql
   
   -- 2. 저장 프로시저 생성
   create_stored_procedures.sql
   
   -- 3. 샘플 데이터 삽입
   insert_sample_data.sql
   ```

자세한 가이드는 [database/README.md](./doctorlink/database/README.md) 참조

### 3️⃣ 웹 애플리케이션 실행

```bash
cd doctorlink

# 의존성 설치
npm install

# 환경 변수 설정 (.env 파일 생성)
# DB_USER=sa
# DB_PASSWORD=your_password
# DB_SERVER=localhost
# DB_NAME=DoctorLink
# JWT_SECRET=your_secret_key
# PORT=5000

# 개발 모드 실행 (프론트엔드 + 백엔드)
npm run dev
```

- 웹: http://localhost:3000
- API: http://localhost:5000

### 4️⃣ 모바일 애플리케이션 실행

```bash
cd DoctorLinkApp

# 의존성 설치
npm install

# Expo 개발 서버 실행
npx expo start

# Android 실행
npx expo run:android

# iOS 실행 (macOS만 가능)
npx expo run:ios
```

### 5️⃣ 백엔드 서버만 실행 (선택사항)

```bash
cd DoctorLinkApp/backend

# 의존성 설치
npm install

# TypeScript 빌드 및 실행
npm run build
npm start

# 또는 개발 모드
npm run dev
```

---

## 📸 스크린샷

### 웹 애플리케이션

> ⚠️ 스크린샷 이미지는 `screenshots/web/` 폴더에 추가 예정

| 홈 화면 | 병원 검색 | 예약하기 |
|---------|----------|---------|
| ![홈](screenshots/web/home.png) | ![검색](screenshots/web/search.png) | ![예약](screenshots/web/reservation.png) |

### 모바일 애플리케이션

> ⚠️ 스크린샷 이미지는 `screenshots/mobile/` 폴더에 추가 예정

| 로그인 | 홈 화면 | 예약 관리 |
|--------|---------|----------|
| ![로그인](screenshots/mobile/login.png) | ![홈](screenshots/mobile/home.png) | ![예약](screenshots/mobile/reservations.png) |

---

## 📚 졸업논문

본 프로젝트는 **컴퓨터공학과 졸업 논문**의 일부로 개발되었습니다.

### 논문 구성

1. **I. 서론** (13KB, 339줄)
   - 개발 배경 및 목적
   - 한계점 및 진행 방향
   - 전공 이론
   - 개발 도구 및 기능
   - 수행 일정

2. **II. 요구분석** (12KB, 322줄)
   - 용어 정의
   - 시스템 개요
   - 기능 분석 (웹/모바일)
   - 참고문헌

3. **III. 소프트웨어 설계서** (31KB, 707줄)
   - 시스템 아키텍처 (3-Tier, 마이크로서비스)
   - 데이터베이스 설계 (ERD, 테이블, 저장 프로시저)
   - API 설계 (RESTful, JWT 인증)
   - UI/UX 설계

4. **IV. 매뉴얼** (23KB, 870줄)
   - 시스템 요구사항
   - 웹 애플리케이션 사용 가이드
   - 모바일 애플리케이션 사용 가이드
   - 관리자 기능 가이드
   - 문제 해결 (Troubleshooting)

5. **V. 유지보수** 및 **VI. 부록** (27KB, 902줄)
   - 소스코드 목록
   - 객체지향 프로그래밍 개념
   - Android/iOS 플랫폼
   - API 및 외부 서비스
   - 참고문헌

6. **VII. 결론**
   - 프로젝트 성과 및 의의
   - 한계점 및 개선 방안
   - 기대 효과

### 논문 문서

- **전체 논문**: [docs/졸업논문_통합본.md](./docs/졸업논문_통합본.md)
- **원본 HWP**: [졸업논문.hwp](./DoctorLinkApp/졸업논문.hwp)
- **섹션별 문서**: [docs/](./docs/) 폴더 참조

**총 분량**: 약 **60~70 페이지** (A4 기준), **15,000 라인** 코드

---

## 📊 주요 통계

| 구분 | 웹 | 모바일 | 백엔드 | 합계 |
|------|-----|--------|--------|------|
| **화면/페이지** | 25개 | 44개 | - | 69개 |
| **컴포넌트** | 30개+ | 20개+ | - | 50개+ |
| **API 엔드포인트** | - | - | 20개+ | 20개+ |
| **DB 테이블** | - | - | 8개 | 8개 |
| **코드 라인 수** | ~6,000 | ~7,000 | ~2,000 | ~15,000 |

---

## 👨‍💻 개발자

- **이름**: 김태정
- **학과**: 컴퓨터공학과 4학년
- **학교**: 서원대학교
- **개발 기간**: 2024.11 ~ 2025.11 (12개월)
- **GitHub**: [@okos2580](https://github.com/okos2580)
- **이메일**: [kottang6@gmail.com](mailto:your-email@example.com)

### 개발 역할

- **풀스택 개발**: 웹/모바일 프론트엔드, 백엔드 API, 데이터베이스 설계
- **UI/UX 디자인**: 사용자 인터페이스 및 경험 설계
- **시스템 아키텍처**: 3-Tier 구조 설계 및 구현
- **프로젝트 관리**: 일정 관리, 버전 관리

---

## 🔑 주요 기술적 성과

### 1. 크로스플랫폼 개발
- React와 React Native의 코드 재사용성 극대화
- 동일한 API를 사용하여 웹/모바일 통합 관리

### 2. 확장 가능한 아키텍처
- 계층형 구조 (Presentation - Business - Data)
- RESTful API 설계 원칙 준수
- JWT 기반 인증으로 보안성 확보

### 3. 사용자 중심 설계
- 직관적인 UI/UX
- GPS 기반 병원 검색
- 실시간 예약 시스템

### 4. 데이터베이스 최적화
- 정규화를 통한 데이터 무결성 확보
- 저장 프로시저로 복잡한 로직 처리
- 인덱싱을 통한 쿼리 성능 향상

---

## 🛣 향후 개선 계획

### 단기 계획
- [ ] Firebase Cloud Messaging (FCM) 푸시 알림 연동
- [ ] 결제 시스템 연동 (카카오페이, 토스페이먼츠)
- [ ] 실시간 채팅 기능 (의사-환자 상담)
- [ ] 다국어 지원 (영어, 중국어)

### 중기 계획
- [ ] AWS/Azure 클라우드 배포
- [ ] CI/CD 파이프라인 구축
- [ ] 자동화 테스트 (Jest, React Testing Library)
- [ ] 성능 모니터링 (Sentry, Google Analytics)

### 장기 계획
- [ ] AI 기반 증상 분석 및 병원 추천
- [ ] 블록체인 기반 의료 기록 무결성 보장
- [ ] 웨어러블 디바이스 연동 (Apple Watch, Galaxy Watch)
- [ ] 원격 진료 시스템

---

## 📄 라이센스

이 프로젝트는 **MIT License** 하에 배포됩니다.

```
MIT License

Copyright (c) 2025 김태정

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 감사의 말

이 프로젝트를 완성하기까지 도움을 주신 모든 분들께 감사드립니다.

- **지도 교수님**: 프로젝트 방향 설정 및 피드백
- **학과 동료들**: 테스트 및 피드백 제공
- **오픈소스 커뮤니티**: React, Node.js, Expo 생태계

---

## 📞 문의

프로젝트에 관한 문의나 제안은 다음을 통해 연락해 주세요:

- **GitHub Issues**: [이슈 등록](https://github.com/okos2580/-_-/issues)
- **Email**: your-email@example.com
- **LinkedIn**: [프로필 링크](https://linkedin.com/in/your-profile)

---

<div align="center">

### ⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요! ⭐

**Made with ❤️ by 김태정**

[🔝 맨 위로 가기](#-doctorlink---의료-예약-통합-플랫폼)

</div>

