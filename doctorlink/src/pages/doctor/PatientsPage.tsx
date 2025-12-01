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
  email: string;
  address: string;
  medicalHistory: string[];
  recentVisit?: string;
  registeredDate: string;
}

// 가상 환자 데이터
const samplePatients: Patient[] = [
  {
    id: 'p1',
    name: '김환자',
    age: 35,
    gender: '남',
    contact: '010-1234-5678',
    email: 'patient1@example.com',
    address: '서울시 강남구 테헤란로 123',
    medicalHistory: ['고혈압', '당뇨'],
    recentVisit: '2023-11-15',
    registeredDate: '2022-01-10'
  },
  {
    id: 'p2',
    name: '이영희',
    age: 28,
    gender: '여',
    contact: '010-2345-6789',
    email: 'patient2@example.com',
    address: '서울시 서초구 반포대로 456',
    medicalHistory: ['알레르기성 비염'],
    recentVisit: '2023-10-22',
    registeredDate: '2022-03-15'
  },
  {
    id: 'p3',
    name: '박지민',
    age: 42,
    gender: '남',
    contact: '010-3456-7890',
    email: 'patient3@example.com',
    address: '서울시 송파구 올림픽로 789',
    medicalHistory: ['관절염', '위염'],
    recentVisit: '2023-11-05',
    registeredDate: '2021-09-28'
  },
  {
    id: 'p4',
    name: '최수진',
    age: 31,
    gender: '여',
    contact: '010-4567-8901',
    email: 'patient4@example.com',
    address: '경기도 성남시 분당구 판교로 123',
    medicalHistory: ['편두통'],
    recentVisit: '2023-09-18',
    registeredDate: '2022-06-10'
  },
  {
    id: 'p5',
    name: '정민준',
    age: 25,
    gender: '남',
    contact: '010-5678-9012',
    email: 'patient5@example.com',
    address: '서울시 마포구 홍대로 456',
    medicalHistory: ['천식'],
    recentVisit: '2023-10-30',
    registeredDate: '2022-05-22'
  },
  {
    id: 'p6',
    name: '강서연',
    age: 45,
    gender: '여',
    contact: '010-6789-0123',
    email: 'patient6@example.com',
    address: '서울시 용산구 이태원로 789',
    medicalHistory: ['갑상선 기능 저하증', '고지혈증'],
    recentVisit: '2023-11-10',
    registeredDate: '2021-07-15'
  },
  {
    id: 'p7',
    name: '윤도현',
    age: 38,
    gender: '남',
    contact: '010-7890-1234',
    email: 'patient7@example.com',
    address: '경기도 수원시 영통구 광교로 123',
    medicalHistory: ['요통'],
    registeredDate: '2022-09-05'
  },
  {
    id: 'p8',
    name: '한미래',
    age: 29,
    gender: '여',
    contact: '010-8901-2345',
    email: 'patient8@example.com',
    address: '인천시 연수구 송도대로 456',
    medicalHistory: ['불안장애'],
    recentVisit: '2023-08-12',
    registeredDate: '2022-02-28'
  }
];

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetail, setShowPatientDetail] = useState(false);

  // 데이터 로딩
  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setPatients(samplePatients);
      setFilteredPatients(samplePatients);
      setLoading(false);
    }, 1000);
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let results = [...patients];
    
    // 이름 또는 연락처로 검색
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        patient => 
          patient.name.toLowerCase().includes(term) ||
          patient.contact.includes(term) ||
          patient.email.toLowerCase().includes(term)
      );
    }
    
    // 성별 필터링
    if (filterGender !== 'all') {
      results = results.filter(patient => patient.gender === filterGender);
    }
    
    // 정렬
    switch (sortBy) {
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'age':
        results.sort((a, b) => a.age - b.age);
        break;
      case 'recent':
        results.sort((a, b) => {
          if (!a.recentVisit) return 1;
          if (!b.recentVisit) return -1;
          return new Date(b.recentVisit).getTime() - new Date(a.recentVisit).getTime();
        });
        break;
      case 'registered':
        results.sort((a, b) => new Date(a.registeredDate).getTime() - new Date(b.registeredDate).getTime());
        break;
      default:
        break;
    }
    
    setFilteredPatients(results);
  }, [patients, searchTerm, filterGender, sortBy]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '방문 기록 없음';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 환자 상세정보 보기
  const viewPatientDetail = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetail(true);
  };

  // 모달 닫기
  const closePatientDetail = () => {
    setShowPatientDetail(false);
  };

  return (
    <PageContainer>
      <Header />
      <ContentContainer>
        <PageTitle>환자 관리</PageTitle>
        
        <ControlsContainer>
          <SearchBox>
            <SearchInput
              type="text"
              placeholder="환자 이름 또는 연락처 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon>
              <i className="fas fa-search"></i>
            </SearchIcon>
          </SearchBox>
          
          <FiltersContainer>
            <FilterGroup>
              <FilterLabel>성별:</FilterLabel>
              <FilterSelect 
                value={filterGender} 
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="all">전체</option>
                <option value="남">남성</option>
                <option value="여">여성</option>
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>정렬:</FilterLabel>
              <FilterSelect 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">이름순</option>
                <option value="age">나이순</option>
                <option value="recent">최근 방문순</option>
                <option value="registered">등록일순</option>
              </FilterSelect>
            </FilterGroup>
          </FiltersContainer>
        </ControlsContainer>
        
        <PatientListContainer>
          <ListHeader>
            <HeaderCell width="5%">No</HeaderCell>
            <HeaderCell width="15%">이름</HeaderCell>
            <HeaderCell width="10%">나이/성별</HeaderCell>
            <HeaderCell width="20%">연락처</HeaderCell>
            <HeaderCell width="20%">최근 방문일</HeaderCell>
            <HeaderCell width="20%">주요 병력</HeaderCell>
            <HeaderCell width="10%">관리</HeaderCell>
          </ListHeader>
          
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>환자 정보를 불러오는 중...</LoadingText>
            </LoadingContainer>
          ) : filteredPatients.length > 0 ? (
            <PatientList
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {filteredPatients.map((patient, index) => (
                <PatientItem key={patient.id}>
                  <PatientCell width="5%">{index + 1}</PatientCell>
                  <PatientCell width="15%">{patient.name}</PatientCell>
                  <PatientCell width="10%">{patient.age}세 / {patient.gender}</PatientCell>
                  <PatientCell width="20%">
                    {patient.contact}
                    <br />
                    <small>{patient.email}</small>
                  </PatientCell>
                  <PatientCell width="20%">{formatDate(patient.recentVisit)}</PatientCell>
                  <PatientCell width="20%">
                    {patient.medicalHistory.length > 0
                      ? patient.medicalHistory.join(', ')
                      : '병력 없음'
                    }
                  </PatientCell>
                  <PatientCell width="10%">
                    <ActionButtonGroup>
                      <ActionButton onClick={() => viewPatientDetail(patient)}>
                        <i className="fas fa-info-circle"></i>
                      </ActionButton>
                      <ActionButton as={Link} to={`/doctor/patients/${patient.id}/records`}>
                        <i className="fas fa-clipboard-list"></i>
                      </ActionButton>
                      <ActionButton as={Link} to={`/doctor/patients/${patient.id}/appointments`}>
                        <i className="fas fa-calendar-alt"></i>
                      </ActionButton>
                    </ActionButtonGroup>
                  </PatientCell>
                </PatientItem>
              ))}
            </PatientList>
          ) : (
            <EmptyState>
              <EmptyIcon>
                <i className="fas fa-users-slash"></i>
              </EmptyIcon>
              <EmptyText>검색 조건에 맞는 환자가 없습니다.</EmptyText>
            </EmptyState>
          )}
        </PatientListContainer>
        
        <Pagination>
          <PaginationButton disabled>
            <i className="fas fa-chevron-left"></i>
          </PaginationButton>
          <PaginationNumber active>1</PaginationNumber>
          <PaginationNumber>2</PaginationNumber>
          <PaginationNumber>3</PaginationNumber>
          <PaginationButton>
            <i className="fas fa-chevron-right"></i>
          </PaginationButton>
        </Pagination>
      </ContentContainer>
      
      {/* 환자 상세 정보 모달 */}
      {showPatientDetail && selectedPatient && (
        <ModalOverlay onClick={closePatientDetail}>
          <ModalContent
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>환자 상세 정보</ModalTitle>
              <CloseButton onClick={closePatientDetail}>
                <i className="fas fa-times"></i>
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <PatientDetailHeader>
                <PatientAvatar>
                  {selectedPatient.name.charAt(0)}
                </PatientAvatar>
                <PatientBasicInfo>
                  <PatientName>{selectedPatient.name}</PatientName>
                  <PatientMeta>
                    {selectedPatient.age}세 / {selectedPatient.gender} / 
                    등록일: {formatDate(selectedPatient.registeredDate)}
                  </PatientMeta>
                </PatientBasicInfo>
              </PatientDetailHeader>
              
              <DetailSection>
                <DetailTitle>연락처 정보</DetailTitle>
                <DetailContent>
                  <DetailItem>
                    <DetailLabel>전화번호:</DetailLabel>
                    <DetailValue>{selectedPatient.contact}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>이메일:</DetailLabel>
                    <DetailValue>{selectedPatient.email}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>주소:</DetailLabel>
                    <DetailValue>{selectedPatient.address}</DetailValue>
                  </DetailItem>
                </DetailContent>
              </DetailSection>
              
              <DetailSection>
                <DetailTitle>의료 정보</DetailTitle>
                <DetailContent>
                  <DetailItem>
                    <DetailLabel>주요 병력:</DetailLabel>
                    <DetailValue>
                      {selectedPatient.medicalHistory.length > 0
                        ? selectedPatient.medicalHistory.map((condition, index) => (
                            <MedicalTag key={index}>{condition}</MedicalTag>
                          ))
                        : '주요 병력 없음'
                      }
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>최근 방문일:</DetailLabel>
                    <DetailValue>
                      {formatDate(selectedPatient.recentVisit)}
                    </DetailValue>
                  </DetailItem>
                </DetailContent>
              </DetailSection>
            </ModalBody>
            
            <ModalFooter>
              <ModalButton primary as={Link} to={`/doctor/patients/${selectedPatient.id}/records`}>
                <i className="fas fa-clipboard-list"></i> 진료 기록
              </ModalButton>
              <ModalButton as={Link} to={`/doctor/patients/${selectedPatient.id}/appointments`}>
                <i className="fas fa-calendar-plus"></i> 예약 추가
              </ModalButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
      
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
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  background-color: ${props => props.theme.colors.gray[100]};
`;

const PageTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid ${props => props.theme.colors.gray[300]};
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
`;

const SearchBox = styled.div`
  position: relative;
  width: 350px;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(242, 151, 179, 0.2);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.gray[500]};
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: var(--spacing-md);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
`;

const FilterLabel = styled.label`
  margin-right: var(--spacing-xs);
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[700]};
`;

const FilterSelect = styled.select`
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const PatientListContainer = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
  margin-bottom: var(--spacing-lg);
`;

const ListHeader = styled.div`
  display: flex;
  background-color: ${props => props.theme.colors.gray[100]};
  border-bottom: 1px solid ${props => props.theme.colors.gray[300]};
  padding: var(--spacing-sm) var(--spacing-md);
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.gray[700]};
`;

interface CellProps {
  width: string;
}

const HeaderCell = styled.div<CellProps>`
  width: ${props => props.width};
  padding: var(--spacing-xs);
  text-align: left;
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    &:nth-child(3), &:nth-child(5), &:nth-child(6) {
      display: none;
    }
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    &:nth-child(4) {
      display: none;
    }
  }
`;

const PatientList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const PatientItem = styled.div`
  display: flex;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-wrap: wrap;
  }
`;

const PatientCell = styled.div<CellProps>`
  width: ${props => props.width};
  padding: var(--spacing-xs);
  font-size: ${props => props.theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  
  small {
    color: ${props => props.theme.colors.gray[500]};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    &:nth-child(3), &:nth-child(5), &:nth-child(6) {
      display: none;
    }
    
    &:nth-child(1) {
      width: 10%;
    }
    
    &:nth-child(2) {
      width: 30%;
    }
    
    &:nth-child(4) {
      width: 40%;
    }
    
    &:nth-child(7) {
      width: 20%;
    }
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    &:nth-child(4) {
      display: none;
    }
    
    &:nth-child(1) {
      width: 15%;
    }
    
    &:nth-child(2) {
      width: 50%;
    }
    
    &:nth-child(7) {
      width: 35%;
    }
  }
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const ActionButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: transparent;
  color: ${props => props.theme.colors.gray[600]};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: auto;
  padding: var(--spacing-md) 0;
`;

const PaginationButton = styled.button<{ disabled?: boolean }>`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: white;
  color: ${props => props.disabled ? props.theme.colors.gray[400] : props.theme.colors.gray[700]};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all ${props => props.theme.transition.fast};
  border: 1px solid ${props => props.theme.colors.gray[300]};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.gray[100]};
  }
`;

interface PaginationNumberProps {
  active?: boolean;
}

const PaginationNumber = styled.button<PaginationNumberProps>`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : props.theme.colors.gray[700]};
  cursor: ${props => props.active ? 'default' : 'pointer'};
  transition: all ${props => props.theme.transition.fast};
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : props.theme.colors.gray[300]};
  
  &:hover:not([data-active="true"]) {
    background-color: ${props => props.theme.colors.gray[100]};
  }
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
  font-size: 48px;
  color: ${props => props.theme.colors.gray[400]};
  margin-bottom: var(--spacing-md);
`;

const EmptyText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.gray[600]};
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
  padding: var(--spacing-md);
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.lg};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
`;

const CloseButton = styled.button`
  background-color: transparent;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: ${props => props.theme.colors.gray[500]};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
    color: var(--text-color);
  }
