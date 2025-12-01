import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest, LoginRequest, RegisterRequest, KakaoLoginRequest } from '../types';

export class AuthController {
  // 로그인 유효성 검사 규칙
  static loginValidation = [
    body('email')
      .isEmail()
      .withMessage('유효한 이메일 주소를 입력해주세요.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
  ];

  // 회원가입 유효성 검사 규칙
  static registerValidation = [
    body('email')
      .isEmail()
      .withMessage('유효한 이메일 주소를 입력해주세요.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage('비밀번호는 영문과 숫자를 포함해야 합니다.'),
    body('name')
      .isLength({ min: 2, max: 50 })
      .withMessage('이름은 2자 이상 50자 이하여야 합니다.')
      .matches(/^[가-힣a-zA-Z\s]+$/)
      .withMessage('이름은 한글, 영문, 공백만 사용할 수 있습니다.'),
    body('phone')
      .matches(/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/)
      .withMessage('유효한 휴대폰 번호를 입력해주세요.'),
    body('birthDate')
      .isISO8601()
      .withMessage('유효한 생년월일을 입력해주세요. (YYYY-MM-DD)')
      .custom((value) => {
        const birthYear = new Date(value).getFullYear();
        const currentYear = new Date().getFullYear();
        if (currentYear - birthYear < 14 || currentYear - birthYear > 120) {
          throw new Error('나이는 14세 이상 120세 이하여야 합니다.');
        }
        return true;
      }),
    body('gender')
      .isIn(['male', 'female'])
      .withMessage('성별은 male 또는 female이어야 합니다.'),
    body('address')
      .optional()
      .isLength({ max: 500 })
      .withMessage('주소는 500자 이하여야 합니다.'),
    body('role')
      .optional()
      .isIn(['patient', 'doctor'])
      .withMessage('역할은 patient 또는 doctor여야 합니다.')
  ];

  // 비밀번호 변경 유효성 검사 규칙
  static changePasswordValidation = [
    body('currentPassword')
      .notEmpty()
      .withMessage('현재 비밀번호를 입력해주세요.'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('새 비밀번호는 최소 6자 이상이어야 합니다.')
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage('새 비밀번호는 영문과 숫자를 포함해야 합니다.')
  ];

  // 프로필 업데이트 유효성 검사 규칙
  static updateProfileValidation = [
    body('name')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('이름은 2자 이상 50자 이하여야 합니다.')
      .matches(/^[가-힣a-zA-Z\s]+$/)
      .withMessage('이름은 한글, 영문, 공백만 사용할 수 있습니다.'),
    body('phone')
      .optional()
      .matches(/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/)
      .withMessage('유효한 휴대폰 번호를 입력해주세요.'),
    body('birthDate')
      .optional()
      .isISO8601()
      .withMessage('유효한 생년월일을 입력해주세요. (YYYY-MM-DD)'),
    body('gender')
      .optional()
      .isIn(['male', 'female'])
      .withMessage('성별은 male 또는 female이어야 합니다.'),
    body('address')
      .optional()
      .isLength({ max: 500 })
      .withMessage('주소는 500자 이하여야 합니다.')
  ];

  // 로그인
  static async login(req: Request, res: Response): Promise<void> {
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

      // Mock 로그인 응답
      const { email, password } = req.body;
      
      if (email === 'test@test.com' && password === 'test123') {
        res.status(200).json({
          success: true,
          message: '로그인이 완료되었습니다.',
          data: {
            user: {
              id: 'mock-user-1',
              email: 'test@test.com',
              name: '테스트 사용자',
              phone: '010-1234-5678',
              birthDate: '1990-01-01',
              gender: 'male',
              role: 'patient',
              status: 'active'
            },
            tokens: {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token'
            }
          }
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        error: 'INVALID_CREDENTIALS'
      });
    } catch (error) {
      console.error('로그인 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 회원가입
  static async register(req: Request, res: Response): Promise<void> {
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

      const registerData: RegisterRequest = req.body;
      const result = await AuthService.register(registerData);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('회원가입 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 카카오 로그인
  static async kakaoLogin(req: Request, res: Response): Promise<void> {
    try {
      const kakaoData: KakaoLoginRequest = req.body;
      
      // 기본 유효성 검사
      if (!kakaoData.accessToken || !kakaoData.userInfo) {
        res.status(400).json({
          success: false,
          message: '카카오 로그인 데이터가 유효하지 않습니다.',
          error: 'INVALID_KAKAO_DATA'
        });
        return;
      }

      const result = await AuthService.kakaoLogin(kakaoData);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('카카오 로그인 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 토큰 갱신
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: '리프레시 토큰이 필요합니다.',
          error: 'REFRESH_TOKEN_REQUIRED'
        });
        return;
      }

      const result = await AuthService.refreshToken(refreshToken);

      if (!result.success) {
        res.status(401).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('토큰 갱신 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 프로필 조회
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
          error: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }

      const result = await AuthService.getProfile(req.user!.userId);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('프로필 조회 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 프로필 업데이트
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
          error: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }

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

      const updateData = req.body;
      const result = await AuthService.updateProfile(req.user!.userId, updateData);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('프로필 업데이트 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 비밀번호 변경
  static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
          error: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }

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

      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(req.user!.userId, currentPassword, newPassword);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('비밀번호 변경 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 로그아웃 (클라이언트에서 토큰 삭제)
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // 실제로는 클라이언트에서 토큰을 삭제하면 됨
      // 서버에서는 토큰 블랙리스트를 관리할 수도 있음
      res.status(200).json({
        success: true,
        message: '로그아웃이 완료되었습니다.'
      });
    } catch (error) {
      console.error('로그아웃 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 계정 비활성화
  static async deactivateAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
          error: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }

      const result = await AuthService.deactivateAccount(req.user!.userId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('계정 비활성화 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // 토큰 검증 (현재 사용자 정보 반환)
  static async verifyToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '유효하지 않은 토큰입니다.',
          error: 'INVALID_TOKEN'
        });
        return;
      }

      const result = await AuthService.getProfile(req.user!.userId);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        message: '토큰이 유효합니다.',
        data: {
          user: result.data,
          tokenInfo: {
            userId: req.user!.userId,
            email: req.user!.email,
            role: req.user!.role
          }
        }
      });
    } catch (error) {
      console.error('토큰 검증 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}
