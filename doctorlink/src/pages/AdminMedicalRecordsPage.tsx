import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { verifyAdmin, adminLogout } from '../services/adminService';

// 진료 기록 타입
interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  hospitalName: string;
  department: string;
  visitDate: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  prescription: string;
  notes: string;
  followUpDate?: string;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}


const AdminMedicalRecordsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Mock 데이터
  const mockRecords: MedicalRecord[] = [
    {
      id: 'rec-001',
      patientId: 'pat-001',
      patientName: '김환자',
      patientPhone: '010-1234-5678',
      doctorId: 'doc-001',
      doctorName: '이의사',
      hospitalName: '서울대학교병원',
      department: '내과',
      visitDate: '2024-01-15',
      diagnosis: '급성 상기도 감염',
      symptoms: '발열, 기침, 인후통',
      treatment: '약물 치료, 충분한 휴식',
      prescription: '해열제, 기침약, 항생제',
      notes: '3일 후 재방문 권장',
      followUpDate: '2024-01-18',
      status: 'completed',
      createdAt: '2024-01-15T14:30:00Z',
      updatedAt: '2024-01-15T14:30:00Z'
    },
    {
      id: 'rec-002',
      patientId: 'pat-002',
      patientName: '박환자',
      patientPhone: '010-2345-6789',
      doctorId: 'doc-002',
      doctorName: '김의사',
      hospitalName: '연세대학교병원',
      department: '정형외과',
      visitDate: '2024-01-16',
      diagnosis: '무릎 관절염',
      symptoms: '무릎 통증, 부종',
      treatment: '물리치료, 약물치료',
      prescription: '소염진통제, 연골보호제',
      notes: '정기적인 운동 필요',
      followUpDate: '2024-02-16',
      status: 'completed',
      createdAt: '2024-01-16T10:15:00Z',
      updatedAt: '2024-01-16T10:15:00Z'
    },
    {
      id: 'rec-003',
      patientId: 'pat-003',
      patientName: '최환자',
      patientPhone: '010-3456-7890',
      doctorId: 'doc-003',
      doctorName: '정의사',
      hospitalName: '고려대학교병원',
      department: '피부과',
      visitDate: '2024-01-17',
      diagnosis: '아토피 피부염',
      symptoms: '피부 가려움, 발진',
      treatment: '스테로이드 연고, 보습제',
      prescription: '스테로이드 크림, 항히스타민제',
      notes: '알레르기 유발 요소 피하기',
      status: 'pending',
      createdAt: '2024-01-17T16:20:00Z',
      updatedAt: '2024-01-17T16:20:00Z'
    }
  ];

  const checkAdminAuth = useCallback(async () => {
    try {
      const isValid = await verifyAdmin();
      if (!isValid) {
        navigate('/admin/login');
        return;
      }
      await loadRecords();
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

  const loadRecords = useCallback(async () => {
    try {
      // 실제 환경에서는 API 호출
      setTimeout(() => {
        setRecords(mockRecords);
        setFilteredRecords(mockRecords);
      }, 500);
    } catch (error) {
      console.error('진료 기록 로드 중 오류:', error);
    }
  }, []);

  // 필터링 로직
  useEffect(() => {
    let filtered = records;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(record => record.status === selectedStatus);
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(record => record.department === selectedDepartment);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.patientName.toLowerCase().includes(term) ||
        record.doctorName.toLowerCase().includes(term) ||
        record.diagnosis.toLowerCase().includes(term) ||
        record.hospitalName.toLowerCase().includes(term)
      );
    }

    setFilteredRecords(filtered);
  }, [records, selectedStatus, selectedDepartment, searchTerm]);

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleDeleteRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedRecord) {
      try {
        // 실제 환경에서는 API 호출
        setRecords(prev => prev.filter(r => r.id !== selectedRecord.id));
        setShowDeleteConfirm(false);
        setSelectedRecord(null);
        alert('진료 기록이 삭제되었습니다.');
      } catch (error) {
        console.error('진료 기록 삭제 중 오류:', error);
        alert('진료 기록 삭제에 실패했습니다.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: '완료', color: '#10B981' },
      pending: { label: '대기', color: '#F59E0B' },
      cancelled: { label: '취소', color: '#EF4444' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <StatusBadge color={config.color}>
        {config.label}
      </StatusBadge>
    );
  };

  const getStats = () => {
    const total = records.length;
    const completed = records.filter(r => r.status === 'completed').length;
    const pending = records.filter(r => r.status === 'pending').length;
    const cancelled = records.filter(r => r.status === 'cancelled').length;

    return { total, completed, pending, cancelled };
  };

  const stats = getStats();

  if (isLoading) {
    return <LoadingContainer>로딩 중...</LoadingContainer>;
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>진료 기록 관리</Title>
          <Subtitle>환자 진료 기록 조회 및 관리</Subtitle>
        </HeaderLeft>
        <HeaderRight>
          <LogoutButton onClick={() => adminLogout().then(() => navigate('/admin/login'))}>
            로그아웃
          </LogoutButton>
        </HeaderRight>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.total}</StatNumber>
          <StatLabel>총 기록 수</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.completed}</StatNumber>
          <StatLabel>완료된 기록</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.pending}</StatNumber>
          <StatLabel>대기 중인 기록</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.cancelled}</StatNumber>
          <StatLabel>취소된 기록</StatLabel>
        </StatCard>
      </StatsGrid>

      <FilterSection>
        <FilterGroup>
          <FilterLabel>상태</FilterLabel>
          <FilterSelect value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="all">전체</option>
            <option value="completed">완료</option>
            <option value="pending">대기</option>
            <option value="cancelled">취소</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>진료과</FilterLabel>
          <FilterSelect value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="all">전체</option>
            <option value="내과">내과</option>
            <option value="외과">외과</option>
            <option value="정형외과">정형외과</option>
            <option value="피부과">피부과</option>
            <option value="안과">안과</option>
            <option value="이비인후과">이비인후과</option>
          </FilterSelect>
        </FilterGroup>

        <SearchGroup>
          <SearchInput
            type="text"
            placeholder="환자명, 의사명, 진단명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchGroup>
      </FilterSection>

      <RecordsTable>
        <TableHeader>
          <HeaderCell>환자명</HeaderCell>
          <HeaderCell>의사명</HeaderCell>
          <HeaderCell>병원</HeaderCell>
          <HeaderCell>진료과</HeaderCell>
          <HeaderCell>진료일</HeaderCell>
          <HeaderCell>진단명</HeaderCell>
          <HeaderCell>상태</HeaderCell>
          <HeaderCell>작업</HeaderCell>
        </TableHeader>
        <TableBody>
          {filteredRecords.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.patientName}</TableCell>
              <TableCell>{record.doctorName}</TableCell>
              <TableCell>{record.hospitalName}</TableCell>
              <TableCell>{record.department}</TableCell>
              <TableCell>{new Date(record.visitDate).toLocaleDateString()}</TableCell>
              <TableCell>{record.diagnosis}</TableCell>
              <TableCell>{getStatusBadge(record.status)}</TableCell>
              <TableCell>
                <ActionButtons>
                  <ActionButton onClick={() => handleViewRecord(record)}>
                    상세보기
                  </ActionButton>
                  <DeleteButton onClick={() => handleDeleteRecord(record)}>
                    삭제
                  </DeleteButton>
                </ActionButtons>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </RecordsTable>

      {filteredRecords.length === 0 && (
        <EmptyState>
          <EmptyIcon>📋</EmptyIcon>
          <EmptyText>조건에 맞는 진료 기록이 없습니다.</EmptyText>
        </EmptyState>
      )}

      {/* 상세보기 모달 */}
      {showModal && selectedRecord && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>진료 기록 상세</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>&times;</CloseButton>
            </ModalHeader>
            <ModalBody>
              <DetailSection>
                <DetailLabel>환자 정보</DetailLabel>
                <DetailValue>{selectedRecord.patientName} ({selectedRecord.patientPhone})</DetailValue>
              </DetailSection>
              <DetailSection>
                <DetailLabel>담당의</DetailLabel>
                <DetailValue>{selectedRecord.doctorName} - {selectedRecord.department}</DetailValue>
              </DetailSection>
              <DetailSection>
                <DetailLabel>병원</DetailLabel>
                <DetailValue>{selectedRecord.hospitalName}</DetailValue>
              </DetailSection>
              <DetailSection>
                <DetailLabel>진료일</DetailLabel>
                <DetailValue>{new Date(selectedRecord.visitDate).toLocaleDateString()}</DetailValue>
              </DetailSection>
              <DetailSection>
                <DetailLabel>증상</DetailLabel>
                <DetailValue>{selectedRecord.symptoms}</DetailValue>
              </DetailSection>
              <DetailSection>
                <DetailLabel>진단명</DetailLabel>
                <DetailValue>{selectedRecord.diagnosis}</DetailValue>
              </DetailSection>
              <DetailSection>
                <DetailLabel>치료 내용</DetailLabel>
                <DetailValue>{selectedRecord.treatment}</DetailValue>
              </DetailSection>
              <DetailSection>
                <DetailLabel>처방</DetailLabel>
                <DetailValue>{selectedRecord.prescription}</DetailValue>
              </DetailSection>
              <DetailSection>
                <DetailLabel>특이사항</DetailLabel>
                <DetailValue>{selectedRecord.notes}</DetailValue>
              </DetailSection>
              {selectedRecord.followUpDate && (
                <DetailSection>
                  <DetailLabel>재방문 예정일</DetailLabel>
                  <DetailValue>{new Date(selectedRecord.followUpDate).toLocaleDateString()}</DetailValue>
                </DetailSection>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && selectedRecord && (
        <ModalOverlay onClick={() => setShowDeleteConfirm(false)}>
          <ConfirmModal onClick={(e) => e.stopPropagation()}>
            <ConfirmTitle>진료 기록 삭제</ConfirmTitle>
            <ConfirmMessage>
              {selectedRecord.patientName}님의 진료 기록을 삭제하시겠습니까?<br/>
              삭제된 기록은 복구할 수 없습니다.
            </ConfirmMessage>
            <ConfirmButtons>
              <CancelButton onClick={() => setShowDeleteConfirm(false)}>
                취소
              </CancelButton>
              <ConfirmButton onClick={confirmDelete}>
                삭제
              </ConfirmButton>
            </ConfirmButtons>
          </ConfirmModal>
        </ModalOverlay>
      )}
    </Container>
  );
};

