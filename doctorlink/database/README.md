# DoctorLink 데이터베이스 설정 가이드

이 디렉토리에는 DoctorLink 애플리케이션에 필요한 SQL Server 데이터베이스를 설정하기 위한 스크립트가 포함되어 있습니다.

## 필요 조건

- SQL Server 2019 이상 설치
- SQL Server Management Studio (SSMS) 또는 Azure Data Studio

## 스크립트 파일

1. `create_database.sql`: 데이터베이스와 모든 테이블을 생성하는 스크립트
2. `create_stored_procedures.sql`: 필요한 모든 저장 프로시저를 생성하는 스크립트
3. `insert_sample_data.sql` (선택 사항): 샘플 데이터를 추가하는 스크립트

## SQL Server Management Studio(SSMS)에서 스크립트 실행하기

### 1. 데이터베이스 스키마 생성

1. SQL Server Management Studio를 엽니다.
2. SQL Server 인스턴스에 연결합니다.
3. **File** > **Open** > **File...** 메뉴를 선택합니다.
4. `create_database.sql` 파일을 찾아 엽니다.
5. **Execute** 버튼을 클릭하거나 F5 키를 눌러 스크립트를 실행합니다.
6. 정상적으로 생성되었는지 확인합니다. 메시지에 "데이터베이스 스키마가 성공적으로 생성되었습니다." 문구가 표시되어야 합니다.

### 2. 저장 프로시저 생성

1. 같은 방법으로 `create_stored_procedures.sql` 파일을 엽니다.
2. **Execute** 버튼을 클릭하거나 F5 키를 눌러 스크립트를 실행합니다.
3. 정상적으로 생성되었는지 확인합니다. 메시지에 "저장 프로시저가 성공적으로 생성되었습니다." 문구가 표시되어야 합니다.

### 3. 샘플 데이터 추가 (선택 사항)

1. 같은 방법으로 `insert_sample_data.sql` 파일을 엽니다.
2. **Execute** 버튼을 클릭하거나 F5 키를 눌러 스크립트를 실행합니다.
3. 정상적으로 추가되었는지 확인합니다.

## 배치 파일로 실행하기 (선택 사항)

Windows에서는 제공된 `run_scripts.bat` 배치 파일을 사용하여 스크립트를 자동으로 실행할 수도 있습니다. 이 방법을 사용하려면 SQL Server 명령줄 유틸리티(sqlcmd)가 시스템 경로에 설정되어 있어야 합니다.

1. 명령 프롬프트(cmd)를 관리자 권한으로 엽니다.
2. 이 디렉토리로 이동합니다.
3. `run_scripts.bat` 파일을 실행합니다.
4. 프롬프트에 따라 SQL Server 인스턴스 이름, 사용자 이름 및 비밀번호를 입력합니다.

## 문제 해결

- **오류: '데이터베이스 이미 존재' 또는 '개체 이미 존재'**: 이 스크립트는 데이터베이스나 테이블이 이미 존재하는 경우 오류를 발생시키지 않도록 설계되었습니다. 이미 존재하는 경우 건너뛰게 됩니다.
- **오류: '권한 거부'**: SQL Server에 충분한 권한이 있는 계정으로 로그인했는지 확인하세요.
- **오류: '구문 오류'**: 스크립트를 수정한 경우, 구문이 올바른지 확인하세요.

## 확인 방법

스크립트가 성공적으로 실행되었는지 확인하려면:

1. SSMS의 개체 탐색기에서 "DoctorLink" 데이터베이스를 확장합니다.
2. "Tables" 폴더를 확장하여 모든 테이블이 있는지 확인합니다.
3. "Programmability" > "Stored Procedures" 폴더를 확장하여 모든 저장 프로시저가 있는지 확인합니다.

## 데이터베이스 연결 설정

애플리케이션의 `.env` 파일을 통해 데이터베이스 연결 정보를 설정할 수 있습니다:

```
# 데이터베이스 설정
DB_USER=sa
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_NAME=DoctorLink
DB_ENCRYPT=false
```

## 사용자 인증 정보

샘플 데이터에 포함된 기본 사용자 계정:

| 역할 | 사용자 이름 | 비밀번호 |
|------|------------|-----------|
| 관리자 | admin | admin123 |
| 의사 | doctor1 | doctor123 |
| 의사 | doctor2 | doctor123 |
| 환자 | patient1 | patient123 |
| 환자 | patient2 | patient123 |

## 데이터베이스 설계

### 주요 테이블 구조

- `UserRoles` - 사용자 역할 정보
- `Users` - 사용자 계정 정보
- `Doctors` - 의사 정보
- `Hospitals` - 병원 정보
- `DoctorHospitals` - 의사-병원 관계
- `DoctorSchedules` - 의사 근무 일정
- `DoctorTimeOffs` - 의사 휴무일 정보
- `AppointmentStatuses` - 예약 상태 정보
- `Appointments` - 예약 정보
- `MedicalRecords` - 진료 기록
- `NotificationTypes` - 알림 유형
- `Notifications` - 사용자 알림

## 문제 해결

문제가 발생할 경우 다음을 확인하세요:

1. SQL Server가 실행 중인지 확인
2. 사용자 계정에 데이터베이스 생성 및 수정 권한이 있는지 확인
3. 네트워크 연결 및 방화벽 설정 확인
4. SQL Server 오류 로그 확인 