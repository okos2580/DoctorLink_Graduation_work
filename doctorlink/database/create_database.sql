-- 데이터베이스 생성 (존재하지 않는 경우)
IF NOT EXISTS (SELECT name FROM master.dbo.sysdatabases WHERE name = 'DoctorLink')
BEGIN
    CREATE DATABASE DoctorLink;
END
GO

USE [DoctorLink]
GO

-- 사용자 역할 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserRoles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[UserRoles] (
        [RoleID] INT IDENTITY(1,1) PRIMARY KEY,
        [RoleName] NVARCHAR(50) NOT NULL,
        [Description] NVARCHAR(255) NULL
    );
END
GO

-- 사용자 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [UserID] INT IDENTITY(1,1) PRIMARY KEY,
        [Username] NVARCHAR(50) NOT NULL UNIQUE,
        [Email] NVARCHAR(100) NOT NULL UNIQUE,
        [Password] VARBINARY(256) NOT NULL,
        [FirstName] NVARCHAR(50) NOT NULL,
        [LastName] NVARCHAR(50) NOT NULL,
        [PhoneNumber] NVARCHAR(20) NULL,
        [DateOfBirth] DATE NULL,
        [Gender] NCHAR(1) NULL CHECK (Gender IN ('M', 'F', 'O')),
        [Address] NVARCHAR(255) NULL,
        [RoleID] INT NOT NULL FOREIGN KEY REFERENCES UserRoles(RoleID),
        [ProfileImage] NVARCHAR(255) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [LastLogin] DATETIME NULL
    );
END
GO

-- 환자 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Patients]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Patients] (
        [PatientID] INT IDENTITY(1,1) PRIMARY KEY,
        [UserID] INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
        [BloodType] NVARCHAR(10) NULL,
        [Height] DECIMAL(5, 2) NULL,
        [Weight] DECIMAL(5, 2) NULL,
        [EmergencyContactName] NVARCHAR(100) NULL,
        [EmergencyContactPhone] NVARCHAR(20) NULL,
        [InsuranceProvider] NVARCHAR(100) NULL,
        [InsuranceNumber] NVARCHAR(50) NULL,
        [MedicalHistory] NVARCHAR(MAX) NULL,
        [Allergies] NVARCHAR(MAX) NULL,
        [ChronicConditions] NVARCHAR(MAX) NULL,
        [CurrentMedications] NVARCHAR(MAX) NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 환자 알레르기 테이블 (세부 알레르기 정보 관리)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PatientAllergies]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PatientAllergies] (
        [AllergyID] INT IDENTITY(1,1) PRIMARY KEY,
        [PatientID] INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
        [AllergyName] NVARCHAR(100) NOT NULL,
        [AllergyType] NVARCHAR(50) NULL, -- 약물, 음식, 환경 등
        [Severity] NVARCHAR(20) NULL, -- 경미, 중간, 심각 등
        [Reaction] NVARCHAR(255) NULL, -- 알레르기 반응 설명
        [DiagnosedDate] DATE NULL,
        [Notes] NVARCHAR(MAX) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 환자 복용 약물 테이블 (환자가 현재 복용 중인 약물 정보)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PatientMedications]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PatientMedications] (
        [PatientMedicationID] INT IDENTITY(1,1) PRIMARY KEY,
        [PatientID] INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
        [MedicationName] NVARCHAR(100) NOT NULL,
        [Dosage] NVARCHAR(50) NOT NULL,
        [Frequency] NVARCHAR(50) NOT NULL,
        [StartDate] DATE NOT NULL,
        [EndDate] DATE NULL,
        [Purpose] NVARCHAR(255) NULL,
        [PrescribedBy] NVARCHAR(100) NULL, -- 처방한 의사 또는 병원
        [Notes] NVARCHAR(MAX) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 환자 가족 구성원 테이블 (가족 의료 이력 등 관리)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PatientFamilyMembers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PatientFamilyMembers] (
        [FamilyMemberID] INT IDENTITY(1,1) PRIMARY KEY,
        [PatientID] INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
        [Relationship] NVARCHAR(50) NOT NULL, -- 부모, 자녀, 형제 등
        [FirstName] NVARCHAR(50) NOT NULL,
        [LastName] NVARCHAR(50) NOT NULL,
        [DateOfBirth] DATE NULL,
        [Gender] NCHAR(1) NULL CHECK (Gender IN ('M', 'F', 'O')),
        [PhoneNumber] NVARCHAR(20) NULL,
        [IsEmergencyContact] BIT NOT NULL DEFAULT 0,
        [MedicalConditions] NVARCHAR(MAX) NULL, -- 가족력에 중요한 의료 상태
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 환자 건강 기록 추적 테이블 (정기 검진 결과 등)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PatientHealthMetrics]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PatientHealthMetrics] (
        [MetricID] INT IDENTITY(1,1) PRIMARY KEY,
        [PatientID] INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
        [RecordDate] DATE NOT NULL,
        [Weight] DECIMAL(5, 2) NULL, -- kg
        [Height] DECIMAL(5, 2) NULL, -- cm
        [BMI] DECIMAL(5, 2) NULL,
        [BloodPressureSystolic] INT NULL,
        [BloodPressureDiastolic] INT NULL,
        [HeartRate] INT NULL,
        [BloodSugar] DECIMAL(5, 2) NULL,
        [Cholesterol] DECIMAL(5, 2) NULL,
        [Temperature] DECIMAL(5, 2) NULL,
        [Notes] NVARCHAR(MAX) NULL,
        [RecordedBy] INT NULL FOREIGN KEY REFERENCES Doctors(DoctorID),
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 의사 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Doctors]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Doctors] (
        [DoctorID] INT IDENTITY(1,1) PRIMARY KEY,
        [UserID] INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
        [LicenseNumber] NVARCHAR(50) NOT NULL,
        [Specialization] NVARCHAR(100) NOT NULL,
        [Biography] NVARCHAR(MAX) NULL,
        [EducationBackground] NVARCHAR(MAX) NULL,
        [Experience] INT NULL,
        [Rating] FLOAT NULL,
        [ConsultationFee] DECIMAL(10, 2) NULL
    );
