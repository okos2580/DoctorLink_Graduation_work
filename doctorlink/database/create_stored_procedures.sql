USE DoctorLink;
GO

------------------------
-- 사용자 관련 프로시저 --
------------------------

-- 사용자 추가
CREATE PROCEDURE usp_CreateUser
    @Username NVARCHAR(100),
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(255),
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @PhoneNumber NVARCHAR(20),
    @DateOfBirth DATE,
    @Gender NVARCHAR(10),
    @Address NVARCHAR(255),
    @RoleID INT,
    @ProfileImage NVARCHAR(255) = NULL
AS
BEGIN
    INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, PhoneNumber, DateOfBirth, Gender, Address, RoleID, ProfileImage)
    VALUES (@Username, @Email, @PasswordHash, @FirstName, @LastName, @PhoneNumber, @DateOfBirth, @Gender, @Address, @RoleID, @ProfileImage);
    
    RETURN SCOPE_IDENTITY();
END;
GO

-- 사용자 정보 가져오기
CREATE PROCEDURE usp_GetUserByID
    @UserID INT
AS
BEGIN
    SELECT 
        u.UserID, u.Username, u.Email, u.FirstName, u.LastName, 
        u.PhoneNumber, u.DateOfBirth, u.Gender, u.Address, 
        u.RoleID, r.RoleName, u.ProfileImage, u.CreatedAt, 
        u.LastLogin, u.IsActive
    FROM 
        Users u
    JOIN 
        UserRoles r ON u.RoleID = r.RoleID
    WHERE 
        u.UserID = @UserID;
END;
GO

-- 사용자 이메일로 검색
CREATE PROCEDURE usp_GetUserByEmail
    @Email NVARCHAR(255)
AS
BEGIN
    SELECT 
        u.UserID, u.Username, u.Email, u.PasswordHash, u.FirstName, u.LastName, 
        u.PhoneNumber, u.DateOfBirth, u.Gender, u.Address, 
        u.RoleID, r.RoleName, u.ProfileImage, u.CreatedAt, 
        u.LastLogin, u.IsActive
    FROM 
        Users u
    JOIN 
        UserRoles r ON u.RoleID = r.RoleID
    WHERE 
        u.Email = @Email;
END;
GO

-- 사용자 정보 업데이트
CREATE PROCEDURE usp_UpdateUser
    @UserID INT,
    @Email NVARCHAR(255) = NULL,
    @FirstName NVARCHAR(100) = NULL,
    @LastName NVARCHAR(100) = NULL,
    @PhoneNumber NVARCHAR(20) = NULL,
    @DateOfBirth DATE = NULL,
    @Gender NVARCHAR(10) = NULL,
    @Address NVARCHAR(255) = NULL,
    @ProfileImage NVARCHAR(255) = NULL
AS
BEGIN
    UPDATE Users
    SET 
        Email = ISNULL(@Email, Email),
        FirstName = ISNULL(@FirstName, FirstName),
        LastName = ISNULL(@LastName, LastName),
        PhoneNumber = ISNULL(@PhoneNumber, PhoneNumber),
        DateOfBirth = ISNULL(@DateOfBirth, DateOfBirth),
        Gender = ISNULL(@Gender, Gender),
        Address = ISNULL(@Address, Address),
        ProfileImage = ISNULL(@ProfileImage, ProfileImage),
        UpdatedAt = GETDATE()
    WHERE 
        UserID = @UserID;
    
    RETURN @@ROWCOUNT;
END;
GO

-- 사용자 비밀번호 변경
CREATE PROCEDURE usp_UpdateUserPassword
    @UserID INT,
    @NewPasswordHash NVARCHAR(255)
AS
BEGIN
    UPDATE Users
    SET 
        PasswordHash = @NewPasswordHash,
        UpdatedAt = GETDATE()
    WHERE 
        UserID = @UserID;
    
    RETURN @@ROWCOUNT;
END;
GO

-- 사용자 활성화/비활성화
CREATE PROCEDURE usp_SetUserActiveStatus
    @UserID INT,
    @IsActive BIT
AS
BEGIN
    UPDATE Users
    SET 
        IsActive = @IsActive,
        UpdatedAt = GETDATE()
    WHERE 
        UserID = @UserID;
    
    RETURN @@ROWCOUNT;
END;
GO

------------------------
-- 의사 관련 프로시저 --
------------------------

-- 의사 정보 추가
CREATE PROCEDURE usp_CreateDoctor
    @UserID INT,
    @LicenseNumber NVARCHAR(50),
    @Specialization NVARCHAR(100),
    @Biography NVARCHAR(MAX) = NULL,
    @EducationBackground NVARCHAR(MAX) = NULL,
    @Experience INT = NULL,
    @ConsultationFee DECIMAL(10,2) = NULL
AS
BEGIN
    INSERT INTO Doctors (UserID, LicenseNumber, Specialization, Biography, EducationBackground, Experience, ConsultationFee)
    VALUES (@UserID, @LicenseNumber, @Specialization, @Biography, @EducationBackground, @Experience, @ConsultationFee);
    
    RETURN SCOPE_IDENTITY();
END;
GO

-- 의사 정보 가져오기
CREATE PROCEDURE usp_GetDoctorByID
    @DoctorID INT
AS
BEGIN
    SELECT 
        d.DoctorID, d.UserID, u.FirstName, u.LastName, u.Email, 
        u.PhoneNumber, d.LicenseNumber, d.Specialization, 
        d.Biography, d.EducationBackground, d.Experience, 
        d.Rating, d.ConsultationFee
    FROM 
        Doctors d
    JOIN 
        Users u ON d.UserID = u.UserID
    WHERE 
        d.DoctorID = @DoctorID;
END;
GO

-- 의사 목록 가져오기 (페이징)
CREATE PROCEDURE usp_GetDoctors
    @Specialization NVARCHAR(100) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    SELECT 
        d.DoctorID, d.UserID, u.FirstName, u.LastName, 
        d.Specialization, d.Rating, d.ConsultationFee,
        COUNT(*) OVER() AS TotalCount
    FROM 
        Doctors d
    JOIN 
        Users u ON d.UserID = u.UserID
    WHERE 
        (@Specialization IS NULL OR d.Specialization = @Specialization)
    ORDER BY 
        d.Rating DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO

-- 병원별 의사 목록 가져오기
CREATE PROCEDURE usp_GetDoctorsByHospital
    @HospitalID INT,
    @Specialization NVARCHAR(100) = NULL
AS
BEGIN
    SELECT 
        d.DoctorID, d.UserID, u.FirstName, u.LastName, 
        d.Specialization, d.Rating, d.ConsultationFee
    FROM 
        Doctors d
    JOIN 
        Users u ON d.UserID = u.UserID
    JOIN 
        DoctorHospitals dh ON d.DoctorID = dh.DoctorID
    WHERE 
        dh.HospitalID = @HospitalID
        AND (@Specialization IS NULL OR d.Specialization = @Specialization)
    ORDER BY 
        d.Rating DESC;
END;
GO

------------------------
-- 병원 관련 프로시저 --
------------------------

-- 병원 정보 가져오기
CREATE PROCEDURE usp_GetHospitalByID
    @HospitalID INT
AS
BEGIN
    SELECT * FROM Hospitals WHERE HospitalID = @HospitalID;
END;
GO

-- 병원 검색 (페이징)
CREATE PROCEDURE usp_SearchHospitals
    @SearchTerm NVARCHAR(100) = NULL,
    @City NVARCHAR(100) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    SELECT 
        HospitalID, Name, Address, City, PhoneNumber,
        Email, Website, Description, OpeningHours,
        COUNT(*) OVER() AS TotalCount
    FROM 
        Hospitals
    WHERE 
        IsActive = 1
        AND (@SearchTerm IS NULL OR Name LIKE '%' + @SearchTerm + '%' OR Description LIKE '%' + @SearchTerm + '%')
        AND (@City IS NULL OR City = @City)
    ORDER BY 
        Name
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO

