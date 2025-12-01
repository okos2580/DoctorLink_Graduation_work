import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

// 가상의 병원 및 의사 데이터 타입 정의
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  doctors: Doctor[];
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

// 임시 데이터 (실제로는 API에서 가져올 것)
const sampleHospitals: Hospital[] = [
  {
    id: 'h1',
    name: '서울 중앙 병원',
    address: '서울시 강남구 테헤란로 123',
    doctors: [
      { id: 'd1', name: '김의사', specialty: '내과', image: '/images/doctor-placeholder.svg' },
      { id: 'd2', name: '이의사', specialty: '외과', image: '/images/doctor-placeholder.svg' },
      { id: 'd3', name: '박의사', specialty: '피부과', image: '/images/doctor-placeholder.svg' },
    ]
  },
  {
    id: 'h2',
    name: '연세 세브란스 병원',
    address: '서울시 서대문구 연세로 50-1',
    doctors: [
      { id: 'd4', name: '최의사', specialty: '내과', image: '/images/doctor-placeholder.svg' },
      { id: 'd5', name: '정의사', specialty: '정형외과', image: '/images/doctor-placeholder.svg' },
    ]
  },
  {
    id: 'h3',
    name: '강남 세브란스 병원',
    address: '서울시 강남구 도산대로 123',
    doctors: [
      { id: 'd6', name: '윤의사', specialty: '소아과', image: '/images/doctor-placeholder.svg' },
      { id: 'd7', name: '한의사', specialty: '신경과', image: '/images/doctor-placeholder.svg' },
      { id: 'd8', name: '조의사', specialty: '안과', image: '/images/doctor-placeholder.svg' },
    ]
  }
];

// 특정 날짜에 대한 가상의 시간 슬롯 생성 함수
const getTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  // 9AM부터 5PM까지 30분 간격으로 시간 슬롯 생성
  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // 랜덤하게 일부 시간은 이미 예약됨 처리
      const available = Math.random() > 0.3;
      
      slots.push({
        id: `${date.toISOString().split('T')[0]}-${timeString}`,
        time: timeString,
        available
      });
    }
  }
  return slots;
};

const ReservationPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  // 상태 관리
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 사용자 정보
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // 날짜 변경 시 시간 슬롯 업데이트
  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(getTimeSlots(selectedDate));
      setSelectedTimeSlot(null); // 날짜 변경 시 선택된 시간 초기화
    }
  }, [selectedDate]);

  // 로그인한 사용자 정보 가져오기
  useEffect(() => {
    if (isAuthenticated && user) {
      setName(user.name);
      setPhone(user.phone);
      setEmail(user.email);
    }
  }, [isAuthenticated, user]);

  // 다음 단계로 이동하는 함수
  const goToNextStep = () => {
    // 각 단계에서 필요한 유효성 검사 수행
    if (currentStep === 1 && !selectedHospital) {
      alert('병원을 선택해주세요.');
      return;
    }
    
    if (currentStep === 2 && !selectedDoctor) {
      alert('의사를 선택해주세요.');
      return;
    }
    
    if (currentStep === 3 && !selectedTimeSlot) {
      alert('시간을 선택해주세요.');
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 이전 단계로 이동하는 함수
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 예약 제출 함수
  const submitReservation = () => {
    if (!selectedHospital || !selectedDoctor || !selectedTimeSlot) {
      alert('모든 예약 정보를 입력해주세요.');
      return;
    }
    
    if (!name || !phone || !email) {
      alert('환자 정보를 모두 입력해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    
    // 여기서 실제 API 호출을 수행하게 됩니다.
    // 임시로 성공 처리
    setTimeout(() => {
      setIsSubmitting(false);
      alert('예약이 성공적으로 접수되었습니다. 예약 확인 메일을 확인해주세요.');
      
      // 예약 완료 후 초기화 또는 예약 확인 페이지로 이동
      setCurrentStep(1);
      setSelectedHospital(null);
      setSelectedDoctor(null);
      setSelectedDate(new Date());
      setSelectedTimeSlot(null);
      setReason('');
    }, 1500);
  };

  // 날짜 형식 변환 함수
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // 오늘 날짜 기준으로 최소 날짜 설정 (익일)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  
  // 최대 날짜는 3개월 후로 설정
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <PageContainer>
      <Header />
      <ReservationContainer>
        <ReservationTitle>진료 예약</ReservationTitle>
        
        <StepIndicator>
          <StepItem isActive={currentStep >= 1} isCompleted={currentStep > 1}>
            {currentStep > 1 ? (
              <StepNumberCompleted>1</StepNumberCompleted>
            ) : currentStep === 1 ? (
              <StepNumberActive>1</StepNumberActive>
            ) : (
              <StepNumber>1</StepNumber>
            )}
            {currentStep >= 1 ? (
              <StepLabelActive>병원 선택</StepLabelActive>
            ) : (
              <StepLabel>병원 선택</StepLabel>
            )}
          </StepItem>
          <StepConnector isActive={currentStep > 1} />
          <StepItem isActive={currentStep >= 2} isCompleted={currentStep > 2}>
            {currentStep > 2 ? (
              <StepNumberCompleted>2</StepNumberCompleted>
            ) : currentStep === 2 ? (
              <StepNumberActive>2</StepNumberActive>
            ) : (
              <StepNumber>2</StepNumber>
            )}
            {currentStep >= 2 ? (
              <StepLabelActive>의사 선택</StepLabelActive>
            ) : (
              <StepLabel>의사 선택</StepLabel>
            )}
          </StepItem>
          <StepConnector isActive={currentStep > 2} />
          <StepItem isActive={currentStep >= 3} isCompleted={currentStep > 3}>
            {currentStep > 3 ? (
              <StepNumberCompleted>3</StepNumberCompleted>
            ) : currentStep === 3 ? (
              <StepNumberActive>3</StepNumberActive>
            ) : (
              <StepNumber>3</StepNumber>
            )}
            {currentStep >= 3 ? (
              <StepLabelActive>날짜 및 시간</StepLabelActive>
            ) : (
              <StepLabel>날짜 및 시간</StepLabel>
            )}
          </StepItem>
          <StepConnector isActive={currentStep > 3} />
          <StepItem isActive={currentStep >= 4} isCompleted={currentStep > 4}>
            {currentStep > 4 ? (
              <StepNumberCompleted>4</StepNumberCompleted>
            ) : currentStep === 4 ? (
              <StepNumberActive>4</StepNumberActive>
            ) : (
              <StepNumber>4</StepNumber>
            )}
            {currentStep >= 4 ? (
              <StepLabelActive>예약 확인</StepLabelActive>
            ) : (
              <StepLabel>예약 확인</StepLabel>
            )}
          </StepItem>
        </StepIndicator>
        
        <ReservationCard
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 단계 1: 병원 선택 */}
          {currentStep === 1 && (
            <StepContent>
              <StepTitle>병원 선택</StepTitle>
              <HospitalList>
                {sampleHospitals.map(hospital => (
                  <HospitalItem 
                    key={hospital.id}
                    $isSelected={selectedHospital?.id === hospital.id}
                    onClick={() => setSelectedHospital(hospital)}
                  >
                    <HospitalName>{hospital.name}</HospitalName>
                    <HospitalAddress>{hospital.address}</HospitalAddress>
                    <HospitalInfo>의사 {hospital.doctors.length}명</HospitalInfo>
                  </HospitalItem>
                ))}
              </HospitalList>
            </StepContent>
          )}
          
          {/* 단계 2: 의사 선택 */}
          {currentStep === 2 && selectedHospital && (
            <StepContent>
              <StepTitle>의사 선택</StepTitle>
              <SelectedInfo>선택한 병원: {selectedHospital.name}</SelectedInfo>
              <DoctorList>
                {selectedHospital.doctors.map(doctor => (
                  <DoctorItem 
                    key={doctor.id}
                    $isSelected={selectedDoctor?.id === doctor.id}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <DoctorImageWrapper>
                      <DoctorImage 
                        src={doctor.image} 
                        alt={doctor.name} 
                        onError={(e) => {
                          // 이미지 로드 실패 시 대체 이미지 표시
                          e.currentTarget.src = '/images/doctor-placeholder.svg';
                        }}
                      />
                    </DoctorImageWrapper>
                    <DoctorInfo>
                      <DoctorName>{doctor.name}</DoctorName>
                      <DoctorSpecialty>{doctor.specialty}</DoctorSpecialty>
                    </DoctorInfo>
                  </DoctorItem>
                ))}
              </DoctorList>
            </StepContent>
          )}
          
          {/* 단계 3: 날짜 및 시간 선택 */}
          {currentStep === 3 && selectedDoctor && (
            <StepContent>
              <StepTitle>날짜 및 시간 선택</StepTitle>
              <SelectedInfo>
                {selectedHospital?.name} - {selectedDoctor.name} ({selectedDoctor.specialty})
              </SelectedInfo>
              
              <DateSelectionContainer>
                <DateLabel>날짜 선택</DateLabel>
                <DateInput 
                  type="date" 
                  value={selectedDate.toISOString().split('T')[0]}
                  min={minDate}
                  max={maxDateString}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setSelectedDate(newDate);
                  }}
                />
                <SelectedDateDisplay>
                  {formatDate(selectedDate)}
                </SelectedDateDisplay>
              </DateSelectionContainer>
              
              <TimeSelectionContainer>
                <TimeLabel>시간 선택</TimeLabel>
                <TimeSlotGrid>
                  {timeSlots.map(slot => (
                    <TimeSlotItem
                      key={slot.id}
                      isAvailable={slot.available}
                      $isSelected={selectedTimeSlot?.id === slot.id}
                      onClick={() => {
                        if (slot.available) {
                          setSelectedTimeSlot(slot);
                        }
                      }}
                      disabled={!slot.available}
                    >
                      {slot.time}
                    </TimeSlotItem>
                  ))}
                </TimeSlotGrid>
              </TimeSelectionContainer>
              
              <ReasonContainer>
                <ReasonLabel>예약 사유</ReasonLabel>
                <ReasonTextarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="증상이나 방문 목적을 간략히 작성해주세요"
                  rows={3}
                />
              </ReasonContainer>
            </StepContent>
          )}
          
          {/* 단계 4: 예약 확인 */}
          {currentStep === 4 && selectedHospital && selectedDoctor && selectedTimeSlot && (
            <StepContent>
              <StepTitle>예약 정보 확인</StepTitle>
              
              <ReservationDetails>
                <DetailItem>
                  <DetailLabel>병원</DetailLabel>
                  <DetailValue>{selectedHospital.name}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>주소</DetailLabel>
                  <DetailValue>{selectedHospital.address}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>의사</DetailLabel>
                  <DetailValue>{selectedDoctor.name} ({selectedDoctor.specialty})</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>날짜</DetailLabel>
                  <DetailValue>{formatDate(selectedDate)}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>시간</DetailLabel>
                  <DetailValue>{selectedTimeSlot.time}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>예약 사유</DetailLabel>
                  <DetailValue>{reason || '(없음)'}</DetailValue>
                </DetailItem>
              </ReservationDetails>
              
              <PatientInfoSection>
                <SectionTitle>환자 정보</SectionTitle>
                <PatientInfoContainer>
                  <DetailItem>
                    <DetailLabel>이름</DetailLabel>
                    <DetailValue>{name}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>연락처</DetailLabel>
                    <DetailValue>{phone}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>이메일</DetailLabel>
                    <DetailValue>{email}</DetailValue>
                  </DetailItem>
                </PatientInfoContainer>
              </PatientInfoSection>
              
              <TermsSection>
                <TermsCheckbox>
                  <input type="checkbox" id="termsAgree" />
                  <TermsLabel htmlFor="termsAgree">
                    개인정보 수집 및 이용에 동의합니다.
                  </TermsLabel>
                </TermsCheckbox>
              </TermsSection>
            </StepContent>
          )}
          
          <ButtonContainer>
            {currentStep > 1 && (
              <PrevButton onClick={goToPrevStep}>
                이전
              </PrevButton>
            )}
            
            {currentStep < 4 ? (
              <NextButton onClick={goToNextStep}>
                다음
              </NextButton>
            ) : (
              <SubmitButton 
                onClick={submitReservation}
                disabled={isSubmitting}
              >
                {isSubmitting ? '예약 중...' : '예약하기'}
              </SubmitButton>
            )}
          </ButtonContainer>
        </ReservationCard>
      </ReservationContainer>
      <Footer />
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ReservationContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-md);
  background-color: ${props => props.theme.colors.gray[100]};
