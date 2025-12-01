import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  KakaoLoginRequest,
  ApiResponse 
} from '../types';
import { post, tokenUtils } from './api';

// 스토리지 키 상수
const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  AUTH_TOKEN: 'authToken',
  REMEMBER_ME: 'rememberMe',
} as const;

// Mock 사용자 데이터
const MOCK_USERS = [
  {
    id: 'user-001',
    email: 'patient@test.com',
    name: '김환자',
    phone: '010-1234-5678',
    birthDate: '1990-01-01',
    gender: 'male' as const,
    address: '서울시 강남구',
    role: 'patient' as const,
    status: 'active' as const,
    registrationDate: '2024-01-01T00:00:00Z',
    profileImage: undefined,
  },
  {
    id: 'doctor-001',
    email: 'doctor@test.com',
    name: '이의사',
    phone: '010-2345-6789',
    birthDate: '1980-01-01',
    gender: 'female' as const,
    address: '서울시 서초구',
    role: 'doctor' as const,
    status: 'active' as const,
    registrationDate: '2024-01-01T00:00:00Z',
    licenseNumber: 'DOC-12345',
    specialization: '내과',
    hospitalId: 'hosp-001',
    hospitalName: '서울대학교병원',
    department: '내과',
    experience: 10,
    education: '서울대학교 의과대학',
  },
  {
    id: 'admin-001',
    email: 'admin@test.com',
    name: '관리자',
    phone: '010-3456-7890',
    birthDate: '1985-01-01',
    gender: 'male' as const,
    address: '서울시 중구',
    role: 'admin' as const,
    status: 'active' as const,
    registrationDate: '2024-01-01T00:00:00Z',
  },
];

// 인증 서비스 클래스
class AuthService {
  // Mock 로그인
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Mock 로그인 시도:', credentials);
      
      // 간단한 Mock 로그인 로직
      let mockUser: User | null = null;
      
      // 테스트 계정들 (아이디/비밀번호 확인)
      if ((credentials.username === 'username' || credentials.username === 'patient@test.com') 
          && credentials.password === 'password') {
        mockUser = MOCK_USERS[0]; // 환자
      } else if ((credentials.username === 'doctor' || credentials.username === 'doctor@test.com') 
                 && credentials.password === 'password') {
        mockUser = MOCK_USERS[1]; // 의사
      } else if ((credentials.username === 'admin' || credentials.username === 'admin@test.com') 
                 && credentials.password === 'admin123') {
        mockUser = MOCK_USERS[2]; // 관리자
      } else {
        return {
          success: false,
          message: '아이디 또는 비밀번호가 올바르지 않습니다.',
        };
      }
      
