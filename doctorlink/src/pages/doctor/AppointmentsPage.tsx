import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';


// 타입 정의
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
}

interface Appointment {
  id: string;
  patient: Patient;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason: string;
}

// 가상 데이터
const samplePatients: Patient[] = [
  { id: 'p1', name: '김환자', age: 35, gender: '남', contact: '010-1234-5678' },
  { id: 'p2', name: '이영희', age: 28, gender: '여', contact: '010-2345-6789' },
  { id: 'p3', name: '박지민', age: 42, gender: '남', contact: '010-3456-7890' },
  { id: 'p4', name: '최수진', age: 31, gender: '여', contact: '010-4567-8901' },
  { id: 'p5', name: '정민준', age: 25, gender: '남', contact: '010-5678-9012' },
  { id: 'p6', name: '강서연', age: 47, gender: '여', contact: '010-6789-0123' },
  { id: 'p7', name: '윤지호', age: 39, gender: '남', contact: '010-7890-1234' },
  { id: 'p8', name: '한소희', age: 22, gender: '여', contact: '010-8901-2345' },
];

// 날짜 생성 도우미 함수
const getDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

// 샘플 예약 데이터 생성
const generateSampleAppointments = (): Appointment[] => {
  const appointments: Appointment[] = [];
  
  // 오늘 예약
  appointments.push(
    { 
      id: 'a1', 
      patient: samplePatients[0], 
      date: getDate(0), 
      time: '09:30', 
      status: 'confirmed',
      reason: '감기 증상, 고열' 
    },
    { 
      id: 'a2', 
      patient: samplePatients[1], 
      date: getDate(0), 
      time: '11:00', 
      status: 'confirmed',
      reason: '정기 검진' 
    },
    { 
      id: 'a3', 
      patient: samplePatients[2], 
      date: getDate(0), 
      time: '14:00', 
      status: 'completed',
      reason: '혈압 측정 및 약 처방' 
    }
  );
  
  // 내일 예약
  appointments.push(
    { 
      id: 'a4', 
      patient: samplePatients[3], 
      date: getDate(1), 
      time: '10:30', 
      status: 'confirmed',
      reason: '어지러움, 구토 증상' 
    },
    { 
      id: 'a5', 
      patient: samplePatients[4], 
      date: getDate(1), 
      time: '16:00', 
      status: 'confirmed',
      reason: '피부 발진 및 가려움증' 
    }
  );
  
  // 모레 예약
  appointments.push(
    { 
      id: 'a6', 
      patient: samplePatients[5], 
      date: getDate(2), 
      time: '09:00', 
      status: 'confirmed',
      reason: '허리 통증' 
    },
    { 
      id: 'a7', 
      patient: samplePatients[6], 
      date: getDate(2), 
      time: '13:30', 
      status: 'pending',
      reason: '치통' 
    }
  );
  
  // 일주일 내 예약
  appointments.push(
    { 
      id: 'a8', 
      patient: samplePatients[7], 
      date: getDate(4), 
      time: '11:30', 
      status: 'pending',
      reason: '알레르기 검사' 
    },
    { 
      id: 'a9', 
      patient: samplePatients[0], 
      date: getDate(6), 
      time: '15:00', 
      status: 'pending',
      reason: '기침, 가래 증상 지속' 
    }
  );
  
  // 지난 예약
  appointments.push(
    { 
      id: 'a10', 
      patient: samplePatients[2], 
      date: getDate(-2), 
      time: '14:30', 
      status: 'completed',
      reason: '고혈압 정기 검진' 
    },
    { 
      id: 'a11', 
      patient: samplePatients[4], 
      date: getDate(-3), 
      time: '10:00', 
      status: 'completed',
      reason: '독감 예방 접종' 
    },
    { 
      id: 'a12', 
      patient: samplePatients[1], 
      date: getDate(-5), 
      time: '09:30', 
      status: 'cancelled',
      reason: '발목 통증' 
    }
  );
  
  return appointments;
};

const sampleAppointments = generateSampleAppointments();

