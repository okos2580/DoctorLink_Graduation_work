import sql from 'mssql';

// 데이터베이스 연결 구성
const config = {
  user: process.env.REACT_APP_DB_USER || 'sa',
  password: process.env.REACT_APP_DB_PASSWORD || '9tta3232580@',
  server: process.env.REACT_APP_DB_SERVER || 'localhost',
  database: process.env.REACT_APP_DB_NAME || 'DoctorLink',
  options: {
    encrypt: false, // 개발 환경에서는 암호화를 비활성화
    trustServerCertificate: true, // 개발 환경에서는 자체 서명 인증서 신뢰
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// 데이터베이스 연결 풀 생성
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool: sql.ConnectionPool) => {
    console.log('Connected to MSSQL Database');
    return pool;
  })
  .catch((err: Error) => {
    console.error('Database Connection Failed: ', err);
    throw err;
  });

/**
 * 데이터베이스 서비스 클래스
 * SQL Server 데이터베이스와의 상호작용을 담당
 */
export default class DatabaseService {
  /**
   * 저장 프로시저 실행
   * @param procedureName 실행할 저장 프로시저 이름
   * @param parameters 프로시저에 전달할 매개변수
   * @returns 프로시저 실행 결과
   */
  static async executeStoredProcedure(procedureName: string, parameters: Record<string, any> = {}) {
    try {
      const pool = await poolPromise;
      const request = pool.request();

      // 매개변수 추가
      Object.entries(parameters).forEach(([name, value]) => {
        request.input(name, value);
      });

      // 프로시저 실행
      const result = await request.execute(procedureName);
      return result;
    } catch (error) {
      console.error(`Error executing stored procedure ${procedureName}:`, error);
      throw error;
    }
  }

  /**
   * SQL 쿼리 실행
   * @param query 실행할 SQL 쿼리
   * @param parameters 쿼리에 전달할 매개변수
   * @returns 쿼리 실행 결과
   */
  static async executeQuery(query: string, parameters: Record<string, any> = {}) {
    try {
      const pool = await poolPromise;
      const request = pool.request();

      // 매개변수 추가
      Object.entries(parameters).forEach(([name, value]) => {
        request.input(name, value);
      });

      // 쿼리 실행
      const result = await request.query(query);
      return result;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  /**
   * 트랜잭션 실행
   * @param callback 트랜잭션 내에서 실행할 콜백 함수
   * @returns 트랜잭션 실행 결과
   */
  static async executeTransaction(callback: (transaction: sql.Transaction) => Promise<any>) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      console.error('Transaction failed:', error);
      throw error;
    }
  }
}

// 데이터베이스 타입 정의
export interface User {
  UserID: number;
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
  PhoneNumber?: string;
  DateOfBirth?: Date;
  Gender?: string;
  Address?: string;
  RoleID: number;
  RoleName?: string;
  ProfileImage?: string;
  CreatedAt: Date;
  UpdatedAt: Date;
  LastLogin?: Date;
  IsActive: boolean;
}

export interface Doctor {
  DoctorID: number;
  UserID: number;
  LicenseNumber: string;
  Specialization: string;
  Biography?: string;
  EducationBackground?: string;
  Experience?: number;
  Rating?: number;
  ConsultationFee?: number;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  PhoneNumber?: string;
}

export interface Hospital {
  HospitalID: number;
  Name: string;
  Address: string;
  City: string;
  State?: string;
  ZipCode?: string;
  PhoneNumber: string;
  Email?: string;
  Website?: string;
  Description?: string;
  OpeningHours?: string;
  IsActive: boolean;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface Appointment {
  AppointmentID: number;
  PatientID: number;
  DoctorID: number;
  HospitalID: number;
  AppointmentDate: Date;
  StartTime: Date;
  EndTime: Date;
  StatusID: number;
  StatusName?: string;
  Reason?: string;
  Notes?: string;
  CreatedAt: Date;
  UpdatedAt: Date;
  DoctorFirstName?: string;
  DoctorLastName?: string;
  HospitalName?: string;
}

export interface MedicalRecord {
  RecordID: number;
  AppointmentID: number;
  PatientID: number;
  DoctorID: number;
  Diagnosis: string;
  Symptoms?: string;
  Treatment?: string;
  Prescription?: string;
  Notes?: string;
  FollowUpDate?: Date;
  CreatedAt: Date;
  UpdatedAt: Date;
  AppointmentDate?: Date;
  DoctorFirstName?: string;
  DoctorLastName?: string;
  Specialization?: string;
  HospitalName?: string;
}

export interface Notification {
  NotificationID: number;
  UserID: number;
  TypeID: number;
  Title: string;
  Message: string;
  RelatedEntityID?: number;
  IsRead: boolean;
  CreatedAt: Date;
} 