END
GO

-- 병원 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Hospitals]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Hospitals] (
        [HospitalID] INT IDENTITY(1,1) PRIMARY KEY,
        [Name] NVARCHAR(100) NOT NULL,
        [Address] NVARCHAR(255) NOT NULL,
        [City] NVARCHAR(50) NOT NULL,
        [State] NVARCHAR(50) NULL,
        [ZipCode] NVARCHAR(20) NULL,
        [PhoneNumber] NVARCHAR(20) NOT NULL,
        [Email] NVARCHAR(100) NULL,
        [Website] NVARCHAR(255) NULL,
        [Description] NVARCHAR(MAX) NULL,
        [OpeningHours] NVARCHAR(255) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 의사-병원 관계 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DoctorHospitals]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[DoctorHospitals] (
        [DoctorHospitalID] INT IDENTITY(1,1) PRIMARY KEY,
        [DoctorID] INT NOT NULL FOREIGN KEY REFERENCES Doctors(DoctorID),
        [HospitalID] INT NOT NULL FOREIGN KEY REFERENCES Hospitals(HospitalID),
        [StartDate] DATE NOT NULL,
        [EndDate] DATE NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        CONSTRAINT UQ_DoctorHospital UNIQUE (DoctorID, HospitalID)
    );
END
GO

-- 의사 스케줄 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DoctorSchedules]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[DoctorSchedules] (
        [ScheduleID] INT IDENTITY(1,1) PRIMARY KEY,
        [DoctorID] INT NOT NULL FOREIGN KEY REFERENCES Doctors(DoctorID),
        [HospitalID] INT NOT NULL FOREIGN KEY REFERENCES Hospitals(HospitalID),
        [DayOfWeek] INT NOT NULL CHECK (DayOfWeek BETWEEN 1 AND 7), -- 1 = 월요일, 7 = 일요일
        [StartTime] TIME NOT NULL,
        [EndTime] TIME NOT NULL,
        [BreakStartTime] TIME NULL,
        [BreakEndTime] TIME NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        CONSTRAINT UQ_DoctorSchedule UNIQUE (DoctorID, HospitalID, DayOfWeek)
    );
END
GO

-- 의사 휴무일 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DoctorTimeOffs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[DoctorTimeOffs] (
        [TimeOffID] INT IDENTITY(1,1) PRIMARY KEY,
        [DoctorID] INT NOT NULL FOREIGN KEY REFERENCES Doctors(DoctorID),
        [HospitalID] INT NOT NULL FOREIGN KEY REFERENCES Hospitals(HospitalID),
        [StartDate] DATE NOT NULL,
        [EndDate] DATE NOT NULL,
        [Reason] NVARCHAR(255) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1
    );
