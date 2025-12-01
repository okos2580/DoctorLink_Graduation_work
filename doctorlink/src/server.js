const sql = require('mssql');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// .env 파일 로드
dotenv.config();

// Express 앱 설정
const app = express();
app.use(cors());
app.use(express.json());

// 데이터베이스 연결 구성 (SQL 인증 사용)
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '9tta3232580@',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'DoctorLink',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

// 현재 연결 설정 표시 (비밀번호 제외)
console.log('데이터베이스 연결 설정 (SQL 인증 - SA):', {
  user: config.user,
  server: config.server,
  database: config.database,
  options: config.options
});

// 데이터베이스 연결 테스트
async function testConnection() {
  try {
    console.log('데이터베이스 연결 시도 중...');
    await sql.connect(config);
    console.log('데이터베이스 연결 성공!');
    
    // 간단한 쿼리 실행
    const result = await sql.query`SELECT TOP 5 * FROM Users`;
    console.log('사용자 데이터 샘플:', result.recordset);
    
    return 'DB 연결 성공';
  } catch (err) {
    console.error('데이터베이스 연결 실패:', err);
    return `DB 연결 실패: ${err.message}`;
  } finally {
    try {
      await sql.close();
    } catch (err) {
      console.error('데이터베이스 연결 종료 실패:', err);
    }
  }
}

// 데이터베이스 연결 테스트 엔드포인트
app.get('/api/test-connection', async (req, res) => {
  const result = await testConnection();
  res.json({ message: result });
});

// 서버 시작
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
  
  // 시작 시 데이터베이스 연결 테스트
  testConnection();
});

// Node.js에서 예기치 않은 오류 처리
process.on('unhandledRejection', (err) => {
  console.error('처리되지 않은 Promise rejection:', err);
}); 