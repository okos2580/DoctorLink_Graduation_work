import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken, rateLimitByUser } from '../middleware/auth';

const router = Router();

// 공개 라우트 (인증 불필요)
router.post('/login', 
  rateLimitByUser(5, 15 * 60 * 1000), // 15분에 5번 제한
  AuthController.loginValidation,
  AuthController.login
);

router.post('/register',
  rateLimitByUser(3, 60 * 60 * 1000), // 1시간에 3번 제한
  AuthController.registerValidation,
  AuthController.register
);

router.post('/kakao-login',
  rateLimitByUser(10, 15 * 60 * 1000), // 15분에 10번 제한
  AuthController.kakaoLogin
);

router.post('/refresh-token',
  rateLimitByUser(10, 15 * 60 * 1000), // 15분에 10번 제한
  AuthController.refreshToken
);

// 보호된 라우트 (인증 필요)
router.get('/profile',
  authenticateToken,
  AuthController.getProfile
);

router.put('/profile',
  authenticateToken,
  AuthController.updateProfileValidation,
  AuthController.updateProfile
);

router.put('/change-password',
  authenticateToken,
  rateLimitByUser(3, 60 * 60 * 1000), // 1시간에 3번 제한
  AuthController.changePasswordValidation,
  AuthController.changePassword
);

router.post('/logout',
  authenticateToken,
  AuthController.logout
);

router.delete('/deactivate',
  authenticateToken,
  rateLimitByUser(1, 24 * 60 * 60 * 1000), // 24시간에 1번 제한
  AuthController.deactivateAccount
);

router.get('/verify-token',
  authenticateToken,
  AuthController.verifyToken
);

export default router;



















