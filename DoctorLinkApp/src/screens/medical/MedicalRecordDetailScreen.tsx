import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Share } from 'react-native';
import {
  Text,
  Card,
  Button,
  Divider,
  ActivityIndicator,
  Chip,
  List,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { RootStackParamList, MedicalRecord } from '../../types';

type MedicalRecordDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MedicalRecordDetail'>;
type MedicalRecordDetailScreenRouteProp = RouteProp<RootStackParamList, 'MedicalRecordDetail'>;

interface Props {
  navigation: MedicalRecordDetailScreenNavigationProp;
  route: MedicalRecordDetailScreenRouteProp;
}

const MedicalRecordDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { recordId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [record, setRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    loadRecordDetail();
  }, [recordId]);

  // Mock 진료 기록 상세 데이터 로드
  const loadRecordDetail = async () => {
    try {
      setIsLoading(true);

      // Mock 데이터 생성 (실제로는 API 호출)
      const mockRecord: MedicalRecord = {
        id: recordId,
        patientId: 'user-001',
        doctorId: 'doctor-hosp-001-내과-1',
        appointmentId: 'appointment-001',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        diagnosis: '급성 상기도 감염 (감기)',
        treatment: '약물 치료 및 충분한 휴식',
        prescription: '처방전 발급됨',
        notes: `환자는 3일 전부터 발열, 기침, 인후통 등의 증상을 호소하였습니다.
        
신체 검사 결과:
- 체온: 38.2°C
- 혈압: 120/80 mmHg
- 맥박: 82회/분
- 호흡수: 18회/분

진단: 급성 상기도 감염(감기)
인후부 발적 관찰, 편도선 경미한 부종

처방:
1. 해열진통제 (아세트아미노펜 500mg) - 1일 3회, 식후 복용
2. 진해거담제 - 1일 3회, 식후 복용
3. 항히스타민제 - 1일 2회, 아침/저녁 복용

권장사항:
- 충분한 수분 섭취
- 휴식 및 수면
- 증상이 호전되지 않거나 악화될 경우 재방문

다음 방문 예정: 1주일 후 경과 관찰`,
        attachments: ['검사결과_2024.pdf', 'X-ray_흉부_2024.jpg', '처방전.pdf'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      setRecord(mockRecord);
    } catch (error) {
      console.error('진료 기록 로드 오류:', error);
      Alert.alert('오류', '진료 기록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
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

  // 공유하기
  const handleShare = async () => {
    if (!record) return;

    try {
      const message = `[진료 기록]
진료일: ${formatDate(record.date)}
진단명: ${record.diagnosis}
치료: ${record.treatment}
${record.prescription ? `처방: ${record.prescription}` : ''}

DoctorLink에서 발송됨`;

      await Share.share({
        message,
        title: '진료 기록 공유',
      });
    } catch (error) {
      console.error('공유 오류:', error);
    }
  };

  // 인쇄하기
  const handlePrint = () => {
    Alert.alert('인쇄', '진료 기록을 인쇄합니다.', [
      { text: '취소', style: 'cancel' },
      { text: '인쇄', onPress: () => console.log('인쇄 시작') },
    ]);
  };

  // 첨부파일 열기
  const handleOpenAttachment = (filename: string) => {
    Alert.alert('첨부파일', `${filename}을(를) 엽니다.`);
  };

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

  if (!record) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text variant="titleMedium" style={styles.errorTitle}>
            진료 기록을 찾을 수 없습니다
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          >
            돌아가기
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 기본 정보 */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text variant="headlineSmall" style={styles.diagnosis}>
                  {record.diagnosis}
                </Text>
                <Text variant="bodyMedium" style={styles.date}>
                  {formatDate(record.date)}
                </Text>
              </View>
              {record.prescription && (
                <Chip icon="medical" style={styles.prescriptionChip}>
                  처방전
                </Chip>
              )}
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="fitness-outline" size={20} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  치료 방법
                </Text>
                <Text variant="bodyLarge" style={styles.infoValue}>
                  {record.treatment}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  진료일
                </Text>
                <Text variant="bodyLarge" style={styles.infoValue}>
                  {formatDate(record.date)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={20} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  기록 번호
                </Text>
                <Text variant="bodyLarge" style={styles.infoValue}>
                  {record.id}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 상세 소견 */}
        {record.notes && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Ionicons name="clipboard-outline" size={24} color="#007AFF" />
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  상세 소견
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.notes}>
                {record.notes}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* 처방전 정보 */}
        {record.prescription && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Ionicons name="medical-outline" size={24} color="#007AFF" />
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  처방전 정보
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.prescription}>
                {record.prescription}
              </Text>
              <Button
                mode="outlined"
                icon="download"
                onPress={() => Alert.alert('다운로드', '처방전을 다운로드합니다.')}
                style={styles.downloadButton}
              >
                처방전 다운로드
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* 첨부파일 */}
        {record.attachments && record.attachments.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Ionicons name="attach-outline" size={24} color="#007AFF" />
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  첨부파일 ({record.attachments.length})
                </Text>
              </View>
              {record.attachments.map((file, index) => (
                <List.Item
                  key={index}
                  title={file}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={
                        file.endsWith('.pdf')
                          ? 'file-pdf-box'
                          : file.endsWith('.jpg') || file.endsWith('.png')
                          ? 'file-image'
                          : 'file-document'
                      }
                    />
                  )}
                  right={(props) => <List.Icon {...props} icon="download" />}
                  onPress={() => handleOpenAttachment(file)}
                  style={styles.attachmentItem}
                />
              ))}
            </Card.Content>
          </Card>
        )}

        {/* 액션 버튼 */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            icon="share-variant"
            onPress={handleShare}
            style={styles.actionButton}
          >
            공유
          </Button>
          <Button
            mode="outlined"
            icon="printer"
            onPress={handlePrint}
            style={styles.actionButton}
          >
            인쇄
          </Button>
        </View>

        {/* 안내 메시지 */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoMessageContainer}>
              <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
              <Text variant="bodySmall" style={styles.infoMessage}>
                진료 기록은 의료법에 따라 안전하게 보관되며, 본인만 열람할 수 있습니다.
                진료 기록에 대한 문의사항은 담당 병원으로 연락해주세요.
              </Text>
            </View>
          </Card.Content>
        </Card>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    color: '#1D1B20',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorButton: {
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  diagnosis: {
    color: '#1D1B20',
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    color: '#8E8E93',
  },
  prescriptionChip: {
    backgroundColor: '#E3F2FD',
    marginLeft: 8,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E0E0E0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    color: '#8E8E93',
    marginBottom: 4,
  },
  infoValue: {
    color: '#1D1B20',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#1D1B20',
    fontWeight: '600',
    marginLeft: 8,
  },
  notes: {
    color: '#49454F',
    lineHeight: 22,
  },
  prescription: {
    color: '#49454F',
    lineHeight: 22,
    marginBottom: 16,
  },
  downloadButton: {
    borderColor: '#007AFF',
  },
  attachmentItem: {
    paddingHorizontal: 0,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderColor: '#007AFF',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  infoMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoMessage: {
    flex: 1,
    color: '#1565C0',
    marginLeft: 12,
    lineHeight: 20,
  },
});

export default MedicalRecordDetailScreen; 