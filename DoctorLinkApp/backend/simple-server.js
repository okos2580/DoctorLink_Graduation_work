const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

console.log('서버 시작 중...');

// 미들웨어
app.use(cors());
app.use(express.json());

// 로그 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 헬스 체크
app.get('/api/health', (req, res) => {
  console.log('Health check 요청 받음');
  res.json({
    success: true,
    message: 'DoctorLink API 서버가 정상적으로 작동 중입니다.',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// Mock 로그인 API
app.post('/api/auth/login', (req, res) => {
  console.log('로그인 요청:', req.body);
  
  const { email, password } = req.body;
  
  // Mock 사용자 데이터
  if (email === 'test@test.com' && password === 'test123') {
    res.json({
      success: true,
      message: '로그인이 완료되었습니다.',
      data: {
        user: {
          id: 'mock-user-1',
          email: 'test@test.com',
          name: '테스트 사용자',
          phone: '010-1234-5678',
          birthDate: '1990-01-01',
          gender: 'male',
          role: 'patient',
          status: 'active'
        },
        tokens: {
          accessToken: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now()
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      error: 'INVALID_CREDENTIALS'
    });
  }
});

// Mock 병원 목록 API
app.get('/api/hospitals', (req, res) => {
  console.log('병원 목록 요청:', req.query);
  
  res.json({
    success: true,
    message: '병원 목록을 조회했습니다.',
    data: {
      hospitals: [
        {
          id: 'mock-hospital-1',
          name: '서울대학교병원',
          address: '서울특별시 종로구 대학로 101',
          phone: '02-2072-2114',
          type: '종합병원',
          departments: ['내과', '외과', '소아과'],
          rating: 4.5,
          reviewCount: 1234,
          distance: 2.3
        },
        {
          id: 'mock-hospital-2',
          name: '삼성서울병원',
          address: '서울특별시 강남구 일원로 81',
          phone: '02-3410-2114',
          type: '종합병원',
          departments: ['내과', '외과', '암센터'],
          rating: 4.7,
          reviewCount: 2345,
          distance: 5.1
        }
      ],
      total: 2,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      }
    }
  });
});

// 404 에러 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `요청하신 경로 '${req.originalUrl}'를 찾을 수 없습니다.`,
    error: 'ENDPOINT_NOT_FOUND'
  });
});

// 에러 핸들러
app.use((error, req, res, next) => {
  console.error('서버 오류:', error);
  res.status(500).json({
    success: false,
    message: '서버 내부 오류가 발생했습니다.',
    error: 'INTERNAL_SERVER_ERROR'
  });
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DoctorLink API 서버가 포트 ${PORT}에서 시작되었습니다.`);
  console.log(`🌍 모든 IP에서 접근 가능: http://0.0.0.0:${PORT}`);
  console.log(`💚 헬스 체크: http://localhost:${PORT}/api/health`);
  console.log(`🔑 테스트 계정: test@test.com / test123`);
});

module.exports = app;