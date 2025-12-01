import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

// 진료 기록 데이터 타입 정의
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospitalName: string;
}

interface Prescription {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  period: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  doctor: Doctor;
  diagnosis: string;
  symptoms: string;
  note: string;
  prescriptions: Prescription[];
  attachments?: string[];
  followUpDate?: string;
}

// 가상의 진료 기록 데이터 (실제로는 API에서 가져올 것)
const sampleMedicalRecords: MedicalRecord[] = [
  {
    id: 'mr1',
    date: '2023-11-15',
    doctor: {
      id: 'd1',
      name: '김의사',
      specialty: '내과',
      hospitalName: '서울 중앙 병원'
    },
    diagnosis: '위염',
    symptoms: '복통, 소화불량, 메스꺼움',
    note: '식사 후 30분 이내에 복통 발생. 위 내시경 검사 결과 위염 진단.',
    prescriptions: [
      {
        id: 'p1',
        name: '판토록정',
        dosage: '1일 1회 1정',
        instructions: '아침 식후 30분',
        period: '2주'
      },
      {
        id: 'p2',
        name: '알마겔정',
        dosage: '1일 3회 1정',
        instructions: '식후 30분',
        period: '2주'
      }
    ],
    followUpDate: '2023-12-01'
  },
  {
    id: 'mr2',
    date: '2023-10-05',
    doctor: {
      id: 'd2',
      name: '이의사',
      specialty: '이비인후과',
      hospitalName: '연세 세브란스 병원'
    },
    diagnosis: '급성 비염',
    symptoms: '코막힘, 재채기, 콧물, 인후통',
    note: '알레르기 검사 결과 음성. 증상 지속 시 재방문 권장.',
    prescriptions: [
      {
        id: 'p3',
        name: '싱귤레어정',
        dosage: '1일 1회 1정',
        instructions: '취침 전',
        period: '1주'
      },
      {
        id: 'p4',
        name: '코데날시럽',
        dosage: '1일 3회 10ml',
        instructions: '식후',
        period: '5일'
      }
    ]
  },
  {
    id: 'mr3',
    date: '2023-09-20',
    doctor: {
      id: 'd3',
      name: '박의사',
      specialty: '정형외과',
      hospitalName: '강남 세브란스 병원'
    },
    diagnosis: '발목 염좌',
    symptoms: '발목 통증, 부종, 보행 시 불편함',
    note: 'X-ray 검사 결과 뼈의 골절은 없음. 발목 보호대 착용 권장.',
    prescriptions: [
      {
        id: 'p5',
        name: '타이레놀정',
        dosage: '1일 3회 1정',
        instructions: '식후 30분',
        period: '5일'
      },
      {
        id: 'p6',
        name: '록소닌정',
        dosage: '1일 3회 1정',
        instructions: '식후 30분, 타이레놀과 교대로 복용',
        period: '5일'
      }
    ],
    attachments: ['xray_20230920.jpg'],
    followUpDate: '2023-10-05'
  },
  {
    id: 'mr4',
    date: '2023-08-10',
    doctor: {
      id: 'd4',
      name: '최의사',
      specialty: '피부과',
      hospitalName: '서울 중앙 병원'
    },
    diagnosis: '아토피 피부염',
    symptoms: '피부 발진, 가려움증, 건조함',
    note: '스테로이드 연고 도포 및 보습제 사용. 알레르기 유발 요인 회피 권장.',
    prescriptions: [
      {
        id: 'p7',
        name: '데소나크림',
        dosage: '1일 2회 소량',
        instructions: '발진 부위에 얇게 바르기',
        period: '1주'
      },
      {
        id: 'p8',
        name: '세티리진정',
        dosage: '1일 1회 1정',
        instructions: '취침 전',
        period: '2주'
      }
    ],
    followUpDate: '2023-08-24'
  },
  {
    id: 'mr5',
    date: '2023-07-05',
    doctor: {
      id: 'd5',
      name: '정의사',
      specialty: '안과',
      hospitalName: '강남 세브란스 병원'
    },
    diagnosis: '결막염',
    symptoms: '눈 충혈, 가려움, 이물감',
    note: '컴퓨터 사용 시간 줄이기, 인공눈물 자주 사용 권장.',
    prescriptions: [
      {
        id: 'p9',
        name: '토브렉스 점안액',
        dosage: '1일 4회 1방울',
        instructions: '양쪽 눈에 점안',
        period: '1주'
      },
      {
        id: 'p10',
        name: '하이알 점안액',
        dosage: '필요시 수시로',
        instructions: '양쪽 눈에 점안',
        period: '2주'
      }
    ]
  }
];

