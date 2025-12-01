import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  Chip,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// 타입 import
import { RootStackParamList, TabParamList, Hospital, Reservation } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import hospitalService from '../../services/hospitalService';
import reservationService from '../../services/reservationService';

// 네비게이션 타입
type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  
  // 상태 관리
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 데이터 로드
  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      
      // Mock 데이터 로드 (실제 API 연결 시 위치 기반으로 변경)
      const mockHospitals = hospitalService.generateMockHospitals(5);
      const mockReservations = reservationService.generateMockReservations(3);
      
      setNearbyHospitals(mockHospitals);
      setRecentReservations(mockReservations);
    } catch (error) {
      console.error('홈 데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadHomeData();
  }, []);

  // 빠른 액션 메뉴
  const quickActions = [
    {
      id: 'hospital',
      title: '병원 찾기',
      icon: 'business' as keyof typeof Ionicons.glyphMap,
      color: '#007AFF',
      onPress: () => navigation.navigate('HospitalFinder'),
    },
    {
      id: 'reservation',
      title: '예약하기',
      icon: 'calendar' as keyof typeof Ionicons.glyphMap,
      color: '#34C759',
      onPress: () => navigation.navigate('Reservation', {}),
    },
    {
      id: 'records',
      title: '진료기록',
      icon: 'document-text' as keyof typeof Ionicons.glyphMap,
      color: '#FF9500',
      onPress: () => navigation.navigate('MedicalRecords'),
    },
    {
      id: 'emergency',
      title: '응급실',
      icon: 'medical' as keyof typeof Ionicons.glyphMap,
      color: '#FF3B30',
      onPress: () => {
        // 응급실 찾기 기능 (추후 구현)
        console.log('응급실 찾기');
      },
    },
  ];

  // 병원 카드 렌더링
  const renderHospitalCard = (hospital: Hospital, index: number) => (
    <Card 
      key={hospital.id} 
      style={[styles.hospitalCard, index === 0 && styles.firstCard]}
      onPress={() => navigation.navigate('HospitalDetail', { hospitalId: hospital.id })}
    >
      <Card.Content style={styles.hospitalContent}>
        <View style={styles.hospitalHeader}>
          <Text variant="titleMedium" style={styles.hospitalName} numberOfLines={2}>
            {hospital.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text variant="bodySmall" style={styles.rating}>
              {hospital.rating.toFixed(1)}
            </Text>
          </View>
        </View>
        
        <Text variant="bodySmall" style={styles.hospitalAddress} numberOfLines={2}>
          {hospital.address}
        </Text>
        
        <View style={styles.hospitalInfo}>
          <Chip mode="outlined" style={styles.typeChip}>
            {hospital.type}
          </Chip>
          <Text variant="bodySmall" style={styles.distance}>
            {hospital.distance ? `${hospital.distance.toFixed(1)}km` : '거리 미확인'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  // 예약 카드 렌더링
  const renderReservationCard = (reservation: Reservation) => (
    <Card 
      key={reservation.id} 
      style={styles.reservationCard}
      onPress={() => navigation.navigate('ReservationDetail', { reservationId: reservation.id })}
    >
      <Card.Content style={styles.reservationContent}>
        <View style={styles.reservationHeader}>
          <Text variant="titleSmall" style={styles.hospitalName}>
            {reservation.hospitalName}
          </Text>
          <Chip 
            mode="flat" 
            style={[
              styles.statusChip,
              { backgroundColor: reservationService.getReservationStatusColor(reservation.status) + '20' }
            ]}
            textStyle={{ color: reservationService.getReservationStatusColor(reservation.status), fontSize: 13 }}
          >
            {reservationService.getReservationStatusText(reservation.status)}
          </Chip>
        </View>
        
        <Text variant="bodyMedium" style={styles.doctorName}>
          {reservation.doctorName} 의사 · {reservation.department}
        </Text>
        
        <View style={styles.reservationTime}>
          <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
          <Text variant="bodySmall" style={styles.timeText}>
            {reservationService.formatDate(reservation.date)} {reservationService.formatTime(reservation.time)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            데이터를 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 헤더 영역 */}
        <LinearGradient
          colors={['#007AFF', '#0056CC']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <Avatar.Icon
                size={50}
                icon="account"
                style={styles.avatar}
              />
              <View style={styles.greetingContainer}>
                <Text variant="titleMedium" style={styles.greeting}>
                  안녕하세요!
                </Text>
                <Text variant="headlineSmall" style={styles.userName}>
                  {user?.name || '사용자'}님
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* 오늘의 건강 팁 */}
          <Card style={styles.tipCard}>
            <Card.Content style={styles.tipContent}>
              <View style={styles.tipHeader}>
                <Ionicons name="bulb" size={20} color="#007AFF" />
                <Text variant="titleSmall" style={styles.tipTitle}>
                  오늘의 건강 팁
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.tipText}>
                충분한 수분 섭취와 규칙적인 운동으로 건강한 하루를 시작하세요!
              </Text>
            </Card.Content>
          </Card>
        </LinearGradient>

        {/* 빠른 액션 메뉴 */}
        <View style={styles.quickActionsContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            빠른 메뉴
          </Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionItem}
                onPress={action.onPress}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={24} color="#FFFFFF" />
                </View>
                <Text variant="bodySmall" style={styles.quickActionText}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 근처 병원 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              근처 병원
            </Text>
            <Button
              mode="text"
              compact
              onPress={() => navigation.navigate('HospitalFinder')}
              style={styles.seeAllButton}
            >
              전체보기
            </Button>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {nearbyHospitals.map((hospital, index) => renderHospitalCard(hospital, index))}
          </ScrollView>
        </View>

        {/* 최근 예약 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              최근 예약
            </Text>
            <Button
              mode="text"
              compact
              onPress={() => navigation.navigate('Reservations')}
              style={styles.seeAllButton}
            >
              전체보기
            </Button>
          </View>
          
          {recentReservations.length > 0 ? (
            recentReservations.map(renderReservationCard)
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="calendar-outline" size={48} color="#8E8E93" />
                <Text variant="bodyMedium" style={styles.emptyText}>
                  최근 예약이 없습니다
                </Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('Reservation', {})}
                  style={styles.emptyButton}
                >
                  예약하기
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* 고객 지원 */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            고객 지원
          </Text>
          
          <Card style={styles.supportCard}>
            <Card.Content style={styles.supportContent}>
              <TouchableOpacity
                style={styles.supportItem}
                onPress={() => navigation.navigate('AnnouncementScreen')}
              >
                <View style={[styles.supportIcon, { backgroundColor: '#007AFF' + '15' }]}>
                  <Ionicons name="newspaper-outline" size={24} color="#007AFF" />
                </View>
                <View style={styles.supportTextContainer}>
                  <Text variant="titleSmall" style={styles.supportTitle}>
                    공지사항
                  </Text>
                  <Text variant="bodySmall" style={styles.supportSubtitle}>
                    새로운 소식 확인
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </TouchableOpacity>

              <Divider style={styles.supportDivider} />

              <TouchableOpacity
                style={styles.supportItem}
                onPress={() => navigation.navigate('FAQScreen')}
              >
                <View style={[styles.supportIcon, { backgroundColor: '#34C759' + '15' }]}>
                  <Ionicons name="help-circle-outline" size={24} color="#34C759" />
                </View>
                <View style={styles.supportTextContainer}>
                  <Text variant="titleSmall" style={styles.supportTitle}>
                    FAQ
                  </Text>
                  <Text variant="bodySmall" style={styles.supportSubtitle}>
                    자주 묻는 질문
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </TouchableOpacity>

              <Divider style={styles.supportDivider} />

              <TouchableOpacity
                style={styles.supportItem}
                onPress={() => navigation.navigate('InquiryScreen')}
              >
                <View style={[styles.supportIcon, { backgroundColor: '#FF9500' + '15' }]}>
                  <Ionicons name="chatbubble-outline" size={24} color="#FF9500" />
                </View>
                <View style={styles.supportTextContainer}>
                  <Text variant="titleSmall" style={styles.supportTitle}>
                    1:1 문의
                  </Text>
                  <Text variant="bodySmall" style={styles.supportSubtitle}>
                    문의 및 답변 확인
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </View>

        {/* 푸터 여백 */}
        <View style={styles.footer} />
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  greetingContainer: {
    marginLeft: 12,
  },
  greeting: {
    color: '#E3F2FF',
    opacity: 0.9,
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 8,
  },
  tipCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  tipContent: {
    padding: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '500',
  },
  tipText: {
    color: '#49454F',
    lineHeight: 20,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    textAlign: 'center',
    color: '#49454F',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1D1B20',
    fontWeight: '600',
  },
  seeAllButton: {
    marginRight: -8,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  hospitalCard: {
    width: 280,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  firstCard: {
    marginLeft: 0,
  },
  hospitalContent: {
    padding: 16,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hospitalName: {
    flex: 1,
    color: '#1D1B20',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    color: '#8E8E93',
  },
  hospitalAddress: {
    color: '#8E8E93',
    marginBottom: 12,
  },
  hospitalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeChip: {
    height: 28,
    paddingHorizontal: 10,
    minWidth: 65,
  },
  distance: {
    color: '#007AFF',
    fontWeight: '500',
  },
  reservationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
  },
  reservationContent: {
    padding: 16,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusChip: {
    height: 28,
    paddingHorizontal: 10,
    minWidth: 65,
  },
  doctorName: {
    color: '#49454F',
    marginBottom: 8,
  },
  reservationTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 6,
    color: '#8E8E93',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#8E8E93',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    borderRadius: 8,
  },
  supportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 16,
  },
  supportContent: {
    padding: 4,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  supportTitle: {
    color: '#1D1B20',
    fontWeight: '600',
    marginBottom: 2,
  },
  supportSubtitle: {
    color: '#8E8E93',
  },
  supportDivider: {
    marginHorizontal: 12,
    backgroundColor: '#F2F2F7',
  },
  footer: {
    height: 20,
  },
});

export default HomeScreen; 