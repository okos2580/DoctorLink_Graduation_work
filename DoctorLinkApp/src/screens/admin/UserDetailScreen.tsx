import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator, Avatar, Dialog, Portal, TextInput, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, User } from '../../types';

type UserDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserDetail'>;
type UserDetailScreenRouteProp = RouteProp<RootStackParamList, 'UserDetail'>;

interface Props {
  navigation: UserDetailScreenNavigationProp;
  route: UserDetailScreenRouteProp;
}

const UserDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});

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
      lastLogin: '2024-12-01T10:30:00Z',
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
      lastLogin: '2024-12-01T09:15:00Z',
      licenseNumber: 'DOC-12345',
      specialization: '내과',
      hospitalId: 'hosp-001',
      hospitalName: '서울대학교병원',
      department: '내과',
      experience: 10,
      education: '서울대학교 의과대학',
    },
    {
      id: 'admin-001',
      email: 'admin1@test.com',
      name: '박관리자',
      phone: '010-3456-7890',
      birthDate: '1985-01-01',
      gender: 'male',
      address: '서울시 중구 세종대로 789',
      role: 'admin',
      status: 'active',
      registrationDate: '2024-01-01T00:00:00Z',
      lastLogin: '2024-12-01T08:00:00Z',
    },
  ];

  const loadUserDetail = async () => {
    try {
      setIsLoading(true);
      // Mock 데이터에서 사용자 찾기
      const foundUser = mockUsers.find(u => u.id === userId);
      setUser(foundUser || null);
      setEditedUser(foundUser || {});
    } catch (error) {
      console.error('사용자 상세 정보 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserDetail();
  }, [userId]);

  const getRoleText = (role: string) => {
    switch (role) {
      case 'patient': return '환자';
      case 'doctor': return '의사';
      case 'admin': return '관리자';
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#34C759';
      case 'inactive': return '#8E8E93';
      case 'suspended': return '#FF3B30';
      default: return '#8E8E93';
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

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (user && editedUser.name && editedUser.email && editedUser.phone) {
      const updatedUser = { ...user, ...editedUser };
      setUser(updatedUser);
      setShowEditDialog(false);
      Alert.alert('성공', '사용자 정보가 수정되었습니다.');
    } else {
      Alert.alert('오류', '필수 정보를 입력해주세요.');
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    setShowDeleteDialog(false);
    Alert.alert('삭제 완료', '사용자가 삭제되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() }
    ]);
  };

  const handleStatusToggle = () => {
    if (user) {
      const newStatus = user.status === 'active' ? 'suspended' : 'active';
      setUser({ ...user, status: newStatus });
      Alert.alert(
        '상태 변경', 
        `사용자 상태가 ${getStatusText(newStatus)}(으)로 변경되었습니다.`
      );
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

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text variant="headlineSmall" style={styles.errorTitle}>
            사용자를 찾을 수 없습니다
          </Text>
          <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backButton}>
            돌아가기
          </Button>
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
        <Text variant="titleLarge" style={styles.headerTitle}>사용자 상세</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 프로필 카드 */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text
              size={80}
              label={user.name.charAt(0)}
              style={[styles.avatar, { backgroundColor: user.role === 'admin' ? '#FF3B30' : user.role === 'doctor' ? '#34C759' : '#007AFF' }]}
            />
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall" style={styles.userName}>
                {user.name}
              </Text>
              <Text variant="bodyMedium" style={styles.userEmail}>
                {user.email}
              </Text>
              <View style={styles.userMeta}>
                <Chip
                  mode="flat"
                  style={[styles.roleChip, { backgroundColor: user.role === 'admin' ? '#FF3B30' : user.role === 'doctor' ? '#34C759' : '#007AFF' }]}
                  textStyle={styles.roleChipText}
                >
                  {getRoleText(user.role)}
                </Chip>
                <Chip
                  mode="flat"
                  style={[styles.statusChip, { backgroundColor: getStatusColor(user.status) }]}
                  textStyle={styles.statusChipText}
                >
                  {getStatusText(user.status)}
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 기본 정보 */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>기본 정보</Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title="전화번호"
              description={user.phone}
              left={() => <Ionicons name="call-outline" size={24} color="#8E8E93" />}
            />
            <List.Item
              title="생년월일"
              description={user.birthDate}
              left={() => <Ionicons name="calendar-outline" size={24} color="#8E8E93" />}
            />
            <List.Item
              title="성별"
              description={user.gender === 'male' ? '남성' : '여성'}
              left={() => <Ionicons name="person-outline" size={24} color="#8E8E93" />}
            />
            <List.Item
              title="주소"
              description={user.address}
              left={() => <Ionicons name="location-outline" size={24} color="#8E8E93" />}
            />
          </Card.Content>
        </Card>

        {/* 의사 전용 정보 */}
        {user.role === 'doctor' && (
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>의사 정보</Text>
              <Divider style={styles.divider} />
              
              <List.Item
                title="면허번호"
                description={user.licenseNumber}
                left={() => <Ionicons name="card-outline" size={24} color="#8E8E93" />}
              />
              <List.Item
                title="전문분야"
                description={user.specialization}
                left={() => <Ionicons name="medical-outline" size={24} color="#8E8E93" />}
              />
              <List.Item
                title="소속병원"
                description={user.hospitalName}
                left={() => <Ionicons name="business-outline" size={24} color="#8E8E93" />}
              />
              <List.Item
                title="진료과"
                description={user.department}
                left={() => <Ionicons name="fitness-outline" size={24} color="#8E8E93" />}
              />
              <List.Item
                title="경력"
                description={`${user.experience}년`}
                left={() => <Ionicons name="time-outline" size={24} color="#8E8E93" />}
              />
              <List.Item
                title="학력"
                description={user.education}
                left={() => <Ionicons name="school-outline" size={24} color="#8E8E93" />}
              />
            </Card.Content>
          </Card>
        )}

        {/* 계정 정보 */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>계정 정보</Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title="가입일"
              description={new Date(user.registrationDate).toLocaleDateString()}
              left={() => <Ionicons name="calendar-outline" size={24} color="#8E8E93" />}
            />
            {user.lastLogin && (
              <List.Item
                title="마지막 로그인"
                description={new Date(user.lastLogin).toLocaleString()}
                left={() => <Ionicons name="log-in-outline" size={24} color="#8E8E93" />}
              />
            )}
          </Card.Content>
        </Card>

        {/* 액션 버튼들 */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEdit}
            icon="create-outline"
          >
            정보 수정
          </Button>
          <Button
            mode="contained"
            style={[styles.actionButton, styles.statusButton, { backgroundColor: user.status === 'active' ? '#FF9500' : '#34C759' }]}
            onPress={handleStatusToggle}
            icon={user.status === 'active' ? 'ban-outline' : 'checkmark-outline'}
          >
            {user.status === 'active' ? '계정 정지' : '계정 활성화'}
          </Button>
          <Button
            mode="contained"
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            icon="trash-outline"
          >
            계정 삭제
          </Button>
        </View>
      </ScrollView>

      {/* 편집 다이얼로그 */}
      <Portal>
        <Dialog visible={showEditDialog} onDismiss={() => setShowEditDialog(false)}>
          <Dialog.Title>사용자 정보 수정</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="이름"
              value={editedUser.name || ''}
              onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="이메일"
              value={editedUser.email || ''}
              onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="전화번호"
              value={editedUser.phone || ''}
              onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="주소"
              value={editedUser.address || ''}
              onChangeText={(text) => setEditedUser({ ...editedUser, address: text })}
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEditDialog(false)}>취소</Button>
            <Button mode="contained" onPress={handleSaveEdit} style={styles.dialogButton}>
              저장
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* 삭제 확인 다이얼로그 */}
      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>계정 삭제</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              정말로 이 사용자 계정을 삭제하시겠습니까? 
              이 작업은 되돌릴 수 없습니다.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>취소</Button>
            <Button mode="contained" onPress={confirmDelete} style={styles.deleteButton}>
              삭제
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 24,
    color: '#FF3B30',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    color: '#1D1B20',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#8E8E93',
    marginBottom: 12,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  roleChip: {
    height: 28,
  },
  roleChipText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  infoCard: {
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
    marginBottom: 8,
    backgroundColor: '#E0E0E0',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 4,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  statusButton: {
    // backgroundColor will be set dynamically
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  dialogButton: {
    backgroundColor: '#FF3B30',
  },
});

export default UserDetailScreen; 