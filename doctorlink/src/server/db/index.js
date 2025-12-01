// SQL Server 연결 및 저장 프로시저 호출 모듈
const sql = require('mssql');
require('dotenv').config();

// 데이터베이스 연결 설정
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '9tta3232580@',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'DoctorLink',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// 연결 풀 생성
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', err => {
  console.error('SQL Server 연결 오류:', err);
});

// 데이터베이스 연결 테스트
async function testConnection() {
  try {
    await poolConnect;
    console.log('SQL Server에 성공적으로 연결되었습니다.');

    // 테스트용 간단한 쿼리 실행
    const result = await pool.request().query('SELECT TOP 5 * FROM Users');
    console.log('사용자 데이터 샘플:', result.recordset);
    
    return true;
  } catch (err) {
    console.error('데이터베이스 연결 실패:', err);
    return false;
  }
}

/**
 * 저장 프로시저 실행 함수
 * @param {string} procedureName - 실행할 저장 프로시저 이름
 * @param {Object} params - 저장 프로시저 매개변수 객체 (예: { param1: value1, param2: value2 })
 * @returns {Promise<Object>} - 저장 프로시저 실행 결과
 */
async function executeStoredProcedure(procedureName, params = {}) {
  try {
    await poolConnect;
    
    const request = pool.request();
    
    // 매개변수 추가
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    // 저장 프로시저 실행
    const result = await request.execute(procedureName);
    
    return {
      success: true,
      recordsets: result.recordsets,
      recordset: result.recordset,
      returnValue: result.returnValue,
      rowsAffected: result.rowsAffected
    };
  } catch (err) {
    console.error(`저장 프로시저 [${procedureName}] 실행 오류:`, err);
    return {
      success: false,
      error: err.message,
      code: err.code || 'UNKNOWN'
    };
  }
}

/**
 * SQL 쿼리 실행 함수
 * @param {string} query - 실행할 SQL 쿼리
 * @param {Object} params - SQL 쿼리 매개변수 객체 (예: { param1: value1, param2: value2 })
 * @returns {Promise<Object>} - SQL 쿼리 실행 결과
 */
async function executeQuery(query, params = {}) {
  try {
    await poolConnect;
    
    const request = pool.request();
    
    // 매개변수 추가
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    // SQL 쿼리 실행
    const result = await request.query(query);
    
    return {
      success: true,
      recordset: result.recordset,
      rowsAffected: result.rowsAffected
    };
  } catch (err) {
    console.error('SQL 쿼리 실행 오류:', err);
    return {
      success: false,
      error: err.message,
      code: err.code || 'UNKNOWN'
    };
  }
}

/**
 * 트랜잭션 실행 함수
 * @param {Function} callback - 트랜잭션 내에서 실행할 콜백 함수
 * @returns {Promise<Object>} - 트랜잭션 실행 결과
 */
async function executeTransaction(callback) {
  const transaction = new sql.Transaction(pool);
  
  try {
    await poolConnect;
    await transaction.begin();
    
    const result = await callback(transaction);
    
    await transaction.commit();
    
    return {
      success: true,
      result
    };
  } catch (err) {
    await transaction.rollback();
    console.error('트랜잭션 실행 오류:', err);
    
    return {
      success: false,
      error: err.message,
      code: err.code || 'UNKNOWN'
    };
  }
}

// 테스트용 함수: 기본 데이터 확인
async function checkBasicData() {
  try {
    await poolConnect;
    
    // 각 기본 테이블 데이터 확인
    const tables = ['UserRoles', 'Users', 'Doctors', 'Hospitals', 'AppointmentStatuses'];
    const results = {};
    
    for (const table of tables) {
      const result = await pool.request().query(`SELECT COUNT(*) AS Count FROM ${table}`);
      results[table] = result.recordset[0].Count;
    }
    
    console.log('기본 테이블 데이터 개수:', results);
    return results;
  } catch (err) {
    console.error('기본 데이터 확인 오류:', err);
    return null;
  }
}

// 예제: 사용자 인증 저장 프로시저 사용
async function authenticateUser(username, password) {
  return await executeStoredProcedure('usp_AuthenticateUser', {
    Username: username,
    Password: password
  });
}

// 예제: 의사 예약 가능 시간 확인 저장 프로시저 사용
async function checkDoctorAvailability(doctorId, hospitalId, appointmentDate) {
  return await executeStoredProcedure('usp_CheckDoctorAvailability', {
    DoctorID: doctorId,
    HospitalID: hospitalId,
    AppointmentDate: appointmentDate
  });
}

// 예제: 예약 생성 저장 프로시저 사용
async function createAppointment(patientId, doctorId, hospitalId, appointmentDate, startTime, endTime, reason) {
  return await executeStoredProcedure('usp_CreateAppointment', {
    PatientID: patientId,
    DoctorID: doctorId,
    HospitalID: hospitalId,
    AppointmentDate: appointmentDate,
    StartTime: startTime,
    EndTime: endTime,
    Reason: reason
  });
}

module.exports = {
  pool,
  testConnection,
  executeStoredProcedure,
  executeQuery,
  executeTransaction,
  checkBasicData,
  authenticateUser,
  checkDoctorAvailability,
  createAppointment
}; 