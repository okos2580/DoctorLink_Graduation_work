import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  ActivityIndicator,
  Searchbar,
  Divider,
  FAB,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { RootStackParamList, TabParamList, MedicalRecord } from '../../types';

type MedicalRecordsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'MedicalRecords'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: MedicalRecordsScreenNavigationProp;
}

const MedicalRecordsScreen: React.FC<Props> = ({ navigation }) => {
  // 상태 관리
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadMedicalRecords();
  }, []);

  // 검색어 필터링
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = medicalRecords.filter(record =>
        record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.treatment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords(medicalRecords);
    }
  }, [medicalRecords, searchQuery]);

  // Mock 진료 기록 데이터 생성
  const generateMockMedicalRecords = (): MedicalRecord[] => {
    const mockRecords: MedicalRecord[] = [];
    const diagnoses = [
      '감기', '위염', '고혈압', '당뇨병', '알레르기 비염',
      '요통', '두통', '불면증', '피부염', '관절염'
    ];
    const treatments = [
      '약물 치료', '물리 치료', '생활습관 개선', '수술 치료', '경과 관찰',
      '식이 요법', '운동 요법', '정기 검진', '추가 검사', '전문의 상담'
    ];

    for (let i = 1; i <= 15; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7)); // 일주일씩 과거로

      mockRecords.push({
        id: `record-${i.toString().padStart(3, '0')}`,
        patientId: 'user-001',
        doctorId: `doctor-hosp-001-내과-${(i % 2) + 1}`,
        appointmentId: `appointment-${i}`,
        date: date.toISOString().split('T')[0],
        diagnosis: diagnoses[i % diagnoses.length],
        treatment: treatments[i % treatments.length],
        prescription: i % 3 === 0 ? '처방전 발급됨' : undefined,
        notes: i % 2 === 0 ? `추가 관찰 사항이 있습니다. 환자 상태는 양호하며, 다음 방문 시 재검진 예정입니다.` : undefined,
        attachments: i % 4 === 0 ? ['검사결과.pdf', 'X-ray.jpg'] : undefined,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      });
    }

    return mockRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // 진료 기록 로드
  const loadMedicalRecords = async () => {
    try {
      setIsLoading(true);
      
      // Mock 데이터 생성
      const mockRecords = generateMockMedicalRecords();
      setMedicalRecords(mockRecords);
      setFilteredRecords(mockRecords);
    } catch (error) {
      console.error('진료 기록 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedicalRecords();
    setRefreshing(false);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  // 진료 기록 카드 렌더링
  const renderMedicalRecord = ({ item: record }: { item: MedicalRecord }) => (
    <Card 
      style={styles.recordCard}
      onPress={() => navigation.navigate('MedicalRecordDetail', { recordId: record.id })}
    >
      <Card.Content style={styles.recordContent}>
        <View style={styles.recordHeader}>
          <Text variant="titleMedium" style={styles.diagnosis}>
            {record.diagnosis}
          </Text>
          <Text variant="bodySmall" style={styles.date}>
            {formatDate(record.date)}
          </Text>
        </View>

        <Text variant="bodyMedium" style={styles.treatment}>
          치료: {record.treatment}
        </Text>

        {record.prescription && (
          <View style={styles.prescriptionContainer}>
            <Ionicons name="medical" size={16} color="#007AFF" />
            <Text variant="bodySmall" style={styles.prescription}>
              {record.prescription}
            </Text>
          </View>
        )}

        {record.notes && (
          <Text variant="bodySmall" style={styles.notes} numberOfLines={2}>
            {record.notes}
          </Text>
        )}

        {record.attachments && record.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            <Ionicons name="attach" size={16} color="#8E8E93" />
            <Text variant="bodySmall" style={styles.attachments}>
              첨부파일 {record.attachments.length}개
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            진료 기록을 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 검색바 */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="진단명, 치료내용으로 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          icon="magnify"
          clearIcon="close"
        />
      </View>

      {/* 통계 요약 */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text variant="headlineSmall" style={styles.summaryNumber}>
                {medicalRecords.length}
              </Text>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                총 진료 기록
              </Text>
            </View>
            <Divider style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text variant="headlineSmall" style={styles.summaryNumber}>
                {medicalRecords.filter(r => r.prescription).length}
              </Text>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                처방전 발급
              </Text>
            </View>
            <Divider style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text variant="headlineSmall" style={styles.summaryNumber}>
                {medicalRecords.filter(r => r.attachments && r.attachments.length > 0).length}
              </Text>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                첨부파일
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* 진료 기록 목록 */}
      <FlatList
        data={filteredRecords}
        renderItem={renderMedicalRecord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.recordsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#8E8E93" />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              진료 기록이 없습니다
            </Text>
            <Text variant="bodyMedium" style={styles.emptyMessage}>
              병원 예약을 통해 진료를 받아보세요
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Reservation', {})}
              style={styles.emptyButton}
            >
              예약하기
            </Button>
          </View>
        }
      />

      {/* 새 예약 FAB */}
      <FAB
        icon="calendar"
        label="예약"
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#8E8E93',
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
  summaryContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#8E8E93',
    textAlign: 'center',
  },
  summaryDivider: {
    height: 40,
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  recordsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordContent: {
    padding: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  diagnosis: {
    color: '#1D1B20',
    fontWeight: '600',
    flex: 1,
  },
  date: {
    color: '#8E8E93',
    marginLeft: 8,
  },
  treatment: {
    color: '#49454F',
    marginBottom: 8,
  },
  prescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prescription: {
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  notes: {
    color: '#8E8E93',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 18,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachments: {
    color: '#8E8E93',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    color: '#1D1B20',
    marginTop: 16,
    marginBottom: 8,
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

export default MedicalRecordsScreen; 