import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Chip, Searchbar, Menu, ActivityIndicator, FAB, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList, User } from '../../types';

// 네비게이션 타입
type UserManagementScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'UserManagement'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: UserManagementScreenNavigationProp;
}

const UserManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      // Mock 사용자 데이터
      const mockUsers: User[] = [
        {
          id: 'user-001',
          email: 'patient1@test.com',
          name: '김환자',
          phone: '010-1234-5678',
          birthDate: '1990-01-01',
          gender: 'male',
          address: '서울시 강남구',
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
          address: '서울시 서초구',
          role: 'doctor',
          status: 'active',
          registrationDate: '2024-01-01T00:00:00Z',
          licenseNumber: 'DOC-12345',
          specialization: '내과',
          hospitalId: 'hosp-001',
          hospitalName: '서울대학교병원',
        },
        {
          id: 'admin-001',
          email: 'admin1@test.com',
          name: '박관리자',
          phone: '010-3456-7890',
          birthDate: '1985-01-01',
          gender: 'male',
          address: '서울시 중구',
          role: 'admin',
          status: 'active',
          registrationDate: '2024-01-01T00:00:00Z',
        },
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            사용자 데이터를 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 검색 및 필터 */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="사용자 검색..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
        
        <Menu
          visible={showRoleMenu}
          onDismiss={() => setShowRoleMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowRoleMenu(true)}
              icon="filter-variant"
              style={styles.filterButton}
            >
              {selectedRole ? getRoleText(selectedRole) : '전체'}
            </Button>
          }
        >
          <Menu.Item onPress={() => { setSelectedRole(''); setShowRoleMenu(false); }} title="전체" />
          <Menu.Item onPress={() => { setSelectedRole('patient'); setShowRoleMenu(false); }} title="환자" />
          <Menu.Item onPress={() => { setSelectedRole('doctor'); setShowRoleMenu(false); }} title="의사" />
          <Menu.Item onPress={() => { setSelectedRole('admin'); setShowRoleMenu(false); }} title="관리자" />
        </Menu>
      </View>

      {/* 결과 헤더 */}
      <View style={styles.resultHeader}>
        <Text variant="bodyMedium" style={styles.resultCount}>
          {filteredUsers.length}명의 사용자
        </Text>
      </View>

      {/* 사용자 목록 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredUsers.map((user) => (
          <Card key={user.id} style={styles.userCard}>
            <Card.Content style={styles.userContent}>
              <View style={styles.userHeader}>
                <Avatar.Text
                  size={48}
                  label={user.name.charAt(0)}
                  style={styles.avatar}
                />
                <View style={styles.userInfo}>
                  <Text variant="titleMedium" style={styles.userName}>
                    {user.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.userEmail} numberOfLines={2}>
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
                    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(user.status) }]} />
                  </View>
                </View>
              </View>

              <View style={styles.userDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="phone-portrait-outline" size={16} color="#8E8E93" />
                  <Text variant="bodySmall" style={styles.detailText}>
                    {user.phone}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
                  <Text variant="bodySmall" style={styles.detailText}>
                    가입일: {new Date(user.registrationDate).toLocaleDateString()}
                  </Text>
                </View>
                {user.role === 'doctor' && user.specialization && (
                  <View style={styles.detailRow}>
                    <Ionicons name="medical-outline" size={16} color="#8E8E93" />
                    <Text variant="bodySmall" style={styles.detailText} numberOfLines={2}>
                      전문분야: {user.specialization}
                    </Text>
                  </View>
                )}
                {user.role === 'doctor' && user.hospitalName && (
                  <View style={styles.detailRow}>
                    <Ionicons name="business-outline" size={16} color="#8E8E93" />
                    <Text variant="bodySmall" style={styles.detailText} numberOfLines={2}>
                      {user.hospitalName}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.userActions}>
                <Button
                  mode="outlined"
                  compact
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('UserDetail', { userId: user.id })}
                >
                  상세보기
                </Button>
                <Button
                  mode="contained"
                  compact
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => navigation.navigate('UserEdit', { userId: user.id })}
                >
                  편집
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        label="사용자 추가"
        style={styles.fab}
        onPress={() => navigation.navigate('UserEdit', {})}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    flex: 1,
    marginRight: 12,
    backgroundColor: '#F8F9FA',
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
  },
  filterButton: {
    alignSelf: 'center',
  },
  resultHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultCount: {
    color: '#49454F',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userContent: {
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#FF3B30',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#1D1B20',
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    color: '#8E8E93',
    marginBottom: 6,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleChip: {
    height: 24,
    marginRight: 8,
  },
  roleChipText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  userDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    color: '#49454F',
    flex: 1,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#FF3B30',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF3B30',
  },
});

export default UserManagementScreen; 