import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const AboutPage: React.FC = () => {
  return (
    <PageContainer>
      <Header />
      <MainContent>
        <Hero
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <HeroContent>
            <HeroTitle>DoctorLink 서비스 소개</HeroTitle>
            <HeroSubtitle>더 쉽고 빠른 병원 예약 서비스, 환자와 의사를 연결합니다</HeroSubtitle>
          </HeroContent>
        </Hero>

        <Section
          as={motion.section}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle>서비스 개요</SectionTitle>
          <SectionContent>
            <SectionText>
              DoctorLink는 환자와 의사를 효율적으로 연결하는 온라인 의료 예약 플랫폼입니다. 
              복잡한 병원 예약 과정을 간소화하고, 환자들이 원하는 시간에 원하는 의사에게 진료받을 수 있도록 돕습니다.
              의사와 병원은 효율적인 일정 관리와 환자 정보 관리를 통해 업무 효율성을 높일 수 있습니다.
            </SectionText>
          </SectionContent>
        </Section>

        <Section
          as={motion.section}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle>주요 기능</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>
                <i className="fas fa-calendar-check"></i>
              </FeatureIcon>
              <FeatureTitle>간편한 예약</FeatureTitle>
              <FeatureDescription>
                원하는 병원과 의사를 검색하고, 실시간으로 가능한 시간을 확인하여 손쉽게 예약할 수 있습니다.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <i className="fas fa-file-medical-alt"></i>
              </FeatureIcon>
              <FeatureTitle>진료 기록 관리</FeatureTitle>
              <FeatureDescription>
                자신의 모든 진료 기록을 한 곳에서 관리하고 확인할 수 있습니다. 더 이상 병원마다 기록을 따로 보관할 필요가 없습니다.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <i className="fas fa-bell"></i>
              </FeatureIcon>
              <FeatureTitle>알림 서비스</FeatureTitle>
              <FeatureDescription>
                예약 확정, 변경, 취소 등의 알림을 실시간으로 받아볼 수 있습니다. 중요한 진료 일정을 놓치지 않도록 도와드립니다.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <i className="fas fa-user-md"></i>
              </FeatureIcon>
              <FeatureTitle>의사 프로필</FeatureTitle>
              <FeatureDescription>
                각 의사의 전문 분야, 경력, 환자 리뷰 등을 확인하고 나에게 맞는 의사를 선택할 수 있습니다.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <i className="fas fa-hospital"></i>
              </FeatureIcon>
              <FeatureTitle>병원 관리 시스템</FeatureTitle>
              <FeatureDescription>
                병원과 의사는 예약 관리, 환자 기록 관리, 일정 관리 등을 효율적으로 수행할 수 있는 관리 시스템을 이용할 수 있습니다.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <i className="fas fa-comments"></i>
              </FeatureIcon>
              <FeatureTitle>메시지 기능</FeatureTitle>
              <FeatureDescription>
                환자와 의사 간의 간단한 메시지 교환을 통해 예약 전후로 필요한 정보를 주고받을 수 있습니다.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </Section>

        <Section
          as={motion.section}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle>우리의 가치</SectionTitle>
          <ValueContainer>
            <ValueCard>
              <ValueIcon>
                <i className="fas fa-user-shield"></i>
              </ValueIcon>
              <ValueTitle>환자 중심</ValueTitle>
              <ValueDescription>
                환자의 경험과 편의성을 최우선으로 생각합니다. 모든 기능과 인터페이스는 환자가 쉽게 이용할 수 있도록 설계되었습니다.
              </ValueDescription>
            </ValueCard>

            <ValueCard>
              <ValueIcon>
                <i className="fas fa-lock"></i>
              </ValueIcon>
              <ValueTitle>정보 보안</ValueTitle>
              <ValueDescription>
                환자와 의료진의 개인정보 및 의료 데이터를 철저히 보호합니다. 최신 보안 기술을 적용하여 안전한 서비스를 제공합니다.
              </ValueDescription>
            </ValueCard>

            <ValueCard>
              <ValueIcon>
                <i className="fas fa-handshake"></i>
              </ValueIcon>
              <ValueTitle>투명성</ValueTitle>
              <ValueDescription>
                모든 예약 과정과 비용이 투명하게 공개됩니다. 숨겨진 비용이나 복잡한 절차 없이 신뢰할 수 있는 서비스를 제공합니다.
              </ValueDescription>
            </ValueCard>
          </ValueContainer>
        </Section>

        <CTASection>
          <CTATitle>지금 바로 DoctorLink를 경험해보세요</CTATitle>
          <CTADescription>
            더 쉽고 빠른 병원 예약 서비스로 건강 관리를 시작하세요.
          </CTADescription>
          <CTAButton href="/signup">회원가입</CTAButton>
        </CTASection>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
`;

const Hero = styled.section`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  padding: var(--spacing-xxl) var(--spacing-md);
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: var(--spacing-md);

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: ${props => props.theme.typography.fontSize['3xl']};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  opacity: 0.9;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: ${props => props.theme.typography.fontSize.lg};
  }
`;

const Section = styled.section`
  padding: var(--spacing-xxl) var(--spacing-md);
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: var(--spacing-xl) var(--spacing-md);
  }
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: var(--spacing-xl);
  text-align: center;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: ${props => props.theme.typography.fontSize['2xl']};
    margin-bottom: var(--spacing-lg);
  }
`;

const SectionContent = styled.div`
  display: flex;
  gap: var(--spacing-xl);
  align-items: center;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
`;

const SectionText = styled.p`
  flex: 1;
  font-size: ${props => props.theme.typography.fontSize.lg};
  line-height: 1.6;
  color: ${props => props.theme.colors.gray[700]};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: ${props => props.theme.typography.fontSize.md};
  }
`;


const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);

  @media (max-width: ${props => props.theme.breakpoints.laptop}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: var(--spacing-lg);
  box-shadow: ${props => props.theme.shadows.md};
  transition: transform ${props => props.theme.transition.normal}, box-shadow ${props => props.theme.transition.normal};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: var(--spacing-md);
`;

const FeatureTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: var(--spacing-md);
  color: ${props => props.theme.colors.gray[900]};
`;

const FeatureDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  line-height: 1.5;
  color: ${props => props.theme.colors.gray[600]};
`;

const ValueContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
`;

const ValueCard = styled.div`
  text-align: center;
  padding: var(--spacing-lg);
`;

const ValueIcon = styled.div`
  font-size: 3rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: var(--spacing-md);
`;

const ValueTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: var(--spacing-md);
  color: ${props => props.theme.colors.gray[900]};
`;

const ValueDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  line-height: 1.5;
  color: ${props => props.theme.colors.gray[600]};
`;

const CTASection = styled.section`
  background-color: ${props => props.theme.colors.gray[100]};
  padding: var(--spacing-xxl) var(--spacing-md);
  text-align: center;
  margin-top: var(--spacing-xl);
`;

const CTATitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: var(--spacing-md);
`;

const CTADescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  line-height: 1.5;
  color: ${props => props.theme.colors.gray[700]};
  max-width: 600px;
  margin: 0 auto var(--spacing-lg);
`;

const CTAButton = styled.a`
  display: inline-block;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: ${props => props.theme.colors.primary};
  color: white;
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border-radius: ${props => props.theme.borderRadius.md};
  text-decoration: none;
  transition: background-color ${props => props.theme.transition.fast},
    transform ${props => props.theme.transition.fast};

  &:hover {
    background-color: #e3819d;
    transform: translateY(-2px);
  }
`;


export default AboutPage; 