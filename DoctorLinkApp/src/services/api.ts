import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '../types';

// API 기본 설정 - 실제 서버 연결
const API_BASE_URL = __DEV__ 
  ? 'http://1.246.253.172:3000/api'  // 개발 모드: PC IP 주소 사용 (Expo Go용)
  : 'https://your-production-api.com/api';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초로 타임아웃 늘림
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Android에서 cleartext HTTP 허용
  validateStatus: (status) => status < 500, // 5xx 에러만 reject
});

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('토큰 로드 오류:', error);
    }
    
    if (__DEV__) {
      console.log(`🚀 API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ 요청 인터셉터 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__) {
      console.log(`✅ API 응답: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (__DEV__) {
      console.error(`❌ API 오류: ${error.message}`);
      if (error.response) {
        console.error('상태:', error.response.status);
      }
    }
    
    // 401 에러 시 토큰 제거 및 로그인 페이지로 리다이렉트
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userInfo');
        // 네비게이션 처리는 네비게이션 서비스에서 처리
      } catch (storageError) {
        console.error('토큰 제거 오류:', storageError);
      }
    }
    
    return Promise.reject(error);
  }
);

// 기본 API 요청 함수
export const apiRequest = async <T = any>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    if (__DEV__) {
      console.log(`🔄 API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    }
    const response = await apiClient(config);
    if (__DEV__) {
      console.log(`✅ API 성공: ${response.status}`);
    }
    return response.data;
  } catch (error: any) {
    console.error('❌ API 요청 실패:', error);
    
    if (error.response) {
      // 서버가 응답했지만 에러 상태
      if (__DEV__) {
        console.error('응답 상태:', error.response.status);
      }
      
      return error.response.data || {
        success: false,
        message: `서버 오류: ${error.response.status}`,
        error: 'SERVER_ERROR'
      };
    } else if (error.request) {
      // 요청이 만들어졌지만 응답을 받지 못함
        if (__DEV__) {
        console.error('네트워크 오류:', error.message);
      }
      return {
        success: false,
        message: '네트워크 연결 오류입니다. 서버에 연결할 수 없습니다.',
        error: 'NETWORK_ERROR'
      };
    } else {
      // 다른 오류
      if (__DEV__) {
        console.error('요청 오류:', error.message);
      }
      return {
        success: false,
        message: error.message || '알 수 없는 오류가 발생했습니다.',
        error: error.code || 'UNKNOWN_ERROR'
      };
    }
  }
};

// GET 요청
export const get = async <T = any>(
  url: string, 
  params?: any
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: 'GET',
    url,
    params,
  });
};

// POST 요청
export const post = async <T = any>(
  url: string, 
  data?: any
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: 'POST',
    url,
    data,
  });
};

// PUT 요청
export const put = async <T = any>(
  url: string, 
  data?: any
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: 'PUT',
    url,
    data,
  });
};

// DELETE 요청
export const del = async <T = any>(
  url: string
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: 'DELETE',
    url,
  });
};

// PATCH 요청
export const patch = async <T = any>(
  url: string, 
  data?: any
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: 'PATCH',
    url,
    data,
  });
};

// 파일 업로드
export const uploadFile = async (
  url: string,
  file: any,
  onUploadProgress?: (progressEvent: any) => void
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiRequest({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

// 연결 상태 확인
export const checkConnection = async (): Promise<boolean> => {
  try {
    const response = await get('/health');
    return response.success;
  } catch (error) {
    return false;
  }
};

// 토큰 관리 유틸리티
export const tokenUtils = {
  // 토큰 저장
  setToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('토큰 저장 오류:', error);
      throw error;
    }
  },
  
  // 토큰 가져오기
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('토큰 로드 오류:', error);
      return null;
    }
  },
  
  // 토큰 제거
  removeToken: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('토큰 제거 오류:', error);
      throw error;
    }
  },
  
  // 토큰 유효성 검사
  isTokenValid: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return false;
      
      // Mock 토큰인 경우 (mock_token_, kakao_token_, register_token_ 등으로 시작)
      if (token.startsWith('mock_token_') || token.startsWith('kakao_token_') || token.startsWith('register_token_') || token.startsWith('refresh_token_')) {
        return true; // Mock 토큰은 항상 유효한 것으로 간주
      }
      
      try {
        // JWT 토큰 디코딩하여 만료 시간 확인
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        return payload.exp > currentTime;
      } catch (jwtError) {
        // JWT 파싱 실패 시 토큰이 있으면 유효한 것으로 간주 (Mock 환경)
        return true;
      }
    } catch (error) {
      console.error('토큰 유효성 검사 오류:', error);
      return false;
    }
  }
};

export default apiClient; 