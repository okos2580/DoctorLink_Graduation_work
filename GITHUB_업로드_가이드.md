# 📤 GitHub 업로드 가이드

DoctorLink 프로젝트를 GitHub에 업로드하는 방법을 안내합니다.

---

## 📋 사전 체크리스트

업로드 전에 다음 사항을 확인하세요:

### ✅ 필수 파일 확인

- [x] **README.md** - 프로젝트 메인 설명서
- [x] **LICENSE** - MIT 라이센스
- [x] **.gitignore** - Git 제외 파일 목록
- [x] **docs/** - 졸업논문 및 문서
- [x] **DoctorLinkApp/README.md** - 모바일 앱 설명서
- [x] **doctorlink/README.md** - 웹 앱 설명서

### ⚠️ 민감 정보 제거 확인

업로드하기 전에 다음 파일들이 `.gitignore`에 포함되어 있는지 확인:

- [x] `.env` 파일 (환경 변수)
- [x] `node_modules/` 폴더
- [x] 데이터베이스 백업 파일 (*.bak)
- [x] API 키가 포함된 설정 파일

### 🖼️ 스크린샷 준비 (선택사항)

포트폴리오로 활용하려면 스크린샷을 추가하는 것을 권장합니다:

- [ ] `screenshots/web/` 폴더에 웹 화면 캡처
- [ ] `screenshots/mobile/` 폴더에 모바일 화면 캡처

스크린샷 가이드는 [screenshots/README.md](./screenshots/README.md) 참조

---

## 🚀 GitHub 업로드 방법

### 1️⃣ Git 초기화 (이미 완료된 경우 skip)

```bash
cd c:\Users\김태정\cusor_project

# Git 초기화 확인
git status

# Git이 초기화되지 않았다면
git init
```

### 2️⃣ 원격 저장소 연결

```bash
# 기존 remote 제거 (있는 경우)
git remote remove origin

# 새 remote 추가
git remote add origin https://github.com/okos2580/-_-.git

# remote 확인
git remote -v
```

### 3️⃣ 파일 추가 및 커밋

```bash
# 현재 상태 확인
git status

# 모든 파일 추가
git add .

# 또는 선택적으로 추가
git add README.md
git add LICENSE
git add .gitignore
git add docs/
git add DoctorLinkApp/
git add doctorlink/
git add screenshots/

# 커밋
git commit -m "Initial commit: DoctorLink 졸업 프로젝트 업로드

- 웹 애플리케이션 (React + Node.js/Express)
- 모바일 애플리케이션 (React Native + Expo)
- 졸업논문 문서 (마크다운)
- API 문서 및 데이터베이스 설계
- README 및 설정 파일"
```

### 4️⃣ GitHub에 푸시

```bash
# main 브랜치로 푸시
git branch -M main
git push -u origin main

# 또는 기존 브랜치 확인 후 푸시
git branch
git push origin <branch-name>
```

---

## 🔐 민감 정보 처리

### .env 파일 예시 추가

실제 `.env` 파일은 업로드하지 않고, `.env.example` 파일을 만들어 업로드하세요:

```bash
# doctorlink/.env.example 생성
cd doctorlink
cat > .env.example << EOF
# 데이터베이스 설정
DB_USER=sa
DB_PASSWORD=your_password_here
DB_SERVER=localhost
DB_NAME=DoctorLink
DB_ENCRYPT=false

# JWT 비밀키
JWT_SECRET=your_jwt_secret_key_minimum_32_characters

# 서버 설정
PORT=5000
NODE_ENV=development

# 카카오 API 키 (선택)
KAKAO_API_KEY=your_kakao_api_key
EOF

# Git에 추가
git add .env.example
git commit -m "Add .env.example for environment variables guide"
git push
```

---

## 📸 스크린샷 추가 (나중에)

스크린샷은 나중에 추가할 수 있습니다:

```bash
# 스크린샷 추가
cd screenshots/web
# 여기에 웹 스크린샷 복사

cd ../mobile
# 여기에 모바일 스크린샷 복사

# Git에 추가
git add screenshots/
git commit -m "Add project screenshots for portfolio"
git push
```

---

## 🏷️ GitHub 저장소 설정

GitHub 웹사이트에서 다음 설정을 권장합니다:

### Repository Settings

1. **About** 섹션 편집
   - Description: "의료 예약 통합 플랫폼 (웹 + 모바일) - 관동대학교 컴퓨터공학과 졸업 프로젝트"
   - Website: 배포된 URL (있는 경우)
   - Topics 추가:
     - `react`
     - `react-native`
     - `nodejs`
     - `typescript`
     - `healthcare`
     - `graduation-project`
     - `portfolio`
     - `expo`
     - `sql-server`

2. **README.md 확인**
   - GitHub에서 제대로 렌더링되는지 확인
   - 이미지 링크가 작동하는지 확인

3. **Issues 활성화**
   - Settings > Features > Issues 체크

4. **GitHub Pages** (선택사항)
   - 웹 프론트엔드를 GitHub Pages로 배포 가능
   - Settings > Pages > Source: gh-pages branch

---

## 📝 추가 커밋 메시지 예시

향후 업데이트 시 사용할 커밋 메시지 예시:

```bash
# 기능 추가
git commit -m "feat: 푸시 알림 기능 추가"

# 버그 수정
git commit -m "fix: 예약 시간 중복 검증 오류 수정"

# 문서 업데이트
git commit -m "docs: API 문서 업데이트"

# 스타일 변경
git commit -m "style: 홈 화면 UI 개선"

# 리팩토링
git commit -m "refactor: AuthContext 코드 정리"

# 테스트 추가
git commit -m "test: 예약 API 단위 테스트 추가"

# 스크린샷 추가
git commit -m "docs: 프로젝트 스크린샷 추가"
```

---

## 🔍 확인 사항

업로드 후 다음을 확인하세요:

### GitHub 웹사이트에서

- [ ] README.md가 제대로 표시되는지
- [ ] 이미지/뱃지가 표시되는지
- [ ] 폴더 구조가 올바른지
- [ ] .gitignore가 작동하는지 (node_modules, .env 등이 없는지)

### 로컬에서

```bash
# 저장소 복제 테스트 (다른 폴더에서)
cd c:\temp
git clone https://github.com/okos2580/-_-.git test-clone
cd test-clone

# README 확인
ls -la

# 의존성 설치 테스트
cd doctorlink
npm install

cd ../DoctorLinkApp
npm install
```

---

## 🎯 포트폴리오 활용 팁

### 1. GitHub Profile README에 추가

개인 GitHub 프로필 README에 이 프로젝트를 강조:

```markdown
## 🏥 주요 프로젝트

### [DoctorLink - 의료 예약 통합 플랫폼](https://github.com/okos2580/-_-)

웹과 모바일을 아우르는 의료 예약 시스템 (졸업 프로젝트)

- **기술 스택**: React, React Native, Node.js, TypeScript, SQL Server
- **주요 기능**: 병원 검색, 예약 관리, 진료 기록, GPS 기반 검색
- **역할**: 풀스택 개발 (프론트엔드, 백엔드, 데이터베이스)
```

### 2. LinkedIn에 프로젝트 추가

- 프로젝트 설명
- GitHub 링크
- 사용 기술
- 주요 성과

### 3. 포트폴리오 웹사이트에 포함

- 프로젝트 데모 영상 (선택)
- 스크린샷
- GitHub 링크
- 기술적 도전 과제 및 해결 방법

---

## 🆘 문제 해결

### 파일이 너무 클 때

```bash
# 100MB 이상 파일은 Git LFS 사용
git lfs install
git lfs track "*.psd"
git lfs track "*.zip"
git add .gitattributes
git commit -m "Add Git LFS for large files"
```

### .env 파일을 실수로 커밋한 경우

```bash
# 커밋 히스토리에서 제거
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 강제 푸시 (주의!)
git push origin --force --all
```

### node_modules가 업로드된 경우

```bash
# .gitignore에 추가
echo "node_modules/" >> .gitignore

# Git 캐시에서 제거
git rm -r --cached node_modules
git commit -m "Remove node_modules from repository"
git push
```

---

## ✅ 최종 체크리스트

업로드 완료 후:

- [ ] GitHub 저장소 확인
- [ ] README.md 정상 표시 확인
- [ ] 민감 정보 없는지 재확인
- [ ] Topics/Tags 추가
- [ ] About 섹션 작성
- [ ] 스크린샷 추가 (선택)
- [ ] LinkedIn/포트폴리오에 추가

---

## 🎉 완료!

축하합니다! DoctorLink 프로젝트가 GitHub에 성공적으로 업로드되었습니다.

이제 이 저장소를 포트폴리오로 활용하고, 취업 지원 시 프로젝트 링크로 공유할 수 있습니다.

---

**문제가 발생하면**:
- GitHub 문서: https://docs.github.com
- Git 가이드: https://git-scm.com/doc
- 추가 도움이 필요하면 이슈를 남겨주세요!