------------------------
-- 예약 관련 프로시저 --
------------------------

-- 의사 가용 시간 체크
CREATE PROCEDURE usp_CheckDoctorAvailability
    @DoctorID INT,
    @HospitalID INT,
    @AppointmentDate DATE
AS
BEGIN
    DECLARE @DayOfWeek INT = DATEPART(WEEKDAY, @AppointmentDate);
    
    -- SQL Server에서는 주의 시작을 일요일(1)로 간주
    -- 우리는 월요일(1)부터 시작하므로 조정
    SET @DayOfWeek = @DayOfWeek - 1;
    IF @DayOfWeek = 0 SET @DayOfWeek = 7;
    
    -- 근무 일정 확인
    SELECT 
        ds.StartTime, ds.EndTime, ds.BreakStartTime, ds.BreakEndTime
    FROM 
        DoctorSchedules ds
    WHERE 
        ds.DoctorID = @DoctorID 
        AND ds.HospitalID = @HospitalID
        AND ds.DayOfWeek = @DayOfWeek
        AND ds.IsAvailable = 1;
    
    -- 이미 예약된 시간대 확인
    SELECT 
        a.StartTime, a.EndTime
    FROM 
        Appointments a
    WHERE 
        a.DoctorID = @DoctorID 
        AND a.HospitalID = @HospitalID
        AND a.AppointmentDate = @AppointmentDate
        AND a.StatusID IN (1, 2); -- 예약됨, 확인됨 상태만
    
    -- 휴무일 확인
    SELECT 1 AS IsTimeOff
    FROM DoctorTimeOff
    WHERE 
        DoctorID = @DoctorID
        AND @AppointmentDate BETWEEN CAST(StartDate AS DATE) AND CAST(EndDate AS DATE);
END;
GO

-- 예약 생성
CREATE PROCEDURE usp_CreateAppointment
    @PatientID INT,
    @DoctorID INT,
    @HospitalID INT,
    @AppointmentDate DATE,
    @StartTime TIME,
    @EndTime TIME,
    @Reason NVARCHAR(MAX) = NULL
AS
BEGIN
    -- 상태 ID 1 = '예약됨'
    INSERT INTO Appointments (PatientID, DoctorID, HospitalID, AppointmentDate, StartTime, EndTime, StatusID, Reason)
    VALUES (@PatientID, @DoctorID, @HospitalID, @AppointmentDate, @StartTime, @EndTime, 1, @Reason);
    
    DECLARE @AppointmentID INT = SCOPE_IDENTITY();
    
    -- 예약 확인 알림 추가 (TypeID 1 = '예약 확인')
    INSERT INTO Notifications (UserID, TypeID, Title, Message, RelatedEntityID)
    VALUES (@PatientID, 1, '예약이 완료되었습니다', 
            CONCAT('귀하의 ', FORMAT(@AppointmentDate, 'yyyy년 MM월 dd일'), ' ', 
                  FORMAT(CAST(@StartTime AS DATETIME), 'tt h:mm'), ' 예약이 확정되었습니다.'), 
            @AppointmentID);
    
    RETURN @AppointmentID;
END;
GO

-- 환자의 예약 목록 가져오기
CREATE PROCEDURE usp_GetPatientAppointments
    @PatientID INT,
    @IncludePast BIT = 0
AS
BEGIN
    SELECT 
        a.AppointmentID, a.AppointmentDate, a.StartTime, a.EndTime,
        d.DoctorID, u1.FirstName AS DoctorFirstName, u1.LastName AS DoctorLastName,
        h.HospitalID, h.Name AS HospitalName, 
        s.StatusID, s.StatusName, a.Reason, a.CreatedAt
    FROM 
        Appointments a
    JOIN 
        Doctors d ON a.DoctorID = d.DoctorID
    JOIN 
        Users u1 ON d.UserID = u1.UserID
    JOIN 
        Hospitals h ON a.HospitalID = h.HospitalID
    JOIN 
        AppointmentStatuses s ON a.StatusID = s.StatusID
    WHERE 
        a.PatientID = @PatientID
        AND (@IncludePast = 1 OR (a.AppointmentDate >= CAST(GETDATE() AS DATE)))
    ORDER BY 
        a.AppointmentDate, a.StartTime;
END;
GO

-- 의사의 예약 목록 가져오기
CREATE PROCEDURE usp_GetDoctorAppointments
    @DoctorID INT,
    @StartDate DATE,
    @EndDate DATE = NULL,
    @StatusID INT = NULL
AS
BEGIN
    IF @EndDate IS NULL
        SET @EndDate = @StartDate;
        
    SELECT 
        a.AppointmentID, a.AppointmentDate, a.StartTime, a.EndTime,
        u.UserID AS PatientID, u.FirstName AS PatientFirstName, u.LastName AS PatientLastName,
        h.HospitalID, h.Name AS HospitalName, 
        s.StatusID, s.StatusName, a.Reason, a.Notes, a.CreatedAt
    FROM 
        Appointments a
    JOIN 
        Users u ON a.PatientID = u.UserID
    JOIN 
        Hospitals h ON a.HospitalID = h.HospitalID
    JOIN 
        AppointmentStatuses s ON a.StatusID = s.StatusID
    WHERE 
        a.DoctorID = @DoctorID
        AND a.AppointmentDate BETWEEN @StartDate AND @EndDate
        AND (@StatusID IS NULL OR a.StatusID = @StatusID)
    ORDER BY 
        a.AppointmentDate, a.StartTime;
END;
GO

-- 예약 상태 업데이트
CREATE PROCEDURE usp_UpdateAppointmentStatus
    @AppointmentID INT,
    @StatusID INT,
    @Notes NVARCHAR(MAX) = NULL
AS
BEGIN
    DECLARE @OldStatusID INT;
    DECLARE @PatientID INT;
    DECLARE @AppointmentDate DATE;
    DECLARE @StartTime TIME;
    DECLARE @NotificationTypeID INT;
    DECLARE @NotificationTitle NVARCHAR(255);
    DECLARE @NotificationMessage NVARCHAR(MAX);
    
    -- 기존 정보 가져오기
    SELECT @OldStatusID = StatusID, @PatientID = PatientID, @AppointmentDate = AppointmentDate, @StartTime = StartTime
    FROM Appointments
    WHERE AppointmentID = @AppointmentID;
    
    -- 상태가 변경된 경우에만 처리
    IF @OldStatusID <> @StatusID
    BEGIN
        -- 예약 상태 업데이트
        UPDATE Appointments
        SET 
            StatusID = @StatusID,
            Notes = ISNULL(@Notes, Notes),
            UpdatedAt = GETDATE()
        WHERE 
            AppointmentID = @AppointmentID;
            
        -- 알림 유형 결정
        IF @StatusID = 2 -- 확인됨
            SET @NotificationTypeID = 1; -- 예약 확인
        ELSE IF @StatusID = 3 -- 취소됨
            SET @NotificationTypeID = 3; -- 예약 취소
        ELSE IF @StatusID = 4 -- 완료됨
            SET @NotificationTypeID = 1; -- 예약 확인
            
        -- 알림 내용 설정
        IF @StatusID = 2 -- 확인됨
        BEGIN
            SET @NotificationTitle = '예약이 확인되었습니다';
            SET @NotificationMessage = CONCAT('귀하의 ', FORMAT(@AppointmentDate, 'yyyy년 MM월 dd일'), ' ', 
                                            FORMAT(CAST(@StartTime AS DATETIME), 'tt h:mm'), ' 예약이 의사에 의해 확인되었습니다.');
        END
        ELSE IF @StatusID = 3 -- 취소됨
        BEGIN
            SET @NotificationTitle = '예약이 취소되었습니다';
            SET @NotificationMessage = CONCAT('귀하의 ', FORMAT(@AppointmentDate, 'yyyy년 MM월 dd일'), ' ', 
                                            FORMAT(CAST(@StartTime AS DATETIME), 'tt h:mm'), ' 예약이 취소되었습니다.');
        END
        ELSE IF @StatusID = 4 -- 완료됨
        BEGIN
            SET @NotificationTitle = '진료가 완료되었습니다';
            SET @NotificationMessage = CONCAT('귀하의 ', FORMAT(@AppointmentDate, 'yyyy년 MM월 dd일'), ' 진료가 완료되었습니다.');
        END
        
        -- 알림 추가
        IF @NotificationTypeID IS NOT NULL
        BEGIN
            INSERT INTO Notifications (UserID, TypeID, Title, Message, RelatedEntityID)
            VALUES (@PatientID, @NotificationTypeID, @NotificationTitle, @NotificationMessage, @AppointmentID);
        END
    END
    
    RETURN @@ROWCOUNT;
