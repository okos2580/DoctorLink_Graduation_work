require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const fetch = require('node-fetch');

// Mock 데이터
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

// 서버 생성
const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? true : ['http://localhost:3000'],
  credentials: true
}));

// Content Security Policy 헤더 설정
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dapi.kakao.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://dapi.kakao.com; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "media-src 'self'; " +
    "frame-src 'self';"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 기본 루트 경로
app.get('/api', (req, res) => {
  res.json({ message: 'DoctorLink API 서버가 실행 중입니다.' });
});

// 서버 연결 상태 확인 (Ping)
app.get('/api/ping', (req, res) => {
  res.json({ 
    success: true, 
    message: 'pong',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// 로그인 엔드포인트
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '사용자 이름과 비밀번호는 필수 항목입니다.' 
      });
    }
    
    // Mock 사용자로 인증
    const user = mockUsers.find(u => 
      u.Username === username && 
      (password === 'password123' || password === 'admin123')
    );
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '잘못된 사용자 이름 또는 비밀번호입니다.' 
      });
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        id: user.UserID, 
        role: user.RoleName 
      },
      process.env.JWT_SECRET || 'doctorlink-jwt-secret',
      { expiresIn: '24h' }
    );
    
    // 쿠키 설정 (선택적)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24시간
    });
    
    // 사용자 정보 및 토큰 반환
    return res.json({
      success: true,
      message: '로그인 성공',
      data: {
        token,
        user: {
          id: user.UserID,
          username: user.Username,
          email: user.Email,
          firstName: user.FirstName,
          lastName: user.LastName,
          role: user.RoleName,
          profileImage: user.ProfileImage
        }
      }
    });
  } catch (err) {
    console.error('로그인 오류:', err);
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

// 회원가입 엔드포인트
app.post('/api/auth/register', async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      firstName, 
      lastName, 
      phoneNumber, 
      dateOfBirth, 
      gender 
    } = req.body;
    
    // 기본 검증
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '사용자 이름, 이메일, 비밀번호는 필수 항목입니다.' 
      });
    }
    
    // 새로운 사용자 ID 생성 (Mock)
    const newUserId = Math.floor(Math.random() * 10000) + 100;
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        id: newUserId,
        role: 'Patient'
      },
      process.env.JWT_SECRET || 'doctorlink-jwt-secret',
      { expiresIn: '24h' }
    );
    
    // 쿠키 설정 (선택적)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24시간
    });
    
    return res.status(201).json({
      success: true,
      message: '회원 가입이 완료되었습니다.',
      data: {
        token,
        user: {
          id: newUserId,
          username,
          email,
          firstName: firstName || '사용자',
          lastName: lastName || '',  
          role: 'Patient'
        }
      }
    });
  } catch (err) {
    console.error('회원 가입 오류:', err);
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

// 카카오 로그인 엔드포인트
app.post('/api/auth/kakao-login', async (req, res) => {
  try {
    const { accessToken, userInfo } = req.body;
    
    if (!accessToken || !userInfo) {
      return res.status(400).json({ 
        success: false, 
        message: '카카오 액세스 토큰과 사용자 정보가 필요합니다.' 
      });
    }
    
    // 새로운 사용자 ID 생성 (Mock)
    const newUserId = Math.floor(Math.random() * 10000) + 200;
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        id: newUserId, 
        role: 'Patient',
        loginType: 'kakao'
      },
      process.env.JWT_SECRET || 'doctorlink-jwt-secret',
      { expiresIn: '24h' }
    );
    
    // 쿠키 설정
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24시간
    });
    
    // 사용자 정보 및 토큰 반환
    return res.json({
      success: true,
      message: '카카오 로그인 성공',
      data: {
        token,
        user: {
          id: newUserId,
          username: `kakao_${userInfo.id}`,
          email: userInfo.kakao_account?.email || '',
          firstName: userInfo.kakao_account?.profile?.nickname || '카카오',
          lastName: '사용자',
          role: 'Patient',
          profileImage: userInfo.kakao_account?.profile?.profile_image_url || null,
          loginType: 'kakao'
        }
      }
    });
  } catch (err) {
    console.error('카카오 로그인 오류:', err);
    res.status(500).json({ 
      success: false, 
      message: '카카오 로그인 중 서버 오류가 발생했습니다.' 
    });
  }
});

