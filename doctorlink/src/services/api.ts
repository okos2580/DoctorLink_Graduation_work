// API 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// HTTP 메서드 타입
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// API 요청 함수
export const apiRequest = async <T>(
  endpoint: string,
  method: HttpMethod = 'GET',
  data?: any,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> => {
  try {
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    // 관리자 토큰이 있다면 헤더에 추가
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) {
      const admin = JSON.parse(adminInfo);
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${admin.token || 'admin-token'}`,
      };
    }

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API 요청 오류:', error);
    
    // 개발 환경에서는 mock 데이터 반환
    if (process.env.NODE_ENV === 'development') {
      return getMockResponse<T>(endpoint, method, data);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'API 요청 중 오류가 발생했습니다.'
    };
  }
};

// 개발 환경용 Mock 데이터 반환 함수
const getMockResponse = <T>(endpoint: string, method: HttpMethod, data?: any): ApiResponse<T> => {
  console.log(`🔄 Mock API 호출: ${method} ${endpoint}`, data);
  
  // 성공적인 응답 시뮬레이션
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {} as T,
        message: 'Mock 데이터로 성공적으로 처리되었습니다.'
      });
    }, 500); // 0.5초 지연으로 실제 API 호출 시뮬레이션
  }) as any;
};

// 공통 에러 처리
export const handleApiError = (error: any, defaultMessage: string = '오류가 발생했습니다.') => {
  if (error?.message) {
    return error.message;
  }
  return defaultMessage;
};

export default apiRequest; 