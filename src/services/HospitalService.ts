import axios from 'axios';

// 카카오맵 SDK에 대한 타입 선언
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => any;
        services: {
          Places: new () => any;
          Status: {
            OK: string;
            ERROR: string;
            ZERO_RESULT: string;
          };
          SortBy: {
            DISTANCE: string;
            ACCURACY: string;
          };
        };
      };
    };
  }
}

// 병원 인터페이스 정의
export interface Hospital {
  id: number | string;
  name: string;
  type: string;
  address: string;
  phone: string;
  openHours?: string;
  closed?: string;
  rating?: number;
  distance?: number;
  description?: string;
  latitude?: number;
  longitude?: number;
}

// 검색 옵션 인터페이스
export interface SearchOptions {
  query?: string;
  location?: { latitude: number; longitude: number };
  radius?: number;
  type?: string;
  page?: number;
  size?: number;
  regionCode?: string; // 지역 코드 추가
}

// 청주시 주요 지역 좌표 (청주시 중심부, 상당구, 서원구, 흥덕구, 청원구, 주요 동네)
const CHEONGJU_LOCATIONS = [
  { latitude: 36.6372, longitude: 127.4897 }, // 청주시 중심부
  // ... existing code ...
];

// 청주시 행정구역 검색 키워드
const CHEONGJU_AREAS = [
  '청주시 상당구',
  // ... existing code ...
];

// 병원 유형 검색 키워드
const HOSPITAL_TYPES_KEYWORDS = [
  '병원',
  // ... existing code ...
];

// 콜백 이름 중복을 피하기 위한 고유 ID 생성
const callbackName = `kakaoMapCallback_${Date.now()}`;

declare global {
  interface Window {
    kakao: any;
    [key: string]: any;
  }
}

export class HospitalService {
  private kakaoApiKey: string;
  private kakaoRestApiKey: string;
  private locationSearchResults: Map<string, Hospital[]> = new Map();
  private mockData: Hospital[] = [];
  private useWebSdk: boolean = false;
  private sdkLoadAttempted: boolean = false;
  private isKakaoMapLoaded = false;
  private mapLoadCallbacks: Array<() => void> = [];

  constructor() {
    this.kakaoApiKey = process.env.REACT_APP_KAKAO_API_KEY || 'c761b3adf6bac0ac1aec2cc08fe04b4d';
    this.kakaoRestApiKey = this.kakaoApiKey; // REST API 키도 동일하게 사용
    
    console.log('🔑 API 키 초기화됨:', this.kakaoApiKey);
    console.log('🔑 REST API 헤더:', `KakaoAK ${this.kakaoRestApiKey}`);
    
    // API 키 유효성 간단 검사
    if (!this.kakaoApiKey || this.kakaoApiKey.length < 10) {
      console.error('⚠️ 경고: API 키가 너무 짧거나, 환경 변수에서 로드되지 않았습니다.');
    }
    
    this.initMockData();
    
    // 카카오맵 SDK 자동 로드 시도
    this.tryLoadKakaoMapScript().catch(err => {
      console.warn('초기 SDK 로드 실패, 필요시 다시 시도합니다:', err);
    });
    
    // CORS 테스트 실행
    this.testKakaoAPICors();
  }

  private initMockData() {
    // Mock data는 이미 초기화 된 경우에만 사용합니다
    this.mockData = this.getMockHospitals({});
    console.log(`Mock 병원 데이터 ${this.mockData.length}개가 초기화되었습니다.`);
  }

  // 카카오맵 SDK 스크립트 로드 시도
  public tryLoadKakaoMapScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 이미 시도했다면 중복 로드 방지
      if (this.sdkLoadAttempted) {
        if (this.useWebSdk) {
          console.log('카카오맵 SDK가 이미 로드됨');
          resolve();
        } else {
          reject(new Error('이전 SDK 로드 시도 실패'));
        }
        return;
      }

      this.sdkLoadAttempted = true;

      if (window.kakao?.maps) {
        console.log('Kakao 맵 SDK가 이미 로드되어 있습니다.');
        this.useWebSdk = true;
        resolve();
        return;
      }

      console.log('Kakao 맵 SDK 로딩 시작...');
      
