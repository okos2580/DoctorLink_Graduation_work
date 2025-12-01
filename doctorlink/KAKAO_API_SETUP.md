# 카카오맵 API 설정 가이드

## 🔑 API 키 발급 방법

### 1. 카카오 개발자 콘솔 접속
- [https://developers.kakao.com](https://developers.kakao.com) 접속
- 카카오 계정으로 로그인

### 2. 애플리케이션 생성
1. **내 애플리케이션** 메뉴 선택
2. **애플리케이션 추가하기** 클릭
3. 앱 정보 입력:
   - 앱 이름: `DoctorLink`
   - 사업자명: `개인개발자` (또는 본인 이름)
4. **저장** 클릭

### 3. 플랫폼 설정
1. 생성된 앱 선택
2. **플랫폼** 탭 선택
3. **Web 플랫폼 등록** 클릭
4. 사이트 도메인 추가:
   - `http://localhost:3000`
   - `http://localhost:5000`
   - 배포 시 실제 도메인도 추가

### 4. API 키 확인
1. **앱 키** 탭 선택
2. 다음 키들을 복사:
   - **JavaScript 키**: 프론트엔드용
   - **REST API 키**: 백엔드용

### 5. 환경 변수 설정
프로젝트 루트에 `.env` 파일 생성:

```bash
# 카카오맵 API 키
REACT_APP_KAKAO_JS_API_KEY=여기에_JavaScript_키_입력
REACT_APP_KAKAO_REST_API_KEY=여기에_REST_API_키_입력
KAKAO_REST_API_KEY=여기에_REST_API_키_입력

# 개발 환경
NODE_ENV=development
```

### 6. 서비스 활성화
1. **제품 설정** → **카카오맵** 선택
2. **Web** 플랫폼 활성화
3. **저장** 클릭

## 🚨 주의사항

- API 키는 절대 공개 저장소에 커밋하지 마세요
- `.env` 파일은 `.gitignore`에 추가되어 있습니다
- 무료 할당량: 일 300,000회 호출 제한
- 상업적 사용 시 유료 플랜 고려 필요

## 🔧 현재 설정 확인

서버 실행 후 다음 URL로 API 상태 확인:
- 백엔드 서버: http://localhost:5000/api/ping
- 카카오맵 API: http://localhost:5000/api/kakao/search?query=병원

## 📞 문제 해결

API 키 관련 문제 발생 시:
1. 카카오 개발자 콘솔에서 키 상태 확인
2. 플랫폼 도메인 설정 확인
3. 할당량 사용량 확인
4. 서버 재시작 후 테스트



