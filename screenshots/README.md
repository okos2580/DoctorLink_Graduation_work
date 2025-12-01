# 📸 DoctorLink 스크린샷

이 폴더에는 DoctorLink 프로젝트의 스크린샷이 저장됩니다.

## 📁 폴더 구조

```
screenshots/
├── web/                 # 웹 애플리케이션 스크린샷
│   ├── README.md
│   ├── home.png
│   ├── login.png
│   ├── hospital-search.png
│   ├── hospital-detail.png
│   ├── reservation.png
│   ├── reservations-list.png
│   ├── medical-records.png
│   ├── profile.png
│   └── admin-dashboard.png
│
└── mobile/              # 모바일 애플리케이션 스크린샷
    ├── README.md
    ├── splash.png
    ├── login.png
    ├── home.png
    ├── hospital-finder.png
    ├── hospital-detail.png
    ├── reservation-step1.png
    ├── reservation-step2.png
    ├── reservation-step3.png
    ├── reservations-list.png
    ├── medical-records.png
    ├── notifications.png
    └── mypage.png
```

## 📝 스크린샷 가이드

### 웹 애플리케이션 (권장 해상도: 1920x1080)

캡처해야 할 주요 화면:

1. **홈 화면** (`home.png`)
   - 메인 대시보드
   - 빠른 액션 버튼
   - 최근 예약 정보

2. **로그인** (`login.png`)
   - 로그인 폼
   - 회원가입 링크

3. **병원 검색** (`hospital-search.png`)
   - 검색 결과 목록
   - 필터 옵션

4. **병원 상세** (`hospital-detail.png`)
   - 병원 정보
   - 의사 목록
   - 카카오맵

5. **예약하기** (`reservation.png`)
   - 예약 폼
   - 날짜/시간 선택

6. **예약 관리** (`reservations-list.png`)
   - 예약 목록
   - 상태 필터

7. **진료 기록** (`medical-records.png`)
   - 진료 기록 목록
   - 상세 정보

8. **프로필** (`profile.png`)
   - 사용자 정보
   - 설정 옵션

9. **관리자 대시보드** (`admin-dashboard.png`)
   - 통계 정보
   - 관리 메뉴

### 모바일 애플리케이션 (권장 해상도: 375x812 또는 실제 기기)

캡처해야 할 주요 화면:

1. **스플래시** (`splash.png`)
   - 앱 로딩 화면

2. **로그인** (`login.png`)
   - 로그인 폼
   - 생체 인증 버튼

3. **홈 화면** (`home.png`)
   - 빠른 액션
   - 근처 병원
   - 최근 예약

4. **병원 찾기** (`hospital-finder.png`)
   - 검색 화면
   - GPS 기반 목록

5. **병원 상세** (`hospital-detail.png`)
   - 병원 정보
   - 액션 버튼

6. **예약 단계** (`reservation-step1.png`, `step2.png`, `step3.png`)
   - 의사 선택
   - 날짜/시간 선택
   - 증상 입력

7. **예약 관리** (`reservations-list.png`)
   - 예약 목록
   - 탭 필터

8. **진료 기록** (`medical-records.png`)
   - 진료 기록 카드
   - 검색 기능

9. **알림** (`notifications.png`)
   - 알림 목록
   - 읽음/안읽음 표시

10. **마이페이지** (`mypage.png`)
    - 프로필 정보
    - 설정 메뉴

## 🎨 스크린샷 캡처 방법

### 웹 (Chrome DevTools)

1. Chrome 브라우저에서 앱 실행
2. F12 키로 개발자 도구 열기
3. Toggle device toolbar (Ctrl + Shift + M)
4. 해상도 선택 (1920x1080)
5. Ctrl + Shift + P → "Capture full size screenshot"

### 모바일 (Android)

1. 앱 실행
2. 전원 + 볼륨 다운 버튼 동시 누르기
3. 또는 Expo 개발 앱에서 스크린샷

### 모바일 (iOS)

1. 앱 실행
2. 사이드 버튼 + 볼륨 업 버튼 동시 누르기

## 📐 이미지 요구사항

- **파일 형식**: PNG (투명도 지원)
- **파일명**: 소문자-하이픈 형식 (예: `hospital-search.png`)
- **최대 파일 크기**: 2MB 이하
- **배경**: 실제 화면 그대로 또는 흰색 배경

## 🔄 스크린샷 업데이트

기능 변경이나 UI 업데이트 시 스크린샷도 함께 업데이트해야 합니다.

---

**참고**: 현재 폴더는 비어있습니다. 위 가이드를 참고하여 스크린샷을 추가해 주세요.