END;
GO

------------------------
-- 진료기록 관련 프로시저 --
------------------------

-- 진료 기록 생성
CREATE PROCEDURE usp_CreateMedicalRecord
    @AppointmentID INT,
    @PatientID INT,
    @DoctorID INT,
    @Diagnosis NVARCHAR(MAX),
    @Symptoms NVARCHAR(MAX) = NULL,
    @Treatment NVARCHAR(MAX) = NULL,
    @Prescription NVARCHAR(MAX) = NULL,
    @Notes NVARCHAR(MAX) = NULL,
    @FollowUpDate DATE = NULL
AS
BEGIN
    INSERT INTO MedicalRecords (AppointmentID, PatientID, DoctorID, Diagnosis, Symptoms, 
                                Treatment, Prescription, Notes, FollowUpDate)
    VALUES (@AppointmentID, @PatientID, @DoctorID, @Diagnosis, @Symptoms, 
            @Treatment, @Prescription, @Notes, @FollowUpDate);
    
    DECLARE @RecordID INT = SCOPE_IDENTITY();
    
    -- 예약 상태를 '완료됨'으로 업데이트
    EXEC usp_UpdateAppointmentStatus @AppointmentID, 4; -- 4 = 완료됨
    
    RETURN @RecordID;
END;
GO

-- 환자의 진료 기록 목록 가져오기
CREATE PROCEDURE usp_GetPatientMedicalRecords
    @PatientID INT
AS
BEGIN
    SELECT 
        mr.RecordID, mr.AppointmentID, mr.Diagnosis, mr.Symptoms, 
        mr.Treatment, mr.Prescription, mr.Notes, mr.FollowUpDate, 
        mr.CreatedAt, a.AppointmentDate,
        d.DoctorID, u.FirstName AS DoctorFirstName, u.LastName AS DoctorLastName,
        d.Specialization, h.HospitalID, h.Name AS HospitalName
    FROM 
        MedicalRecords mr
    JOIN 
        Appointments a ON mr.AppointmentID = a.AppointmentID
    JOIN 
        Doctors d ON mr.DoctorID = d.DoctorID
    JOIN 
        Users u ON d.UserID = u.UserID
    JOIN 
        Hospitals h ON a.HospitalID = h.HospitalID
    WHERE 
        mr.PatientID = @PatientID
    ORDER BY 
        a.AppointmentDate DESC;
END;
GO

-- 진료 기록 상세 정보 가져오기
CREATE PROCEDURE usp_GetMedicalRecordByID
    @RecordID INT,
    @UserID INT -- 접근 권한 확인용
AS
BEGIN
    DECLARE @IsDoctor BIT = 0;
    DECLARE @IsPatient BIT = 0;
    
    -- 사용자가 환자인지 확인
    IF EXISTS (SELECT 1 FROM MedicalRecords WHERE RecordID = @RecordID AND PatientID = @UserID)
        SET @IsPatient = 1;
        
    -- 사용자가 담당 의사인지 확인
    IF EXISTS (SELECT 1 FROM MedicalRecords WHERE RecordID = @RecordID AND DoctorID = 
                (SELECT DoctorID FROM Doctors WHERE UserID = @UserID))
        SET @IsDoctor = 1;
        
    -- 담당 의사나 해당 환자만 조회 가능
    IF @IsDoctor = 1 OR @IsPatient = 1
    BEGIN
        SELECT 
            mr.RecordID, mr.AppointmentID, mr.PatientID, mr.DoctorID, 
            mr.Diagnosis, mr.Symptoms, mr.Treatment, mr.Prescription, 
            mr.Notes, mr.FollowUpDate, mr.CreatedAt, mr.UpdatedAt,
            a.AppointmentDate, a.StartTime, a.EndTime,
            pa.FirstName AS PatientFirstName, pa.LastName AS PatientLastName,
            dr.FirstName AS DoctorFirstName, dr.LastName AS DoctorLastName,
            dr.Specialization, h.Name AS HospitalName
        FROM 
            MedicalRecords mr
        JOIN 
            Appointments a ON mr.AppointmentID = a.AppointmentID
        JOIN 
            Users pa ON mr.PatientID = pa.UserID
        JOIN 
            Doctors d ON mr.DoctorID = d.DoctorID
        JOIN 
            Users dr ON d.UserID = dr.UserID
        JOIN 
            Hospitals h ON a.HospitalID = h.HospitalID
        WHERE 
            mr.RecordID = @RecordID;
    END
    ELSE
    BEGIN
        -- 접근 권한 없음
        SELECT 'Access Denied' AS ErrorMessage;
    END
END;
GO

------------------------
-- 알림 관련 프로시저 --
------------------------

-- 사용자의 알림 목록 가져오기
CREATE PROCEDURE usp_GetUserNotifications
    @UserID INT,
    @Unread BIT = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    SELECT 
        NotificationID, TypeID, Title, Message, IsRead, 
        RelatedEntityID, CreatedAt,
        COUNT(*) OVER() AS TotalCount
    FROM 
        Notifications
    WHERE 
        UserID = @UserID
        AND (@Unread IS NULL OR IsRead = (1 - @Unread))
    ORDER BY 
        CreatedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO

-- 알림 읽음 표시
CREATE PROCEDURE usp_MarkNotificationAsRead
    @NotificationID INT,
    @UserID INT
AS
BEGIN
    UPDATE Notifications
    SET IsRead = 1
    WHERE NotificationID = @NotificationID AND UserID = @UserID;
    
    RETURN @@ROWCOUNT;
END;
GO

-- 모든 알림 읽음 표시
CREATE PROCEDURE usp_MarkAllNotificationsAsRead
    @UserID INT
AS
BEGIN
    UPDATE Notifications
    SET IsRead = 1
    WHERE UserID = @UserID AND IsRead = 0;
    
    RETURN @@ROWCOUNT;
END;
GO

-- 1. 사용자 인증 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_AuthenticateUser]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_AuthenticateUser]
GO

CREATE PROCEDURE [dbo].[usp_AuthenticateUser]
    @Username NVARCHAR(50),
    @Password NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @HashedPassword VARBINARY(256) = HASHBYTES('SHA2_256', @Password);
    
    SELECT 
        u.UserID, u.Username, u.Email, u.FirstName, u.LastName, u.PhoneNumber,
        u.DateOfBirth, u.Gender, u.Address, u.RoleID, r.RoleName, u.ProfileImage,
        u.IsActive, u.CreatedAt, u.UpdatedAt, u.LastLogin
    FROM 
        Users u
    INNER JOIN 
        UserRoles r ON u.RoleID = r.RoleID
    WHERE 
        u.Username = @Username AND u.Password = @HashedPassword AND u.IsActive = 1;
    
    -- 로그인 성공 시 LastLogin 업데이트
    IF @@ROWCOUNT > 0
    BEGIN
        UPDATE Users
        SET LastLogin = GETDATE()
        WHERE Username = @Username;
    END
