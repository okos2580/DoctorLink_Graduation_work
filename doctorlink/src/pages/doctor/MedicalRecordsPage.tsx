import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  email: string;
  medicalHistory: string[];
}

interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  doctor: string;
  prescriptions: {
    id: string;
    name: string;
    dosage: string;
    instructions: string;
    period: string;
  }[];
  followUpDate?: string;
}

// 가상 데이터 - 실제 환경에서는 API를 통해 데이터를 불러옵니다
const samplePatient: Patient = {
  id: 'p1',
  name: '김환자',
  age: 35,
  gender: '남',
  contact: '010-1234-5678',
  email: 'patient1@example.com',
  medicalHistory: ['고혈압', '당뇨']
};

const sampleRecords: MedicalRecord[] = [
  {
    id: 'mr1',
    patientId: 'p1',
    date: '2023-11-15',
    symptoms: '복통, 소화불량, 메스꺼움',
    diagnosis: '위염',
    doctor: '이의사',
    prescriptions: [
      {
        id: 'px1',
        name: '판토록정',
        dosage: '1일 1회 1정',
        instructions: '아침 식후 30분',
        period: '2주'
      },
      {
        id: 'px2',
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
    patientId: 'p1',
    date: '2023-10-22',
    symptoms: '콧물, 재채기, 코막힘',
    diagnosis: '알레르기성 비염',
    doctor: '박의사',
    prescriptions: [
      {
        id: 'px3',
        name: '지르텍정',
        dosage: '1일 1회 1정',
        instructions: '취침 전',
        period: '10일'
      }
    ]
  },
  {
    id: 'mr3',
    patientId: 'p1',
    date: '2023-09-05',
    symptoms: '두통, 어지러움',
    diagnosis: '편두통',
    doctor: '최의사',
    prescriptions: [
      {
        id: 'px4',
        name: '타이레놀정',
        dosage: '1일 3회 1정',
        instructions: '식후 30분',
        period: '5일'
      },
      {
        id: 'px5',
        name: '이미그란정',
        dosage: '필요시 1정',
        instructions: '증상 발생시',
        period: '처방일로부터 30일'
      }
    ],
    followUpDate: '2023-09-25'
  }
];

const MedicalRecordsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  
  // 환자 정보와 진료 기록 데이터 로드
  useEffect(() => {
    // 실제 구현에서는 API를 통해 환자 정보와 진료 기록을 불러옴
    setTimeout(() => {
      setPatient(samplePatient);
      setRecords(sampleRecords);
      setLoading(false);
      
      // 기본적으로 가장 최근 기록 선택
      if (sampleRecords.length > 0) {
        setActiveRecordId(sampleRecords[0].id);
      }
    }, 1000);
  }, [patientId]);
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // 진료 기록 추가 페이지로 이동
  const handleAddRecord = () => {
    navigate(`/doctor/patients/${patientId}/records/new`);
  };
  
  // 진료 기록 수정 페이지로 이동
  const handleEditRecord = (recordId: string) => {
    navigate(`/doctor/patients/${patientId}/records/${recordId}/edit`);
  };
  
  // 선택된 진료 기록
  const activeRecord = records.find(record => record.id === activeRecordId);
  
  return (
    <PageContainer>
      <Header />
      <ContentContainer>
        <PageHeader>
          <PageTitle>진료 기록</PageTitle>
          {!loading && patient && (
            <PatientInfo>
              <PatientAvatar>{patient.name.charAt(0)}</PatientAvatar>
              <PatientName>{patient.name}</PatientName>
              <PatientMeta>{patient.age}세 / {patient.gender}</PatientMeta>
            </PatientInfo>
          )}
        </PageHeader>
        
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>진료 기록을 불러오는 중...</LoadingText>
          </LoadingContainer>
        ) : (
          <ContentLayout>
            <RecordSidebar>
              <SidebarHeader>
                <SidebarTitle>진료 내역</SidebarTitle>
                <AddRecordButton onClick={handleAddRecord}>
                  <i className="fas fa-plus"></i> 진료 기록 추가
                </AddRecordButton>
              </SidebarHeader>
              
              {records.length > 0 ? (
                <RecordList>
                  {records.map(record => (
                    <RecordItem 
                      key={record.id}
                      active={record.id === activeRecordId}
                      onClick={() => setActiveRecordId(record.id)}
                    >
                      <RecordDate>{formatDate(record.date)}</RecordDate>
                      <RecordDiagnosis>{record.diagnosis}</RecordDiagnosis>
                      <RecordDoctor>담당의: {record.doctor}</RecordDoctor>
                    </RecordItem>
                  ))}
                </RecordList>
              ) : (
                <EmptyRecords>
                  <EmptyIcon>
                    <i className="fas fa-file-medical"></i>
                  </EmptyIcon>
                  <EmptyText>진료 기록이 없습니다.</EmptyText>
                </EmptyRecords>
              )}
            </RecordSidebar>
            
            <RecordDetail>
              {activeRecord ? (
                <motion.div
                  key={activeRecord.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DetailHeader>
                    <DetailHeaderLeft>
                      <DetailDate>{formatDate(activeRecord.date)}</DetailDate>
                      <DetailTitle>{activeRecord.diagnosis}</DetailTitle>
                    </DetailHeaderLeft>
                    <DetailHeaderRight>
                      <EditButton onClick={() => handleEditRecord(activeRecord.id)}>
                        <i className="fas fa-edit"></i> 수정
                      </EditButton>
                      <PrintButton>
                        <i className="fas fa-print"></i> 인쇄
                      </PrintButton>
                    </DetailHeaderRight>
                  </DetailHeader>
                  
                  <DetailSection>
                    <SectionTitle>환자 증상</SectionTitle>
                    <SectionContent>{activeRecord.symptoms}</SectionContent>
                  </DetailSection>
                  
                  <DetailSection>
                    <SectionTitle>진단명</SectionTitle>
                    <SectionContent>{activeRecord.diagnosis}</SectionContent>
                  </DetailSection>
                  
                  <DetailSection>
                    <SectionTitle>처방 내역</SectionTitle>
                    <PrescriptionsList>
                      {activeRecord.prescriptions.map(prescription => (
                        <PrescriptionItem key={prescription.id}>
                          <PrescriptionName>{prescription.name}</PrescriptionName>
                          <PrescriptionDetails>
                            <PrescriptionInfo>
                              <InfoLabel>용량:</InfoLabel>
                              <InfoValue>{prescription.dosage}</InfoValue>
                            </PrescriptionInfo>
                            <PrescriptionInfo>
                              <InfoLabel>복용법:</InfoLabel>
                              <InfoValue>{prescription.instructions}</InfoValue>
                            </PrescriptionInfo>
                            <PrescriptionInfo>
                              <InfoLabel>기간:</InfoLabel>
                              <InfoValue>{prescription.period}</InfoValue>
                            </PrescriptionInfo>
                          </PrescriptionDetails>
                        </PrescriptionItem>
                      ))}
                    </PrescriptionsList>
                  </DetailSection>
                  
                  {activeRecord.followUpDate && (
                    <DetailSection>
                      <SectionTitle>재진료 예정일</SectionTitle>
                      <SectionContent>{formatDate(activeRecord.followUpDate)}</SectionContent>
                    </DetailSection>
                  )}
                  
                  <DetailActions>
                    <ActionButton as={Link} to={`/doctor/patients/${patientId}/appointments/new`}>
                      <i className="fas fa-calendar-plus"></i> 예약 등록
                    </ActionButton>
                    <ActionButton secondary as={Link} to={`/doctor/patients/${patientId}`}>
                      <i className="fas fa-user"></i> 환자 정보
                    </ActionButton>
                  </DetailActions>
                </motion.div>
              ) : (
                <EmptyDetail>
                  <EmptyDetailIcon>
                    <i className="fas fa-clipboard-list"></i>
                  </EmptyDetailIcon>
                  <EmptyDetailText>
                    {records.length > 0 
                      ? '좌측에서 진료 기록을 선택하세요.'
                      : '첫 진료 기록을 추가해보세요.'}
                  </EmptyDetailText>
                  {records.length === 0 && (
                    <AddFirstRecordButton onClick={handleAddRecord}>
                      진료 기록 추가
                    </AddFirstRecordButton>
                  )}
                </EmptyDetail>
              )}
            </RecordDetail>
          </ContentLayout>
        )}
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
  background-color: ${props => props.theme.colors.gray[100]};
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
`;

const PageTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background-color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const PatientAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const PatientName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
`;

const PatientMeta = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: var(--spacing-xl);
  box-shadow: ${props => props.theme.shadows.sm};
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

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-md);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const RecordSidebar = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    height: auto;
    max-height: 400px;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
`;

const SidebarTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
`;

const AddRecordButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: var(--primary-color);
  background-color: white;
  border: 1px solid var(--primary-color);
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
`;

const RecordList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

interface RecordItemProps {
  active: boolean;
}

const RecordItem = styled.div<RecordItemProps>`
  padding: var(--spacing-md);
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  background-color: ${props => props.active ? props.theme.colors.gray[100] : 'white'};
  border-left: 3px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const RecordDate = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: var(--spacing-xs);
`;

const RecordDiagnosis = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: var(--text-color);
  margin-bottom: var(--spacing-xs);
`;

const RecordDoctor = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.gray[600]};
`;

const EmptyRecords = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;
  height: 100%;
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

const RecordDetail = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: var(--spacing-lg);
  min-height: calc(100vh - 200px);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    min-height: 500px;
  }
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
`;