END
GO

-- 예약 상태 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AppointmentStatuses]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[AppointmentStatuses] (
        [StatusID] INT IDENTITY(1,1) PRIMARY KEY,
        [StatusName] NVARCHAR(50) NOT NULL,
        [Description] NVARCHAR(255) NULL
    );
END
GO

-- 예약 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Appointments] (
        [AppointmentID] INT IDENTITY(1,1) PRIMARY KEY,
        [PatientID] INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
        [DoctorID] INT NOT NULL FOREIGN KEY REFERENCES Doctors(DoctorID),
        [HospitalID] INT NOT NULL FOREIGN KEY REFERENCES Hospitals(HospitalID),
        [AppointmentDate] DATE NOT NULL,
        [StartTime] TIME NOT NULL,
        [EndTime] TIME NOT NULL,
        [StatusID] INT NOT NULL FOREIGN KEY REFERENCES AppointmentStatuses(StatusID),
        [Reason] NVARCHAR(MAX) NULL,
        [Notes] NVARCHAR(MAX) NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 진료 기록 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MedicalRecords]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[MedicalRecords] (
        [RecordID] INT IDENTITY(1,1) PRIMARY KEY,
        [AppointmentID] INT NOT NULL FOREIGN KEY REFERENCES Appointments(AppointmentID),
        [PatientID] INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
        [DoctorID] INT NOT NULL FOREIGN KEY REFERENCES Doctors(DoctorID),
        [Diagnosis] NVARCHAR(MAX) NOT NULL,
        [Symptoms] NVARCHAR(MAX) NULL,
        [Treatment] NVARCHAR(MAX) NULL,
        [Prescription] NVARCHAR(MAX) NULL,
        [Notes] NVARCHAR(MAX) NULL,
        [FollowUpDate] DATE NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 처방전 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Prescriptions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Prescriptions] (
        [PrescriptionID] INT IDENTITY(1,1) PRIMARY KEY,
        [RecordID] INT NOT NULL FOREIGN KEY REFERENCES MedicalRecords(RecordID),
        [PatientID] INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
        [DoctorID] INT NOT NULL FOREIGN KEY REFERENCES Doctors(DoctorID),
        [PrescriptionDate] DATE NOT NULL,
        [Notes] NVARCHAR(MAX) NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 약품 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Medications]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Medications] (
        [MedicationID] INT IDENTITY(1,1) PRIMARY KEY,
        [Name] NVARCHAR(100) NOT NULL,
        [Description] NVARCHAR(MAX) NULL,
        [Dosage] NVARCHAR(50) NULL,
        [Manufacturer] NVARCHAR(100) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1
    );
END
GO

-- 처방 약품 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PrescriptionMedications]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PrescriptionMedications] (
        [PrescriptionMedicationID] INT IDENTITY(1,1) PRIMARY KEY,
        [PrescriptionID] INT NOT NULL FOREIGN KEY REFERENCES Prescriptions(PrescriptionID),
        [MedicationID] INT NOT NULL FOREIGN KEY REFERENCES Medications(MedicationID),
        [Dosage] NVARCHAR(50) NOT NULL,
        [Frequency] NVARCHAR(50) NOT NULL,
        [Duration] NVARCHAR(50) NOT NULL,
        [Instructions] NVARCHAR(MAX) NULL
    );
END
GO

-- 알림 유형 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NotificationTypes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[NotificationTypes] (
        [TypeID] INT IDENTITY(1,1) PRIMARY KEY,
        [TypeName] NVARCHAR(50) NOT NULL,
        [Description] NVARCHAR(255) NULL
    );
END
GO

-- 알림 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notifications]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Notifications] (
        [NotificationID] INT IDENTITY(1,1) PRIMARY KEY,
        [UserID] INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
        [TypeID] INT NOT NULL FOREIGN KEY REFERENCES NotificationTypes(TypeID),
        [Title] NVARCHAR(100) NOT NULL,
        [Message] NVARCHAR(MAX) NOT NULL,
        [RelatedEntityID] INT NULL, -- 예약 ID, 진료 기록 ID 등
        [IsRead] BIT NOT NULL DEFAULT 0,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

PRINT '데이터베이스 스키마가 성공적으로 생성되었습니다.'
GO 