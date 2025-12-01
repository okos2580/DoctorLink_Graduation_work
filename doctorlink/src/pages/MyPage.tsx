import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

const MyPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [editMessage, setEditMessage] = useState('');

  // 로그인되지 않은 경우 로그인 페이지로 리디렉션
  React.useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/mypage' } } });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsEditing(false);
    setEditMessage('');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setFormData({
      ...formData,
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setEditMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제 구현에서는 API 호출로 프로필 업데이트
    
    // 일단 성공 메시지 표시
    setEditMessage('프로필이 성공적으로 업데이트되었습니다.');
    setTimeout(() => {
      setIsEditing(false);
      setEditMessage('');
    }, 2000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 비밀번호 변경 로직 (실제로는 API 호출)
    if (formData.newPassword !== formData.confirmPassword) {
      setEditMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    // 일단 성공 메시지 표시
    setEditMessage('비밀번호가 성공적으로 변경되었습니다.');
    setTimeout(() => {
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setEditMessage('');
    }, 2000);
  };

  const renderProfile = () => {
    return (
      <ProfileSection>
        <ProfileHeader>
          <h2>내 프로필</h2>
          <EditButton onClick={handleEditToggle}>
            {isEditing ? '취소' : '수정'}
          </EditButton>
        </ProfileHeader>

        {editMessage && (
          <MessageBox success={!editMessage.includes('일치하지')}>
            {editMessage}
          </MessageBox>
        )}

        {isEditing ? (
          <form onSubmit={handleSaveProfile}>
            <FormGroup>
              <Label htmlFor="name">이름</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="phone">전화번호</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="email">이메일</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled
              />
              <HelpText>이메일은 변경할 수 없습니다.</HelpText>
            </FormGroup>
            <SaveButton type="submit">저장</SaveButton>
          </form>
        ) : (
          <ProfileInfo>
            <ProfileItem>
              <ProfileLabel>이름</ProfileLabel>
              <ProfileValue>{user?.name}</ProfileValue>
            </ProfileItem>
            <ProfileItem>
              <ProfileLabel>이메일</ProfileLabel>
              <ProfileValue>{user?.email}</ProfileValue>
            </ProfileItem>
            <ProfileItem>
              <ProfileLabel>전화번호</ProfileLabel>
              <ProfileValue>{user?.phone}</ProfileValue>
            </ProfileItem>
            <ProfileItem>
              <ProfileLabel>회원 유형</ProfileLabel>
              <ProfileValue>{user?.role === 'patient' ? '환자' : '의사'}</ProfileValue>
            </ProfileItem>
          </ProfileInfo>
        )}
      </ProfileSection>
    );
  };

  const renderSecurity = () => {
    return (
      <SecuritySection>
        <h2>보안 설정</h2>
        
        {editMessage && (
          <MessageBox success={!editMessage.includes('일치하지')}>
            {editMessage}
          </MessageBox>
        )}
        
        <PasswordForm onSubmit={handleChangePassword}>
          <h3>비밀번호 변경</h3>
          <FormGroup>
            <Label htmlFor="currentPassword">현재 비밀번호</Label>
            <Input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="newPassword">새 비밀번호</Label>
            <Input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              required
            />
            <HelpText>8자 이상의 비밀번호를 입력하세요.</HelpText>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <SaveButton type="submit">비밀번호 변경</SaveButton>
        </PasswordForm>
      </SecuritySection>
    );
  };

  const renderReservations = () => {
    // 간단한 예약 내역 샘플 데이터
    const reservations = [
      {
        id: 'res1',
        hospital: '서울 중앙 병원',
        doctor: '김태호 의사',
        date: '2023-06-15',
        time: '14:00',
        status: '예약 확정',
      },
      {
        id: 'res2',
        hospital: '연세 메디컬 센터',
        doctor: '이수진 의사',
        date: '2023-06-20',
        time: '10:30',
        status: '대기 중',
      },
    ];

    return (
      <ReservationsSection>
        <h2>예약 내역</h2>
        {reservations.length > 0 ? (
          <ReservationsList>
            {reservations.map((reservation) => (
              <ReservationItem key={reservation.id}>
                <ReservationHeader>
                  <ReservationHospital>{reservation.hospital}</ReservationHospital>
                  <ReservationStatus status={reservation.status}>
                    {reservation.status}
                  </ReservationStatus>
                </ReservationHeader>
                <ReservationDetails>
                  <ReservationDetail>
                    <ReservationLabel>담당 의사</ReservationLabel>
                    <ReservationValue>{reservation.doctor}</ReservationValue>
                  </ReservationDetail>
                  <ReservationDetail>
                    <ReservationLabel>날짜</ReservationLabel>
                    <ReservationValue>{reservation.date}</ReservationValue>
                  </ReservationDetail>
                  <ReservationDetail>
                    <ReservationLabel>시간</ReservationLabel>
                    <ReservationValue>{reservation.time}</ReservationValue>
                  </ReservationDetail>
                </ReservationDetails>
                <ReservationActions>
                  <ReservationButton primary={false}>취소</ReservationButton>
                  <ReservationButton primary>예약 변경</ReservationButton>
                </ReservationActions>
              </ReservationItem>
            ))}
          </ReservationsList>
        ) : (
          <EmptyState>
            <EmptyIcon>
              <i className="far fa-calendar-times"></i>
            </EmptyIcon>
            <EmptyText>예약 내역이 없습니다.</EmptyText>
            <EmptyButton onClick={() => navigate('/reservation')}>
              지금 예약하기
            </EmptyButton>
          </EmptyState>
        )}
      </ReservationsSection>
    );
  };

  if (!user) {
    return null; // 로그인되지 않은 경우 아무것도 렌더링하지 않음 (useEffect에서 리디렉션 처리)
  }

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <MyPageContainer
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SidebarContainer>
            <UserInfoCard>
              <UserAvatar>
                {user.name.charAt(0)}
              </UserAvatar>
              <UserName>{user.name}</UserName>
              <UserEmail>{user.email}</UserEmail>
              <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
            </UserInfoCard>
            <SidebarMenu>
              <MenuItem
                active={activeTab === 'profile'}
                onClick={() => handleTabChange('profile')}
              >
                <i className="fas fa-user"></i> 프로필
              </MenuItem>
              <MenuItem
                active={activeTab === 'security'}
                onClick={() => handleTabChange('security')}
              >
                <i className="fas fa-shield-alt"></i> 보안 설정
              </MenuItem>
              <MenuItem
                active={activeTab === 'reservations'}
                onClick={() => handleTabChange('reservations')}
              >
                <i className="fas fa-calendar-check"></i> 예약 내역
              </MenuItem>
              <MenuItem
                active={activeTab === 'medical-records'}
                onClick={() => handleTabChange('medical-records')}
              >
                <i className="fas fa-file-medical"></i> 진료 기록
              </MenuItem>
            </SidebarMenu>
          </SidebarContainer>
          <ContentContainer>
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'security' && renderSecurity()}
            {activeTab === 'reservations' && renderReservations()}
            {activeTab === 'medical-records' && (
              <div>
                <h2>진료 기록</h2>
                <EmptyState>
                  <EmptyIcon>
                    <i className="fas fa-file-medical-alt"></i>
                  </EmptyIcon>
                  <EmptyText>진료 기록이 없습니다.</EmptyText>
                </EmptyState>
              </div>
            )}
          </ContentContainer>
        </MyPageContainer>
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
  background-color: var(--background-light);
  padding: var(--spacing-lg);
`;

const MyPageContainer = styled.div`
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  background-color: transparent;
  gap: var(--spacing-xl);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
  }
`;

const SidebarContainer = styled.aside`
  width: 280px;
  flex-shrink: 0;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    width: 100%;
  }
