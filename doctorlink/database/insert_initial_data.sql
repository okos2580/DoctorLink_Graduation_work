USE DoctorLink;
GO

-- 사용자 역할 기본 데이터
INSERT INTO UserRoles (RoleName) VALUES 
('관리자'),
('의사'),
('환자');

-- 관리자 계정 생성 (비밀번호: admin123 해싱 예시)
INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, PhoneNumber, RoleID, IsActive)
VALUES ('admin', 'admin@doctorlink.com', 'AQAAAAEAACcQAAAAEK3K8Q9QxgV6pKzgjWoUVb5/Bz6wO+9xXdZMHUMxJ1NHu2XdZsROiN3tI+s8xtCk3A==', '관리자', '계정', '010-0000-0000', 1, 1);

-- 예약 상태 기본 데이터
INSERT INTO AppointmentStatuses (StatusName, Description) VALUES 
('예약됨', '예약이 생성되었습니다'),
('확인됨', '의사가 예약을 확인했습니다'),
('취소됨', '예약이 취소되었습니다'),
('완료됨', '진료가 완료되었습니다'),
('미응답', '환자가 예약에 응답하지 않았습니다');

-- 알림 유형 기본 데이터
INSERT INTO NotificationTypes (TypeName, Description) VALUES 
('예약 확인', '예약이 성공적으로 등록되었습니다'),
('예약 변경', '예약 정보가 변경되었습니다'),
('예약 취소', '예약이 취소되었습니다'),
('예약 상기', '내일 예약이 있습니다'),
('의사 메시지', '의사가 메시지를 보냈습니다'),
('시스템 공지', '시스템 관련 중요 공지사항입니다');

-- 샘플 사용자 데이터 (의사)
INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, PhoneNumber, DateOfBirth, Gender, Address, RoleID, IsActive)
VALUES 
('doctor1', 'kim.doctor@doctorlink.com', 'AQAAAAEAACcQAAAAENOVl6d8VHnFl9mkoeeGPJ5eqSGPGXm1qHlL6tdYFgxwn1EYmrPq3BNdm11O5S38qw==', '영희', '김', '010-1234-5678', '1975-05-15', '여성', '서울시 강남구 역삼동 123', 2, 1),
('doctor2', 'lee.doctor@doctorlink.com', 'AQAAAAEAACcQAAAAENOVl6d8VHnFl9mkoeeGPJ5eqSGPGXm1qHlL6tdYFgxwn1EYmrPq3BNdm11O5S38qw==', '철수', '이', '010-2345-6789', '1980-12-10', '남성', '서울시 송파구 잠실동 456', 2, 1),
('doctor3', 'park.doctor@doctorlink.com', 'AQAAAAEAACcQAAAAENOVl6d8VHnFl9mkoeeGPJ5eqSGPGXm1qHlL6tdYFgxwn1EYmrPq3BNdm11O5S38qw==', '민지', '박', '010-3456-7890', '1985-08-22', '여성', '서울시 서초구 방배동 789', 2, 1);

-- 샘플 의사 데이터
INSERT INTO Doctors (UserID, LicenseNumber, Specialization, Biography, EducationBackground, Experience, Rating, ConsultationFee)
VALUES 
(2, 'KMD12345', '내과', '10년 이상의 내과 경험을 가진 의사입니다. 특히 소화기 질환 전문입니다.', '서울대학교 의과대학, 서울대학교병원 인턴/레지던트', 10, 4.8, 50000),
(3, 'KMD23456', '소아과', '아이들을 사랑하는 소아과 전문의입니다.', '연세대학교 의과대학, 세브란스병원 인턴/레지던트', 8, 4.7, 45000),
(4, 'KMD34567', '정형외과', '스포츠 손상 및 관절 질환 전문입니다.', '고려대학교 의과대학, 고려대학교병원 인턴/레지던트', 12, 4.9, 60000);

-- 샘플 사용자 데이터 (환자)
INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, PhoneNumber, DateOfBirth, Gender, Address, RoleID, IsActive)
VALUES 
('patient1', 'hong.patient@example.com', 'AQAAAAEAACcQAAAAENOVl6d8VHnFl9mkoeeGPJ5eqSGPGXm1qHlL6tdYFgxwn1EYmrPq3BNdm11O5S38qw==', '길동', '홍', '010-9876-5432', '1990-03-20', '남성', '서울시 마포구 홍대동 123', 3, 1),
('patient2', 'choi.patient@example.com', 'AQAAAAEAACcQAAAAENOVl6d8VHnFl9mkoeeGPJ5eqSGPGXm1qHlL6tdYFgxwn1EYmrPq3BNdm11O5S38qw==', '미영', '최', '010-8765-4321', '1988-11-15', '여성', '서울시 강서구 화곡동 456', 3, 1),
('patient3', 'jeon.patient@example.com', 'AQAAAAEAACcQAAAAENOVl6d8VHnFl9mkoeeGPJ5eqSGPGXm1qHlL6tdYFgxwn1EYmrPq3BNdm11O5S38qw==', '우진', '전', '010-7654-3210', '1975-07-22', '남성', '서울시 성북구 길음동 789', 3, 1);

