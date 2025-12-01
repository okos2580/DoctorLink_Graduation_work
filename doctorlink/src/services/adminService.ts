import { apiRequest } from './api';

// 관리자 로그인 타입
export interface AdminLoginData {
  username: string;
  password: string;
}

// 관리자 정보 타입
export interface AdminInfo {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  token: string;
  lastLogin?: string;
}

// 대시보드 통계 타입
export interface DashboardStats {
  totalUsers: number;
  totalReservations: number;
  pendingReservations: number;
  todayReservations: number;
  totalInquiries: number;
  unreadInquiries: number;
  totalHospitals: number;
  activeHospitals: number;
}

// 관리자 로그인
export const adminLogin = async (loginData: AdminLoginData): Promise<AdminInfo> => {
  // 개발 환경에서는 mock 데이터 반환
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (loginData.username === 'admin' && loginData.password === 'admin123') {
          const adminInfo: AdminInfo = {
            id: 'admin-001',
            username: 'admin',
            name: '관리자',
            email: 'admin@doctorlink.com',
            role: 'super_admin',
            token: 'mock-admin-token-' + Date.now(),
            lastLogin: new Date().toISOString()
          };
          resolve(adminInfo);
        } else {
          throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
      }, 1000);
    });
  }

  const response = await apiRequest<AdminInfo>('/admin/login', 'POST', loginData);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || '로그인에 실패했습니다.');
};

// 대시보드 통계 조회
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // 개발 환경에서는 mock 데이터 반환
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats: DashboardStats = {
          totalUsers: 1247,
          totalReservations: 3456,
          pendingReservations: 23,
          todayReservations: 45,
          totalInquiries: 189,
          unreadInquiries: 7,
          totalHospitals: 156,
          activeHospitals: 142
        };
        resolve(stats);
      }, 800);
    });
  }

  const response = await apiRequest<DashboardStats>('/admin/dashboard/stats');
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || '통계 데이터를 불러오는데 실패했습니다.');
};

// 관리자 정보 확인
export const verifyAdmin = async (): Promise<boolean> => {
  const adminInfo = localStorage.getItem('adminInfo');
  if (!adminInfo) return false;

  try {
    const admin = JSON.parse(adminInfo);
    
    // 개발 환경에서는 토큰만 확인
    if (process.env.NODE_ENV === 'development') {
      return !!admin.token;
    }

    const response = await apiRequest<{ valid: boolean }>('/admin/verify');
    return response.success && response.data?.valid === true;
  } catch {
    return false;
  }
};

// 병원 목록 조회 매개변수 타입
export interface HospitalQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
}

