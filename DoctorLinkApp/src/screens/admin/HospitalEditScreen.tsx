import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  ActivityIndicator,
  SegmentedButtons,
  Switch,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { RootStackParamList, Hospital, OperatingHours } from '../../types';

type HospitalEditScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HospitalEdit'>;
type HospitalEditScreenRouteProp = RouteProp<RootStackParamList, 'HospitalEdit'>;

interface Props {
  navigation: HospitalEditScreenNavigationProp;
  route: HospitalEditScreenRouteProp;
}

const HospitalEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const { hospitalId } = route.params || {};
  const isEditMode = !!hospitalId;

  // 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 병원 기본 정보
  const [name, setName] = useState('');
  const [type, setType] = useState('병원');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'pending'>('active');

  // 진료과목
  const [departments, setDepartments] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState('');

  // 편의시설
  const [facilities, setFacilities] = useState<string[]>([]);
  const [newFacility, setNewFacility] = useState('');

  // 운영시간
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    monday: '09:00-18:00',
    tuesday: '09:00-18:00',
    wednesday: '09:00-18:00',
    thursday: '09:00-18:00',
    friday: '09:00-18:00',
    saturday: '09:00-13:00',
    sunday: '휴진',
  });

  // 컴포넌트 마운트 시 병원 데이터 로드
  useEffect(() => {
    if (isEditMode) {
      loadHospitalData();
    }
  }, [hospitalId]);

  // 병원 데이터 로드
  const loadHospitalData = async () => {
    try {
      setIsLoading(true);

      // Mock 데이터 (실제로는 API 호출)
      const mockHospital: Hospital = {
        id: hospitalId!,
        name: '서울대학교병원',
        type: '종합병원',
        address: '서울시 종로구 대학로 101',
        phone: '02-2072-2114',
        email: 'info@snuh.org',
        website: 'https://www.snuh.org',
        rating: 4.8,
        reviewCount: 1234,
        distance: 2.5,
        departments: ['내과', '외과', '소아과', '산부인과'],
        operatingHours: {
          monday: '08:00-18:00',
          tuesday: '08:00-18:00',
          wednesday: '08:00-18:00',
          thursday: '08:00-18:00',
          friday: '08:00-18:00',
          saturday: '08:00-13:00',
          sunday: '09:00-13:00',
        },
        doctors: [],
        status: 'active',
        registrationDate: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z',
        description: '최고의 의료진과 첨단 시설을 갖춘 종합병원',
        facilities: ['주차장', 'MRI', 'CT', '응급실'],
      };

      // 데이터 설정
      setName(mockHospital.name);
      setType(mockHospital.type);
      setAddress(mockHospital.address);
      setPhone(mockHospital.phone);
      setEmail(mockHospital.email);
      setWebsite(mockHospital.website || '');
      setDescription(mockHospital.description);
      setStatus(mockHospital.status);
      setDepartments(mockHospital.departments);
      setFacilities(mockHospital.facilities);
      setOperatingHours(mockHospital.operatingHours);
    } catch (error) {
      console.error('병원 데이터 로드 오류:', error);
      Alert.alert('오류', '병원 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 진료과목 추가
  const handleAddDepartment = () => {
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      setDepartments([...departments, newDepartment.trim()]);
      setNewDepartment('');
    }
  };

  // 진료과목 제거
  const handleRemoveDepartment = (dept: string) => {
    setDepartments(departments.filter(d => d !== dept));
  };

  // 편의시설 추가
  const handleAddFacility = () => {
    if (newFacility.trim() && !facilities.includes(newFacility.trim())) {
      setFacilities([...facilities, newFacility.trim()]);
      setNewFacility('');
    }
  };

  // 편의시설 제거
  const handleRemoveFacility = (facility: string) => {
    setFacilities(facilities.filter(f => f !== facility));
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('오류', '병원 이름을 입력해주세요.');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('오류', '주소를 입력해주세요.');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('오류', '전화번호를 입력해주세요.');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('오류', '이메일을 입력해주세요.');
      return false;
    }
    if (departments.length === 0) {
      Alert.alert('오류', '진료과목을 최소 1개 이상 추가해주세요.');
      return false;
    }
    return true;
  };

  // 저장 처리
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      // Mock 저장 (실제로는 API 호출)
      const hospitalData: Partial<Hospital> = {
        name,
        type,
        address,
        phone,
        email,
        website: website || undefined,
        description,
        status,
        departments,
        facilities,
        operatingHours,
      };

      console.log('병원 정보 저장:', hospitalData);

      // 저장 완료 후
      Alert.alert(
        '성공',
        isEditMode ? '병원 정보가 수정되었습니다.' : '병원이 등록되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('병원 정보 저장 오류:', error);
      Alert.alert('오류', '병원 정보 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            병원 정보를 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 기본 정보 */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                기본 정보
              </Text>

              <TextInput
                label="병원 이름 *"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                placeholder="예: 서울대학교병원"
              />

              <View style={styles.typeSelector}>
                <Text variant="bodyMedium" style={styles.label}>
                  병원 유형 *
                </Text>
                <SegmentedButtons
                  value={type}
                  onValueChange={setType}
                  buttons={[
                    { value: '종합병원', label: '종합병원' },
                    { value: '병원', label: '병원' },
                    { value: '의원', label: '의원' },
                  ]}
                  style={styles.segmentedButtons}
                />
              </View>

              <TextInput
                label="주소 *"
                value={address}
                onChangeText={setAddress}
                mode="outlined"
                style={styles.input}
                placeholder="예: 서울시 강남구 테헤란로 123"
                multiline
              />

              <TextInput
                label="전화번호 *"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                style={styles.input}
                placeholder="예: 02-1234-5678"
                keyboardType="phone-pad"
              />

              <TextInput
                label="이메일 *"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                placeholder="예: info@hospital.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                label="웹사이트"
                value={website}
                onChangeText={setWebsite}
                mode="outlined"
                style={styles.input}
                placeholder="예: https://www.hospital.com"
                keyboardType="url"
                autoCapitalize="none"
              />

              <TextInput
                label="소개"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                style={styles.input}
                placeholder="병원 소개를 입력해주세요"
                multiline
                numberOfLines={4}
              />
            </Card.Content>
          </Card>

          {/* 진료과목 */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                진료과목 *
              </Text>

              <View style={styles.addItemContainer}>
                <TextInput
                  value={newDepartment}
                  onChangeText={setNewDepartment}
                  mode="outlined"
                  style={styles.addItemInput}
                  placeholder="진료과목 입력"
                  onSubmitEditing={handleAddDepartment}
                />
                <Button
                  mode="contained"
                  onPress={handleAddDepartment}
                  style={styles.addButton}
                  compact
                >
                  추가
                </Button>
              </View>

              <View style={styles.chipsContainer}>
                {departments.map((dept) => (
                  <Chip
                    key={dept}
                    onClose={() => handleRemoveDepartment(dept)}
                    style={styles.chip}
                  >
                    {dept}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* 편의시설 */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                편의시설
              </Text>

              <View style={styles.addItemContainer}>
                <TextInput
                  value={newFacility}
                  onChangeText={setNewFacility}
                  mode="outlined"
                  style={styles.addItemInput}
                  placeholder="편의시설 입력"
                  onSubmitEditing={handleAddFacility}
                />
                <Button
                  mode="contained"
                  onPress={handleAddFacility}
                  style={styles.addButton}
                  compact
                >
                  추가
                </Button>
              </View>

              <View style={styles.chipsContainer}>
                {facilities.map((facility) => (
                  <Chip
                    key={facility}
                    onClose={() => handleRemoveFacility(facility)}
                    style={styles.chip}
                  >
                    {facility}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* 운영시간 */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                운영시간
              </Text>

              {Object.entries(operatingHours).map(([day, hours]) => {
                const dayLabels: { [key: string]: string } = {
                  monday: '월요일',
                  tuesday: '화요일',
                  wednesday: '수요일',
                  thursday: '목요일',
                  friday: '금요일',
                  saturday: '토요일',
                  sunday: '일요일',
                };

                return (
                  <View key={day} style={styles.hoursRow}>
                    <Text variant="bodyMedium" style={styles.dayLabel}>
                      {dayLabels[day]}
                    </Text>
                    <TextInput
                      value={hours}
                      onChangeText={(value) =>
                        setOperatingHours({ ...operatingHours, [day]: value })
                      }
                      mode="outlined"
                      style={styles.hoursInput}
                      placeholder="09:00-18:00"
                    />
                  </View>
                );
              })}
            </Card.Content>
          </Card>

          {/* 상태 */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                상태
              </Text>

              <SegmentedButtons
                value={status}
                onValueChange={(value) => setStatus(value as any)}
                buttons={[
                  { value: 'active', label: '활성' },
                  { value: 'inactive', label: '비활성' },
                  { value: 'pending', label: '대기' },
                ]}
              />
            </Card.Content>
          </Card>

          {/* 액션 버튼 */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.actionButton}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={[styles.actionButton, styles.saveButton]}
              loading={isSaving}
              disabled={isSaving}
            >
              {isEditMode ? '수정' : '등록'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    color: '#1D1B20',
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  typeSelector: {
    marginBottom: 12,
  },
  label: {
    color: '#49454F',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 12,
  },
  addItemContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  addItemInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayLabel: {
    width: 80,
    color: '#49454F',
  },
  hoursInput: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: '#FF3B30',
  },
});

export default HospitalEditScreen;