const MedicalRecordsPage: React.FC = () => {
  // 상태 관리
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'diagnosis', 'doctor', 'hospital'
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // 진료 기록 가져오기 (실제로는 API 호출)
  useEffect(() => {
    // API 호출을 시뮬레이션
    setTimeout(() => {
      setRecords(sampleMedicalRecords);
      setFilteredRecords(sampleMedicalRecords);
      setLoading(false);
    }, 1000);
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = records.filter(record => {
      switch (filterType) {
        case 'diagnosis':
          return record.diagnosis.toLowerCase().includes(term);
        case 'doctor':
          return record.doctor.name.toLowerCase().includes(term);
        case 'hospital':
          return record.doctor.hospitalName.toLowerCase().includes(term);
        default:
          return (
            record.diagnosis.toLowerCase().includes(term) ||
            record.doctor.name.toLowerCase().includes(term) ||
            record.doctor.hospitalName.toLowerCase().includes(term) ||
            record.symptoms.toLowerCase().includes(term)
          );
      }
    });

    setFilteredRecords(filtered);
  }, [searchTerm, filterType, records]);

  // 날짜 포맷 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 상세 기록 보기
  const viewRecordDetails = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <PageContainer>
      <Header />
      <RecordsContainer>
        <RecordsTitle>진료 기록</RecordsTitle>
        
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>진료 기록을 불러오는 중...</LoadingText>
          </LoadingContainer>
        ) : (
          <>
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FilterSelect
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">전체</option>
                <option value="diagnosis">진단명</option>
                <option value="doctor">의사</option>
                <option value="hospital">병원</option>
              </FilterSelect>
            </SearchContainer>
            
            <RecordsList
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <RecordItem 
                    key={record.id}
                    as={motion.div}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => viewRecordDetails(record)}
                  >
                    <RecordDate>{formatDate(record.date)}</RecordDate>
                    <RecordMain>
                      <RecordHospital>{record.doctor.hospitalName}</RecordHospital>
                      <RecordDiagnosis>{record.diagnosis}</RecordDiagnosis>
                      <RecordDoctor>담당의: {record.doctor.name} ({record.doctor.specialty})</RecordDoctor>
                    </RecordMain>
                    <RecordButton>상세보기</RecordButton>
                  </RecordItem>
                ))
              ) : (
                <NoRecordsMessage>
                  검색 결과가 없습니다.
                </NoRecordsMessage>
              )}
            </RecordsList>
          </>
        )}
        
        {/* 진료 기록 상세 모달 */}
        {showModal && selectedRecord && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent
              as={motion.div}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>진료 상세 정보</ModalTitle>
                <CloseButton onClick={closeModal}>&times;</CloseButton>
              </ModalHeader>
              
              <ModalBody>
                <RecordDetailHeader>
                  <DetailDate>{formatDate(selectedRecord.date)}</DetailDate>
                  <DetailHospital>{selectedRecord.doctor.hospitalName}</DetailHospital>
                </RecordDetailHeader>
                
                <DetailSection>
                  <DetailLabel>진단명</DetailLabel>
                  <DetailValue>{selectedRecord.diagnosis}</DetailValue>
                </DetailSection>
                
                <DetailSection>
                  <DetailLabel>담당의</DetailLabel>
                  <DetailValue>
                    {selectedRecord.doctor.name} ({selectedRecord.doctor.specialty})
                  </DetailValue>
                </DetailSection>
                
                <DetailSection>
                  <DetailLabel>증상</DetailLabel>
                  <DetailValue>{selectedRecord.symptoms}</DetailValue>
                </DetailSection>
                
                <DetailSection>
                  <DetailLabel>상세 소견</DetailLabel>
                  <DetailValue>{selectedRecord.note}</DetailValue>
                </DetailSection>
                
                <DetailSection>
                  <DetailLabel>처방 약품</DetailLabel>
                  <PrescriptionList>
                    {selectedRecord.prescriptions.map((prescription) => (
                      <PrescriptionItem key={prescription.id}>
                        <PrescriptionName>{prescription.name}</PrescriptionName>
                        <PrescriptionDetails>
                          <PrescriptionDetail>용량: {prescription.dosage}</PrescriptionDetail>
                          <PrescriptionDetail>복용법: {prescription.instructions}</PrescriptionDetail>
                          <PrescriptionDetail>기간: {prescription.period}</PrescriptionDetail>
                        </PrescriptionDetails>
                      </PrescriptionItem>
                    ))}
                  </PrescriptionList>
                </DetailSection>
                
                {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
                  <DetailSection>
                    <DetailLabel>첨부 파일</DetailLabel>
                    <AttachmentList>
                      {selectedRecord.attachments.map((attachment, index) => (
                        <AttachmentItem key={index}>
                          <AttachmentIcon />
                          <AttachmentName>{attachment}</AttachmentName>
                          <DownloadButton>다운로드</DownloadButton>
                        </AttachmentItem>
                      ))}
                    </AttachmentList>
                  </DetailSection>
                )}
                
                {selectedRecord.followUpDate && (
                  <DetailSection>
                    <DetailLabel>재진료 예정일</DetailLabel>
                    <DetailValue>{formatDate(selectedRecord.followUpDate)}</DetailValue>
                  </DetailSection>
                )}
              </ModalBody>
              
              <ModalFooter>
                <ActionButton variant="primary">예약 신청</ActionButton>
                <ActionButton variant="secondary">PDF 출력</ActionButton>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </RecordsContainer>
      <Footer />
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const RecordsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-md);
  background-color: ${props => props.theme.colors.gray[100]};
