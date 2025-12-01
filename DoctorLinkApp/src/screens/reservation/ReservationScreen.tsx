import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Chip,
  ActivityIndicator,
  Divider,
  RadioButton,
  SegmentedButtons,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { RootStackParamList, Hospital, Doctor, CreateReservationRequest } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import hospitalService from '../../services/hospitalService';
import reservationService from '../../services/reservationService';

type ReservationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Reservation'>;
type ReservationScreenRouteProp = RouteProp<RootStackParamList, 'Reservation'>;

interface Props {
  navigation: ReservationScreenNavigationProp;
  route: ReservationScreenRouteProp;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

const ReservationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { hospitalId, doctorId, reservationId } = route.params;
  
  // 상태 관리
  const [step, setStep] = useState(1); // 1: 병원선택, 2: 의사선택, 3: 날짜시간선택, 4: 예약정보입력
  const [isLoading, setIsLoading] = useState(false);
  
  // 데이터 상태
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  
  // 선택 상태
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // 예약 정보 상태
  const [reservationReason, setReservationReason] = useState('');
  const [reservationNotes, setReservationNotes] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  // 진료과 목록
  const departments = ['내과', '외과', '정형외과', '피부과', '안과', '이비인후과', '산부인과', '소아과'];

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 초기 데이터 로드
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // 병원 목록 로드
      const mockHospitals = hospitalService.generateMockHospitals(10);
      setHospitals(mockHospitals);
      
      // 파라미터로 병원 ID가 전달된 경우
      if (hospitalId) {
        const hospital = mockHospitals.find(h => h.id === hospitalId);
        if (hospital) {
          setSelectedHospital(hospital);
          setStep(2); // 의사 선택 단계로
          await loadDoctors(hospitalId);
        }
      }
      
