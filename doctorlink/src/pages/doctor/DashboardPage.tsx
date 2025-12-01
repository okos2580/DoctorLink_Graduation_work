import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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

interface MedicalRecord {
  id: string;
  patient: Patient;
  date: string;
  diagnosis: string;
  note: string;
}

// 가상 데이터
const todayDate = new Date().toISOString().split('T')[0];
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowDate = tomorrow.toISOString().split('T')[0];

const samplePatients: Patient[] = [
  { id: 'p1', name: '김환자', age: 35, gender: '남', contact: '010-1234-5678' },
  { id: 'p2', name: '이영희', age: 28, gender: '여', contact: '010-2345-6789' },
  { id: 'p3', name: '박지민', age: 42, gender: '남', contact: '010-3456-7890' },
  { id: 'p4', name: '최수진', age: 31, gender: '여', contact: '010-4567-8901' },
  { id: 'p5', name: '정민준', age: 25, gender: '남', contact: '010-5678-9012' },
];

const sampleAppointments: Appointment[] = [
  { 
    id: 'a1', 
    patient: samplePatients[0], 
    date: todayDate, 
    time: '09:30', 
    status: 'confirmed',
    reason: '감기 증상, 고열' 
  },
  { 
    id: 'a2', 
    patient: samplePatients[1], 
    date: todayDate, 
    time: '11:00', 
    status: 'confirmed',
    reason: '정기 검진' 
  },
  { 
    id: 'a3', 
    patient: samplePatients[2], 
    date: todayDate, 
    time: '14:00', 
    status: 'confirmed',
    reason: '혈압 측정 및 약 처방' 
  },
  { 
    id: 'a4', 
    patient: samplePatients[3], 
    date: tomorrowDate, 
    time: '10:30', 
    status: 'pending',
    reason: '어지러움, 구토 증상' 
  },
  { 
    id: 'a5', 
    patient: samplePatients[4], 
    date: tomorrowDate, 
    time: '16:00', 
    status: 'pending',
    reason: '피부 발진 및 가려움증' 
  },
];

const sampleMedicalRecords: MedicalRecord[] = [
  {
    id: 'mr1',
    patient: samplePatients[0],
    date: '2023-11-01',
    diagnosis: '급성 인두염',
    note: '이비인후과 검사 결과 인두 부위 염증 확인. 항생제 처방 및 휴식 권장.',
  },
  {
    id: 'mr2',
    patient: samplePatients[1],
    date: '2023-10-25',
    diagnosis: '만성 알레르기 비염',
    note: '알레르기 반응 검사 결과 집먼지진드기에 양성 반응. 항히스타민제 처방.',
  },
  {
    id: 'mr3',
    patient: samplePatients[2],
    date: '2023-10-20',
    diagnosis: '고혈압',
    note: '혈압 150/95mmHg. 항고혈압제 처방 및 식이요법 교육.',
  }
];

