// 카카오 SDK 타입 선언
declare global {
  interface Window {
    Kakao: any;
  }
}

// 카카오 사용자 정보 타입
export interface KakaoUserInfo {
  id: number;
  kakao_account: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
  };
}

// 카카오 로그인 응답 타입
export interface KakaoLoginResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  refresh_token_expires_in?: number;
}

// SDK 완전 로드를 기다리는 함수
export const waitForKakaoSDK = (maxWaitTime = 15000): Promise<boolean> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let attemptCount = 0;
    
    const checkSDK = () => {
      const now = Date.now();
      attemptCount++;
      
      console.log(`카카오 SDK 로드 확인 시도 #${attemptCount}`);
      
      // 타임아웃 체크
      if (now - startTime > maxWaitTime) {
        console.error(`❌ 카카오 SDK 로드 타임아웃 (${maxWaitTime}ms 경과)`);
        resolve(false);
        return;
      }
      
      // 기본 체크
      if (typeof window === 'undefined') {
        console.log('⏳ window 객체 대기 중...');
        setTimeout(checkSDK, 200);
        return;
      }
      
      if (!window.Kakao) {
        console.log('⏳ window.Kakao 로드 대기 중...');
        setTimeout(checkSDK, 200);
        return;
      }
      
      // Kakao 객체의 모든 속성 확인
      console.log('📋 현재 Kakao 객체 속성:', Object.keys(window.Kakao));
      
      if (!window.Kakao.Auth) {
        console.log('⏳ window.Kakao.Auth 로드 대기 중...');
        setTimeout(checkSDK, 200);
        return;
      }
      
      // Auth 객체의 모든 속성 확인
      console.log('📋 현재 Kakao.Auth 속성:', Object.keys(window.Kakao.Auth));
      
      // login 함수 존재 확인
      if (typeof window.Kakao.Auth.login !== 'function') {
        console.log('⏳ Kakao.Auth.login 함수 로드 대기 중...');
        console.log('현재 Auth.login 타입:', typeof window.Kakao.Auth.login);
        setTimeout(checkSDK, 200);
        return;
      }
      
      // API 객체 확인
      if (!window.Kakao.API) {
        console.log('⏳ window.Kakao.API 로드 대기 중...');
        setTimeout(checkSDK, 200);
        return;
      }
      
      if (typeof window.Kakao.API.request !== 'function') {
        console.log('⏳ Kakao.API.request 함수 로드 대기 중...');
        setTimeout(checkSDK, 200);
        return;
      }
      
      // 초기화 상태 확인
      try {
        if (window.Kakao.isInitialized && !window.Kakao.isInitialized()) {
          console.log('⏳ 카카오 SDK 초기화 대기 중...');
          setTimeout(checkSDK, 200);
          return;
        }
      } catch (error) {
        console.warn('⚠️ 초기화 상태 확인 중 오류:', error);
        // 초기화 상태 확인에 실패해도 다른 조건이 충족되면 계속 진행
      }
      
      console.log('✅ 카카오 SDK 완전 로드 및 초기화 완료!');
      console.log('📊 최종 SDK 상태:', {
        Kakao: !!window.Kakao,
        Auth: !!window.Kakao.Auth,
        'Auth.login': typeof window.Kakao.Auth.login,
        API: !!window.Kakao.API,
        'API.request': typeof window.Kakao.API.request,
        isInitialized: window.Kakao.isInitialized ? window.Kakao.isInitialized() : 'unknown'
      });
      resolve(true);
    };
    
    checkSDK();
  });
};

// 카카오 앱 키 (실제 환경에서는 환경 변수로 관리)
export const KAKAO_APP_KEY = process.env.REACT_APP_KAKAO_APP_KEY || 'bf189a93b43b3653b58f19ab40ef6a07';

class KakaoService {
  private isInitialized = false;
  
