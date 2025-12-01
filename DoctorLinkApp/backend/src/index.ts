import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

// 미들웨어
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 로그 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 헬스 체크
app.get('/api/health', (req, res) => {
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

// Mock 회원가입 API
app.post('/api/auth/register', (req, res) => {
  console.log('회원가입 요청:', req.body);
  
  res.json({
    success: true,
    message: '회원가입이 완료되었습니다.',
    data: {
      user: {
        id: 'mock-user-' + Date.now(),
        email: req.body.email,
        name: req.body.name,
        phone: req.body.phone,
        birthDate: req.body.birthDate,
        gender: req.body.gender,
        role: 'patient',
        status: 'active'
      },
      tokens: {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      }
    }
  });
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

// 인메모리 데이터 저장소 - 초기 데이터 포함
let announcements: any[] = [
  {
    id: 'ann-1',
    title: '서비스 이용약관 변경 안내',
    content: '서비스 이용약관 변경 안내에 대한 상세 내용입니다.\n\n관련하여 자세한 사항은 고객센터로 문의 부탁드립니다.\n\n감사합니다.',
    author: 'admin-1',
    authorName: '시스템 관리자',
    category: 'notice',
    isPinned: true,
    isActive: true,
    viewCount: 245,
    createdAt: new Date(Date.now()).toISOString(),
    updatedAt: new Date(Date.now()).toISOString(),
  },
  {
    id: 'ann-2',
    title: '정기 시스템 점검 안내',
    content: '정기 시스템 점검 안내에 대한 상세 내용입니다.\n\n점검 시간: 2024년 1월 15일 새벽 2시 ~ 4시\n\n감사합니다.',
    author: 'admin-1',
    authorName: '시스템 관리자',
    category: 'maintenance',
    isPinned: true,
    isActive: true,
    viewCount: 512,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'ann-3',
    title: '신규 병원 제휴 안내',
    content: '신규 병원 제휴 안내에 대한 상세 내용입니다.\n\n새로운 병원들과 제휴를 맺었습니다.\n\n감사합니다.',
    author: 'admin-1',
    authorName: '시스템 관리자',
    category: 'notice',
    isPinned: false,
    isActive: true,
    viewCount: 328,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'ann-4',
    title: '모바일 앱 업데이트',
    content: '모바일 앱 업데이트에 대한 상세 내용입니다.\n\n새로운 기능이 추가되었습니다.\n\n감사합니다.',
    author: 'admin-1',
    authorName: '시스템 관리자',
    category: 'update',
    isPinned: false,
    isActive: true,
    viewCount: 789,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'ann-5',
    title: '여름 건강검진 이벤트',
    content: '여름 건강검진 이벤트에 대한 상세 내용입니다.\n\n특별 할인 혜택을 제공합니다.\n\n감사합니다.',
    author: 'admin-1',
    authorName: '시스템 관리자',
    category: 'event',
    isPinned: false,
    isActive: true,
    viewCount: 456,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
  },
];

let faqs: any[] = [
  {
    id: 'faq-1',
    category: 'account',
    question: '회원가입은 어떻게 하나요?',
    answer: '앱 첫 화면에서 "회원가입" 버튼을 눌러 진행하실 수 있습니다. 이메일과 비밀번호를 입력하시고, 본인 인증을 완료하시면 가입이 완료됩니다.',
    order: 1,
    isActive: true,
    viewCount: 156,
    createdAt: new Date(Date.now()).toISOString(),
    updatedAt: new Date(Date.now()).toISOString(),
  },
  {
    id: 'faq-2',
    category: 'reservation',
    question: '예약 취소는 어떻게 하나요?',
    answer: '예약 상세 화면에서 "예약 취소" 버튼을 통해 취소 가능합니다. 단, 예약일 24시간 전까지만 취소가 가능하며, 이후에는 병원으로 직접 연락주셔야 합니다.',
    order: 2,
    isActive: true,
    viewCount: 234,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'faq-3',
    category: 'account',
    question: '비밀번호를 잊어버렸어요',
    answer: '로그인 화면에서 "비밀번호 찾기"를 클릭하여 재설정하실 수 있습니다. 가입하신 이메일로 인증 링크가 발송됩니다.',
    order: 3,
    isActive: true,
    viewCount: 189,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'faq-4',
    category: 'technical',
    question: '병원 검색이 안돼요',
    answer: '위치 권한을 허용해주시고, 네트워크 연결 상태를 확인해주세요. 문제가 지속되면 앱을 재시작해주세요.',
    order: 4,
    isActive: true,
    viewCount: 98,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'faq-5',
    category: 'reservation',
    question: '예약 확인은 어디서 하나요?',
    answer: '하단 메뉴의 "예약" 탭에서 전체 예약 내역을 확인하실 수 있습니다. 예약 상세 정보와 예약 상태도 확인 가능합니다.',
    order: 5,
    isActive: true,
    viewCount: 267,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: 'faq-6',
    category: 'technical',
    question: '앱이 자꾸 종료됩니다',
    answer: '앱을 최신 버전으로 업데이트하시고, 재시작해주세요. 문제가 계속되면 앱을 삭제 후 재설치해주시기 바랍니다.',
    order: 6,
    isActive: true,
    viewCount: 145,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    updatedAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 'faq-7',
    category: 'payment',
    question: '환불은 어떻게 받나요?',
    answer: '결제 후 7일 이내 고객센터를 통해 환불 신청이 가능합니다. 환불은 결제한 방법으로 3-5영업일 내에 처리됩니다.',
    order: 7,
    isActive: true,
    viewCount: 321,
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    updatedAt: new Date(Date.now() - 518400000).toISOString(),
  },
  {
    id: 'faq-8',
    category: 'general',
    question: '의료 기록은 어디서 확인하나요?',
    answer: '"의료기록" 탭에서 모든 진료 기록을 확인하실 수 있습니다. 진료 내역, 처방전, 검사 결과 등을 확인할 수 있습니다.',
    order: 8,
    isActive: true,
    viewCount: 203,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date(Date.now() - 604800000).toISOString(),
  },
];

let inquiries: any[] = [
  {
    id: 'inquiry-1',
    userId: 'user-001',
    userName: '김민수',
    userEmail: 'minsu.kim@example.com',
    userPhone: '010-1234-5678',
    category: 'reservation',
    title: '예약 변경 문의',
    content: '다음 주 화요일 예약을 수요일로 변경하고 싶습니다. 가능한가요?',
    status: 'pending',
    priority: 'normal',
    reply: null,
    repliedBy: null,
    repliedByName: null,
    repliedAt: null,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2일 전
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'inquiry-2',
    userId: 'user-002',
    userName: '이영희',
    userEmail: 'younghee.lee@example.com',
    userPhone: '010-2345-6789',
    category: 'medical',
    title: '진료 과목 문의',
    content: '허리 통증이 있는데 어느 과에서 진료를 받아야 하나요? 정형외과인가요 신경외과인가요?',
    status: 'pending',
    priority: 'normal',
    reply: null,
    repliedBy: null,
    repliedByName: null,
    repliedAt: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1일 전
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'inquiry-3',
    userId: 'user-003',
    userName: '박철수',
    userEmail: 'chulsoo.park@example.com',
    userPhone: '010-3456-7890',
    category: 'payment',
    title: '보험 적용 문의',
    content: '실손보험 청구를 하려고 하는데 필요한 서류가 무엇인가요?',
    status: 'pending',
    priority: 'normal',
    reply: null,
    repliedBy: null,
    repliedByName: null,
    repliedAt: null,
    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12시간 전
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'inquiry-4',
    userId: 'user-004',
    userName: '정수진',
    userEmail: 'sujin.jung@example.com',
    userPhone: '010-4567-8901',
    category: 'general',
    title: '주차 가능 여부',
    content: '병원에 주차장이 있나요? 주차비는 얼마인가요?',
    status: 'resolved',
    priority: 'low',
    reply: '안녕하세요. 병원 지하 1~2층에 주차장이 있으며, 진료 고객은 2시간 무료 주차가 가능합니다. 추가 시간당 1,000원입니다.',
    repliedBy: 'admin-1',
    repliedByName: '고객센터',
    repliedAt: new Date(Date.now() - 7200000).toISOString(), // 2시간 전
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3일 전
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'inquiry-5',
    userId: 'user-005',
    userName: '최동욱',
    userEmail: 'dongwook.choi@example.com',
    userPhone: '010-5678-9012',
    category: 'reservation',
    title: '예약 취소 및 환불',
    content: '급한 일이 생겨서 내일 예약을 취소해야 합니다. 예약금 환불이 가능한가요?',
    status: 'resolved',
    priority: 'normal',
    reply: '예약 취소는 예약일 1일 전까지 가능하며, 예약금은 전액 환불됩니다. 앱에서 예약 취소 처리해 드렸습니다.',
    repliedBy: 'admin-1',
    repliedByName: '예약팀',
    repliedAt: new Date(Date.now() - 3600000).toISOString(), // 1시간 전
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3시간 전
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];
let notifications: any[] = [];

// ==================== 공지사항 API ====================
// 공지사항 목록 조회
app.get('/api/admin/announcements', (req, res) => {
  console.log('공지사항 목록 조회:', req.query);
  
  res.json({
    success: true,
    message: '공지사항 목록을 조회했습니다.',
    data: {
      announcements: announcements.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
      total: announcements.length
    }
  });
});

// 공지사항 상세 조회
app.get('/api/admin/announcements/:id', (req, res) => {
  const { id } = req.params;
  const announcement = announcements.find(a => a.id === id);
  
  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: '공지사항을 찾을 수 없습니다.',
      error: 'NOT_FOUND'
    });
  }
  
  res.json({
    success: true,
    message: '공지사항을 조회했습니다.',
    data: { announcement }
  });
});

// 공지사항 생성
app.post('/api/admin/announcements', (req, res) => {
  console.log('공지사항 생성:', req.body);
  
  const newAnnouncement = {
    id: `ann-${Date.now()}`,
    ...req.body,
    author: 'admin-1',
    authorName: '시스템 관리자',
    viewCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  announcements.push(newAnnouncement);
  
  res.json({
    success: true,
    message: '공지사항이 생성되었습니다.',
    data: { announcement: newAnnouncement }
  });
});

// 공지사항 수정
app.put('/api/admin/announcements/:id', (req, res) => {
  const { id } = req.params;
  const index = announcements.findIndex(a => a.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '공지사항을 찾을 수 없습니다.',
      error: 'NOT_FOUND'
    });
  }
  
  announcements[index] = {
    ...announcements[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: '공지사항이 수정되었습니다.',
    data: { announcement: announcements[index] }
  });
});

// 공지사항 삭제
app.delete('/api/admin/announcements/:id', (req, res) => {
  const { id } = req.params;
  const index = announcements.findIndex(a => a.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '공지사항을 찾을 수 없습니다.',
      error: 'NOT_FOUND'
    });
  }
  
  announcements.splice(index, 1);
  
  res.json({
    success: true,
    message: '공지사항이 삭제되었습니다.',
    data: null
  });
});

