import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  medicalHistory: string[];
}

interface Prescription {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  period: string;
}

interface MedicalRecord {
  id?: string;
  patientId: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  note: string;
  prescriptions: Prescription[];
  attachments?: string[];
  followUpDate?: string;
}

// 가상 환자 데이터
const samplePatients: Patient[] = [
  {
    id: 'p1',
    name: '김환자',
    age: 35,
    gender: '남',
    medicalHistory: ['고혈압', '당뇨']
  },
  {
    id: 'p2',
    name: '이영희',
    age: 28,
    gender: '여',
    medicalHistory: ['알레르기성 비염']
  }
];

// 샘플 기존 진료 기록 (수정 모드일 때 사용)
const sampleExistingRecord: MedicalRecord = {
  id: 'mr1',
  patientId: 'p1',
  date: '2023-11-15',
  symptoms: '복통, 소화불량, 메스꺼움',
  diagnosis: '위염',
  note: '식사 후 30분 이내에 복통 발생. 위 내시경 검사 결과 위염 진단.',
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
};

const MedicalRecordFormPage: React.FC = () => {
  const { patientId, recordId } = useParams<{ patientId: string; recordId?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!recordId;
  
  // 상태 관리
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [record, setRecord] = useState<MedicalRecord>({
    patientId: patientId || '',
    date: new Date().toISOString().split('T')[0],
    symptoms: '',
    diagnosis: '',
    note: '',
    prescriptions: [{ id: `px_${Date.now()}`, name: '', dosage: '', instructions: '', period: '' }]
  });
  
  // 환자 정보 및 기존 진료 기록 로드
  useEffect(() => {
    // 실제 구현에서는 API를 통해 환자 정보와 기존 진료 기록을 불러옴
    setTimeout(() => {
      // 환자 정보 로드
      const foundPatient = samplePatients.find(p => p.id === patientId);
      if (foundPatient) {
        setPatient(foundPatient);
      }
      
      // 수정 모드인 경우 기존 진료 기록 로드
      if (isEditMode) {
        setRecord(sampleExistingRecord);
      }
      
      setLoading(false);
    }, 1000);
  }, [patientId, recordId, isEditMode]);
  
  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRecord(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 처방 필드 변경 핸들러
  const handlePrescriptionChange = (index: number, field: keyof Prescription, value: string) => {
    setRecord(prev => {
      const updatedPrescriptions = [...prev.prescriptions];
      updatedPrescriptions[index] = {
        ...updatedPrescriptions[index],
        [field]: value
      };
      return {
        ...prev,
        prescriptions: updatedPrescriptions
      };
    });
  };
  
  // 처방 추가
  const addPrescription = () => {
    setRecord(prev => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        { id: `px_${Date.now()}`, name: '', dosage: '', instructions: '', period: '' }
      ]
    }));
  };
  
  // 처방 삭제
  const removePrescription = (index: number) => {
    setRecord(prev => {
      const updatedPrescriptions = [...prev.prescriptions];
      updatedPrescriptions.splice(index, 1);
      return {
        ...prev,
        prescriptions: updatedPrescriptions
      };
    });
  };
  
  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!record.date || !record.symptoms || !record.diagnosis) {
      alert('진료일, 증상, 진단명은 필수 입력 항목입니다.');
      return;
    }
    
    // 처방전 검증
    const invalidPrescriptions = record.prescriptions.some(
      p => !p.name || !p.dosage || !p.instructions || !p.period
    );
    
    if (invalidPrescriptions && record.prescriptions.length > 0) {
      alert('모든 처방 정보를 입력해주세요.');
      return;
    }
    
    setSubmitting(true);
    
    // 실제 구현에서는 API를 통해 진료 기록을 저장함
    setTimeout(() => {
      setSubmitting(false);
      alert(`진료 기록이 ${isEditMode ? '수정' : '저장'}되었습니다.`);
      navigate(`/doctor/patients/${patientId}/records`);
    }, 1500);
  };
  
  return (
    <PageContainer>
      <Header />
      <ContentContainer>
        <FormHeader>
          <FormTitle>{isEditMode ? '진료 기록 수정' : '진료 기록 작성'}</FormTitle>
          {!loading && patient && (
            <PatientInfo>
              <PatientAvatar>{patient.name.charAt(0)}</PatientAvatar>
              <PatientName>{patient.name}</PatientName>
              <PatientMeta>{patient.age}세 / {patient.gender}</PatientMeta>
            </PatientInfo>
          )}
        </FormHeader>
        
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>정보를 불러오는 중...</LoadingText>
          </LoadingContainer>
        ) : (
          <FormContainer
            as={motion.form}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
          >
            <FormSection>
              <SectionTitle>기본 정보</SectionTitle>
              <FormGroup>
                <FormLabel htmlFor="date">진료일 <Required>*</Required></FormLabel>
                <DateInput
                  type="date"
                  id="date"
                  name="date"
                  value={record.date}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="symptoms">증상 <Required>*</Required></FormLabel>
                <TextArea
                  id="symptoms"
                  name="symptoms"
                  rows={3}
                  value={record.symptoms}
                  onChange={handleInputChange}
                  placeholder="환자가 호소하는 증상을 입력하세요"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="diagnosis">진단명 <Required>*</Required></FormLabel>
                <Input
                  type="text"
                  id="diagnosis"
                  name="diagnosis"
                  value={record.diagnosis}
                  onChange={handleInputChange}
                  placeholder="진단명을 입력하세요"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="note">상세 소견</FormLabel>
                <TextArea
                  id="note"
                  name="note"
                  rows={4}
                  value={record.note}
                  onChange={handleInputChange}
                  placeholder="진료에 대한 상세 소견을 입력하세요"
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="followUpDate">재진료 예정일</FormLabel>
                <DateInput
                  type="date"
                  id="followUpDate"
                  name="followUpDate"
                  value={record.followUpDate || ''}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </FormSection>
            
            <FormSection>
              <SectionTitleContainer>
                <SectionTitle>처방 정보</SectionTitle>
                <AddButton type="button" onClick={addPrescription}>
                  + 처방 추가
                </AddButton>
              </SectionTitleContainer>
              
              {record.prescriptions.map((prescription, index) => (
                <PrescriptionContainer key={prescription.id}>
                  <PrescriptionHeader>
                    <PrescriptionTitle>처방 #{index + 1}</PrescriptionTitle>
                    {record.prescriptions.length > 1 && (
                      <RemoveButton type="button" onClick={() => removePrescription(index)}>
                        <i className="fas fa-times"></i> 삭제
                      </RemoveButton>
                    )}
                  </PrescriptionHeader>
                  
                  <PrescriptionForm>
                    <PrescriptionField>
                      <FormLabel htmlFor={`prescription-name-${index}`}>약품명 <Required>*</Required></FormLabel>
                      <Input
                        type="text"
                        id={`prescription-name-${index}`}
                        value={prescription.name}
                        onChange={(e) => handlePrescriptionChange(index, 'name', e.target.value)}
                        placeholder="약품명"
                        required={index === 0}
                      />
                    </PrescriptionField>
                    
                    <PrescriptionField>
                      <FormLabel htmlFor={`prescription-dosage-${index}`}>용량 <Required>*</Required></FormLabel>
                      <Input
                        type="text"
                        id={`prescription-dosage-${index}`}
                        value={prescription.dosage}
                        onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                        placeholder="1일 3회 1정"
                        required={index === 0}
                      />
                    </PrescriptionField>
                    
                    <PrescriptionField>
                      <FormLabel htmlFor={`prescription-instructions-${index}`}>복용법 <Required>*</Required></FormLabel>
                      <Input
                        type="text"
                        id={`prescription-instructions-${index}`}
                        value={prescription.instructions}
                        onChange={(e) => handlePrescriptionChange(index, 'instructions', e.target.value)}
                        placeholder="식후 30분"
                        required={index === 0}
                      />
                    </PrescriptionField>
                    
                    <PrescriptionField>
                      <FormLabel htmlFor={`prescription-period-${index}`}>기간 <Required>*</Required></FormLabel>
                      <Input
                        type="text"
                        id={`prescription-period-${index}`}
                        value={prescription.period}
                        onChange={(e) => handlePrescriptionChange(index, 'period', e.target.value)}
                        placeholder="2주"
                        required={index === 0}
                      />
                    </PrescriptionField>
                  </PrescriptionForm>
                </PrescriptionContainer>
              ))}
            </FormSection>
            
            <FormActions>
              <CancelButton type="button" onClick={() => navigate(`/doctor/patients/${patientId}/records`)}>
                취소
              </CancelButton>
              <SubmitButton type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <ButtonSpinner />
                    저장 중...
                  </>
                ) : (
                  '저장하기'
                )}
              </SubmitButton>
            </FormActions>
          </FormContainer>
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

