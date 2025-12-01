import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { adminLogin, AdminLoginData } from '../services/adminService';

const AdminLoginPage: React.FC = () => {
  const [formData, setFormData] = useState<AdminLoginData>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // 이전에 접근하려던 페이지 경로
  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 입력 시 에러 메시지 초기화
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const adminInfo = await adminLogin(formData);
      
      // 로그인 성공 시 관리자 정보를 localStorage에 저장
      const adminInfoWithLoginTime = {
        ...adminInfo,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('adminInfo', JSON.stringify(adminInfoWithLoginTime));
      
      // 원래 접근하려던 페이지나 대시보드로 이동
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <LoginCard>
        <Header>
          <Title>🔐 관리자 로그인</Title>
          <Subtitle>DoctorLink 관리자 시스템</Subtitle>
          {from !== '/admin/dashboard' && (
            <AccessInfo>
              요청한 페이지에 접근하려면 관리자 로그인이 필요합니다.
            </AccessInfo>
          )}
        </Header>

        <LoginForm onSubmit={handleSubmit}>
          <InputGroup>
            <Label>관리자 ID</Label>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="관리자 ID를 입력하세요"
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>비밀번호</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </LoginButton>
        </LoginForm>

        <Footer>
          <TestInfo>
            <strong>테스트 계정:</strong><br />
            ID: admin / PW: admin123
          </TestInfo>
          <BackButton onClick={() => navigate('/')}>
            ← 메인으로 돌아가기
          </BackButton>
        </Footer>
      </LoginCard>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: #999;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c53030;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  margin-top: 30px;
  text-align: center;
`;

const TestInfo = styled.div`
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #666;
  margin-bottom: 15px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;

  &:hover {
    color: #764ba2;
  }
`;

const AccessInfo = styled.div`
  background: #e3f2fd;
  color: #1976d2;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
`;

export default AdminLoginPage; 