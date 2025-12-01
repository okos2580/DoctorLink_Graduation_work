import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
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
  Portal,
  Modal,
  TextInput,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Inquiry, InquiryStatus } from '../../types';

type InquiryManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'InquiryManagement'>;

interface Props {
  navigation: InquiryManagementScreenNavigationProp;
}

const InquiryManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus | 'all'>('all');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedInquiry, setExpandedInquiry] = useState<string | null>(null);

  const statusOptions = [
    { value: 'all', label: '전체', color: '#8E8E93' },
    { value: 'pending', label: '대기', color: '#FF9500' },
    { value: 'in_progress', label: '처리중', color: '#007AFF' },
    { value: 'resolved', label: '완료', color: '#34C759' },
    { value: 'closed', label: '종료', color: '#8E8E93' },
  ];

  const generateMockInquiries = (): Inquiry[] => {
    const titles = [
      '예약 취소 문의',
      '환불 관련 문의',
      '회원 탈퇴 요청',
      '병원 정보 수정 요청',
      '앱 오류 신고',
      '기능 건의',
      '예약 변경 문의',
      '의료 기록 삭제 요청',
    ];

    const statuses: InquiryStatus[] = ['pending', 'in_progress', 'resolved', 'closed'];

    return Array.from({ length: 30}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      return {
        id: `inquiry-${i + 1}`,
        userId: `user-${Math.floor(Math.random() * 100)}`,
        userName: `사용자${i + 1}`,
        userEmail: `user${i + 1}@example.com`,
        title: titles[i % titles.length],
        content: `${titles[i % titles.length]}에 대한 상세 문의 내용입니다. 빠른 답변 부탁드립니다.`,
        category: ['예약', '결제', '계정', '기술', '기타'][Math.floor(Math.random() * 5)],
        status,
        reply: status === 'resolved' || status === 'closed' ? '문의 주셔서 감사합니다. 처리 완료되었습니다.' : undefined,
        repliedBy: status === 'resolved' || status === 'closed' ? 'admin-1' : undefined,
        repliedByName: status === 'resolved' || status === 'closed' ? '관리자' : undefined,
        repliedAt: status === 'resolved' || status === 'closed' ? new Date(date.getTime() + 86400000).toISOString() : undefined,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      };
    });
  };

  const loadInquiries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://1.246.253.172:3000/api/admin/inquiries');
      const data = await response.json();
      
      if (data.success && data.data) {
        setInquiries(data.data.inquiries);
        setFilteredInquiries(data.data.inquiries);
      } else {
        setInquiries([]);
        setFilteredInquiries([]);
      }
    } catch (error) {
      console.error('문의 로드 오류:', error);
      setInquiries([]);
      setFilteredInquiries([]);
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

  useEffect(() => {
    let filtered = [...inquiries];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(inq =>
        inq.title.toLowerCase().includes(query) ||
        inq.content.toLowerCase().includes(query) ||
        inq.userName.toLowerCase().includes(query)
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(inq => inq.status === selectedStatus);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredInquiries(filtered);
  }, [inquiries, searchQuery, selectedStatus]);

  const handleReply = async () => {
    if (!selectedInquiry || !replyText.trim()) {
      Alert.alert('오류', '답변 내용을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`http://1.246.253.172:3000/api/admin/inquiries/${selectedInquiry.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText.trim() }),
      });
      const data = await response.json();
      
      if (data.success) {
    setInquiries(prev =>
      prev.map(inq =>
            inq.id === selectedInquiry.id ? data.data.inquiry : inq
      )
    );

    setReplyModalVisible(false);
    setReplyText('');
    setSelectedInquiry(null);
    Alert.alert('완료', '답변이 등록되었습니다.');
      } else {
        Alert.alert('오류', data.message || '답변 등록 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('답변 등록 오류:', error);
      Alert.alert('오류', '답변 등록 중 오류가 발생했습니다.');
    }
  };

  const handleChangeStatus = async (inquiry: Inquiry, newStatus: InquiryStatus) => {
    try {
      const response = await fetch(`http://1.246.253.172:3000/api/admin/inquiries/${inquiry.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      
      if (data.success) {
    setInquiries(prev =>
      prev.map(inq =>
        inq.id === inquiry.id ? { ...inq, status: newStatus } : inq
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

  const getStatusInfo = (status: InquiryStatus) => {
    return statusOptions.find(s => s.value === status) || statusOptions[1];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderInquiryItem = ({ item }: { item: Inquiry }) => {
    const statusInfo = getStatusInfo(item.status);
    const isExpanded = expandedInquiry === item.id;

    return (
      <Card
        style={styles.inquiryCard}
        onPress={() => setExpandedInquiry(isExpanded ? null : item.id)}
      >
        <Card.Content style={styles.cardContent}>
          {/* 헤더 영역 */}
          <View style={styles.inquiryHeader}>
            <View style={styles.headerLeft}>
              <Text variant="titleSmall" style={styles.inquiryTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <Chip
                mode="flat"
                compact
                style={[styles.statusChip, { backgroundColor: statusInfo.color + '20' }]}
                textStyle={{ color: statusInfo.color, fontSize: 11 }}
              >
                {statusInfo.label}
              </Chip>
              <IconButton
                icon={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                onPress={() => setExpandedInquiry(isExpanded ? null : item.id)}
              />
            </View>
          </View>

          {/* 기본 정보 */}
          <View style={styles.inquiryMeta}>
            <Chip mode="outlined" compact style={styles.categoryChip}>
              {item.category}
            </Chip>
            <View style={styles.userInfo}>
              <Ionicons name="person-outline" size={14} color="#8E8E93" />
              <Text variant="bodySmall" style={styles.userName}>
                {item.userName}
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.date}>
              {formatDate(item.createdAt)}
            </Text>
          </View>

          {/* 미리보기 내용 (접혀있을 때) */}
          {!isExpanded && (
            <Text variant="bodyMedium" style={styles.inquiryContent} numberOfLines={2}>
              {item.content}
            </Text>
          )}

          {/* 확장된 내용 */}
          {isExpanded && (
            <>
              <Divider style={styles.expandedDivider} />
              
              {/* 문의 상세 정보 */}
              <View style={styles.expandedSection}>
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  📋 문의 내용
                </Text>
                <Text variant="bodyMedium" style={styles.expandedContent}>
                  {item.content}
                </Text>
              </View>

              {/* 연락처 정보 */}
              <View style={styles.contactInfo}>
                <View style={styles.contactRow}>
                  <Ionicons name="mail-outline" size={16} color="#8E8E93" />
                  <Text variant="bodySmall" style={styles.contactText}>
                    {item.userEmail}
                  </Text>
                </View>
                <View style={styles.contactRow}>
                  <Ionicons name="call-outline" size={16} color="#8E8E93" />
                  <Text variant="bodySmall" style={styles.contactText}>
                    {item.userPhone}
                  </Text>
                </View>
              </View>

              {/* 답변 영역 */}
              {item.reply ? (
                <View style={styles.replySection}>
                  <Text variant="titleSmall" style={styles.sectionTitle}>
                    💬 답변 내용
                  </Text>
                  <View style={styles.replyBox}>
                    <Text variant="bodyMedium" style={styles.replyContent}>
                      {item.reply}
                    </Text>
                    {item.repliedByName && (
                      <View style={styles.replyMeta}>
                        <Text variant="bodySmall" style={styles.replyAuthor}>
                          답변: {item.repliedByName}
                        </Text>
                        {item.repliedAt && (
                          <Text variant="bodySmall" style={styles.replyDate}>
                            {formatDate(item.repliedAt)}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                  {/* 답변 수정 버튼 */}
                  <Button
                    mode="outlined"
                    icon="pencil"
                    onPress={() => {
                      setSelectedInquiry(item);
                      setReplyText(item.reply || '');
                      setReplyModalVisible(true);
                    }}
                    style={styles.actionButton}
                  >
                    답변 수정
                  </Button>
                </View>
              ) : (
                <View style={styles.noReplySection}>
                  <Text variant="bodyMedium" style={styles.noReplyText}>
                    아직 답변이 등록되지 않았습니다.
                  </Text>
                  <Button
                    mode="contained"
                    icon="reply"
                    onPress={() => {
                      setSelectedInquiry(item);
                      setReplyText('');
                      setReplyModalVisible(true);
                    }}
                    style={styles.replyButton}
                  >
                    답변하기
                  </Button>
                </View>
              )}

              {/* 상태 변경 버튼 */}
              <View style={styles.statusActions}>
                {item.status === 'pending' && (
                  <Button
                    mode="outlined"
                    icon="progress-clock"
                    onPress={() => handleChangeStatus(item, 'in_progress')}
                    style={styles.statusButton}
                  >
                    처리중으로 변경
                  </Button>
                )}
                {(item.status === 'pending' || item.status === 'in_progress') && (
                  <Button
                    mode="outlined"
                    icon="close-circle"
                    onPress={() => handleChangeStatus(item, 'closed')}
                    style={styles.statusButton}
                  >
                    종료
                  </Button>
                )}
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 검색바 */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="문의 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* 상태 필터 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {statusOptions.map((status) => (
          <Chip
            key={status.value}
            mode={selectedStatus === status.value ? 'flat' : 'outlined'}
            selected={selectedStatus === status.value}
            onPress={() => setSelectedStatus(status.value as InquiryStatus | 'all')}
            style={[
              styles.filterChip,
              selectedStatus === status.value && { backgroundColor: status.color + '20' }
            ]}
            textStyle={[
              styles.filterChipText,
              selectedStatus === status.value && { color: status.color }
            ]}
          >
            {status.label}
          </Chip>
        ))}
      </ScrollView>

      {/* 결과 헤더 */}
      <View style={styles.resultHeader}>
        <Text variant="bodyMedium" style={styles.resultCount}>
          총 {filteredInquiries.length}개
        </Text>
      </View>

      {/* 문의 목록 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            문의를 불러오는 중...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredInquiries}
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
                문의가 없습니다
              </Text>
            </View>
          }
        />
      )}

      {/* 답변 모달 */}
      <Portal>
        <Modal
          visible={replyModalVisible}
          onDismiss={() => {
            setReplyModalVisible(false);
            setReplyText('');
            setSelectedInquiry(null);
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text variant="titleLarge" style={styles.modalTitle}>
                문의 답변
              </Text>
              <Divider style={styles.modalDivider} />
              
              {selectedInquiry && (
                <>
                  <Text variant="titleSmall" style={styles.modalInquiryTitle}>
                    {selectedInquiry.title}
                  </Text>
                  <Text variant="bodyMedium" style={styles.modalInquiryContent}>
                    {selectedInquiry.content}
                  </Text>
                  <Divider style={styles.modalDivider} />
                </>
              )}

              <TextInput
                label="답변 내용"
                value={replyText}
                onChangeText={setReplyText}
                mode="outlined"
                multiline
                numberOfLines={6}
                placeholder="답변 내용을 입력하세요"
                style={styles.replyInput}
              />

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    Keyboard.dismiss();
                    setReplyModalVisible(false);
                    setReplyText('');
                    setSelectedInquiry(null);
                  }}
                  style={styles.modalButton}
                >
                  취소
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    Keyboard.dismiss();
                    handleReply();
                  }}
                  style={[styles.modalButton, styles.submitButton]}
                >
                  답변 등록
                </Button>
              </View>
            </ScrollView>
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
  inquiryList: {
    paddingHorizontal: 16,
    paddingTop: 8,
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
  headerLeft: {
    flex: 1,
  },
  inquiryTitle: {
    color: '#1D1B20',
    fontWeight: '600',
  },
  inquiryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  categoryChip: {
    height: 28,
    paddingHorizontal: 10,
    minWidth: 60,
  },
  statusChip: {
    height: 28,
    paddingHorizontal: 10,
    minWidth: 60,
  },
  inquiryContent: {
    color: '#49454F',
    marginBottom: 12,
    lineHeight: 20,
  },
  inquiryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    color: '#8E8E93',
  },
  date: {
    color: '#8E8E93',
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  replyText: {
    marginLeft: 6,
    color: '#007AFF',
    flex: 1,
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
  modalContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  modalScrollView: {
    width: '100%',
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    color: '#1D1B20',
    fontWeight: '600',
    marginBottom: 16,
  },
  modalDivider: {
    marginVertical: 12,
    backgroundColor: '#E0E0E0',
  },
  modalInquiryTitle: {
    color: '#1D1B20',
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInquiryContent: {
    color: '#49454F',
    marginBottom: 12,
  },
  replyInput: {
    backgroundColor: '#FFFFFF',
    minHeight: 150,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandedDivider: {
    marginVertical: 16,
    backgroundColor: '#E0E0E0',
  },
  expandedSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1D1B20',
    fontWeight: '600',
    marginBottom: 8,
  },
  expandedContent: {
    color: '#49454F',
    lineHeight: 22,
  },
  contactInfo: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactText: {
    marginLeft: 8,
    color: '#49454F',
  },
  replySection: {
    marginBottom: 16,
  },
  replyBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
    marginBottom: 12,
  },
  replyContent: {
    color: '#1D1B20',
    lineHeight: 22,
    marginBottom: 8,
  },
  replyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#BBDEFB',
  },
  replyAuthor: {
    color: '#007AFF',
    fontWeight: '600',
  },
  replyDate: {
    color: '#8E8E93',
  },
  actionButton: {
    borderRadius: 8,
    borderColor: '#007AFF',
  },
  noReplySection: {
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  noReplyText: {
    color: '#8E8E93',
    marginBottom: 12,
  },
  replyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  statusActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statusButton: {
    flex: 1,
    borderRadius: 8,
    borderColor: '#8E8E93',
  },
});

export default InquiryManagementScreen;

