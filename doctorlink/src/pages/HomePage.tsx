import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const handleReservationClick = () => {
    console.log('예약 버튼 클릭됨');
    try {
      if (isAuthenticated) {
        console.log('인증됨, 예약 페이지로 이동');
        navigate('/reservation');
      } else {
        console.log('인증되지 않음, 로그인 페이지로 이동');
        navigate('/login', { state: { from: { pathname: '/reservation' } } });
      }
    } catch (error) {
      console.error('예약 이동 중 오류:', error);
    }
  };
  
  
  return (
    <PageContainer>
      <Header />
      <MainContent>
        <HeroSection
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <HeroContent>
            <HeroTitle>더 쉽고 빠른 병원 예약 서비스</HeroTitle>
            <HeroSubtitle>
              원하는 병원과 의사를 선택하고, 원하는 시간에 예약하세요.
              언제 어디서나 쉽게 진료 기록을 확인할 수 있습니다.
            </HeroSubtitle>
            <HeroButtons>
              <PrimaryButton onClick={handleReservationClick}>
                예약하기
              </PrimaryButton>
              {!isAuthenticated ? (
                <SecondaryButton as={Link} to="/login">
                  로그인
                </SecondaryButton>
              ) : (
                <SecondaryButton as={Link} to="/medical-records">
                  진료기록
                </SecondaryButton>
              )}
            </HeroButtons>
          </HeroContent>
          <HeroImageContainer>
            <HeroImage src="/images/doctor-hero.svg" alt="의사 일러스트" />
          </HeroImageContainer>
        </HeroSection>

        <FeaturesSection>
          <SectionTitle>주요 기능</SectionTitle>
          <FeaturesGrid>
            <FeatureCard
              as={motion.div}
              whileHover={{ y: -10, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.3 }}
            >
              <CardLink to={isAuthenticated ? "/reservation" : "/login"} state={!isAuthenticated ? { from: { pathname: '/reservation' } } : undefined}>
                <FeatureIcon>
                  <i className="fas fa-calendar-check"></i>
                </FeatureIcon>
                <FeatureTitle>간편한 예약</FeatureTitle>
                <FeatureDescription>
                  원하는 병원과 의사를 선택하고 손쉽게 예약할 수 있습니다.
                </FeatureDescription>
                {!isAuthenticated && (
                  <LoginRequiredBadge>로그인 필요</LoginRequiredBadge>
                )}
              </CardLink>
            </FeatureCard>

            <FeatureCard
              as={motion.div}
              whileHover={{ y: -10, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.3 }}
            >
              <CardLink to="/hospitals">
                <FeatureIcon>
                  <i className="fas fa-hospital"></i>
                </FeatureIcon>
                <FeatureTitle>주변 병원 찾기</FeatureTitle>
                <FeatureDescription>
                  내 주변의 병원을 쉽게 찾고 전문분야별로 필터링할 수 있습니다.
                </FeatureDescription>
              </CardLink>
            </FeatureCard>

            <FeatureCard
              as={motion.div}
              whileHover={{ y: -10, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.3 }}
            >
              <CardLink to={isAuthenticated ? "/medical-records" : "/login"} state={!isAuthenticated ? { from: { pathname: '/medical-records' } } : undefined}>
                <FeatureIcon>
                  <i className="fas fa-file-medical-alt"></i>
                </FeatureIcon>
                <FeatureTitle>진료 기록 조회</FeatureTitle>
                <FeatureDescription>
                  언제 어디서나 자신의 진료 기록을 확인할 수 있습니다.
                </FeatureDescription>
                {!isAuthenticated && (
                  <LoginRequiredBadge>로그인 필요</LoginRequiredBadge>
                )}
              </CardLink>
            </FeatureCard>

            <FeatureCard
              as={motion.div}
              whileHover={{ y: -10, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.3 }}
            >
              <CardLink to={isAuthenticated ? "/notifications" : "/login"} state={!isAuthenticated ? { from: { pathname: '/notifications' } } : undefined}>
                <FeatureIcon>
                  <i className="fas fa-bell"></i>
                </FeatureIcon>
                <FeatureTitle>알림 서비스</FeatureTitle>
                <FeatureDescription>
                  예약 확정, 변경, 취소 등 중요 알림을 받을 수 있습니다.
                </FeatureDescription>
                {!isAuthenticated && (
                  <LoginRequiredBadge>로그인 필요</LoginRequiredBadge>
                )}
              </CardLink>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesSection>

        <CTASection
          as={motion.div}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <CTAContent>
            {!isAuthenticated ? (
              <>
                <CTATitle>지금 바로 시작하세요</CTATitle>
                <CTADescription>
                  회원가입 후 더 많은 서비스를 이용할 수 있습니다.
                </CTADescription>
                <CTAButton as={Link} to="/signup">
                  회원가입
                </CTAButton>
              </>
            ) : (
              <>
                <CTATitle>{user?.name}님, 환영합니다!</CTATitle>
                <CTADescription>
                  지금 바로 원하는 서비스를 이용해보세요.
                </CTADescription>
                <CTAButton as={Link} to="/reservation">
                  예약하기
                </CTAButton>
              </>
            )}
          </CTAContent>
        </CTASection>
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
`;

const HeroSection = styled.section`
  display: flex;
  padding: var(--spacing-xl) var(--spacing-xl);
  margin: 0 auto;
  max-width: 1200px;
  background-color: white;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    padding: var(--spacing-lg) var(--spacing-lg);
  }
`;

const HeroContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: var(--spacing-xl);
  padding-left: 0.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding-right: 0;
    padding-left: 0.5rem;
    align-items: center;
    text-align: center;
    margin-bottom: var(--spacing-lg);
  }
`;

const HeroTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: ${props => props.theme.typography.fontSize['2xl']};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: ${props => props.theme.typography.fontSize.md};
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: var(--spacing-md);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    width: 100%;
  }
`;

const PrimaryButton = styled.button`
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #e3819d;
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.sm};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background-color: white;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  
  &:hover {
    background-color: rgba(242, 151, 179, 0.1);
  }
`;

const HeroImageContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeroImage = styled.img`
  max-width: 100%;
  max-height: 400px;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
`;

const FeaturesSection = styled.section`
  padding: var(--spacing-xl);
  background-color: var(--background-light);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: var(--spacing-lg) var(--spacing-md);
  }
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  text-align: center;
  margin-bottom: var(--spacing-xl);
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-lg);
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all ${props => props.theme.transition.fast};
  position: relative;
`;

const FeatureIcon = styled.div`
  font-size: 36px;
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
  
  i {
    display: inline-block;
  }
`;

const FeatureTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
`;

const FeatureDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.gray[600]};
  line-height: 1.6;
`;

const CTASection = styled.section`
  padding: var(--spacing-xl);
  background-color: var(--primary-color);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: var(--spacing-lg) var(--spacing-md);
  }
`;

const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const CTATitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: white;
  margin-bottom: var(--spacing-md);
`;

const CTADescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: var(--spacing-lg);
`;

const CTAButton = styled.button`
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: white;
  color: var(--primary-color);
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const LoginRequiredBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--primary-color);
  color: white;
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  padding: 4px 8px;
  border-radius: ${props => props.theme.borderRadius.full};
`;

const CardLink = styled(Link)`
  display: block;
  height: 100%;
  width: 100%;
  padding: var(--spacing-md);
  color: inherit;
  text-decoration: none;
  
  &:hover {
    text-decoration: none;
    color: inherit;
  }
`;

export default HomePage; 