const AppointmentsPage: React.FC = () => {
  // 상태 관리
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: getDate(-30),
    end: getDate(30)
  });
  
  const itemsPerPage = 10;
  
  // 데이터 로드 (API 대신 가상 데이터 사용)
  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setAppointments(sampleAppointments);
      setLoading(false);
    }, 1000);
  }, []);
  
  // 필터링된 예약 목록
  const filteredAppointments = appointments.filter(appointment => {
    // 날짜 필터
    if (dateFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      
      if (dateFilter === 'today' && appointment.date !== today) {
        return false;
      }
      
      if (dateFilter === 'upcoming' && new Date(appointment.date) <= new Date(today)) {
        return false;
      }
      
      if (dateFilter === 'past' && new Date(appointment.date) >= new Date(today)) {
        return false;
      }
      
      if (dateFilter === 'custom') {
        const appointmentDate = new Date(appointment.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        if (appointmentDate < startDate || appointmentDate > endDate) {
          return false;
        }
      }
    }
    
    // 상태 필터
    if (statusFilter !== 'all' && appointment.status !== statusFilter) {
      return false;
    }
    
    // 검색어 필터
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        appointment.patient.name.toLowerCase().includes(searchLower) ||
        appointment.reason.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // 예약 정렬 (날짜와 시간순)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    return a.time.localeCompare(b.time);
  });
  
  // 페이지네이션
  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAppointments.slice(indexOfFirstItem, indexOfLastItem);
  
  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // 예약 상태 변경 핸들러
  const handleStatusChange = (id: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    setAppointments(prev => 
      prev.map(appointment => 
        appointment.id === id ? { ...appointment, status: newStatus } : appointment
      )
    );
  };
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };
  
  return (
    <PageContainer>
      <Header />
      <ContentContainer>
        <PageHeader
          as={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PageTitle>예약 관리</PageTitle>
          <ActionsContainer>
            <ButtonsContainer>
              <ActionButton color="primary">
                <i className="fas fa-plus"></i> 새 예약 추가
              </ActionButton>
              <ActionButton color="secondary">
                <i className="fas fa-calendar-alt"></i> 일정표 보기
              </ActionButton>
            </ButtonsContainer>
          </ActionsContainer>
        </PageHeader>
        
        <FiltersContainer
          as={motion.div}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FilterGroup>
            <FilterLabel>날짜</FilterLabel>
            <FilterSelect 
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            >
              <option value="all">모든 날짜</option>
              <option value="today">오늘</option>
              <option value="upcoming">다가오는 예약</option>
              <option value="past">지난 예약</option>
              <option value="custom">커스텀 기간</option>
            </FilterSelect>
            
            {dateFilter === 'custom' && (
              <DateRangeContainer>
                <DateInput
                  type="date"
                  value={dateRange.start}
                  onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
                <DateRangeSeparator>~</DateRangeSeparator>
                <DateInput
                  type="date"
                  value={dateRange.end}
                  onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </DateRangeContainer>
            )}
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>상태</FilterLabel>
            <FilterSelect 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">모든 상태</option>
              <option value="pending">대기중</option>
              <option value="confirmed">확정</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
            </FilterSelect>
          </FilterGroup>
          
          <SearchContainer>
            <SearchInput
              placeholder="환자 이름 또는 증상 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <SearchButton>
              <i className="fas fa-search"></i>
            </SearchButton>
          </SearchContainer>
        </FiltersContainer>
        
        <AppointmentsContainer
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>예약 정보를 불러오는 중...</LoadingText>
            </LoadingContainer>
          ) : sortedAppointments.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <i className="far fa-calendar-times"></i>
              </EmptyIcon>
              <EmptyText>조건에 맞는 예약이 없습니다.</EmptyText>
            </EmptyState>
          ) : (
            <>
              <AppointmentsList>
                <AppointmentHeader>
                  <AppointmentHeaderCell width="15%">날짜</AppointmentHeaderCell>
                  <AppointmentHeaderCell width="10%">시간</AppointmentHeaderCell>
                  <AppointmentHeaderCell width="20%">환자</AppointmentHeaderCell>
                  <AppointmentHeaderCell width="25%">증상/사유</AppointmentHeaderCell>
                  <AppointmentHeaderCell width="15%">상태</AppointmentHeaderCell>
                  <AppointmentHeaderCell width="15%">액션</AppointmentHeaderCell>
                </AppointmentHeader>
                
                {currentItems.map(appointment => (
                  <AppointmentRow key={appointment.id}>
                    <AppointmentCell width="15%">
                      {formatDate(appointment.date)}
                    </AppointmentCell>
                    <AppointmentCell width="10%">{appointment.time}</AppointmentCell>
                    <AppointmentCell width="20%">
                      <PatientName>{appointment.patient.name}</PatientName>
                      <PatientDetail>
                        {appointment.patient.age}세 / {appointment.patient.gender}
                      </PatientDetail>
                    </AppointmentCell>
                    <AppointmentCell width="25%">{appointment.reason}</AppointmentCell>
                    <AppointmentCell width="15%">
                      <StatusBadge status={appointment.status}>
                        {appointment.status === 'pending' && '대기중'}
                        {appointment.status === 'confirmed' && '확정'}
                        {appointment.status === 'completed' && '완료'}
                        {appointment.status === 'cancelled' && '취소'}
                      </StatusBadge>
                    </AppointmentCell>
                    <AppointmentCell width="15%">
                      <AppointmentActions>
                        {appointment.status === 'pending' && (
                          <>
                            <ActionIcon 
                              color="success" 
                              onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                              title="예약 확정"
                            >
                              <i className="fas fa-check"></i>
                            </ActionIcon>
                            <ActionIcon 
                              color="danger" 
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                              title="예약 취소"
                            >
                              <i className="fas fa-times"></i>
                            </ActionIcon>
                          </>
                        )}
                        
                        {appointment.status === 'confirmed' && (
                          <>
                            <ActionIcon 
                              color="info" 
                              onClick={() => handleStatusChange(appointment.id, 'completed')}
                              title="진료 완료"
                            >
                              <i className="fas fa-clipboard-check"></i>
                            </ActionIcon>
                            <ActionIcon 
                              color="danger" 
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                              title="예약 취소"
                            >
                              <i className="fas fa-times"></i>
                            </ActionIcon>
                          </>
                        )}
                        
                        <ActionIcon color="primary" title="세부정보">
                          <i className="fas fa-info-circle"></i>
                        </ActionIcon>
                      </AppointmentActions>
                    </AppointmentCell>
                  </AppointmentRow>
                ))}
              </AppointmentsList>
              
              <PaginationContainer>
                <PaginationButton 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <i className="fas fa-chevron-left"></i>
                </PaginationButton>
                
                <PageNumbers>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(pageNum => {
                      // 현재 페이지 주변의 페이지만 표시 (모바일 대응)
                      return (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - currentPage) <= 2
                      );
                    })
                    .map((pageNum, index, array) => {
                      // 생략 부호(...) 추가
                      if (index > 0 && array[index - 1] !== pageNum - 1) {
                        return (
                          <React.Fragment key={`ellipsis-${pageNum}`}>
                            <PageEllipsis>...</PageEllipsis>
                            <PageNumber 
                              active={pageNum === currentPage}
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </PageNumber>
                          </React.Fragment>
                        );
                      }
                      
                      return (
                        <PageNumber 
                          key={pageNum}
                          active={pageNum === currentPage}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </PageNumber>
                      );
                    })}
                </PageNumbers>
                
                <PaginationButton 
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </PaginationButton>
              </PaginationContainer>
            </>
          )}
        </AppointmentsContainer>
      </ContentContainer>
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

