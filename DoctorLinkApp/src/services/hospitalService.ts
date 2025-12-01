import { 
  Hospital, 
  Doctor, 
  HospitalFilter, 
  SearchOptions,
  ApiResponse,
  PaginatedResponse 
} from '../types';
import { get, post } from './api';

// 병원 서비스 클래스
class HospitalService {
  // 병원 목록 조회
  async getHospitals(filter?: HospitalFilter): Promise<ApiResponse<Hospital[]>> {
    try {
      // Mock 데이터 사용
      const mockHospitals = this.generateMockHospitals(10);
      
      // 필터 적용
      let filteredHospitals = mockHospitals;
      
      if (filter?.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        filteredHospitals = filteredHospitals.filter(hospital =>
          hospital.name.toLowerCase().includes(searchTerm) ||
          hospital.address.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filter?.type) {
        filteredHospitals = filteredHospitals.filter(hospital => hospital.type === filter.type);
      }
      
      if (filter?.department) {
        filteredHospitals = filteredHospitals.filter(hospital => 
          hospital.departments.includes(filter.department!)
        );
      }

      return {
        success: true,
        message: '병원 목록을 성공적으로 불러왔습니다.',
        data: filteredHospitals
      };
    } catch (error: any) {
      console.error('병원 목록 조회 오류:', error);
      return {
        success: false,
        message: error.message || '병원 목록을 불러오는데 실패했습니다.',
        data: [],
      };
    }
  }

  // 병원 상세 정보 조회
  async getHospitalById(hospitalId: string): Promise<ApiResponse<Hospital>> {
    try {
      // Mock 데이터에서 병원 찾기
      const mockHospitals = this.generateMockHospitals(10);
      const hospital = mockHospitals.find(h => h.id === hospitalId);
      
      if (hospital) {
        return {
          success: true,
          message: '병원 정보를 성공적으로 불러왔습니다.',
          data: hospital
        };
      } else {
        return {
          success: false,
          message: '병원을 찾을 수 없습니다.',
        };
      }
    } catch (error: any) {
      console.error('병원 상세 정보 조회 오류:', error);
      return {
        success: false,
        message: error.message || '병원 정보를 불러오는데 실패했습니다.',
      };
    }
  }

  // 병원 검색 (위치 기반)
  async searchHospitals(options: SearchOptions): Promise<ApiResponse<Hospital[]>> {
    try {
      // Mock 데이터 사용
      const mockHospitals = this.generateMockHospitals(15);
      let results = mockHospitals;
      
      // 키워드 검색
      if (options.keyword) {
        const keyword = options.keyword.toLowerCase();
        results = results.filter(hospital =>
          hospital.name.toLowerCase().includes(keyword) ||
          hospital.address.toLowerCase().includes(keyword) ||
          hospital.departments.some(dept => dept.toLowerCase().includes(keyword))
        );
      }
      
      // 카테고리/타입 필터
      if (options.type) {
        results = results.filter(hospital => hospital.type === options.type);
      }
      
      // 정렬
      if (options.sort === 'distance') {
        results = results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      } else if (options.sort === 'rating') {
        results = results.sort((a, b) => b.rating - a.rating);
      }
      
      // 제한
      if (options.limit) {
        results = results.slice(0, options.limit);
      }
      
      return {
        success: true,
        message: '병원 검색을 완료했습니다.',
        data: results
      };
    } catch (error: any) {
      console.error('병원 검색 오류:', error);
      return {
        success: false,
        message: error.message || '병원 검색에 실패했습니다.',
        data: [],
      };
    }
  }

  // 병원 검색 (키워드 기반)
  async searchHospitalsByKeyword(keyword: string): Promise<ApiResponse<Hospital[]>> {
    try {
      // searchHospitals 메서드 재사용
      return await this.searchHospitals({ keyword });
    } catch (error: any) {
      console.error('병원 키워드 검색 오류:', error);
      return {
        success: false,
        message: error.message || '병원 검색에 실패했습니다.',
        data: [],
      };
    }
  }

  // 근처 병원 찾기
  async getNearbyHospitals(
    latitude: number, 
    longitude: number, 
    radius: number = 5
  ): Promise<ApiResponse<Hospital[]>> {
    try {
      const options: SearchOptions = {
        latitude,
        longitude,
        radius,
        sort: 'distance',
      };
      
      const response = await get<Hospital[]>('/hospitals/nearby', options);
      return response;
    } catch (error: any) {
      console.error('근처 병원 조회 오류:', error);
      return {
        success: false,
        message: error.message || '근처 병원을 찾는데 실패했습니다.',
        data: [],
      };
    }
  }

  // 병원 의사 목록 조회
  async getHospitalDoctors(hospitalId: string): Promise<ApiResponse<Doctor[]>> {
    try {
      const response = await get<Doctor[]>(`/hospitals/${hospitalId}/doctors`);
      return response;
    } catch (error: any) {
      console.error('병원 의사 목록 조회 오류:', error);
      return {
        success: false,
        message: error.message || '의사 목록을 불러오는데 실패했습니다.',
        data: [],
      };
    }
  }

  // 병원 진료과 목록 조회
  async getHospitalDepartments(hospitalId?: string): Promise<ApiResponse<string[]>> {
    try {
      const url = hospitalId 
        ? `/hospitals/${hospitalId}/departments` 
        : '/hospitals/departments';
      
      const response = await get<string[]>(url);
      return response;
    } catch (error: any) {
      console.error('진료과 목록 조회 오류:', error);
      return {
        success: false,
        message: error.message || '진료과 목록을 불러오는데 실패했습니다.',
        data: [],
      };
    }
  }

  // 병원 리뷰 조회
  async getHospitalReviews(hospitalId: string, page: number = 1): Promise<ApiResponse<any[]>> {
    try {
      const response = await get<any[]>(`/hospitals/${hospitalId}/reviews`, { page });
      return response;
    } catch (error: any) {
      console.error('병원 리뷰 조회 오류:', error);
      return {
        success: false,
        message: error.message || '리뷰를 불러오는데 실패했습니다.',
        data: [],
      };
    }
  }

  // 병원 리뷰 작성
  async createHospitalReview(
    hospitalId: string, 
    review: {
      rating: number;
      comment: string;
      doctorId?: string;
    }
  ): Promise<ApiResponse> {
    try {
      const response = await post(`/hospitals/${hospitalId}/reviews`, review);
      return response;
    } catch (error: any) {
      console.error('병원 리뷰 작성 오류:', error);
      return {
        success: false,
        message: error.message || '리뷰 작성에 실패했습니다.',
      };
    }
  }

  // 병원 즐겨찾기 추가/제거
  async toggleHospitalFavorite(hospitalId: string): Promise<ApiResponse> {
    try {
      const response = await post(`/hospitals/${hospitalId}/favorite`);
      return response;
    } catch (error: any) {
      console.error('병원 즐겨찾기 토글 오류:', error);
      return {
        success: false,
        message: error.message || '즐겨찾기 설정에 실패했습니다.',
      };
    }
  }

  // 즐겨찾기 병원 목록 조회
  async getFavoriteHospitals(): Promise<ApiResponse<Hospital[]>> {
    try {
      const response = await get<Hospital[]>('/hospitals/favorites');
      return response;
    } catch (error: any) {
      console.error('즐겨찾기 병원 조회 오류:', error);
      return {
        success: false,
        message: error.message || '즐겨찾기 병원을 불러오는데 실패했습니다.',
        data: [],
      };
    }
  }

  // =================== 필터링 및 정렬 ===================

  // 병원 목록 필터링 (클라이언트 사이드)
  filterHospitals(hospitals: Hospital[], filter: HospitalFilter): Hospital[] {
    let filtered = [...hospitals];

    if (filter.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(searchTerm) ||
        hospital.address.toLowerCase().includes(searchTerm) ||
        hospital.departments.some(dept => dept.toLowerCase().includes(searchTerm))
      );
    }

    if (filter.type) {
      filtered = filtered.filter(hospital => hospital.type === filter.type);
    }

    if (filter.department) {
      filtered = filtered.filter(hospital =>
        hospital.departments.includes(filter.department!)
      );
    }

    if (filter.status) {
      filtered = filtered.filter(hospital => hospital.status === filter.status);
    }

    return filtered;
  }

