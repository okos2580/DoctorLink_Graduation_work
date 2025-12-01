import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

// MSSQL 데이터베이스 설정
const dbConfig: sql.config = {
  server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'master', // 기본 데이터베이스로 연결
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: false, // 로컬 개발 환경에서는 false
    trustServerCertificate: true,
    enableArithAbort: true,
    integratedSecurity: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

// 데이터베이스 연결 풀
let pool: sql.ConnectionPool | null = null;

// 데이터베이스 연결 함수
export const connectDB = async (): Promise<sql.ConnectionPool> => {
  try {
    if (pool && pool.connected) {
      return pool;
    }

    console.log('🔄 MSSQL 데이터베이스 연결 중...');
    pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log('✅ MSSQL 데이터베이스 연결 성공');
    
    return pool;
  } catch (error) {
    console.error('❌ MSSQL 데이터베이스 연결 실패:', error);
    throw error;
  }
};

// 데이터베이스 연결 해제 함수
export const disconnectDB = async (): Promise<void> => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('🔌 MSSQL 데이터베이스 연결 해제');
    }
  } catch (error) {
    console.error('❌ MSSQL 데이터베이스 연결 해제 실패:', error);
    throw error;
  }
};

// 데이터베이스 연결 풀 가져오기
export const getPool = (): sql.ConnectionPool => {
  if (!pool || !pool.connected) {
    throw new Error('데이터베이스가 연결되지 않았습니다.');
  }
  return pool;
};

// 데이터베이스 상태 확인
export const checkDBConnection = async (): Promise<boolean> => {
  try {
    const currentPool = await connectDB();
    const result = await currentPool.request().query('SELECT 1 as test');
    return result.recordset.length > 0;
  } catch (error) {
    console.error('데이터베이스 연결 상태 확인 실패:', error);
    return false;
  }
};

// 트랜잭션 실행 헬퍼 함수
export const executeTransaction = async <T>(
  callback: (transaction: sql.Transaction) => Promise<T>
): Promise<T> => {
  const currentPool = await connectDB();
  const transaction = new sql.Transaction(currentPool);
  
  try {
    await transaction.begin();
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default dbConfig;