END
GO

-- 2. 의사 예약 가능 시간 확인 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_CheckDoctorAvailability]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_CheckDoctorAvailability]
GO

CREATE PROCEDURE [dbo].[usp_CheckDoctorAvailability]
    @DoctorID INT,
    @HospitalID INT,
    @AppointmentDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @DayOfWeek INT = DATEPART(WEEKDAY, @AppointmentDate);
    
    -- SQL Server에서는 DATEPART(WEEKDAY, date)가 1(일요일)부터 시작하므로 조정 필요
    -- 1(일요일), 2(월요일), ..., 7(토요일)
    -- 1(월요일), 2(화요일), ..., 7(일요일)로 변환
    SET @DayOfWeek = ((@DayOfWeek + 5) % 7) + 1;
    
    -- 1. 근무 일정 조회
    SELECT 
        StartTime, EndTime, BreakStartTime, BreakEndTime
    FROM 
        DoctorSchedules
    WHERE 
        DoctorID = @DoctorID AND
        HospitalID = @HospitalID AND
        DayOfWeek = @DayOfWeek AND
        IsActive = 1;
    
    -- 2. 이미 예약된 시간대 조회
    SELECT 
        StartTime, EndTime
    FROM 
        Appointments
    WHERE 
        DoctorID = @DoctorID AND
        HospitalID = @HospitalID AND
        AppointmentDate = @AppointmentDate AND
        StatusID IN (SELECT StatusID FROM AppointmentStatuses WHERE StatusName IN ('예약됨', '확인됨'));
    
    -- 3. 휴무일 확인
    SELECT 
        1 AS IsTimeOff
    FROM 
        DoctorTimeOffs
    WHERE 
        DoctorID = @DoctorID AND
        HospitalID = @HospitalID AND
        @AppointmentDate BETWEEN StartDate AND EndDate AND
        IsActive = 1;
END
GO

-- 3. 예약 생성 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_CreateAppointment]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_CreateAppointment]
GO

CREATE PROCEDURE [dbo].[usp_CreateAppointment]
    @PatientID INT,
    @DoctorID INT,
    @HospitalID INT,
    @AppointmentDate DATE,
    @StartTime TIME,
    @EndTime TIME,
    @Reason NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 예약 가능 시간인지 확인
        DECLARE @DayOfWeek INT = DATEPART(WEEKDAY, @AppointmentDate);
        SET @DayOfWeek = ((@DayOfWeek + 5) % 7) + 1;
        
        -- 해당 날짜에 의사가 근무하는지 확인
        IF NOT EXISTS (
            SELECT 1 FROM DoctorSchedules 
            WHERE DoctorID = @DoctorID 
            AND HospitalID = @HospitalID 
            AND DayOfWeek = @DayOfWeek
            AND IsActive = 1
        )
        BEGIN
            RAISERROR('의사가 해당 요일에 근무하지 않습니다.', 16, 1);
            RETURN;
        END
        
        -- 휴무일인지 확인
        IF EXISTS (
            SELECT 1 FROM DoctorTimeOffs 
            WHERE DoctorID = @DoctorID 
            AND HospitalID = @HospitalID 
            AND @AppointmentDate BETWEEN StartDate AND EndDate
            AND IsActive = 1
        )
        BEGIN
            RAISERROR('의사가 해당 날짜에 휴무입니다.', 16, 1);
            RETURN;
        END
        
        -- 의사의 근무 시간 내인지 확인
        DECLARE @DoctorStartTime TIME, @DoctorEndTime TIME;
        DECLARE @BreakStartTime TIME, @BreakEndTime TIME;
        
        SELECT @DoctorStartTime = StartTime, @DoctorEndTime = EndTime,
               @BreakStartTime = BreakStartTime, @BreakEndTime = BreakEndTime
        FROM DoctorSchedules
        WHERE DoctorID = @DoctorID 
        AND HospitalID = @HospitalID 
        AND DayOfWeek = @DayOfWeek
        AND IsActive = 1;
        
        IF @StartTime < @DoctorStartTime OR @EndTime > @DoctorEndTime
        BEGIN
            RAISERROR('예약 시간이 의사 근무 시간을 벗어납니다.', 16, 1);
            RETURN;
        END
        
        -- 점심 시간에 겹치는지 확인
        IF @BreakStartTime IS NOT NULL AND @BreakEndTime IS NOT NULL
        BEGIN
            IF (@StartTime >= @BreakStartTime AND @StartTime < @BreakEndTime)
            OR (@EndTime > @BreakStartTime AND @EndTime <= @BreakEndTime)
            OR (@StartTime <= @BreakStartTime AND @EndTime >= @BreakEndTime)
            BEGIN
                RAISERROR('예약 시간이 의사 휴식 시간과 겹칩니다.', 16, 1);
                RETURN;
            END
        END
        
        -- 다른 예약과 겹치는지 확인
        IF EXISTS (
            SELECT 1 FROM Appointments
            WHERE DoctorID = @DoctorID
            AND HospitalID = @HospitalID
            AND AppointmentDate = @AppointmentDate
            AND StatusID IN (SELECT StatusID FROM AppointmentStatuses WHERE StatusName IN ('예약됨', '확인됨'))
            AND (
                (@StartTime >= StartTime AND @StartTime < EndTime)
                OR (@EndTime > StartTime AND @EndTime <= EndTime)
                OR (@StartTime <= StartTime AND @EndTime >= EndTime)
            )
        )
        BEGIN
            RAISERROR('이미 해당 시간에 예약이 있습니다.', 16, 1);
            RETURN;
        END
        
        -- 예약 상태 ID 가져오기
        DECLARE @StatusID INT;
        SELECT @StatusID = StatusID FROM AppointmentStatuses WHERE StatusName = '예약됨';
        
        -- 예약 생성
        INSERT INTO Appointments (
            PatientID, DoctorID, HospitalID, AppointmentDate, 
            StartTime, EndTime, StatusID, Reason, CreatedAt, UpdatedAt
        )
        VALUES (
            @PatientID, @DoctorID, @HospitalID, @AppointmentDate,
            @StartTime, @EndTime, @StatusID, @Reason, GETDATE(), GETDATE()
        );
        
        -- 생성된 예약 ID 반환
        DECLARE @AppointmentID INT = SCOPE_IDENTITY();
        
        -- 환자에게 알림 생성
        DECLARE @NotificationTypeID INT;
        SELECT @NotificationTypeID = TypeID FROM NotificationTypes WHERE TypeName = '예약 확인';
        
        IF @NotificationTypeID IS NOT NULL
        BEGIN
            DECLARE @DoctorName NVARCHAR(100);
            DECLARE @HospitalName NVARCHAR(100);
            
            SELECT @DoctorName = FirstName + ' ' + LastName
            FROM Users
            WHERE UserID = (SELECT UserID FROM Doctors WHERE DoctorID = @DoctorID);
            
            SELECT @HospitalName = Name
            FROM Hospitals
            WHERE HospitalID = @HospitalID;
            
            INSERT INTO Notifications (
                UserID, TypeID, Title, Message, RelatedEntityID, IsRead, CreatedAt
            )
            VALUES (
                @PatientID, @NotificationTypeID, 
                '예약이 완료되었습니다',
                @DoctorName + ' 의사와 ' + FORMAT(@AppointmentDate, 'yyyy년 MM월 dd일') + ' ' + 
                FORMAT(CAST(@StartTime AS DATETIME), 'HH:mm') + '에 ' + @HospitalName + '에서의 예약이 완료되었습니다.',
                @AppointmentID, 0, GETDATE()
            );
        END
        
        COMMIT TRANSACTION;
        
        -- 생성된 예약 정보 반환
        SELECT 
            a.AppointmentID, a.PatientID, a.DoctorID, a.HospitalID, a.AppointmentDate,
            a.StartTime, a.EndTime, a.StatusID, s.StatusName, a.Reason, a.Notes,
            a.CreatedAt, a.UpdatedAt,
            u.FirstName AS DoctorFirstName, u.LastName AS DoctorLastName,
            h.Name AS HospitalName
        FROM 
            Appointments a
        INNER JOIN 
            AppointmentStatuses s ON a.StatusID = s.StatusID
        INNER JOIN 
            Doctors d ON a.DoctorID = d.DoctorID
        INNER JOIN 
            Users u ON d.UserID = u.UserID
        INNER JOIN 
            Hospitals h ON a.HospitalID = h.HospitalID
        WHERE 
            a.AppointmentID = @AppointmentID;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END
