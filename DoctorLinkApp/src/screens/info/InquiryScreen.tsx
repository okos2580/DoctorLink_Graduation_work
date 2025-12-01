import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  FAB,
  ActivityIndicator,
  Portal,
  Modal,
  TextInput,
  Divider,
  RadioButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Inquiry, InquiryStatus } from '../../types';

type InquiryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Contact'>;

interface Props {
  navigation: InquiryScreenNavigationProp;
}

const InquiryScreen: React.FC<Props> = ({ navigation }) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('일반');

  const categories = ['일반', '예약', '결제', '계정', '기술', '기타'];

  const statusColors = {
    pending: '#FF9500',
    in_progress: '#007AFF',
    resolved: '#34C759',
    closed: '#8E8E93',
  };

  const statusLabels = {
    pending: '대기중',
    in_progress: '처리중',
    resolved: '완료',
    closed: '종료',
  };

  const generateMockInquiries = (): Inquiry[] => {
    const myInquiries = [
      { title: '예약 변경 문의', content: '예약 날짜를 변경하고 싶습니다.', status: 'resolved' as InquiryStatus, reply: '예약 변경이 완료되었습니다.' },
      { title: '환불 문의', content: '환불은 어떻게 진행되나요?', status: 'in_progress' as InquiryStatus },
      { title: '앱 오류 신고', content: '결제 화면에서 오류가 발생합니다.', status: 'pending' as InquiryStatus },
    ];

    return myInquiries.map((inq, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i * 3);

      return {
        id: `my-inquiry-${i + 1}`,
        userId: 'current-user',
        userName: '나',
        userEmail: 'user@example.com',
        title: inq.title,
        content: inq.content,
        category: categories[Math.floor(Math.random() * categories.length)],
        status: inq.status,
        reply: inq.reply,
        repliedBy: inq.reply ? 'admin-1' : undefined,
        repliedByName: inq.reply ? '고객센터' : undefined,
        repliedAt: inq.reply ? new Date(date.getTime() + 86400000).toISOString() : undefined,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      };
    });
  };

  const loadInquiries = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData = generateMockInquiries();
      setInquiries(mockData);
    } catch (error) {
      console.error('문의 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInquiries();
    setRefreshing(false);
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    try {
      const newInquiry: Inquiry = {
        id: `my-inquiry-${inquiries.length + 1}`,
        userId: 'current-user',
        userName: '나',
        userEmail: 'user@example.com',
        title: title.trim(),
        content: content.trim(),
        category,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setInquiries([newInquiry, ...inquiries]);
      setModalVisible(false);
      setTitle('');
      setContent('');
      setCategory('일반');

      Alert.alert('완료', '문의가 등록되었습니다.\n빠른 시일 내에 답변드리겠습니다.');
    } catch (error) {
      console.error('문의 등록 오류:', error);
      Alert.alert('오류', '문의 등록 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderInquiryItem = ({ item }: { item: Inquiry }) => {
    return (
      <Card style={styles.inquiryCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.inquiryHeader}>
            <Text variant="titleSmall" style={styles.inquiryTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Chip
              mode="flat"
              compact
              style={[styles.statusChip, { backgroundColor: statusColors[item.status] + '20' }]}
              textStyle={{ color: statusColors[item.status], fontSize: 11 }}
            >
              {statusLabels[item.status]}
            </Chip>
          </View>

          <Chip mode="outlined" compact style={styles.categoryChip}>
            {item.category}
          </Chip>

          <Text variant="bodyMedium" style={styles.inquiryContent} numberOfLines={2}>
            {item.content}
          </Text>

          <Text variant="bodySmall" style={styles.date}>
            {formatDate(item.createdAt)}
          </Text>

          {item.reply && (
            <View style={styles.replyContainer}>
              <View style={styles.replyHeader}>
                <Ionicons name="chatbox-ellipses" size={16} color="#007AFF" />
                <Text variant="titleSmall" style={styles.replyLabel}>
                  답변
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.replyText}>
                {item.reply}
              </Text>
              <Text variant="bodySmall" style={styles.replyDate}>
                {item.repliedAt && formatDate(item.repliedAt)} · {item.repliedByName}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 정보 */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          1:1 문의
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          문의하신 내역을 확인하고 새로운 문의를 등록할 수 있습니다
        </Text>
      </View>

      {/* 문의 목록 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            문의 내역을 불러오는 중...
          </Text>
        </View>
      ) : (
        <FlatList
          data={inquiries}
          renderItem={renderInquiryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.inquiryList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#8E8E93" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                문의 내역이 없습니다
              </Text>
              <Text variant="bodyMedium" style={styles.emptyMessage}>
                궁금하신 사항을 문의해주세요
              </Text>
            </View>
          }
        />
      )}

      {/* 새 문의 작성 FAB */}
      <FAB
        icon="plus"
        label="새 문의"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

      {/* 문의 작성 모달 */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Text variant="titleLarge" style={styles.modalTitle}>
              새 문의 작성
            </Text>
            <Divider style={styles.modalDivider} />

            <Text variant="titleSmall" style={styles.sectionTitle}>
              카테고리 선택
            </Text>
            <RadioButton.Group onValueChange={setCategory} value={category}>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <View key={cat} style={styles.categoryItem}>
                    <RadioButton value={cat} color="#007AFF" />
                    <Text variant="bodyMedium">{cat}</Text>
                  </View>
                ))}
              </View>
            </RadioButton.Group>

            <TextInput
              label="제목"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              placeholder="문의 제목을 입력하세요"
              style={styles.input}
              maxLength={100}
            />

            <TextInput
              label="문의 내용"
              value={content}
              onChangeText={setContent}
              mode="outlined"
              placeholder="문의 내용을 자세히 작성해주세요"
              multiline
              numberOfLines={6}
              style={[styles.input, styles.contentInput]}
              maxLength={1000}
            />

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setModalVisible(false);
                  setTitle('');
                  setContent('');
                  setCategory('일반');
                }}
                style={styles.modalButton}
              >
                취소
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={[styles.modalButton, styles.submitButton]}
              >
                문의 등록
              </Button>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    color: '#1D1B20',
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#49454F',
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
  inquiryList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  inquiryCard: {
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
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inquiryTitle: {
    flex: 1,
    color: '#1D1B20',
    fontWeight: '600',
    marginRight: 8,
  },
  statusChip: {
    height: 28,
    paddingHorizontal: 10,
    minWidth: 65,
  },
  categoryChip: {
    height: 28,
    marginBottom: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    minWidth: 60,
  },
  inquiryContent: {
    color: '#49454F',
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    color: '#8E8E93',
  },
  replyContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyLabel: {
    marginLeft: 6,
    color: '#007AFF',
    fontWeight: '600',
  },
  replyText: {
    color: '#49454F',
    lineHeight: 20,
    marginBottom: 8,
  },
  replyDate: {
    color: '#8E8E93',
    fontSize: 12,
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
  modal: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    color: '#1D1B20',
    fontWeight: '600',
    marginBottom: 16,
  },
  modalDivider: {
    marginBottom: 16,
    backgroundColor: '#E0E0E0',
  },
  sectionTitle: {
    color: '#1D1B20',
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  contentInput: {
    minHeight: 150,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
});

export default InquiryScreen;

