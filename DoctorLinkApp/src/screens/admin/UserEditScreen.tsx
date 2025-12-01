import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, ActivityIndicator, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, User } from '../../types';

type UserEditScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserEdit'>;
type UserEditScreenRouteProp = RouteProp<RootStackParamList, 'UserEdit'>;

interface Props {
  navigation: UserEditScreenNavigationProp;
  route: UserEditScreenRouteProp;
}

const UserEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const isEditMode = !!userId;
  
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showGenderMenu, setShowGenderMenu] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female',
    address: '',
    role: 'patient' as 'patient' | 'doctor' | 'admin',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    // 의사 전용 필드
    licenseNumber: '',
    specialization: '',
    hospitalName: '',
    department: '',
    experience: '',
    education: '',
  });

  // Mock 사용자 데이터
  const mockUsers: User[] = [
    {
      id: 'user-001',
      email: 'patient1@test.com',
      name: '김환자',
      phone: '010-1234-5678',
      birthDate: '1990-01-01',
      gender: 'male',
      address: '서울시 강남구 테헤란로 123',
      role: 'patient',
      status: 'active',
      registrationDate: '2024-01-01T00:00:00Z',
    },
    {
      id: 'doctor-001',
      email: 'doctor1@test.com',
      name: '이의사',
      phone: '010-2345-6789',
      birthDate: '1980-01-01',
      gender: 'female',
      address: '서울시 서초구 강남대로 456',
      role: 'doctor',
      status: 'active',
      registrationDate: '2024-01-01T00:00:00Z',
      licenseNumber: 'DOC-12345',
      specialization: '내과',
      hospitalName: '서울대학교병원',
      department: '내과',
      experience: 10,
      education: '서울대학교 의과대학',
    },
  ];

  const loadUserData = async () => {
    if (isEditMode && userId) {
      setIsLoading(true);
      try {
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
          setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone,
            birthDate: user.birthDate,
            gender: user.gender,
            address: user.address,
            role: user.role,
            status: user.status,
            licenseNumber: user.licenseNumber || '',
            specialization: user.specialization || '',
            hospitalName: user.hospitalName || '',
            department: user.department || '',
            experience: user.experience?.toString() || '',
            education: user.education || '',
          });
        }
      } catch (error) {
        console.error('사용자 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const handleSave = () => {
    // 필수 필드 검증
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert('오류', '필수 정보를 입력해주세요.');
      return;
    }

    // 의사인 경우 추가 검증
    if (formData.role === 'doctor' && (!formData.licenseNumber || !formData.specialization)) {
      Alert.alert('오류', '의사 정보를 모두 입력해주세요.');
      return;
    }

    const action = isEditMode ? '수정' : '추가';
    Alert.alert(
      '성공',
      `사용자가 ${action}되었습니다.`,
      [{ text: '확인', onPress: () => navigation.goBack() }]
    );
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'patient': return '환자';
      case 'doctor': return '의사';
      case 'admin': return '관리자';
      default: return role;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'inactive': return '비활성';
      case 'suspended': return '정지';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            사용자 정보를 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text variant="titleLarge" style={styles.headerTitle}>
          {isEditMode ? '사용자 수정' : '사용자 추가'}
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text variant="titleMedium" style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 기본 정보 */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>기본 정보</Text>
            <Divider style={styles.divider} />
            
            <TextInput
              label="이름 *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="이메일 *"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
            />
            
            <TextInput
              label="전화번호 *"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
            />
            
            <TextInput
              label="생년월일"
              value={formData.birthDate}
              onChangeText={(text) => setFormData({ ...formData, birthDate: text })}
              mode="outlined"
              style={styles.input}
              placeholder="YYYY-MM-DD"
            />
            
            {/* 성별 선택 */}
            <Text variant="bodyMedium" style={styles.fieldLabel}>성별</Text>
            <Menu
              visible={showGenderMenu}
              onDismiss={() => setShowGenderMenu(false)}
              anchor={
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setShowGenderMenu(true)}
                >
                  <Text variant="bodyMedium">{formData.gender === 'male' ? '남성' : '여성'}</Text>
                  <Ionicons name="chevron-down" size={20} color="#8E8E93" />
                </TouchableOpacity>
              }
            >
              <Menu.Item onPress={() => { setFormData({ ...formData, gender: 'male' }); setShowGenderMenu(false); }} title="남성" />
              <Menu.Item onPress={() => { setFormData({ ...formData, gender: 'female' }); setShowGenderMenu(false); }} title="여성" />
            </Menu>
            
            <TextInput
              label="주소"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              mode="outlined"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* 계정 설정 */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>계정 설정</Text>
            <Divider style={styles.divider} />
            
            {/* 역할 선택 */}
            <Text variant="bodyMedium" style={styles.fieldLabel}>역할 *</Text>
            <Menu
              visible={showRoleMenu}
              onDismiss={() => setShowRoleMenu(false)}
              anchor={
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setShowRoleMenu(true)}
                >
                  <Text variant="bodyMedium">{getRoleText(formData.role)}</Text>
                  <Ionicons name="chevron-down" size={20} color="#8E8E93" />
                </TouchableOpacity>
              }
            >
              <Menu.Item onPress={() => { setFormData({ ...formData, role: 'patient' }); setShowRoleMenu(false); }} title="환자" />
              <Menu.Item onPress={() => { setFormData({ ...formData, role: 'doctor' }); setShowRoleMenu(false); }} title="의사" />
              <Menu.Item onPress={() => { setFormData({ ...formData, role: 'admin' }); setShowRoleMenu(false); }} title="관리자" />
            </Menu>
            
            {/* 상태 선택 */}
            <Text variant="bodyMedium" style={styles.fieldLabel}>상태</Text>
            <Menu
              visible={showStatusMenu}
              onDismiss={() => setShowStatusMenu(false)}
              anchor={
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setShowStatusMenu(true)}
                >
                  <Text variant="bodyMedium">{getStatusText(formData.status)}</Text>
                  <Ionicons name="chevron-down" size={20} color="#8E8E93" />
                </TouchableOpacity>
              }
            >
              <Menu.Item onPress={() => { setFormData({ ...formData, status: 'active' }); setShowStatusMenu(false); }} title="활성" />
              <Menu.Item onPress={() => { setFormData({ ...formData, status: 'inactive' }); setShowStatusMenu(false); }} title="비활성" />
              <Menu.Item onPress={() => { setFormData({ ...formData, status: 'suspended' }); setShowStatusMenu(false); }} title="정지" />
            </Menu>
          </Card.Content>
        </Card>

        {/* 의사 전용 정보 */}
        {formData.role === 'doctor' && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>의사 정보</Text>
              <Divider style={styles.divider} />
              
              <TextInput
                label="면허번호 *"
                value={formData.licenseNumber}
                onChangeText={(text) => setFormData({ ...formData, licenseNumber: text })}
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="전문분야 *"
                value={formData.specialization}
                onChangeText={(text) => setFormData({ ...formData, specialization: text })}
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="소속병원"
                value={formData.hospitalName}
                onChangeText={(text) => setFormData({ ...formData, hospitalName: text })}
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="진료과"
                value={formData.department}
                onChangeText={(text) => setFormData({ ...formData, department: text })}
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="경력(년)"
                value={formData.experience}
                onChangeText={(text) => setFormData({ ...formData, experience: text })}
                mode="outlined"
                style={styles.input}
                keyboardType="numeric"
              />
              
              <TextInput
                label="학력"
                value={formData.education}
                onChangeText={(text) => setFormData({ ...formData, education: text })}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={3}
              />
            </Card.Content>
          </Card>
        )}

        {/* 저장 버튼 */}
        <Button
          mode="contained"
          style={styles.saveButton2}
          onPress={handleSave}
          icon="content-save"
        >
          {isEditMode ? '수정하기' : '추가하기'}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionCard: {
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
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: '#E0E0E0',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  fieldLabel: {
    color: '#49454F',
    marginBottom: 8,
    marginTop: 8,
  },
  menuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8E8E93',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  saveButton2: {
    backgroundColor: '#FF3B30',
    paddingVertical: 4,
    marginTop: 16,
  },
});

export default UserEditScreen; 