GO

-- 4. 예약 상태 변경 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_UpdateAppointmentStatus]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_UpdateAppointmentStatus]
GO

CREATE PROCEDURE [dbo].[usp_UpdateAppointmentStatus]
    @AppointmentID INT,
    @StatusName NVARCHAR(50),
    @Notes NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @StatusID INT;
        DECLARE @OldStatusID INT;
        DECLARE @PatientID INT;
        DECLARE @DoctorID INT;
        DECLARE @AppointmentDate DATE;
        DECLARE @StartTime TIME;
        DECLARE @DoctorName NVARCHAR(100);
        DECLARE @HospitalName NVARCHAR(100);
        DECLARE @NotificationTypeID INT;
        
        -- 새 상태 ID 가져오기
        SELECT @StatusID = StatusID FROM AppointmentStatuses WHERE StatusName = @StatusName;
        
        IF @StatusID IS NULL
        BEGIN
            RAISERROR('유효하지 않은 예약 상태입니다.', 16, 1);
            RETURN;
        END
        
        -- 현재 예약 정보 가져오기
        SELECT 
            @OldStatusID = StatusID, 
            @PatientID = PatientID,
            @DoctorID = DoctorID,
            @AppointmentDate = AppointmentDate,
            @StartTime = StartTime
        FROM 
            Appointments
        WHERE 
            AppointmentID = @AppointmentID;
        
        IF @OldStatusID IS NULL
        BEGIN
            RAISERROR('예약을 찾을 수 없습니다.', 16, 1);
            RETURN;
        END
        
        -- 상태가 변경되었는지 확인
        IF @OldStatusID = @StatusID
        BEGIN
            RAISERROR('예약 상태가 이미 %s입니다.', 0, 1, @StatusName);
            RETURN;
        END
        
        -- 예약 상태 업데이트
        UPDATE Appointments
        SET 
            StatusID = @StatusID,
            Notes = CASE WHEN @Notes IS NOT NULL THEN @Notes ELSE Notes END,
            UpdatedAt = GETDATE()
        WHERE 
            AppointmentID = @AppointmentID;
        
        -- 알림 생성
        IF @StatusName = '확인됨'
            SELECT @NotificationTypeID = TypeID FROM NotificationTypes WHERE TypeName = '예약 확인';
        ELSE IF @StatusName = '취소됨'
            SELECT @NotificationTypeID = TypeID FROM NotificationTypes WHERE TypeName = '예약 취소';
        
        IF @NotificationTypeID IS NOT NULL
        BEGIN
            SELECT 
                @DoctorName = u.FirstName + ' ' + u.LastName,
                @HospitalName = h.Name
            FROM 
                Appointments a
            INNER JOIN 
                Doctors d ON a.DoctorID = d.DoctorID
            INNER JOIN 
                Users u ON d.UserID = u.UserID
            INNER JOIN 
                Hospitals h ON a.HospitalID = h.HospitalID
            WHERE 
                a.AppointmentID = @AppointmentID;
            
            DECLARE @Message NVARCHAR(MAX);
            
            IF @StatusName = '확인됨'
                SET @Message = @DoctorName + ' 의사가 ' + FORMAT(@AppointmentDate, 'yyyy년 MM월 dd일') + ' ' + 
                               FORMAT(CAST(@StartTime AS DATETIME), 'HH:mm') + '에 ' + @HospitalName + '에서의 예약을 확인했습니다.';
            ELSE IF @StatusName = '취소됨'
                SET @Message = FORMAT(@AppointmentDate, 'yyyy년 MM월 dd일') + ' ' + FORMAT(CAST(@StartTime AS DATETIME), 'HH:mm') + 
                               '에 ' + @HospitalName + '에서 ' + @DoctorName + ' 의사와의 예약이 취소되었습니다.';
            
            INSERT INTO Notifications (
                UserID, TypeID, Title, Message, RelatedEntityID, IsRead, CreatedAt
            )
            VALUES (
                @PatientID, @NotificationTypeID, 
                '예약 상태가 변경되었습니다: ' + @StatusName,
                @Message,
                @AppointmentID, 0, GETDATE()
            );
        END
        
        COMMIT TRANSACTION;
        
        -- 업데이트된 예약 정보 반환
        SELECT 
            a.AppointmentID, a.PatientID, a.DoctorID, a.HospitalID, a.AppointmentDate,
            a.StartTime, a.EndTime, a.StatusID, s.StatusName, a.Reason, a.Notes,
            a.CreatedAt, a.UpdatedAt,
            u.FirstName AS DoctorFirstName, u.LastName AS DoctorLastName,
            h.Name AS HospitalName
        FROM 
            Appointments a
        INNER JOIN 
            AppointmentStatuses s ON a.StatusID = s.StatusID
        INNER JOIN 
            Doctors d ON a.DoctorID = d.DoctorID
        INNER JOIN 
            Users u ON d.UserID = u.UserID
        INNER JOIN 
            Hospitals h ON a.HospitalID = h.HospitalID
        WHERE 
            a.AppointmentID = @AppointmentID;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END
GO

-- 5. 환자의 예약 목록 조회 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_GetPatientAppointments]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_GetPatientAppointments]
GO

CREATE PROCEDURE [dbo].[usp_GetPatientAppointments]
    @PatientID INT,
    @IncludePast BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        a.AppointmentID, a.PatientID, a.DoctorID, a.HospitalID, a.AppointmentDate,
        a.StartTime, a.EndTime, a.StatusID, s.StatusName, a.Reason, a.Notes,
        a.CreatedAt, a.UpdatedAt,
        u.FirstName AS DoctorFirstName, u.LastName AS DoctorLastName,
        d.Specialization,
        h.Name AS HospitalName, h.Address AS HospitalAddress, h.City AS HospitalCity
    FROM 
        Appointments a
    INNER JOIN 
        AppointmentStatuses s ON a.StatusID = s.StatusID
    INNER JOIN 
        Doctors d ON a.DoctorID = d.DoctorID
    INNER JOIN 
        Users u ON d.UserID = u.UserID
    INNER JOIN 
        Hospitals h ON a.HospitalID = h.HospitalID
    WHERE 
        a.PatientID = @PatientID AND
        (@IncludePast = 1 OR (a.AppointmentDate > GETDATE() OR 
                              (a.AppointmentDate = CAST(GETDATE() AS DATE) AND a.StartTime > CAST(GETDATE() AS TIME))))
    ORDER BY 
        a.AppointmentDate, a.StartTime;
END
GO

-- 6. 의사의 예약 목록 조회 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_GetDoctorAppointments]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_GetDoctorAppointments]
GO

