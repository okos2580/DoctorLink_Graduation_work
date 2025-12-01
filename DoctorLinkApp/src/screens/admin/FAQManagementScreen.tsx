import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  FAB,
  ActivityIndicator,
  Searchbar,
  IconButton,
  Menu,
  List,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, FAQ, FAQCategory } from '../../types';

type FAQManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FAQManagement'>;

interface Props {
  navigation: FAQManagementScreenNavigationProp;
}

const FAQManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: '전체', icon: 'apps', color: '#8E8E93' },
    { value: 'general', label: '일반', icon: 'help-circle-outline', color: '#007AFF' },
    { value: 'reservation', label: '예약', icon: 'calendar-outline', color: '#34C759' },
    { value: 'account', label: '계정', icon: 'person-outline', color: '#FF9500' },
    { value: 'payment', label: '결제', icon: 'card-outline', color: '#AF52DE' },
    { value: 'technical', label: '기술', icon: 'construct-outline', color: '#FF3B30' },
  ];

  const generateMockFAQs = (): FAQ[] => {
    const questions = [
      { q: '회원가입은 어떻게 하나요?', a: '앱 첫 화면에서 "회원가입" 버튼을 눌러 진행하실 수 있습니다.', cat: 'account' as FAQCategory },
      { q: '예약 취소는 어떻게 하나요?', a: '예약 상세 화면에서 "예약 취소" 버튼을 통해 취소 가능합니다. 단, 예약일 24시간 전까지만 가능합니다.', cat: 'reservation' as FAQCategory },
      { q: '비밀번호를 잊어버렸어요', a: '로그인 화면에서 "비밀번호 찾기"를 클릭하여 재설정하실 수 있습니다.', cat: 'account' as FAQCategory },
      { q: '병원 검색이 안돼요', a: '위치 권한을 허용해주시고, 네트워크 연결 상태를 확인해주세요.', cat: 'technical' as FAQCategory },
      { q: '예약 확인은 어디서 하나요?', a: '하단 메뉴의 "예약" 탭에서 전체 예약 내역을 확인하실 수 있습니다.', cat: 'reservation' as FAQCategory },
      { q: '앱이 자꾸 종료됩니다', a: '앱을 최신 버전으로 업데이트하시고, 재시작해주세요.', cat: 'technical' as FAQCategory },
      { q: '환불은 어떻게 받나요?', a: '결제 후 7일 이내 고객센터를 통해 환불 신청이 가능합니다.', cat: 'payment' as FAQCategory },
      { q: '의료 기록은 어디서 확인하나요?', a: '"의료기록" 탭에서 모든 진료 기록을 확인하실 수 있습니다.', cat: 'general' as FAQCategory },
    ];

    return questions.map((q, i) => ({
      id: `faq-${i + 1}`,
      category: q.cat,
      question: q.q,
      answer: q.a,
      order: i + 1,
      isActive: Math.random() > 0.2,
      viewCount: Math.floor(Math.random() * 500),
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
    }));
  };

  const loadFAQs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://1.246.253.172:3000/api/admin/faqs');
      const data = await response.json();
      
      if (data.success && data.data) {
        setFaqs(data.data.faqs);
        setFilteredFaqs(data.data.faqs);
      } else {
        setFaqs([]);
        setFilteredFaqs([]);
      }
    } catch (error) {
      console.error('FAQ 로드 오류:', error);
      setFaqs([]);
      setFilteredFaqs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFAQs();
    setRefreshing(false);
  };

  useEffect(() => {
    loadFAQs();
  }, []);

  useEffect(() => {
    let filtered = [...faqs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    filtered.sort((a, b) => a.order - b.order);

    setFilteredFaqs(filtered);
  }, [faqs, searchQuery, selectedCategory]);

  const handleDelete = (faq: FAQ) => {
    Alert.alert(
      'FAQ 삭제',
      `"${faq.question}" FAQ를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://1.246.253.172:3000/api/admin/faqs/${faq.id}`, {
                method: 'DELETE',
              });
              const data = await response.json();
              
              if (data.success) {
            setFaqs(prev => prev.filter(f => f.id !== faq.id));
            Alert.alert('완료', 'FAQ가 삭제되었습니다.');
              } else {
                Alert.alert('오류', data.message || '삭제 중 오류가 발생했습니다.');
              }
            } catch (error) {
              console.error('FAQ 삭제 오류:', error);
              Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (faq: FAQ) => {
    try {
      const response = await fetch(`http://1.246.253.172:3000/api/admin/faqs/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...faq, isActive: !faq.isActive }),
      });
      const data = await response.json();
      
      if (data.success) {
    setFaqs(prev =>
      prev.map(f =>
        f.id === faq.id ? { ...f, isActive: !f.isActive } : f
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

  const getCategoryInfo = (category: FAQCategory) => {
    return categories.find(c => c.value === category) || categories[1];
  };

  const renderFAQItem = ({ item }: { item: FAQ }) => {
    const categoryInfo = getCategoryInfo(item.category);
    const isExpanded = expandedId === item.id;

    return (
      <Card style={styles.faqCard}>
        <List.Accordion
          title={item.question}
          titleStyle={styles.question}
          titleNumberOfLines={2}
          expanded={isExpanded}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          left={props => (
            <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color + '20' }]}>
              <Ionicons name={categoryInfo.icon as any} size={20} color={categoryInfo.color} />
            </View>
          )}
          right={props => (
            <View style={styles.accordionRight}>
              <Chip
                mode={item.isActive ? 'flat' : 'outlined'}
                compact
                style={[
                  styles.statusChip,
                  item.isActive && { backgroundColor: '#34C759' + '20' }
                ]}
                textStyle={{
                  color: item.isActive ? '#34C759' : '#8E8E93',
                  fontSize: 10,
                }}
              >
                {item.isActive ? '활성' : '비활성'}
              </Chip>
              <Menu
                visible={menuVisible === item.id}
                onDismiss={() => setMenuVisible(null)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={18}
                    onPress={(e) => {
                      e.stopPropagation();
                      setMenuVisible(item.id);
                    }}
                  />
                }
              >
                <Menu.Item
                  onPress={() => {
                    setMenuVisible(null);
                    navigation.navigate('FAQEdit', { faqId: item.id });
                  }}
                  title="수정"
                  leadingIcon="pencil"
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
          )}
          style={styles.accordion}
        >
          <View style={styles.answerContainer}>
            <Text variant="bodyMedium" style={styles.answer}>
              {item.answer}
            </Text>
            <View style={styles.faqFooter}>
              <Chip
                mode="outlined"
                compact
                style={[styles.categoryChip, { borderColor: categoryInfo.color }]}
                textStyle={{ color: categoryInfo.color, fontSize: 11 }}
              >
                {categoryInfo.label}
              </Chip>
              <View style={styles.viewInfo}>
                <Ionicons name="eye-outline" size={14} color="#8E8E93" />
                <Text variant="bodySmall" style={styles.viewCount}>
                  {item.viewCount}회
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
          placeholder="FAQ 검색"
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
            onPress={() => setSelectedCategory(category.value as FAQCategory | 'all')}
            style={[
              styles.filterChip,
              selectedCategory === category.value && { backgroundColor: category.color + '20' }
            ]}
            textStyle={[
              styles.filterChipText,
              selectedCategory === category.value && { color: category.color }
            ]}
            icon={category.icon}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>

      {/* 결과 헤더 */}
      <View style={styles.resultHeader}>
        <Text variant="bodyMedium" style={styles.resultCount}>
          총 {filteredFaqs.length}개
        </Text>
      </View>

      {/* FAQ 목록 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            FAQ를 불러오는 중...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFaqs}
          renderItem={renderFAQItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.faqList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="help-circle-outline" size={64} color="#8E8E93" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                FAQ가 없습니다
              </Text>
              <Text variant="bodyMedium" style={styles.emptyMessage}>
                새로운 FAQ를 등록해보세요
              </Text>
            </View>
          }
        />
      )}

      {/* 새 FAQ 등록 FAB */}
      <FAB
        icon="plus"
        label="새 FAQ"
        style={styles.fab}
        onPress={() => navigation.navigate('FAQEdit', { faqId: undefined })}
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
    paddingHorizontal: 18,
    minWidth: 90,
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
  faqList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  faqCard: {
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
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  question: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1B20',
  },
  accordionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    height: 26,
    marginRight: 6,
    paddingHorizontal: 8,
    minWidth: 55,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#F8F9FA',
  },
  answer: {
    color: '#49454F',
    lineHeight: 22,
    marginBottom: 12,
  },
  faqFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    height: 28,
    paddingHorizontal: 8,
    minWidth: 60,
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

export default FAQManagementScreen;

