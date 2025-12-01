import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface StyledLinkProps {
  $active?: boolean;
}

const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleMyPage = () => {
    navigate('/mypage');
  };
  
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo as={Link} to="/">
          <LogoText>Doctor Link</LogoText>
        </Logo>
        
        <CenterNavigation>
          <NavLink as={Link} to="/about" $active={pathname === '/about'}>서비스 소개</NavLink>
          <NavLink as={Link} to="/hospitals" $active={pathname === '/hospitals' || pathname === '/hospital-finder'}>병원 찾기</NavLink>
          <NavLink as={Link} to="/reservation" $active={pathname === '/reservation'}>예약하기</NavLink>
          <NavLink as={Link} to="/contact" $active={pathname === '/contact'}>고객센터</NavLink>
        </CenterNavigation>
        
        <RightSection>
          {!isAuthenticated ? (
            <>
              <SecondaryButton as={Link} to="/login">
                로그인
              </SecondaryButton>
              <PrimaryButton as={Link} to="/signup">
                회원가입
              </PrimaryButton>
            </>
          ) : (
            <>
              <UserGreeting>안녕하세요, {user?.name}님</UserGreeting>
              <MyPageButton onClick={handleMyPage}>
                마이페이지
              </MyPageButton>
              <LogoutButton onClick={handleLogout}>
                로그아웃
              </LogoutButton>
            </>
          )}
          <MobileMenuToggle onClick={toggleMobileMenu}>
            <i className={isMobileMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
          </MobileMenuToggle>
        </RightSection>
      </HeaderContent>
      
      {isMobileMenuOpen && (
        <MobileNavOverlay onClick={toggleMobileMenu} />
      )}
      
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileNav
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3 }}
          >
            <MobileNavList>
              <MobileNavItem>
                <MobileNavLink to="/about" onClick={toggleMobileMenu}>서비스 소개</MobileNavLink>
              </MobileNavItem>
              <MobileNavItem>
                <MobileNavLink to="/reservation" onClick={toggleMobileMenu}>예약하기</MobileNavLink>
              </MobileNavItem>
              <MobileNavItem>
                <MobileNavLink to="/medical-records" onClick={toggleMobileMenu}>진료기록</MobileNavLink>
              </MobileNavItem>
              <MobileNavItem>
                <MobileNavLink to="/hospital-finder" onClick={toggleMobileMenu}>병원찾기</MobileNavLink>
              </MobileNavItem>
              {isAuthenticated && (
                <>
                  <MobileNavItem>
                    <MobileNavLink to="/notifications" onClick={toggleMobileMenu}>알림</MobileNavLink>
                  </MobileNavItem>
                  <MobileNavItem>
                    <MobileNavLink to="/reservations" onClick={toggleMobileMenu}>예약관리</MobileNavLink>
                  </MobileNavItem>
                  <MobileNavItem>
                    <MobileNavLink to="/mypage" onClick={toggleMobileMenu}>마이페이지</MobileNavLink>
                  </MobileNavItem>
                </>
              )}
              <MobileNavItem>
                <MobileNavLink to="/contact" onClick={toggleMobileMenu}>고객센터</MobileNavLink>
              </MobileNavItem>
            </MobileNavList>
            <MobileAuthButtons>
              {isAuthenticated ? (
                <>
                  <UserGreetingMobile>안녕하세요, {user?.name}님</UserGreetingMobile>
                  <MobileLogoutButton onClick={handleLogout}>로그아웃</MobileLogoutButton>
                </>
              ) : (
                <>
                  <MobileLoginButton onClick={handleLogin}>로그인</MobileLoginButton>
                  <MobileSignupButton primary onClick={handleSignup}>회원가입</MobileSignupButton>
                </>
              )}
            </MobileAuthButtons>
          </MobileNav>
        )}
      </AnimatePresence>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  width: 100%;
  background-color: white;
  box-shadow: ${props => props.theme.shadows.sm};
  z-index: ${props => props.theme.zIndex.fixed};
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-lg);
  height: 70px;
  max-width: 1200px;
  
  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    padding: var(--spacing-md) var(--spacing-xl);
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const LogoText = styled.h1`
  font-size: 2rem;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--primary-color);
  margin: 0;
  letter-spacing: -0.5px;
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    font-size: 2.5rem;
  }
`;

const CenterNavigation = styled.nav`
  display: none;
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    display: flex;
    gap: var(--spacing-xl);
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const NavLink = styled.a<StyledLinkProps>`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.$active ? 'var(--primary-color)' : 'var(--text-color)'};
  text-decoration: none;
  transition: color ${props => props.theme.transition.fast};
  padding: var(--spacing-xs) 0;
  
  &:hover {
    color: var(--primary-color);
  }
`;

interface ButtonProps {
  primary?: boolean;
}

const PrimaryButton = styled.button<ButtonProps>`
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.primary ? 'white' : 'var(--text-color)'};
  border: 1px solid ${props => props.primary ? 'var(--primary-color)' : props.theme.colors.gray[300]};
  
  &:hover {
    background-color: ${props => props.primary ? '#e3819d' : props.theme.colors.gray[100]};
    transform: translateY(-2px);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: none;
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

const UserGreeting = styled.span`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.gray[700]};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-right: var(--spacing-sm);
  display: flex;
  align-items: center;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

const UserGreetingMobile = styled(UserGreeting)`
  text-align: center;
  margin-bottom: var(--spacing-sm);
  font-size: ${props => props.theme.typography.fontSize.md};
`;

const LogoutButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[600]};
  background-color: transparent;
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

const MobileMenuToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-color);
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    color: var(--primary-color);
  }
`;

const MobileNavOverlay = styled.div`
  position: fixed;
  top: 70px;
  left: 0;
  width: 100%;
  height: calc(100vh - 70px);
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${props => props.theme.zIndex.modal - 1};
`;

const MobileNav = styled(motion.nav)`
  display: block;
  background-color: white;
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
  position: fixed;
  width: 280px;
  height: calc(100vh - 70px);
  top: 70px;
  right: 0;
  z-index: ${props => props.theme.zIndex.modal};
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
`;

const MobileNavList = styled.ul`
  list-style: none;
  padding: var(--spacing-lg) var(--spacing-md);
  margin: 0;
`;

const MobileNavItem = styled.li`
  margin-bottom: var(--spacing-md);
`;

const MobileNavLink = styled(Link)`
  text-decoration: none;
  color: var(--text-color);
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  display: block;
  padding: var(--spacing-md);
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    color: var(--primary-color);
    background-color: ${props => props.theme.colors.gray[100]};
  }
`;

const MobileAuthButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md) var(--spacing-lg);
`;

const AuthButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  background-color: var(--primary-color);
  color: white;
  border: none;
  
  &:hover {
    background-color: #e3819d;
    transform: translateY(-2px);
  }
`;

const MobileLoginButton = styled(AuthButton)`
  width: 100%;
  padding: var(--spacing-sm);
`;

const MobileSignupButton = styled(MobileLoginButton)<ButtonProps>`
  ${props => props.primary ? '' : `
    background-color: white;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    
    &:hover {
      background-color: rgba(242, 151, 179, 0.1);
    }
  `}
`;

const MobileLogoutButton = styled(MobileLoginButton)`
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid ${props => props.theme.colors.gray[300]};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
  }
`;

const MyPageButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: var(--primary-color);
  background-color: white;
  border: 1px solid var(--primary-color);
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  margin-right: var(--spacing-sm);
  
  &:hover {
    background-color: rgba(242, 151, 179, 0.1);
    transform: translateY(-2px);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

export default Header;