// 병원 목록 조회
export const getHospitals = async (params?: HospitalQueryParams) => {
  // 개발 환경에서는 mock 데이터 반환
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        let hospitals = [
          {
            id: 'h001',
            name: '서울대학교병원',
            address: '서울특별시 종로구 대학로 101',
            phone: '02-2072-2114',
            email: 'info@snuh.org',
            status: 'active',
            registrationDate: '2023-01-15',
            departments: ['내과', '외과', '소아과', '산부인과'],
            rating: 4.8,
            totalReviews: 1250,
            type: 'general'
          },
          {
            id: 'h002',
            name: '삼성서울병원',
            address: '서울특별시 강남구 일원로 81',
            phone: '02-3410-2114',
            email: 'info@smc.samsung.co.kr',
            status: 'active',
            registrationDate: '2023-02-20',
            departments: ['내과', '외과', '신경과', '정형외과'],
            rating: 4.7,
            totalReviews: 980,
            type: 'general'
          },
          {
            id: 'h003',
            name: '연세세브란스병원',
            address: '서울특별시 서대문구 연세로 50-1',
            phone: '02-2228-5800',
            email: 'info@severance.healthcare',
            status: 'active',
            registrationDate: '2023-03-10',
            departments: ['내과', '외과', '안과', '이비인후과'],
            rating: 4.6,
            totalReviews: 750,
            type: 'general'
          },
          {
            id: 'h004',
            name: '강남성심병원',
            address: '서울특별시 강남구 테헤란로 123',
            phone: '02-1234-5678',
            email: 'info@kangnam.co.kr',
            status: 'inactive',
            registrationDate: '2023-04-05',
            departments: ['내과', '피부과'],
            rating: 4.2,
            totalReviews: 320,
            type: 'clinic'
          }
        ];

        // 필터링 적용
        if (params) {
          if (params.status && params.status !== 'all') {
            hospitals = hospitals.filter(h => h.status === params.status);
          }
          if (params.type && params.type !== 'all') {
            hospitals = hospitals.filter(h => h.type === params.type);
          }
          if (params.search) {
            const searchLower = params.search.toLowerCase();
            hospitals = hospitals.filter(h => 
              h.name.toLowerCase().includes(searchLower) ||
              h.address.toLowerCase().includes(searchLower)
            );
          }
        }

        resolve(hospitals);
      }, 500);
    });
  }

  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }

  const url = `/admin/hospitals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiRequest(url);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || '병원 목록을 불러오는데 실패했습니다.');
};

// 사용자 목록 조회 매개변수 타입
export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

// 사용자 목록 조회
export const getUsers = async (params?: UserQueryParams) => {
  // 개발 환경에서는 mock 데이터 반환
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        let users = [
          {
            id: 'u001',
            name: '김철수',
            email: 'kim.cs@email.com',
            phone: '010-1234-5678',
            birthDate: '1985-03-15',
            gender: 'male',
            status: 'active',
            role: 'user',
            registrationDate: '2023-01-10',
            lastLoginDate: '2024-10-20',
            totalReservations: 12,
            cancelledReservations: 1
          },
          {
            id: 'u002',
            name: '이영희',
            email: 'lee.yh@email.com',
            phone: '010-2345-6789',
            birthDate: '1990-07-22',
            gender: 'female',
            status: 'active',
            role: 'user',
            registrationDate: '2023-02-15',
            lastLoginDate: '2024-10-22',
            totalReservations: 8,
            cancelledReservations: 0
          },
          {
            id: 'u003',
            name: '박민수',
            email: 'park.ms@email.com',
            phone: '010-3456-7890',
            birthDate: '1988-11-08',
            gender: 'male',
            status: 'inactive',
            role: 'user',
            registrationDate: '2023-03-20',
            lastLoginDate: '2024-09-15',
            totalReservations: 5,
            cancelledReservations: 2
          },
          {
            id: 'u004',
            name: '정의사',
            email: 'dr.jung@hospital.com',
            phone: '010-4567-8901',
            birthDate: '1980-05-12',
            gender: 'male',
            status: 'active',
            role: 'doctor',
            registrationDate: '2023-01-05',
            lastLoginDate: '2024-10-24',
            totalReservations: 0,
            cancelledReservations: 0
          }
        ];

        // 필터링 적용
        if (params) {
          if (params.role && params.role !== 'all') {
            users = users.filter(u => u.role === params.role);
          }
          if (params.status && params.status !== 'all') {
            users = users.filter(u => u.status === params.status);
          }
          if (params.search) {
            const searchLower = params.search.toLowerCase();
            users = users.filter(u => 
              u.name.toLowerCase().includes(searchLower) ||
              u.email.toLowerCase().includes(searchLower) ||
              u.phone.includes(params.search!)
            );
          }
        }

        resolve(users);
      }, 600);
    });
  }

  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }

  const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiRequest(url);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || '사용자 목록을 불러오는데 실패했습니다.');
};

// 관리자 로그아웃
export const adminLogout = async (): Promise<void> => {
  localStorage.removeItem('adminInfo');
  
  if (process.env.NODE_ENV !== 'development') {
    await apiRequest('/admin/logout', 'POST');
  }
}; 