`;

const ReservationTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-xl);
  text-align: center;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  width: 100%;
  max-width: 800px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
`;

interface StepItemProps {
  isActive: boolean;
  isCompleted: boolean;
}

const StepItem = styled.div<StepItemProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
  }
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--color-gray-300);
  color: white;
  font-weight: var(--font-weight-bold);
  transition: all var(--transition-normal);
`;

const StepNumberActive = styled(StepNumber)`
  background-color: var(--primary-color);
`;

const StepNumberCompleted = styled(StepNumber)`
  background-color: var(--success-color);
`;

const StepLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  font-weight: var(--font-weight-regular);
`;

const StepLabelActive = styled(StepLabel)`
  color: var(--text-color);
  font-weight: var(--font-weight-medium);
`;

interface StepConnectorProps {
  isActive: boolean;
}

const StepConnector = styled.div<StepConnectorProps>`
  width: 60px;
  height: 2px;
  background-color: ${props => 
    props.isActive ? 'var(--primary-color)' : props.theme.colors.gray[300]};
  transition: background-color ${props => props.theme.transition.normal};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 2px;
    height: 20px;
  }
`;

const ReservationCard = styled.div`
  width: 100%;
  max-width: 800px;
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: var(--spacing-lg) var(--spacing-md);
  }
`;

const StepContent = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const StepTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: var(--text-color);
  margin-bottom: var(--spacing-lg);
