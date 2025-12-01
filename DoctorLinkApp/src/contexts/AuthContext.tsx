import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  KakaoLoginRequest,
  AuthContextType 
} from '../types';
import authService from '../services/authService';

// 인증 상태 타입
interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// 액션 타입
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

// 초기 상태
const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

// 리듀서
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props 타입
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider 컴포넌트
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 인증 상태 확인
  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const isAuthenticated = await authService.isAuthenticated();
      
      if (isAuthenticated) {
        const user = await authService.getCurrentUser();
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    } catch (error) {
      console.error('인증 상태 확인 오류:', error);
      dispatch({ type: 'SET_ERROR', payload: '인증 상태 확인에 실패했습니다.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 로그인
  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await authService.login(credentials);
      
      if (response.success && response.user) {
        dispatch({ type: 'SET_USER', payload: response.user });
        
        // 인증 상태 리스너에게 알림
        notifyAuthListeners(response.user);
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || '로그인에 실패했습니다.' });
        throw new Error(response.message || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      const errorMessage = error.message || '로그인 중 오류가 발생했습니다.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 카카오 로그인
  const kakaoLogin = async (kakaoData: KakaoLoginRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await authService.kakaoLogin(kakaoData);
      
      if (response.success && response.user) {
        dispatch({ type: 'SET_USER', payload: response.user });
        
        // 인증 상태 리스너에게 알림
        notifyAuthListeners(response.user);
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || '카카오 로그인에 실패했습니다.' });
        throw new Error(response.message || '카카오 로그인에 실패했습니다.');
      }
    } catch (error: any) {
      const errorMessage = error.message || '카카오 로그인 중 오류가 발생했습니다.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 회원가입
  const register = async (registerData: RegisterRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await authService.register(registerData);
      
      if (response.success && response.user) {
        dispatch({ type: 'SET_USER', payload: response.user });
        
        // 인증 상태 리스너에게 알림
        notifyAuthListeners(response.user);
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || '회원가입에 실패했습니다.' });
        throw new Error(response.message || '회원가입에 실패했습니다.');
      }
    } catch (error: any) {
      const errorMessage = error.message || '회원가입 중 오류가 발생했습니다.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
      
      // 인증 상태 리스너에게 알림
      notifyAuthListeners(null);
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 로그아웃은 항상 성공한 것으로 처리 (로컬 데이터 삭제)
      dispatch({ type: 'LOGOUT' });
      notifyAuthListeners(null);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 사용자 정보 업데이트
  const updateUser = async (userData: Partial<User>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authService.updateProfile(userData);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_USER', payload: response.data });
        notifyAuthListeners(response.data);
        return response.data;
      } else {
        throw new Error(response.message || '사용자 정보 업데이트에 실패했습니다.');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 에러 클리어
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // 토큰 갱신
  const refreshToken = async () => {
    try {
      const success = await authService.refreshToken();
      if (!success) {
        // 토큰 갱신 실패 시 로그아웃
        await logout();
      }
      return success;
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      await logout();
      return false;
    }
  };

  // =================== 인증 상태 리스너 관리 ===================
  
  // 외부 리스너들 (다른 컴포넌트에서 인증 상태 변화를 감지)
  const authListeners: ((user: User | null) => void)[] = [];

  const addAuthListener = (listener: (user: User | null) => void) => {
    authListeners.push(listener);
  };

  const removeAuthListener = (listener: (user: User | null) => void) => {
    const index = authListeners.indexOf(listener);
    if (index > -1) {
      authListeners.splice(index, 1);
    }
  };

  const notifyAuthListeners = (user: User | null) => {
    authListeners.forEach(listener => {
      try {
        listener(user);
      } catch (error) {
        console.error('인증 리스너 오류:', error);
      }
    });
  };

  // =================== 유틸리티 메서드 ===================

  // 사용자 권한 확인
  const hasPermission = (requiredRole?: string): boolean => {
    if (!state.user) return false;
    if (!requiredRole) return true;
    
    // 권한 레벨 정의
    const roleLevel: Record<string, number> = {
      patient: 1,
      doctor: 2,
      admin: 3,
    };
    
    const userLevel = roleLevel[state.user.role] || 0;
    const requiredLevel = roleLevel[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  };

  // 로그인 여부 확인
  const isLoggedIn = (): boolean => {
    return !!state.user && !state.isLoading;
  };

  // 사용자 역할 확인
  const isRole = (role: string): boolean => {
    return state.user?.role === role;
  };

  // Context 값
  const contextValue: AuthContextType = {
    // 상태
    user: state.user,
    isLoading: state.isLoading,
    
    // 액션
    login,
    logout,
    register,
    kakaoLogin,
    
    // 추가 메서드들
    updateUser,
    clearError,
    refreshToken,
    addAuthListener,
    removeAuthListener,
    hasPermission,
    isLoggedIn,
    isRole,
    
    // 에러 상태
    error: state.error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// HOC: 인증이 필요한 컴포넌트를 래핑
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: string
) => {
  return (props: P) => {
    const { isLoggedIn, hasPermission } = useAuth();
    
    if (!isLoggedIn() || !hasPermission(requiredRole)) {
      return null; // 또는 에러 화면
    }
    
    return <Component {...props} />;
  };
}; 