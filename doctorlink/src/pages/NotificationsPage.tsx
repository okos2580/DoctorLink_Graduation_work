import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

// 알림 정보 타입 정의
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'system' | 'reminder';
  isRead: boolean;
  createdAt: string; // ISO 문자열 형식
  link?: string; // 연결된 페이지 (예: 예약 상세 페이지)
}

// 알림 타입에 따른 아이콘 및 색상
const notificationConfig = {
  appointment: { 
    icon: 'calendar-check', 
    color: 'var(--primary-color)',
    text: '예약'
  },
  system: { 
    icon: 'info-circle', 
    color: 'var(--info-color)',
    text: '시스템'
  },
  reminder: { 
    icon: 'bell', 
    color: 'var(--warning-color)',
    text: '알림'
  }
};

// 임시 데이터 (실제로는 API에서 가져올 것)
const generateSampleNotifications = (): Notification[] => {
  const now = new Date();
  const notifications: Notification[] = [];
  
  // 최근 30일 동안의 알림 샘플 데이터 생성
  for (let i = 0; i < 15; i++) {
    const notificationDate = new Date();
    notificationDate.setDate(now.getDate() - Math.floor(Math.random() * 30));
    notificationDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    // 알림 타입 랜덤 생성
    const types: ('appointment' | 'system' | 'reminder')[] = ['appointment', 'system', 'reminder'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // 알림 내용 생성
    let title = '';
    let message = '';
    let link = '';
    
    if (type === 'appointment') {
      const hospitals = ['서울 중앙 병원', '연세 세브란스 병원', '강남 세브란스 병원'];
      const hospital = hospitals[Math.floor(Math.random() * hospitals.length)];
      const doctors = ['김의사', '이의사', '박의사', '최의사', '정의사'];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      
      const actions = ['예약이 확정되었습니다', '예약이 변경되었습니다', '예약이 취소되었습니다', '진료 24시간 전입니다'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      title = `예약 ${action.split(' ')[1]}`;
      message = `${hospital} ${doctor} 선생님 ${action}`;
      link = '/reservations';
    } else if (type === 'system') {
      const systemMessages = [
        '시스템 점검 안내: 오늘 밤 2시부터 4시까지 서비스 이용이 제한됩니다.',
        '개인정보 처리방침이 업데이트되었습니다.',
        '서비스 이용약관이 변경되었습니다.',
        '새로운 기능이 추가되었습니다! 지금 확인해보세요.'
      ];
      title = '시스템 알림';
      message = systemMessages[Math.floor(Math.random() * systemMessages.length)];
    } else {
      const reminderMessages = [
        '복용 중인 약이 있나요? 복용 시간을 확인하세요.',
        '정기 검진 일정이 다가오고 있습니다.',
        '오늘의 건강 체크를 잊지 마세요.',
        '다음 진료 일정을 확인하세요.'
      ];
      title = '건강 알림';
      message = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
      link = '/medical-records';
    }
    
    notifications.push({
      id: `notif-${i}`,
      title,
      message,
      type,
      isRead: Math.random() > 0.5,
      createdAt: notificationDate.toISOString(),
      link: link || undefined
    });
  }
  
  // 날짜순으로 정렬 (최신순)
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return notifications;
};

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // 상태 관리
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);
  
  // 알림 데이터 로드 (실제로는 API 호출)
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      // API 호출 대신 샘플 데이터 사용
      setTimeout(() => {
        const sampleData = generateSampleNotifications();
        setNotifications(sampleData);
        setFilteredNotifications(sampleData);
        setTotalPages(Math.ceil(sampleData.length / itemsPerPage));
        setIsLoading(false);
      }, 1000);
    } else {
      navigate('/login', { state: { from: { pathname: '/notifications' } } });
    }
  }, [isAuthenticated, navigate]);
  
  // 필터링 로직
  useEffect(() => {
    let result = [...notifications];
    
    // 타입 필터 적용
    if (typeFilter !== 'all') {
      result = result.filter(notif => notif.type === typeFilter);
    }
    
    // 읽음 상태 필터 적용
    if (readFilter === 'read') {
      result = result.filter(notif => notif.isRead);
    } else if (readFilter === 'unread') {
      result = result.filter(notif => !notif.isRead);
    }
    
    setFilteredNotifications(result);
    setTotalPages(Math.ceil(result.length / itemsPerPage));
    setCurrentPage(1); // 필터링 시 첫 페이지로 리셋
  }, [notifications, typeFilter, readFilter]);
  
  // 페이지네이션을 위한 현재 페이지 아이템 계산
  const currentItems = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // 알림 읽음 표시 처리
  const handleMarkAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    );
    setNotifications(updatedNotifications);
  };
  
  // 모든 알림 읽음 표시 처리
  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, isRead: true }));
    setNotifications(updatedNotifications);
  };
  
  // 알림 클릭 처리 (관련 페이지로 이동)
  const handleNotificationClick = (notification: Notification) => {
    // 읽음 표시
    handleMarkAsRead(notification.id);
    
    // 관련 페이지가 있으면 해당 페이지로 이동
    if (notification.link) {
      navigate(notification.link);
    }
  };
  
  // 날짜 포맷팅 함수 (ex: "2시간 전", "어제", "2023년 5월 1일")
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay === 0) {
      if (diffHour === 0) {
        if (diffMin === 0) {
          return '방금 전';
        }
        return `${diffMin}분 전`;
      }
      return `${diffHour}시간 전`;
    } else if (diffDay === 1) {
      return '어제';
    } else if (diffDay < 7) {
      return `${diffDay}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };
  
  return (
    <PageContainer>
      <Header />
      <MainContent>
        <PageTitle>알림 센터</PageTitle>
        
        <ContentContainer>
          {/* 필터 영역 */}
          <FilterContainer>
            <FilterGroup>
              <FilterLabel>알림 타입</FilterLabel>
              <FilterSelect 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">전체 알림</option>
                <option value="appointment">예약 알림</option>
                <option value="system">시스템 알림</option>
                <option value="reminder">건강 알림</option>
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>읽음 상태</FilterLabel>
              <FilterSelect 
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
              >
                <option value="all">모든 알림</option>
                <option value="unread">안 읽은 알림</option>
                <option value="read">읽은 알림</option>
              </FilterSelect>
            </FilterGroup>
            
            <MarkAllAsReadButton onClick={handleMarkAllAsRead}>
              모두 읽음 표시
            </MarkAllAsReadButton>
          </FilterContainer>
          
          {/* 알림 목록 */}
          <NotificationsContainer>
            {isLoading ? (
              <LoadingSpinner>
                <LoadingText>알림을 불러오는 중...</LoadingText>
              </LoadingSpinner>
            ) : filteredNotifications.length === 0 ? (
              <NoNotificationsMessage>
                알림이 없습니다.
              </NoNotificationsMessage>
            ) : (
              <>
                <NotificationsList>
                  {currentItems.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      as={motion.div}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      isRead={notification.isRead}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <NotificationIconContainer $color={notificationConfig[notification.type].color}>
                        <i className={`fas fa-${notificationConfig[notification.type].icon}`}></i>
                      </NotificationIconContainer>
                      
                      <NotificationContent>
                        <NotificationHeader>
                          <NotificationType $color={notificationConfig[notification.type].color}>
                            {notificationConfig[notification.type].text}
                          </NotificationType>
                          <NotificationTitle isRead={notification.isRead}>
                            {notification.title}
                          </NotificationTitle>
                        </NotificationHeader>
                        
                        <NotificationMessage>
                          {notification.message}
                        </NotificationMessage>
                        
                        <NotificationFooter>
                          <NotificationTime>
                            {formatDate(notification.createdAt)}
                          </NotificationTime>
                          {!notification.isRead && (
                            <UnreadIndicator />
                          )}
                        </NotificationFooter>
                      </NotificationContent>
                      
                      {notification.link && (
                        <NotificationArrow>
                          <i className="fas fa-chevron-right"></i>
                        </NotificationArrow>
                      )}
                    </NotificationCard>
                  ))}
                </NotificationsList>
                
                {/* 페이지네이션 */}
                <Pagination>
                  <PaginationButton 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    이전
                  </PaginationButton>
                  
                  <PageInfo>
                    {currentPage} / {totalPages}
                  </PageInfo>
                  
                  <PaginationButton 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    다음
                  </PaginationButton>
                </Pagination>
              </>
            )}
          </NotificationsContainer>
        </ContentContainer>
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
  padding: var(--spacing-xl);
  background-color: var(--background-light);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: var(--spacing-lg) var(--spacing-md);
  }
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-color);
  margin-bottom: var(--spacing-xl);
  text-align: center;
`;

const ContentContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  background-color: white;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  align-items: flex-end;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-wrap: wrap;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 150px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
  }