      // 전역 콜백 함수 설정 (카카오 SDK가 초기화될 때 호출됨)
      const callbackName = `kakaoMapInit${new Date().getTime()}`;
      (window as any)[callbackName] = () => {
        console.log('🎉 Kakao 맵 SDK 콜백 함수 호출됨!');
        if (window.kakao?.maps) {
          console.log('✅ Kakao 맵 SDK 초기화 성공!');
          this.useWebSdk = true;
          resolve();
        } else {
          console.error('❌ Kakao 맵 SDK 콜백은 호출되었으나 초기화 실패');
          reject(new Error('SDK 초기화 실패'));
        }
      };

      const script = document.createElement('script');
      // JavaScript SDK 사용 시에는 JavaScript 키를 사용
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${this.kakaoApiKey}&libraries=services&autoload=false&callback=${callbackName}`;
      script.async = true;
      script.onload = () => {
        console.log('📜 Kakao 맵 SDK 스크립트 로드됨. 초기화 대기 중...');
        // 콜백 방식에서는 추가 초기화가 필요 없으나, 타임아웃을 설정하여 안전장치 추가
        setTimeout(() => {
          if (!this.useWebSdk) {
            console.warn('⚠️ SDK 콜백이 5초 내에 호출되지 않았습니다.');
            // 수동으로 kakao.maps.load 호출 시도
            if (window.kakao && !this.useWebSdk) {
              try {
                window.kakao.maps.load(() => {
                  console.log('✅ 수동 kakao.maps.load 초기화 성공!');
                  this.useWebSdk = true;
                  resolve();
                });
              } catch (err) {
                console.error('❌ 수동 초기화 실패:', err);
                reject(err);
              }
            }
          }
        }, 5000);
      };
      script.onerror = (err) => {
        console.error('❌ Kakao 맵 SDK 로드 실패:', err);
        reject(new Error('스크립트 로드 실패'));
      };
      document.head.appendChild(script);
    });
  }

  // 카카오맵 API를 사용하여 키워드로 장소 검색
  private async searchPlacesByKeyword(keyword: string, options: any = {}): Promise<any[]> {
    // ... existing code ...
    return new Promise((resolve) => { 
      // 기존 메서드 코드 유지
      // ... existing code ...
    });
  }

  // REST API로 장소 검색 (SDK가 로드되지 않은 경우의 대체 방법)
  private async searchPlacesByRest(keyword: string, options: any = {}): Promise<any[]> {
    try {
      console.log(`🔍 REST API로 키워드 검색: ${keyword}`);
      
      // REST API 요청 헤더와 파라미터 설정
      // REST API 키 인증 형식: KakaoAK {REST_API_KEY}
      const headers = {
        'Authorization': `KakaoAK ${this.kakaoApiKey}`,
        'Content-Type': 'application/json;charset=UTF-8'
      };
      
      // 쿼리 파라미터 설정
      const params: any = {
        query: keyword,
        page: options.page || 1,
        size: options.size || 15
      };
      
      // 위치 정보가 있으면 위치 기반 검색 파라미터 추가
      if (options.location) {
        params.x = options.location.longitude;
        params.y = options.location.latitude;
        params.radius = options.radius || 10000; // 10km 반경
        params.sort = 'distance';
      }
      
      // REST API 요청 URL과 헤더 전체 로깅 (디버깅용)
      const url = `https://dapi.kakao.com/v2/local/search/keyword.json?${new URLSearchParams(params).toString()}`;
      console.log('🔄 REST API 요청 URL:', url);
      console.log('🔄 REST API 요청 헤더:', JSON.stringify(headers));
      
      // Referer 헤더 추가 (일부 API는 이를 요구할 수 있음)
      headers['Referer'] = window.location.origin;
      