`;

const UserInfoCard = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: var(--spacing-lg);
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UserAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: var(--spacing-md);
`;

const UserName = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: var(--spacing-xs);
`;

const UserEmail = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: var(--spacing-md);
`;

const LogoutButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme.colors.gray[600]};
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.gray[800]};
  }
`;

const SidebarMenu = styled.nav`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.sm};
`;

interface MenuItemProps {
  active: boolean;
}

const MenuItem = styled.button<MenuItemProps>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  text-align: left;
  font-size: ${props => props.theme.typography.fontSize.md};
  transition: all ${props => props.theme.transition.fast};
  cursor: pointer;
  
  i {
    margin-right: var(--spacing-sm);
    width: 20px;
  }
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : props.theme.colors.gray[100]};
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: var(--spacing-xl);
  box-shadow: ${props => props.theme.shadows.sm};
  
  h2 {
    font-size: ${props => props.theme.typography.fontSize['2xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    margin-bottom: var(--spacing-lg);
    color: var(--text-color);
  }
  
  h3 {
    font-size: ${props => props.theme.typography.fontSize.xl};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    margin-bottom: var(--spacing-md);
    color: var(--text-color);
  }
`;

const ProfileSection = styled.section``;

const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  
  h2 {
    margin-bottom: 0;
  }
