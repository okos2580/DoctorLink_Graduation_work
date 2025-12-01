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
  IconButton,
  Menu,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Announcement } from '../../types';

type AnnouncementManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnnouncementManagement'>;

interface Props {
  navigation: AnnouncementManagementScreenNavigationProp;
}

const AnnouncementManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: '전체', color: '#8E8E93' },
    { value: 'notice', label: '공지', color: '#007AFF' },
    { value: 'update', label: '업데이트', color: '#34C759' },
    { value: 'maintenance', label: '점검', color: '#FF9500' },
    { value: 'event', label: '이벤트', color: '#AF52DE' },
  ];

  const generateMockAnnouncements = (): Announcement[] => {
    const titles = [
      '서비스 이용약관 변경 안내',
      '정기 시스템 점검 안내',
      '신규 병원 제휴 안내',
      '모바일 앱 업데이트',
      '여름 건강검진 이벤트',
      '예약 시스템 개선 안내',
      '개인정보 처리방침 변경',
      '설 연휴 운영 안내',
    ];

    const cats: Announcement['category'][] = ['notice', 'update', 'maintenance', 'event'];

    return Array.from({ length: 20 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);

      return {
        id: `ann-${i + 1}`,
        title: titles[i % titles.length],
        content: `${titles[i % titles.length]}에 대한 상세 내용입니다.\n\n관련하여 자세한 사항은 고객센터로 문의 부탁드립니다.`,
        author: 'admin-1',
        authorName: '시스템 관리자',
        category: cats[Math.floor(Math.random() * cats.length)],
        isPinned: i < 2,
        isActive: Math.random() > 0.2,
        viewCount: Math.floor(Math.random() * 1000),
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      };
    });
  };

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://1.246.253.172:3000/api/admin/announcements');
      const data = await response.json();
      
      if (data.success && data.data) {
        setAnnouncements(data.data.announcements);
        setFilteredAnnouncements(data.data.announcements);
      } else {
        // 서버에 데이터가 없으면 빈 배열로 시작
        setAnnouncements([]);
        setFilteredAnnouncements([]);
      }
    } catch (error) {
      console.error('공지사항 로드 오류:', error);
      // 네트워크 오류 시 빈 배열로 처리
      setAnnouncements([]);
      setFilteredAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  useEffect(() => {
    let filtered = [...announcements];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ann =>
        ann.title.toLowerCase().includes(query) ||
        ann.content.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ann => ann.category === selectedCategory);
    }

    // 고정된 공지사항을 맨 위로
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredAnnouncements(filtered);
  }, [announcements, searchQuery, selectedCategory]);

  const handleDelete = (announcement: Announcement) => {
    Alert.alert(
      '공지사항 삭제',
      `"${announcement.title}" 공지사항을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://1.246.253.172:3000/api/admin/announcements/${announcement.id}`, {
                method: 'DELETE',
              });
              const data = await response.json();
              
              if (data.success) {
            setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
            Alert.alert('완료', '공지사항이 삭제되었습니다.');
              } else {
                Alert.alert('오류', data.message || '삭제 중 오류가 발생했습니다.');
              }
            } catch (error) {
              console.error('공지사항 삭제 오류:', error);
              Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      const response = await fetch(`http://1.246.253.172:3000/api/admin/announcements/${announcement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...announcement, isActive: !announcement.isActive }),
      });
      const data = await response.json();
      
      if (data.success) {
    setAnnouncements(prev =>
      prev.map(a =>
        a.id === announcement.id ? { ...a, isActive: !a.isActive } : a
      )
    );
      } else {
        Alert.alert('오류', data.message || '상태 변경 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      Alert.alert('오류', '상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      const response = await fetch(`http://1.246.253.172:3000/api/admin/announcements/${announcement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...announcement, isPinned: !announcement.isPinned }),
      });
      const data = await response.json();
      
      if (data.success) {
    setAnnouncements(prev =>
      prev.map(a =>
        a.id === announcement.id ? { ...a, isPinned: !a.isPinned } : a
      )
    );
      } else {
        Alert.alert('오류', data.message || '고정 변경 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('고정 변경 오류:', error);
      Alert.alert('오류', '고정 변경 중 오류가 발생했습니다.');
    }
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(c => c.value === category) || categories[1];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderAnnouncementItem = ({ item }: { item: Announcement }) => {
    const categoryInfo = getCategoryInfo(item.category);

    return (
      <Card style={styles.announcementCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.announcementHeader}>
            <View style={styles.headerLeft}>
              {item.isPinned && (
                <Ionicons name="pin" size={16} color="#FF3B30" style={styles.pinIcon} />
              )}
              <Text variant="titleMedium" style={styles.announcementTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            <Menu
              visible={menuVisible === item.id}
              onDismiss={() => setMenuVisible(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuVisible(item.id)}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  setMenuVisible(null);
                  navigation.navigate('AnnouncementEdit', { announcementId: item.id });
                }}
                title="수정"
                leadingIcon="pencil"
              />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(null);
                  handleTogglePin(item);
                }}
                title={item.isPinned ? '고정 해제' : '상단 고정'}
                leadingIcon={item.isPinned ? 'pin-off' : 'pin'}
              />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(null);
                  handleToggleActive(item);
                }}
                title={item.isActive ? '비활성화' : '활성화'}
                leadingIcon={item.isActive ? 'eye-off' : 'eye'}
              />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(null);
                  handleDelete(item);
                }}
                title="삭제"
                leadingIcon="delete"
              />
            </Menu>
          </View>

          <View style={styles.announcementMeta}>
            <Chip
              mode="outlined"
              compact
              style={[styles.categoryChip, { borderColor: categoryInfo.color }]}
              textStyle={{ color: categoryInfo.color, fontSize: 11 }}
            >
              {categoryInfo.label}
            </Chip>
            <Chip
              mode={item.isActive ? 'flat' : 'outlined'}
              compact
              style={[
                styles.statusChip,
                item.isActive && { backgroundColor: '#34C759' + '20' }
              ]}
              textStyle={{
                color: item.isActive ? '#34C759' : '#8E8E93',
                fontSize: 11,
              }}
            >
              {item.isActive ? '활성' : '비활성'}
            </Chip>
          </View>

          <Text variant="bodyMedium" style={styles.announcementContent} numberOfLines={2}>
            {item.content}
          </Text>

          <View style={styles.announcementFooter}>
            <View style={styles.footerLeft}>
              <Ionicons name="eye-outline" size={14} color="#8E8E93" />
              <Text variant="bodySmall" style={styles.viewCount}>
                조회 {item.viewCount}
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.date}>
              {formatDate(item.createdAt)}
            </Text>
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
          placeholder="공지사항 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* 카테고리 필터 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {categories.map((category) => (
          <Chip
            key={category.value}
            mode={selectedCategory === category.value ? 'flat' : 'outlined'}
            selected={selectedCategory === category.value}
            onPress={() => setSelectedCategory(category.value)}
            style={[
              styles.filterChip,
              selectedCategory === category.value && { backgroundColor: category.color + '20' }
            ]}
            textStyle={[
              styles.filterChipText,
              selectedCategory === category.value && { color: category.color }
            ]}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>

      {/* 결과 헤더 */}
      <View style={styles.resultHeader}>
        <Text variant="bodyMedium" style={styles.resultCount}>
          총 {filteredAnnouncements.length}개
        </Text>
      </View>

      {/* 공지사항 목록 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            공지사항을 불러오는 중...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAnnouncements}
          renderItem={renderAnnouncementItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.announcementList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={64} color="#8E8E93" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                공지사항이 없습니다
              </Text>
              <Text variant="bodyMedium" style={styles.emptyMessage}>
                새로운 공지사항을 등록해보세요
              </Text>
            </View>
          }
        />
      )}

      {/* 새 공지사항 등록 FAB */}
      <FAB
        icon="plus"
        label="새 공지"
        style={styles.fab}
        onPress={() => navigation.navigate('AnnouncementEdit', { announcementId: undefined })}
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
    paddingHorizontal: 20,
    minWidth: 95,
  },
  filterChipText: {
    fontSize: 15,
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
  announcementList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  announcementCard: {
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
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinIcon: {
    marginRight: 4,
  },
  announcementTitle: {
    flex: 1,
    color: '#1D1B20',
    fontWeight: '600',
  },
  announcementMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryChip: {
    height: 28,
    marginRight: 10,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  statusChip: {
    height: 28,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  announcementContent: {
    color: '#49454F',
    marginBottom: 12,
    lineHeight: 20,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCount: {
    marginLeft: 4,
    color: '#8E8E93',
  },
  date: {
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

export default AnnouncementManagementScreen;

