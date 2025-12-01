import { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { HospitalService } from '../services/hospitalService';
import { AuthenticatedRequest, HospitalFilter, PaginationQuery, SearchOptions } from '../types';

export class HospitalController {
  // 병원 생성 유효성 검사 규칙
  static createHospitalValidation = [
    body('name')
      .isLength({ min: 2, max: 200 })
      .withMessage('병원명은 2자 이상 200자 이하여야 합니다.'),
    body('address')
      .isLength({ min: 10, max: 500 })
      .withMessage('주소는 10자 이상 500자 이하여야 합니다.'),
    body('phone')
      .matches(/^0\d{1,2}-?\d{3,4}-?\d{4}$/)
      .withMessage('유효한 전화번호를 입력해주세요.'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('유효한 이메일 주소를 입력해주세요.'),
    body('website')
      .optional()
      .isURL()
      .withMessage('유효한 웹사이트 URL을 입력해주세요.'),
    body('type')
      .notEmpty()
      .withMessage('병원 유형을 입력해주세요.'),
    body('departments')
      .isArray({ min: 1 })
      .withMessage('최소 1개 이상의 진료과목을 선택해주세요.'),
    body('operatingHours')
      .isObject()
      .withMessage('운영시간 정보가 필요합니다.'),
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('설명은 2000자 이하여야 합니다.'),
    body('facilities')
      .optional()
      .isArray()
      .withMessage('시설 정보는 배열 형태여야 합니다.'),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('위도는 -90에서 90 사이의 값이어야 합니다.'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('경도는 -180에서 180 사이의 값이어야 합니다.')
  ];

  // 병원 업데이트 유효성 검사 규칙
  static updateHospitalValidation = [
    body('name')
      .optional()
      .isLength({ min: 2, max: 200 })
      .withMessage('병원명은 2자 이상 200자 이하여야 합니다.'),
    body('address')
      .optional()
      .isLength({ min: 10, max: 500 })
      .withMessage('주소는 10자 이상 500자 이하여야 합니다.'),
    body('phone')
      .optional()
      .matches(/^0\d{1,2}-?\d{3,4}-?\d{4}$/)
      .withMessage('유효한 전화번호를 입력해주세요.'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('유효한 이메일 주소를 입력해주세요.'),
    body('website')
      .optional()
      .isURL()
      .withMessage('유효한 웹사이트 URL을 입력해주세요.'),
    body('type')
      .optional()
      .notEmpty()
      .withMessage('병원 유형을 입력해주세요.'),
    body('departments')
      .optional()
      .isArray({ min: 1 })
      .withMessage('최소 1개 이상의 진료과목을 선택해주세요.'),
    body('operatingHours')
      .optional()
      .isObject()
      .withMessage('운영시간 정보가 올바르지 않습니다.'),
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('설명은 2000자 이하여야 합니다.'),
    body('facilities')
      .optional()
      .isArray()
      .withMessage('시설 정보는 배열 형태여야 합니다.'),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('위도는 -90에서 90 사이의 값이어야 합니다.'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('경도는 -180에서 180 사이의 값이어야 합니다.'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'pending'])
      .withMessage('상태는 active, inactive, pending 중 하나여야 합니다.')
  ];

  // 검색 유효성 검사 규칙
  static searchValidation = [
    query('keyword')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('검색어는 1자 이상 100자 이하여야 합니다.'),
    query('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('위도는 -90에서 90 사이의 값이어야 합니다.'),
    query('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('경도는 -180에서 180 사이의 값이어야 합니다.'),
    query('radius')
      .optional()
      .isFloat({ min: 0.1, max: 100 })
      .withMessage('반경은 0.1km에서 100km 사이여야 합니다.'),
    query('type')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('병원 유형은 1자 이상 50자 이하여야 합니다.'),
    query('category')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('진료과목은 1자 이상 50자 이하여야 합니다.'),
    query('sort')
      .optional()
      .isIn(['distance', 'rating', 'name'])
      .withMessage('정렬 기준은 distance, rating, name 중 하나여야 합니다.'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('제한 개수는 1에서 100 사이여야 합니다.')
  ];

  // 병원 생성
  static async createHospital(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // 유효성 검사 결과 확인
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: '입력 데이터가 유효하지 않습니다.',
          errors: errors.array()
        });
        return;
      }

      const hospitalData = req.body;
      const result = await HospitalService.createHospital(hospitalData);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('병원 생성 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 병원 조회 (ID)
  static async getHospitalById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: '병원 ID가 필요합니다.',
          error: 'HOSPITAL_ID_REQUIRED'
        });
        return;
      }

      const result = await HospitalService.getHospitalById(id);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('병원 조회 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 병원 목록 조회
  static async getHospitals(req: Request, res: Response): Promise<void> {
    try {
      const {
        status,
        type,
        searchTerm,
        department,
        latitude,
        longitude,
        radius,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const filter: HospitalFilter = {};
      const pagination: PaginationQuery = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'ASC' | 'DESC'
      };

      // 필터 설정
      if (status) filter.status = status as any;
      if (type) filter.type = type as string;
      if (searchTerm) filter.searchTerm = searchTerm as string;
      if (department) filter.department = department as string;
      if (latitude && longitude) {
        filter.latitude = parseFloat(latitude as string);
        filter.longitude = parseFloat(longitude as string);
        if (radius) filter.radius = parseFloat(radius as string);
      }

      // Mock 병원 데이터 응답
      res.status(200).json({
        success: true,
        message: '병원 목록을 조회했습니다.',
        data: {
          hospitals: [
            {
              id: 'mock-hospital-1',
              name: '서울대학교병원',
              address: '서울특별시 종로구 대학로 101',
              phone: '02-2072-2114',
              type: '종합병원',
              departments: ['내과', '외과', '소아과'],
              rating: 4.5,
              reviewCount: 1234
            }
          ],
          total: 1,
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1
          }
        }
      });
    } catch (error) {
      console.error('병원 목록 조회 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 병원 검색
  static async searchHospitals(req: Request, res: Response): Promise<void> {
    try {
      // 유효성 검사 결과 확인
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: '검색 조건이 유효하지 않습니다.',
          errors: errors.array()
        });
        return;
      }

      const {
        keyword,
        latitude,
        longitude,
        radius,
        category,
        type,
        sort = 'rating',
        limit = 20
      } = req.query;

      const options: SearchOptions = {
        keyword: keyword as string,
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
        radius: radius ? parseFloat(radius as string) : undefined,
        category: category as string,
        type: type as string,
        sort: sort as 'distance' | 'rating' | 'name',
        limit: parseInt(limit as string)
      };

      const result = await HospitalService.searchHospitals(options);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('병원 검색 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 근처 병원 찾기
  static async findNearbyHospitals(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude, radius = 10, limit = 10 } = req.query;

      if (!latitude || !longitude) {
        res.status(400).json({
          success: false,
          message: '위도와 경도가 필요합니다.',
          error: 'COORDINATES_REQUIRED'
        });
        return;
      }

      const result = await HospitalService.findNearbyHospitals(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseFloat(radius as string),
        parseInt(limit as string)
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('근처 병원 찾기 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 인기 병원 조회
  static async getPopularHospitals(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      const result = await HospitalService.getPopularHospitals(parseInt(limit as string));

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('인기 병원 조회 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 병원 정보 업데이트
  static async updateHospital(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // 유효성 검사 결과 확인
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: '입력 데이터가 유효하지 않습니다.',
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: '병원 ID가 필요합니다.',
          error: 'HOSPITAL_ID_REQUIRED'
        });
        return;
      }

      const result = await HospitalService.updateHospital(id, updateData);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('병원 업데이트 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 병원 삭제
  static async deleteHospital(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: '병원 ID가 필요합니다.',
          error: 'HOSPITAL_ID_REQUIRED'
        });
        return;
      }

      const result = await HospitalService.deleteHospital(id);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('병원 삭제 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 병원 승인 (관리자용)
  static async approveHospital(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: '병원 ID가 필요합니다.',
          error: 'HOSPITAL_ID_REQUIRED'
        });
        return;
      }

      const result = await HospitalService.approveHospital(id);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('병원 승인 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 병원 거부 (관리자용)
  static async rejectHospital(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: '병원 ID가 필요합니다.',
          error: 'HOSPITAL_ID_REQUIRED'
        });
        return;
      }

      const result = await HospitalService.rejectHospital(id);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('병원 거부 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 부서별 통계 조회
  static async getDepartmentStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await HospitalService.getDepartmentStats();

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('부서별 통계 조회 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 병원 상태별 통계 조회
  static async getStatusStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await HospitalService.getHospitalCountByStatus();

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('상태별 통계 조회 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}
