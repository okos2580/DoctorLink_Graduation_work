import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  FAB,
  ActivityIndicator,
  Searchbar,
  SegmentedButtons,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// 타입 import
import { RootStackParamList, TabParamList, Reservation, ReservationStatus } from '../../types';
import reservationService from '../../services/reservationService';

// 네비게이션 타입
type ReservationManagementScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Reservations'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: ReservationManagementScreenNavigationProp;
}

const ReservationManagementScreen: React.FC<Props> = ({ navigation }) => {
  // 상태 관리
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ReservationStatus | 'all'>('all');

  // 필터 옵션
  const statusOptions = [
    { value: 'all', label: '전체' },
    { value: 'pending', label: '대기중' },
    { value: 'approved', label: '승인됨' },
    { value: 'completed', label: '완료' },
    { value: 'cancelled', label: '취소됨' },
  ];

  // 데이터 로드
  const loadReservations = async () => {
    try {
      setIsLoading(true);
      
      // Mock 데이터 로드
      const mockReservations = reservationService.generateMockReservations(15);
      const sortedReservations = reservationService.sortReservationsByDate(mockReservations, false);
      
      setReservations(sortedReservations);
      setFilteredReservations(sortedReservations);
    } catch (error) {
      console.error('예약 데이터 로드 오류:', error);
      Alert.alert('오류', '예약 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    await loadReservations();
    setRefreshing(false);
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadReservations();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = [...reservations];

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reservation =>
        reservation.hospitalName.toLowerCase().includes(query) ||
        reservation.doctorName.toLowerCase().includes(query) ||
        reservation.department.toLowerCase().includes(query)
      );
    }

    // 상태 필터링
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === selectedStatus);
    }

    setFilteredReservations(filtered);
  }, [reservations, searchQuery, selectedStatus]);

  // 예약 취소
  const handleCancelReservation = (reservation: Reservation) => {
    if (!reservationService.canCancelReservation(reservation)) {
      Alert.alert(
        '취소 불가',
        '예약 시간 24시간 전까지만 취소가 가능합니다.'
      );
      return;
    }

    Alert.alert(
      '예약 취소',
      `${reservation.hospitalName} 예약을 취소하시겠습니까?`,
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          style: 'destructive',
          onPress: async () => {
            try {
              // API 호출
              await reservationService.cancelReservation(reservation.id, '사용자 취소');
              Alert.alert('완료', '예약이 취소되었습니다.');
              await loadReservations();
            } catch (error) {
              console.error('예약 취소 오류:', error);
              Alert.alert('오류', '예약 취소에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 예약 수정
  const handleModifyReservation = (reservation: Reservation) => {
    if (!reservationService.canModifyReservation(reservation)) {
      Alert.alert(
        '수정 불가',
        '예약 시간 48시간 전까지만 수정이 가능합니다.'
      );
      return;
    }

    // 예약 수정 화면으로 이동
    navigation.navigate('Reservation', { 
      hospitalId: reservation.hospitalId,
      doctorId: reservation.doctorId,
      reservationId: reservation.id
    });
  };

  // 예약 카드 렌더링
  const renderReservationItem = ({ item: reservation }: { item: Reservation }) => {
    const statusColor = reservationService.getReservationStatusColor(reservation.status);
    const statusText = reservationService.getReservationStatusText(reservation.status);
    const canCancel = reservationService.canCancelReservation(reservation);
    const canModify = reservationService.canModifyReservation(reservation);

    return (
      <Card 
        style={styles.reservationCard}
        onPress={() => navigation.navigate('ReservationDetail', { reservationId: reservation.id })}
      >
        <Card.Content style={styles.cardContent}>
          {/* 헤더 */}
          <View style={styles.cardHeader}>
            <View style={styles.hospitalInfo}>
              <Text variant="titleMedium" style={styles.hospitalName} numberOfLines={1} ellipsizeMode="tail">
                {reservation.hospitalName}
              </Text>
              <Chip 
                mode="flat" 
                style={[
                  styles.statusChip,
                  { backgroundColor: statusColor + '20' }
                ]}
                textStyle={{ color: statusColor, fontSize: 14, fontWeight: '600', paddingHorizontal: 8 }}
              >
                {statusText}
              </Chip>
            </View>
          </View>

          {/* 의사 정보 */}
          <View style={styles.doctorInfo}>
            <Ionicons name="person" size={16} color="#8E8E93" />
            <Text variant="bodyMedium" style={styles.doctorText}>
              {reservation.doctorName} 의사 · {reservation.department}
            </Text>
          </View>

          {/* 예약 시간 */}
          <View style={styles.timeInfo}>
            <Ionicons name="calendar" size={16} color="#8E8E93" />
            <Text variant="bodyMedium" style={styles.timeText}>
              {reservationService.formatDate(reservation.date)}
            </Text>
            <Ionicons name="time" size={16} color="#8E8E93" style={{ marginLeft: 12 }} />
            <Text variant="bodyMedium" style={styles.timeText}>
              {reservationService.formatTime(reservation.time)}
            </Text>
          </View>

          {/* 예약 사유 */}
          {reservation.reason && (
            <View style={styles.reasonInfo}>
              <Ionicons name="document-text" size={16} color="#8E8E93" />
              <Text variant="bodySmall" style={styles.reasonText} numberOfLines={2}>
                {reservation.reason}
              </Text>
            </View>
          )}

          {/* 액션 버튼들 */}
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              style={[styles.actionButton, styles.detailButton]}
              onPress={() => navigation.navigate('ReservationDetail', { reservationId: reservation.id })}
              icon="eye"
            >
              상세보기
            </Button>

            {canModify && (
              <Button
                mode="outlined"
                style={[styles.actionButton, styles.modifyButton]}
                onPress={() => handleModifyReservation(reservation)}
                icon="pencil"
              >
                수정
              </Button>
            )}

            {canCancel && (
              <Button
                mode="outlined"
                style={[styles.actionButton, styles.cancelButton]}
                textColor="#FF3B30"
                onPress={() => handleCancelReservation(reservation)}
                icon="close"
              >
                취소
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 검색바 */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="병원명, 의사명, 진료과로 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* 상태 필터 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {statusOptions.map((option) => (
          <Chip
            key={option.value}
            mode={selectedStatus === option.value ? 'flat' : 'outlined'}
            selected={selectedStatus === option.value}
            onPress={() => setSelectedStatus(option.value as ReservationStatus | 'all')}
            style={styles.filterChip}
            textStyle={styles.filterChipText}
          >
            {option.label}
          </Chip>
        ))}
      </ScrollView>

      {/* 결과 헤더 */}
      <View style={styles.resultHeader}>
        <Text variant="bodyMedium" style={styles.resultCount}>
          {filteredReservations.length}개의 예약
        </Text>
      </View>

      {/* 예약 목록 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            예약 정보를 불러오는 중...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReservations}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.reservationList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#8E8E93" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                {selectedStatus === 'all' ? '예약 내역이 없습니다' : `${statusOptions.find(o => o.value === selectedStatus)?.label} 예약이 없습니다`}
              </Text>
              <Text variant="bodyMedium" style={styles.emptyMessage}>
                새로운 예약을 만들어보세요
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Reservation', {})}
                style={styles.emptyButton}
                icon="plus"
              >
                예약하기
              </Button>
            </View>
          }
        />
      )}

      {/* 새 예약 FAB */}
      <FAB
        icon="plus"
        label="새 예약"
        style={styles.fab}
        onPress={() => navigation.navigate('Reservation', {})}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  searchContainer: {
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
    backgroundColor: '#F8F9FA',
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    minHeight: 70,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChip: {
    marginRight: 10,
    height: 44,
    paddingHorizontal: 20,
    minWidth: 95,
  },
  filterChipText: {
    fontSize: 15,
    fontWeight: '500',
    paddingHorizontal: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#8E8E93',
  },
  reservationList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80, // FAB 공간 확보
  },
  reservationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 18,
    paddingHorizontal: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  hospitalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
  },
  hospitalName: {
    flex: 1,
    color: '#1D1B20',
    fontWeight: '600',
    marginRight: 12,
    flexShrink: 1,
    minWidth: 0,
  },
  statusChip: {
    height: 32,
    flexShrink: 0,
    minWidth: 85,
    paddingHorizontal: 12,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  doctorText: {
    marginLeft: 8,
    color: '#49454F',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    marginLeft: 6,
    color: '#49454F',
  },
  reasonInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reasonText: {
    marginLeft: 8,
    color: '#8E8E93',
    flex: 1,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    marginRight: 8,
    marginTop: 4,
    borderRadius: 8,
    minWidth: 90,
    paddingHorizontal: 12,
  },
  detailButton: {
    borderColor: '#007AFF',
  },
  modifyButton: {
    borderColor: '#FF9500',
  },
  cancelButton: {
    borderColor: '#FF3B30',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#1D1B20',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#007AFF',
  },
});

export default ReservationManagementScreen; 