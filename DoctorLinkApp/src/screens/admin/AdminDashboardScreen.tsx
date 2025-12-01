import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../../types';

// 네비게이션 타입
type AdminDashboardScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'AdminDashboard'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: AdminDashboardScreenNavigationProp;
}

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalUsers: number;
  totalHospitals: number;
  totalReservations: number;
  activeReservations: number;
  todayReservations: number;
  userGrowth: number;
  reservationGrowth: number;
  weeklyReservations: number[];
  userTypes: { patients: number; doctors: number; admins: number };
}

const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Mock 데이터 생성
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStats: DashboardStats = {
        totalUsers: 1245,
        totalHospitals: 89,
        totalReservations: 3421,
        activeReservations: 156,
        todayReservations: 23,
        userGrowth: 12.5,
        reservationGrowth: 8.3,
        weeklyReservations: [20, 45, 28, 80, 99, 43, 23],
        userTypes: { patients: 1058, doctors: 149, admins: 38 },
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            대시보드 데이터를 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text variant="headlineSmall" style={styles.errorTitle}>
            데이터를 불러올 수 없습니다
          </Text>
          <Button mode="contained" onPress={loadDashboardData} style={styles.retryButton}>
            다시 시도
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#FF3B30']} />
        }
      >
        {/* 주요 지표 카드들 */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Card style={[styles.statCard, styles.primaryCard]}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="people" size={32} color="#FFFFFF" />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {stats.totalUsers.toLocaleString()}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  총 사용자
                </Text>
                <View style={styles.growthContainer}>
                  <Ionicons name="trending-up" size={16} color="#FFFFFF" />
                  <Text variant="bodySmall" style={styles.growthText}>
                    +{stats.userGrowth}%
                  </Text>
                </View>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, styles.secondaryCard]}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="business" size={32} color="#FFFFFF" />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {stats.totalHospitals}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  등록 병원
                </Text>
              </Card.Content>
            </Card>
          </View>

          <View style={styles.statsRow}>
            <Card style={[styles.statCard, styles.accentCard]}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="calendar" size={32} color="#FFFFFF" />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {stats.totalReservations.toLocaleString()}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  총 예약
                </Text>
                <View style={styles.growthContainer}>
                  <Ionicons name="trending-up" size={16} color="#FFFFFF" />
                  <Text variant="bodySmall" style={styles.growthText}>
                    +{stats.reservationGrowth}%
                  </Text>
                </View>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, styles.warningCard]}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="time" size={32} color="#FFFFFF" />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {stats.activeReservations}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  활성 예약
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* 오늘의 예약 */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                오늘의 예약
              </Text>
              <Chip mode="flat" style={styles.todayChip}>
                {stats.todayReservations}건
              </Chip>
            </View>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium" style={styles.sectionDescription}>
              오늘 총 {stats.todayReservations}건의 예약이 있습니다.
            </Text>
          </Card.Content>
        </Card>

        {/* 주간 예약 현황 */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              주간 예약 현황
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.weeklyStats}>
              {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
                <View key={day} style={styles.dayStats}>
                  <Text variant="bodySmall" style={styles.dayLabel}>{day}</Text>
                  <View style={[styles.dayBar, { height: Math.max(20, (stats.weeklyReservations[index] / 100) * 60) }]} />
                  <Text variant="bodySmall" style={styles.dayValue}>{stats.weeklyReservations[index]}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* 사용자 유형 분포 */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              사용자 유형 분포
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.userTypeStats}>
              <View style={styles.userTypeItem}>
                <View style={[styles.userTypeColor, { backgroundColor: '#007AFF' }]} />
                <Text variant="bodyMedium" style={styles.userTypeName}>환자</Text>
                <Text variant="titleMedium" style={styles.userTypeCount}>
                  {stats.userTypes.patients.toLocaleString()}
                </Text>
              </View>
              <View style={styles.userTypeItem}>
                <View style={[styles.userTypeColor, { backgroundColor: '#34C759' }]} />
                <Text variant="bodyMedium" style={styles.userTypeName}>의사</Text>
                <Text variant="titleMedium" style={styles.userTypeCount}>
                  {stats.userTypes.doctors.toLocaleString()}
                </Text>
              </View>
              <View style={styles.userTypeItem}>
                <View style={[styles.userTypeColor, { backgroundColor: '#FF3B30' }]} />
                <Text variant="bodyMedium" style={styles.userTypeName}>관리자</Text>
                <Text variant="titleMedium" style={styles.userTypeCount}>
                  {stats.userTypes.admins.toLocaleString()}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 빠른 액션 */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              빠른 작업
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.quickActions}>
              <Button
                mode="contained"
                icon="people"
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('UserManagement')}
              >
                사용자 관리
              </Button>
              <Button
                mode="contained"
                icon="business"
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('HospitalManagement')}
              >
                병원 관리
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* 알림 및 고객 지원 */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              알림 및 고객 지원
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.supportActions}>
              <Button
                mode="outlined"
                icon="send"
                style={[styles.supportButton, styles.primaryButton]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => navigation.navigate('NotificationSend')}
              >
                알림 발송
              </Button>
              <Button
                mode="outlined"
                icon="history"
                style={[styles.supportButton, styles.primaryButton]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => navigation.navigate('NotificationHistory')}
              >
                알림 이력
              </Button>
            </View>
            <View style={styles.supportActions}>
              <Button
                mode="outlined"
                icon="bullhorn"
                style={[styles.supportButton, styles.secondaryButton]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => navigation.navigate('AnnouncementManagement')}
              >
                공지사항
              </Button>
              <Button
                mode="outlined"
                icon="help-circle"
                style={[styles.supportButton, styles.secondaryButton]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => navigation.navigate('FAQManagement')}
              >
                FAQ 관리
              </Button>
            </View>
            <View style={styles.supportActions}>
              <Button
                mode="outlined"
                icon="chat"
                style={[styles.supportButton, styles.accentButton]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => navigation.navigate('InquiryManagement')}
              >
                문의 관리
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="refresh"
        label="새로고침"
        style={styles.fab}
        onPress={handleRefresh}
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
  retryButton: {
    backgroundColor: '#FF3B30',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryCard: {
    backgroundColor: '#FF3B30',
  },
  secondaryCard: {
    backgroundColor: '#007AFF',
  },
  accentCard: {
    backgroundColor: '#34C759',
  },
  warningCard: {
    backgroundColor: '#FF9500',
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  growthText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#1D1B20',
    fontWeight: '600',
  },
  todayChip: {
    backgroundColor: '#FF3B30',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#E0E0E0',
  },
  sectionDescription: {
    color: '#49454F',
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dayStats: {
    alignItems: 'center',
    width: 50,
  },
  dayLabel: {
    color: '#7F7F7F',
    fontSize: 12,
    marginBottom: 4,
  },
  dayBar: {
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginBottom: 4,
  },
  dayValue: {
    color: '#1D1B20',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userTypeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  userTypeItem: {
    alignItems: 'center',
    width: 100,
  },
  userTypeColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  userTypeName: {
    color: '#1D1B20',
    fontSize: 14,
    marginBottom: 4,
  },
  userTypeCount: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#FF3B30',
  },
  supportActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  supportButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  primaryButton: {
    borderColor: '#007AFF',
  },
  secondaryButton: {
    borderColor: '#34C759',
  },
  accentButton: {
    borderColor: '#FF9500',
  },
  buttonContent: {
    paddingVertical: 4,
  },
  buttonLabel: {
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF3B30',
  },
});

export default AdminDashboardScreen; 