`;

const RecordsTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-xl);
  text-align: center;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  width: 100%;
  max-width: 800px;
  margin-bottom: var(--spacing-lg);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: ${props => props.theme.typography.fontSize.md};
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const FilterSelect = styled.select`
  width: 120px;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: ${props => props.theme.typography.fontSize.md};
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
  }
`;

const RecordsList = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const RecordItem = styled.div`
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
`;

const RecordDate = styled.div`
  flex: 0 0 120px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: var(--primary-color);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex: none;
    width: 100%;
    margin-bottom: var(--spacing-xs);
  }
`;

const RecordMain = styled.div`
  flex: 1;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
    margin-bottom: var(--spacing-sm);
  }
`;

const RecordHospital = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: var(--spacing-xs);
`;

const RecordDiagnosis = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-xs);
`;

const RecordDoctor = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
`;

const RecordButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
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
  border: 4px solid rgba(242, 151, 179, 0.3);
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

const NoRecordsMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl);
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.lg};
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
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.lg};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid ${props => props.theme.colors.gray[300]};
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.theme.colors.gray[500]};
`;

const ModalBody = styled.div`
  padding: var(--spacing-lg);
`;

const RecordDetailHeader = styled.div`
  margin-bottom: var(--spacing-lg);
  border-left: 3px solid var(--primary-color);
  padding-left: var(--spacing-md);
`;

const DetailDate = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-xs);
`;

const DetailHospital = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.gray[600]};
`;

const DetailSection = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const DetailLabel = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[700]};
  margin-bottom: var(--spacing-sm);
  border-bottom: 1px solid ${props => props.theme.colors.gray[300]};
  padding-bottom: var(--spacing-xs);
`;

const DetailValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: var(--text-color);
  line-height: 1.5;
`;

const PrescriptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const PrescriptionItem = styled.div`
  background-color: ${props => props.theme.colors.gray[100]};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: var(--spacing-md);
`;

const PrescriptionName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
`;

const PrescriptionDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
`;

const PrescriptionDetail = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[700]};
`;

const AttachmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const AttachmentIcon = styled.div`
  width: 24px;
  height: 24px;
  background-color: ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.sm};
`;

const AttachmentName = styled.div`
  flex: 1;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: var(--text-color);
`;

const DownloadButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: transparent;
  border: 1px solid ${props => props.theme.colors.gray[400]};
  color: ${props => props.theme.colors.gray[700]};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[200]};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid ${props => props.theme.colors.gray[300]};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

interface ActionButtonProps {
  variant: 'primary' | 'secondary';
}

const ActionButton = styled.button<ActionButtonProps>`
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: ${props => props.variant === 'primary' ? 'var(--primary-color)' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : 'var(--primary-color)'};
  border: 1px solid var(--primary-color);
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: ${props => props.variant === 'primary' ? '#e3819d' : 'rgba(242, 151, 179, 0.1)'};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.sm};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
  }
`;

export default MedicalRecordsPage; 