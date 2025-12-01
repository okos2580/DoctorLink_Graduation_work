import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  ActivityIndicator,
  Divider,
  Menu,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../../types';

type NotificationsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Notifications'>;

interface Props {
  navigation: NotificationsScreenNavigationProp;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'reminder' | 'system' | 'promotion';
  isRead: boolean;
  createdAt: string;
  data?: any;
}

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  // 상태 관리
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadNotifications();
  }, []);

  // Mock 알림 데이터 생성
  const generateMockNotifications = (): Notification[] => {
    const mockNotifications: Notification[] = [];
    const notificationTypes = ['appointment', 'reminder', 'system', 'promotion'] as const;
    const titles = {
      appointment: ['예약 확인', '예약 변경', '예약 취소', '진료 완료'],
      reminder: ['복용 알림', '검진 알림', '예약 알림', '방문 알림'],
      system: ['시스템 업데이트', '서비스 점검', '정책 변경', '기능 추가'],
      promotion: ['이벤트 안내', '할인 혜택', '신규 서비스', '건강 정보']
    };
    const messages = {
      appointment: [
        '2024년 1월 15일 오후 2시 내과 예약이 확정되었습니다.',
        '예약 시간이 변경되었습니다. 새로운 시간을 확인해주세요.',
        '예약이 취소되었습니다. 필요시 다시 예약해주세요.',
        '진료가 완료되었습니다. 처방전을 확인해주세요.'
      ],
      reminder: [
        '오늘 오후 6시에 약 복용 시간입니다.',
        '건강검진 예약일이 다가왔습니다.',
        '내일 병원 예약이 있습니다. 시간을 확인해주세요.',
        '정기 방문 일정을 확인해주세요.'
      ],
      system: [
        '앱이 최신 버전으로 업데이트되었습니다.',
        '서비스 점검으로 인해 일시적으로 이용이 제한됩니다.',
        '개인정보 처리방침이 변경되었습니다.',
        '새로운 기능이 추가되었습니다. 확인해보세요!'
      ],
      promotion: [
        '건강검진 할인 이벤트가 진행 중입니다.',
        '신규 회원 대상 특별 혜택을 확인하세요.',
        '원격 진료 서비스가 새롭게 출시되었습니다.',
        '겨울철 건강 관리 팁을 확인해보세요.'
      ]
    };

    for (let i = 1; i <= 20; i++) {
      const type = notificationTypes[i % notificationTypes.length];
      const typeIndex = i % titles[type].length;
      const date = new Date();
      date.setHours(date.getHours() - (i * 2)); // 2시간씩 과거로

      mockNotifications.push({
        id: `notification-${i.toString().padStart(3, '0')}`,
        title: titles[type][typeIndex],
        message: messages[type][typeIndex],
        type: type,
        isRead: i % 3 !== 0, // 1/3 확률로 읽지 않음
        createdAt: date.toISOString(),
        data: type === 'appointment' ? { reservationId: `reservation-${i}` } : undefined,
      });
    }

    return mockNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  // 알림 로드
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Mock 데이터 생성
      const mockNotifications = generateMockNotifications();
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('알림 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  // 알림 읽음 처리
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setShowMenu(false);
  };

  // 알림 삭제
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  // 모든 알림 삭제
  const deleteAllNotifications = () => {
    Alert.alert(
      '모든 알림 삭제',
      '모든 알림을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setNotifications([]);
            setShowMenu(false);
          },
        },
      ]
    );
  };

  // 알림 타입별 아이콘
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment':
        return 'calendar';
      case 'reminder':
        return 'alarm';
      case 'system':
        return 'settings';
      case 'promotion':
        return 'gift';
      default:
        return 'notifications';
    }
  };

  // 알림 타입별 색상
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'appointment':
        return '#007AFF';
      case 'reminder':
        return '#FF9500';
      case 'system':
        return '#8E8E93';
      case 'promotion':
        return '#34C759';
      default:
        return '#007AFF';
    }
  };

  // 알림 타입별 라벨
  const getNotificationTypeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'appointment':
        return '예약';
      case 'reminder':
        return '알림';
      case 'system':
        return '시스템';
      case 'promotion':
        return '이벤트';
      default:
        return '알림';
    }
  };

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return '방금 전';
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  // 알림 클릭 핸들러
  const handleNotificationPress = (notification: Notification) => {
    // 읽음 처리
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // 알림 타입에 따른 네비게이션
    switch (notification.type) {
      case 'appointment':
        if (notification.data?.reservationId) {
          navigation.navigate('ReservationDetail', { 
            reservationId: notification.data.reservationId 
          });
        }
        break;
      case 'reminder':
        // 알림 설정 화면으로 이동 (추후 구현)
        break;
      case 'system':
        // 시스템 공지사항 화면으로 이동 (추후 구현)
        break;
      case 'promotion':
        // 이벤트 상세 화면으로 이동 (추후 구현)
        break;
    }
  };

  // 알림 카드 렌더링
  const renderNotification = ({ item: notification }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(notification)}
      onLongPress={() => deleteNotification(notification.id)}
    >
      <Card style={[
        styles.notificationCard,
        !notification.isRead && styles.unreadCard
      ]}>
        <Card.Content style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={styles.notificationIcon}>
              <Ionicons 
                name={getNotificationIcon(notification.type)} 
                size={24} 
                color={getNotificationColor(notification.type)} 
              />
            </View>
            <View style={styles.notificationInfo}>
              <View style={styles.titleRow}>
                <Text variant="titleSmall" style={styles.notificationTitle} numberOfLines={1}>
                  {notification.title}
                </Text>
                {!notification.isRead && <View style={styles.unreadDot} />}
              </View>
              <View style={styles.metaRow}>
                <Chip 
                  mode="outlined" 
                  compact 
                  style={[
                    styles.typeChip,
                    { borderColor: getNotificationColor(notification.type) }
                  ]}
                  textStyle={{ color: getNotificationColor(notification.type) }}
                >
                  {getNotificationTypeLabel(notification.type)}
                </Chip>
                <Text variant="bodySmall" style={styles.timeText}>
                  {formatTime(notification.createdAt)}
                </Text>
              </View>
            </View>
          </View>
          
          <Text variant="bodyMedium" style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            알림을 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            알림
          </Text>
          {unreadCount > 0 && (
            <Chip mode="flat" compact style={styles.unreadChip}>
              {unreadCount}개 읽지 않음
            </Chip>
          )}
        </View>
        
        <Menu
          visible={showMenu}
          onDismiss={() => setShowMenu(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              onPress={() => setShowMenu(true)}
            />
          }
        >
          <Menu.Item
            onPress={markAllAsRead}
            title="모두 읽음 처리"
            leadingIcon="check-all"
          />
          <Divider />
          <Menu.Item
            onPress={deleteAllNotifications}
            title="모든 알림 삭제"
            leadingIcon="delete"
          />
        </Menu>
      </View>

      {/* 알림 목록 */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color="#8E8E93" />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              알림이 없습니다
            </Text>
            <Text variant="bodyMedium" style={styles.emptyMessage}>
              새로운 알림이 있을 때 여기에 표시됩니다
            </Text>
          </View>
        }
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#1D1B20',
    fontWeight: '600',
    marginRight: 12,
  },
  unreadChip: {
    backgroundColor: '#FFE8E8',
  },
  notificationsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    elevation: 2,
    shadowOpacity: 0.1,
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    color: '#1D1B20',
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeChip: {
    height: 24,
  },
  timeText: {
    color: '#8E8E93',
  },
  notificationMessage: {
    color: '#49454F',
    lineHeight: 20,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    color: '#1D1B20',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default NotificationsScreen;