`;

const EditButton = styled.button`
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: ${props => props.theme.borderRadius.md};
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: rgba(242, 151, 179, 0.1);
  }
`;

const ProfileInfo = styled.div`
  display: grid;
  gap: var(--spacing-md);
`;

const ProfileItem = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
  padding-bottom: var(--spacing-sm);
`;

const ProfileLabel = styled.div`
  width: 150px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[700]};
`;

const ProfileValue = styled.div`
  flex: 1;
  color: var(--text-color);
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
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray[100]};
    cursor: not-allowed;
  }
`;

const HelpText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.gray[600]};
  margin-top: var(--spacing-xs);
`;

const SaveButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  margin-top: var(--spacing-md);
  
  &:hover {
    background-color: #e3819d;
  }
`;

interface MessageBoxProps {
  success: boolean;
}

const MessageBox = styled.div<MessageBoxProps>`
  background-color: ${props => props.success ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)'};
  color: ${props => props.success ? '#27ae60' : '#e74c3c'};
  border: 1px solid ${props => props.success ? '#27ae60' : '#e74c3c'};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-md);
`;

const SecuritySection = styled.section``;

const PasswordForm = styled.form`
  max-width: 500px;
`;

const ReservationsSection = styled.section``;

const ReservationsList = styled.div`
  display: grid;
  gap: var(--spacing-md);
`;

const ReservationItem = styled.div`
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: var(--spacing-md);
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const ReservationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
`;

const ReservationHospital = styled.h4`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin: 0;
`;

interface ReservationStatusProps {
  status: string;
}

const ReservationStatus = styled.span<ReservationStatusProps>`
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border-radius: ${props => props.theme.borderRadius.full};
  
  background-color: ${props => {
    switch (props.status) {
      case '예약 확정':
        return 'rgba(46, 204, 113, 0.1)';
      case '대기 중':
        return 'rgba(243, 156, 18, 0.1)';
      case '취소됨':
        return 'rgba(231, 76, 60, 0.1)';
      default:
        return props.theme.colors.gray[100];
    }
  }};
  
  color: ${props => {
    switch (props.status) {
      case '예약 확정':
        return '#27ae60';
      case '대기 중':
        return '#f39c12';
      case '취소됨':
        return '#e74c3c';
      default:
        return props.theme.colors.gray[700];
    }
  }};
`;

const ReservationDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const ReservationDetail = styled.div``;

const ReservationLabel = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: var(--spacing-xs);
`;

const ReservationValue = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const ReservationActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
`;

interface ReservationButtonProps {
  primary?: boolean;
}

const ReservationButton = styled.button<ReservationButtonProps>`
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.primary ? 'white' : props.theme.colors.gray[600]};
  border: 1px solid ${props => props.primary ? 'var(--primary-color)' : props.theme.colors.gray[300]};
  
  &:hover {
    background-color: ${props => props.primary ? '#e3819d' : props.theme.colors.gray[100]};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) 0;
  color: ${props => props.theme.colors.gray[500]};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  color: ${props => props.theme.colors.gray[400]};
`;

const EmptyText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  margin-bottom: var(--spacing-lg);
`;

const EmptyButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: #e3819d;
    transform: translateY(-2px);
  }
`;

export default MyPage; 