  // 카카오 SDK 초기화
  initialize(appKey: string) {
    console.log('카카오 SDK 초기화 시도:', appKey);
    
    if (typeof window === 'undefined') {
      console.error('window 객체가 없습니다. 서버 사이드에서 실행 중입니다.');
      return;
    }
    
    if (!window.Kakao) {
      console.error('카카오 SDK가 로드되지 않았습니다.');
      return;
    }
    
    // 이미 초기화되었는지 확인 (안전한 방식)
    try {
      if (window.Kakao.isInitialized && window.Kakao.isInitialized()) {
        console.log('카카오 SDK가 이미 초기화되었습니다.');
        this.isInitialized = true;
        return;
      }
    } catch (error) {
      console.warn('isInitialized 확인 중 오류:', error);
    }
    
    try {
      window.Kakao.init(appKey);
      
      // 초기화 확인 (안전한 방식)
      try {
        this.isInitialized = window.Kakao.isInitialized ? window.Kakao.isInitialized() : true;
      } catch (error) {
        console.warn('초기화 상태 확인 중 오류:', error);
        this.isInitialized = true; // 초기화가 완료되었다고 가정
      }
      
      console.log('카카오 SDK 초기화 완료:', this.isInitialized);
      console.log('카카오 SDK 버전:', window.Kakao.VERSION || 'Unknown');
    } catch (error) {
      console.error('카카오 SDK 초기화 오류:', error);
    }
  }

  // 초기화 상태 확인
  checkInitialization(): boolean {
    const windowExists = typeof window !== 'undefined';
    const kakaoExists = windowExists && !!window.Kakao;
    const authExists = kakaoExists && !!window.Kakao.Auth;
    const loginExists = authExists && typeof window.Kakao.Auth.login === 'function';
    
    // 안전한 초기화 상태 확인
    let isInitialized = false;
    if (kakaoExists) {
      try {
        isInitialized = window.Kakao.isInitialized ? window.Kakao.isInitialized() : false;
      } catch (error) {
        console.warn('isInitialized 확인 중 오류:', error);
        isInitialized = false;
      }
    }
    
    console.log('카카오 SDK 상태 상세 확인:', {
      windowExists,
      kakaoExists,
      authExists,
      loginExists,
      isInitialized,
      kakaoKeys: kakaoExists ? Object.keys(window.Kakao) : [],
      authKeys: authExists ? Object.keys(window.Kakao.Auth) : [],
      version: kakaoExists ? window.Kakao.VERSION : 'N/A'
    });
    
    if (!windowExists) {
      console.error('❌ window 객체가 없습니다');
      return false;
    }
    
    if (!kakaoExists) {
      console.error('❌ window.Kakao가 없습니다 - SDK가 로드되지 않았습니다');
      return false;
    }
    
    if (!authExists) {
      console.error('❌ window.Kakao.Auth가 없습니다 - Auth 모듈이 로드되지 않았습니다');
      return false;
    }
    
    if (!loginExists) {
      console.error('❌ window.Kakao.Auth.login이 함수가 아닙니다');
      return false;
    }
    
    if (!isInitialized) {
      console.error('❌ 카카오 SDK가 초기화되지 않았습니다');
      return false;
    }
    
    console.log('✅ 카카오 SDK 모든 검사 통과');
    return true;
  }

  // 카카오 로그인
  async login(): Promise<KakaoLoginResponse> {
    return new Promise(async (resolve, reject) => {
      console.log('카카오 로그인 시작...');
      
      // 첫 번째 체크
      if (!this.checkInitialization()) {
        console.log('SDK 상태 불량 - 재로드 시도...');
        
        try {
          // SDK 재로드 대기
          const sdkReady = await waitForKakaoSDK(5000);
          
          if (!sdkReady) {
            const error = new Error('카카오 SDK 로드에 실패했습니다. 페이지를 새로고침 해보세요.');
            console.error(error);
            reject(error);
            return;
          }
          
          // 재초기화 시도
          this.initialize(KAKAO_APP_KEY);
          
          // 재확인
          if (!this.checkInitialization()) {
            const error = new Error('카카오 SDK 초기화에 실패했습니다.');
            console.error(error);
            reject(error);
            return;
          }
        } catch (error) {
          console.error('SDK 재로드 중 오류:', error);
          reject(new Error('카카오 SDK 준비 중 오류가 발생했습니다.'));
          return;
        }
      }

      console.log('카카오 Auth.login 호출...');
      
      try {
        window.Kakao.Auth.login({
          success: (response: KakaoLoginResponse) => {
            console.log('카카오 로그인 성공:', response);
            resolve(response);
          },
          fail: (error: any) => {
            console.error('카카오 로그인 실패:', error);
            reject(new Error(`카카오 로그인에 실패했습니다: ${JSON.stringify(error)}`));
          },
        });
      } catch (error) {
        console.error('Auth.login 호출 중 오류:', error);
        reject(new Error(`로그인 함수 호출 중 오류: ${error}`));
      }
    });
  }