// ==================== FAQ API ====================
// FAQ 목록 조회
app.get('/api/admin/faqs', (req, res) => {
  console.log('FAQ 목록 조회:', req.query);
  
  res.json({
    success: true,
    message: 'FAQ 목록을 조회했습니다.',
    data: {
      faqs: faqs.sort((a, b) => a.order - b.order),
      total: faqs.length
    }
  });
});

// FAQ 상세 조회
app.get('/api/admin/faqs/:id', (req, res) => {
  const { id } = req.params;
  const faq = faqs.find(f => f.id === id);
  
  if (!faq) {
    return res.status(404).json({
      success: false,
      message: 'FAQ를 찾을 수 없습니다.',
      error: 'NOT_FOUND'
    });
  }
  
  res.json({
    success: true,
    message: 'FAQ를 조회했습니다.',
    data: { faq }
  });
});

// FAQ 생성
app.post('/api/admin/faqs', (req, res) => {
  console.log('FAQ 생성:', req.body);
  
  const newFaq = {
    id: `faq-${Date.now()}`,
    ...req.body,
    viewCount: 0,
    order: faqs.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  faqs.push(newFaq);
  
  res.json({
    success: true,
    message: 'FAQ가 생성되었습니다.',
    data: { faq: newFaq }
  });
});

// FAQ 수정
app.put('/api/admin/faqs/:id', (req, res) => {
  const { id } = req.params;
  const index = faqs.findIndex(f => f.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'FAQ를 찾을 수 없습니다.',
      error: 'NOT_FOUND'
    });
  }
  
  faqs[index] = {
    ...faqs[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'FAQ가 수정되었습니다.',
    data: { faq: faqs[index] }
  });
});