  // 병원 목록 정렬
  sortHospitals(hospitals: Hospital[], sortBy: 'distance' | 'rating' | 'name' = 'distance'): Hospital[] {
    return [...hospitals].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }

  // =================== 유틸리티 메서드 ===================

  // 거리 계산 (Haversine formula)
  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // 거리 (km)
    
    return Math.round(distance * 10) / 10; // 소수점 첫째 자리까지
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // 영업 시간 확인
  isHospitalOpen(hospital: Hospital, date?: Date): boolean {
    const now = date || new Date();
    const dayOfWeek = now.getDay(); // 0: 일요일, 1: 월요일, ...
    const currentTime = now.getHours() * 60 + now.getMinutes(); // 분 단위

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = days[dayOfWeek] as keyof typeof hospital.operatingHours;
    const operatingHours = hospital.operatingHours[dayKey];

    if (operatingHours === '휴진' || operatingHours === 'CLOSED') {
      return false;
    }

    // "09:00-18:00" 또는 "09:00 - 18:00" 형식 파싱
    const timeMatch = operatingHours.match(/(\d{2}):(\d{2})\s*-?\s*(\d{2}):(\d{2})/);
    if (!timeMatch) {
      return false;
    }

    const openTime = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
    const closeTime = parseInt(timeMatch[3]) * 60 + parseInt(timeMatch[4]);

    return currentTime >= openTime && currentTime <= closeTime;
  }