CREATE PROCEDURE [dbo].[usp_GetDoctorAppointments]
    @DoctorID INT,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @StatusName NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 기본값 설정
    SET @StartDate = ISNULL(@StartDate, CAST(GETDATE() AS DATE));
    SET @EndDate = ISNULL(@EndDate, DATEADD(DAY, 30, @StartDate));
    
    DECLARE @StatusID INT = NULL;
    IF @StatusName IS NOT NULL
        SELECT @StatusID = StatusID FROM AppointmentStatuses WHERE StatusName = @StatusName;
    
    SELECT 
        a.AppointmentID, a.PatientID, a.DoctorID, a.HospitalID, a.AppointmentDate,
        a.StartTime, a.EndTime, a.StatusID, s.StatusName, a.Reason, a.Notes,
        a.CreatedAt, a.UpdatedAt,
        p.FirstName AS PatientFirstName, p.LastName AS PatientLastName, 
        p.PhoneNumber AS PatientPhoneNumber,
        h.Name AS HospitalName
    FROM 
        Appointments a
    INNER JOIN 
        AppointmentStatuses s ON a.StatusID = s.StatusID
    INNER JOIN 
        Users p ON a.PatientID = p.UserID
    INNER JOIN 
        Hospitals h ON a.HospitalID = h.HospitalID
    WHERE 
        a.DoctorID = @DoctorID AND
        a.AppointmentDate BETWEEN @StartDate AND @EndDate AND
        (@StatusID IS NULL OR a.StatusID = @StatusID)
    ORDER BY 
        a.AppointmentDate, a.StartTime;
END
GO

-- 7. 병원별 의사 목록 조회 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_GetDoctorsByHospital]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_GetDoctorsByHospital]
GO

CREATE PROCEDURE [dbo].[usp_GetDoctorsByHospital]
    @HospitalID INT,
    @Specialization NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        d.DoctorID, d.UserID, d.LicenseNumber, d.Specialization, d.Biography,
        d.EducationBackground, d.Experience, d.Rating, d.ConsultationFee,
        u.FirstName, u.LastName, u.Email, u.PhoneNumber, u.ProfileImage
    FROM 
        Doctors d
    INNER JOIN 
        Users u ON d.UserID = u.UserID
    INNER JOIN 
        DoctorHospitals dh ON d.DoctorID = dh.DoctorID
    WHERE 
        dh.HospitalID = @HospitalID AND
        dh.IsActive = 1 AND
        (@Specialization IS NULL OR d.Specialization = @Specialization)
    ORDER BY 
        u.LastName, u.FirstName;
END
GO

-- 8. 병원 검색 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_SearchHospitals]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_SearchHospitals]
GO

CREATE PROCEDURE [dbo].[usp_SearchHospitals]
    @SearchTerm NVARCHAR(100) = NULL,
    @City NVARCHAR(50) = NULL,
    @Offset INT = 0,
    @Limit INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 총 개수 반환
    SELECT COUNT(*) AS TotalCount
    FROM Hospitals
    WHERE 
        IsActive = 1 AND
        (@SearchTerm IS NULL OR Name LIKE '%' + @SearchTerm + '%' OR Description LIKE '%' + @SearchTerm + '%') AND
        (@City IS NULL OR City = @City);
    
    -- 병원 목록 반환
    SELECT 
        HospitalID, Name, Address, City, State, ZipCode, PhoneNumber,
        Email, Website, Description, OpeningHours
    FROM 
        Hospitals
    WHERE 
        IsActive = 1 AND
        (@SearchTerm IS NULL OR Name LIKE '%' + @SearchTerm + '%' OR Description LIKE '%' + @SearchTerm + '%') AND
        (@City IS NULL OR City = @City)
    ORDER BY 
        Name
    OFFSET @Offset ROWS
    FETCH NEXT @Limit ROWS ONLY;
END
GO

-- 9. 진료 기록 생성 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_CreateMedicalRecord]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_CreateMedicalRecord]
GO

CREATE PROCEDURE [dbo].[usp_CreateMedicalRecord]
    @AppointmentID INT,
    @Diagnosis NVARCHAR(MAX),
    @Symptoms NVARCHAR(MAX) = NULL,
    @Treatment NVARCHAR(MAX) = NULL,
    @Prescription NVARCHAR(MAX) = NULL,
    @Notes NVARCHAR(MAX) = NULL,
    @FollowUpDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 예약 정보 가져오기
        DECLARE @PatientID INT, @DoctorID INT;
        
        SELECT 
            @PatientID = PatientID,
            @DoctorID = DoctorID
        FROM 
            Appointments
        WHERE 
            AppointmentID = @AppointmentID;
        
        IF @PatientID IS NULL OR @DoctorID IS NULL
        BEGIN
            RAISERROR('유효하지 않은 예약 ID입니다.', 16, 1);
            RETURN;
        END
        
        -- 진료 기록 생성
        INSERT INTO MedicalRecords (
            AppointmentID, PatientID, DoctorID, Diagnosis, Symptoms,
            Treatment, Prescription, Notes, FollowUpDate, CreatedAt, UpdatedAt
        )
        VALUES (
            @AppointmentID, @PatientID, @DoctorID, @Diagnosis, @Symptoms,
            @Treatment, @Prescription, @Notes, @FollowUpDate, GETDATE(), GETDATE()
        );
        
        -- 예약 상태를 '완료됨'으로 변경
        DECLARE @CompletedStatusID INT;
        SELECT @CompletedStatusID = StatusID FROM AppointmentStatuses WHERE StatusName = '완료됨';
        
        UPDATE Appointments
        SET StatusID = @CompletedStatusID, UpdatedAt = GETDATE()
        WHERE AppointmentID = @AppointmentID;
        
        -- 생성된 진료 기록 ID 반환
        DECLARE @RecordID INT = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
        
        -- 생성된 진료 기록 정보 반환
        SELECT 
            mr.RecordID, mr.AppointmentID, mr.PatientID, mr.DoctorID, mr.Diagnosis,
            mr.Symptoms, mr.Treatment, mr.Prescription, mr.Notes, mr.FollowUpDate,
            mr.CreatedAt, mr.UpdatedAt,
            a.AppointmentDate,
            d.Specialization,
            u.FirstName AS DoctorFirstName, u.LastName AS DoctorLastName,
            h.Name AS HospitalName
        FROM 
            MedicalRecords mr
        INNER JOIN 
            Appointments a ON mr.AppointmentID = a.AppointmentID
        INNER JOIN 
            Doctors d ON mr.DoctorID = d.DoctorID
        INNER JOIN 
            Users u ON d.UserID = u.UserID
        INNER JOIN 
            Hospitals h ON a.HospitalID = h.HospitalID
        WHERE 
            mr.RecordID = @RecordID;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END
GO

-- 10. 환자의 진료 기록 조회 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_GetPatientMedicalRecords]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_GetPatientMedicalRecords]
GO

CREATE PROCEDURE [dbo].[usp_GetPatientMedicalRecords]
    @PatientID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        mr.RecordID, mr.AppointmentID, mr.PatientID, mr.DoctorID, mr.Diagnosis,
        mr.Symptoms, mr.Treatment, mr.Prescription, mr.Notes, mr.FollowUpDate,
        mr.CreatedAt, mr.UpdatedAt,
        a.AppointmentDate,
        d.Specialization,
        u.FirstName AS DoctorFirstName, u.LastName AS DoctorLastName,
        h.Name AS HospitalName
    FROM 
        MedicalRecords mr
    INNER JOIN 
        Appointments a ON mr.AppointmentID = a.AppointmentID
    INNER JOIN 
        Doctors d ON mr.DoctorID = d.DoctorID
    INNER JOIN 
        Users u ON d.UserID = u.UserID
    INNER JOIN 
        Hospitals h ON a.HospitalID = h.HospitalID
    WHERE 
        mr.PatientID = @PatientID
    ORDER BY 
        a.AppointmentDate DESC, mr.CreatedAt DESC;
END
GO

