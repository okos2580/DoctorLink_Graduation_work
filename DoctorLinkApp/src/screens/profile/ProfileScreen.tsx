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
  TextInput,
  Button,
  Card,
  Avatar,
  RadioButton,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';

import { RootStackParamList, User, Gender } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: Gender;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  bloodType: string;
  allergies: string;
  medications: string;
  medicalHistory: string;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  
  // 상태 관리
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: 'male',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    bloodType: '',
    allergies: '',
    medications: '',
    medicalHistory: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 사용자 정보로 폼 초기화
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        birthDate: user.birthDate || '',
        gender: user.gender || 'male',
        address: user.address || '',
        emergencyContactName: user.medicalInfo?.emergencyContact?.name || '',
        emergencyContactPhone: user.medicalInfo?.emergencyContact?.phone || '',
        emergencyContactRelationship: user.medicalInfo?.emergencyContact?.relationship || '',
        bloodType: user.medicalInfo?.bloodType || '',
        allergies: user.medicalInfo?.allergies?.join(', ') || '',
        medications: user.medicalInfo?.medications?.join(', ') || '',
        medicalHistory: user.medicalInfo?.medicalHistory?.join(', ') || '',
      });
      
      if (user.birthDate) {
        setSelectedDate(new Date(user.birthDate));
      }
    }
  }, [user]);

  // 폼 데이터 업데이트
  const updateFormData = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 날짜 선택 핸들러
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      updateFormData('birthDate', selectedDate.toISOString().split('T')[0]);
    }
  };

  // 프로필 저장
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // 필수 필드 검증
      if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
        Alert.alert('입력 오류', '이름, 이메일, 전화번호는 필수 입력 항목입니다.');
        return;
      }

      // 사용자 정보 업데이트 객체 생성
      const updatedUserData: Partial<User> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        birthDate: formData.birthDate,
        gender: formData.gender,
        address: formData.address.trim(),
        medicalInfo: {
          bloodType: formData.bloodType || undefined,
          allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(s => s) : undefined,
          medications: formData.medications ? formData.medications.split(',').map(s => s.trim()).filter(s => s) : undefined,
          medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map(s => s.trim()).filter(s => s) : undefined,
          emergencyContact: (formData.emergencyContactName || formData.emergencyContactPhone) ? {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
            relationship: formData.emergencyContactRelationship,
          } : undefined,
        }
      };

      // 프로필 업데이트
      await updateUser(updatedUserData);
      
      Alert.alert(
        '저장 완료',
        '프로필이 성공적으로 업데이트되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('프로필 저장 오류:', error);
      Alert.alert('저장 실패', error.message || '프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 취소
  const handleCancel = () => {
    Alert.alert(
      '변경사항 취소',
      '변경된 내용이 저장되지 않습니다. 정말 취소하시겠습니까?',
      [
        { text: '계속 편집', style: 'cancel' },
        { text: '취소', onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 사진 */}
        <View style={styles.avatarContainer}>
          <Avatar.Icon
            size={100}
            icon="account"
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.changePhotoButton}>
            <Ionicons name="camera" size={20} color="#007AFF" />
            <Text variant="bodyMedium" style={styles.changePhotoText}>
              사진 변경
            </Text>
          </TouchableOpacity>
        </View>

        {/* 기본 정보 */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              기본 정보
            </Text>
            
            <TextInput
              label="이름 *"
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />
            
            <TextInput
              label="이메일 *"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email" />}
            />
            
            <TextInput
              label="전화번호 *"
              value={formData.phone}
              onChangeText={(text) => updateFormData('phone', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" />}
            />
            
            {/* 생년월일 */}
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={24} color="#49454F" />
              <View style={styles.dateContent}>
                <Text variant="bodySmall" style={styles.dateLabel}>
                  생년월일
                </Text>
                <Text variant="bodyMedium" style={styles.dateValue}>
                  {formData.birthDate ? 
                    new Date(formData.birthDate).toLocaleDateString('ko-KR') : 
                    '날짜를 선택해주세요'
                  }
                </Text>
              </View>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
            )}
            
            {/* 성별 */}
            <View style={styles.genderContainer}>
              <Text variant="bodyMedium" style={styles.genderLabel}>
                성별
              </Text>
              <RadioButton.Group 
                onValueChange={(value) => updateFormData('gender', value)}
                value={formData.gender}
              >
                <View style={styles.genderOptions}>
                  <View style={styles.genderOption}>
                    <RadioButton value="male" />
                    <Text variant="bodyMedium">남성</Text>
                  </View>
                  <View style={styles.genderOption}>
                    <RadioButton value="female" />
                    <Text variant="bodyMedium">여성</Text>
                  </View>
                </View>
              </RadioButton.Group>
            </View>
            
            <TextInput
              label="주소"
              value={formData.address}
              onChangeText={(text) => updateFormData('address', text)}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={2}
              left={<TextInput.Icon icon="map-marker" />}
            />
          </Card.Content>
        </Card>

        {/* 응급 연락처 */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              응급 연락처
            </Text>
            
            <TextInput
              label="응급 연락처 이름"
              value={formData.emergencyContactName}
              onChangeText={(text) => updateFormData('emergencyContactName', text)}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account-heart" />}
            />
            
            <TextInput
              label="응급 연락처 전화번호"
              value={formData.emergencyContactPhone}
              onChangeText={(text) => updateFormData('emergencyContactPhone', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone-alert" />}
            />
            
            <TextInput
              label="관계"
              value={formData.emergencyContactRelationship}
              onChangeText={(text) => updateFormData('emergencyContactRelationship', text)}
              mode="outlined"
              style={styles.input}
              placeholder="예: 배우자, 자녀, 부모 등"
              left={<TextInput.Icon icon="heart" />}
            />
          </Card.Content>
        </Card>

        {/* 의료 정보 */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              의료 정보
            </Text>
            
            <TextInput
              label="혈액형"
              value={formData.bloodType}
              onChangeText={(text) => updateFormData('bloodType', text)}
              mode="outlined"
              style={styles.input}
              placeholder="예: A+, B-, AB+ 등"
              left={<TextInput.Icon icon="water" />}
            />
            
            <TextInput
              label="알레르기"
              value={formData.allergies}
              onChangeText={(text) => updateFormData('allergies', text)}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={2}
              placeholder="알레르기가 있는 약물이나 음식을 쉼표로 구분하여 입력"
              left={<TextInput.Icon icon="alert-circle" />}
            />
            
            <TextInput
              label="복용 중인 약물"
              value={formData.medications}
              onChangeText={(text) => updateFormData('medications', text)}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={2}
              placeholder="현재 복용 중인 약물을 쉼표로 구분하여 입력"
              left={<TextInput.Icon icon="medical-bag" />}
            />
            
            <TextInput
              label="과거 병력"
              value={formData.medicalHistory}
              onChangeText={(text) => updateFormData('medicalHistory', text)}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="과거 주요 질병이나 수술 이력을 쉼표로 구분하여 입력"
              left={<TextInput.Icon icon="clipboard-text" />}
            />
          </Card.Content>
        </Card>

        {/* 버튼 */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '저장'}
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            disabled={isLoading}
          >
            취소
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    backgroundColor: '#007AFF',
    marginBottom: 12,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#007AFF',
    marginLeft: 6,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
    backgroundColor: '#F8F9FA',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#79747E',
    marginBottom: 12,
  },
  dateContent: {
    marginLeft: 12,
    flex: 1,
  },
  dateLabel: {
    color: '#49454F',
    marginBottom: 2,
  },
  dateValue: {
    color: '#1D1B20',
  },
  genderContainer: {
    marginBottom: 12,
  },
  genderLabel: {
    color: '#49454F',
    marginBottom: 8,
  },
  genderOptions: {
    flexDirection: 'row',
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  buttonContainer: {
    marginTop: 24,
  },
  saveButton: {
    borderRadius: 8,
    marginBottom: 12,
    paddingVertical: 4,
  },
  cancelButton: {
    borderRadius: 8,
  },
});

export default ProfileScreen;