  // Mock 데이터 생성 (개발용)
  generateMockHospitals(count: number = 10): Hospital[] {
    const mockHospitals: Hospital[] = [];
    const hospitalTypes = ['종합병원', '병원', '의원', '치과', '한의원'];
    const departments = ['내과', '외과', '정형외과', '피부과', '안과', '이비인후과', '산부인과'];
    const cityNames = ['서울대학교', '연세', '삼성', '서울아산', '강남세브란스'];

    for (let i = 1; i <= count; i++) {
      const hospitalDepartments = departments.slice(0, 3 + (i % 3));
      const hospitalDoctors = this.generateMockDoctors(hospitalDepartments, `hosp-${i.toString().padStart(3, '0')}`);
      
      // 거리를 규칙적으로 생성 (0.5km ~ 10km)
      const distance = 0.5 + (i - 1) * 0.7;
      
      // 평점을 다양하게 생성 (3.5 ~ 5.0)
      const rating = 3.5 + ((count - i) % 16) * 0.1;
      
      mockHospitals.push({
        id: `hosp-${i.toString().padStart(3, '0')}`,
        name: `${cityNames[(i - 1) % cityNames.length]}병원`,
        address: `서울특별시 ${['강남구', '서초구', '종로구', '중구', '용산구'][i % 5]} ${['테헤란로', '강남대로', '서초대로', '종로', '이태원로'][i % 5]} ${i * 10}`,
        phone: `02-${(1000 + i).toString()}-${(1000 + i * 2).toString()}`,
        email: `info@hospital${i}.com`,
        website: `https://hospital${i}.com`,
        type: hospitalTypes[i % hospitalTypes.length],
        departments: hospitalDepartments,
        doctors: hospitalDoctors,
        operatingHours: {
          monday: '09:00-18:00',
          tuesday: '09:00-18:00',
          wednesday: '09:00-18:00',
          thursday: '09:00-18:00',
          friday: '09:00-18:00',
          saturday: '09:00-13:00',
          sunday: '휴진',
        },
        status: 'active',
        registrationDate: new Date(2023, 0, i).toISOString(),
        lastUpdated: new Date().toISOString(),
        description: `전문의료진과 첨단 시설을 갖춘 ${hospitalTypes[i % hospitalTypes.length]}입니다.`,
        facilities: ['주차장', 'WiFi', '휠체어 접근', '응급실'],
        rating: Math.round(rating * 10) / 10,
        reviewCount: 50 + (i * 15),
        latitude: 37.5665 + (i - count / 2) * 0.01,
        longitude: 126.9780 + (i - count / 2) * 0.01,
        distance: Math.round(distance * 10) / 10,
      });
    }

    return mockHospitals;
  }

  // Mock 의사 데이터 생성
  generateMockDoctors(departments: string[], hospitalId: string): Doctor[] {
    const mockDoctors: Doctor[] = [];
    const doctorNames = [
      '김의사', '이의사', '박의사', '최의사', '정의사', 
      '강의사', '조의사', '윤의사', '장의사', '임의사'
    ];
    const specializations = {
      '내과': ['소화기내과', '순환기내과', '호흡기내과', '내분비내과'],
      '외과': ['일반외과', '흉부외과', '신경외과', '성형외과'],
      '정형외과': ['척추', '관절', '외상', '수부'],
      '피부과': ['아토피', '여드름', '탈모', '성형'],
      '안과': ['백내장', '녹내장', '망막', '시력교정'],
      '이비인후과': ['귀', '코', '목', '음성'],
      '산부인과': ['산과', '부인과', '불임', '갱년기']
    };

    departments.forEach((department, deptIndex) => {
      // 각 진료과마다 2-3명의 의사 생성
      const doctorCount = 2 + (deptIndex % 2);
      
      for (let i = 0; i < doctorCount; i++) {
        const doctorIndex = (deptIndex * doctorCount + i) % doctorNames.length;
        const specs = specializations[department as keyof typeof specializations] || ['일반'];
        
        mockDoctors.push({
          id: `doctor-${hospitalId}-${department}-${i + 1}`,
          name: doctorNames[doctorIndex],
          department: department,
          specialization: specs[i % specs.length],
          experience: 5 + ((doctorIndex + i) % 15), // 5-20년 경력
          education: `${['서울대', '연세대', '고려대', '가톨릭대', '성균관대'][doctorIndex % 5]} 의과대학`,
          phone: `02-${(2000 + doctorIndex).toString()}-${(3000 + i).toString()}`,
          email: `${doctorNames[doctorIndex].toLowerCase()}@hospital.com`,
          rating: 4.0 + ((doctorIndex + i) % 10) * 0.1,
          reviewCount: 20 + ((doctorIndex + i) * 3),
          hospitalId: hospitalId,
          hospitalName: '', // 병원 이름은 나중에 설정
          licenseNumber: `DOC-${hospitalId}-${(doctorIndex + 1).toString().padStart(3, '0')}`,
        });
      }
    });

    return mockDoctors;
  }
}

// 싱글톤 인스턴스 생성
const hospitalService = new HospitalService();

export default hospitalService; 