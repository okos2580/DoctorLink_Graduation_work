-- DoctorLink 데이터베이스 스키마
-- MSSQL Server용

-- 데이터베이스 생성 (필요한 경우)
-- CREATE DATABASE DoctorLinkDB;
-- USE DoctorLinkDB;

-- 사용자 테이블
CREATE TABLE Users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    birthDate DATE NOT NULL,
    gender NVARCHAR(10) CHECK (gender IN ('male', 'female')) NOT NULL,
    address NVARCHAR(500),
    role NVARCHAR(20) CHECK (role IN ('patient', 'doctor', 'admin')) DEFAULT 'patient',
    status NVARCHAR(20) CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
    profileImage NVARCHAR(500),
    registrationDate DATETIME2 DEFAULT GETDATE(),
    lastLogin DATETIME2,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);

-- 의료 정보 테이블
CREATE TABLE MedicalInfo (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    userId UNIQUEIDENTIFIER NOT NULL,
    bloodType NVARCHAR(10),
    allergies NVARCHAR(MAX), -- JSON 형태로 저장
    medications NVARCHAR(MAX), -- JSON 형태로 저장
    medicalHistory NVARCHAR(MAX), -- JSON 형태로 저장
    emergencyContactName NVARCHAR(100),
    emergencyContactPhone NVARCHAR(20),
    emergencyContactRelationship NVARCHAR(50),
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- 병원 테이블
CREATE TABLE Hospitals (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(200) NOT NULL,
    address NVARCHAR(500) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    email NVARCHAR(255),
    website NVARCHAR(500),
    type NVARCHAR(100) NOT NULL,
    departments NVARCHAR(MAX), -- JSON 형태로 저장
    operatingHours NVARCHAR(MAX), -- JSON 형태로 저장
    status NVARCHAR(20) CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'pending',
    description NVARCHAR(MAX),
    facilities NVARCHAR(MAX), -- JSON 형태로 저장
    rating DECIMAL(3,2) DEFAULT 0.0,
    reviewCount INT DEFAULT 0,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    image NVARCHAR(500),
    registrationDate DATETIME2 DEFAULT GETDATE(),
    lastUpdated DATETIME2 DEFAULT GETDATE(),
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);

-- 의사 테이블
CREATE TABLE Doctors (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    userId UNIQUEIDENTIFIER NOT NULL,
    hospitalId UNIQUEIDENTIFIER,
    licenseNumber NVARCHAR(50) UNIQUE NOT NULL,
    department NVARCHAR(100) NOT NULL,
    specialization NVARCHAR(200) NOT NULL,
    experience INT DEFAULT 0,
    education NVARCHAR(MAX),
    rating DECIMAL(3,2) DEFAULT 0.0,
    reviewCount INT DEFAULT 0,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (hospitalId) REFERENCES Hospitals(id) ON DELETE SET NULL
);

-- 예약 테이블
CREATE TABLE Reservations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    patientId UNIQUEIDENTIFIER NOT NULL,
    doctorId UNIQUEIDENTIFIER NOT NULL,
    hospitalId UNIQUEIDENTIFIER NOT NULL,
    reservationDate DATE NOT NULL,
    reservationTime TIME NOT NULL,
    department NVARCHAR(100) NOT NULL,
    status NVARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')) DEFAULT 'pending',
    reason NVARCHAR(500),
    notes NVARCHAR(MAX),
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (patientId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctorId) REFERENCES Doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (hospitalId) REFERENCES Hospitals(id) ON DELETE CASCADE
);

-- 의료 기록 테이블
CREATE TABLE MedicalRecords (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    patientId UNIQUEIDENTIFIER NOT NULL,
    doctorId UNIQUEIDENTIFIER NOT NULL,
    reservationId UNIQUEIDENTIFIER,
    recordDate DATE NOT NULL,
    diagnosis NVARCHAR(MAX) NOT NULL,
    treatment NVARCHAR(MAX) NOT NULL,
    prescription NVARCHAR(MAX),
    notes NVARCHAR(MAX),
    attachments NVARCHAR(MAX), -- JSON 형태로 저장
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (patientId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctorId) REFERENCES Doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (reservationId) REFERENCES Reservations(id) ON DELETE SET NULL
);

-- 알림 테이블
CREATE TABLE Notifications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    userId UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(200) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(50) NOT NULL,
    isRead BIT DEFAULT 0,
    relatedId UNIQUEIDENTIFIER, -- 관련된 예약, 의료기록 등의 ID
    createdAt DATETIME2 DEFAULT GETDATE(),
    readAt DATETIME2,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- 리뷰 테이블
CREATE TABLE Reviews (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    patientId UNIQUEIDENTIFIER NOT NULL,
    doctorId UNIQUEIDENTIFIER,
    hospitalId UNIQUEIDENTIFIER,
    reservationId UNIQUEIDENTIFIER,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment NVARCHAR(MAX),
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (patientId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctorId) REFERENCES Doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (hospitalId) REFERENCES Hospitals(id) ON DELETE SET NULL,
    FOREIGN KEY (reservationId) REFERENCES Reservations(id) ON DELETE SET NULL
);

