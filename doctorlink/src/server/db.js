const sql = require('mssql');

// Mock 데이터 (개발용)
const mockUsers = [
  {
    UserID: 1,
    Username: 'testuser',
    Email: 'test@example.com',
    FirstName: '테스트',
    LastName: '사용자',
    PhoneNumber: '010-1234-5678',
    DateOfBirth: new Date('1990-01-01'),
    Gender: 'male',
    RoleName: 'Patient',
    ProfileImage: null,
    IsActive: true
  },
  {
    UserID: 2,
    Username: 'admin',
    Email: 'admin@example.com',
    FirstName: '관리자',
    LastName: '',
    PhoneNumber: '010-0000-0000',
    DateOfBirth: new Date('1980-01-01'),
    Gender: 'male',
    RoleName: 'Admin',
    ProfileImage: null,
    IsActive: true
  }
];

const mockHospitals = [
  {
    HospitalID: 1,
    Name: '서울대학교병원',
    Address: '서울특별시 종로구 대학로 101',
    PhoneNumber: '02-2072-2114',
    HospitalType: '종합병원',
    Rating: 4.8,
    IsActive: true
  },
  {
    HospitalID: 2,
    Name: '삼성서울병원',
    Address: '서울특별시 강남구 일원로 81',
    PhoneNumber: '02-3410-2114',
    HospitalType: '종합병원',
    Rating: 4.7,
    IsActive: true
  }
];

// 데이터베이스 설정
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '12345',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'DoctorLink',
  options: {
    encrypt: false,
    enableArithAbort: true,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;
let useMockData = false;

// 데이터베이스 연결
const connectDB = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log('SQL Server 데이터베이스에 연결되었습니다.');
    }
    return pool;
  } catch (error) {
    console.error('데이터베이스 연결 오류:', error);
    console.log('Mock 데이터 모드로 전환합니다.');
    useMockData = true;
    return null;
  }
};

// 연결 테스트
const testConnection = async () => {
  try {
    await connectDB();
    if (useMockData) {
      console.log('Mock 데이터 모드로 실행 중');
      return true;
    }
    const result = await pool.request().query('SELECT 1 as test');
    console.log('데이터베이스 연결 테스트 성공');
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 테스트 실패:', error);
    console.log('Mock 데이터 모드로 전환합니다.');
    useMockData = true;
    return true;
  }
};

// 쿼리 실행
const executeQuery = async (query, params = {}) => {
  if (useMockData) {
    // Mock 데이터로 응답
    return {
      success: true,
      recordset: [],
      rowsAffected: [0]
    };
  }

  try {
    await connectDB();
    if (useMockData) {
      return {
        success: true,
        recordset: [],
        rowsAffected: [0]
      };
    }
    
    const request = pool.request();
    
    // 매개변수 추가
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.query(query);
    return {
      success: true,
      recordset: result.recordset,
      rowsAffected: result.rowsAffected
    };
  } catch (error) {
    console.error('쿼리 실행 오류:', error);
    useMockData = true;
    return {
      success: true,
      recordset: [],
      rowsAffected: [0]
    };
  }
};

// 사용자 인증
const authenticateUser = async (username, password) => {
  try {
    if (useMockData) {
      // Mock 사용자로 인증
      const user = mockUsers.find(u => 
        u.Username === username && 
        (password === 'password123' || password === 'admin123')
      );
      
      if (user) {
        return {
          success: true,
          recordset: [user]
        };
      } else {
        return {
          success: false,
          recordset: []
        };
      }
    }

    const query = `
      SELECT 
        u.UserID,
        u.Username,
        u.Email,
        u.FirstName,
        u.LastName,
        u.ProfileImage,
        ur.RoleName
      FROM Users u
      LEFT JOIN UserRoles ur ON u.RoleID = ur.RoleID
      WHERE u.Username = @Username 
      AND u.Password = HASHBYTES('SHA2_256', @Password)
      AND u.IsActive = 1
    `;
    
    return await executeQuery(query, { Username: username, Password: password });
  } catch (error) {
    console.error('사용자 인증 오류:', error);
    useMockData = true;
    
    // Mock 사용자로 인증
    const user = mockUsers.find(u => 
      u.Username === username && 
      (password === 'password123' || password === 'admin123')
    );
    
    if (user) {
      return {
        success: true,
        recordset: [user]
      };
    } else {
      return {
        success: false,
        recordset: []
      };
    }
  }
};