-- 샘플 병원 데이터
INSERT INTO Hospitals (Name, Address, City, State, ZipCode, PhoneNumber, Email, Website, Description, OpeningHours)
VALUES 
('서울중앙병원', '서울시 중구 명동 123-1', '서울', '서울특별시', '04527', '02-123-4567', 'info@seoulcentral.com', 'www.seoulcentral.com', '최신 의료장비와 전문 의료진을 갖춘 종합병원입니다.', '평일 09:00-18:00, 토요일 09:00-13:00'),
('강남메디컬센터', '서울시 강남구 삼성동 456-2', '서울', '서울특별시', '06163', '02-234-5678', 'contact@gangnammedical.com', 'www.gangnammedical.com', '강남에 위치한 현대적인 의료센터입니다.', '평일 08:30-19:00, 토요일 09:00-15:00'),
('한국종합의원', '서울시 송파구 잠실동 789-3', '서울', '서울특별시', '05551', '02-345-6789', 'help@koreamedical.com', 'www.koreamedical.com', '가족 전체를 위한 종합 의료서비스를 제공합니다.', '매일 24시간');

-- 의사-병원 관계 샘플 데이터
INSERT INTO DoctorHospitals (DoctorID, HospitalID, StartDate)
VALUES 
(1, 1, '2015-03-01'),
(2, 2, '2018-05-15'),
(3, 3, '2010-11-01'),
(1, 2, '2020-01-01'); -- 첫 번째 의사가 두 번째 병원에서도 일함

-- 의사 일정 샘플 데이터
INSERT INTO DoctorSchedules (DoctorID, HospitalID, DayOfWeek, StartTime, EndTime, BreakStartTime, BreakEndTime)
VALUES 
-- 첫 번째 의사 (서울중앙병원)
(1, 1, 1, '09:00', '17:00', '12:00', '13:00'), -- 월요일
(1, 1, 2, '09:00', '17:00', '12:00', '13:00'), -- 화요일
(1, 1, 3, '09:00', '17:00', '12:00', '13:00'), -- 수요일
(1, 1, 4, '09:00', '17:00', '12:00', '13:00'), -- 목요일
(1, 1, 5, '09:00', '17:00', '12:00', '13:00'), -- 금요일

-- 첫 번째 의사 (강남메디컬센터)
(1, 2, 6, '09:00', '13:00', NULL, NULL), -- 토요일

-- 두 번째 의사 (강남메디컬센터)
(2, 2, 1, '10:00', '18:00', '13:00', '14:00'), -- 월요일
(2, 2, 2, '10:00', '18:00', '13:00', '14:00'), -- 화요일
(2, 2, 3, '10:00', '18:00', '13:00', '14:00'), -- 수요일
(2, 2, 4, '10:00', '18:00', '13:00', '14:00'), -- 목요일
(2, 2, 5, '10:00', '18:00', '13:00', '14:00'), -- 금요일

-- 세 번째 의사 (한국종합의원)
(3, 3, 1, '08:00', '16:00', '12:00', '13:00'), -- 월요일
(3, 3, 2, '08:00', '16:00', '12:00', '13:00'), -- 화요일
(3, 3, 3, '08:00', '16:00', '12:00', '13:00'), -- 수요일
(3, 3, 4, '08:00', '16:00', '12:00', '13:00'), -- 목요일
(3, 3, 5, '08:00', '16:00', '12:00', '13:00'); -- 금요일

-- 약품 샘플 데이터
INSERT INTO Medications (Name, Description, DosageForm, Strength, Manufacturer)
VALUES 
('아스피린', '통증 완화 및 항염증 효과가 있는 약물입니다.', '정제', '500mg', '한국제약'),
('아목시실린', '세균 감염을 치료하는 항생제입니다.', '캡슐', '250mg', '서울약품'),
('록소프로펜', '진통 및 항염증 효과가 있는 비스테로이드성 소염진통제입니다.', '정제', '60mg', '대한제약'),
('타이레놀', '해열 및 진통 효과가 있는 약물입니다.', '정제', '500mg', '한국존슨앤존슨'),
('판콜에이내복액', '감기 증상 완화에 사용되는 종합감기약입니다.', '시럽', '30ml', '동아제약'); 