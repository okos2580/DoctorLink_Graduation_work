import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JWTPayload, UserRole } from '../types';

// JWT 토큰 검증 미들웨어
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      message: '액세스 토큰이 필요합니다.',
      error: 'NO_TOKEN'
    });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET이 설정되지 않았습니다.');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: '토큰이 만료되었습니다.',
        error: 'TOKEN_EXPIRED'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.',
        error: 'INVALID_TOKEN'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '토큰 검증 중 오류가 발생했습니다.',
        error: 'TOKEN_VERIFICATION_ERROR'
      });
    }
  }
};

// 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    // 토큰이 유효하지 않아도 계속 진행
    console.warn('선택적 인증에서 토큰 검증 실패:', error);
  }

  next();
};

// 역할 기반 접근 제어 미들웨어
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
        error: 'AUTHENTICATION_REQUIRED'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: '접근 권한이 없습니다.',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  };
};

// 관리자 권한 확인 미들웨어
export const requireAdmin = requireRole('admin');

// 의사 권한 확인 미들웨어
export const requireDoctor = requireRole('doctor', 'admin');

// 환자 권한 확인 미들웨어
export const requirePatient = requireRole('patient', 'doctor', 'admin');

// 본인 또는 관리자만 접근 가능한 미들웨어
export const requireOwnerOrAdmin = (userIdParam: string = 'id') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
        error: 'AUTHENTICATION_REQUIRED'
      });
      return;
    }

    const targetUserId = req.params[userIdParam];
    const isOwner = req.user.userId === targetUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: '본인의 정보이거나 관리자 권한이 필요합니다.',
        error: 'ACCESS_DENIED'
      });
      return;
    }

    next();
  };
};

// 토큰 생성 유틸리티
export const generateTokens = (payload: Omit<JWTPayload, 'iat' | 'exp'>) => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error('JWT secrets are not configured');
  }

  const accessToken = (jwt.sign as any)(payload, jwtSecret, { expiresIn: jwtExpiresIn });
  const refreshToken = (jwt.sign as any)(payload, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });

  return { accessToken, refreshToken };
};

// 리프레시 토큰 검증
export const verifyRefreshToken = (token: string): JWTPayload => {
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (!jwtRefreshSecret) {
    throw new Error('JWT_REFRESH_SECRET이 설정되지 않았습니다.');
  }

  return jwt.verify(token, jwtRefreshSecret) as JWTPayload;
};

// 토큰에서 사용자 정보 추출 (검증 없이)
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};

// 토큰 만료 시간 확인
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// API 키 검증 미들웨어 (외부 서비스용)
export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    res.status(500).json({
      success: false,
      message: 'API 키가 설정되지 않았습니다.',
      error: 'API_KEY_NOT_CONFIGURED'
    });
    return;
  }

  if (!apiKey || apiKey !== validApiKey) {
    res.status(401).json({
      success: false,
      message: '유효하지 않은 API 키입니다.',
      error: 'INVALID_API_KEY'
    });
    return;
  }

  next();
};

// 요청 제한 미들웨어 (간단한 구현)
export const rateLimitByUser = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const userId = req.user?.userId || req.ip || 'anonymous';
    const now = Date.now();
    const userRequests = requests.get(userId);

    if (!userRequests || now > userRequests.resetTime) {
      requests.set(userId, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (userRequests.count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
        error: 'RATE_LIMIT_EXCEEDED'
      });
      return;
    }

    userRequests.count++;
    next();
  };
};