const DetailHeaderLeft = styled.div``;

const DetailDate = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: var(--spacing-xs);
`;

const DetailTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
`;

const DetailHeaderRight = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
`;

const EditButton = styled(Button)`
  color: ${props => props.theme.colors.gray[700]};
  background-color: white;
  border: 1px solid ${props => props.theme.colors.gray[300]};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
  }
`;

const PrintButton = styled(Button)`
  color: ${props => props.theme.colors.gray[700]};
  background-color: white;
  border: 1px solid ${props => props.theme.colors.gray[300]};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
  }
`;

const DetailSection = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[700]};
  margin-bottom: var(--spacing-sm);
`;

const SectionContent = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: var(--text-color);
  line-height: 1.5;
`;

const PrescriptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const PrescriptionItem = styled.div`
  padding: var(--spacing-md);
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.gray[100]};
`;

const PrescriptionName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
`;

const PrescriptionDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
`;

const PrescriptionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 150px;
`;

const InfoLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
`;

const InfoValue = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: var(--text-color);
`;

const DetailActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

interface ActionButtonProps {
  secondary?: boolean;
}

const ActionButton = styled.button<ActionButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background-color: ${props => props.secondary ? 'white' : 'var(--primary-color)'};
  color: ${props => props.secondary ? 'var(--primary-color)' : 'white'};
  border: 1px solid ${props => props.secondary ? 'var(--primary-color)' : 'var(--primary-color)'};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  text-decoration: none;
  
  &:hover {
    background-color: ${props => props.secondary ? 'rgba(242, 151, 179, 0.1)' : '#e3819d'};
    transform: translateY(-2px);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
  }
`;

const EmptyDetail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: var(--spacing-xl);
`;

const EmptyDetailIcon = styled.div`
  font-size: 64px;
  color: ${props => props.theme.colors.gray[300]};
  margin-bottom: var(--spacing-lg);
`;

const EmptyDetailText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: var(--spacing-lg);
`;

const AddFirstRecordButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background-color: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: #e3819d;
    transform: translateY(-2px);
  }
`;

export default MedicalRecordsPage; 