// 로그아웃 엔드포인트
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: '로그아웃 되었습니다.' });
});

// 사용자 프로필 조회
app.get('/api/user/profile', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }
    
    // Mock 사용자 정보 반환
    return res.json({
      success: true,
      data: {
        id: '1',
        name: '홍길동',
        email: 'user@example.com',
        phone: '010-1234-5678',
        birthDate: '1990-01-01',
        gender: 'male'
      }
    });
  } catch (error) {
    console.error('사용자 프로필 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 사용자 예약 목록 조회
app.get('/api/user/reservations', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }
    
    // TODO: JWT 토큰에서 사용자 ID 추출 후 예약 목록 조회
    // 임시로 빈 배열 반환
    return res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('사용자 예약 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 카카오맵 API 프록시 엔드포인트
app.get('/api/kakao/search', async (req, res) => {
  try {
    const { query, x, y, radius, page, size } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: '검색어가 필요합니다.'
      });
    }
    
    // 실제 카카오맵 API 키들 (유효한 키 순서대로 배치)
    const apiKeys = [
      // 실제 유효한 카카오맵 API 키들 (우선순위)
      'c3316882e0900b5f3395b79433383810', // REST API 키 (우선순위 1)
      'd3ff807560a1c14b33d5b235cafd2a45', // 어드민 키 (우선순위 2)
      // 환경 변수에서 가져오는 키들
      process.env.REACT_APP_KAKAO_REST_API_KEY,
      process.env.KAKAO_REST_API_KEY,
    ].filter(Boolean);
    
    // API 키 유효성 미리 확인
    if (apiKeys.length === 0) {
      console.error('❌ 사용 가능한 카카오맵 API 키가 없습니다');
      return res.status(500).json({
        success: false,
        message: '카카오맵 API 키가 설정되지 않았습니다.',
        error: 'NO_API_KEYS'
      });
    }
    
    console.log(`카카오맵 API 검색 시작: "${query}"`);
    console.log(`사용 가능한 API 키 수: ${apiKeys.length}`);
    
    for (let i = 0; i < apiKeys.length; i++) {
      const kakaoRestApiKey = apiKeys[i];
      console.log(`API 키 ${i + 1} 시도 중...`);
      
      try {
        // 카카오맵 REST API 호출
        const kakaoUrl = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
        kakaoUrl.searchParams.append('query', query);
        kakaoUrl.searchParams.append('page', page || '1');
        kakaoUrl.searchParams.append('size', size || '15');
        
        if (x && y) {
          kakaoUrl.searchParams.append('x', x);
          kakaoUrl.searchParams.append('y', y);
          kakaoUrl.searchParams.append('radius', radius || '10000');
          kakaoUrl.searchParams.append('sort', 'distance');
        }
        
        console.log('카카오맵 API 호출 URL:', kakaoUrl.toString());
        console.log(`사용 중인 API 키: ${kakaoRestApiKey.substring(0, 8)}...${kakaoRestApiKey.substring(kakaoRestApiKey.length - 4)}`);
        
        const response = await fetch(kakaoUrl.toString(), {
          method: 'GET',
          headers: {
            'Authorization': `KakaoAK ${kakaoRestApiKey}`,
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'http://localhost:3000',
            'Origin': 'http://localhost:5000'
          },
          timeout: 15000 // 15초 타임아웃으로 증가
        });
        
        console.log(`API 응답 상태: ${response.status} ${response.statusText}`);
        
        // 응답 헤더 로깅 (디버깅용)
        if (response.status !== 200) {
          console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));
        }
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ 카카오맵 API 성공 (키 ${i + 1}):`, {
            total_count: data.meta?.total_count || 0,
            documents_count: data.documents?.length || 0
          });
          
          return res.json({
            success: true,
            data: data,
            apiKeyUsed: i + 1
          });
        } else if (response.status === 401) {
          const errorBody = await response.text();
          console.warn(`⚠️ API 키 ${i + 1} 인증 실패 (Unauthorized):`, errorBody);
          console.warn(`🔍 사용된 키: ${kakaoRestApiKey}`);
          continue; // 다음 키 시도
        } else if (response.status === 429) {
          const errorBody = await response.text();
          console.warn(`⚠️ API 키 ${i + 1} 할당량 초과 (Rate Limit):`, errorBody);
          console.warn(`🔍 사용된 키: ${kakaoRestApiKey}`);
          continue; // 다음 키 시도
        } else if (response.status === 403) {
          const errorBody = await response.text();
          console.warn(`⚠️ API 키 ${i + 1} 접근 금지 (Forbidden):`, errorBody);
          console.warn(`🔍 사용된 키: ${kakaoRestApiKey}`);
          continue; // 다음 키 시도
        } else {
          const errorBody = await response.text();
          console.error(`❌ API 키 ${i + 1} 오류 (${response.status}):`, errorBody);
          console.error(`🔍 사용된 키: ${kakaoRestApiKey}`);
          console.error(`🌐 요청 URL: ${kakaoUrl.toString()}`);
          continue; // 다음 키 시도
        }
        
      } catch (fetchError) {
        console.error(`❌ API 키 ${i + 1} 네트워크 오류:`, fetchError.message);
        continue; // 다음 키 시도
      }
    }
    
    // 모든 API 키가 실패한 경우 - 마지막 시도로 다른 엔드포인트 사용
    console.error('❌ 모든 카카오맵 API 키 실패');
    console.log('🔄 카카오맵 장소 검색 API로 재시도...');
    
    // 장소 검색 API로 재시도 (다른 엔드포인트)
    try {
      const placeSearchUrl = new URL('https://dapi.kakao.com/v2/local/search/category.json');
      placeSearchUrl.searchParams.append('category_group_code', 'HP8'); // 병원 카테고리
      placeSearchUrl.searchParams.append('page', page || '1');
      placeSearchUrl.searchParams.append('size', size || '15');
      
      if (x && y) {
        placeSearchUrl.searchParams.append('x', x);
        placeSearchUrl.searchParams.append('y', y);
        placeSearchUrl.searchParams.append('radius', radius || '10000');
        placeSearchUrl.searchParams.append('sort', 'distance');
      } else {
        // 청주시 기본 좌표
        placeSearchUrl.searchParams.append('x', '127.4562');
        placeSearchUrl.searchParams.append('y', '36.6293');
        placeSearchUrl.searchParams.append('radius', '20000');
      }
      
      console.log('장소 검색 API 호출:', placeSearchUrl.toString());
      
      for (let i = 0; i < apiKeys.length; i++) {
        const kakaoRestApiKey = apiKeys[i];
        console.log(`장소 검색 API 키 ${i + 1} 시도...`);
        
        try {
          const placeResponse = await fetch(placeSearchUrl.toString(), {
            method: 'GET',
            headers: {
              'Authorization': `KakaoAK ${kakaoRestApiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          });
          
          if (placeResponse.ok) {
            const placeData = await placeResponse.json();
            console.log(`✅ 장소 검색 API 성공 (키 ${i + 1}):`, {
              total_count: placeData.meta?.total_count || 0,
              documents_count: placeData.documents?.length || 0
            });
            
            if (placeData.documents && placeData.documents.length > 0) {
              return res.json({
                success: true,
                data: placeData,
                apiKeyUsed: i + 1,
                apiType: 'category_search'
              });
            }
          } else {
            console.warn(`장소 검색 API 키 ${i + 1} 실패:`, placeResponse.status);
          }
        } catch (placeError) {
          console.error(`장소 검색 API 키 ${i + 1} 오류:`, placeError.message);
        }
      }
    } catch (placeSearchError) {
      console.error('장소 검색 API 전체 실패:', placeSearchError.message);
    }
    
    console.log('🔄 대체 데이터 제공 (모든 API 호출 실패)');
    
        // 청주 지역 병원 대체 데이터 (더 풍부한 데이터)
        const fallbackHospitals = {
          meta: {
            total_count: 25,
            pageable_count: 25,
            is_end: true
          },
          documents: [
            {
              id: 'fallback_1',
              place_name: '청주성모병원',
              category_name: '의료,병원 > 종합병원',
              address_name: '충청북도 청주시 서원구 수영로 173',
              road_address_name: '충청북도 청주시 서원구 수영로 173',
              phone: '043-219-8114',
              place_url: 'http://www.cjsm.or.kr',
              x: '127.4562',
              y: '36.6293',
              distance: '500'
            },
            {
              id: 'fallback_2',
              place_name: '충북대학교병원',
              category_name: '의료,병원 > 대학병원',
              address_name: '충청북도 청주시 서원구 1순환로 776',
              road_address_name: '충청북도 청주시 서원구 1순환로 776',
              phone: '043-269-6114',
              place_url: 'http://www.chungbuk.ac.kr',
              x: '127.4583',
              y: '36.6355',
              distance: '1200'
            },
            {
              id: 'fallback_3',
              place_name: '청주한국병원',
              category_name: '의료,병원 > 종합병원',
              address_name: '충청북도 청주시 서원구 1순환로 1048',
              road_address_name: '충청북도 청주시 서원구 1순환로 1048',
              phone: '043-270-8000',
              place_url: '',
              x: '127.4600',
              y: '36.6400',
              distance: '2100'
            },
            {
              id: 'fallback_4',
              place_name: '청주세브란스병원',
              category_name: '의료,병원 > 종합병원',
              address_name: '충청북도 청주시 흥덕구 대농로 59',
              road_address_name: '충청북도 청주시 흥덕구 대농로 59',
              phone: '043-713-8000',
              place_url: '',
              x: '127.4400',
              y: '36.6250',
              distance: '1800'
            },
            {
              id: 'fallback_5',
              place_name: '청주의료원',
              category_name: '의료,병원 > 공공병원',
              address_name: '충청북도 청주시 서원구 1순환로 776번길 12',
              road_address_name: '충청북도 청주시 서원구 1순환로 776번길 12',
              phone: '043-201-3000',
              place_url: '',
              x: '127.4520',
              y: '36.6320',
              distance: '1000'
            },
            {
              id: 'fallback_6',
              place_name: '청주시립병원',
              category_name: '의료,병원 > 종합병원',
              address_name: '충청북도 청주시 흥덕구 강내면 월탄로 641',
              road_address_name: '충청북도 청주시 흥덕구 강내면 월탄로 641',
              phone: '043-201-2000',
              place_url: '',
              x: '127.4300',
              y: '36.6100',
              distance: '2500'
            },
            {
              id: 'fallback_7',
              place_name: '건국대학교 충주병원',
              category_name: '의료,병원 > 대학병원',
              address_name: '충청북도 충주시 국원대로 82',
              road_address_name: '충청북도 충주시 국원대로 82',
              phone: '043-840-8000',
              place_url: 'http://www.kuh.ac.kr',
              x: '127.9200',
              y: '36.9700',
              distance: '45000'
            },
            {
              id: 'fallback_8',
              place_name: '청주우리병원',
              category_name: '의료,병원 > 종합병원',
              address_name: '충청북도 청주시 서원구 모충로 221',
              road_address_name: '충청북도 청주시 서원구 모충로 221',
              phone: '043-297-0100',
              place_url: '',
              x: '127.4650',
              y: '36.6450',
              distance: '2800'
            },
            {
              id: 'fallback_9',
              place_name: '청주성심병원',
              category_name: '의료,병원 > 종합병원',
              address_name: '충청북도 청주시 흥덕구 1순환로 776번길 30',
              road_address_name: '충청북도 청주시 흥덕구 1순환로 776번길 30',
              phone: '043-280-8000',
              place_url: '',
              x: '127.4380',
              y: '36.6180',
              distance: '2200'
            },
            {
              id: 'fallback_10',
              place_name: '청주연합병원',
              category_name: '의료,병원 > 종합병원',
              address_name: '충청북도 청주시 서원구 1순환로 1235',
              road_address_name: '충청북도 청주시 서원구 1순환로 1235',
              phone: '043-250-1000',
              place_url: '',
              x: '127.4700',
              y: '36.6500',
              distance: '3200'
            },
            {
              id: 'fallback_11',
              place_name: '청주정형외과병원',
              category_name: '의료,병원 > 전문병원',
              address_name: '충청북도 청주시 서원구 흥덕로 77',
              road_address_name: '충청북도 청주시 서원구 흥덕로 77',
              phone: '043-269-3000',
              place_url: '',
              x: '127.4580',
              y: '36.6380',
              distance: '1500'
            },
            {
              id: 'fallback_12',
              place_name: '청주안과병원',
              category_name: '의료,병원 > 전문병원',
              address_name: '충청북도 청주시 흥덕구 가경로 77',
              road_address_name: '충청북도 청주시 흥덕구 가경로 77',
              phone: '043-269-9000',
              place_url: '',
              x: '127.4350',
              y: '36.6200',
              distance: '1900'
            },
            {
              id: 'fallback_13',
              place_name: '청주한방병원',
              category_name: '의료,병원 > 한방병원',
              address_name: '충청북도 청주시 서원구 성화로 188',
              road_address_name: '충청북도 청주시 서원구 성화로 188',
              phone: '043-299-8000',
              place_url: '',
              x: '127.4620',
              y: '36.6420',
              distance: '2600'
            },
            {
              id: 'fallback_14',
              place_name: '청주재활병원',
              category_name: '의료,병원 > 전문병원',
              address_name: '충청북도 청주시 흥덕구 오송읍 오송생명로 200',
              road_address_name: '충청북도 청주시 흥덕구 오송읍 오송생명로 200',
              phone: '043-249-7000',
              place_url: '',
              x: '127.3800',
              y: '36.6100',
              distance: '8500'
            },
            {
              id: 'fallback_15',
              place_name: '청주여성병원',
              category_name: '의료,병원 > 전문병원',
              address_name: '충청북도 청주시 서원구 청남로 2048',
              road_address_name: '충청북도 청주시 서원구 청남로 2048',
              phone: '043-269-5000',
              place_url: '',
              x: '127.4680',
              y: '36.6480',
              distance: '3000'
            }
          ]
        };
    
        return res.json({
          success: true,
          data: fallbackHospitals,
          fallback: true,
          apiKeyUsed: 'fallback',
          apiType: 'fallback_data',
          message: '카카오맵 API 연결 실패로 대체 데이터를 제공합니다.'
        });
    
  } catch (error) {
    console.error('카카오맵 프록시 치명적 오류:', error);
    res.status(500).json({
      success: false,
      message: '카카오맵 검색 중 서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 병원 목록 조회 (사용자용)
app.get('/api/hospitals', async (req, res) => {
  try {
    const { search, department, location } = req.query;
    
    let whereClause = 'WHERE h.IsActive = 1';
    const params = {};
    
    if (search) {
      whereClause += ' AND (h.Name LIKE @search OR h.Address LIKE @search)';
      params.search = `%${search}%`;
    }
    
    const hospitalsQuery = `
      SELECT 
        h.HospitalID,
        h.Name,
        h.Address,
        h.PhoneNumber,
        h.HospitalType,
        h.Rating,
        (SELECT COUNT(*) FROM HospitalReviews WHERE HospitalID = h.HospitalID) as reviewCount
      FROM Hospitals h
      ${whereClause}
      ORDER BY h.Rating DESC, h.Name
    `;
    
    const result = await db.executeQuery(hospitalsQuery, params);
    
    if (result.success) {
      const hospitals = result.recordset.map(hospital => ({
        id: hospital.HospitalID.toString(),
        name: hospital.Name,
        address: hospital.Address,
        phone: hospital.PhoneNumber,
        type: hospital.HospitalType,
        rating: hospital.Rating || 4.5,
        reviewCount: hospital.reviewCount || 0,
        departments: [], // TODO: 진료과 정보 추가
        image: '', // TODO: 병원 이미지 추가
        distance: Math.random() * 10 // TODO: 실제 거리 계산
      }));
      
      return res.json({
        success: true,
        data: hospitals
      });
    } else {
      return res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('병원 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 루트 경로
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DoctorLink API Server',
    version: '1.0.0',
    endpoints: {
      ping: '/api/ping',
      auth: '/api/auth/*',
      kakao: '/api/kakao/*',
      hospitals: '/api/hospitals'
    }
  });
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 http://0.0.0.0:${PORT} 에서 실행 중입니다.`);
  console.log(`로컬 접속: http://localhost:${PORT}`);
  console.log(`네트워크 접속: http://192.168.0.5:${PORT}`);
  console.log('Mock 데이터 모드로 실행 중입니다.');
  console.log('테스트 계정: testuser / password123');
  console.log('관리자 계정: admin / admin123');
});

module.exports = app; 