`;

const SelectedInfo = styled.div`
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: ${props => props.theme.colors.gray[100]};
  border-left: 3px solid var(--primary-color);
  color: ${props => props.theme.colors.gray[700]};
  margin-bottom: var(--spacing-md);
  font-size: ${props => props.theme.typography.fontSize.md};
`;

const HospitalList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-md);
`;

interface SelectableItemProps {
  $isSelected: boolean;
}

const HospitalItem = styled.div<SelectableItemProps>`
  padding: var(--spacing-md);
  border-radius: ${props => props.theme.borderRadius.md};
  border: 2px solid ${props => 
    props.$isSelected ? 'var(--primary-color)' : props.theme.colors.gray[300]};
  background-color: ${props => 
    props.$isSelected ? 'var(--color-primary-50)' : 'white'};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const HospitalName = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
`;

const HospitalAddress = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: var(--spacing-xs);
`;

const HospitalInfo = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[500]};
`;

const DoctorList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
`;

const DoctorItem = styled.div<SelectableItemProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: ${props => props.theme.borderRadius.md};
  border: 2px solid ${props => 
    props.$isSelected ? 'var(--primary-color)' : props.theme.colors.gray[300]};
  background-color: ${props => 
    props.$isSelected ? 'var(--color-primary-50)' : 'white'};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const DoctorImageWrapper = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
  border: 2px solid ${props => props.theme.colors.gray[300]};
`;

const DoctorImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DoctorInfo = styled.div`
  text-align: center;
`;

const DoctorName = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
`;

const DoctorSpecialty = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
`;

const DateSelectionContainer = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const DateLabel = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: var(--spacing-sm);
  color: var(--text-color);
`;

const DateInput = styled.input`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  width: 100%;
  max-width: 300px;
  margin-bottom: var(--spacing-sm);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SelectedDateDisplay = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: var(--primary-color);
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const TimeSelectionContainer = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const TimeLabel = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: var(--spacing-sm);
  color: var(--text-color);
`;

const TimeSlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: var(--spacing-sm);
`;

interface TimeSlotItemProps extends SelectableItemProps {
  isAvailable: boolean;
  disabled?: boolean;
}

const TimeSlotItem = styled.button<TimeSlotItemProps>`
  padding: var(--spacing-sm);
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => {
    if (props.$isSelected) return 'var(--primary-color)';
    if (!props.isAvailable) return props.theme.colors.gray[300];
    return props.theme.colors.gray[300];
  }};
  background-color: ${props => {
    if (props.$isSelected) return 'var(--primary-color)';
    if (!props.isAvailable) return props.theme.colors.gray[200];
    return 'white';
  }};
  color: ${props => {
    if (props.$isSelected) return 'white';
    if (!props.isAvailable) return props.theme.colors.gray[500];
    return 'var(--text-color)';
  }};
  cursor: ${props => props.isAvailable ? 'pointer' : 'not-allowed'};
  font-size: ${props => props.theme.typography.fontSize.sm};
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    border-color: ${props => props.isAvailable ? 'var(--primary-color)' : props.theme.colors.gray[300]};
    transform: ${props => props.isAvailable ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.isAvailable ? props.theme.shadows.sm : 'none'};
  }
`;

const ReasonContainer = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const ReasonLabel = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: var(--spacing-sm);
  color: var(--text-color);
`;

const ReasonTextarea = styled.textarea`
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
`;

const Button = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
`;

const PrevButton = styled(Button)`
  color: ${props => props.theme.colors.gray[700]};
  background-color: ${props => props.theme.colors.gray[200]};
  border: 1px solid ${props => props.theme.colors.gray[300]};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[300]};
  }
`;

const NextButton = styled(Button)`
  color: white;
  background-color: var(--primary-color);
  
  &:hover {
    background-color: var(--color-primary-600);
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const SubmitButton = styled(NextButton)`
  background-color: var(--success-color);
  
  &:hover {
    background-color: var(--color-success-600);
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray[400]};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ReservationDetails = styled.div`
  margin-bottom: var(--spacing-lg);
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
`;

const DetailItem = styled.div`
  display: flex;
  
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.colors.gray[300]};
  }
`;

const DetailLabel = styled.div`
  flex: 0 0 120px;
  padding: var(--spacing-sm);
  background-color: ${props => props.theme.colors.gray[100]};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border-right: 1px solid ${props => props.theme.colors.gray[300]};
`;

const DetailValue = styled.div`
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
`;

const PatientInfoSection = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: var(--spacing-md);
  color: var(--text-color);
`;

const PatientInfoContainer = styled.div`
  margin-top: var(--spacing-sm);
`;

const TermsSection = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const TermsCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const TermsLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[700]};
`;

export default ReservationPage; 