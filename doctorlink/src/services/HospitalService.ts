// 병원 인터페이스 정의
export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  type: string;
  departments: string[];
  doctors: Doctor[];
  operatingHours: OperatingHours;
  status: HospitalStatus;
  registrationDate: string;
  lastUpdated: string;
  description: string;
  facilities: string[];
  rating: number;
  reviewCount: number;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

// 의사 인터페이스
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  profileImage?: string;
}

// 운영 시간 인터페이스
export interface OperatingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  holidays: string;
}

// 병원 상태 타입
export type HospitalStatus = 'active' | 'inactive' | 'pending';

// 카카오맵 API 서비스 클래스
export class HospitalService {
  private kakaoRestApiKey: string;

  constructor() {
    this.kakaoRestApiKey = process.env.REACT_APP_KAKAO_REST_API_KEY || 'c3316882e0900b5f3395b79433383810';
    console.log('🔑 HospitalService 초기화됨');
  }

  // 백엔드 서버 상태 확인
  private async checkBackendHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
      
      // 백엔드 서버 URL 명시적으로 지정
      const backendUrl = 'http://localhost:5000/api/ping';
      
      const response = await fetch(backendUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ 백엔드 서버 정상:', result.message);
        return true;
      } else {
        console.warn('⚠️ 백엔드 서버 응답 오류:', response.status);
        return false;
      }
    } catch (error) {
      console.warn('⚠️ 백엔드 서버 연결 실패:', error instanceof Error ? error.message : error);
      return false;
    }
  }

  // 병원 검색 (프록시 서버를 통해)
  async searchHospitals(keyword: string, options: any = {}): Promise<Hospital[]> {
    try {
      console.log(`🔍 병원 검색: ${keyword}`);
      
      // 백엔드 서버 상태 확인
      const backendAvailable = await this.checkBackendHealth();
      if (!backendAvailable) {
        console.warn('⚠️ 백엔드 서버 연결 실패, 기본 데이터 사용');
        return this.getBasicHospitals();
      }
      
      // 프록시 서버를 통한 카카오맵 API 호출 시도
      const maxRetries = 3;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 API 호출 시도 ${attempt}/${maxRetries}`);
          
          // 백엔드 서버 URL 명시적으로 지정
          const proxyUrl = new URL('/api/kakao/search', 'http://localhost:5000');
          proxyUrl.searchParams.append('query', `${keyword} 병원`);
          proxyUrl.searchParams.append('page', options.page || '1');
          proxyUrl.searchParams.append('size', options.size || '15');
          
          if (options.location) {
            proxyUrl.searchParams.append('x', options.location.longitude.toString());
            proxyUrl.searchParams.append('y', options.location.latitude.toString());
            proxyUrl.searchParams.append('radius', options.radius?.toString() || '10000');
          } else {
            // 기본 위치 (청주시)
            proxyUrl.searchParams.append('x', '127.4562');
            proxyUrl.searchParams.append('y', '36.6293');
            proxyUrl.searchParams.append('radius', '20000'); // 20km
          }
          
          console.log('🌐 API 호출 URL:', proxyUrl.toString());
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15초 타임아웃
          
          const response = await fetch(proxyUrl.toString(), {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          clearTimeout(timeoutId);
          
          console.log(`📡 API 응답: ${response.status} ${response.statusText}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API 응답 오류 (시도 ${attempt}):`, errorText);
            
            if (attempt === maxRetries) {
              throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
            }
            continue; // 다음 시도
          }
          
          const result = await response.json();
          console.log('📊 API 응답 데이터:', {
            success: result.success,
            total_count: result.data?.meta?.total_count || 0,
            documents_count: result.data?.documents?.length || 0,
            apiKeyUsed: result.apiKeyUsed
          });
          
            if (result.success && result.data && result.data.documents && result.data.documents.length > 0) {
              const apiType = result.apiType || 'keyword_search';
              const fallback = result.fallback || false;
              const apiKeyUsed = result.apiKeyUsed;
              
              console.log(`✅ 카카오맵 API 성공 (시도 ${attempt}, ${apiType}): ${result.data.documents.length}개 병원 검색`);
              
              // API 키 사용 여부로 실제 API 데이터인지 판단
              const isRealApiData = apiKeyUsed && apiKeyUsed !== 'fallback' && typeof apiKeyUsed === 'number';
              
              if (fallback || !isRealApiData) {
                console.log('⚠️ 대체 데이터 사용 중 - 실제 API 호출 실패');
              } else {
                console.log('🎉 실제 카카오맵 API 데이터 사용 중');
              }
              
              const hospitals = this.convertKakaoDataToHospitals(result.data.documents);
              
              if (isRealApiData && !fallback && hospitals.length > 0) {
                // 실제 API 데이터가 있으면 기본 데이터와 병합하지 않고 API 데이터만 사용
                console.log(`🏥 실제 API 데이터만 반환: ${hospitals.length}개 병원`);
                return hospitals;
              } else {
                // 대체 데이터이거나 API 데이터가 부족한 경우 기본 데이터와 병합
                const basicHospitals = this.getBasicHospitals();
                const combinedHospitals = [...hospitals, ...basicHospitals];
                
                // 중복 제거 (이름 기준)
                const uniqueHospitals = combinedHospitals.filter((hospital, index, self) => 
                  index === self.findIndex(h => h.name === hospital.name)
                );
                
                console.log(`🏥 병합 데이터 반환: ${uniqueHospitals.length}개 병원 (API: ${hospitals.length}, 기본: ${basicHospitals.length})`);
                return uniqueHospitals;
              }
            } else {
              console.warn(`⚠️ API 응답에 데이터 없음 (시도 ${attempt})`);
              if (attempt === maxRetries) {
                break; // 마지막 시도였으면 기본 데이터 사용
              }
            }
          
        } catch (fetchError) {
          console.error(`❌ API 호출 오류 (시도 ${attempt}):`, fetchError instanceof Error ? fetchError.message : fetchError);
          
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            console.error('⏰ API 호출 타임아웃');
          }
          
          if (attempt === maxRetries) {
            console.error('❌ 모든 API 호출 시도 실패');
            break;
          }
          
          // 재시도 전 잠시 대기
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
      
      // API 실패 시 기본 데이터 제공
      console.log('🏥 기본 병원 데이터 제공 (API 실패)');
      return this.getBasicHospitals();
      
    } catch (error) {
      console.error('병원 검색 치명적 오류:', error);
      return this.getBasicHospitals();
    }
  }

  // 주변 병원 검색
  async searchNearbyHospitals(options: any = {}): Promise<Hospital[]> {
    try {
      console.log('🔍 주변 병원 검색');
      
      const keyword = '병원';
      return await this.searchHospitals(keyword, options);
      
    } catch (error) {
      console.error('주변 병원 검색 오류:', error);
      return this.getBasicHospitals();
    }
  }

  // 카카오맵 데이터를 Hospital 인터페이스로 변환
  private convertKakaoDataToHospitals(documents: any[]): Hospital[] {
    return documents
      .filter(doc => doc.category_name.includes('병원') || doc.category_name.includes('의원') || doc.category_name.includes('클리닉'))
      .map((doc, index) => ({
        id: doc.id || `hospital_${index}`,
        name: doc.place_name,
        address: doc.address_name,
        phone: doc.phone || '정보 없음',
        email: '',
        website: doc.place_url,
        type: this.extractHospitalType(doc.category_name),
        departments: this.extractDepartments(doc.category_name),
        doctors: [],
        operatingHours: this.getDefaultOperatingHours(),
        status: 'active' as HospitalStatus,
        registrationDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        description: doc.category_name,
        facilities: [],
        rating: 4.0 + Math.random() * 1.0, // 4.0-5.0 사이 랜덤
        reviewCount: Math.floor(Math.random() * 200) + 10,
        latitude: parseFloat(doc.y),
        longitude: parseFloat(doc.x),
        distance: doc.distance ? parseFloat(doc.distance) / 1000 : undefined // 미터를 킬로미터로 변환
      }));
  }

  // 병원 타입 추출
  private extractHospitalType(categoryName: string): string {
    if (categoryName.includes('내과')) return '내과';
    if (categoryName.includes('외과')) return '외과';
    if (categoryName.includes('소아과')) return '소아과';
    if (categoryName.includes('산부인과')) return '산부인과';
    if (categoryName.includes('이비인후과')) return '이비인후과';
    if (categoryName.includes('안과')) return '안과';
    if (categoryName.includes('피부과')) return '피부과';
    if (categoryName.includes('치과')) return '치과';
    if (categoryName.includes('한의원')) return '한의원';
    if (categoryName.includes('정형외과')) return '정형외과';
    return '종합병원';
  }

  // 진료과 추출
  private extractDepartments(categoryName: string): string[] {
    const departments = [];
    if (categoryName.includes('내과')) departments.push('내과');
    if (categoryName.includes('외과')) departments.push('외과');
    if (categoryName.includes('소아과')) departments.push('소아과');
    if (categoryName.includes('산부인과')) departments.push('산부인과');
    if (categoryName.includes('이비인후과')) departments.push('이비인후과');
    if (categoryName.includes('안과')) departments.push('안과');
    if (categoryName.includes('피부과')) departments.push('피부과');
    if (categoryName.includes('치과')) departments.push('치과');
    if (categoryName.includes('정형외과')) departments.push('정형외과');
    
    return departments.length > 0 ? departments : ['일반의'];
  }

  // 기본 운영시간
  private getDefaultOperatingHours(): OperatingHours {
    return {
      monday: '09:00-18:00',
      tuesday: '09:00-18:00',
      wednesday: '09:00-18:00',
      thursday: '09:00-18:00',
      friday: '09:00-18:00',
      saturday: '09:00-13:00',
      sunday: '휴진',
      holidays: '휴진'
    };
  }

  // 기본 병원 데이터 (API 실패 시 사용)
  private getBasicHospitals(): Hospital[] {
    return [
      {
        id: 'h1',
        name: '청주성모병원',
        address: '충청북도 청주시 서원구 수영로 173',
        phone: '043-219-8114',
        email: 'info@cjsm.or.kr',
        website: 'http://www.cjsm.or.kr',
        type: '종합병원',
        departments: ['내과', '외과', '소아과', '산부인과', '이비인후과'],
        doctors: [],
        operatingHours: this.getDefaultOperatingHours(),
        status: 'active',
        registrationDate: '2023-01-01',
        lastUpdated: new Date().toISOString(),
        description: '청주 지역 대표 종합병원',
        facilities: ['응급실', '주차장', '약국', 'CT', 'MRI'],
        rating: 4.5,
        reviewCount: 150,
        latitude: 36.6293,
        longitude: 127.4562,
        distance: 0.5
      },
      {
        id: 'h2',
        name: '충북대학교병원',
        address: '충청북도 청주시 서원구 1순환로 776',
        phone: '043-269-6114',
        email: 'info@chungbuk.ac.kr',
        website: 'http://www.chungbuk.ac.kr',
        type: '대학병원',
        departments: ['내과', '외과', '신경과', '정형외과', '안과'],
        doctors: [],
        operatingHours: this.getDefaultOperatingHours(),
        status: 'active',
        registrationDate: '2023-01-01',
        lastUpdated: new Date().toISOString(),
        description: '충북대학교 의과대학 부속병원',
        facilities: ['응급실', '주차장', '약국', 'CT', 'MRI', '수술실'],
        rating: 4.7,
        reviewCount: 200,
        latitude: 36.6355,
        longitude: 127.4583,
        distance: 1.2
      },
      {
        id: 'h3',
        name: '청주한국병원',
        address: '충청북도 청주시 서원구 1순환로 1048',
        phone: '043-270-8000',
        email: 'info@cjkh.co.kr',
        type: '종합병원',
        departments: ['내과', '외과', '정형외과', '신경외과'],
        doctors: [],
        operatingHours: this.getDefaultOperatingHours(),
        status: 'active',
        registrationDate: '2023-01-01',
        lastUpdated: new Date().toISOString(),
        description: '청주 한국병원',
        facilities: ['응급실', '주차장', '약국'],
        rating: 4.3,
        reviewCount: 120,
        latitude: 36.6400,
        longitude: 127.4600,
        distance: 2.1
      },
      {
        id: 'h4',
        name: '청주세브란스병원',
        address: '충청북도 청주시 흥덕구 대농로 59',
        phone: '043-713-8000',
        email: 'info@cjsev.co.kr',
        type: '종합병원',
        departments: ['내과', '외과', '소아과', '안과', '피부과'],
        doctors: [],
        operatingHours: this.getDefaultOperatingHours(),
        status: 'active',
        registrationDate: '2023-01-01',
        lastUpdated: new Date().toISOString(),
        description: '청주 세브란스병원',
        facilities: ['응급실', '주차장', '약국', 'CT'],
        rating: 4.4,
        reviewCount: 180,
        latitude: 36.6250,
        longitude: 127.4400,
        distance: 1.8
      },
      {
        id: 'h5',
        name: '청주의료원',
        address: '충청북도 청주시 서원구 1순환로 776번길 12',
        phone: '043-201-3000',
        email: 'info@cjmc.or.kr',
        type: '공공병원',
        departments: ['내과', '외과', '응급의학과', '가정의학과'],
        doctors: [],
        operatingHours: this.getDefaultOperatingHours(),
        status: 'active',
        registrationDate: '2023-01-01',
        lastUpdated: new Date().toISOString(),
        description: '청주시 공공의료원',
        facilities: ['응급실', '주차장', '약국'],
        rating: 4.2,
        reviewCount: 95,
        latitude: 36.6320,
        longitude: 127.4520,
        distance: 1.0
      },
      {
        id: 'h6',
        name: '청주우리병원',
        address: '충청북도 청주시 흥덕구 가경로 77',
        phone: '043-269-0100',
        email: 'info@cjwh.co.kr',
        type: '종합병원',
        departments: ['내과', '외과', '정형외과', '재활의학과'],
        doctors: [],
        operatingHours: this.getDefaultOperatingHours(),
        status: 'active',
        registrationDate: '2023-01-01',
        lastUpdated: new Date().toISOString(),
        description: '청주 우리병원',
        facilities: ['주차장', '약국', '물리치료실'],
        rating: 4.1,
        reviewCount: 85,
        latitude: 36.6180,
        longitude: 127.4320,
        distance: 2.5
      },
      {
        id: 'h7',
        name: '청주성심병원',
        address: '충청북도 청주시 서원구 모충로 123',
        phone: '043-290-7000',
        email: 'info@cjsh.co.kr',
        type: '종합병원',
        departments: ['내과', '외과', '소아과', '이비인후과'],
        doctors: [],
        operatingHours: this.getDefaultOperatingHours(),
        status: 'active',
        registrationDate: '2023-01-01',
        lastUpdated: new Date().toISOString(),
        description: '청주 성심병원',
        facilities: ['응급실', '주차장', '약국'],
        rating: 4.0,
        reviewCount: 110,
        latitude: 36.6380,
        longitude: 127.4480,
        distance: 1.5
      },
      {
        id: 'h8',
        name: '청주중앙병원',
        address: '충청북도 청주시 상당구 상당로 314',
        phone: '043-220-8000',
        email: 'info@cjch.co.kr',
        type: '종합병원',
        departments: ['내과', '외과', '신경과', '안과'],
        doctors: [],
        operatingHours: this.getDefaultOperatingHours(),
        status: 'active',
        registrationDate: '2023-01-01',
        lastUpdated: new Date().toISOString(),
        description: '청주 중앙병원',
        facilities: ['주차장', '약국', 'CT'],
        rating: 4.2,
        reviewCount: 140,
        latitude: 36.6450,
        longitude: 127.4650,
        distance: 3.2
      }
    ];
  }

  // 병원 상세 정보 조회
  async getHospitalDetails(id: string): Promise<Hospital> {
    try {
      const hospitals = this.getBasicHospitals();
      const hospital = hospitals.find(h => h.id === id);
      return hospital || hospitals[0];
    } catch (error) {
      console.error('병원 상세 정보 조회 오류:', error);
      return this.getBasicHospitals()[0];
    }
  }
}

// 전역 HospitalService 인스턴스 생성
const hospitalService = new HospitalService();

export default hospitalService;
