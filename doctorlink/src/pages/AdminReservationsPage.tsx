import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  getReservations, 
  updateReservationStatus, 
  getReservationDetail,
  deleteReservation,
  Reservation as ReservationData, 
  ReservationStatus,
  ReservationFilter 
} from '../services/reservationService';
import { verifyAdmin } from '../services/adminService';

interface Reservation {
  id: string;
  patientName: string;
  patientPhone: string;
  hospitalName: string;
  doctorName: string;
  department: string;
  reservationDate: string;
  reservationTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  symptoms: string;
  createdAt: string;
  notes?: string;
}

const AdminReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<ReservationData[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<ReservationStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<ReservationData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'view'>('view');
  const [actionNote, setActionNote] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ action: string; id: string; status?: ReservationStatus } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const checkAdminAuth = useCallback(async () => {
    try {
      const isValid = await verifyAdmin();
      if (!isValid) {
        navigate('/admin/login');
        return;
      }
      await loadReservations();
    } catch (error) {
      console.error('관리자 인증 확인 중 오류:', error);
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const filterReservations = useCallback(() => {
    let filtered = reservations;
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === selectedStatus);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(reservation =>
        reservation.patientName.toLowerCase().includes(term) ||
        reservation.hospitalName.toLowerCase().includes(term) ||
        reservation.doctorName.toLowerCase().includes(term) ||
        reservation.department.toLowerCase().includes(term)
      );
    }
    
    setFilteredReservations(filtered);
  }, [reservations, selectedStatus, searchTerm]);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  useEffect(() => {
    filterReservations();
  }, [reservations, selectedStatus, searchTerm]);

  const loadReservations = async () => {
    try {
      setError('');
      const filter: ReservationFilter = {};
      if (selectedStatus !== 'all') {
        filter.status = selectedStatus as ReservationStatus;
      }
      if (searchTerm) {
        filter.searchTerm = searchTerm;
      }
      
      const data = await getReservations(filter);
      setReservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '예약 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleAction = async (action: string, reservationId: string, status?: ReservationStatus) => {
    setPendingAction({ action, id: reservationId, status });
    setIsConfirmModalOpen(true);
  };

  const handleView = async (reservationId: string) => {
    try {
      setError('');
      const reservation = await getReservationDetail(reservationId);
      setSelectedReservation(reservation);
      setActionType('view');
      setShowModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '예약 정보를 불러오는데 실패했습니다.');
    }
  };

  const executeAction = async () => {
    if (!pendingAction) return;

    try {
      setError('');
      
      switch (pendingAction.action) {
        case 'approve':
        case 'reject':
        case 'complete':
          if (pendingAction.status) {
            await updateReservationStatus(pendingAction.id, pendingAction.status);
          }
          break;
        case 'delete':
          await deleteReservation(pendingAction.id);
          break;
      }
      
      // 목록 새로고침
      await loadReservations();
      setIsConfirmModalOpen(false);
      setPendingAction(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '작업 처리 중 오류가 발생했습니다.');
    }
  };


  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { text: '대기중', color: '#ffc107', bgColor: '#fff3cd' },
      approved: { text: '승인됨', color: '#28a745', bgColor: '#d4edda' },
      rejected: { text: '거절됨', color: '#dc3545', bgColor: '#f8d7da' },
      completed: { text: '완료됨', color: '#6c757d', bgColor: '#e2e3e5' },
      cancelled: { text: '취소됨', color: '#fd7e14', bgColor: '#ffeaa7' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <StatusBadge color={config.color} bgColor={config.bgColor}>
        {config.text}
      </StatusBadge>
    );
  };

  const getStats = () => {
    return {
      total: reservations.length,
      pending: reservations.filter(r => r.status === 'pending').length,
      approved: reservations.filter(r => r.status === 'approved').length,
      rejected: reservations.filter(r => r.status === 'rejected').length,
      completed: reservations.filter(r => r.status === 'completed').length
    };
  };

  const stats = getStats();

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate('/admin/dashboard')}>
            ← 대시보드로
          </BackButton>
          <Title>📅 예약 관리</Title>
        </HeaderLeft>
        <HeaderRight>
          <RefreshButton onClick={loadReservations}>
            🔄 새로고침
          </RefreshButton>
        </HeaderRight>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.total}</StatNumber>
          <StatLabel>전체 예약</StatLabel>
        </StatCard>
        <StatCard urgent>
          <StatNumber>{stats.pending}</StatNumber>
          <StatLabel>승인 대기</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.approved}</StatNumber>
          <StatLabel>승인됨</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.completed}</StatNumber>
          <StatLabel>완료됨</StatLabel>
        </StatCard>
      </StatsGrid>

      <FilterSection>
        <FilterLeft>
          <SearchInput
            type="text"
            placeholder="환자명, 병원명, 의사명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FilterLeft>
        <FilterRight>
          <StatusFilter
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ReservationStatus | 'all')}
          >
            <option value="all">전체 상태</option>
            <option value="pending">승인 대기</option>
            <option value="approved">승인됨</option>
            <option value="rejected">거절됨</option>
            <option value="completed">완료됨</option>
            <option value="cancelled">취소됨</option>
          </StatusFilter>
        </FilterRight>
      </FilterSection>

      <ReservationTable>
        <TableHeader>
          <HeaderCell>예약번호</HeaderCell>
          <HeaderCell>환자정보</HeaderCell>
          <HeaderCell>병원/의사</HeaderCell>
          <HeaderCell>예약일시</HeaderCell>
          <HeaderCell>상태</HeaderCell>
          <HeaderCell>증상</HeaderCell>
          <HeaderCell>작업</HeaderCell>
        </TableHeader>
        <TableBody>
          {filteredReservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>
                <ReservationId>{reservation.id}</ReservationId>
                <CreatedDate>
                  {new Date(reservation.createdAt).toLocaleDateString()}
                </CreatedDate>
              </TableCell>
              <TableCell>
                <PatientName>{reservation.patientName}</PatientName>
                <PatientPhone>{reservation.patientPhone}</PatientPhone>
              </TableCell>
              <TableCell>
                <HospitalName>{reservation.hospitalName}</HospitalName>
                <DoctorInfo>{reservation.doctorName} ({reservation.department})</DoctorInfo>
              </TableCell>
              <TableCell>
                <ReservationDateTime>
                  {reservation.reservationDate}
                  <br />
                  {reservation.reservationTime}
                </ReservationDateTime>
              </TableCell>
              <TableCell>
                {getStatusBadge(reservation.status)}
              </TableCell>
              <TableCell>
                <Symptoms>{reservation.symptoms}</Symptoms>
              </TableCell>
              <TableCell>
                <ActionButtons>
                  <ActionButton
                    onClick={() => handleAction('view', reservation.id)}
                    variant="info"
                  >
                    상세
                  </ActionButton>
                  {reservation.status === 'pending' && (
                    <>
                      <ActionButton
                        onClick={() => handleAction('approve', reservation.id)}
                        variant="success"
                      >
                        승인
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleAction('reject', reservation.id)}
                        variant="danger"
                      >
                        거절
                      </ActionButton>
                    </>
                  )}
                </ActionButtons>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </ReservationTable>

      {filteredReservations.length === 0 && (
        <EmptyState>
          <EmptyIcon>📅</EmptyIcon>
          <EmptyText>조건에 맞는 예약이 없습니다.</EmptyText>
        </EmptyState>
      )}

      {/* 모달 */}
      {showModal && selectedReservation && (
        <Modal>
          <ModalOverlay onClick={() => setShowModal(false)} />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {actionType === 'view' ? '예약 상세정보' :
                 actionType === 'approve' ? '예약 승인' : '예약 거절'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <DetailGrid>
                <DetailItem>
                  <DetailLabel>예약번호</DetailLabel>
                  <DetailValue>{selectedReservation.id}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>환자명</DetailLabel>
                  <DetailValue>{selectedReservation.patientName}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>연락처</DetailLabel>
                  <DetailValue>{selectedReservation.patientPhone}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>병원</DetailLabel>
                  <DetailValue>{selectedReservation.hospitalName}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>의사</DetailLabel>
                  <DetailValue>{selectedReservation.doctorName}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>진료과</DetailLabel>
                  <DetailValue>{selectedReservation.department}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>예약일시</DetailLabel>
                  <DetailValue>
                    {selectedReservation.reservationDate} {selectedReservation.reservationTime}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>증상</DetailLabel>
                  <DetailValue>{selectedReservation.symptoms}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>현재 상태</DetailLabel>
                  <DetailValue>{getStatusBadge(selectedReservation.status)}</DetailValue>
                </DetailItem>
              </DetailGrid>

              {actionType !== 'view' && (
                <NoteSection>
                  <NoteLabel>
                    {actionType === 'approve' ? '승인 메모' : '거절 사유'}
                  </NoteLabel>
                  <NoteTextarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder={
                      actionType === 'approve' 
                        ? '승인 관련 메모를 입력하세요 (선택사항)'
                        : '거절 사유를 입력하세요'
                    }
                    required={actionType === 'reject'}
                  />
                </NoteSection>
              )}
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={() => setShowModal(false)}>
                취소
              </CancelButton>
              {actionType !== 'view' && (
                <ConfirmButton
                  onClick={executeAction}
                  variant={actionType === 'approve' ? 'success' : 'danger'}
                  disabled={actionType === 'reject' && !actionNote.trim()}
                >
                  {actionType === 'approve' ? '승인하기' : '거절하기'}
                </ConfirmButton>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* 확인 모달 */}
      {isConfirmModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <h3>작업 확인</h3>
              <CloseButton onClick={() => setIsConfirmModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <p>정말로 이 작업을 수행하시겠습니까?</p>
            </ModalBody>
            <ModalFooter>
              <ActionButton onClick={() => setIsConfirmModalOpen(false)} variant="danger">
                취소
              </ActionButton>
              <ActionButton onClick={executeAction} variant="success">
                확인
              </ActionButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

// 스타일 컴포넌트들
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

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const HeaderRight = styled.div``;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #5a6268;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const RefreshButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #0056b3;
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
  text-align: center;
  border-left: 4px solid ${props => props.urgent ? '#dc3545' : '#007bff'};
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const FilterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterLeft = styled.div`
  flex: 1;
`;

const FilterRight = styled.div``;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const StatusFilter = styled.select`
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  background: white;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ReservationTable = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 120px 150px 200px 120px 100px 150px 150px;
  background: #f8f9fa;
  padding: 15px 20px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e1e5e9;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    display: none;
  }
`;

const HeaderCell = styled.div`
  font-size: 14px;
`;

const TableBody = styled.div``;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 120px 150px 200px 120px 100px 150px 150px;
  padding: 20px;
  border-bottom: 1px solid #f1f3f4;
  align-items: center;

  &:hover {
    background: #f8f9fa;
  }

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 15px;
  }
`;

const TableCell = styled.div`
  font-size: 14px;
  color: #333;

  @media (max-width: 1200px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
    
    &:before {
      content: attr(data-label);
      font-weight: 600;
      color: #666;
      min-width: 100px;
    }
  }
`;

const ReservationId = styled.div`
  font-weight: 600;
  color: #007bff;
`;

const CreatedDate = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const PatientName = styled.div`
  font-weight: 600;
`;

const PatientPhone = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const HospitalName = styled.div`
  font-weight: 600;
`;

const DoctorInfo = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const ReservationDateTime = styled.div`
  font-size: 12px;
  text-align: center;
`;

const StatusBadge = styled.span<{ color: string; bgColor: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.color};
  background-color: ${props => props.bgColor};
`;

const Symptoms = styled.div`
  font-size: 12px;
  color: #666;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant: 'info' | 'success' | 'danger' }>`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 500;
  
  ${props => {
    switch (props.variant) {
      case 'info':
        return `
          background: #17a2b8;
          color: white;
          &:hover { background: #138496; }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover { background: #218838; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
    }
  }}
`;

const EmptyState = styled.div`
  background: white;
  padding: 60px 20px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const EmptyText = styled.div`
  font-size: 18px;
  color: #666;
`;

// 모달 스타일
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  z-index: 1001;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e1e5e9;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 30px;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div``;

const DetailLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 5px;
  text-transform: uppercase;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

const NoteSection = styled.div`
  margin-top: 20px;
`;

const NoteLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
`;

const NoteTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 30px;
  border-top: 1px solid #e1e5e9;
`;

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #5a6268;
  }
`;

const ConfirmButton = styled.button<{ variant: 'success' | 'danger' }>`
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: white;
  
  ${props => props.variant === 'success' ? `
    background: #28a745;
    &:hover:not(:disabled) { background: #218838; }
  ` : `
    background: #dc3545;
    &:hover:not(:disabled) { background: #c82333; }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default AdminReservationsPage; 