`;

const FilterLabel = styled.label`
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
  color: var(--color-gray-600);
`;

const FilterSelect = styled.select`
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const MarkAllAsReadButton = styled.button`
  margin-left: auto;
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: white;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--color-gray-100);
    border-color: var(--color-gray-400);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
    margin-top: var(--spacing-sm);
  }
`;

const NotificationsContainer = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
`;

const LoadingText = styled.p`
  color: var(--color-gray-500);
  font-size: var(--font-size-lg);
`;

const NoNotificationsMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  background-color: white;
  border-radius: var(--border-radius-md);
  color: var(--color-gray-500);
  font-size: var(--font-size-lg);
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

interface NotificationCardProps {
  isRead: boolean;
}

const NotificationCard = styled.div<NotificationCardProps>`
  display: flex;
  align-items: flex-start;
  background-color: ${props => props.isRead ? 'white' : 'var(--color-gray-50)'};
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    background-color: ${props => props.isRead ? 'white' : 'var(--color-primary-50)'};
  }
`;

interface IconContainerProps {
  $color: string;
}

const NotificationIconContainer = styled.div<IconContainerProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.$color + '20'};
  color: ${props => props.$color};
  margin-right: var(--spacing-md);
  flex-shrink: 0;
  
  i {
    font-size: 1.2rem;
  }
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-xs);
`;

interface TypeProps {
  $color: string;
}

const NotificationType = styled.div<TypeProps>`
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: white;
  background-color: ${props => props.$color};
  padding: 2px 6px;
  border-radius: var(--border-radius-full);
  margin-right: var(--spacing-xs);
`;

interface TitleProps {
  isRead: boolean;
}

const NotificationTitle = styled.h3<TitleProps>`
  font-size: var(--font-size-md);
  font-weight: ${props => props.isRead ? 'var(--font-weight-medium)' : 'var(--font-weight-bold)'};
  color: var(--text-color);
  margin: 0;
`;

const NotificationMessage = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
`;

const NotificationFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NotificationTime = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
`;

const UnreadIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--primary-color);
`;

const NotificationArrow = styled.div`
  color: var(--color-gray-400);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: var(--spacing-sm);
  
  i {
    font-size: 0.8rem;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
`;

const PaginationButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: white;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover:not(:disabled) {
    background-color: var(--color-gray-100);
    border-color: var(--color-gray-400);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
`;

export default NotificationsPage; 