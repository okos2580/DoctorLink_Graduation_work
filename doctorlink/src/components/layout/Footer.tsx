import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterTop>
          <FooterLogo>
            <LogoText>DoctorLink</LogoText>
            <LogoTagline>더 쉽고 빠른 병원 예약 서비스</LogoTagline>
          </FooterLogo>
          
          <FooterLinks>
            <FooterLinkColumn>
              <FooterLinkHeader>서비스</FooterLinkHeader>
              <FooterLink as={Link} to="/about">서비스 소개</FooterLink>
              <FooterLink as={Link} to="/features">주요 기능</FooterLink>
              <FooterLink as={Link} to="/pricing">요금제</FooterLink>
            </FooterLinkColumn>
            
            <FooterLinkColumn>
              <FooterLinkHeader>고객지원</FooterLinkHeader>
              <FooterLink as={Link} to="/faq">자주 묻는 질문</FooterLink>
              <FooterLink as={Link} to="/support">문의하기</FooterLink>
              <FooterLink as={Link} to="/feedback">피드백</FooterLink>
            </FooterLinkColumn>
            
            <FooterLinkColumn>
              <FooterLinkHeader>회사정보</FooterLinkHeader>
              <FooterLink as={Link} to="/about-us">회사 소개</FooterLink>
              <FooterLink as={Link} to="/careers">채용</FooterLink>
              <FooterLink as={Link} to="/press">보도자료</FooterLink>
            </FooterLinkColumn>
            
            <FooterLinkColumn>
              <FooterLinkHeader>법적 정보</FooterLinkHeader>
              <FooterLink as={Link} to="/terms">이용약관</FooterLink>
              <FooterLink as={Link} to="/privacy">개인정보처리방침</FooterLink>
            </FooterLinkColumn>
          </FooterLinks>
        </FooterTop>
        
        <FooterDivider />
        
        <FooterBottom>
          <Copyright>© {currentYear} DoctorLink. All rights reserved.</Copyright>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <AdminLink as={Link} to="/admin/login">
              🔐 관리자
            </AdminLink>
            <SocialLinks>
              <SocialLink href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </SocialLink>
              <SocialLink href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </SocialLink>
              <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </SocialLink>
              <SocialLink href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </SocialLink>
            </SocialLinks>
          </div>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  background-color: ${props => props.theme.colors.gray[800]};
  color: white;
  padding: var(--spacing-xl) 0;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: 0 var(--spacing-md);
  }
`;

const FooterTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--spacing-xl);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
`;

const FooterLogo = styled.div`
  flex: 1;
  min-width: 250px;
`;

const LogoText = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: white;
  margin-bottom: var(--spacing-xs);
`;

const LogoTagline = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.gray[400]};
  margin-bottom: var(--spacing-md);
`;

const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 2;
  gap: var(--spacing-xl);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
`;

const FooterLinkColumn = styled.div`
  min-width: 120px;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    min-width: 150px;
  }
`;

const FooterLinkHeader = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: white;
  margin-bottom: var(--spacing-md);
`;

const FooterLink = styled.a`
  display: block;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[400]};
  margin-bottom: var(--spacing-sm);
  text-decoration: none;
  transition: color ${props => props.theme.transition.fast};
  
  &:hover {
    color: var(--primary-color);
  }
`;

const FooterDivider = styled.hr`
  border: none;
  height: 1px;
  background-color: ${props => props.theme.colors.gray[700]};
  margin: var(--spacing-lg) 0;
`;

const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }
`;

const Copyright = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[500]};
`;

const SocialLinks = styled.div`
  display: flex;
  gap: var(--spacing-md);
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.gray[700]};
  color: white;
  font-size: ${props => props.theme.typography.fontSize.md};
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: var(--primary-color);
    transform: translateY(-2px);
  }
`;

const AdminLink = styled.a`
  display: block;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[400]};
  margin-bottom: var(--spacing-sm);
  text-decoration: none;
  transition: color ${props => props.theme.transition.fast};
  
  &:hover {
    color: var(--primary-color);
  }
`;

export default Footer; 