const ContentContainer = styled.div`
  flex: 1;
  padding: var(--spacing-md);
  background-color: var(--background-light);
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
`;

const PageTitle = styled.h1`
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-color);
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-md);
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    justify-content: flex-start;
  }
  
  @media (max-width: 576px) {
    flex-direction: column;
    width: 100%;
  }
`;

interface ActionButtonProps {
  color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';
}

const getButtonColor = (color: string) => {
  switch (color) {
    case 'primary':
      return 'var(--primary-color)';
    case 'secondary':
      return '#6c757d';
    case 'success':
      return '#28a745';
    case 'danger':
      return '#dc3545';
    case 'warning':
      return '#ffc107';
    case 'info':
      return '#17a2b8';
    case 'dark':
      return '#343a40';
    default:
      return 'var(--gray-500)';
  }
};

const ActionButton = styled.button<ActionButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: ${props => getButtonColor(props.color)};
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  i {
    font-size: var(--font-size-md);
  }
  
  @media (max-width: 576px) {
    width: 100%;
    justify-content: center;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const FilterLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: var(--text-color);
  white-space: nowrap;
`;

const FilterSelect = styled.select`
  padding: var(--spacing-sm);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  color: var(--text-color);
  background-color: white;
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const DateRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  @media (max-width: 768px) {
    width: 100%;
    margin-top: var(--spacing-sm);
  }
`;

const DateInput = styled.input`
  padding: var(--spacing-sm);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  color: var(--text-color);
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const DateRangeSeparator = styled.span`
  font-size: var(--font-size-md);
  color: var(--color-gray-500);
`;

const SearchContainer = styled.div`
  display: flex;
  flex: 1;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
  font-size: var(--font-size-md);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
  cursor: pointer;
  
  &:hover {
    background-color: var(--primary-dark);
  }
  
  i {
    font-size: var(--font-size-md);
  }
`;

const AppointmentsContainer = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
`;

const AppointmentsList = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const AppointmentHeader = styled.div`
  display: flex;
  background-color: var(--color-gray-100);
  border-bottom: 2px solid var(--color-gray-200);
  padding: var(--spacing-md) 0;
  font-weight: var(--font-weight-bold);
`;

interface CellWidthProps {
  width: string;
}

const AppointmentHeaderCell = styled.div<CellWidthProps>`
  flex: 0 0 ${props => props.width};
  padding: var(--spacing-md);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-md);
  color: var(--text-color-secondary);