const FormHeader = styled.div`
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

const FormTitle = styled.h1`
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

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
`;

const FormSection = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: var(--spacing-lg);
  box-shadow: ${props => props.theme.shadows.sm};
`;

const SectionTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
`;

const FormGroup = styled.div`
  margin-bottom: var(--spacing-md);
`;

const FormLabel = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[700]};
  margin-bottom: var(--spacing-xs);
`;

const Required = styled.span`
  color: var(--error-color);
  margin-left: var(--spacing-xs);
`;

const Input = styled.input`
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(242, 151, 179, 0.2);
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray[400]};
  }
`;

const DateInput = styled(Input)`
  width: auto;
  min-width: 200px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(242, 151, 179, 0.2);
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray[400]};
  }
`;

const PrescriptionContainer = styled.div`
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: var(--background-light);
`;

const PrescriptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
`;

const PrescriptionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: var(--text-color);
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--error-color);
  background-color: transparent;
  border: none;
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PrescriptionForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const PrescriptionField = styled.div`
  margin-bottom: var(--spacing-xs);
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  color: var(--primary-color);
  background-color: white;
  border: 1px solid var(--primary-color);
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column-reverse;
  }
`;

const Button = styled.button`
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
  }
`;

const CancelButton = styled(Button)`
  background-color: white;
  color: ${props => props.theme.colors.gray[700]};
  border: 1px solid ${props => props.theme.colors.gray[300]};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
  }
`;

const SubmitButton = styled(Button)`
  background-color: var(--primary-color);
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #e3819d;
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.sm};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray[400]};
    cursor: not-allowed;
  }
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

const ButtonSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
`;

const LoadingText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.gray[600]};
`;

export default MedicalRecordFormPage;