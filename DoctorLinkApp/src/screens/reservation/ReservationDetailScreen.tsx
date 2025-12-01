import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  FAB,
  Avatar,
  Dialog,
  Portal,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { RootStackParamList, Reservation, ReservationStatus } from '../../types';
import reservationService from '../../services/reservationService';

type ReservationDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ReservationDetail'>;
type ReservationDetailScreenRouteProp = RouteProp<RootStackParamList, 'ReservationDetail'>;

interface Props {
  navigation: ReservationDetailScreenNavigationProp;
  route: ReservationDetailScreenRouteProp;
}

const ReservationDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { reservationId } = route.params;
  
  // 상태 관리
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // 데이터 로드
  useEffect(() => {
    loadReservationDetails();
  }, [reservationId]);

  const loadReservationDetails = async () => {
    try {
      setIsLoading(true);
      
      // Mock 데이터에서 예약 찾기
      const mockReservations = reservationService.generateMockReservations(20);
      const foundReservation = mockReservations.find(r => r.id === reservationId);
      
      if (foundReservation) {
        setReservation(foundReservation);
      } else {
        Alert.alert('오류', '예약 정보를 찾을 수 없습니다.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('예약 상세 정보 로드 오류:', error);
      Alert.alert('오류', '예약 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 전화걸기
  const handleCall = () => {
    // Mock 병원 전화번호
    const phoneNumber = '02-1234-5678';
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // 예약 수정
  const handleEditReservation = () => {
    if (reservation) {
      navigation.navigate('Reservation', { 
        reservationId: reservation.id,
        hospitalId: reservation.hospitalId,
        doctorId: reservation.doctorId
      });
    }
  };

  // 예약 취소
  const handleCancelReservation = async () => {
    if (!reservation || !cancelReason.trim()) {
      Alert.alert('입력 오류', '취소 사유를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await reservationService.cancelReservation(reservation.id, cancelReason);
      
      if (response.success) {
        Alert.alert(
          '예약 취소',
          '예약이 성공적으로 취소되었습니다.',
          [
            {
              text: '확인',
              onPress: () => {
                setShowCancelDialog(false);
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('취소 실패', response.message || '예약 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error('예약 취소 오류:', error);
      Alert.alert('오류', '예약 취소 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 리뷰 제출
  const handleSubmitReview = async () => {
    if (!reservation || !reviewComment.trim()) {
      Alert.alert('입력 오류', '리뷰 내용을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await reservationService.submitReservationFeedback(reservation.id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      
      if (response.success) {
        Alert.alert(
          '리뷰 등록',
          '리뷰가 성공적으로 등록되었습니다.',
          [
            {
              text: '확인',
              onPress: () => {
                setShowReviewDialog(false);
                setReviewComment('');
                setReviewRating(5);
              },
            },
          ]
        );
      } else {
        Alert.alert('등록 실패', response.message || '리뷰 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('리뷰 제출 오류:', error);
      Alert.alert('오류', '리뷰 제출 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 상태별 색상 반환
  const getStatusColor = (status: ReservationStatus) => {
    return reservationService.getReservationStatusColor(status);
  };

  // 상태별 텍스트 반환
  const getStatusText = (status: ReservationStatus) => {
    return reservationService.getReservationStatusText(status);
  };

  // 액션 버튼 렌더링
  const renderActionButtons = () => {
    if (!reservation) return null;

    const canCancel = reservationService.canCancelReservation(reservation);
    const canModify = reservationService.canModifyReservation(reservation);
    const canReview = reservation.status === 'completed';

    return (
      <View style={styles.actionButtonsContainer}>
        {canModify && (
          <Button
            mode="outlined"
            style={styles.actionButton}
            onPress={handleEditReservation}
            icon="pencil"
          >
            예약 수정
          </Button>
        )}
        
        {canCancel && (
          <Button
            mode="outlined"
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => setShowCancelDialog(true)}
            icon="close-circle"
            buttonColor="#FFE5E3"
            textColor="#FF3B30"
          >
            예약 취소
          </Button>
        )}
        
        {canReview && (
          <Button
            mode="contained"
            style={styles.actionButton}
            onPress={() => setShowReviewDialog(true)}
            icon="star"
          >
            리뷰 작성
          </Button>
        )}
        
        <Button
          mode="outlined"
          style={styles.actionButton}
          onPress={handleCall}
          icon="phone"
        >
          병원 전화
        </Button>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            예약 정보를 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!reservation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#8E8E93" />
          <Text variant="titleMedium" style={styles.errorTitle}>
            예약 정보를 찾을 수 없습니다
          </Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            뒤로가기
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <LinearGradient
          colors={[getStatusColor(reservation.status), '#FFFFFF']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <Text variant="titleLarge" style={styles.headerTitle}>
                예약 상세
              </Text>
              <Chip
                mode="flat"
                style={[styles.statusChip, { backgroundColor: getStatusColor(reservation.status) }]}
                textStyle={styles.statusChipText}
              >
                {getStatusText(reservation.status)}
              </Chip>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 예약 기본 정보 */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              예약 정보
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color="#8E8E93" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>병원</Text>
                <Text variant="titleSmall" style={styles.infoValue}>
                  {reservation.hospitalName}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#8E8E93" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>담당의</Text>
                <Text variant="titleSmall" style={styles.infoValue}>
                  {reservation.doctorName} 의사
                </Text>
                <Text variant="bodySmall" style={styles.department}>
                  {reservation.department}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>예약 날짜</Text>
                <Text variant="titleSmall" style={styles.infoValue}>
                  {reservationService.formatDate(reservation.date)}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#8E8E93" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>예약 시간</Text>
                <Text variant="titleSmall" style={styles.infoValue}>
                  {reservationService.formatTime(reservation.time)}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={20} color="#8E8E93" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>예약 번호</Text>
                <Text variant="titleSmall" style={styles.infoValue}>
                  {reservation.id}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 진료 목적 */}
        {reservation.reason && (
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                진료 목적
              </Text>
              <Divider style={styles.divider} />
              
              <Text variant="bodyMedium" style={styles.reasonText}>
                {reservation.reason}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* 추가 메모 */}
        {reservation.notes && (
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                추가 메모
              </Text>
              <Divider style={styles.divider} />
              
              <Text variant="bodyMedium" style={styles.notesText}>
                {reservation.notes}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* 예약 이력 */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              예약 이력
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.historyItem}>
              <View style={styles.historyDot} />
              <View style={styles.historyContent}>
                <Text variant="bodyMedium" style={styles.historyTitle}>
                  예약 생성
                </Text>
                <Text variant="bodySmall" style={styles.historyDate}>
                  {new Date(reservation.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </View>
            
            {reservation.updatedAt !== reservation.createdAt && (
              <View style={styles.historyItem}>
                <View style={styles.historyDot} />
                <View style={styles.historyContent}>
                  <Text variant="bodyMedium" style={styles.historyTitle}>
                    상태 업데이트
                  </Text>
                  <Text variant="bodySmall" style={styles.historyDate}>
                    {new Date(reservation.updatedAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* 주의사항 */}
        <Card style={styles.noticeCard}>
          <Card.Content>
            <View style={styles.noticeHeader}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text variant="titleMedium" style={styles.noticeTitle}>
                예약 안내사항
              </Text>
            </View>
            
            <View style={styles.noticeList}>
              <Text variant="bodySmall" style={styles.noticeItem}>
                • 예약 시간 10분 전까지 병원에 도착해주세요.
              </Text>
              <Text variant="bodySmall" style={styles.noticeItem}>
                • 예약 취소는 24시간 전까지만 가능합니다.
              </Text>
              <Text variant="bodySmall" style={styles.noticeItem}>
                • 예약 수정은 48시간 전까지만 가능합니다.
              </Text>
              <Text variant="bodySmall" style={styles.noticeItem}>
                • 신분증과 건강보험증을 지참해주세요.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* 액션 버튼들 */}
        {renderActionButtons()}
      </ScrollView>

      {/* 예약 취소 다이얼로그 */}
      <Portal>
        <Dialog visible={showCancelDialog} onDismiss={() => setShowCancelDialog(false)}>
          <Dialog.Title>예약 취소</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              예약을 취소하시겠습니까? 취소 사유를 입력해주세요.
            </Text>
            
            <TextInput
              label="취소 사유"
              value={cancelReason}
              onChangeText={setCancelReason}
              mode="outlined"
              style={styles.dialogInput}
              multiline
              numberOfLines={3}
              placeholder="예: 개인 사정으로 인한 취소"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCancelDialog(false)}>
              취소
            </Button>
            <Button 
              mode="contained" 
              onPress={handleCancelReservation}
              loading={isLoading}
              disabled={isLoading || !cancelReason.trim()}
            >
              확인
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* 리뷰 작성 다이얼로그 */}
      <Portal>
        <Dialog visible={showReviewDialog} onDismiss={() => setShowReviewDialog(false)}>
          <Dialog.Title>리뷰 작성</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              진료는 어떠셨나요? 솔직한 후기를 남겨주세요.
            </Text>
            
            {/* 별점 */}
            <View style={styles.ratingContainer}>
              <Text variant="bodyMedium" style={styles.ratingLabel}>
                평점
              </Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setReviewRating(star)}
                  >
                    <Ionicons
                      name={star <= reviewRating ? 'star' : 'star-outline'}
                      size={24}
                      color="#FFD700"
                      style={styles.star}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TextInput
              label="리뷰 내용"
              value={reviewComment}
              onChangeText={setReviewComment}
              mode="outlined"
              style={styles.dialogInput}
              multiline
              numberOfLines={4}
              placeholder="진료 경험을 자세히 알려주세요."
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowReviewDialog(false)}>
              취소
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSubmitReview}
              loading={isLoading}
              disabled={isLoading || !reviewComment.trim()}
            >
              등록
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    padding: 20,
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#8E8E93',
  },
  header: {
    height: 120,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    color: '#1D1B20',
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
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
    fontWeight: '600',
  },
  department: {
    color: '#8E8E93',
    marginTop: 2,
  },
  reasonText: {
    color: '#49454F',
    lineHeight: 20,
  },
  notesText: {
    color: '#49454F',
    lineHeight: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginTop: 6,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    color: '#1D1B20',
    fontWeight: '500',
    marginBottom: 2,
  },
  historyDate: {
    color: '#8E8E93',
  },
  noticeCard: {
    backgroundColor: '#E3F2FF',
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noticeTitle: {
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  noticeList: {
    paddingLeft: 8,
  },
  noticeItem: {
    color: '#49454F',
    marginBottom: 4,
    lineHeight: 18,
  },
  actionButtonsContainer: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
    marginBottom: 8,
  },
  cancelButton: {
    borderColor: '#FF3B30',
  },
  dialogText: {
    marginBottom: 16,
    color: '#49454F',
  },
  dialogInput: {
    backgroundColor: '#F8F9FA',
  },
  ratingContainer: {
    marginBottom: 16,
  },
  ratingLabel: {
    marginBottom: 8,
    color: '#1D1B20',
    fontWeight: '500',
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 4,
  },
});

export default ReservationDetailScreen; 