-- 파일 업로드 테이블
CREATE TABLE FileUploads (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    userId UNIQUEIDENTIFIER NOT NULL,
    fileName NVARCHAR(255) NOT NULL,
    originalName NVARCHAR(255) NOT NULL,
    filePath NVARCHAR(500) NOT NULL,
    fileSize BIGINT NOT NULL,
    mimeType NVARCHAR(100) NOT NULL,
    relatedTable NVARCHAR(50), -- 관련 테이블명
    relatedId UNIQUEIDENTIFIER, -- 관련 레코드 ID
    createdAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Users_Role ON Users(role);
CREATE INDEX IX_Users_Status ON Users(status);
CREATE INDEX IX_Hospitals_Status ON Hospitals(status);
CREATE INDEX IX_Hospitals_Location ON Hospitals(latitude, longitude);
CREATE INDEX IX_Doctors_Department ON Doctors(department);
CREATE INDEX IX_Doctors_HospitalId ON Doctors(hospitalId);
CREATE INDEX IX_Reservations_PatientId ON Reservations(patientId);
CREATE INDEX IX_Reservations_DoctorId ON Reservations(doctorId);
CREATE INDEX IX_Reservations_Date ON Reservations(reservationDate);
CREATE INDEX IX_Reservations_Status ON Reservations(status);
CREATE INDEX IX_MedicalRecords_PatientId ON MedicalRecords(patientId);
CREATE INDEX IX_MedicalRecords_DoctorId ON MedicalRecords(doctorId);
CREATE INDEX IX_Notifications_UserId ON Notifications(userId);
CREATE INDEX IX_Notifications_IsRead ON Notifications(isRead);

-- 기본 관리자 계정 생성 (비밀번호: admin123)
INSERT INTO Users (email, password, name, phone, birthDate, gender, role, status)
VALUES ('admin@doctorlink.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '시스템 관리자', '010-0000-0000', '1990-01-01', 'male', 'admin', 'active');

-- 샘플 병원 데이터
INSERT INTO Hospitals (name, address, phone, email, type, departments, operatingHours, status, description, facilities, latitude, longitude)
VALUES 
('서울대학교병원', '서울특별시 종로구 대학로 101', '02-2072-2114', 'info@snuh.org', '종합병원', 
 '["내과", "외과", "소아과", "산부인과", "정형외과", "신경과", "정신건강의학과", "피부과", "안과", "이비인후과"]',
 '{"monday": "08:00-18:00", "tuesday": "08:00-18:00", "wednesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-18:00", "saturday": "08:00-13:00", "sunday": "휴진"}',
 'active', '대한민국 최고의 의료진과 최첨단 의료장비를 갖춘 종합병원입니다.',
 '["응급실", "중환자실", "수술실", "영상의학과", "검사실", "약국", "주차장"]',
 37.5799, 126.9999),
 
('삼성서울병원', '서울특별시 강남구 일원로 81', '02-3410-2114', 'info@smc.samsung.co.kr', '종합병원',
 '["내과", "외과", "소아과", "산부인과", "정형외과", "신경과", "정신건강의학과", "피부과", "안과", "이비인후과", "암센터"]',
 '{"monday": "08:30-17:30", "tuesday": "08:30-17:30", "wednesday": "08:30-17:30", "thursday": "08:30-17:30", "friday": "08:30-17:30", "saturday": "08:30-12:30", "sunday": "휴진"}',
 'active', '최첨단 의료기술과 환자중심 의료서비스를 제공하는 종합병원입니다.',
 '["응급실", "중환자실", "수술실", "영상의학과", "검사실", "약국", "주차장", "암센터"]',
 37.4881, 127.0856);

-- 트리거 생성 (updatedAt 자동 업데이트)
CREATE TRIGGER tr_Users_UpdatedAt ON Users
AFTER UPDATE AS
BEGIN
    UPDATE Users 
    SET updatedAt = GETDATE()
    FROM Users u
    INNER JOIN inserted i ON u.id = i.id
END;

CREATE TRIGGER tr_Hospitals_UpdatedAt ON Hospitals
AFTER UPDATE AS
BEGIN
    UPDATE Hospitals 
    SET updatedAt = GETDATE()
    FROM Hospitals h
    INNER JOIN inserted i ON h.id = i.id
END;

CREATE TRIGGER tr_Doctors_UpdatedAt ON Doctors
AFTER UPDATE AS
BEGIN
    UPDATE Doctors 
    SET updatedAt = GETDATE()
    FROM Doctors d
    INNER JOIN inserted i ON d.id = i.id
END;

CREATE TRIGGER tr_Reservations_UpdatedAt ON Reservations
AFTER UPDATE AS
BEGIN
    UPDATE Reservations 
    SET updatedAt = GETDATE()
    FROM Reservations r
    INNER JOIN inserted i ON r.id = i.id
END;

CREATE TRIGGER tr_MedicalRecords_UpdatedAt ON MedicalRecords
AFTER UPDATE AS
BEGIN
    UPDATE MedicalRecords 
    SET updatedAt = GETDATE()
    FROM MedicalRecords m
    INNER JOIN inserted i ON m.id = i.id
END;



















