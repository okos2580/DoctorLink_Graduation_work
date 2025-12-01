import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { verifyAdmin, getDashboardStats, adminLogout, DashboardStats } from '../services/adminService';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalReservations: 0,
    pendingReservations: 0,
    todayReservations: 0,
    totalInquiries: 0,
    unreadInquiries: 0,
    totalHospitals: 0,
    activeHospitals: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const navigate = useNavigate();

  const checkAdminAuth = useCallback(async () => {
    try {
      const isValid = await verifyAdmin();
      if (!isValid) {
        navigate('/admin/login');
        return;
      }

      // 관리자 정보 가져오기
      const adminData = localStorage.getItem('adminInfo');
      if (adminData) {
        setAdminInfo(JSON.parse(adminData));
      }

      // 대시보드 통계 로드
      await loadDashboardStats();
    } catch (error) {
      console.error('관리자 인증 확인 중 오류:', error);
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const loadDashboardStats = async () => {
    try {
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('대시보드 통계 로드 중 오류:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate('/admin/login');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      // 에러가 발생해도 로그아웃 처리
      navigate('/admin/login');
    }
  };

  const menuItems = [
    {
      title: '예약 관리',
      description: '예약 현황 및 승인/거절 관리',
      icon: '📅',
      path: '/admin/reservations',
      count: stats.pendingReservations
    },
    {
      title: '병원 관리',
      description: '병원 정보 및 등록 관리',
      icon: '🏥',
      path: '/admin/hospitals',
      count: null
    },
    {
      title: '사용자 관리',
      description: '사용자 정보 및 계정 관리',
      icon: '👥',
      path: '/admin/users',
      count: stats.totalUsers
    },
    {
      title: '진료 기록',
      description: '진료 기록 등록 및 관리',
      icon: '📋',
      path: '/admin/medical-records',
      count: null
    },
    {
      title: '고객센터',
      description: '문의 답변 및 FAQ 관리',
      icon: '💬',
      path: '/admin/customer-service',
      count: stats.unreadInquiries
    },
    {
      title: '알림 관리',
      description: '사용자 알림 발송 및 관리',
      icon: '🔔',
      path: '/admin/notifications',
      count: null
    },
    {
      title: '통계 및 보고서',
      description: '시스템 통계 및 보고서 생성',
      icon: '📊',
      path: '/admin/stats',
      count: null
    },
    {
      title: '시스템 설정',
      description: '관리자 계정 및 시스템 설정',
      icon: '⚙️',
      path: '/admin/settings',
      count: null
    }
  ];

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>🏥 DoctorLink 관리자</Title>
          <Subtitle>시스템 관리 대시보드</Subtitle>
        </HeaderLeft>
        <HeaderRight>
          <AdminInfo>
            <AdminName>👨‍💼 {adminInfo.name}</AdminName>
            <LoginTime>
              로그인: {new Date(adminInfo.loginTime).toLocaleString()}
            </LoginTime>
          </AdminInfo>
          <LogoutButton onClick={handleLogout}>
            로그아웃
          </LogoutButton>
        </HeaderRight>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon>👥</StatIcon>
          <StatInfo>
            <StatNumber>{stats.totalUsers.toLocaleString()}</StatNumber>
            <StatLabel>총 회원 수</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon>📅</StatIcon>
          <StatInfo>
            <StatNumber>{stats.totalReservations.toLocaleString()}</StatNumber>
            <StatLabel>총 예약 수</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard urgent={stats.pendingReservations > 0}>
          <StatIcon>⏳</StatIcon>
          <StatInfo>
            <StatNumber>{stats.pendingReservations}</StatNumber>
            <StatLabel>대기 중인 예약</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon>📋</StatIcon>
          <StatInfo>
            <StatNumber>{stats.todayReservations}</StatNumber>
            <StatLabel>오늘 예약</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard urgent={stats.unreadInquiries > 0}>
          <StatIcon>💬</StatIcon>
          <StatInfo>
            <StatNumber>{stats.unreadInquiries}</StatNumber>
            <StatLabel>미답변 문의</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon>📊</StatIcon>
          <StatInfo>
            <StatNumber>{stats.totalInquiries}</StatNumber>
            <StatLabel>총 문의 수</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <MenuGrid>
        {menuItems.map((item, index) => (
          <MenuCard key={index} onClick={() => navigate(item.path)}>
            <MenuIcon>{item.icon}</MenuIcon>
            <MenuContent>
              <MenuTitle>{item.title}</MenuTitle>
              <MenuDescription>{item.description}</MenuDescription>
              {item.count !== null && (
                <MenuBadge urgent={item.count > 0}>
                  {item.count}
                </MenuBadge>
              )}
            </MenuContent>
          </MenuCard>
        ))}
      </MenuGrid>

      <QuickActions>
        <QuickActionTitle>빠른 작업</QuickActionTitle>
        <QuickActionGrid>
          <QuickActionButton onClick={() => navigate('/admin/reservations')}>
            📅 예약 승인 대기 ({stats.pendingReservations})
          </QuickActionButton>
          <QuickActionButton onClick={() => navigate('/admin/customer-service')}>
            💬 미답변 문의 ({stats.unreadInquiries})
          </QuickActionButton>
          <QuickActionButton onClick={() => navigate('/admin/notifications')}>
            🔔 알림 발송
          </QuickActionButton>
          <QuickActionButton onClick={() => navigate('/admin/stats')}>
            📊 오늘 통계 보기
          </QuickActionButton>
        </QuickActionGrid>
      </QuickActions>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const HeaderLeft = styled.div``;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 5px 0 0 0;
  font-size: 16px;
`;

const AdminInfo = styled.div`
  text-align: right;
`;

const AdminName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 16px;
`;

const LoginTime = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const LogoutButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #c82333;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div<{ urgent?: boolean }>`
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  border-left: 4px solid ${props => props.urgent ? '#dc3545' : '#007bff'};
`;

const StatIcon = styled.div`
  font-size: 24px;
`;

const StatInfo = styled.div``;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 2px;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MenuCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const MenuIcon = styled.div`
  font-size: 32px;
`;

const MenuContent = styled.div`
  flex: 1;
`;

const MenuTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
`;

const MenuDescription = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
`;

const MenuBadge = styled.div<{ urgent?: boolean }>`
  position: absolute;
  top: 15px;
  right: 15px;
  background: ${props => props.urgent ? '#dc3545' : '#007bff'};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const QuickActions = styled.div`
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const QuickActionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
`;

const QuickActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const QuickActionButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

export default AdminDashboardPage; 