      // CORS 테스트 - 직접 fetch API로 테스트
      try {
        const testResponse = await fetch(url, {
          method: 'GET',
          headers: headers
        });
        
        if (!testResponse.ok) {
          console.error(`❌ CORS 테스트 실패: ${testResponse.status} ${testResponse.statusText}`);
          
          if (testResponse.status === 401) {
            // 401 오류 발생 시 직접 fetch로 문제 확인을 위한 테스트 코드
            console.log('📋 브라우저 콘솔에서 아래 코드로 직접 테스트해보세요:');
            console.log(`
fetch("${url}", {
  method: "GET",
  headers: {
    "Authorization": "KakaoAK ${this.kakaoApiKey}"
  }
})
.then(response => {
  console.log(response.status, response.statusText);
  return response.json();
})
.then(data => console.log(data))
.catch(error => console.error(error));
            `);
            
            // 서버 측 프록시를 사용하는 것이 좋다는 메시지 표시
            console.warn('⚠️ 클라이언트에서 직접 REST API 호출 시 CORS 문제가 발생할 수 있습니다.');
            console.warn('⚠️ 서버 측 프록시를 통해 API를 호출하는 것이 좋습니다.');
            
            // 모의 데이터 반환
            console.log('🔄 API 호출 실패로 인해 모의 데이터를 반환합니다.');
            return [];
          }
        } else {
          // 성공적으로 응답 받은 경우 axios 대신 fetch 결과를 처리
          const data = await testResponse.json();
          console.log(`✅ REST API 응답 성공: 상태코드=${testResponse.status}`);
          
          if (data?.documents?.length > 0) {
            console.log(`📊 검색된 결과 수: ${data.documents.length}개`);
            
            // 청주시 필터링
            if (keyword.includes('청주')) {
              const cheongjuResults = data.documents.filter((doc: any) => {
                return doc.address_name && doc.address_name.includes('청주시');
              });
              
              console.log(`📊 청주시 필터링 후 결과 수: ${cheongjuResults.length}개`);
              
              // 청주시 필터링 결과가 없으면 원본 결과 반환
              if (cheongjuResults.length === 0) {
                console.warn('⚠️ 청주시 필터링 후 결과가 없어 전체 결과를 반환합니다');
                return data.documents;
              }
              
              return cheongjuResults;
            }
            
            return data.documents;
          }
          
          // 결과가 없는 경우 빈 배열 반환
          return [];
        }
      } catch (fetchError) {
        console.error('❌ CORS 테스트 중 오류 발생:', fetchError);
      }
      