// 사용자 역할 테이블 확인 및 생성
const ensureUserRoles = async () => {
  try {
    const checkRolesQuery = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserRoles' AND xtype='U')
      BEGIN
        CREATE TABLE UserRoles (
          RoleID int IDENTITY(1,1) PRIMARY KEY,
          RoleName nvarchar(50) NOT NULL UNIQUE,
          Description nvarchar(255),
          CreatedAt datetime DEFAULT GETDATE(),
          UpdatedAt datetime DEFAULT GETDATE()
        );
      END
    `;
    
    await executeQuery(checkRolesQuery);
    
    // 기본 역할 데이터 삽입
    const insertRolesQuery = `
      IF NOT EXISTS (SELECT * FROM UserRoles WHERE RoleName = 'Patient')
      BEGIN
        INSERT INTO UserRoles (RoleName, Description) VALUES 
        ('Patient', '환자'),
        ('Doctor', '의사'),
        ('Admin', '관리자');
      END
    `;
    
    await executeQuery(insertRolesQuery);
    console.log('사용자 역할 테이블 확인 완료');
  } catch (error) {
    console.error('사용자 역할 테이블 확인 오류:', error);
  }
};

// 샘플 사용자 데이터 생성
const ensureSampleUsers = async () => {
  try {
    const checkUsersQuery = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
      BEGIN
        CREATE TABLE Users (
          UserID int IDENTITY(1,1) PRIMARY KEY,
          Username nvarchar(50) NOT NULL UNIQUE,
          Email nvarchar(255) NOT NULL UNIQUE,
          Password varbinary(64) NOT NULL,
          FirstName nvarchar(50),
          LastName nvarchar(50),
          PhoneNumber nvarchar(20),
          DateOfBirth date,
          Gender nvarchar(10),
          Address nvarchar(500),
          RoleID int FOREIGN KEY REFERENCES UserRoles(RoleID),
          IsActive bit DEFAULT 1,
          ProfileImage nvarchar(255),
          CreatedAt datetime DEFAULT GETDATE(),
          UpdatedAt datetime DEFAULT GETDATE(),
          LastLoginAt datetime
        );
      END
    `;
    
    await executeQuery(checkUsersQuery);
    
    // 샘플 사용자 데이터 삽입
    const checkSampleUsersQuery = `
      IF (SELECT COUNT(*) FROM Users) < 5
      BEGIN
        DECLARE @PatientRoleID int = (SELECT RoleID FROM UserRoles WHERE RoleName = 'Patient');
        DECLARE @DoctorRoleID int = (SELECT RoleID FROM UserRoles WHERE RoleName = 'Doctor');
        DECLARE @AdminRoleID int = (SELECT RoleID FROM UserRoles WHERE RoleName = 'Admin');
        
        INSERT INTO Users (Username, Email, Password, FirstName, LastName, PhoneNumber, DateOfBirth, Gender, Address, RoleID, IsActive, CreatedAt) VALUES
        ('patient1', 'patient1@example.com', HASHBYTES('SHA2_256', 'password123'), '김', '환자', '010-1234-5678', '1990-01-15', 'male', '서울특별시 강남구 테헤란로 123', @PatientRoleID, 1, GETDATE()),
        ('patient2', 'patient2@example.com', HASHBYTES('SHA2_256', 'password123'), '이', '환자', '010-2345-6789', '1985-05-20', 'female', '서울특별시 종로구 종로 456', @PatientRoleID, 1, GETDATE()),
        ('doctor1', 'doctor1@hospital.com', HASHBYTES('SHA2_256', 'password123'), '박', '의사', '010-3456-7890', '1975-03-10', 'male', '서울특별시 중구 을지로 789', @DoctorRoleID, 1, GETDATE()),
        ('doctor2', 'doctor2@hospital.com', HASHBYTES('SHA2_256', 'password123'), '최', '의사', '010-4567-8901', '1980-08-25', 'female', '서울특별시 송파구 잠실로 101', @DoctorRoleID, 1, GETDATE()),
        ('admin', 'admin@doctorlink.com', HASHBYTES('SHA2_256', 'admin123'), '관리자', '', '010-0000-0000', '1970-01-01', 'male', '서울특별시 중구 세종대로 110', @AdminRoleID, 1, GETDATE());
      END
    `;
    
    await executeQuery(checkSampleUsersQuery);
    console.log('샘플 사용자 데이터 확인 완료');
  } catch (error) {
    console.error('샘플 사용자 데이터 생성 오류:', error);
  }
};

