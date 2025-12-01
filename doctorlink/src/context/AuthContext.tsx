import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import kakaoService from '../services/kakaoService';

// 사용자 정보 인터페이스
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor';
  loginType?: 'normal' | 'kakao';  // 로그인 타입 추가
  profileImage?: string;           // 프로필 이미지 추가
}

// 인증 컨텍스트 인터페이스
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  kakaoLogin: () => Promise<boolean>;  // 카카오 로그인 추가
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
}

// 초기 가상 사용자 데이터
const initialDummyUsers: (User & { password: string })[] = [
  {
    id: 'u1',
    name: '김환자',
    email: 'patient@example.com',
    phone: '010-1234-5678',
    role: 'patient',
    password: '1234'
  },
  {
    id: 'u2',
    name: '이의사',
    email: 'doctor@example.com',
    phone: '010-5678-1234',
    role: 'doctor',
    password: '1234'
  }
];

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  kakaoLogin: async () => false,  // 카카오 로그인 추가
  logout: () => {},
  register: async () => false
});

// 커스텀 훅
export const useAuth = () => useContext(AuthContext);

// 프로바이더 컴포넌트
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<(User & { password: string })[]>(initialDummyUsers);

  // 초기화 시 로컬 스토리지에서 데이터 복원
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedAuth = localStorage.getItem('isLoggedIn');
      const storedToken = localStorage.getItem('authToken');
      const storedUsers = localStorage.getItem('users');
      
      if (storedUser && storedAuth === 'true') {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // 백엔드 연결 상태 확인 (간단한 ping)
          try {
            const response = await fetch('/api/ping', {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Authorization': storedToken ? `Bearer ${storedToken}` : ''
              }
            });
            
            if (response.ok) {
              // 백엔드 연결 정상, 사용자 상태 복원
              setUser(parsedUser);
              setIsAuthenticated(true);
              console.log('✅ 인증 상태 복원 완료:', parsedUser.name);
            } else {
              // 토큰이 만료되었거나 백엔드 오류
              console.warn('⚠️ 토큰 만료 또는 백엔드 오류, 로그아웃 처리');
              clearAuthData();
            }
          } catch (error) {
            // 백엔드 연결 실패, 하지만 사용자 상태는 유지 (오프라인 모드)
            console.warn('⚠️ 백엔드 연결 실패, 오프라인 모드로 인증 상태 유지:', error);
            setUser(parsedUser);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('❌ 저장된 사용자 정보 파싱 실패:', error);
          clearAuthData();
        }
      }
      
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        // 처음 실행 시 초기 사용자 데이터 저장
        localStorage.setItem('users', JSON.stringify(initialDummyUsers));
      }
    };
    
    initializeAuth();
  }, []);

  // 인증 데이터 클리어 함수
  const clearAuthData = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  // 일반 로그인 함수
  const login = async (email: string, password: string): Promise<boolean> => {
    // 실제 구현에서는 API 호출을 통해 인증
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser({
        ...userWithoutPassword,
        loginType: 'normal'
      });
      setIsAuthenticated(true);
      
      // 로컬 스토리지에 인증 상태 저장
      localStorage.setItem('user', JSON.stringify({
        ...userWithoutPassword,
        loginType: 'normal'
      }));
      localStorage.setItem('isLoggedIn', 'true');
      
      return true;
    }
    
    return false;
  };

  // 카카오 로그인 함수
  const kakaoLogin = async (): Promise<boolean> => {
    try {
      console.log('카카오 로그인 시작...');
      
      // 백엔드와 연동된 카카오 로그인 실행
      const result = await kakaoService.loginWithBackend();
      
      if (result.success && result.user) {
        // 백엔드에서 받은 사용자 정보를 우리 시스템 형식으로 변환
        const kakaoUser: User = {
          id: result.user.id.toString(),
          name: `${result.user.firstName} ${result.user.lastName}`.trim(),
          email: result.user.email,
          phone: '', // 카카오에서는 전화번호를 제공하지 않을 수 있음
          role: result.user.role?.toLowerCase() === 'patient' ? 'patient' : 'doctor',
          loginType: 'kakao',
          profileImage: result.user.profileImage
        };
        
        // 인증 상태 설정
        setUser(kakaoUser);
        setIsAuthenticated(true);
        
        // 로컬 스토리지에 인증 상태 저장
        localStorage.setItem('user', JSON.stringify(kakaoUser));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('authToken', result.token);
        
        console.log('카카오 로그인 성공:', kakaoUser);
        return true;
      } else {
        console.error('카카오 로그인 실패: 사용자 정보 없음');
        return false;
      }
      
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      return false;
    }
  };

  // 로그아웃 함수 (카카오 로그아웃 포함)
  const logout = async () => {
    try {
      // 카카오 로그인 사용자인 경우 카카오 로그아웃도 실행
      if (user?.loginType === 'kakao' && kakaoService.isLoggedIn()) {
        await kakaoService.logout();
      }
    } catch (error) {
      console.error('카카오 로그아웃 오류:', error);
    }
    
    // 통합된 데이터 클리어 함수 사용
    clearAuthData();
  };

  // 회원가입 함수
  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    // 이메일 중복 체크
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return false;
    }
    
    // 새 사용자 ID 생성
    const newUser = {
      id: `u${users.length + 1}`,
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      role: userData.role as 'patient' | 'doctor' || 'patient',
      password: userData.password
    };
    
    // 새 사용자 추가
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // 로컬 스토리지에 업데이트된 사용자 목록 저장
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // 자동 로그인
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    
    // 로컬 스토리지에 인증 상태 저장
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    localStorage.setItem('isLoggedIn', 'true');
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      kakaoLogin,  // 카카오 로그인 추가
      logout, 
      register 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 