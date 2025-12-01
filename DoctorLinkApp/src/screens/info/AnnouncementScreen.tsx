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
  ActivityIndicator,
  Searchbar,
  List,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Announcement } from '../../types';

type AnnouncementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'About'>;

interface Props {
  navigation: AnnouncementScreenNavigationProp;
}

const AnnouncementScreen: React.FC<Props> = ({ navigation }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');

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

    return Array.from({ length: 15 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);

      return {
        id: `ann-${i + 1}`,
        title: titles[i % titles.length],
        content: `${titles[i % titles.length]}에 대한 상세 내용입니다.\n\n관련하여 자세한 사항은 고객센터로 문의 부탁드립니다.\n\n감사합니다.`,
        author: 'admin-1',
        authorName: '시스템 관리자',
        category: cats[Math.floor(Math.random() * cats.length)],
        isPinned: i < 2,
        isActive: true,
        viewCount: Math.floor(Math.random() * 1000),
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      };
    });
  };

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://1.246.253.172:3000/api/announcements');
      const data = await response.json();
      
      if (data.success && data.data) {
        setAnnouncements(data.data.announcements);
        setFilteredAnnouncements(data.data.announcements);
      } else {
        setAnnouncements([]);
        setFilteredAnnouncements([]);
      }
    } catch (error) {
      console.error('공지사항 로드 오류:', error);
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

    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredAnnouncements(filtered);
  }, [announcements, searchQuery, selectedCategory]);

  const getCategoryInfo = (category: string) => {
    return categories.find(c => c.value === category) || categories[1];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderAnnouncementItem = ({ item }: { item: Announcement }) => {
    const categoryInfo = getCategoryInfo(item.category);
    const isExpanded = expandedId === item.id;

    return (
      <Card style={styles.announcementCard}>
        <List.Accordion
          title={item.title}
          titleStyle={styles.title}
          titleNumberOfLines={2}
          description={formatDate(item.createdAt)}
          descriptionStyle={styles.date}
          expanded={isExpanded}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          left={props => item.isPinned ? (
            <Ionicons name="pin" size={20} color="#FF3B30" style={{ marginRight: 8 }} />
          ) : null}
          right={props => (
            <View style={styles.accordionRight}>
              <Chip
                mode="outlined"
                compact
                style={[styles.categoryChip, { borderColor: categoryInfo.color }]}
                textStyle={{ color: categoryInfo.color, fontSize: 11 }}
              >
                {categoryInfo.label}
              </Chip>
            </View>
          )}
          style={styles.accordion}
        >
          <View style={styles.contentContainer}>
            <Text variant="bodyMedium" style={styles.content}>
              {item.content}
            </Text>
            <View style={styles.footer}>
              <View style={styles.viewInfo}>
                <Ionicons name="eye-outline" size={14} color="#8E8E93" />
                <Text variant="bodySmall" style={styles.viewCount}>
                  조회 {item.viewCount}
                </Text>
              </View>
            </View>
          </View>
        </List.Accordion>
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
            </View>
          }
        />
      )}
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
    minWidth: 85,
  },
  filterChipText: {
    fontSize: 15,
    paddingHorizontal: 8,
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
    paddingBottom: 16,
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
  accordion: {
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1B20',
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  accordionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  categoryChip: {
    height: 28,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#F8F9FA',
  },
  content: {
    color: '#49454F',
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCount: {
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
    textAlign: 'center',
  },
});

export default AnnouncementScreen;