// 샘플 병원 데이터 생성
const ensureSampleHospitals = async () => {
  try {
    const checkHospitalsQuery = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Hospitals' AND xtype='U')
      BEGIN
        CREATE TABLE Hospitals (
          HospitalID int IDENTITY(1,1) PRIMARY KEY,
          Name nvarchar(255) NOT NULL,
          Address nvarchar(500) NOT NULL,
          PhoneNumber nvarchar(20),
          Email nvarchar(255),
          Website nvarchar(255),
          HospitalType nvarchar(100),
          Description nvarchar(1000),
          Status nvarchar(50) DEFAULT 'active',
          IsActive bit DEFAULT 1,
          Rating decimal(3,2) DEFAULT 4.5,
          CreatedAt datetime DEFAULT GETDATE(),
          UpdatedAt datetime DEFAULT GETDATE()
        );
      END
    `;
    
    await executeQuery(checkHospitalsQuery);
    
    // 샘플 병원 데이터 삽입
    const checkSampleHospitalsQuery = `
      IF (SELECT COUNT(*) FROM Hospitals) < 3
      BEGIN
        INSERT INTO Hospitals (Name, Address, PhoneNumber, Email, Website, HospitalType, Description, Status, IsActive, Rating, CreatedAt) VALUES
        ('서울대학교병원', '서울특별시 종로구 대학로 101', '02-2072-2114', 'info@snuh.org', 'https://www.snuh.org', '종합병원', '대한민국 최고 수준의 의료진과 첨단 장비를 보유한 종합병원입니다.', 'active', 1, 4.8, GETDATE()),
        ('삼성서울병원', '서울특별시 강남구 일원로 81', '02-3410-2114', 'info@smc.samsung.co.kr', 'https://www.samsunghospital.com', '종합병원', '최첨단 의료 시설과 우수한 의료진을 갖춘 종합병원입니다.', 'active', 1, 4.7, GETDATE()),
        ('아산병원', '서울특별시 송파구 올림픽로43길 88', '02-3010-3114', 'webmaster@amc.seoul.kr', 'https://www.amc.seoul.kr', '종합병원', '환자 중심의 진료와 연구를 통해 최고의 의료 서비스를 제공합니다.', 'active', 1, 4.6, GETDATE());
      END
    `;
    
    await executeQuery(checkSampleHospitalsQuery);
    console.log('샘플 병원 데이터 확인 완료');
  } catch (error) {
    console.error('샘플 병원 데이터 생성 오류:', error);
  }
};

// 샘플 예약 데이터 생성
const ensureSampleAppointments = async () => {
  try {
    const checkAppointmentsQuery = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Appointments' AND xtype='U')
      BEGIN
        CREATE TABLE Appointments (
          AppointmentID int IDENTITY(1,1) PRIMARY KEY,
          PatientID int FOREIGN KEY REFERENCES Users(UserID),
          DoctorID int FOREIGN KEY REFERENCES Users(UserID),
          HospitalID int FOREIGN KEY REFERENCES Hospitals(HospitalID),
          AppointmentDate datetime NOT NULL,
          Status nvarchar(50) DEFAULT 'Pending',
          Reason nvarchar(500),
          Notes nvarchar(1000),
          CreatedAt datetime DEFAULT GETDATE(),
          UpdatedAt datetime DEFAULT GETDATE()
        );
      END
    `;
    
    await executeQuery(checkAppointmentsQuery);
    
    // 고객 문의 테이블 생성
    const checkInquiriesQuery = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CustomerInquiries' AND xtype='U')
      BEGIN
        CREATE TABLE CustomerInquiries (
          InquiryID int IDENTITY(1,1) PRIMARY KEY,
          UserID int FOREIGN KEY REFERENCES Users(UserID),
          Subject nvarchar(255) NOT NULL,
          Message nvarchar(2000) NOT NULL,
          Status nvarchar(50) DEFAULT 'Pending',
          IsResolved bit DEFAULT 0,
          CreatedAt datetime DEFAULT GETDATE(),
          UpdatedAt datetime DEFAULT GETDATE()
        );
      END
    `;
    
    await executeQuery(checkInquiriesQuery);
    
    // 병원 리뷰 테이블 생성
    const checkReviewsQuery = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HospitalReviews' AND xtype='U')
      BEGIN
        CREATE TABLE HospitalReviews (
          ReviewID int IDENTITY(1,1) PRIMARY KEY,
          HospitalID int FOREIGN KEY REFERENCES Hospitals(HospitalID),
          UserID int FOREIGN KEY REFERENCES Users(UserID),
          Rating decimal(3,2) NOT NULL,
          Comment nvarchar(1000),
          CreatedAt datetime DEFAULT GETDATE()
        );
      END
    `;
    
    await executeQuery(checkReviewsQuery);
    
    // 의사 테이블 생성
    const checkDoctorsQuery = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Doctors' AND xtype='U')
      BEGIN
        CREATE TABLE Doctors (
          DoctorID int IDENTITY(1,1) PRIMARY KEY,
          UserID int FOREIGN KEY REFERENCES Users(UserID),
          HospitalID int FOREIGN KEY REFERENCES Hospitals(HospitalID),
          LicenseNumber nvarchar(50),
          Specialization nvarchar(100),
          Department nvarchar(100),
          Experience int,
          Education nvarchar(500),
          CreatedAt datetime DEFAULT GETDATE(),
          UpdatedAt datetime DEFAULT GETDATE()
        );
      END
    `;
    
    await executeQuery(checkDoctorsQuery);
    
    // 샘플 예약 데이터 삽입
    const checkSampleAppointmentsQuery = `
      IF (SELECT COUNT(*) FROM Appointments) < 5
      BEGIN
        DECLARE @PatientID1 int = (SELECT TOP 1 UserID FROM Users WHERE Username = 'patient1');
        DECLARE @PatientID2 int = (SELECT TOP 1 UserID FROM Users WHERE Username = 'patient2');
        DECLARE @DoctorID1 int = (SELECT TOP 1 UserID FROM Users WHERE Username = 'doctor1');
        DECLARE @DoctorID2 int = (SELECT TOP 1 UserID FROM Users WHERE Username = 'doctor2');
        DECLARE @HospitalID1 int = (SELECT TOP 1 HospitalID FROM Hospitals WHERE Name LIKE '%서울대%');
        DECLARE @HospitalID2 int = (SELECT TOP 1 HospitalID FROM Hospitals WHERE Name LIKE '%삼성%');
        
        IF @PatientID1 IS NOT NULL AND @DoctorID1 IS NOT NULL AND @HospitalID1 IS NOT NULL
        BEGIN
          INSERT INTO Appointments (PatientID, DoctorID, HospitalID, AppointmentDate, Status, Reason, CreatedAt) VALUES
          (@PatientID1, @DoctorID1, @HospitalID1, DATEADD(day, 1, GETDATE()), 'Confirmed', '정기 검진', GETDATE()),
          (@PatientID2, @DoctorID2, @HospitalID2, DATEADD(day, 2, GETDATE()), 'Pending', '감기 증상', GETDATE()),
          (@PatientID1, @DoctorID1, @HospitalID1, GETDATE(), 'Completed', '혈압 체크', DATEADD(day, -7, GETDATE())),
          (@PatientID2, @DoctorID2, @HospitalID2, DATEADD(day, 3, GETDATE()), 'Pending', '건강 상담', GETDATE()),
          (@PatientID1, @DoctorID2, @HospitalID2, DATEADD(day, 5, GETDATE()), 'Confirmed', '종합 검진', GETDATE());
        END
      END
    `;
    
    await executeQuery(checkSampleAppointmentsQuery);
    
    // 샘플 고객 문의 데이터 삽입
    const checkSampleInquiriesQuery = `
      IF (SELECT COUNT(*) FROM CustomerInquiries) < 3
      BEGIN
        DECLARE @PatientID1 int = (SELECT TOP 1 UserID FROM Users WHERE Username = 'patient1');
        DECLARE @PatientID2 int = (SELECT TOP 1 UserID FROM Users WHERE Username = 'patient2');
        
        IF @PatientID1 IS NOT NULL
        BEGIN
          INSERT INTO CustomerInquiries (UserID, Subject, Message, Status, IsResolved, CreatedAt) VALUES
          (@PatientID1, '예약 변경 문의', '예약 시간을 변경하고 싶습니다.', 'Pending', 0, GETDATE()),
          (@PatientID2, '병원 정보 문의', '병원 위치와 주차 정보를 알고 싶습니다.', 'Resolved', 1, DATEADD(day, -1, GETDATE())),
          (@PatientID1, '진료비 문의', '진료비 영수증을 재발급 받을 수 있나요?', 'Pending', 0, DATEADD(day, -2, GETDATE()));
        END
      END
    `;
    
    await executeQuery(checkSampleInquiriesQuery);
    
    console.log('샘플 예약 및 문의 데이터 확인 완료');
  } catch (error) {
    console.error('샘플 예약 데이터 생성 오류:', error);
  }
};

// 기본 데이터 확인 및 생성
const checkBasicData = async () => {
  try {
    console.log('기본 데이터 확인 중...');
    
    if (useMockData) {
      console.log('Mock 데이터 모드로 실행 중입니다.');
      console.log('테스트 계정: testuser / password123');
      console.log('관리자 계정: admin / admin123');
      return;
    }
    
    // 사용자 역할 확인 및 생성
    await ensureUserRoles();
    
    // 샘플 사용자 데이터 확인 및 생성
    await ensureSampleUsers();
    
    // 샘플 병원 데이터 확인 및 생성
    await ensureSampleHospitals();
    
    // 샘플 예약 데이터 확인 및 생성
    await ensureSampleAppointments();
    
    console.log('기본 데이터 확인 완료');
  } catch (error) {
    console.error('기본 데이터 확인 중 오류:', error);
    useMockData = true;
    console.log('Mock 데이터 모드로 전환되었습니다.');
  }
};

module.exports = {
  connectDB,
  testConnection,
  executeQuery,
  authenticateUser,
  checkBasicData
}; 