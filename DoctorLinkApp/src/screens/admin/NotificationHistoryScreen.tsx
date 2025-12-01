import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  FAB,
  ActivityIndicator,
  Searchbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Notification, NotificationType } from '../../types';

type NotificationHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'NotificationHistory'>;
type NotificationHistoryScreenRouteProp = RouteProp<RootStackParamList, 'NotificationHistory'>;

interface Props {
  navigation: NotificationHistoryScreenNavigationProp;
  route: NotificationHistoryScreenRouteProp;
}

const NotificationHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');

  const notificationTypes = [
    { value: 'all', label: '전체', icon: 'apps', color: '#8E8E93' },
    { value: 'general', label: '일반', icon: 'notifications-outline', color: '#007AFF' },
    { value: 'reservation', label: '예약', icon: 'calendar-outline', color: '#34C759' },
    { value: 'announcement', label: '공지', icon: 'megaphone-outline', color: '#FF9500' },
    { value: 'emergency', label: '긴급', icon: 'alert-circle-outline', color: '#FF3B30' },
    { value: 'event', label: '이벤트', icon: 'gift-outline', color: '#AF52DE' },
  ];

  const generateMockNotifications = (): Notification[] => {
    const types: NotificationType[] = ['general', 'reservation', 'announcement', 'emergency', 'event'];
    const receivers = ['all', 'patients', 'doctors'];
    const titles = [
      '시스템 점검 안내',
      '신규 병원 등록 알림',
      '예약 시스템 업데이트',
      '긴급 점검 공지',
      '봄맞이 이벤트',
      '서비스 개선 안내',
      '의료진 추가 안내',
      '휴무일 공지',
    ];

    return Array.from({ length: 25 }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const receiverType = receivers[Math.floor(Math.random() * receivers.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      return {
        id: `notif-${i + 1}`,
        type,
        title: titles[Math.floor(Math.random() * titles.length)],
        message: `${titles[i % titles.length]}에 대한 상세 내용입니다. 자세한 사항은 공지사항을 확인해주세요.`,
        receiverType: receiverType as any,
        isRead: Math.random() > 0.3,
        sentAt: date.toISOString(),
        sentBy: 'admin-1',
        sentByName: '시스템 관리자',
      };
    });
  };

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData = generateMockNotifications();
      setNotifications(mockData);
      setFilteredNotifications(mockData);
    } catch (error) {
      console.error('알림 이력 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    let filtered = [...notifications];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notif =>
        notif.title.toLowerCase().includes(query) ||
        notif.message.toLowerCase().includes(query)
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(notif => notif.type === selectedType);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, selectedType]);

  const getTypeInfo = (type: NotificationType) => {
    return notificationTypes.find(t => t.value === type) || notificationTypes[1];
  };

  const getReceiverLabel = (receiverType?: string) => {
    switch (receiverType) {
      case 'all': return '모든 사용자';
      case 'patients': return '환자';
      case 'doctors': return '의사';
      case 'specific': return '특정 사용자';
      default: return '알 수 없음';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const typeInfo = getTypeInfo(item.type);

    return (
      <Card style={styles.notificationCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.notificationHeader}>
            <View style={[styles.typeIcon, { backgroundColor: typeInfo.color + '20' }]}>
              <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
            </View>
            <View style={styles.notificationInfo}>
              <Text variant="titleSmall" style={styles.notificationTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text variant="bodySmall" style={styles.notificationTime}>
                {formatDate(item.sentAt)}
              </Text>
            </View>
            <Chip
              mode="outlined"
              compact
              style={[styles.typeChip, { borderColor: typeInfo.color }]}
              textStyle={{ color: typeInfo.color, fontSize: 11 }}
            >
              {typeInfo.label}
            </Chip>
          </View>

          <Text variant="bodyMedium" style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>

          <View style={styles.notificationFooter}>
            <View style={styles.receiverInfo}>
              <Ionicons name="people-outline" size={16} color="#8E8E93" />
              <Text variant="bodySmall" style={styles.receiverText}>
                {getReceiverLabel(item.receiverType)}
              </Text>
            </View>
            <View style={styles.senderInfo}>
              <Ionicons name="person-outline" size={16} color="#8E8E93" />
              <Text variant="bodySmall" style={styles.senderText}>
                {item.sentByName}
              </Text>
            </View>
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
          placeholder="알림 제목, 내용으로 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* 타입 필터 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {notificationTypes.map((type) => (
          <Chip
            key={type.value}
            mode={selectedType === type.value ? 'flat' : 'outlined'}
            selected={selectedType === type.value}
            onPress={() => setSelectedType(type.value as NotificationType | 'all')}
            style={[
              styles.filterChip,
              selectedType === type.value && { backgroundColor: type.color + '20' }
            ]}
            textStyle={[
              styles.filterChipText,
              selectedType === type.value && { color: type.color }
            ]}
            icon={type.icon}
          >
            {type.label}
          </Chip>
        ))}
      </ScrollView>

      {/* 결과 헤더 */}
      <View style={styles.resultHeader}>
        <Text variant="bodyMedium" style={styles.resultCount}>
          {filteredNotifications.length}개의 알림 이력
        </Text>
      </View>

      {/* 알림 목록 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            알림 이력을 불러오는 중...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={64} color="#8E8E93" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                알림 이력이 없습니다
              </Text>
              <Text variant="bodyMedium" style={styles.emptyMessage}>
                발송된 알림이 여기에 표시됩니다
              </Text>
            </View>
          }
        />
      )}

      {/* 새 알림 발송 FAB */}
      <FAB
        icon="plus"
        label="새 알림"
        style={styles.fab}
        onPress={() => navigation.navigate('NotificationSend')}
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
    paddingHorizontal: 16,
    minWidth: 85,
  },
  filterChipText: {
    fontSize: 15,
    paddingHorizontal: 8,
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
  notificationList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  notificationCard: {
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
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  notificationTitle: {
    color: '#1D1B20',
    fontWeight: '600',
  },
  notificationTime: {
    color: '#8E8E93',
    marginTop: 2,
  },
  typeChip: {
    height: 28,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  notificationMessage: {
    color: '#49454F',
    marginBottom: 12,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiverText: {
    marginLeft: 4,
    color: '#8E8E93',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderText: {
    marginLeft: 4,
    color: '#8E8E93',
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
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#007AFF',
  },
});

export default NotificationHistoryScreen;