// FAQ 삭제
app.delete('/api/admin/faqs/:id', (req, res) => {
  const { id } = req.params;
  const index = faqs.findIndex(f => f.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'FAQ를 찾을 수 없습니다.',
      error: 'NOT_FOUND'
    });
  }
  
  faqs.splice(index, 1);
  
  res.json({
    success: true,
    message: 'FAQ가 삭제되었습니다.',
    data: null
  });
});

// ==================== 문의 API ====================
// 문의 목록 조회
app.get('/api/admin/inquiries', (req, res) => {
  console.log('문의 목록 조회:', req.query);
  
  res.json({
    success: true,
    message: '문의 목록을 조회했습니다.',
    data: {
      inquiries: inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      total: inquiries.length
    }
  });
});

// 문의 상세 조회
app.get('/api/admin/inquiries/:id', (req, res) => {
  const { id } = req.params;
  const inquiry = inquiries.find(i => i.id === id);
  
  if (!inquiry) {
    return res.status(404).json({
      success: false,
      message: '문의를 찾을 수 없습니다.',
      error: 'NOT_FOUND'
    });
  }
  
  res.json({
    success: true,
    message: '문의를 조회했습니다.',
    data: { inquiry }
  });
});

// 문의 답변
app.post('/api/admin/inquiries/:id/reply', (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;
  const index = inquiries.findIndex(i => i.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '문의를 찾을 수 없습니다.',
      error: 'NOT_FOUND'
    });
  }
  
  inquiries[index] = {
    ...inquiries[index],
    status: 'resolved',
    reply,
    repliedBy: 'admin-1',
    repliedByName: '시스템 관리자',
    repliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: '답변이 등록되었습니다.',
    data: { inquiry: inquiries[index] }
  });
});