const DashboardPage: React.FC = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 데이터 로딩 (API 대신 가상 데이터 사용)
  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    setTimeout(() => {
      // 오늘 예약 필터링
      const today = sampleAppointments.filter(
        appointment => appointment.date === todayDate && appointment.status === 'confirmed'
      );
      
      // 대기 중인 예약 필터링
      const pending = sampleAppointments.filter(
        appointment => appointment.status === 'pending'
      );
      
      // 최근 진료 기록
      const recent = [...sampleMedicalRecords].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 5);
      
      setTodayAppointments(today);
      setPendingAppointments(pending);
      setRecentRecords(recent);
      setLoading(false);
    }, 1000);
  }, []);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 시간 포맷팅 함수
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <PageContainer>
      <Header />
      <DashboardContainer>
        <DashboardHeader>
          <DashboardTitle>의사 대시보드</DashboardTitle>
          <DoctorInfo>
            <DoctorAvatar>
              <i className="fas fa-user-md"></i>
            </DoctorAvatar>
            <DoctorName>김의사 선생님</DoctorName>
            <DoctorSpecialty>내과 전문의</DoctorSpecialty>
          </DoctorInfo>
        </DashboardHeader>

        <DashboardContent>
          <LeftSection>
            <SectionCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SectionHeader>
                <SectionTitle>오늘의 진료 일정</SectionTitle>
                <SectionDate>{formatDate(todayDate)}</SectionDate>
              </SectionHeader>

              {loading ? (
                <LoadingContainer>
                  <LoadingSpinner />
                  <LoadingText>일정을 불러오는 중...</LoadingText>
                </LoadingContainer>
              ) : todayAppointments.length > 0 ? (
                <AppointmentList>
                  {todayAppointments.map((appointment) => (
                    <AppointmentItem key={appointment.id}>
                      <AppointmentTime>
                        {formatTime(appointment.time)}
                      </AppointmentTime>
                      <AppointmentInfo>
                        <PatientName>{appointment.patient.name}</PatientName>
                        <PatientDetail>
                          {appointment.patient.age}세 / {appointment.patient.gender}
                        </PatientDetail>
                        <AppointmentReason>{appointment.reason}</AppointmentReason>
                      </AppointmentInfo>
                      <AppointmentActions>
                        <ActionButton color="primary">
                          <i className="fas fa-clipboard-list"></i>
                          기록
                        </ActionButton>
                        <ActionButton color="secondary">
                          <i className="fas fa-prescription"></i>
                          처방
                        </ActionButton>
                      </AppointmentActions>
                    </AppointmentItem>
                  ))}
                </AppointmentList>
              ) : (
                <EmptyState>
                  <EmptyIcon>
                    <i className="far fa-calendar"></i>
                  </EmptyIcon>
                  <EmptyText>오늘은 예약된 진료가 없습니다.</EmptyText>
                </EmptyState>
              )}

              <ViewAllLink to="/doctor/appointments">
                모든 일정 보기 <i className="fas fa-chevron-right"></i>
              </ViewAllLink>
            </SectionCard>

            <SectionCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SectionHeader>
                <SectionTitle>최근 진료 기록</SectionTitle>
              </SectionHeader>

              {loading ? (
                <LoadingContainer>
                  <LoadingSpinner />
                  <LoadingText>진료 기록을 불러오는 중...</LoadingText>
                </LoadingContainer>
              ) : recentRecords.length > 0 ? (
                <RecordsList>
                  {recentRecords.map((record) => (
                    <RecordItem key={record.id}>
                      <RecordDate>{formatDate(record.date)}</RecordDate>
                      <RecordInfo>
                        <PatientName>{record.patient.name}</PatientName>
                        <DiagnosisText>{record.diagnosis}</DiagnosisText>
                      </RecordInfo>
                      <ViewButton>
                        <i className="fas fa-eye"></i>
                      </ViewButton>
                    </RecordItem>
                  ))}
                </RecordsList>
              ) : (
                <EmptyState>
                  <EmptyIcon>
                    <i className="far fa-clipboard"></i>
                  </EmptyIcon>
                  <EmptyText>등록된 진료 기록이 없습니다.</EmptyText>
                </EmptyState>
              )}

              <ViewAllLink to="/doctor/records">
                모든 기록 보기 <i className="fas fa-chevron-right"></i>
              </ViewAllLink>
            </SectionCard>
          </LeftSection>

          <RightSection>
            <SectionCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SectionHeader>
                <SectionTitle>예약 요청</SectionTitle>
              </SectionHeader>

              {loading ? (
                <LoadingContainer>
                  <LoadingSpinner />
                  <LoadingText>예약 요청을 불러오는 중...</LoadingText>
                </LoadingContainer>
              ) : pendingAppointments.length > 0 ? (
                <PendingList>
                  {pendingAppointments.map((appointment) => (
                    <PendingItem key={appointment.id}>
                      <PendingInfo>
                        <PendingDate>
                          {formatDate(appointment.date)} {formatTime(appointment.time)}
                        </PendingDate>
                        <PatientName>{appointment.patient.name}</PatientName>
                        <PendingReason>{appointment.reason}</PendingReason>
                      </PendingInfo>
                      <PendingActions>
                        <ActionButton color="success">
                          <i className="fas fa-check"></i>
                          승인
                        </ActionButton>
                        <ActionButton color="danger">
                          <i className="fas fa-times"></i>
                          거절
                        </ActionButton>
                      </PendingActions>
                    </PendingItem>
                  ))}
                </PendingList>
              ) : (
                <EmptyState>
                  <EmptyIcon>
                    <i className="far fa-bell"></i>
                  </EmptyIcon>
                  <EmptyText>대기 중인 예약 요청이 없습니다.</EmptyText>
                </EmptyState>
              )}

              <ViewAllLink to="/doctor/pending-appointments">
                모든 요청 보기 <i className="fas fa-chevron-right"></i>
              </ViewAllLink>
            </SectionCard>

            <SectionCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <SectionHeader>
                <SectionTitle>빠른 링크</SectionTitle>
              </SectionHeader>

              <QuickLinksGrid>
                <QuickLinkItem to="/doctor/appointments">
                  <QuickLinkIcon color="primary">
                    <i className="far fa-calendar-alt"></i>
                  </QuickLinkIcon>
                  <QuickLinkText>일정 관리</QuickLinkText>
                </QuickLinkItem>
                
                <QuickLinkItem to="/doctor/patients">
                  <QuickLinkIcon color="secondary">
                    <i className="fas fa-user-friends"></i>
                  </QuickLinkIcon>
                  <QuickLinkText>환자 관리</QuickLinkText>
                </QuickLinkItem>
                
                <QuickLinkItem to="/doctor/records">
                  <QuickLinkIcon color="info">
                    <i className="fas fa-clipboard-list"></i>
                  </QuickLinkIcon>
                  <QuickLinkText>진료 기록</QuickLinkText>
                </QuickLinkItem>
                
                <QuickLinkItem to="/doctor/prescriptions">
                  <QuickLinkIcon color="warning">
                    <i className="fas fa-prescription-bottle-alt"></i>
                  </QuickLinkIcon>
                  <QuickLinkText>처방전</QuickLinkText>
                </QuickLinkItem>
                
                <QuickLinkItem to="/doctor/statistics">
                  <QuickLinkIcon color="success">
                    <i className="fas fa-chart-line"></i>
                  </QuickLinkIcon>
                  <QuickLinkText>통계</QuickLinkText>
                </QuickLinkItem>
                
                <QuickLinkItem to="/doctor/settings">
                  <QuickLinkIcon color="dark">
                    <i className="fas fa-cog"></i>
                  </QuickLinkIcon>
                  <QuickLinkText>설정</QuickLinkText>
                </QuickLinkItem>
              </QuickLinksGrid>
            </SectionCard>
          </RightSection>
        </DashboardContent>
      </DashboardContainer>
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

const DashboardContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  background-color: ${props => props.theme.colors.gray[100]};
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: var(--spacing-md);
  }
`;

const DashboardTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
`;

const DoctorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const DoctorAvatar = styled.div`
  width: 48px;
  height: 48px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  i {
    font-size: 24px;
  }
`;

const DoctorName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
`;

const DoctorSpecialty = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
`;

const DashboardContent = styled.div`
  display: flex;
  gap: var(--spacing-lg);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
  }
`;

const LeftSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const SectionCard = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
`;

const SectionDate = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.gray[600]};
`;

const AppointmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const AppointmentItem = styled.div`
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: var(--color-gray-50);
  border-left: 4px solid var(--primary-color);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
`;

const AppointmentTime = styled.div`
  width: 70px;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--primary-color);
`;

const AppointmentInfo = styled.div`
  flex: 1;
`;

const PatientName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-xs);
`;

const PatientDetail = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: var(--spacing-xs);
`;

const AppointmentReason = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[700]};
`;

const AppointmentActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
    margin-top: var(--spacing-sm);
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
      return 'var(--color-gray-600)';
    case 'success':
      return 'var(--success-color)';
    case 'danger':
      return 'var(--error-color)';
    case 'warning':
      return 'var(--color-accent-3)';
    case 'info':
      return 'var(--color-accent-1)';
    case 'dark':
      return 'var(--color-gray-800)';
    default:
      return 'var(--primary-color)';
  }
};

const ActionButton = styled.button<ActionButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: transparent;
  color: ${props => getButtonColor(props.color)};
  border: 1px solid ${props => getButtonColor(props.color)};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: ${props => getButtonColor(props.color)};
    color: white;
  }
  
  i {
    font-size: ${props => props.theme.typography.fontSize.md};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex: 1;
    justify-content: center;
  }
`;

const RecordsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const RecordItem = styled.div`
  display: flex;
  align-items: center;
  padding: var(--spacing-sm);
  border-radius: ${props => props.theme.borderRadius.md};
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: var(--color-gray-50);
  }
`;

const RecordDate = styled.div`
  width: 100px;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 80px;
    font-size: ${props => props.theme.typography.fontSize.xs};
  }
`;

const RecordInfo = styled.div`
  flex: 1;
`;

const DiagnosisText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[700]};
`;

const ViewButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme.colors.gray[500]};
  border: none;
  padding: var(--spacing-xs);
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    color: var(--primary-color);
    background-color: ${props => props.theme.colors.gray[100]};
  }
  
  i {
    font-size: ${props => props.theme.typography.fontSize.md};
  }
`;

const PendingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const PendingItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: var(--color-gray-50);
  border-left: 4px solid var(--color-accent-3);
`;

const PendingInfo = styled.div`
  margin-bottom: var(--spacing-sm);
`;

const PendingDate = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: var(--spacing-xs);
`;

const PendingReason = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[700]};
  margin-top: var(--spacing-xs);
`;

const PendingActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const ViewAllLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  color: var(--primary-color);
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-decoration: none;
  border-top: 1px solid ${props => props.theme.colors.gray[200]};
  
  &:hover {
    text-decoration: underline;
  }
  
  i {
    font-size: 12px;
  }
`;

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

interface QuickLinkIconProps {
  color: string;
}

const QuickLinkItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: var(--color-gray-50);
  text-decoration: none;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const QuickLinkIcon = styled.div<QuickLinkIconProps>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${props => getButtonColor(props.color)};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-sm);
  
  i {
    font-size: 24px;
  }
`;

const QuickLinkText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: var(--text-color);
  text-align: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
`;

const LoadingSpinner = styled.div`
  width: 30px;
  height: 30px;
  border: 3px solid rgba(242, 151, 179, 0.3);
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
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.gray[600]};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
`;

const EmptyIcon = styled.div`
  font-size: 36px;
  color: ${props => props.theme.colors.gray[400]};
  margin-bottom: var(--spacing-md);
  
  i {
    opacity: 0.6;
  }
`;

const EmptyText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.gray[600]};
  text-align: center;
`;

export default DashboardPage; 