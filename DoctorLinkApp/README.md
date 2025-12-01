# 📱 DoctorLink Mobile App

> React Native + Expo 기반 의료 예약 모바일 애플리케이션

[![React Native](https://img.shields.io/badge/React_Native-0.74.5-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51.0.28-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 📖 개요

DoctorLink 모바일 앱은 환자가 언제 어디서나 쉽게 병원을 찾고 예약할 수 있도록 하는 크로스플랫폼 모바일 애플리케이션입니다.

### 주요 특징

- ✅ **Android & iOS 지원**: 하나의 코드베이스로 양쪽 플랫폼 지원
- 📍 **GPS 기반 병원 검색**: 현재 위치 주변 병원 자동 표시
- 🔔 **푸시 알림**: 예약 리마인더 및 중요 알림
- 🎨 **Material Design 3**: 현대적이고 직관적인 UI
- 🔐 **생체 인증**: 지문/Face ID 로그인 지원 (예정)

---

## 🚀 시작하기

### 필수 요구사항

- **Node.js** 18.x 이상
- **npm** 또는 **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **(Android 개발)** Android Studio
- **(iOS 개발)** Xcode (macOS만)

### 설치

1. **의존성 설치**
   ```bash
   cd DoctorLinkApp
   npm install
   ```

2. **환경 변수 설정**
   
   백엔드 서버 URL을 설정합니다 (`src/services/api.ts`):
   ```typescript
   const API_BASE_URL = 'http://localhost:5000/api'; // 개발 환경
   // const API_BASE_URL = 'https://your-api.com/api'; // 프로덕션
   ```

3. **Expo 개발 서버 실행**
   ```bash
   npx expo start
   ```

4. **앱 실행**
   
   - **Android**: `a` 키 누르기 또는 `npx expo run:android`
   - **iOS**: `i` 키 누르기 (macOS만) 또는 `npx expo run:ios`
   - **Expo Go**: QR 코드 스캔 (실제 기기에서 테스트)

---

## 📁 프로젝트 구조

```
DoctorLinkApp/
├── assets/                      # 이미지, 아이콘 등 정적 파일
│   ├── icon.png                 # 앱 아이콘
│   ├── splash-icon.png          # 스플래시 화면
│   └── adaptive-icon.png        # Android Adaptive Icon
│
├── src/
│   ├── screens/                 # 화면 컴포넌트 (44개)
│   │   ├── auth/                # 인증 화면 (2개)
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── main/                # 메인 화면 (1개)
│   │   │   └── HomeScreen.tsx
│   │   ├── hospital/            # 병원 화면 (2개)
│   │   │   ├── HospitalFinderScreen.tsx
│   │   │   └── HospitalDetailScreen.tsx
│   │   ├── reservation/         # 예약 화면 (3개)
│   │   │   ├── ReservationScreen.tsx
│   │   │   ├── ReservationManagementScreen.tsx
│   │   │   └── ReservationDetailScreen.tsx
│   │   ├── medical/             # 진료 기록 (2개)
│   │   │   ├── MedicalRecordsScreen.tsx
│   │   │   └── MedicalRecordDetailScreen.tsx
│   │   ├── profile/             # 프로필 (2개)
│   │   │   ├── MyPageScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── notification/        # 알림 (1개)
│   │   │   └── NotificationsScreen.tsx
│   │   ├── info/                # 정보 화면 (5개)
│   │   │   ├── AnnouncementScreen.tsx
│   │   │   ├── FAQScreen.tsx
│   │   │   ├── ContactScreen.tsx
│   │   │   ├── TermsScreen.tsx
│   │   │   └── PrivacyScreen.tsx
│   │   └── admin/               # 관리자 화면 (14개)
│   │       ├── AdminDashboardScreen.tsx
│   │       ├── UserManagementScreen.tsx
│   │       └── ...
│   │
│   ├── navigation/              # 네비게이션 설정
│   │   └── AppNavigator.tsx     # React Navigation 구성
│   │
│   ├── contexts/                # Context API
│   │   └── AuthContext.tsx      # 인증 상태 관리
│   │
│   ├── services/                # API 서비스
│   │   ├── api.ts               # Axios 인스턴스
│   │   ├── authService.ts       # 인증 API
│   │   ├── hospitalService.ts   # 병원 API
│   │   └── reservationService.ts # 예약 API
│   │
│   ├── components/              # 공통 컴포넌트
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Card.tsx
│   │
│   ├── styles/                  # 스타일 및 테마
│   │   └── theme.ts             # Material Design 3 테마
│   │
│   ├── types/                   # TypeScript 타입 정의
│   │   └── index.ts
│   │
│   └── utils/                   # 유틸리티 함수
│       └── errorHandler.ts
│
├── backend/                     # 백엔드 서버 (Node.js + Express)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── models/
│   └── package.json
│
├── App.tsx                      # 앱 진입점
├── app.json                     # Expo 설정
├── package.json                 # 프로젝트 의존성
├── tsconfig.json                # TypeScript 설정
└── README.md                    # 이 파일
```

---

## 🎨 주요 화면

### 🔐 인증 화면
- **로그인**: 이메일/비밀번호 로그인, 자동 로그인
- **회원가입**: 환자/의사 계정 생성

### 🏠 홈 화면
- 빠른 액션 버튼 (병원 찾기, 예약하기, 진료 기록, 응급실)
- 건강 팁 (스와이프 가능)
- 근처 병원 5개 표시 (GPS 기반)
- 최근 예약 2개 표시

### 🏥 병원 찾기
- GPS 기반 근처 병원 자동 표시
- 검색 (병원명, 주소, 진료과)
- 필터 (병원 유형, 진료과, 거리)
- 정렬 (거리순, 평점순, 이름순)

### 📅 예약하기
- **Step 1**: 의사 선택
- **Step 2**: 날짜 선택 (캘린더)
- **Step 3**: 시간 선택 (가능한 시간 슬롯)
- **Step 4**: 증상 입력

### 📋 진료 기록
- 진료 기록 목록 (최신순)
- 진단명, 치료 내용, 처방전
- 검색 기능
- 첨부 파일 (이미지 갤러리)

### 🔔 알림
- 예약 관련 알림
- 리마인더 (1일 전, 1시간 전)
- 시스템 공지
- 읽음/안읽음 표시

### 👤 마이페이지
- 프로필 정보 편집
- 의료 정보 관리 (혈액형, 알레르기 등)
- 설정 (알림, 보안, 언어)
- 고객 지원 메뉴

---

## 🛠 기술 스택

### 코어

| 기술 | 버전 | 용도 |
|------|------|------|
| React Native | 0.74.5 | 모바일 프레임워크 |
| Expo | 51.0.28 | 개발 도구 및 배포 |
| TypeScript | 5.1.3 | 타입 안정성 |

### UI/UX

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| React Native Paper | 5.12.3 | Material Design 3 컴포넌트 |
| React Navigation | 6.x | 화면 네비게이션 |
| React Native Safe Area Context | 4.10.5 | 안전 영역 처리 |
| React Native Vector Icons | 10.0.3 | 아이콘 |

### 기능

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| Expo Location | latest | GPS 위치 서비스 |
| Expo Notifications | latest | 푸시 알림 |
| Axios | 1.4.0 | HTTP 클라이언트 |
| AsyncStorage | latest | 로컬 저장소 |
| React Native DateTimePicker | latest | 날짜/시간 선택 |

---

## 📱 플랫폼별 기능

### Android

- Material Design 3 적용
- Adaptive Icon 지원
- 백 버튼 처리
- 권한 관리 (위치, 카메라, 알림)

### iOS

- iOS 디자인 가이드라인 준수
- Face ID / Touch ID 지원 (예정)
- 안전 영역 (Safe Area) 자동 처리
- Apple Push Notification Service (예정)

---

## 🔧 개발 도구

### 디버깅

```bash
# Expo DevTools
npx expo start --dev-client

# React Native Debugger
npm install -g react-native-debugger
```

### 로그 확인

```bash
# Android 로그
npx react-native log-android

# iOS 로그
npx react-native log-ios
```

---

## 📦 빌드

### Android APK

```bash
# Expo 빌드
eas build --platform android --profile preview

# 또는 로컬 빌드
npx expo run:android --variant release
```

### iOS IPA

```bash
# Expo 빌드 (macOS 필요)
eas build --platform ios --profile preview

# 또는 로컬 빌드
npx expo run:ios --configuration Release
```

---

## 🧪 테스트

### 단위 테스트

```bash
npm test
```

### E2E 테스트

```bash
# Detox 설정 필요
npm run test:e2e
```

---

## 🚢 배포

### Google Play Store

1. EAS Build로 AAB 생성
2. Google Play Console에 업로드
3. 스토어 등록 정보 작성
4. 베타 테스트 → 프로덕션 릴리스

### Apple App Store

1. EAS Build로 IPA 생성
2. App Store Connect에 업로드
3. TestFlight 베타 테스트
4. App Store 심사 제출

---

## 🔐 환경 변수

개발/프로덕션 환경에 따라 API URL을 변경해야 합니다:

```typescript
// src/services/api.ts
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:5000/api'  // Android Emulator
  : 'https://api.doctorlink.com/api'; // Production
```

---

## 📝 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다. 자세한 내용은 [LICENSE](../LICENSE) 파일을 참조하세요.

---

## 🔗 관련 링크

- [프로젝트 메인 README](../README.md)
- [웹 프로젝트](../doctorlink/README.md)
- [백엔드 API 문서](../docs/API_문서.md)
- [졸업논문](../docs/README.md)

---

## 🙏 기여

이슈나 개선 사항은 [GitHub Issues](https://github.com/okos2580/-_-/issues)를 통해 제보해 주세요.

---

<div align="center">

**Made with ❤️ by 김태정**

</div>

