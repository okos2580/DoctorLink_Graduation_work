import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

// 예약 정보 타입 정의
interface Reservation {
  id: string;
  hospitalName: string;
  doctorName: string;
  specialty: string;
  date: string; // ISO 문자열 형식
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  reason: string;
}

// 예약 상태에 따른 색상과 텍스트
const statusConfig = {
  confirmed: { color: 'var(--success-color)', text: '예약 확정' },
  pending: { color: 'var(--warning-color)', text: '대기 중' },
  cancelled: { color: 'var(--danger-color)', text: '취소됨' },
  completed: { color: 'var(--info-color)', text: '진료 완료' },
};

// 임시 데이터 (실제로는 API에서 가져올 것)
const generateSampleReservations = (): Reservation[] => {
  const now = new Date();
  const reservations: Reservation[] = [];
  
  // 오늘부터 향후 30일에 대한 예약 샘플 데이터 생성
  for (let i = 0; i < 10; i++) {
    const reservationDate = new Date();
    reservationDate.setDate(now.getDate() + Math.floor(Math.random() * 30));
    
    // 예약 상태 랜덤 생성 (과거 날짜는 completed 또는 cancelled, 미래 날짜는 confirmed 또는 pending)
    let status: Reservation['status'] = 'confirmed';
    if (reservationDate < now) {
      status = Math.random() > 0.5 ? 'completed' : 'cancelled';
    } else {
      status = Math.random() > 0.3 ? 'confirmed' : 'pending';
    }
    
    reservations.push({
      id: `res-${i}`,
      hospitalName: ['서울 중앙 병원', '연세 세브란스 병원', '강남 세브란스 병원'][Math.floor(Math.random() * 3)],
      doctorName: ['김의사', '이의사', '박의사', '최의사', '정의사'][Math.floor(Math.random() * 5)],
      specialty: ['내과', '외과', '소아과', '피부과', '안과'][Math.floor(Math.random() * 5)],
      date: reservationDate.toISOString().split('T')[0],
      time: `${9 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'}`,
      status: status,
      reason: ['감기 증상', '정기 검진', '두통이 지속됨', '알레르기 반응', '소화 불량'][Math.floor(Math.random() * 5)]
    });
  }
  
  return reservations;
};

const ReservationManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // 상태 관리
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);
  
  // 예약 데이터 로드 (실제로는 API 호출)
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      // API 호출 대신 샘플 데이터 사용
      setTimeout(() => {
        const sampleData = generateSampleReservations();
        setReservations(sampleData);
        setFilteredReservations(sampleData);
        setTotalPages(Math.ceil(sampleData.length / itemsPerPage));
        setIsLoading(false);
      }, 1000);
    } else {
      navigate('/login', { state: { from: { pathname: '/reservations' } } });
    }
  }, [isAuthenticated, navigate]);
  
  // 필터링 로직
  useEffect(() => {
    let result = [...reservations];
    
    // 상태 필터 적용
    if (statusFilter !== 'all') {
      result = result.filter(res => res.status === statusFilter);
    }
    
    // 날짜 필터 적용
    const today = new Date().toISOString().split('T')[0];
    if (dateFilter === 'upcoming') {
      result = result.filter(res => res.date >= today);
    } else if (dateFilter === 'past') {
      result = result.filter(res => res.date < today);
    }
    
    // 검색어 필터 적용
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(res => 
        res.hospitalName.toLowerCase().includes(term) ||
        res.doctorName.toLowerCase().includes(term) ||
        res.specialty.toLowerCase().includes(term) ||
        res.reason.toLowerCase().includes(term)
      );
    }
    
    // 정렬: 날짜 순 (최근 예약이 위로)
    result.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
    
    setFilteredReservations(result);
    setTotalPages(Math.ceil(result.length / itemsPerPage));
    setCurrentPage(1); // 필터링 시 첫 페이지로 리셋
  }, [reservations, statusFilter, dateFilter, searchTerm]);
  
  // 페이지네이션을 위한 현재 페이지 아이템 계산
  const currentItems = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // 예약 취소 처리
  const handleCancelReservation = (id: string) => {
    if (window.confirm('예약을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setIsLoading(true);
      
      // 실제로는 API 호출로 처리
      setTimeout(() => {
        const updatedReservations = reservations.map(res => 
          res.id === id ? { ...res, status: 'cancelled' as const } : res
        );
        setReservations(updatedReservations);
        setIsLoading(false);
        alert('예약이 취소되었습니다.');
      }, 500);
    }
  };
  
  // 예약 변경 페이지로 이동
  const handleModifyReservation = (id: string) => {
    navigate(`/reservation/modify/${id}`);
  };
  
  // 날짜 포맷팅
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };
  
  // 각 예약의 상태에 따라 가능한 액션 결정
  const getAvailableActions = (reservation: Reservation) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (reservation.status === 'confirmed' && reservation.date > today) {
      // 확정된 미래 예약은 취소 및 변경 가능
      return (
        <ActionButtons>
          <ActionButton 
            onClick={() => handleModifyReservation(reservation.id)}
            $color="var(--primary-color)"
          >
            변경
          </ActionButton>
          <ActionButton 
            onClick={() => handleCancelReservation(reservation.id)}
            $color="var(--danger-color)"
          >
            취소
          </ActionButton>
        </ActionButtons>
      );
    } else if (reservation.status === 'pending') {
      // 대기 중인 예약은 취소만 가능
      return (
        <ActionButtons>
          <ActionButton 
            onClick={() => handleCancelReservation(reservation.id)}
            $color="var(--danger-color)"
          >
            취소
          </ActionButton>
        </ActionButtons>
      );
    } else {
      // 완료되거나 취소된 예약은 액션 불가
      return (
        <ActionButtons>
          <ActionButtonDisabled>액션 불가</ActionButtonDisabled>
        </ActionButtons>
      );
    }
  };
  
  return (
    <PageContainer>
      <Header />
      <MainContent>
        <PageTitle>내 예약 관리</PageTitle>
        
        <ContentContainer>
          {/* 필터 영역 */}
          <FilterContainer>
            <FilterGroup>
              <FilterLabel>예약 상태</FilterLabel>
              <FilterSelect 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">전체 예약</option>
                <option value="confirmed">예약 확정</option>
                <option value="pending">예약 대기</option>
                <option value="cancelled">취소됨</option>
                <option value="completed">진료 완료</option>
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>날짜</FilterLabel>
              <FilterSelect 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">전체 기간</option>
                <option value="upcoming">예정된 예약</option>
                <option value="past">지난 예약</option>
              </FilterSelect>
            </FilterGroup>
            
            <SearchInput
              type="text"
              placeholder="병원, 의사, 진료과 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FilterContainer>
          
          {/* 예약 목록 */}
          <ReservationsContainer>
            {isLoading ? (
              <LoadingSpinner>
                <LoadingText>예약 정보를 불러오는 중...</LoadingText>
              </LoadingSpinner>
            ) : filteredReservations.length === 0 ? (
              <NoReservationsMessage>
                예약 내역이 없습니다.
              </NoReservationsMessage>
            ) : (
              <>
                <ReservationsList>
                  {currentItems.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      as={motion.div}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ReservationHeader>
                        <ReservationDate>
                          {formatDate(reservation.date)} {reservation.time}
                        </ReservationDate>
                        <ReservationStatus $color={statusConfig[reservation.status].color}>
                          {statusConfig[reservation.status].text}
                        </ReservationStatus>
                      </ReservationHeader>
                      
                      <ReservationDetails>
                        <ReservationInfo>
                          <InfoLabel>병원:</InfoLabel>
                          <InfoValue>{reservation.hospitalName}</InfoValue>
                        </ReservationInfo>
                        <ReservationInfo>
                          <InfoLabel>의사:</InfoLabel>
                          <InfoValue>{reservation.doctorName} ({reservation.specialty})</InfoValue>
                        </ReservationInfo>
                        <ReservationInfo>
                          <InfoLabel>증상:</InfoLabel>
                          <InfoValue>{reservation.reason}</InfoValue>
                        </ReservationInfo>
                      </ReservationDetails>
                      
                      {getAvailableActions(reservation)}
                    </ReservationCard>
                  ))}
                </ReservationsList>
                
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
          </ReservationsContainer>
          
          {/* 새 예약 버튼 */}
          <NewReservationButton 
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/reservation')}
          >
            새로운 예약하기
          </NewReservationButton>
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
  max-width: 900px;
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

const SearchInput = styled.input`
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
  }
`;

const ReservationsContainer = styled.div`
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

const NoReservationsMessage = styled.div`
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

const ReservationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const ReservationCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
`;

const ReservationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-gray-100);
  border-bottom: 1px solid var(--color-gray-200);
`;

const ReservationDate = styled.div`
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-md);
`;

interface StatusProps {
  $color: string;
}

const ReservationStatus = styled.div<StatusProps>`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: white;
  background-color: ${props => props.$color};
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
`;

const ReservationDetails = styled.div`
  padding: var(--spacing-md);
`;

const ReservationInfo = styled.div`
  display: flex;
  margin-bottom: var(--spacing-xs);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.div`
  width: 80px;
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
`;

const InfoValue = styled.div`
  flex: 1;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-gray-200);
  justify-content: flex-end;
`;

interface ActionButtonProps {
  $color: string;
}

const ActionButton = styled.button<ActionButtonProps>`
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: white;
  border: 1px solid ${props => props.$color};
  color: ${props => props.$color};
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: ${props => props.$color};
    color: white;
  }
`;

const ActionButtonDisabled = styled.button`
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: var(--color-gray-200);
  border: 1px solid var(--color-gray-300);
  color: var(--color-gray-500);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: not-allowed;
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

const NewReservationButton = styled.button`
  display: block;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
  
  &:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

export default ReservationManagementPage; 