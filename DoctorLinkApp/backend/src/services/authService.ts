import { UserModel } from '../models/User';
import { generateTokens, verifyRefreshToken } from '../middleware/auth';
import { 
  LoginRequest, 
  RegisterRequest, 
  KakaoLoginRequest, 
  AuthTokens, 
  ServiceResponse, 
  User 
} from '../types';

export class AuthService {
  // 로그인
  static async login(credentials: LoginRequest): Promise<ServiceResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      const { email, password } = credentials;

      // 사용자 찾기
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return {
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
          error: 'INVALID_CREDENTIALS'
        };
      }

      // 계정 상태 확인
      if (user.status !== 'active') {
        return {
          success: false,
          message: '비활성화된 계정입니다. 관리자에게 문의하세요.',
          error: 'ACCOUNT_INACTIVE'
        };
      }

      // 비밀번호 검증
      const isPasswordValid = await UserModel.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
          error: 'INVALID_CREDENTIALS'
        };
      }

      // 토큰 생성
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // 마지막 로그인 시간 업데이트
      await UserModel.updateLastLogin(user.id);

      // 비밀번호 제거
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: '로그인이 완료되었습니다.',
        data: {
          user: userWithoutPassword as User,
          tokens
        }
      };
    } catch (error) {
      console.error('로그인 오류:', error);
      return {
        success: false,
        message: '로그인 중 오류가 발생했습니다.',
        error: 'LOGIN_ERROR'
      };
    }
  }

  // 회원가입
  static async register(userData: RegisterRequest): Promise<ServiceResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      // 이메일 중복 확인
      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          message: '이미 사용 중인 이메일입니다.',
          error: 'EMAIL_ALREADY_EXISTS'
        };
      }

      // 전화번호 중복 확인
      const phoneExists = await UserModel.isPhoneExists(userData.phone);
      if (phoneExists) {
        return {
          success: false,
          message: '이미 사용 중인 전화번호입니다.',
          error: 'PHONE_ALREADY_EXISTS'
        };
      }

      // 사용자 생성
      const newUser = await UserModel.create({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
        birthDate: userData.birthDate,
        gender: userData.gender,
        address: userData.address,
        role: userData.role || 'patient',
        status: 'active'
      });

      // 토큰 생성
      const tokens = generateTokens({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      });

      // 비밀번호 제거
      const { password: _, ...userWithoutPassword } = newUser;

      return {
        success: true,
        message: '회원가입이 완료되었습니다.',
        data: {
          user: userWithoutPassword as User,
          tokens
        }
      };
    } catch (error) {
      console.error('회원가입 오류:', error);
      return {
        success: false,
        message: '회원가입 중 오류가 발생했습니다.',
        error: 'REGISTRATION_ERROR'
      };
    }
  }

  // 카카오 로그인
  static async kakaoLogin(kakaoData: KakaoLoginRequest): Promise<ServiceResponse<{ user: User; tokens: AuthTokens; isNewUser: boolean }>> {
    try {
      const { userInfo } = kakaoData;
      const email = userInfo.kakao_account.email;
      const nickname = userInfo.kakao_account.profile?.nickname;
      const profileImage = userInfo.kakao_account.profile?.profile_image_url;

      if (!email) {
        return {
          success: false,
          message: '카카오 계정에서 이메일 정보를 가져올 수 없습니다.',
          error: 'KAKAO_EMAIL_REQUIRED'
        };
      }

      // 기존 사용자 확인
      let user = await UserModel.findByEmail(email);
      let isNewUser = false;

      if (!user) {
        // 새 사용자 생성
        if (!nickname) {
          return {
            success: false,
            message: '카카오 계정에서 닉네임 정보를 가져올 수 없습니다.',
            error: 'KAKAO_NICKNAME_REQUIRED'
          };
        }

        user = await UserModel.create({
          email,
          password: `kakao_${userInfo.id}_${Date.now()}`, // 임시 비밀번호
          name: nickname,
          phone: '', // 추후 업데이트 필요
          birthDate: '1990-01-01', // 기본값, 추후 업데이트 필요
          gender: 'male', // 기본값, 추후 업데이트 필요
          role: 'patient',
          status: 'active',
          profileImage
        });
        isNewUser = true;
      } else {
        // 계정 상태 확인
        if (user.status !== 'active') {
          return {
            success: false,
            message: '비활성화된 계정입니다. 관리자에게 문의하세요.',
            error: 'ACCOUNT_INACTIVE'
          };
        }

        // 프로필 이미지 업데이트
        if (profileImage && user.profileImage !== profileImage) {
          user = await UserModel.update(user.id, { profileImage }) || user;
        }
      }

      // 토큰 생성
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // 마지막 로그인 시간 업데이트
      await UserModel.updateLastLogin(user.id);

      // 비밀번호 제거
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: isNewUser ? '카카오 회원가입이 완료되었습니다.' : '카카오 로그인이 완료되었습니다.',
        data: {
          user: userWithoutPassword as User,
          tokens,
          isNewUser
        }
      };
    } catch (error) {
      console.error('카카오 로그인 오류:', error);
      return {
        success: false,
        message: '카카오 로그인 중 오류가 발생했습니다.',
        error: 'KAKAO_LOGIN_ERROR'
      };
    }
  }

  // 토큰 갱신
  static async refreshToken(refreshToken: string): Promise<ServiceResponse<AuthTokens>> {
    try {
      // 리프레시 토큰 검증
      const decoded = verifyRefreshToken(refreshToken);

      // 사용자 존재 확인
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
          error: 'USER_NOT_FOUND'
        };
      }

      // 계정 상태 확인
      if (user.status !== 'active') {
        return {
          success: false,
          message: '비활성화된 계정입니다.',
          error: 'ACCOUNT_INACTIVE'
        };
      }

      // 새 토큰 생성
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        message: '토큰이 갱신되었습니다.',
        data: tokens
      };
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      return {
        success: false,
        message: '토큰 갱신 중 오류가 발생했습니다.',
        error: 'TOKEN_REFRESH_ERROR'
      };
    }
  }

  // 비밀번호 변경
  static async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<ServiceResponse<void>> {
    try {
      // 사용자 찾기
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
          error: 'USER_NOT_FOUND'
        };
      }

      // 현재 비밀번호 검증
      const isCurrentPasswordValid = await UserModel.verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: '현재 비밀번호가 올바르지 않습니다.',
          error: 'INVALID_CURRENT_PASSWORD'
        };
      }

      // 새 비밀번호로 업데이트
      await UserModel.updatePassword(userId, newPassword);

      return {
        success: true,
        message: '비밀번호가 변경되었습니다.'
      };
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      return {
        success: false,
        message: '비밀번호 변경 중 오류가 발생했습니다.',
        error: 'PASSWORD_CHANGE_ERROR'
      };
    }
  }

  // 사용자 프로필 조회
  static async getProfile(userId: string): Promise<ServiceResponse<User>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
          error: 'USER_NOT_FOUND'
        };
      }

      // 비밀번호 제거
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        data: userWithoutPassword as User
      };
    } catch (error) {
      console.error('프로필 조회 오류:', error);
      return {
        success: false,
        message: '프로필 조회 중 오류가 발생했습니다.',
        error: 'PROFILE_FETCH_ERROR'
      };
    }
  }

  // 사용자 프로필 업데이트
  static async updateProfile(userId: string, updateData: Partial<User>): Promise<ServiceResponse<User>> {
    try {
      // 이메일 변경 시 중복 확인
      if (updateData.email) {
        const emailExists = await UserModel.isEmailExists(updateData.email, userId);
        if (emailExists) {
          return {
            success: false,
            message: '이미 사용 중인 이메일입니다.',
            error: 'EMAIL_ALREADY_EXISTS'
          };
        }
      }

      // 전화번호 변경 시 중복 확인
      if (updateData.phone) {
        const phoneExists = await UserModel.isPhoneExists(updateData.phone, userId);
        if (phoneExists) {
          return {
            success: false,
            message: '이미 사용 중인 전화번호입니다.',
            error: 'PHONE_ALREADY_EXISTS'
          };
        }
      }

      // 프로필 업데이트
      const updatedUser = await UserModel.update(userId, updateData);
      if (!updatedUser) {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
          error: 'USER_NOT_FOUND'
        };
      }

      // 비밀번호 제거
      const { password: _, ...userWithoutPassword } = updatedUser;

      return {
        success: true,
        message: '프로필이 업데이트되었습니다.',
        data: userWithoutPassword as User
      };
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      return {
        success: false,
        message: '프로필 업데이트 중 오류가 발생했습니다.',
        error: 'PROFILE_UPDATE_ERROR'
      };
    }
  }

  // 계정 비활성화
  static async deactivateAccount(userId: string): Promise<ServiceResponse<void>> {
    try {
      const success = await UserModel.delete(userId);
      if (!success) {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
          error: 'USER_NOT_FOUND'
        };
      }

      return {
        success: true,
        message: '계정이 비활성화되었습니다.'
      };
    } catch (error) {
      console.error('계정 비활성화 오류:', error);
      return {
        success: false,
        message: '계정 비활성화 중 오류가 발생했습니다.',
        error: 'ACCOUNT_DEACTIVATION_ERROR'
      };
    }
  }
}



