// 스타일 컴포넌트들
const Container = styled.div`
  padding: var(--spacing-lg);
  background-color: ${props => props.theme.colors.gray[100]};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-xs);
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.gray[600]};
`;

const HeaderRight = styled.div``;

const LogoutButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};

  &:hover {
    background-color: #e3819d;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
`;

const StatCard = styled.div`
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--primary-color);
  margin-bottom: var(--spacing-xs);
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
`;

const FilterSection = styled.div`
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: var(--spacing-md);
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const FilterLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[700]};
`;

const FilterSelect = styled.select`
  padding: var(--spacing-sm);
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SearchGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const SearchInput = styled.input`
  padding: var(--spacing-sm);
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const RecordsTable = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr 1fr 1fr 1.5fr 0.8fr 1fr;
  background-color: ${props => props.theme.colors.gray[100]};
  padding: var(--spacing-md);
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[700]};
`;

const HeaderCell = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const TableBody = styled.div``;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr 1fr 1fr 1.5fr 0.8fr 1fr;
  padding: var(--spacing-md);
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
  }
`;

const TableCell = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: var(--text-color);
  display: flex;
  align-items: center;
`;

const StatusBadge = styled.span<{ color: string }>`
  background-color: ${props => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const ActionButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};

  &:hover {
    background-color: #e3819d;
  }
`;

const DeleteButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: #EF4444;
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};

  &:hover {
    background-color: #DC2626;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: var(--spacing-md);
`;

const EmptyText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.gray[600]};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.theme.colors.gray[500]};
`;

const ModalBody = styled.div`
  padding: var(--spacing-lg);
`;

const DetailSection = styled.div`
  margin-bottom: var(--spacing-md);
`;

const DetailLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[700]};
  margin-bottom: var(--spacing-xs);
`;

const DetailValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: var(--text-color);
  line-height: 1.5;
`;

const ConfirmModal = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: var(--spacing-xl);
  width: 90%;
  max-width: 400px;
  text-align: center;
`;

const ConfirmTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: var(--spacing-md);
`;

const ConfirmMessage = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: var(--spacing-lg);
  line-height: 1.5;
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
`;

const CancelButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: white;
  color: ${props => props.theme.colors.gray[600]};
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};

  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
  }
`;

const ConfirmButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: #EF4444;
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};

  &:hover {
    background-color: #DC2626;
  }
`;

export default AdminMedicalRecordsPage; 