-------------------------
-- 환자 관련 저장 프로시저 --
-------------------------

-- 환자 정보 생성 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_CreatePatient]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_CreatePatient]
GO

CREATE PROCEDURE [dbo].[usp_CreatePatient]
    @UserID INT,
    @BloodType NVARCHAR(10) = NULL,
    @Height DECIMAL(5, 2) = NULL,
    @Weight DECIMAL(5, 2) = NULL,
    @EmergencyContactName NVARCHAR(100) = NULL,
    @EmergencyContactPhone NVARCHAR(20) = NULL,
    @InsuranceProvider NVARCHAR(100) = NULL,
    @InsuranceNumber NVARCHAR(50) = NULL,
    @MedicalHistory NVARCHAR(MAX) = NULL,
    @Allergies NVARCHAR(MAX) = NULL,
    @ChronicConditions NVARCHAR(MAX) = NULL,
    @CurrentMedications NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 사용자 존재 및 환자 역할 확인
    DECLARE @RoleID INT;
    SELECT @RoleID = RoleID FROM Users WHERE UserID = @UserID;
    
    IF @RoleID IS NULL
    BEGIN
        RAISERROR('사용자가 존재하지 않습니다.', 16, 1);
        RETURN;
    END
    
    -- 환자 역할(RoleID) 가져오기
    DECLARE @PatientRoleID INT;
    SELECT @PatientRoleID = RoleID FROM UserRoles WHERE RoleName = 'Patient';
    
    IF @RoleID <> @PatientRoleID
    BEGIN
        RAISERROR('사용자는 환자 역할이 아닙니다.', 16, 1);
        RETURN;
    END
    
    -- 이미 환자 레코드가 있는지 확인
    IF EXISTS (SELECT 1 FROM Patients WHERE UserID = @UserID)
    BEGIN
        RAISERROR('이미 해당 사용자의 환자 정보가 존재합니다.', 16, 1);
        RETURN;
    END
    
    -- 환자 정보 삽입
    INSERT INTO Patients (
        UserID, BloodType, Height, Weight, EmergencyContactName,
        EmergencyContactPhone, InsuranceProvider, InsuranceNumber,
        MedicalHistory, Allergies, ChronicConditions, CurrentMedications,
        CreatedAt, UpdatedAt
    )
    VALUES (
        @UserID, @BloodType, @Height, @Weight, @EmergencyContactName,
        @EmergencyContactPhone, @InsuranceProvider, @InsuranceNumber,
        @MedicalHistory, @Allergies, @ChronicConditions, @CurrentMedications,
        GETDATE(), GETDATE()
    );
    
    -- 생성된 환자 ID 반환
    DECLARE @PatientID INT = SCOPE_IDENTITY();
    
    -- 환자 정보와 사용자 정보 함께 반환
    SELECT 
        p.PatientID, p.UserID, u.FirstName, u.LastName, u.Email, u.PhoneNumber,
        u.DateOfBirth, u.Gender, u.Address, p.BloodType, p.Height, p.Weight,
        p.EmergencyContactName, p.EmergencyContactPhone, p.InsuranceProvider,
        p.InsuranceNumber, p.MedicalHistory, p.Allergies, p.ChronicConditions,
        p.CurrentMedications
    FROM 
        Patients p
    INNER JOIN 
        Users u ON p.UserID = u.UserID
    WHERE 
        p.PatientID = @PatientID;
END
GO

-- 환자 정보 조회 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_GetPatientByID]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_GetPatientByID]
GO

CREATE PROCEDURE [dbo].[usp_GetPatientByID]
    @PatientID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 환자 정보와 사용자 정보 함께 반환
    SELECT 
        p.PatientID, p.UserID, u.FirstName, u.LastName, u.Email, u.PhoneNumber,
        u.DateOfBirth, u.Gender, u.Address, p.BloodType, p.Height, p.Weight,
        p.EmergencyContactName, p.EmergencyContactPhone, p.InsuranceProvider,
        p.InsuranceNumber, p.MedicalHistory, p.Allergies, p.ChronicConditions,
        p.CurrentMedications
    FROM 
        Patients p
    INNER JOIN 
        Users u ON p.UserID = u.UserID
    WHERE 
        p.PatientID = @PatientID;
END
GO

-- 사용자 ID로 환자 정보 조회 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_GetPatientByUserID]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_GetPatientByUserID]
GO

CREATE PROCEDURE [dbo].[usp_GetPatientByUserID]
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 환자 정보와 사용자 정보 함께 반환
    SELECT 
        p.PatientID, p.UserID, u.FirstName, u.LastName, u.Email, u.PhoneNumber,
        u.DateOfBirth, u.Gender, u.Address, p.BloodType, p.Height, p.Weight,
        p.EmergencyContactName, p.EmergencyContactPhone, p.InsuranceProvider,
        p.InsuranceNumber, p.MedicalHistory, p.Allergies, p.ChronicConditions,
        p.CurrentMedications
    FROM 
        Patients p
    INNER JOIN 
        Users u ON p.UserID = u.UserID
    WHERE 
        p.UserID = @UserID;
END
GO

-- 환자 정보 업데이트 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_UpdatePatient]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_UpdatePatient]
GO

CREATE PROCEDURE [dbo].[usp_UpdatePatient]
    @PatientID INT,
    @BloodType NVARCHAR(10) = NULL,
    @Height DECIMAL(5, 2) = NULL,
    @Weight DECIMAL(5, 2) = NULL,
    @EmergencyContactName NVARCHAR(100) = NULL,
    @EmergencyContactPhone NVARCHAR(20) = NULL,
    @InsuranceProvider NVARCHAR(100) = NULL,
    @InsuranceNumber NVARCHAR(50) = NULL,
    @MedicalHistory NVARCHAR(MAX) = NULL,
    @Allergies NVARCHAR(MAX) = NULL,
    @ChronicConditions NVARCHAR(MAX) = NULL,
    @CurrentMedications NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 환자 존재 확인
    IF NOT EXISTS (SELECT 1 FROM Patients WHERE PatientID = @PatientID)
    BEGIN
        RAISERROR('환자 정보를 찾을 수 없습니다.', 16, 1);
        RETURN;
    END
    
    -- 환자 정보 업데이트
    UPDATE Patients
    SET 
        BloodType = CASE WHEN @BloodType IS NOT NULL THEN @BloodType ELSE BloodType END,
        Height = CASE WHEN @Height IS NOT NULL THEN @Height ELSE Height END,
        Weight = CASE WHEN @Weight IS NOT NULL THEN @Weight ELSE Weight END,
        EmergencyContactName = CASE WHEN @EmergencyContactName IS NOT NULL THEN @EmergencyContactName ELSE EmergencyContactName END,
        EmergencyContactPhone = CASE WHEN @EmergencyContactPhone IS NOT NULL THEN @EmergencyContactPhone ELSE EmergencyContactPhone END,
        InsuranceProvider = CASE WHEN @InsuranceProvider IS NOT NULL THEN @InsuranceProvider ELSE InsuranceProvider END,
        InsuranceNumber = CASE WHEN @InsuranceNumber IS NOT NULL THEN @InsuranceNumber ELSE InsuranceNumber END,
        MedicalHistory = CASE WHEN @MedicalHistory IS NOT NULL THEN @MedicalHistory ELSE MedicalHistory END,
        Allergies = CASE WHEN @Allergies IS NOT NULL THEN @Allergies ELSE Allergies END,
        ChronicConditions = CASE WHEN @ChronicConditions IS NOT NULL THEN @ChronicConditions ELSE ChronicConditions END,
        CurrentMedications = CASE WHEN @CurrentMedications IS NOT NULL THEN @CurrentMedications ELSE CurrentMedications END,
        UpdatedAt = GETDATE()
    WHERE 
        PatientID = @PatientID;
    
    -- 업데이트된 환자 정보 반환
    SELECT 
        p.PatientID, p.UserID, u.FirstName, u.LastName, u.Email, u.PhoneNumber,
        u.DateOfBirth, u.Gender, u.Address, p.BloodType, p.Height, p.Weight,
        p.EmergencyContactName, p.EmergencyContactPhone, p.InsuranceProvider,
        p.InsuranceNumber, p.MedicalHistory, p.Allergies, p.ChronicConditions,
        p.CurrentMedications
    FROM 
        Patients p
    INNER JOIN 
        Users u ON p.UserID = u.UserID
    WHERE 
        p.PatientID = @PatientID;