`;

const ModalBody = styled.div`
  padding: var(--spacing-lg);
`;

const PatientDetailHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

const PatientAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-right: var(--spacing-md);
`;

const PatientBasicInfo = styled.div`
  flex: 1;
`;

const PatientName = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-xs);
`;

const PatientMeta = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
`;

const DetailSection = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const DetailTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
`;

const DetailContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const DetailItem = styled.div`
  display: flex;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const DetailLabel = styled.div`
  width: 120px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[700]};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
    margin-bottom: var(--spacing-xs);
  }
`;

const DetailValue = styled.div`
  flex: 1;
  color: var(--text-color);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
`;

const MedicalTag = styled.div`
  background-color: ${props => props.theme.colors.gray[100]};
  color: ${props => props.theme.colors.gray[700]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: ${props => props.theme.borderRadius.full};
  display: inline-block;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid ${props => props.theme.colors.gray[200]};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

interface ModalButtonProps {
  primary?: boolean;
}

const ModalButton = styled.button<ModalButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'white'};
  color: ${props => props.primary ? 'white' : 'var(--primary-color)'};
  border: 1px solid ${props => props.primary ? 'var(--primary-color)' : 'var(--primary-color)'};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  text-decoration: none;
  
  &:hover {
    background-color: ${props => props.primary ? '#e3819d' : 'rgba(242, 151, 179, 0.1)'};
    transform: translateY(-2px);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
  }
`;

export default PatientsPage; 