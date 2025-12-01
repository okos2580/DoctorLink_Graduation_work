import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { verifyAdmin, adminLogout, getDashboardStats } from '../services/adminService';

// 통계 데이터 타입
interface StatsData {
  totalUsers: number;
  totalReservations: number;
  pendingReservations: number;
  todayReservations: number;
  totalInquiries: number;
  unreadInquiries: number;
  totalHospitals: number;
  activeHospitals: number;
}

interface DashboardStats {
  totalUsers: number;
  totalReservations: number;
  totalHospitals: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeUsers: number;
  completedReservations: number;
  cancelledReservations: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

interface RevenueData {
  month: string;
  revenue: number;
  reservations: number;
}

interface PopularHospital {
  id: string;
  name: string;
  reservationCount: number;
  rating: number;
  department: string;
}

interface UserActivity {
  date: string;
  newUsers: number;
  activeUsers: number;
  reservations: number;
}

const AdminStatsPage: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
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
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedChart, setSelectedChart] = useState<'revenue' | 'users' | 'reservations'>('revenue');


  const navigate = useNavigate();

  const checkAdminAuth = useCallback(async () => {
    try {
      const isValid = await verifyAdmin();
      if (!isValid) {
        navigate('/admin/login');
        return;
      }
      await loadStats();
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

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate('/admin/login');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      navigate('/admin/login');
    }
  };

  const loadStats = async () => {
    try {
      console.log('통계 데이터 로딩 중...');
      const statsData = await getDashboardStats();
      
      console.log('API에서 받은 통계 데이터:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('통계 데이터 로드 중 오류:', error);
      // 기본값 유지
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const exportReport = async (type: 'excel' | 'pdf') => {
    try {
      // 실제 환경에서는 리포트 생성 API 호출
      alert(`${type.toUpperCase()} 리포트가 생성되었습니다.`);
    } catch (error) {
      console.error('리포트 생성 중 오류:', error);
      alert('리포트 생성에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <LoadingContainer>로딩 중...</LoadingContainer>;
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>통계 및 리포트</Title>
          <Subtitle>시스템 성과 분석 및 리포트</Subtitle>
        </HeaderLeft>
        <HeaderRight>
          <ExportButtons>
            <ExportButton onClick={() => exportReport('excel')}>
              Excel 내보내기
            </ExportButton>
            <ExportButton onClick={() => exportReport('pdf')}>
              PDF 내보내기
            </ExportButton>
          </ExportButtons>
          <LogoutButton onClick={handleLogout}>
            로그아웃
          </LogoutButton>
        </HeaderRight>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon>👥</StatIcon>
          <StatContent>
            <StatNumber>{formatNumber(stats.totalUsers)}</StatNumber>
            <StatLabel>총 사용자</StatLabel>
            <StatDetail>시스템에 등록된 모든 사용자</StatDetail>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon>📅</StatIcon>
          <StatContent>
            <StatNumber>{formatNumber(stats.totalReservations)}</StatNumber>
            <StatLabel>총 예약</StatLabel>
            <StatDetail>
              대기: {formatNumber(stats.pendingReservations)} | 
              오늘: {formatNumber(stats.todayReservations)}
            </StatDetail>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon>🏥</StatIcon>
          <StatContent>
            <StatNumber>{formatNumber(stats.totalHospitals)}</StatNumber>
            <StatLabel>총 병원</StatLabel>
            <StatDetail>활성: {formatNumber(stats.activeHospitals)} 병원</StatDetail>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon>❓</StatIcon>
          <StatContent>
            <StatNumber>{formatNumber(stats.totalInquiries)}</StatNumber>
            <StatLabel>고객 문의</StatLabel>
            <StatDetail>미처리: {formatNumber(stats.unreadInquiries)}건</StatDetail>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <ChartsSection>
        <ChartContainer>
          <ChartHeader>
            <ChartTitle>성과 차트</ChartTitle>
            <ChartControls>
              <PeriodSelect value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as any)}>
                <option value="week">주간</option>
                <option value="month">월간</option>
                <option value="quarter">분기</option>
                <option value="year">연간</option>
              </PeriodSelect>
              <ChartTypeSelect value={selectedChart} onChange={(e) => setSelectedChart(e.target.value as any)}>
                <option value="revenue">예약</option>
                <option value="users">사용자</option>
                <option value="hospitals">병원</option>
              </ChartTypeSelect>
            </ChartControls>
          </ChartHeader>
          <ChartArea>
            <ChartPlaceholder>
              <ChartIcon>📊</ChartIcon>
              <ChartText>
                {selectedChart === 'revenue' ? '예약 현황' : 
                 selectedChart === 'users' ? '사용자 통계' : '병원 현황'} 차트
              </ChartText>
              <ChartSubtext>
                실시간 데이터 기반 시각화
              </ChartSubtext>
            </ChartPlaceholder>
          </ChartArea>
        </ChartContainer>

        <PopularHospitalsContainer>
          <SectionTitle>실시간 통계</SectionTitle>
          <HospitalList>
            <HospitalItem>
              <HospitalRank>📈</HospitalRank>
              <HospitalInfo>
                <HospitalName>전체 사용자</HospitalName>
                <HospitalDepartment>등록된 사용자 수</HospitalDepartment>
              </HospitalInfo>
              <HospitalStats>
                <HospitalReservations>{formatNumber(stats.totalUsers)}명</HospitalReservations>
                <HospitalRating>👤</HospitalRating>
              </HospitalStats>
            </HospitalItem>

            <HospitalItem>
              <HospitalRank>🏥</HospitalRank>
              <HospitalInfo>
                <HospitalName>등록 병원</HospitalName>
                <HospitalDepartment>활성 병원 현황</HospitalDepartment>
              </HospitalInfo>
              <HospitalStats>
                <HospitalReservations>{formatNumber(stats.activeHospitals)}개</HospitalReservations>
                <HospitalRating>🏢</HospitalRating>
              </HospitalStats>
            </HospitalItem>

            <HospitalItem>
              <HospitalRank>📅</HospitalRank>
              <HospitalInfo>
                <HospitalName>오늘 예약</HospitalName>
                <HospitalDepartment>금일 예약 건수</HospitalDepartment>
              </HospitalInfo>
              <HospitalStats>
                <HospitalReservations>{formatNumber(stats.todayReservations)}건</HospitalReservations>
                <HospitalRating>⏰</HospitalRating>
              </HospitalStats>
            </HospitalItem>

            <HospitalItem>
              <HospitalRank>❓</HospitalRank>
              <HospitalInfo>
                <HospitalName>미처리 문의</HospitalName>
                <HospitalDepartment>처리 대기 문의</HospitalDepartment>
              </HospitalInfo>
              <HospitalStats>
                <HospitalReservations>{formatNumber(stats.unreadInquiries)}건</HospitalReservations>
                <HospitalRating>🔔</HospitalRating>
              </HospitalStats>
            </HospitalItem>
          </HospitalList>
        </PopularHospitalsContainer>
      </ChartsSection>

      <ReportsSection>
        <SectionTitle>상세 리포트</SectionTitle>
        <ReportGrid>
          <ReportCard>
            <ReportIcon>📈</ReportIcon>
            <ReportContent>
              <ReportTitle>예약 분석</ReportTitle>
              <ReportDescription>전체 예약 현황 및 대기 건수 분석</ReportDescription>
              <ReportValue>{formatNumber(stats.totalReservations)} 총 예약</ReportValue>
            </ReportContent>
          </ReportCard>

          <ReportCard>
            <ReportIcon>👤</ReportIcon>
            <ReportContent>
              <ReportTitle>사용자 분석</ReportTitle>
              <ReportDescription>등록 사용자 수 및 활동 분석</ReportDescription>
              <ReportValue>{formatNumber(stats.totalUsers)} 등록자</ReportValue>
            </ReportContent>
          </ReportCard>

          <ReportCard>
            <ReportIcon>🏥</ReportIcon>
            <ReportContent>
              <ReportTitle>병원 성과</ReportTitle>
              <ReportDescription>등록 병원 수 및 활성 병원 현황</ReportDescription>
              <ReportValue>{formatNumber(stats.activeHospitals)} 활성 병원</ReportValue>
            </ReportContent>
          </ReportCard>

          <ReportCard>
            <ReportIcon>📊</ReportIcon>
            <ReportContent>
              <ReportTitle>고객 서비스</ReportTitle>
              <ReportDescription>고객 문의 처리 현황 분석</ReportDescription>
              <ReportValue>
                {stats.totalInquiries > 0 
                  ? Math.round(((stats.totalInquiries - stats.unreadInquiries) / stats.totalInquiries) * 100)
                  : 0}% 처리율
              </ReportValue>
            </ReportContent>
          </ReportCard>
        </ReportGrid>
      </ReportsSection>

      <ActivitySection>
        <SectionTitle>시스템 현황</SectionTitle>
        <ActivityTable>
          <ActivityHeader>
            <ActivityHeaderCell>항목</ActivityHeaderCell>
            <ActivityHeaderCell>현재 상태</ActivityHeaderCell>
            <ActivityHeaderCell>대기/처리</ActivityHeaderCell>
            <ActivityHeaderCell>비율</ActivityHeaderCell>
          </ActivityHeader>
          <ActivityBody>
            <ActivityRow>
              <ActivityCell>예약 관리</ActivityCell>
              <ActivityCell>{formatNumber(stats.totalReservations)} 총 예약</ActivityCell>
              <ActivityCell>{formatNumber(stats.pendingReservations)} 대기중</ActivityCell>
              <ActivityCell>
                {stats.totalReservations > 0 
                  ? Math.round((stats.pendingReservations / stats.totalReservations) * 100)
                  : 0}% 대기율
              </ActivityCell>
            </ActivityRow>
            <ActivityRow>
              <ActivityCell>병원 관리</ActivityCell>
              <ActivityCell>{formatNumber(stats.totalHospitals)} 총 병원</ActivityCell>
              <ActivityCell>{formatNumber(stats.activeHospitals)} 활성</ActivityCell>
              <ActivityCell>
                {stats.totalHospitals > 0 
                  ? Math.round((stats.activeHospitals / stats.totalHospitals) * 100)
                  : 0}% 활성율
              </ActivityCell>
            </ActivityRow>
            <ActivityRow>
              <ActivityCell>고객 문의</ActivityCell>
              <ActivityCell>{formatNumber(stats.totalInquiries)} 총 문의</ActivityCell>
              <ActivityCell>{formatNumber(stats.unreadInquiries)} 미처리</ActivityCell>
              <ActivityCell>
                {stats.totalInquiries > 0 
                  ? Math.round(((stats.totalInquiries - stats.unreadInquiries) / stats.totalInquiries) * 100)
                  : 100}% 처리율
              </ActivityCell>
            </ActivityRow>
            <ActivityRow>
              <ActivityCell>오늘 활동</ActivityCell>
              <ActivityCell>{formatNumber(stats.todayReservations)} 오늘 예약</ActivityCell>
              <ActivityCell>실시간 업데이트</ActivityCell>
              <ActivityCell>진행중</ActivityCell>
            </ActivityRow>
          </ActivityBody>
        </ActivityTable>
      </ActivitySection>
    </Container>
  );
};

// 스타일 컴포넌트들
const Container = styled.div`
  padding: var(--spacing-lg);
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: var(--spacing-xs);
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
`;

const ExportButtons = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const ExportButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: #10B981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #059669;
  }
`;

const LogoutButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e3819d;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
`;

const StatCard = styled.div`
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const StatIcon = styled.div`
  font-size: 48px;
  opacity: 0.8;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: var(--spacing-xs);
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: var(--spacing-xs);
`;

const StatDetail = styled.div`
  font-size: 12px;
  color: #999;
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled.div`
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid #f0f0f0;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const ChartControls = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const PeriodSelect = styled.select`
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ChartTypeSelect = styled.select`
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ChartArea = styled.div`
  height: 300px;
  padding: var(--spacing-lg);
`;

const ChartPlaceholder = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 10px;
  border: 2px dashed #ddd;
`;

const ChartIcon = styled.div`
  font-size: 48px;
  margin-bottom: var(--spacing-md);
`;

const ChartText = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #666;
  margin-bottom: var(--spacing-xs);
`;

const ChartSubtext = styled.div`
  font-size: 14px;
  color: #999;
`;

const PopularHospitalsContainer = styled.div`
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: var(--spacing-lg);
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: var(--spacing-md);
`;

const HospitalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const HospitalItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const HospitalRank = styled.div`
  width: 24px;
  height: 24px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const HospitalInfo = styled.div`
  flex: 1;
`;

const HospitalName = styled.div`
  font-weight: 500;
  margin-bottom: 2px;
`;

const HospitalDepartment = styled.div`
  font-size: 12px;
  color: #666;
`;

const HospitalStats = styled.div`
  text-align: right;
`;

const HospitalReservations = styled.div`
  font-weight: 500;
  margin-bottom: 2px;
`;

const HospitalRating = styled.div`
  font-size: 12px;
  color: #666;
`;

const ReportsSection = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
`;

const ReportCard = styled.div`
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ReportIcon = styled.div`
  font-size: 36px;
  opacity: 0.8;
`;

const ReportContent = styled.div`
  flex: 1;
`;

const ReportTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: var(--spacing-xs);
`;

const ReportDescription = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: var(--spacing-xs);
`;

const ReportValue = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--primary-color);
`;

const ActivitySection = styled.div``;

const ActivityTable = styled.div`
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ActivityHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background-color: #f8f9fa;
  padding: var(--spacing-md);
`;

const ActivityHeaderCell = styled.div`
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const ActivityBody = styled.div``;

const ActivityRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: var(--spacing-md);
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8f9fa;
  }
`;

const ActivityCell = styled.div`
  font-size: 14px;
  color: #333;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: #EF4444;
`;

export default AdminStatsPage; 