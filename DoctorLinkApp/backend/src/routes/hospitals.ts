import { Router } from 'express';
import { HospitalController } from '../controllers/hospitalController';
import { authenticateToken, requireAdmin, requireDoctor, optionalAuth, rateLimitByUser } from '../middleware/auth';

const router = Router();

// 공개 라우트 (인증 불필요)
router.get('/',
  HospitalController.getHospitals
);

router.get('/search',
  HospitalController.searchValidation,
  HospitalController.searchHospitals
);

router.get('/nearby',
  HospitalController.findNearbyHospitals
);

router.get('/popular',
  HospitalController.getPopularHospitals
);

router.get('/stats/departments',
  HospitalController.getDepartmentStats
);

router.get('/stats/status',
  HospitalController.getStatusStats
);

router.get('/:id',
  HospitalController.getHospitalById
);

// 보호된 라우트 (인증 필요)
router.post('/',
  authenticateToken,
  requireAdmin, // 관리자만 병원 생성 가능
  rateLimitByUser(5, 60 * 60 * 1000), // 1시간에 5번 제한
  HospitalController.createHospitalValidation,
  HospitalController.createHospital
);

router.put('/:id',
  authenticateToken,
  requireAdmin, // 관리자만 병원 정보 수정 가능
  rateLimitByUser(10, 60 * 60 * 1000), // 1시간에 10번 제한
  HospitalController.updateHospitalValidation,
  HospitalController.updateHospital
);

router.delete('/:id',
  authenticateToken,
  requireAdmin, // 관리자만 병원 삭제 가능
  rateLimitByUser(3, 60 * 60 * 1000), // 1시간에 3번 제한
  HospitalController.deleteHospital
);

// 관리자 전용 라우트
router.post('/:id/approve',
  authenticateToken,
  requireAdmin,
  rateLimitByUser(20, 60 * 60 * 1000), // 1시간에 20번 제한
  HospitalController.approveHospital
);

router.post('/:id/reject',
  authenticateToken,
  requireAdmin,
  rateLimitByUser(20, 60 * 60 * 1000), // 1시간에 20번 제한
  HospitalController.rejectHospital
);

export default router;



