      // 파라미터로 의사 ID가 전달된 경우
      if (doctorId) {
        setStep(3); // 날짜/시간 선택 단계로
      }
      
    } catch (error) {
      console.error('초기 데이터 로드 오류:', error);
      Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 의사 목록 로드
  const loadDoctors = async (hospitalId: string) => {
    try {
      setIsLoading(true);
      const hospital = hospitals.find(h => h.id === hospitalId);
      if (hospital) {
        setDoctors(hospital.doctors);
      }
    } catch (error) {
      console.error('의사 목록 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 예약 가능 시간 로드
  const loadAvailableTimeSlots = async (doctorId: string, date: Date) => {
    try {
      setIsLoading(true);
      
      // Mock 시간 슬롯 생성
      const timeSlots: TimeSlot[] = [];
      const startHour = 9;
      const endHour = 18;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          timeSlots.push({
            id: `${hour}-${minute}`,
            time: timeString,
            available: Math.random() > 0.3, // 70% 확률로 예약 가능
          });
        }
      }
      
      setAvailableTimeSlots(timeSlots);
    } catch (error) {
      console.error('예약 가능 시간 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 병원 선택 핸들러
  const handleHospitalSelect = async (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setSelectedDoctor(null); // 의사 선택 초기화
    setStep(2);
    await loadDoctors(hospital.id);
  };

  // 의사 선택 핸들러
  const handleDoctorSelect = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDepartment(doctor.department);
    setStep(3);
    await loadAvailableTimeSlots(doctor.id, selectedDate);
  };

  // 날짜 변경 핸들러
  const handleDateChange = async (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate && selectedDoctor) {
      setSelectedDate(selectedDate);
      await loadAvailableTimeSlots(selectedDoctor.id, selectedDate);
    }
  };

  // 예약 생성
  const createReservation = async () => {
    if (!selectedHospital || !selectedDoctor || !selectedTimeSlot || !reservationReason.trim()) {
      Alert.alert('입력 오류', '모든 필수 정보를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      
      const reservationData: CreateReservationRequest = {
        doctorId: selectedDoctor.id,
        hospitalId: selectedHospital.id,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTimeSlot,
        reason: reservationReason,
        notes: reservationNotes,
      };

      const response = await reservationService.createReservation(reservationData);
      
      if (response.success) {
        Alert.alert(
          '예약 완료',
          '예약이 성공적으로 생성되었습니다.',
          [
            {
              text: '확인',
              onPress: () => navigation.navigate('MainTabs'),
            },
          ]
        );
      } else {
        Alert.alert('예약 실패', response.message || '예약 생성에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('예약 생성 오류:', error);
      Alert.alert('오류', '예약 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 단계별 렌더링
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderHospitalSelection();
      case 2:
        return renderDoctorSelection();
      case 3:
        return renderDateTimeSelection();
      case 4:
        return renderReservationForm();
      default:
        return null;
    }
  };

  // 1단계: 병원 선택
  const renderHospitalSelection = () => (
    <View style={styles.stepContent}>
      <Text variant="titleLarge" style={styles.stepTitle}>
        병원을 선택해주세요
      </Text>
      
      {hospitals.map((hospital) => (
        <Card 
          key={hospital.id} 
          style={styles.selectionCard}
          onPress={() => handleHospitalSelect(hospital)}
        >
          <Card.Content style={styles.hospitalCardContent}>
            <View style={styles.hospitalHeader}>
              <Text variant="titleMedium" style={styles.hospitalName}>
                {hospital.name}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text variant="bodySmall" style={styles.rating}>
                  {hospital.rating.toFixed(1)}
                </Text>
              </View>
            </View>
            
            <Text variant="bodyMedium" style={styles.hospitalAddress}>
              {hospital.address}
            </Text>
            
            <View style={styles.departmentsContainer}>
              {hospital.departments.slice(0, 3).map((dept, index) => (
                <Chip key={index} mode="outlined" compact style={styles.departmentChip}>
                  {dept}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  // 2단계: 의사 선택
  const renderDoctorSelection = () => (
    <View style={styles.stepContent}>
      <Text variant="titleLarge" style={styles.stepTitle}>
        의사를 선택해주세요
      </Text>
      
      <Card style={styles.selectedInfoCard}>
        <Card.Content>
          <Text variant="bodySmall" style={styles.selectedLabel}>선택된 병원</Text>
          <Text variant="titleMedium">{selectedHospital?.name}</Text>
        </Card.Content>
      </Card>

      {doctors.map((doctor) => (
        <Card 
          key={doctor.id} 
          style={styles.selectionCard}
          onPress={() => handleDoctorSelect(doctor)}
        >
          <Card.Content style={styles.doctorCardContent}>
            <View style={styles.doctorHeader}>
              <Text variant="titleMedium" style={styles.doctorName}>
                {doctor.name} 의사
              </Text>
              <Chip mode="outlined" compact>
                {doctor.department}
              </Chip>
            </View>
            
            <Text variant="bodyMedium" style={styles.doctorSpecialization}>
              전문분야: {doctor.specialization}
            </Text>
            
            <Text variant="bodySmall" style={styles.doctorExperience}>
              경력 {doctor.experience}년
            </Text>
            
            {doctor.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text variant="bodySmall" style={styles.rating}>
                  {doctor.rating.toFixed(1)} ({doctor.reviewCount}개 리뷰)
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  // 3단계: 날짜/시간 선택
  const renderDateTimeSelection = () => (
    <View style={styles.stepContent}>
      <Text variant="titleLarge" style={styles.stepTitle}>
        예약 날짜와 시간을 선택해주세요
      </Text>
      
      <Card style={styles.selectedInfoCard}>
        <Card.Content>
          <Text variant="bodySmall" style={styles.selectedLabel}>선택된 의사</Text>
          <Text variant="titleMedium">{selectedDoctor?.name} 의사</Text>
          <Text variant="bodyMedium">{selectedHospital?.name}</Text>
        </Card.Content>
      </Card>

      {/* 날짜 선택 */}
      <Card style={styles.dateCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            예약 날짜
          </Text>
          
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
            <Text variant="titleMedium" style={styles.dateButtonText}>
              {selectedDate.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'short'
              })}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
              maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30일 후까지
            />
          )}
        </Card.Content>
      </Card>

      {/* 시간 선택 */}
      <Card style={styles.timeCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            예약 시간
          </Text>
          
          <View style={styles.timeSlotsContainer}>
            {availableTimeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlot,
                  !slot.available && styles.timeSlotDisabled,
                  selectedTimeSlot === slot.time && styles.timeSlotSelected,
                ]}
                onPress={() => slot.available && setSelectedTimeSlot(slot.time)}
                disabled={!slot.available}
              >
                <Text 
                  style={[
                    styles.timeSlotText,
                    !slot.available && styles.timeSlotTextDisabled,
                    selectedTimeSlot === slot.time && styles.timeSlotTextSelected,
                  ]}
                >
                  {slot.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {selectedTimeSlot && (
            <Button
              mode="contained"
              style={styles.nextButton}
              onPress={() => setStep(4)}
            >
              다음 단계
            </Button>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  // 4단계: 예약 정보 입력
  const renderReservationForm = () => (
    <View style={styles.stepContent}>
      <Text variant="titleLarge" style={styles.stepTitle}>
        예약 정보를 입력해주세요
      </Text>
      
      {/* 예약 요약 */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.summaryTitle}>
            예약 요약
          </Text>
          <Divider style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>병원</Text>
            <Text variant="bodyMedium">{selectedHospital?.name}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>의사</Text>
            <Text variant="bodyMedium">{selectedDoctor?.name} 의사</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>진료과</Text>
            <Text variant="bodyMedium">{selectedDoctor?.department}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>날짜</Text>
            <Text variant="bodyMedium">
              {selectedDate.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'short'
              })}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>시간</Text>
            <Text variant="bodyMedium">{selectedTimeSlot}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* 예약 목적 */}
      <Card style={styles.formCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.formSectionTitle}>
            진료 목적 *
          </Text>
          
          <TextInput
            label="진료받고 싶은 증상이나 목적을 입력해주세요"
            value={reservationReason}
            onChangeText={setReservationReason}
            mode="outlined"
            style={styles.textInput}
            multiline
            numberOfLines={3}
            placeholder="예: 감기 증상, 정기 검진, 복통 등"
          />
        </Card.Content>
      </Card>

      {/* 추가 메모 */}
      <Card style={styles.formCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.formSectionTitle}>
            추가 메모 (선택사항)
          </Text>
          
          <TextInput
            label="의사에게 전달하고 싶은 내용"
            value={reservationNotes}
            onChangeText={setReservationNotes}
            mode="outlined"
            style={styles.textInput}
            multiline
            numberOfLines={2}
            placeholder="알레르기, 복용 중인 약물, 특이사항 등"
          />
        </Card.Content>
      </Card>

      {/* 예약 완료 버튼 */}
      <Button
        mode="contained"
        style={styles.completeButton}
        onPress={createReservation}
        loading={isLoading}
        disabled={isLoading || !reservationReason.trim()}
      >
        {isLoading ? '예약 생성 중...' : '예약 완료'}
      </Button>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 진행 상태 표시 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {[1, 2, 3, 4].map((stepNumber) => (
            <View
              key={stepNumber}
              style={[
                styles.progressStep,
                step >= stepNumber && styles.progressStepActive,
              ]}
            />
          ))}
        </View>
        <Text variant="bodySmall" style={styles.progressText}>
          {step}/4 단계
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text variant="bodyMedium" style={styles.loadingText}>
              로딩 중...
            </Text>
          </View>
        ) : (
          renderStepContent()
        )}
      </ScrollView>

      {/* 하단 네비게이션 */}
      {step > 1 && (
        <View style={styles.bottomNavigation}>
          <Button
            mode="outlined"
            onPress={() => setStep(step - 1)}
            style={styles.navButton}
          >
            이전
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#007AFF',
  },
  progressText: {
    textAlign: 'center',
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#1D1B20',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    color: '#8E8E93',
  },
  selectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedInfoCard: {
    backgroundColor: '#E3F2FF',
    borderRadius: 12,
    marginBottom: 16,
  },
  selectedLabel: {
    color: '#007AFF',
    marginBottom: 4,
  },
  hospitalCardContent: {
    padding: 16,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hospitalName: {
    flex: 1,
    color: '#1D1B20',
    fontWeight: '600',
  },
  hospitalAddress: {
    color: '#8E8E93',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    color: '#8E8E93',
  },
  departmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  departmentChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  doctorCardContent: {
    padding: 16,
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  doctorName: {
    flex: 1,
    color: '#1D1B20',
    fontWeight: '600',
  },
  doctorSpecialization: {
    color: '#49454F',
    marginBottom: 4,
  },
  doctorExperience: {
    color: '#8E8E93',
    marginBottom: 8,
  },
  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  timeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#1D1B20',
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateButtonText: {
    marginLeft: 12,
    color: '#1D1B20',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeSlotSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeSlotDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  timeSlotText: {
    color: '#1D1B20',
    fontSize: 14,
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timeSlotTextDisabled: {
    color: '#C0C0C0',
  },
  nextButton: {
    borderRadius: 8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    marginBottom: 8,
    color: '#1D1B20',
    fontWeight: '600',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#E0E0E0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#8E8E93',
    flex: 1,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  formSectionTitle: {
    marginBottom: 12,
    color: '#1D1B20',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#F8F9FA',
  },
  completeButton: {
    borderRadius: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  bottomNavigation: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    borderRadius: 8,
  },
});

export default ReservationScreen; 