// 문의 상태 변경
app.patch('/api/admin/inquiries/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = inquiries.findIndex(i => i.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '문의를 찾을 수 없습니다.',
      error: 'NOT_FOUND'
    });
  }
  
  inquiries[index] = {
    ...inquiries[index],
    status,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: '문의 상태가 변경되었습니다.',
    data: { inquiry: inquiries[index] }
  });
});

// ==================== 사용자용 공지사항 API ====================
// 활성화된 공지사항 목록 조회 (사용자용)
app.get('/api/announcements', (req, res) => {
  console.log('사용자 공지사항 목록 조회');
  
  const activeAnnouncements = announcements
    .filter(a => a.isActive)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  
  res.json({
    success: true,
    message: '공지사항 목록을 조회했습니다.',
    data: {
      announcements: activeAnnouncements,
      total: activeAnnouncements.length
    }
  });
});

// 공지사항 상세 조회 (사용자용)
app.get('/api/announcements/:id', (req, res) => {
  const { id } = req.params;
  const announcement = announcements.find(a => a.id === id && a.isActive);
  
  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: '공지사항을 찾을 수 없습니다.',
      error: 'NOT_FOUND'
    });
  }
  
  // 조회수 증가
  announcement.viewCount = (announcement.viewCount || 0) + 1;
  
  res.json({
    success: true,
    message: '공지사항을 조회했습니다.',
    data: { announcement }
  });
});