`;

const AppointmentRow = styled.div`
  display: flex;
  border-bottom: 1px solid var(--color-gray-200);
  padding: var(--spacing-md);
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--color-gray-100);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const AppointmentCell = styled.div<CellWidthProps>`
  flex: 0 0 ${props => props.width};
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: var(--font-size-md);
  color: var(--text-color);
`;

const PatientName = styled.div`
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
`;

const PatientDetail = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
`;

interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#ffc107'; // 노란색
    case 'confirmed':
      return '#007bff'; // 파란색
    case 'completed':
      return '#28a745'; // 초록색
    case 'cancelled':
      return '#dc3545'; // 빨간색
    default:
      return '#6c757d'; // 회색
  }
};

const StatusBadge = styled.span<StatusBadgeProps>`
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: ${props => getStatusColor(props.status)};
  color: white;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: center;
  align-self: flex-start;
`;

const AppointmentActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

interface ActionIconProps {
  color: string;
}

const ActionIcon = styled.button<ActionIconProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: transparent;
  color: ${props => getButtonColor(props.color)};
  border: 1px solid ${props => getButtonColor(props.color)};
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: ${props => getButtonColor(props.color)};
    color: white;
  }
  
  i {
    font-size: var(--font-size-md);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-gray-200);
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background-color: white;
  color: var(--text-color);
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

const PageNumbers = styled.div`
  display: flex;
  align-items: center;
  margin: 0 var(--spacing-sm);
`;

interface PageNumberProps {
  active: boolean;
}

const PageNumber = styled.button<PageNumberProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0 var(--spacing-xs);
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'var(--color-gray-300)'};
  border-radius: var(--border-radius-md);
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  font-weight: ${props => props.active ? 'var(--font-weight-bold)' : 'var(--font-weight-regular)'};
  cursor: ${props => props.active ? 'default' : 'pointer'};
  transition: all var(--transition-fast);
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--color-gray-100)'};
    border-color: ${props => props.active ? 'var(--primary-color)' : 'var(--color-gray-400)'};
  }
`;

const PageEllipsis = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0 var(--spacing-xs);
  color: var(--color-gray-500);
  font-weight: var(--font-weight-bold);
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-md);
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  color: var(--color-gray-400);
  margin-bottom: var(--spacing-md);
`;

const EmptyText = styled.div`
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
  text-align: center;
  line-height: var(--line-height-normal);
`;

export default AppointmentsPage; 