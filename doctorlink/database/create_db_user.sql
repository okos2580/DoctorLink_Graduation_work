USE [master]
GO

-- 만약 이미 로그인이 있다면 삭제
IF EXISTS (SELECT * FROM sys.server_principals WHERE name = 'doctorlink_app')
BEGIN
    DROP LOGIN [doctorlink_app]
END
GO

-- 로그인 생성
CREATE LOGIN [doctorlink_app] WITH PASSWORD = 'DoctorLink123!', DEFAULT_DATABASE = [DoctorLink]
GO

-- DoctorLink 데이터베이스 전환
USE [DoctorLink]
GO

-- 만약 이미 사용자가 있다면 삭제
IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'doctorlink_app')
BEGIN
    DROP USER [doctorlink_app]
END
GO

-- 사용자 생성
CREATE USER [doctorlink_app] FOR LOGIN [doctorlink_app]
GO

-- 필요한 권한 부여
EXEC sp_addrolemember 'db_datareader', 'doctorlink_app'
GO
EXEC sp_addrolemember 'db_datawriter', 'doctorlink_app'
GO

-- 저장 프로시저 실행 권한 부여
GRANT EXECUTE TO [doctorlink_app]
GO

PRINT '데이터베이스 사용자 doctorlink_app이 성공적으로 생성되었습니다.'
GO 