  // 카카오 사용자 정보 조회
  async getUserInfo(): Promise<KakaoUserInfo> {
    return new Promise((resolve, reject) => {
      if (!this.checkInitialization()) {
        const error = new Error('카카오 SDK가 초기화되지 않았습니다.');
        console.error(error);
        reject(error);
        return;
      }

      console.log('카카오 사용자 정보 조회 중...');

      try {
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (response: KakaoUserInfo) => {
            console.log('카카오 사용자 정보:', response);
            resolve(response);
          },
          fail: (error: any) => {
            console.error('카카오 사용자 정보 조회 실패:', error);
            reject(new Error(`사용자 정보를 가져오는데 실패했습니다: ${JSON.stringify(error)}`));
          },
        });
      } catch (error) {
        console.error('카카오 API 요청 중 오류:', error);
        reject(new Error(`카카오 API 요청 중 오류: ${error}`));
      }
    });
  }

  // 카카오 로그아웃
  async logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.checkInitialization()) {
        const error = new Error('카카오 SDK가 초기화되지 않았습니다.');
        console.error(error);
        reject(error);
        return;
      }

      try {
        window.Kakao.Auth.logout(() => {
          console.log('카카오 로그아웃 완료');
          resolve();
        });
      } catch (error) {
        console.error('카카오 로그아웃 중 오류:', error);
        reject(new Error(`카카오 로그아웃 중 오류: ${error}`));
      }
    });
  }

  // 카카오 연결 해제
  async unlink(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.checkInitialization()) {
        const error = new Error('카카오 SDK가 초기화되지 않았습니다.');
        console.error(error);
        reject(error);
        return;
      }

      try {
        window.Kakao.API.request({
          url: '/v1/user/unlink',
          success: () => {
            console.log('카카오 연결 해제 완료');
            resolve();
          },
          fail: (error: any) => {
            console.error('카카오 연결 해제 실패:', error);
            reject(new Error(`카카오 연결 해제에 실패했습니다: ${JSON.stringify(error)}`));
          },
        });
      } catch (error) {
        console.error('카카오 연결 해제 중 오류:', error);
        reject(new Error(`카카오 연결 해제 중 오류: ${error}`));
      }
    });
  }

  // 로그인 상태 확인
  isLoggedIn(): boolean {
    if (!this.checkInitialization()) return false;
    
    try {
      return window.Kakao.Auth.getAccessToken() !== null;
    } catch (error) {
      console.warn('로그인 상태 확인 중 오류:', error);
      return false;
    }
  }

  // 액세스 토큰 가져오기
  getAccessToken(): string | null {
    if (!this.checkInitialization()) return null;
    
    try {
      return window.Kakao.Auth.getAccessToken();
    } catch (error) {
      console.warn('액세스 토큰 가져오기 중 오류:', error);
      return null;
    }
  }

  // 백엔드와 연동된 카카오 로그인
  async loginWithBackend(): Promise<any> {
    try {
      // 1. 카카오 로그인 실행
      const loginResponse = await this.login();
      console.log('카카오 로그인 응답:', loginResponse);
      
      // 2. 사용자 정보 조회
      const userInfo = await this.getUserInfo();
      console.log('카카오 사용자 정보:', userInfo);
      
      // 3. 백엔드에 카카오 로그인 정보 전송
      const backendResponse = await fetch('/api/auth/kakao-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          accessToken: loginResponse.access_token,
          userInfo: userInfo
        })
      });
      
      const result = await backendResponse.json();
      
      if (result.success) {
        console.log('백엔드 카카오 로그인 성공:', result);
        return {
          success: true,
          user: result.user,
          token: result.token
        };
      } else {
        throw new Error(result.message || '백엔드 로그인 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('카카오 백엔드 로그인 오류:', error);
      throw error;
    }
  }
}