// ==================== 사용자용 FAQ API ====================
// 활성화된 FAQ 목록 조회 (사용자용)
app.get('/api/faqs', (req, res) => {
  console.log('사용자 FAQ 목록 조회');
  
  const activeFaqs = faqs
    .filter(f => f.isActive)
    .sort((a, b) => a.order - b.order);
  
  res.json({
    success: true,
    message: 'FAQ 목록을 조회했습니다.',
    data: {
      faqs: activeFaqs,
      total: activeFaqs.length
    }
  });
});

// FAQ 상세 조회 (사용자용)
app.get('/api/faqs/:id', (req, res) => {
  const { id } = req.params;
  const faq = faqs.find(f => f.id === id && f.isActive);
  
  if (!faq) {
    return res.status(404).json({
      success: false,
      message: 'FAQ를 찾을 수 없습니다.',
      error: 'NOT_FOUND'
    });
  }
  
  // 조회수 증가
  faq.viewCount = (faq.viewCount || 0) + 1;
  
  res.json({
    success: true,
    message: 'FAQ를 조회했습니다.',
    data: { faq }
  });
});

// ==================== 알림 API ====================
// 알림 발송
app.post('/api/admin/notifications/send', (req, res) => {
  console.log('알림 발송:', req.body);
  
  const newNotification = {
    id: `notif-${Date.now()}`,
    ...req.body,
    sentBy: 'admin-1',
    sentByName: '시스템 관리자',
    sentAt: new Date().toISOString(),
    status: 'sent'
  };
  
  notifications.push(newNotification);
  
  res.json({
    success: true,
    message: '알림이 발송되었습니다.',
    data: { notification: newNotification }
  });
});

// 알림 발송 내역 조회
app.get('/api/admin/notifications', (req, res) => {
  console.log('알림 내역 조회:', req.query);
  
  res.json({
    success: true,
    message: '알림 내역을 조회했습니다.',
    data: {
      notifications: notifications.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()),
      total: notifications.length
    }
  });
});

// ==================== 사용자용 문의 API ====================
// 사용자 문의 작성
app.post('/api/inquiries', (req, res) => {
  console.log('문의 작성:', req.body);
  
  const { userId, userName, userEmail, userPhone, category, title, content } = req.body;
  
  const newInquiry = {
    id: `inquiry-${Date.now()}`,
    userId: userId || 'guest-' + Date.now(),
    userName,
    userEmail,
    userPhone,
    category,
    title,
    content,
    status: 'pending',
    priority: 'normal',
    reply: null,
    repliedBy: null,
    repliedByName: null,
    repliedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  inquiries.push(newInquiry);
  
  res.json({
    success: true,
    message: '문의가 등록되었습니다.',
    data: { inquiry: newInquiry }
  });
});

// 사용자 본인의 문의 목록 조회
app.get('/api/inquiries', (req, res) => {
  const { userId } = req.query;
  console.log('사용자 문의 목록 조회:', userId);
  
  const userInquiries = userId
    ? inquiries.filter(i => i.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];
  
  res.json({
    success: true,
    message: '문의 목록을 조회했습니다.',
    data: {
      inquiries: userInquiries,
      total: userInquiries.length
    }
  });
});

// 사용자 본인의 문의 상세 조회
app.get('/api/inquiries/:id', (req, res) => {
  const { id } = req.params;
  const inquiry = inquiries.find(i => i.id === id);
  
  if (!inquiry) {
    return res.status(404).json({
      success: false,
      message: '문의를 찾을 수 없습니다.',
      error: 'NOT_FOUND'
    });
  }
  
  res.json({
    success: true,
    message: '문의를 조회했습니다.',
    data: { inquiry }
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
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

export default app;