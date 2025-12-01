import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'patient' | 'doctor' | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    birthday: '',
    gender: '',
    agree1: false,
    agree2: false,
    agreeAll: false,
    specialty: '', // 의사일 경우
    licenseNumber: '', // 의사일 경우
    hospitalName: '', // 의사일 경우
    hospitalAddress: '', // 의사일 경우
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 폼 데이터 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      if (name === 'agreeAll') {
        setFormData({
          ...formData,
          agreeAll: checked,
          agree1: checked,
          agree2: checked,
        });
      } else {
        setFormData({
          ...formData,
          [name]: checked,
          agreeAll: (name === 'agree1' && checked && formData.agree2) || 
                   (name === 'agree2' && checked && formData.agree1),
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // 에러 상태 초기화
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  // 다음 단계로 이동
  const handleNextStep = () => {
    if (step === 1) {
      // 사용자 유형이 선택되었는지 확인
      if (!userType) {
        setErrors({ ...errors, userType: '회원 유형을 선택해주세요.' });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // 기본 정보 유효성 검사
      const newErrors: Record<string, string> = {};
      
      if (!formData.email) {
        newErrors.email = '이메일을 입력해주세요.';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = '유효한 이메일 주소를 입력해주세요.';
      }
      
      if (!formData.password) {
        newErrors.password = '비밀번호를 입력해주세요.';
      } else if (formData.password.length < 8) {
        newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      setStep(3);
    } else if (step === 3) {
      // 추가 정보 유효성 검사
      const newErrors: Record<string, string> = {};
      
      if (!formData.name) {
        newErrors.name = '이름을 입력해주세요.';
      }
      
      if (!formData.phone) {
        newErrors.phone = '전화번호를 입력해주세요.';
      }
      
      if (!formData.birthday) {
        newErrors.birthday = '생년월일을 입력해주세요.';
      }
      
      if (!formData.gender) {
        newErrors.gender = '성별을 선택해주세요.';
      }
      
      // 의사일 경우 추가 검증
      if (userType === 'doctor') {
        if (!formData.specialty) {
          newErrors.specialty = '전문 분야를 입력해주세요.';
        }
        
        if (!formData.licenseNumber) {
          newErrors.licenseNumber = '의사 면허 번호를 입력해주세요.';
        }
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      setStep(4);
    }
  };
  
  // 이전 단계로 이동
  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // 회원가입 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 약관 동의 검사
    if (!formData.agree1 || !formData.agree2) {
      setErrors({
        ...errors,
        agree: '모든 필수 약관에 동의해야 합니다.',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // AuthContext의 register 함수 호출
      const success = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: userType || 'patient'
      });
      
      if (success) {
        // 가입 성공 시 홈페이지로 리디렉션
        navigate('/');
      } else {
        // 가입 실패 시 에러 표시
        setErrors({
          ...errors,
          email: '이미 사용 중인 이메일입니다.'
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      setErrors({
        ...errors,
        submit: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.'
      });
      setIsSubmitting(false);
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <UserTypeSelection>
            <StepTitle>회원 유형 선택</StepTitle>
            <UserTypeContainer>
              <UserTypeCard 
                selected={userType === 'patient'}
                onClick={() => setUserType('patient')}
              >
                <UserTypeIcon>
                  <i className="fas fa-user"></i>
                </UserTypeIcon>
                <UserTypeLabel>환자로 가입</UserTypeLabel>
                <UserTypeDescription>
                  진료 예약 및 기록을 관리하고, 편리한 의료 서비스를 이용하세요.
                </UserTypeDescription>
              </UserTypeCard>
              
              <UserTypeCard 
                selected={userType === 'doctor'}
                onClick={() => setUserType('doctor')}
              >
                <UserTypeIcon>
                  <i className="fas fa-user-md"></i>
                </UserTypeIcon>
                <UserTypeLabel>의사로 가입</UserTypeLabel>
                <UserTypeDescription>
                  효율적인 환자 관리 및 예약 시스템을 활용하여 진료를 진행하세요.
                </UserTypeDescription>
              </UserTypeCard>
            </UserTypeContainer>
            {errors.userType && <ErrorMessage>{errors.userType}</ErrorMessage>}
          </UserTypeSelection>
        );
        
      case 2:
        return (
          <AccountInfoForm>
            <StepTitle>계정 정보 입력</StepTitle>
            <FormGroup>
              <Label htmlFor="email">이메일</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="이메일 주소를 입력하세요"
                isError={!!errors.email}
              />
              {errors.email && <ErrorText>{errors.email}</ErrorText>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="8자 이상의 비밀번호를 입력하세요"
                isError={!!errors.password}
              />
              {errors.password && <ErrorText>{errors.password}</ErrorText>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                isError={!!errors.confirmPassword}
              />
              {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
            </FormGroup>
          </AccountInfoForm>
        );
        
      case 3:
        return (
          <ProfileInfoForm>
            <StepTitle>{userType === 'patient' ? '기본 정보 입력' : '의사 정보 입력'}</StepTitle>
            <FormGroup>
              <Label htmlFor="name">이름</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름을 입력하세요"
                isError={!!errors.name}
              />
              {errors.name && <ErrorText>{errors.name}</ErrorText>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="phone">전화번호</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="전화번호를 입력하세요"
                isError={!!errors.phone}
              />
              {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="birthday">생년월일</Label>
              <Input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                isError={!!errors.birthday}
              />
              {errors.birthday && <ErrorText>{errors.birthday}</ErrorText>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="gender">성별</Label>
              <Select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                isError={!!errors.gender}
              >
                <option value="">선택하세요</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">기타</option>
              </Select>
              {errors.gender && <ErrorText>{errors.gender}</ErrorText>}
            </FormGroup>
            
            {userType === 'doctor' && (
              <>
                <FormGroup>
                  <Label htmlFor="specialty">전문 분야</Label>
                  <Input
                    type="text"
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    placeholder="전문 분야를 입력하세요"
                    isError={!!errors.specialty}
                  />
                  {errors.specialty && <ErrorText>{errors.specialty}</ErrorText>}
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="licenseNumber">의사 면허 번호</Label>
                  <Input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="의사 면허 번호를 입력하세요"
                    isError={!!errors.licenseNumber}
                  />
                  {errors.licenseNumber && <ErrorText>{errors.licenseNumber}</ErrorText>}
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="hospitalName">병원 이름</Label>
                  <Input
                    type="text"
                    id="hospitalName"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    placeholder="병원 이름을 입력하세요"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="hospitalAddress">병원 주소</Label>
                  <Input
                    type="text"
                    id="hospitalAddress"
                    name="hospitalAddress"
                    value={formData.hospitalAddress}
                    onChange={handleChange}
                    placeholder="병원 주소를 입력하세요"
                  />
                </FormGroup>
              </>
            )}
          </ProfileInfoForm>
        );
        
      case 4:
        return (
          <TermsAgreementForm>
            <StepTitle>약관 동의</StepTitle>
            <AgreementGroup>
              <CheckboxContainer>
                <Checkbox
                  type="checkbox"
                  id="agreeAll"
                  name="agreeAll"
                  checked={formData.agreeAll}
                  onChange={handleChange}
                />
                <CheckboxLabel htmlFor="agreeAll" bold>
                  모든 약관에 동의합니다
                </CheckboxLabel>
              </CheckboxContainer>
              
              <AgreementDivider />
              
              <CheckboxContainer>
                <Checkbox
                  type="checkbox"
                  id="agree1"
                  name="agree1"
                  checked={formData.agree1}
                  onChange={handleChange}
                />
                <CheckboxLabel htmlFor="agree1">
                  [필수] 서비스 이용약관에 동의합니다
                </CheckboxLabel>
                <TermsLink onClick={() => window.alert('서비스 이용약관')}>
                  보기
                </TermsLink>
              </CheckboxContainer>
              
              <CheckboxContainer>
                <Checkbox
                  type="checkbox"
                  id="agree2"
                  name="agree2"
                  checked={formData.agree2}
                  onChange={handleChange}
                />
                <CheckboxLabel htmlFor="agree2">
                  [필수] 개인정보 처리방침에 동의합니다
                </CheckboxLabel>
                <TermsLink onClick={() => window.alert('개인정보 처리방침')}>
                  보기
                </TermsLink>
              </CheckboxContainer>
            </AgreementGroup>
            
            {errors.agree && <ErrorMessage>{errors.agree}</ErrorMessage>}
          </TermsAgreementForm>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <PageContainer>
      <Header />
      <MainContent>
        <SignupContainer
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SignupHeader>
            <Logo>DoctorLink</Logo>
            <SignupTitle>회원가입</SignupTitle>
          </SignupHeader>
          
          <ProgressContainer>
            <ProgressBar>
              <ProgressIndicator progress={step / 4} />
            </ProgressBar>
            <StepLabels>
              <StepLabel active={step >= 1}>유형 선택</StepLabel>
              <StepLabel active={step >= 2}>계정 정보</StepLabel>
              <StepLabel active={step >= 3}>개인 정보</StepLabel>
              <StepLabel active={step >= 4}>약관 동의</StepLabel>
            </StepLabels>
          </ProgressContainer>
          
          <FormContainer>
            <form onSubmit={handleSubmit}>
              {renderStepContent()}
              
              <ButtonGroup>
                {step > 1 && (
                  <BackButton type="button" onClick={handlePreviousStep}>
                    이전
                  </BackButton>
                )}
                
                {step < 4 ? (
                  <NextButton type="button" onClick={handleNextStep}>
                    다음
                  </NextButton>
                ) : (
                  <SubmitButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '처리 중...' : '가입 완료'}
                  </SubmitButton>
                )}
              </ButtonGroup>
            </form>
          </FormContainer>
          
          <LoginLinkContainer>
            <LoginText>이미 계정이 있으신가요?</LoginText>
            <LoginLink as={Link} to="/login">로그인</LoginLink>
          </LoginLinkContainer>
        </SignupContainer>
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

const SignupContainer = styled.div`
  width: 100%;
  max-width: 600px;
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: var(--spacing-xl);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: var(--spacing-lg);
  }
`;

const SignupHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-lg);
`;

const Logo = styled.h1`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
`;

const SignupTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
`;

const ProgressContainer = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.full};
  margin-bottom: var(--spacing-sm);
`;

interface ProgressIndicatorProps {
  progress: number;
}

const ProgressIndicator = styled.div<ProgressIndicatorProps>`
  height: 100%;
  width: ${props => props.progress * 100}%;
  background-color: var(--primary-color);
  border-radius: ${props => props.theme.borderRadius.full};
  transition: width 0.3s ease;
`;

const StepLabels = styled.div`
  display: flex;
  justify-content: space-between;
`;

interface StepLabelProps {
  active: boolean;
}

const StepLabel = styled.div<StepLabelProps>`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.active ? 'var(--primary-color)' : props.theme.colors.gray[500]};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.bold : props.theme.typography.fontWeight.regular};
  transition: all 0.3s ease;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: ${props => props.theme.typography.fontSize.xs};
  }
`;

const FormContainer = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const StepTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-lg);
  text-align: center;
`;

const UserTypeSelection = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const UserTypeContainer = styled.div`
  display: flex;
  gap: var(--spacing-md);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

interface UserTypeCardProps {
  selected: boolean;
}

const UserTypeCard = styled.div<UserTypeCardProps>`
  flex: 1;
  padding: var(--spacing-lg);
  border: 2px solid ${props => props.selected ? 'var(--primary-color)' : props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.selected ? 'rgba(242, 151, 179, 0.05)' : 'white'};
  text-align: center;
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
  }
`;

const UserTypeIcon = styled.div`
  font-size: 36px;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
`;

const UserTypeLabel = styled.h4`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
`;

const UserTypeDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
  line-height: 1.5;
`;

const AccountInfoForm = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const ProfileInfoForm = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const TermsAgreementForm = styled.div`
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

interface InputProps {
  isError?: boolean;
}

const Input = styled.input<InputProps>`
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid ${props => props.isError ? 'var(--error-color)' : props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  
  &:focus {
    outline: none;
    border-color: ${props => props.isError ? 'var(--error-color)' : 'var(--primary-color)'};
    box-shadow: 0 0 0 2px ${props => props.isError ? 'rgba(231, 76, 60, 0.2)' : 'rgba(242, 151, 179, 0.2)'};
  }
`;

const Select = styled.select<InputProps>`
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid ${props => props.isError ? 'var(--error-color)' : props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.isError ? 'var(--error-color)' : 'var(--primary-color)'};
    box-shadow: 0 0 0 2px ${props => props.isError ? 'rgba(231, 76, 60, 0.2)' : 'rgba(242, 151, 179, 0.2)'};
  }
`;

const ErrorText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: var(--error-color);
  margin-top: var(--spacing-xs);
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid var(--error-color);
  border-radius: ${props => props.theme.borderRadius.md};
  padding: var(--spacing-sm);
  margin-top: var(--spacing-md);
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const AgreementGroup = styled.div`
  margin-bottom: var(--spacing-md);
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
`;

const Checkbox = styled.input`
  margin-right: var(--spacing-xs);
`;

interface CheckboxLabelProps {
  bold?: boolean;
}

const CheckboxLabel = styled.label<CheckboxLabelProps>`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: var(--text-color);
  font-weight: ${props => props.bold ? props.theme.typography.fontWeight.bold : props.theme.typography.fontWeight.regular};
  flex-grow: 1;
`;

const AgreementDivider = styled.hr`
  border: none;
  height: 1px;
  background-color: ${props => props.theme.colors.gray[200]};
  margin: var(--spacing-sm) 0;
`;

const TermsLink = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: var(--primary-color);
  text-decoration: underline;
  cursor: pointer;
  margin-left: var(--spacing-xs);
  
  &:hover {
    color: #e3819d;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
`;

const Button = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
`;

const BackButton = styled(Button)`
  flex: 1;
  background-color: white;
  color: var(--text-color);
  border: 1px solid ${props => props.theme.colors.gray[300]};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
  }
`;

const NextButton = styled(Button)`
  flex: 2;
  background-color: var(--primary-color);
  color: white;
  border: none;
  
  &:hover {
    background-color: #e3819d;
  }
`;

const SubmitButton = styled(Button)`
  flex: 2;
  background-color: var(--primary-color);
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #e3819d;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoginLinkContainer = styled.div`
  text-align: center;
`;

const LoginText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
  margin-right: var(--spacing-xs);
`;

const LoginLink = styled.a`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: var(--primary-color);
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default SignupPage; 