END
GO

-- 환자 알레르기 추가 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_AddPatientAllergy]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_AddPatientAllergy]
GO

CREATE PROCEDURE [dbo].[usp_AddPatientAllergy]
    @PatientID INT,
    @AllergyName NVARCHAR(100),
    @AllergyType NVARCHAR(50) = NULL,
    @Severity NVARCHAR(20) = NULL,
    @Reaction NVARCHAR(255) = NULL,
    @DiagnosedDate DATE = NULL,
    @Notes NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 환자 존재 확인
    IF NOT EXISTS (SELECT 1 FROM Patients WHERE PatientID = @PatientID)
    BEGIN
        RAISERROR('환자 정보를 찾을 수 없습니다.', 16, 1);
        RETURN;
    END
    
    -- 이미 같은 알레르기가 등록되어 있는지 확인
    IF EXISTS (SELECT 1 FROM PatientAllergies WHERE PatientID = @PatientID AND AllergyName = @AllergyName AND IsActive = 1)
    BEGIN
        RAISERROR('이미 등록된 알레르기입니다.', 16, 1);
        RETURN;
    END
    
    -- 알레르기 정보 삽입
    INSERT INTO PatientAllergies (
        PatientID, AllergyName, AllergyType, Severity, Reaction,
        DiagnosedDate, Notes, IsActive, CreatedAt, UpdatedAt
    )
    VALUES (
        @PatientID, @AllergyName, @AllergyType, @Severity, @Reaction,
        @DiagnosedDate, @Notes, 1, GETDATE(), GETDATE()
    );
    
    -- 생성된 알레르기 ID 반환
    DECLARE @AllergyID INT = SCOPE_IDENTITY();
    
    -- 알레르기 정보 반환
    SELECT 
        AllergyID, PatientID, AllergyName, AllergyType, Severity,
        Reaction, DiagnosedDate, Notes, IsActive, CreatedAt, UpdatedAt
    FROM 
        PatientAllergies
    WHERE 
        AllergyID = @AllergyID;
END
GO

-- 환자 알레르기 목록 조회 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_GetPatientAllergies]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_GetPatientAllergies]
GO

CREATE PROCEDURE [dbo].[usp_GetPatientAllergies]
    @PatientID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 환자의 알레르기 목록 반환
    SELECT 
        AllergyID, PatientID, AllergyName, AllergyType, Severity,
        Reaction, DiagnosedDate, Notes, IsActive, CreatedAt, UpdatedAt
    FROM 
        PatientAllergies
    WHERE 
        PatientID = @PatientID AND IsActive = 1
    ORDER BY 
        AllergyName;
END
GO

-- 환자 건강 지표 기록 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_AddPatientHealthMetric]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_AddPatientHealthMetric]
GO

CREATE PROCEDURE [dbo].[usp_AddPatientHealthMetric]
    @PatientID INT,
    @RecordDate DATE,
    @Weight DECIMAL(5, 2) = NULL,
    @Height DECIMAL(5, 2) = NULL,
    @BloodPressureSystolic INT = NULL,
    @BloodPressureDiastolic INT = NULL,
    @HeartRate INT = NULL,
    @BloodSugar DECIMAL(5, 2) = NULL,
    @Cholesterol DECIMAL(5, 2) = NULL,
    @Temperature DECIMAL(5, 2) = NULL,
    @Notes NVARCHAR(MAX) = NULL,
    @RecordedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 환자 존재 확인
    IF NOT EXISTS (SELECT 1 FROM Patients WHERE PatientID = @PatientID)
    BEGIN
        RAISERROR('환자 정보를 찾을 수 없습니다.', 16, 1);
        RETURN;
    END
    
    -- BMI 계산
    DECLARE @BMI DECIMAL(5, 2) = NULL;
    IF @Weight IS NOT NULL AND @Height IS NOT NULL AND @Height > 0
    BEGIN
        SET @BMI = @Weight / POWER(@Height / 100, 2);
    END
    
    -- 건강 지표 정보 삽입
    INSERT INTO PatientHealthMetrics (
        PatientID, RecordDate, Weight, Height, BMI,
        BloodPressureSystolic, BloodPressureDiastolic, HeartRate,
        BloodSugar, Cholesterol, Temperature, Notes, RecordedBy,
        CreatedAt, UpdatedAt
    )
    VALUES (
        @PatientID, @RecordDate, @Weight, @Height, @BMI,
        @BloodPressureSystolic, @BloodPressureDiastolic, @HeartRate,
        @BloodSugar, @Cholesterol, @Temperature, @Notes, @RecordedBy,
        GETDATE(), GETDATE()
    );
    
    -- 생성된 지표 ID 반환
    DECLARE @MetricID INT = SCOPE_IDENTITY();
    
    -- 환자 정보에 최신 키/몸무게 업데이트
    IF @Weight IS NOT NULL OR @Height IS NOT NULL
    BEGIN
        UPDATE Patients
        SET 
            Weight = CASE WHEN @Weight IS NOT NULL THEN @Weight ELSE Weight END,
            Height = CASE WHEN @Height IS NOT NULL THEN @Height ELSE Height END,
            UpdatedAt = GETDATE()
        WHERE 
            PatientID = @PatientID;
    END
    
    -- 생성된 건강 지표 정보 반환
    SELECT 
        MetricID, PatientID, RecordDate, Weight, Height, BMI,
        BloodPressureSystolic, BloodPressureDiastolic, HeartRate,
        BloodSugar, Cholesterol, Temperature, Notes, RecordedBy,
        CreatedAt, UpdatedAt
    FROM 
        PatientHealthMetrics
    WHERE 
        MetricID = @MetricID;
END
GO

-- 환자 건강 지표 조회 저장 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_GetPatientHealthMetrics]') AND type in (N'P'))
DROP PROCEDURE [dbo].[usp_GetPatientHealthMetrics]
GO

CREATE PROCEDURE [dbo].[usp_GetPatientHealthMetrics]
    @PatientID INT,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 기본 날짜 범위 설정 (지난 1년)
    IF @StartDate IS NULL
        SET @StartDate = DATEADD(YEAR, -1, GETDATE());
    
    IF @EndDate IS NULL
        SET @EndDate = GETDATE();
    
    -- 환자의 건강 지표 목록 반환
    SELECT 
        MetricID, PatientID, RecordDate, Weight, Height, BMI,
        BloodPressureSystolic, BloodPressureDiastolic, HeartRate,
        BloodSugar, Cholesterol, Temperature, Notes, 
        RecordedBy, d.FirstName + ' ' + d.LastName AS DoctorName,
        phm.CreatedAt, phm.UpdatedAt
    FROM 
        PatientHealthMetrics phm
    LEFT JOIN 
        Doctors dr ON phm.RecordedBy = dr.DoctorID
    LEFT JOIN 
        Users d ON dr.UserID = d.UserID
    WHERE 
        phm.PatientID = @PatientID AND
        phm.RecordDate BETWEEN @StartDate AND @EndDate
    ORDER BY 
        phm.RecordDate DESC;
END
GO

PRINT '저장 프로시저가 성공적으로 생성되었습니다.'
GO 