      // fetch 테스트 실패 시 기존 axios로 다시 시도
      const response = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
        headers,
        params,
        // 10초 타임아웃 설정
        timeout: 10000
      });
      
      console.log(`✅ REST API 응답 성공: 상태코드=${response.status}`);
      
      if (response.data && response.data.documents) {
        console.log(`📊 검색된 결과 수: ${response.data.documents.length}개`);
        console.log('🔍 검색 메타 정보:', response.data.meta);
        
        if (response.data.documents.length === 0) {
          console.log('🔍 검색 결과가 없습니다. 파라미터 확인:', params);
          
          // 병원 관련 키워드가 포함되어 있지 않으면 추가
          if (!keyword.includes('병원') && !keyword.includes('의원') && !keyword.includes('의료')) {
            console.log('🔄 병원 키워드를 추가하여 다시 검색합니다.');
            const newKeyword = `${keyword} 병원`;
            
            const retryParams = { ...params, query: newKeyword };
            
            const retryResponse = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
              headers,
              params: retryParams,
              timeout: 10000
            });
            
            if (retryResponse.data && retryResponse.data.documents && retryResponse.data.documents.length > 0) {
              console.log(`📊 병원 키워드 추가 검색 결과: ${retryResponse.data.documents.length}개`);
              return retryResponse.data.documents;
            }
          }
          
          // 더 넓은 범위로 다시 검색
          if (options.location && params.radius < 20000) {
            console.log('🔄 검색 반경을 늘려 다시 검색합니다.');
            params.radius = 20000; // 20km로 확장
            
            const widerResponse = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
              headers,
              params,
              timeout: 10000
            });
            
            if (widerResponse.data && widerResponse.data.documents && widerResponse.data.documents.length > 0) {
              console.log(`📊 확장 검색 결과: ${widerResponse.data.documents.length}개`);
              return widerResponse.data.documents;
            }
          }
          
          // 카테고리 코드를 병원(HP8)로 지정하여 검색
          console.log('🔄 병원 카테고리로 검색합니다.');
          
          try {
            const categoryParams = { ...params };
            delete categoryParams.query; // 카테고리 검색시 쿼리 파라미터 제거
            categoryParams.category_group_code = 'HP8'; // 병원 카테고리 코드
            
            const categoryResponse = await axios.get('https://dapi.kakao.com/v2/local/search/category.json', {
              headers,
              params: categoryParams,
              timeout: 10000
            });
            
            if (categoryResponse.data && categoryResponse.data.documents && categoryResponse.data.documents.length > 0) {
              console.log(`📊 카테고리 검색 결과: ${categoryResponse.data.documents.length}개`);
              return categoryResponse.data.documents;
            }
          } catch (error) {
            console.error('❌ 카테고리 검색 실패:', error);
          }
          
          return [];
        }
        
        // 청주시 필터링
        if (keyword.includes('청주')) {
          const cheongjuResults = response.data.documents.filter((doc: any) => {
            return doc.address_name && doc.address_name.includes('청주시');
          });
          
          console.log(`📊 청주시 필터링 후 결과 수: ${cheongjuResults.length}개`);
          
          // 청주시 필터링 결과가 없으면 원본 결과 반환
          if (cheongjuResults.length === 0) {
            console.warn('⚠️ 청주시 필터링 후 결과가 없어 전체 결과를 반환합니다');
            return response.data.documents;
          }
          
          return cheongjuResults;
        }
        
        return response.data.documents;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ REST API 호출 실패:', error.message);
      
      if (error.response) {
        console.error('응답 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data);
        
        // 상세 오류 정보 기록
        if (error.response.status === 401) {
          console.error('🔑 인증 오류. API 키 확인 필요:', this.kakaoApiKey);
          console.error('🔑 헤더 정보:', error.config?.headers?.Authorization);
          console.error('🔍 전체 요청 정보:', {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            params: error.config?.params
          });
          
          // 카카오 개발자 사이트에서 확인해야 할 사항
          console.error('🔍 카카오 개발자 사이트에서 다음을 확인하세요:');
          console.error('1. 로컬(Local) API가 활성화되어 있는지');
          console.error('2. 웹 플랫폼에 현재 도메인이 등록되어 있는지 (개발 중이라면 http://localhost 추가)');
          console.error('3. REST API 키가 정확한지');
          console.error('4. JavaScript SDK용 키가 아닌 REST API 키를 사용하고 있는지');
          
          // 브라우저 콘솔에서 직접 테스트할 수 있는 fetch 코드 로깅
          const params = new URLSearchParams(error.config?.params).toString();
          console.log('🧪 브라우저에서 테스트하려면 다음 코드를 실행하세요:');
          console.log(`
fetch("https://dapi.kakao.com/v2/local/search/keyword.json?${params}", {
  headers: {
    "Authorization": "KakaoAK ${this.kakaoApiKey}"
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));
          `);
          
          console.log('⚠️ 클라이언트에서 직접 REST API 호출 시 CORS 문제가 발생할 수 있습니다.');
          console.log('⚠️ 서버 측 프록시를 통해 API를 호출하는 것이 좋습니다.');
        } else if (error.response.status === 400) {
          console.error('🔍 잘못된 요청 매개변수:', error.config?.params);
        } else if (error.response.status === 429) {
          console.error('⚠️ 요청 한도 초과. 잠시 후 다시 시도하세요.');
        } else if (error.response.status === 403) {
          console.error('⛔ 접근 권한 없음. 도메인 설정 확인 필요');
        }
      } else if (error.request) {
        console.error('🌐 서버 응답 없음, 네트워크 문제 발생:', error.request);
      }
      
      return [];
    }
  }

  // 카테고리로 장소 검색 (REST API 사용)
  private async searchPlacesByCategory(options: any = {}): Promise<any[]> {
    // ... existing code ...
    return []; // 임시 반환값, 실제 코드로 대체해야 함
  }

  // 주변 병원 검색 메서드
  async searchNearbyHospitals(options: SearchOptions): Promise<Hospital[]> {
    console.log('🏥 searchNearbyHospitals 호출됨:', options);
    
    // CORS 이슈 체크
    try {
      console.log('🧪 CORS 테스트 시작 - 간단한 API 호출로 인증 확인');
      
      const testRequest = await fetch('https://dapi.kakao.com/v2/local/geo/coord2address.json?x=127.4&y=36.6', {
        method: 'GET',
        headers: {
          'Authorization': `KakaoAK ${this.kakaoApiKey}`
        }
      });
      
      console.log('🧪 CORS 테스트 결과:', testRequest.status, testRequest.statusText);
      
      if (testRequest.status === 401) {
        console.error('⚠️ API 키 인증 오류 (401) - 카카오 API 키 확인 필요:', this.kakaoApiKey);
        console.error('⚠️ REST API 키를 사용하고 있는지 확인하고, 로컬 API 권한이 활성화되어 있어야 합니다');
        console.error('⚠️ JavaScript SDK용 키가 아닌 REST API 키를 사용해야 합니다');
      } else if (testRequest.status === 403) {
        console.error('⚠️ 접근 권한 오류 (403) - 카카오 개발자 사이트에서 도메인 등록 확인 필요');
        console.error('⚠️ 웹 플랫폼에 현재 도메인이 등록되어 있어야 합니다. 개발 중이라면 http://localhost 추가');
      } else if (testRequest.ok) {
        console.log('✅ CORS 테스트 성공 - API 키와 권한 설정이 올바름');
        const data = await testRequest.json();
        console.log('📊 테스트 데이터:', data);
      }
    } catch (error) {
      console.error('⚠️ CORS 테스트 실패 - 직접 REST API 호출이 불가능할 수 있습니다:', error);
      console.log('⚠️ 서버 측 프록시를 통해 API를 호출하는 것이 좋습니다');
    }
    
    try {
      let allResults: any[] = [];
      
      // 위치 정보가 제공된 경우 해당 위치 주변만 검색
      if (options.location) {
        console.log('📍 현재 위치 기반 검색:', options.location);
        
        // 카테고리 검색 시도
        const categoryResults = await this.searchPlacesByCategory({
          location: options.location,
          radius: options.radius || 10000,
          page: 1,
          size: 15
        });
        
        if (categoryResults && categoryResults.length > 0) {
          console.log('✅ 카테고리 검색 성공');
          allResults = [...allResults, ...categoryResults];
        } else {
          console.log('⚠️ 카테고리 검색 결과 없음, 키워드 검색 시도');
        }
        
        // 결과가 부족하거나 없으면 키워드 검색 추가
        if (allResults.length < 5) {
          // 여러 키워드로 시도
          const keywords = ['병원', '의원', '종합병원', '내과', '외과'];
          
          for (const kwd of keywords) {
            if (allResults.length >= 15) break;
            
            const keywordResults = await this.searchPlacesByKeyword(kwd, {
              location: options.location,
              radius: options.radius || 10000,
              page: 1,
              size: 15
            });
            
            if (keywordResults && keywordResults.length > 0) {
              console.log(`✅ "${kwd}" 키워드 검색 성공: ${keywordResults.length}개`);
              // 중복 결과 제거
              keywordResults.forEach((hospital: any) => {
                if (!allResults.some(h => h.id === hospital.id)) {
                  allResults.push(hospital);
                }
              });
            }
          }
        }
        
        console.log(`📊 위치 기반 검색 결과: ${allResults.length}개 병원 찾음`);
      } else {
        // 위치 정보가 없는 경우의 기존 코드 유지
        // ... existing code ...
      }
      
      // 결과 변환 및 반환 로직 유지
      // ... existing code ...
      
      // 임시 반환값 (실제 구현으로 대체 필요)
      if (allResults.length > 0) {
        return this.transformKakaoResults(allResults);
      }
      
      return this.getMockHospitals(options);
    } catch (error) {
      console.error('❌ 병원 검색 중 심각한 오류 발생:', error);
      return this.getMockHospitals(options);
    }
  }

  // 여기서부터 기존 코드 유지
  // 병원 검색 메서드
  async searchHospitals(keyword: string, options: SearchOptions): Promise<Hospital[]> {
    // ... existing code ...
    return []; // 임시 반환값, 실제 코드로 대체해야 함
  }
  
  // 카카오맵 API 결과를 Hospital 형식으로 변환
  private transformKakaoResults(documents: any[]): Hospital[] {
    // ... existing code ...
    return []; // 임시 반환값, 실제 코드로 대체해야 함
  }
  
  // 주소에서 청주시 구 정보 추출
  private extractDistrict(address: string): string {
    // ... existing code ...
    return ""; // 임시 반환값, 실제 코드로 대체해야 함
  }
  
  // 병원 유형에 따른 진료 시간 생성
  private generateOpenHours(hospitalType: string): string {
    // ... existing code ...
    return ""; // 임시 반환값, 실제 코드로 대체해야 함
  }
  
  // 병원 유형에 따른 휴무일 생성
  private generateClosedDays(hospitalType: string): string {
    // ... existing code ...
    return ""; // 임시 반환값, 실제 코드로 대체해야 함
  }
  
  // 카테고리명에서 병원 유형 추출
  private getHospitalType(categoryName: string): string {
    // ... existing code ...
    return ""; // 임시 반환값, 실제 코드로 대체해야 함
  }
  
  // 모의 병원 데이터 반환 (테스트용, API 호출 실패 시에만 사용)
  private getMockHospitals(options: SearchOptions): Hospital[] {
    // ... existing code ...
    return []; // 임시 반환값, 실제 코드로 대체해야 함
  }
  
  // 병원 상세 정보 조회
  async getHospitalDetails(id: number | string): Promise<Hospital | null> {
    // ... existing code ...
    return null; // 임시 반환값, 실제 코드로 대체해야 함
  }

  /**
   * 카카오맵 API에 대한 CORS 테스트를 실행합니다.
   */
  private async testKakaoAPICors() {
    try {
      console.log('🔍 카카오 API CORS 테스트 시작...');
      
      // 간단한 키워드 검색 요청으로 테스트
      const testUrl = 'https://dapi.kakao.com/v2/local/search/keyword.json?query=병원&page=1&size=1';
      
      // 브라우저의 fetch API를 사용하여 테스트
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `KakaoAK ${this.kakaoRestApiKey}`
        }
      });
      
      if (response.ok) {
        console.log('✅ CORS 테스트 성공! API 키 및 권한이 올바르게 설정되었습니다.');
        const data = await response.json();
        console.log('📊 API 응답 데이터:', data);
      } else {
        console.error(`❌ CORS 테스트 실패: ${response.status} ${response.statusText}`);
        if (response.status === 401) {
          console.error('🔑 인증 오류. API 키 확인 필요:', this.kakaoRestApiKey);
          console.error('🔑 헤더 정보:', `KakaoAK ${this.kakaoRestApiKey}`);
          console.error('⚠️ 카카오 개발자 사이트에서 REST API 키를 확인하고, 웹 도메인이 등록되어 있는지 확인하세요.');
        }
      }
    } catch (error) {
      console.error('❌ CORS 테스트 중 오류 발생:', error);
      console.error('⚠️ CORS 문제가 발생했습니다. 서버측 프록시를 사용하는 것이 좋습니다.');
    }
  }

  /**
   * 카카오맵 스크립트를 로드합니다.
   */
  private loadKakaoMapScript(): void {
    // 이미 로드된 경우 중복 로드 방지
    if (document.getElementById('kakao-map-sdk')) {
      console.log('🗺️ 카카오맵 SDK가 이미 로드되어 있습니다.');
      return;
    }

    console.log('🗺️ 카카오맵 SDK 로드 시작...');

    // 글로벌 콜백 함수 생성
    window[callbackName] = () => {
      console.log('✅ 카카오맵 SDK 로드 완료!');
      this.isKakaoMapLoaded = true;
      
      // 콜백 실행
      this.mapLoadCallbacks.forEach(callback => callback());
      this.mapLoadCallbacks = [];
      
      // 필요한 경우 콜백 함수 정리
      delete window[callbackName];
    };

    // 스크립트 요소 생성
    const script = document.createElement('script');
    script.id = 'kakao-map-sdk';
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${this.kakaoApiKey}&libraries=services,clusterer,drawing&autoload=false&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => {
      console.error('❌ 카카오맵 SDK 로드 실패!');
      console.error('⚠️ API 키를 확인하고, 도메인이 카카오 개발자 포털에 등록되어 있는지 확인하세요.');
      this.isKakaoMapLoaded = false;
    };

    // 문서에 스크립트 추가
    document.head.appendChild(script);
  }

  /**
   * 카카오맵 SDK가 로드될 때까지 기다립니다.
   */
  public waitForKakaoMapLoad(): Promise<void> {
    if (this.isKakaoMapLoaded) {
      console.log('🗺️ 카카오맵 SDK가 이미 로드되어 있습니다.');
      return Promise.resolve();
    }

    console.log('🗺️ 카카오맵 SDK 로드 대기 중...');
    return new Promise((resolve) => {
      this.mapLoadCallbacks.push(resolve);
    });
  }
} 