import { HospitalModel } from '../models/Hospital';
import { 
  Hospital, 
  HospitalFilter, 
  PaginationQuery, 
  SearchOptions, 
  ServiceResponse 
} from '../types';

export class HospitalService {
  // 병원 생성
  static async createHospital(hospitalData: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt' | 'registrationDate' | 'lastUpdated' | 'rating' | 'reviewCount'>): Promise<ServiceResponse<Hospital>> {
    try {
      const hospital = await HospitalModel.create(hospitalData);
      
      return {
        success: true,
        message: '병원이 성공적으로 등록되었습니다.',
        data: hospital
      };
    } catch (error) {
      console.error('병원 생성 오류:', error);
      return {
        success: false,
        message: '병원 등록 중 오류가 발생했습니다.',
        error: 'HOSPITAL_CREATION_ERROR'
      };
    }
  }

  // 병원 조회 (ID)
  static async getHospitalById(id: string): Promise<ServiceResponse<Hospital>> {
    try {
      const hospital = await HospitalModel.findById(id);
      
      if (!hospital) {
        return {
          success: false,
          message: '병원을 찾을 수 없습니다.',
          error: 'HOSPITAL_NOT_FOUND'
        };
      }

      return {
        success: true,
        data: hospital
      };
    } catch (error) {
      console.error('병원 조회 오류:', error);
      return {
        success: false,
        message: '병원 조회 중 오류가 발생했습니다.',
        error: 'HOSPITAL_FETCH_ERROR'
      };
    }
  }

