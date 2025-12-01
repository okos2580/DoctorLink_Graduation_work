import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { verifyAdmin, adminLogout, getHospitals } from '../services/adminService';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  type: string;
  departments: string[];
  doctors: Doctor[];
  operatingHours: OperatingHours;
  status: 'active' | 'inactive' | 'pending';
  registrationDate: string;
  lastUpdated: string;
  description: string;
  facilities: string[];
  rating: number;
  reviewCount: number;
}

interface Doctor {
  id: string;
  name: string;
  department: string;
  specialization: string;
  experience: number;
  education: string;
  status: 'active' | 'inactive';
}

interface OperatingHours {
  weekdays: string;
  saturday: string;
  sunday: string;
  holidays: string;
}

const AdminHospitalsPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'add'>('view');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAdminAuth = useCallback(async () => {
    try {
      const isValid = await verifyAdmin();
      if (!isValid) {
        navigate('/admin/login');
        return;
      }
      await loadHospitals();
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

  useEffect(() => {
    filterHospitals();
  }, [hospitals, selectedStatus, selectedType, searchTerm]);

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate('/admin/login');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      navigate('/admin/login');
    }
  };

  const loadHospitals = async () => {
    try {
      console.log('병원 목록 로딩 중...');
      const hospitalData = await getHospitals({
        page: 1,
        limit: 100,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        type: selectedType === 'all' ? undefined : selectedType,
        search: searchTerm || undefined
      });
      
      console.log('API에서 받은 병원 데이터:', hospitalData);
      
      if (Array.isArray(hospitalData)) {
        // API에서 받은 데이터를 Hospital 인터페이스에 맞게 변환
        const formattedHospitals: Hospital[] = hospitalData.map(hospital => ({
          id: hospital.id || hospital.HospitalID?.toString() || '',
          name: hospital.name || hospital.Name || '',
          address: hospital.address || hospital.Address || '',
          phone: hospital.phone || hospital.PhoneNumber || '',
          email: hospital.email || hospital.Email || '',
          website: hospital.website || hospital.Website || '',
          type: hospital.type || hospital.HospitalType || '일반병원',
          departments: hospital.departments || [],
          doctors: hospital.doctors || [],
          operatingHours: hospital.operatingHours || {
            weekdays: '09:00 - 18:00',
            saturday: '09:00 - 13:00',
            sunday: '휴진',
            holidays: '응급실 운영'
          },
          status: hospital.status || 'active',
          registrationDate: hospital.registrationDate || (hospital.CreatedAt ? new Date(hospital.CreatedAt).toISOString().split('T')[0] : ''),
          lastUpdated: hospital.lastUpdated || (hospital.UpdatedAt ? new Date(hospital.UpdatedAt).toISOString().split('T')[0] : ''),
          description: hospital.description || hospital.Description || '',
          facilities: hospital.facilities || [],
          rating: hospital.rating || hospital.Rating || 4.5,
          reviewCount: hospital.reviewCount || 0
        }));
        
        setHospitals(formattedHospitals);
        console.log('변환된 병원 데이터:', formattedHospitals);
      } else {
        console.log('병원 데이터가 배열이 아닙니다:', hospitalData);
        setHospitals([]);
      }
    } catch (error) {
      console.error('병원 목록 로드 중 오류:', error);
      setHospitals([]);
    }
  };

  const filterHospitals = () => {
    let filtered = hospitals;

    // 상태별 필터링
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(hospital => hospital.status === selectedStatus);
    }

    // 타입별 필터링
    if (selectedType !== 'all') {
      filtered = filtered.filter(hospital => hospital.type === selectedType);
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.departments.some(dept => 
          dept.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredHospitals(filtered);
  };

  const handleAction = (hospital: Hospital, action: 'view' | 'edit' | 'delete') => {
    setSelectedHospital(hospital);
    if (action === 'delete') {
      setShowDeleteConfirm(true);
    } else {
      setModalType(action);
      setShowModal(true);
    }
  };

  const handleAdd = () => {
    setSelectedHospital(null);
    setModalType('add');
    setShowModal(true);
  };

  const handleStatusChange = (hospitalId: string, newStatus: 'active' | 'inactive' | 'pending') => {
    const updatedHospitals = hospitals.map(hospital => {
      if (hospital.id === hospitalId) {
        return {
          ...hospital,
          status: newStatus,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return hospital;
    });

    setHospitals(updatedHospitals);
    alert(`병원 상태가 ${getStatusText(newStatus)}(으)로 변경되었습니다.`);
  };

  const handleDelete = () => {
    if (!selectedHospital) return;

    const updatedHospitals = hospitals.filter(hospital => hospital.id !== selectedHospital.id);
    setHospitals(updatedHospitals);
    setShowDeleteConfirm(false);
    setSelectedHospital(null);
    alert('병원이 삭제되었습니다.');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { text: '운영중', color: '#28a745', bgColor: '#d4edda' },
      inactive: { text: '휴업', color: '#dc3545', bgColor: '#f8d7da' },
      pending: { text: '승인대기', color: '#ffc107', bgColor: '#fff3cd' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <StatusBadge color={config.color} bgColor={config.bgColor}>
        {config.text}
      </StatusBadge>
    );
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      active: '운영중',
      inactive: '휴업',
      pending: '승인대기'
    };
    return statusMap[status as keyof typeof statusMap];
  };

  const getStats = () => {
    return {
      total: hospitals.length,
      active: hospitals.filter(h => h.status === 'active').length,
      inactive: hospitals.filter(h => h.status === 'inactive').length,
      pending: hospitals.filter(h => h.status === 'pending').length
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        관리자 권한 확인 중...
      </div>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate('/admin/dashboard')}>
            ← 대시보드로
          </BackButton>
          <Title>🏥 병원 관리</Title>
        </HeaderLeft>
        <HeaderRight>
          <AddButton onClick={handleAdd}>
            + 병원 추가
          </AddButton>
          <RefreshButton onClick={loadHospitals}>
            🔄 새로고침
          </RefreshButton>
          <LogoutButton onClick={handleLogout}>
            로그아웃
          </LogoutButton>
        </HeaderRight>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.total}</StatNumber>
          <StatLabel>전체 병원</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.active}</StatNumber>
          <StatLabel>운영중</StatLabel>
        </StatCard>
        <StatCard urgent>
          <StatNumber>{stats.pending}</StatNumber>
          <StatLabel>승인 대기</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.inactive}</StatNumber>
          <StatLabel>휴업</StatLabel>
        </StatCard>
      </StatsGrid>

      <FilterSection>
        <FilterLeft>
          <SearchInput
            type="text"
            placeholder="병원명, 주소, 진료과목으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FilterLeft>
        <FilterRight>
          <FilterSelect
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">전체 상태</option>
            <option value="active">운영중</option>
            <option value="inactive">휴업</option>
            <option value="pending">승인대기</option>
          </FilterSelect>
          <FilterSelect
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">전체 유형</option>
            <option value="종합병원">종합병원</option>
            <option value="병원">병원</option>
            <option value="의원">의원</option>
            <option value="클리닉">클리닉</option>
          </FilterSelect>
        </FilterRight>
      </FilterSection>

      <HospitalGrid>
        {filteredHospitals.map((hospital) => (
          <HospitalCard key={hospital.id}>
            <CardHeader>
              <HospitalName>{hospital.name}</HospitalName>
              <StatusContainer>
                {getStatusBadge(hospital.status)}
                <TypeBadge>{hospital.type}</TypeBadge>
              </StatusContainer>
            </CardHeader>
            
            <CardBody>
              <InfoRow>
                <InfoLabel>📍 주소</InfoLabel>
                <InfoValue>{hospital.address}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>📞 전화</InfoLabel>
                <InfoValue>{hospital.phone}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>🏥 진료과</InfoLabel>
                <InfoValue>
                  {hospital.departments.slice(0, 3).join(', ')}
                  {hospital.departments.length > 3 && ` 외 ${hospital.departments.length - 3}개`}
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>👨‍⚕️ 의사</InfoLabel>
                <InfoValue>{hospital.doctors.length}명</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>⭐ 평점</InfoLabel>
                <InfoValue>{hospital.rating} ({hospital.reviewCount}개 리뷰)</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>📅 등록일</InfoLabel>
                <InfoValue>{hospital.registrationDate}</InfoValue>
              </InfoRow>
            </CardBody>

            <CardFooter>
              <ActionButtons>
                <ActionButton
                  onClick={() => handleAction(hospital, 'view')}
                  variant="info"
                >
                  상세보기
                </ActionButton>
                <ActionButton
                  onClick={() => handleAction(hospital, 'edit')}
                  variant="primary"
                >
                  수정
                </ActionButton>
                {hospital.status === 'pending' && (
                  <ActionButton
                    onClick={() => handleStatusChange(hospital.id, 'active')}
                    variant="success"
                  >
                    승인
                  </ActionButton>
                )}
                {hospital.status === 'active' && (
                  <ActionButton
                    onClick={() => handleStatusChange(hospital.id, 'inactive')}
                    variant="warning"
                  >
                    휴업
                  </ActionButton>
                )}
                {hospital.status === 'inactive' && (
                  <ActionButton
                    onClick={() => handleStatusChange(hospital.id, 'active')}
                    variant="success"
                  >
                    재개
                  </ActionButton>
                )}
                <ActionButton
                  onClick={() => handleAction(hospital, 'delete')}
                  variant="danger"
                >
                  삭제
                </ActionButton>
              </ActionButtons>
            </CardFooter>
          </HospitalCard>
        ))}
      </HospitalGrid>

      {filteredHospitals.length === 0 && (
        <EmptyState>
          <EmptyIcon>🏥</EmptyIcon>
          <EmptyText>조건에 맞는 병원이 없습니다.</EmptyText>
        </EmptyState>
      )}

      {/* 상세보기/수정 모달 */}
      {showModal && (
        <Modal>
          <ModalOverlay onClick={() => setShowModal(false)} />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {modalType === 'view' ? '병원 상세정보' :
                 modalType === 'edit' ? '병원 정보 수정' : '새 병원 추가'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>
            
            <ModalBody>
              {selectedHospital && modalType === 'view' && (
                <DetailGrid>
                  <DetailSection>
                    <SectionTitle>기본 정보</SectionTitle>
                    <DetailItem>
                      <DetailLabel>병원명</DetailLabel>
                      <DetailValue>{selectedHospital.name}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>유형</DetailLabel>
                      <DetailValue>{selectedHospital.type}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>상태</DetailLabel>
                      <DetailValue>{getStatusBadge(selectedHospital.status)}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>주소</DetailLabel>
                      <DetailValue>{selectedHospital.address}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>전화번호</DetailLabel>
                      <DetailValue>{selectedHospital.phone}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>이메일</DetailLabel>
                      <DetailValue>{selectedHospital.email}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>웹사이트</DetailLabel>
                      <DetailValue>
                        <a href={selectedHospital.website} target="_blank" rel="noopener noreferrer">
                          {selectedHospital.website}
                        </a>
                      </DetailValue>
                    </DetailItem>
                  </DetailSection>

                  <DetailSection>
                    <SectionTitle>운영 정보</SectionTitle>
                    <DetailItem>
                      <DetailLabel>평일</DetailLabel>
                      <DetailValue>{selectedHospital.operatingHours.weekdays}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>토요일</DetailLabel>
                      <DetailValue>{selectedHospital.operatingHours.saturday}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>일요일</DetailLabel>
                      <DetailValue>{selectedHospital.operatingHours.sunday}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>공휴일</DetailLabel>
                      <DetailValue>{selectedHospital.operatingHours.holidays}</DetailValue>
                    </DetailItem>
                  </DetailSection>

                  <DetailSection>
                    <SectionTitle>진료과목</SectionTitle>
                    <DepartmentList>
                      {selectedHospital.departments.map((dept, index) => (
                        <DepartmentTag key={index}>{dept}</DepartmentTag>
                      ))}
                    </DepartmentList>
                  </DetailSection>

                  <DetailSection>
                    <SectionTitle>시설</SectionTitle>
                    <FacilityList>
                      {selectedHospital.facilities.map((facility, index) => (
                        <FacilityTag key={index}>{facility}</FacilityTag>
                      ))}
                    </FacilityList>
                  </DetailSection>

                  <DetailSection>
                    <SectionTitle>의료진</SectionTitle>
                    <DoctorList>
                      {selectedHospital.doctors.map((doctor) => (
                        <DoctorCard key={doctor.id}>
                          <DoctorName>{doctor.name}</DoctorName>
                          <DoctorInfo>{doctor.department} - {doctor.specialization}</DoctorInfo>
                          <DoctorInfo>경력 {doctor.experience}년</DoctorInfo>
                          <DoctorInfo>{doctor.education}</DoctorInfo>
                        </DoctorCard>
                      ))}
                    </DoctorList>
                  </DetailSection>

                  <DetailSection>
                    <SectionTitle>기타 정보</SectionTitle>
                    <DetailItem>
                      <DetailLabel>설명</DetailLabel>
                      <DetailValue>{selectedHospital.description}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>평점</DetailLabel>
                      <DetailValue>⭐ {selectedHospital.rating} ({selectedHospital.reviewCount}개 리뷰)</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>등록일</DetailLabel>
                      <DetailValue>{selectedHospital.registrationDate}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>최종 수정일</DetailLabel>
                      <DetailValue>{selectedHospital.lastUpdated}</DetailValue>
                    </DetailItem>
                  </DetailSection>
                </DetailGrid>
              )}

              {modalType === 'edit' && (
                <FormContainer>
                  <FormMessage>
                    병원 정보 수정 기능은 실제 구현에서 폼 컴포넌트로 대체됩니다.
                  </FormMessage>
                </FormContainer>
              )}

              {modalType === 'add' && (
                <FormContainer>
                  <FormMessage>
                    새 병원 추가 기능은 실제 구현에서 폼 컴포넌트로 대체됩니다.
                  </FormMessage>
                </FormContainer>
              )}
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={() => setShowModal(false)}>
                {modalType === 'view' ? '닫기' : '취소'}
              </CancelButton>
              {modalType !== 'view' && (
                <ConfirmButton>
                  {modalType === 'edit' ? '수정하기' : '추가하기'}
                </ConfirmButton>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && selectedHospital && (
        <Modal>
          <ModalOverlay onClick={() => setShowDeleteConfirm(false)} />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>병원 삭제 확인</ModalTitle>
              <CloseButton onClick={() => setShowDeleteConfirm(false)}>×</CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <DeleteMessage>
                <strong>{selectedHospital.name}</strong>을(를) 정말 삭제하시겠습니까?
                <br />
                이 작업은 되돌릴 수 없습니다.
              </DeleteMessage>
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={() => setShowDeleteConfirm(false)}>
                취소
              </CancelButton>
              <DeleteButton onClick={handleDelete}>
                삭제하기
              </DeleteButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
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

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 10px;
`;

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

const AddButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #218838;
  }
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
  text-align: center;
  border-left: 4px solid ${props => props.urgent ? '#ffc107' : '#007bff'};
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

const FilterRight = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

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

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  background: white;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const HospitalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HospitalCard = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  padding: 20px 20px 10px 20px;
  border-bottom: 1px solid #f1f3f4;
`;

const HospitalName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
`;

const StatusContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
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

const TypeBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #007bff;
  background-color: #e3f2fd;
`;

const CardBody = styled.div`
  padding: 10px 20px;
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 8px;
  align-items: flex-start;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #666;
  min-width: 60px;
  margin-right: 10px;
`;

const InfoValue = styled.div`
  font-size: 12px;
  color: #333;
  flex: 1;
  line-height: 1.4;
`;

const CardFooter = styled.div`
  padding: 15px 20px 20px 20px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant: 'info' | 'primary' | 'success' | 'warning' | 'danger' }>`
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
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover { background: #0056b3; }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover { background: #218838; }
        `;
      case 'warning':
        return `
          background: #ffc107;
          color: #212529;
          &:hover { background: #e0a800; }
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
  max-width: 800px;
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
  gap: 30px;
`;

const DetailSection = styled.div``;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f1f3f4;
`;

const DetailItem = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 15px;
  margin-bottom: 12px;
  align-items: start;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 5px;
  }
`;

const DetailLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: #333;
  font-weight: 500;

  a {
    color: #007bff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const DepartmentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const DepartmentTag = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const FacilityList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FacilityTag = styled.span`
  background: #f3e5f5;
  color: #7b1fa2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const DoctorList = styled.div`
  display: grid;
  gap: 15px;
`;

const DoctorCard = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid #007bff;
`;

const DoctorName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
`;

const DoctorInfo = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
`;

const FormContainer = styled.div`
  padding: 20px;
  text-align: center;
`;

const FormMessage = styled.div`
  font-size: 16px;
  color: #666;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 10px;
`;

const DeleteMessage = styled.div`
  font-size: 16px;
  color: #333;
  text-align: center;
  padding: 20px;
  line-height: 1.6;
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

const ConfirmButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #0056b3;
  }
`;

const DeleteButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #c82333;
  }
`;

export default AdminHospitalsPage; 