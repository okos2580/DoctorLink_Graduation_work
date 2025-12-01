import { Alert } from 'react-native';

// 에러 타입 정의
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// 에러 처리 유틸리티
export class ErrorHandler {
  // 네트워크 에러 처리
  static handleNetworkError(error: any): AppError {
    if (error.code === 'NETWORK_ERROR') {
      return {
        code: 'NETWORK_ERROR',
        message: '네트워크 연결을 확인해주세요.',
        details: error
      };
    }
    
    if (error.code === 'TIMEOUT_ERROR') {
      return {
        code: 'TIMEOUT_ERROR',
        message: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
        details: error
      };
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: '알 수 없는 오류가 발생했습니다.',
      details: error
    };
  }

  // API 에러 처리
  static handleApiError(error: any): AppError {
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 400:
          return {
            code: 'BAD_REQUEST',
            message: '잘못된 요청입니다.',
            details: error.response.data
          };
        case 401:
          return {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다. 다시 로그인해주세요.',
            details: error.response.data
          };
        case 403:
          return {
            code: 'FORBIDDEN',
            message: '접근 권한이 없습니다.',
            details: error.response.data
          };
        case 404:
          return {
            code: 'NOT_FOUND',
            message: '요청한 리소스를 찾을 수 없습니다.',
            details: error.response.data
          };
        case 500:
          return {
            code: 'SERVER_ERROR',
            message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            details: error.response.data
          };
        default:
          return {
            code: 'API_ERROR',
            message: `서버 오류 (${status})`,
            details: error.response.data
          };
      }
    }
    
    return this.handleNetworkError(error);
  }

  // 사용자에게 에러 표시
  static showError(error: AppError, title: string = '오류') {
    if (__DEV__) {
      console.error(`[${error.code}] ${error.message}`, error.details);
    }
    
    Alert.alert(title, error.message);
  }

  // 조용한 에러 처리 (로그만 남김)
  static logError(error: any, context: string = 'Unknown') {
    if (__DEV__) {
      console.error(`[${context}] Error:`, error);
    }
  }

  // 에러 복구 시도
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  }
}

// 에러 바운더리용 에러 타입
export class ComponentError extends Error {
  constructor(message: string, public componentName: string) {
    super(message);
    this.name = 'ComponentError';
  }
}

