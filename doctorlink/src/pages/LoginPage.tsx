import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, kakaoLogin } = useAuth();
  
  // 리디렉션 URL 가져오기 (예약 중에 로그인 페이지로 온 경우)
  const from = location.state?.from?.pathname || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // AuthContext의 login 함수 사용
      const success = await login(email, password);
      
      if (success) {
        // 로그인 성공 시 원래 가려던 페이지로 리디렉션
        navigate(from, { replace: true });
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };
  
  // 카카오 로그인 핸들러 추가
  const handleKakaoLogin = async () => {
    console.log('=== 카카오 로그인 버튼 클릭 ===');
    console.log('Window.Kakao 존재:', !!window.Kakao);
    console.log('카카오 SDK 초기화 상태:', window.Kakao ? window.Kakao.isInitialized() : 'SDK 없음');
    
    setKakaoLoading(true);
    setError('');
    
    try {
      const success = await kakaoLogin();
      
      if (success) {
        // 로그인 성공 시 원래 가려던 페이지로 리디렉션
        navigate(from, { replace: true });
      } else {
        setError('카카오 로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('카카오 로그인 오류:', err);
      setError(`카카오 로그인 중 오류가 발생했습니다: ${err}`);
    } finally {
      setKakaoLoading(false);
    }
  };
  
  // 카카오 SDK 수동 재로드 함수
  const reloadKakaoSDK = () => {
    console.log('🔄 카카오 SDK 수동 재로드...');
    
    // 페이지 새로고침으로 간단하게 처리
    window.location.reload();
  };
  
  return (
    <PageContainer>
      <Header />
      <MainContent>
        <LoginContainer
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LoginHeader>
            <Logo>DoctorLink</Logo>
            <LoginTitle>로그인</LoginTitle>
            <LoginSubtitle>계정에 로그인하여 서비스를 이용하세요.</LoginSubtitle>
          </LoginHeader>
          
          <LoginForm onSubmit={handleSubmit}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <FormGroup>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소를 입력하세요"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </FormGroup>
            
            <RememberForgotContainer>
              <RememberMeContainer>
                <Checkbox
                  id="remember-me"
                  type="checkbox"
                />
                <CheckboxLabel htmlFor="remember-me">로그인 상태 유지</CheckboxLabel>
              </RememberMeContainer>
              
              <ForgotPasswordLink as={Link} to="/forgot-password">
                비밀번호를 잊으셨나요?
              </ForgotPasswordLink>
            </RememberForgotContainer>
            
            <LoginButton type="submit" disabled={loading || kakaoLoading}>
              {loading ? '로그인 중...' : '로그인'}
            </LoginButton>
          </LoginForm>
          
          <SocialLoginContainer>
            <SocialDivider>
              <SocialDividerLine />
              <SocialDividerText>또는</SocialDividerText>
              <SocialDividerLine />
            </SocialDivider>
            
            <KakaoLoginButton 
              onClick={handleKakaoLogin}
              disabled={loading || kakaoLoading}
            >
              {kakaoLoading ? (
                <ButtonSpinner />
              ) : (
                <KakaoIcon>💬</KakaoIcon>
              )}
              {kakaoLoading ? '카카오 로그인 중...' : '카카오로 로그인'}
            </KakaoLoginButton>
            
            <ReloadButton onClick={reloadKakaoSDK}>
              🔄 카카오 SDK 재로드
            </ReloadButton>
            
            <SocialLoginButton disabled>
              <i className="fab fa-google"></i> Google로 로그인 (준비중)
            </SocialLoginButton>
            <SocialLoginButton disabled>
              <i className="fab fa-facebook-f"></i> Facebook으로 로그인 (준비중)
            </SocialLoginButton>
          </SocialLoginContainer>
          
          <SignupContainer>
            <SignupText>계정이 없으신가요?</SignupText>
            <SignupLink as={Link} to="/signup">회원가입</SignupLink>
          </SignupContainer>
        </LoginContainer>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

// 스타일 컴포넌트
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-lg);
  background-color: var(--background-light);
`;

const LoginContainer = styled.div`
  width: 100%;
  max-width: 450px;
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: var(--spacing-xl);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: var(--spacing-lg);
  }
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-lg);
`;

const Logo = styled.h1`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
`;

const LoginTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-xs);
`;

const LoginSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.gray[600]};
`;

const LoginForm = styled.form`
  margin-bottom: var(--spacing-lg);
`;

const FormGroup = styled.div`
  margin-bottom: var(--spacing-md);
`;

const Label = styled.label`
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: var(--text-color);
`;

const Input = styled.input`
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(242, 151, 179, 0.2);
  }
`;

const RememberForgotContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
`;

const RememberMeContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Checkbox = styled.input`
  margin-right: var(--spacing-xs);
`;

const CheckboxLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[700]};
`;

const ForgotPasswordLink = styled.a`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: var(--primary-color);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: var(--spacing-sm);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover:not(:disabled) {
    background-color: #e3819d;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SocialLoginContainer = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const SocialDivider = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
`;

const SocialDividerLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: ${props => props.theme.colors.gray[300]};
`;

const SocialDividerText = styled.span`
  padding: 0 var(--spacing-sm);
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
`;

const SocialLoginButton = styled.button`
  width: 100%;
  padding: var(--spacing-sm);
  background-color: white;
  color: ${props => props.theme.colors.gray[800]};
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  
  i {
    margin-right: var(--spacing-sm);
  }
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
  }
`;

const SignupContainer = styled.div`
  text-align: center;
`;

const SignupText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
  margin-right: var(--spacing-xs);
`;

const SignupLink = styled.a`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: var(--primary-color);
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid var(--error-color);
  border-radius: ${props => props.theme.borderRadius.md};
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

// 카카오 로그인 버튼 추가
const KakaoLoginButton = styled.button`
  width: 100%;
  padding: var(--spacing-sm);
  background-color: #FEE500;
  color: #3A1D1D;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background-color: #FDD835;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const KakaoIcon = styled.span`
  margin-right: var(--spacing-sm);
  font-size: 18px;
`;

const ButtonSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid #3A1D1D;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: var(--spacing-sm);
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ReloadButton = styled.button`
  width: 100%;
  padding: var(--spacing-sm);
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #e9ecef;
  }
`;

export default LoginPage; 