// 카카오 서비스 인스턴스 생성 및 초기화
const kakaoService = new KakaoService();

// SDK 초기화 (DOM이 로드된 후)
if (typeof window !== 'undefined') {
  const initKakao = () => {
    console.log('🚀 카카오 SDK 초기화 시작...');
    
    // 간단한 SDK 대기 로직
    let attempts = 0;
    const maxAttempts = 50; // 5초 대기
    
    const tryInit = () => {
      attempts++;
      
      if (window.Kakao && window.Kakao.Auth && typeof window.Kakao.Auth.login === 'function') {
        console.log('✅ 카카오 SDK 로드 완료');
        kakaoService.initialize(KAKAO_APP_KEY);
        
        // 초기화 확인
        setTimeout(() => {
          const isReady = kakaoService.checkInitialization();
          console.log('🔍 카카오 SDK 초기화 상태:', isReady);
          
          if (isReady) {
            console.log('🎉 카카오 로그인 준비 완료!');
          }
        }, 500);
        
      } else if (attempts < maxAttempts) {
        console.log(`⏳ 카카오 SDK 대기 중... (${attempts}/${maxAttempts})`);
        setTimeout(tryInit, 100);
      } else {
        console.error('❌ 카카오 SDK 로드 타임아웃');
      }
    };
    
    tryInit();
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKakao);
  } else {
    // DOM이 이미 로드된 경우 약간의 지연 후 실행
    setTimeout(initKakao, 100);
  }
}

export default kakaoService;

// 디버깅을 위한 글로벌 함수들
if (typeof window !== 'undefined') {
  (window as any).debugKakao = {
    checkStatus: () => {
      console.log('🔍 카카오 SDK 상태 진단:');
      console.log('window.Kakao:', !!window.Kakao);
      if (window.Kakao) {
        console.log('Kakao 속성들:', Object.keys(window.Kakao));
        console.log('Kakao.Auth:', !!window.Kakao.Auth);
        if (window.Kakao.Auth) {
          console.log('Auth 속성들:', Object.keys(window.Kakao.Auth));
          console.log('Auth.login 타입:', typeof window.Kakao.Auth.login);
        }
        console.log('Kakao.API:', !!window.Kakao.API);
        if (window.Kakao.API) {
          console.log('API 속성들:', Object.keys(window.Kakao.API));
          console.log('API.request 타입:', typeof window.Kakao.API.request);
        }
        try {
          console.log('isInitialized:', window.Kakao.isInitialized ? window.Kakao.isInitialized() : 'undefined');
        } catch (e) {
          console.log('isInitialized 오류:', e);
        }
      }
    },
    
    manualInit: () => {
      console.log('🔧 수동 초기화 시도...');
      kakaoService.initialize(KAKAO_APP_KEY);
    },
    
    reloadScript: () => {
      console.log('🔄 스크립트 수동 재로드...');
      const existingScript = document.querySelector('script[src*="kakao"]');
      if (existingScript) {
        existingScript.remove();
        console.log('기존 스크립트 제거됨');
      }
      
      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
      script.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        console.log('✅ 스크립트 재로드 완료');
        setTimeout(() => {
          kakaoService.initialize(KAKAO_APP_KEY);
        }, 500);
      };
      document.head.appendChild(script);
    },
    
    testLogin: async () => {
      console.log('🧪 카카오 로그인 테스트...');
      try {
        const result = await kakaoService.loginWithBackend();
        console.log('로그인 결과:', result);
      } catch (error) {
        console.error('로그인 테스트 실패:', error);
      }
    }
  };
  
  console.log('🛠️ 디버깅 함수 등록 완료!');
  console.log('사용법:');
  console.log('- window.debugKakao.checkStatus() : 상태 확인');
  console.log('- window.debugKakao.manualInit() : 수동 초기화');
  console.log('- window.debugKakao.reloadScript() : 스크립트 재로드');
  console.log('- window.debugKakao.testLogin() : 로그인 테스트');
} 