      if (mockUser) {
        const mockToken = `mock_token_${Date.now()}_${mockUser.id}`;
        
        // 토큰과 사용자 정보 저장
        await this.saveAuthData(mockToken, mockUser);
        
        return {
          success: true,
          message: '로그인 성공',
          token: mockToken,
          user: mockUser,
        };
      } else {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
        };
      }
    } catch (error: any) {
      console.error('Mock 로그인 오류:', error);
      return {
        success: false,
        message: error.message || '로그인 중 오류가 발생했습니다.',
      };
    }
  }

  // Mock 카카오 로그인
  async kakaoLogin(kakaoData: KakaoLoginRequest): Promise<LoginResponse> {
    try {
      console.log('Mock 카카오 로그인 시도:', kakaoData);
      
      // 카카오 데이터로 Mock 사용자 생성
      const mockUser: User = {
        id: `kakao_${kakaoData.userInfo.id}`,
        email: kakaoData.userInfo.kakao_account.email || 'kakao_user@test.com',
        name: kakaoData.userInfo.kakao_account.profile?.nickname || '카카오 사용자',
        phone: '010-0000-0000',
        birthDate: '1990-01-01',
        gender: 'male',
        address: '서울시',
        role: 'patient',
        status: 'active',
        registrationDate: new Date().toISOString(),
        profileImage: kakaoData.userInfo.kakao_account.profile?.profile_image_url,
      };
      
      const mockToken = `kakao_token_${Date.now()}_${mockUser.id}`;
      
      // 토큰과 사용자 정보 저장
      await this.saveAuthData(mockToken, mockUser);
      
      return {
        success: true,
        message: '카카오 로그인 성공',
        token: mockToken,
        user: mockUser,
      };
    } catch (error: any) {
      console.error('Mock 카카오 로그인 오류:', error);
      return {
        success: false,
        message: error.message || '카카오 로그인 중 오류가 발생했습니다.',
      };
    }
  }

  // Mock 회원가입
  async register(registerData: RegisterRequest): Promise<LoginResponse> {
    try {
      console.log('Mock 회원가입 시도:', registerData);
      
      // Mock 사용자 생성
      const mockUser: User = {
        id: `user_${Date.now()}`,
        email: registerData.email,
        name: `${registerData.lastName}${registerData.firstName}`,
        phone: registerData.phoneNumber,
        birthDate: registerData.dateOfBirth,
        gender: registerData.gender,
        address: '서울시',
        role: 'patient',
        status: 'active',
        registrationDate: new Date().toISOString(),
      };
      
      const mockToken = `register_token_${Date.now()}_${mockUser.id}`;
      
      // 토큰과 사용자 정보 저장
      await this.saveAuthData(mockToken, mockUser);
      
      return {
        success: true,
        message: '회원가입이 완료되었습니다.',
        token: mockToken,
        user: mockUser,
      };
    } catch (error: any) {
      console.error('Mock 회원가입 오류:', error);
      return {
        success: false,
        message: error.message || '회원가입 중 오류가 발생했습니다.',
      };
    }
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      console.log('로그아웃 처리');
      // Mock에서는 서버 요청 없이 바로 로컬 데이터만 삭제
      await this.clearAuthData();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  }

  // 현재 사용자 정보 가져오기
  async getCurrentUser(): Promise<User | null> {
    try {
      const userInfo = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('사용자 정보 로드 오류:', error);
      return null;
    }
  }

  // 인증 상태 확인
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await tokenUtils.getToken();
      const user = await this.getCurrentUser();
      
      if (!token || !user) {
        return false;
      }
      
      // Mock에서는 토큰이 있으면 유효한 것으로 간주
      return true;
    } catch (error) {
      console.error('인증 상태 확인 오류:', error);
      return false;
    }
  }

  // Mock 토큰 갱신
  async refreshToken(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        const newToken = `refresh_token_${Date.now()}_${user.id}`;
        await tokenUtils.setToken(newToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      return false;
    }
  }

  // Mock 비밀번호 변경
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      console.log('Mock 비밀번호 변경');
      return {
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '비밀번호 변경 중 오류가 발생했습니다.',
      };
    }
  }

  // Mock 비밀번호 재설정 요청
  async requestPasswordReset(email: string): Promise<ApiResponse> {
    try {
      console.log('Mock 비밀번호 재설정 요청:', email);
      return {
        success: true,
        message: '비밀번호 재설정 이메일이 발송되었습니다.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '비밀번호 재설정 요청 중 오류가 발생했습니다.',
      };
    }
  }

  // Mock 사용자 프로필 업데이트
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          message: '로그인이 필요합니다.',
        };
      }

      const updatedUser = { ...currentUser, ...profileData };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(updatedUser));
      
      return {
        success: true,
        message: '프로필이 업데이트되었습니다.',
        data: updatedUser,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '프로필 업데이트 중 오류가 발생했습니다.',
      };
    }
  }

  // Mock 계정 삭제
  async deleteAccount(password: string): Promise<ApiResponse> {
    try {
      console.log('Mock 계정 삭제');
      await this.clearAuthData();
      return {
        success: true,
        message: '계정이 성공적으로 삭제되었습니다.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '계정 삭제 중 오류가 발생했습니다.',
      };
    }
  }

  // =================== 내부 헬퍼 메서드 ===================

  // 인증 데이터 저장
  private async saveAuthData(token: string, user: User): Promise<void> {
    try {
      await Promise.all([
        tokenUtils.setToken(token),
        AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user)),
      ]);
      console.log('인증 데이터 저장 완료:', { userId: user.id, role: user.role });
    } catch (error) {
      console.error('인증 데이터 저장 오류:', error);
      throw error;
    }
  }

  // 인증 데이터 삭제
  private async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        tokenUtils.removeToken(),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_INFO),
        AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_ME),
      ]);
      console.log('인증 데이터 삭제 완료');
    } catch (error) {
      console.error('인증 데이터 삭제 오류:', error);
    }
  }

  // Remember Me 설정
  async setRememberMe(remember: boolean): Promise<void> {
    try {
      if (remember) {
        await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      }
    } catch (error) {
      console.error('Remember Me 설정 오류:', error);
    }
  }

  // Remember Me 상태 확인
  async getRememberMe(): Promise<boolean> {
    try {
      const remember = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
      return remember === 'true';
    } catch (error) {
      console.error('Remember Me 상태 확인 오류:', error);
      return false;
    }
  }

  // 인증 상태 리스너 (옵션)
  private authListeners: ((user: User | null) => void)[] = [];

  addAuthListener(listener: (user: User | null) => void): void {
    this.authListeners.push(listener);
  }

  removeAuthListener(listener: (user: User | null) => void): void {
    const index = this.authListeners.indexOf(listener);
    if (index > -1) {
      this.authListeners.splice(index, 1);
    }
  }

  private notifyAuthListeners(user: User | null): void {
    this.authListeners.forEach(listener => {
      try {
        listener(user);
      } catch (error) {
        console.error('인증 리스너 오류:', error);
      }
    });
  }

  // =================== Mock 데이터 헬퍼 ===================
  
  // Mock 사용자 목록 가져오기 (개발/테스트용)
  getMockUsers(): User[] {
    return MOCK_USERS;
  }
  
  // 특정 역할의 Mock 사용자 가져오기
  getMockUserByRole(role: 'patient' | 'doctor' | 'admin'): User | null {
    return MOCK_USERS.find(user => user.role === role) || null;
  }
}

// 싱글톤 인스턴스 생성
const authService = new AuthService();

export default authService; 