@echo off
echo DoctorLink 데이터베이스 스크립트 실행
echo ====================================

REM 현재 디렉토리 확인
echo 현재 디렉토리: %CD%

REM SQL Server 인증 정보 입력
set /p server="SQL Server 인스턴스 이름 입력 (기본값: localhost): " || set server=localhost
set /p username="SQL Server 사용자 이름 입력 (기본값: sa): " || set username=sa
set /p password="SQL Server 비밀번호 입력: "

echo.
echo 데이터베이스 스키마 생성 중...
sqlcmd -S %server% -U %username% -P %password% -i create_database.sql
if %ERRORLEVEL% neq 0 (
    echo 데이터베이스 스키마 생성 중 오류가 발생했습니다.
    exit /b %ERRORLEVEL%
)

echo.
echo 저장 프로시저 생성 중...
sqlcmd -S %server% -U %username% -P %password% -i create_stored_procedures.sql
if %ERRORLEVEL% neq 0 (
    echo 저장 프로시저 생성 중 오류가 발생했습니다.
    exit /b %ERRORLEVEL%
)

echo.
echo 모든 스크립트가 성공적으로 실행되었습니다!
echo DoctorLink 데이터베이스가 준비되었습니다.
pause 