  // 병원 목록 조회
  static async getHospitals(
    filter: HospitalFilter = {},
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ hospitals: Hospital[]; total: number; pagination: any }>> {
    try {
      const { hospitals, total } = await HospitalModel.findMany(filter, pagination);
      
      const { page = 1, limit = 10 } = pagination;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          hospitals,
          total,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      };
    } catch (error) {
      console.error('병원 목록 조회 오류:', error);
      return {
        success: false,
        message: '병원 목록 조회 중 오류가 발생했습니다.',
        error: 'HOSPITALS_FETCH_ERROR'
      };
    }
  }

  // 병원 검색
  static async searchHospitals(options: SearchOptions): Promise<ServiceResponse<Hospital[]>> {
    try {
      const hospitals = await HospitalModel.search(options);
      
      return {
        success: true,
        message: `${hospitals.length}개의 병원을 찾았습니다.`,
        data: hospitals
      };
    } catch (error) {
      console.error('병원 검색 오류:', error);
      return {
        success: false,
        message: '병원 검색 중 오류가 발생했습니다.',
        error: 'HOSPITAL_SEARCH_ERROR'
      };
    }
  }

  // 근처 병원 찾기
  static async findNearbyHospitals(
    latitude: number,
    longitude: number,
    radius: number = 10,
    limit: number = 10
  ): Promise<ServiceResponse<Hospital[]>> {
    try {
      const hospitals = await HospitalModel.findNearby(latitude, longitude, radius, limit);
      
      return {
        success: true,
        message: `반경 ${radius}km 내 ${hospitals.length}개의 병원을 찾았습니다.`,
        data: hospitals
      };
    } catch (error) {
      console.error('근처 병원 찾기 오류:', error);
      return {
        success: false,
        message: '근처 병원 찾기 중 오류가 발생했습니다.',
        error: 'NEARBY_HOSPITALS_ERROR'
      };
    }
  }

  // 인기 병원 조회
  static async getPopularHospitals(limit: number = 10): Promise<ServiceResponse<Hospital[]>> {
    try {
      const hospitals = await HospitalModel.getPopular(limit);
      
      return {
        success: true,
        message: `인기 병원 ${hospitals.length}개를 조회했습니다.`,
        data: hospitals
      };
    } catch (error) {
      console.error('인기 병원 조회 오류:', error);
      return {
        success: false,
        message: '인기 병원 조회 중 오류가 발생했습니다.',
        error: 'POPULAR_HOSPITALS_ERROR'
      };
    }
  }

  // 병원 정보 업데이트
  static async updateHospital(id: string, updateData: Partial<Hospital>): Promise<ServiceResponse<Hospital>> {
    try {
      const hospital = await HospitalModel.update(id, updateData);
      
      if (!hospital) {
        return {
          success: false,
          message: '병원을 찾을 수 없습니다.',
          error: 'HOSPITAL_NOT_FOUND'
        };
      }

      return {
        success: true,
        message: '병원 정보가 업데이트되었습니다.',
        data: hospital
      };
    } catch (error) {
      console.error('병원 업데이트 오류:', error);
      return {
        success: false,
        message: '병원 정보 업데이트 중 오류가 발생했습니다.',
        error: 'HOSPITAL_UPDATE_ERROR'
      };
    }
  }

  // 병원 삭제 (소프트 삭제)
  static async deleteHospital(id: string): Promise<ServiceResponse<void>> {
    try {
      const success = await HospitalModel.delete(id);
      
      if (!success) {
        return {
          success: false,
          message: '병원을 찾을 수 없습니다.',
          error: 'HOSPITAL_NOT_FOUND'
        };
      }

      return {
        success: true,
        message: '병원이 삭제되었습니다.'
      };
    } catch (error) {
      console.error('병원 삭제 오류:', error);
      return {
        success: false,
        message: '병원 삭제 중 오류가 발생했습니다.',
        error: 'HOSPITAL_DELETE_ERROR'
      };
    }
  }

  // 병원 승인 (관리자용)
  static async approveHospital(id: string): Promise<ServiceResponse<Hospital>> {
    try {
      const hospital = await HospitalModel.update(id, { status: 'active' });
      
      if (!hospital) {
        return {
          success: false,
          message: '병원을 찾을 수 없습니다.',
          error: 'HOSPITAL_NOT_FOUND'
        };
      }

      return {
        success: true,
        message: '병원이 승인되었습니다.',
        data: hospital
      };
    } catch (error) {
      console.error('병원 승인 오류:', error);
      return {
        success: false,
        message: '병원 승인 중 오류가 발생했습니다.',
        error: 'HOSPITAL_APPROVAL_ERROR'
      };
    }
  }

  // 병원 거부 (관리자용)
  static async rejectHospital(id: string): Promise<ServiceResponse<Hospital>> {
    try {
      const hospital = await HospitalModel.update(id, { status: 'inactive' });
      
      if (!hospital) {
        return {
          success: false,
          message: '병원을 찾을 수 없습니다.',
          error: 'HOSPITAL_NOT_FOUND'
        };
      }

      return {
        success: true,
        message: '병원이 거부되었습니다.',
        data: hospital
      };
    } catch (error) {
      console.error('병원 거부 오류:', error);
      return {
        success: false,
        message: '병원 거부 중 오류가 발생했습니다.',
        error: 'HOSPITAL_REJECTION_ERROR'
      };
    }
  }

  // 부서별 병원 수 통계
  static async getDepartmentStats(): Promise<ServiceResponse<Array<{ department: string; count: number }>>> {
    try {
      const stats = await HospitalModel.countByDepartment();
      
      return {
        success: true,
        message: '부서별 병원 통계를 조회했습니다.',
        data: stats
      };
    } catch (error) {
      console.error('부서별 통계 조회 오류:', error);
      return {
        success: false,
        message: '부서별 통계 조회 중 오류가 발생했습니다.',
        error: 'DEPARTMENT_STATS_ERROR'
      };
    }
  }

  // 병원 평점 업데이트
  static async updateHospitalRating(id: string): Promise<ServiceResponse<void>> {
    try {
      const success = await HospitalModel.updateRating(id);
      
      if (!success) {
        return {
          success: false,
          message: '병원을 찾을 수 없습니다.',
          error: 'HOSPITAL_NOT_FOUND'
        };
      }

      return {
        success: true,
        message: '병원 평점이 업데이트되었습니다.'
      };
    } catch (error) {
      console.error('병원 평점 업데이트 오류:', error);
      return {
        success: false,
        message: '병원 평점 업데이트 중 오류가 발생했습니다.',
        error: 'RATING_UPDATE_ERROR'
      };
    }
  }

  // 병원 상태별 개수 조회
  static async getHospitalCountByStatus(): Promise<ServiceResponse<{ [key: string]: number }>> {
    try {
      // 이 기능은 HospitalModel에 추가 구현이 필요합니다
      // 임시로 기본 구현을 제공합니다
      const activeHospitals = await HospitalModel.findMany({ status: 'active' });
      const pendingHospitals = await HospitalModel.findMany({ status: 'pending' });
      const inactiveHospitals = await HospitalModel.findMany({ status: 'inactive' });

      const stats = {
        active: activeHospitals.total,
        pending: pendingHospitals.total,
        inactive: inactiveHospitals.total,
        total: activeHospitals.total + pendingHospitals.total + inactiveHospitals.total
      };

      return {
        success: true,
        message: '병원 상태별 통계를 조회했습니다.',
        data: stats
      };
    } catch (error) {
      console.error('병원 상태별 통계 조회 오류:', error);
      return {
        success: false,
        message: '병원 상태별 통계 조회 중 오류가 발생했습니다.',
        error: 'STATUS_STATS_ERROR'
      };
    }
  }
}



















