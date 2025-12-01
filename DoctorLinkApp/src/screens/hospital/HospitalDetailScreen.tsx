import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
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
  List,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { RootStackParamList, Hospital, Doctor } from '../../types';
import hospitalService from '../../services/hospitalService';

const { width } = Dimensions.get('window');

type HospitalDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HospitalDetail'>;
type HospitalDetailScreenRouteProp = RouteProp<RootStackParamList, 'HospitalDetail'>;

interface Props {
  navigation: HospitalDetailScreenNavigationProp;
  route: HospitalDetailScreenRouteProp;
}

const HospitalDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { hospitalId } = route.params;
  
  // 상태 관리
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'info' | 'doctors' | 'reviews'>('info');

  // 데이터 로드
  useEffect(() => {
    loadHospitalDetails();
  }, [hospitalId]);

  const loadHospitalDetails = async () => {
    try {
      setIsLoading(true);
      
      // Mock 데이터에서 병원 찾기
      const mockHospitals = hospitalService.generateMockHospitals(20);
      const foundHospital = mockHospitals.find(h => h.id === hospitalId);
      
      if (foundHospital) {
        setHospital(foundHospital);
        // 즐겨찾기 상태 확인 (Mock)
        setIsFavorite(Math.random() > 0.5);
      } else {
        Alert.alert('오류', '병원 정보를 찾을 수 없습니다.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('병원 상세 정보 로드 오류:', error);
      Alert.alert('오류', '병원 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 전화걸기
  const handleCall = () => {
    if (hospital?.phone) {
      Linking.openURL(`tel:${hospital.phone}`);
    }
  };

  // 즐겨찾기 토글
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // 실제 구현 시 API 호출
  };

  // 예약하기
  const handleReservation = (doctorId?: string) => {
    navigation.navigate('Reservation', { 
      hospitalId: hospital?.id,
      doctorId 
    });
  };

  // 탭 콘텐츠 렌더링
  const renderTabContent = () => {
    if (!hospital) return null;

    switch (selectedTab) {
      case 'info':
        return renderHospitalInfo();
      case 'doctors':
        return renderDoctorsList();
      case 'reviews':
        return renderReviews();
      default:
        return renderHospitalInfo();
    }
  };

  // 병원 정보 탭
  const renderHospitalInfo = () => (
    <View style={styles.tabContent}>
      {/* 기본 정보 */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            기본 정보
          </Text>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#8E8E93" />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>주소</Text>
              <Text variant="bodyMedium">{hospital?.address}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#8E8E93" />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>전화번호</Text>
              <TouchableOpacity onPress={handleCall}>
                <Text variant="bodyMedium" style={styles.phoneNumber}>
                  {hospital?.phone}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="globe-outline" size={20} color="#8E8E93" />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>웹사이트</Text>
              <Text variant="bodyMedium">{hospital?.website || '정보 없음'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color="#8E8E93" />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>병원 유형</Text>
              <Text variant="bodyMedium">{hospital?.type}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 운영시간 */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            운영시간
          </Text>
          <Divider style={styles.divider} />
          
          {hospital?.operatingHours && Object.entries(hospital.operatingHours).map(([day, hours]) => (
            <View key={day} style={styles.operatingHoursRow}>
              <Text variant="bodyMedium" style={styles.dayLabel}>
                {getDayLabel(day)}
              </Text>
              <Text variant="bodyMedium" style={styles.hoursText}>
                {hours}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* 진료과목 */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            진료과목
          </Text>
          <Divider style={styles.divider} />
          
          <View style={styles.departmentsGrid}>
            {hospital?.departments.map((dept, index) => (
              <Chip
                key={index}
                mode="outlined"
                style={styles.departmentChip}
                textStyle={styles.departmentChipText}
              >
                {dept}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* 병원 소개 */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            병원 소개
          </Text>
          <Divider style={styles.divider} />
          
          <Text variant="bodyMedium" style={styles.description}>
            {hospital?.description}
          </Text>
        </Card.Content>
      </Card>

      {/* 편의시설 */}
      {hospital?.facilities && hospital.facilities.length > 0 && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              편의시설
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.facilitiesGrid}>
              {hospital.facilities.map((facility, index) => (
                <View key={index} style={styles.facilityItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                  <Text variant="bodyMedium" style={styles.facilityText}>
                    {facility}
                  </Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  // 의사 목록 탭
  const renderDoctorsList = () => (
    <View style={styles.tabContent}>
      {hospital?.doctors.map((doctor) => (
        <Card key={doctor.id} style={styles.doctorCard}>
          <Card.Content style={styles.doctorCardContent}>
            <View style={styles.doctorHeader}>
              <Avatar.Text size={60} label={doctor.name.charAt(0)} />
              <View style={styles.doctorInfo}>
                <Text variant="titleMedium" style={styles.doctorName}>
                  {doctor.name} 의사
                </Text>
                <Chip mode="outlined" style={styles.departmentChip}>
                  {doctor.department}
                </Chip>
                <Text variant="bodySmall" style={styles.doctorSpecialization}>
                  {doctor.specialization}
                </Text>
                <Text variant="bodySmall" style={styles.doctorExperience}>
                  경력 {doctor.experience}년
                </Text>
              </View>
            </View>
            
            {doctor.rating && (
              <View style={styles.doctorRating}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text variant="bodySmall" style={styles.rating}>
                    {doctor.rating.toFixed(1)} ({doctor.reviewCount}개 리뷰)
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.doctorActions}>
              <Button
                mode="outlined"
                style={styles.doctorActionButton}
                onPress={() => {
                  // 의사 상세 정보 보기 (추후 구현)
                  console.log('의사 상세 정보:', doctor.id);
                }}
              >
                상세 정보
              </Button>
              
              <Button
                mode="contained"
                style={styles.doctorActionButton}
                onPress={() => handleReservation(doctor.id)}
              >
                예약하기
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  // 리뷰 탭
  const renderReviews = () => (
    <View style={styles.tabContent}>
      <Card style={styles.reviewSummaryCard}>
        <Card.Content>
          <View style={styles.reviewSummary}>
            <View style={styles.ratingScore}>
              <Text variant="displaySmall" style={styles.ratingNumber}>
                {hospital?.rating.toFixed(1)}
              </Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= (hospital?.rating || 0) ? 'star' : 'star-outline'}
                    size={20}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text variant="bodySmall" style={styles.reviewCount}>
                총 {hospital?.reviewCount}개 리뷰
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Mock 리뷰 목록 */}
      {generateMockReviews().map((review, index) => (
        <Card key={index} style={styles.reviewCard}>
          <Card.Content>
            <View style={styles.reviewHeader}>
              <Avatar.Text size={40} label={review.userName.charAt(0)} />
              <View style={styles.reviewInfo}>
                <Text variant="titleSmall">{review.userName}</Text>
                <View style={styles.reviewRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= review.rating ? 'star' : 'star-outline'}
                      size={14}
                      color="#FFD700"
                    />
                  ))}
                  <Text variant="bodySmall" style={styles.reviewDate}>
                    {review.date}
                  </Text>
                </View>
              </View>
            </View>
            
            <Text variant="bodyMedium" style={styles.reviewText}>
              {review.comment}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  // Mock 리뷰 생성
  const generateMockReviews = () => [
    {
      userName: '김환자',
      rating: 5,
      date: '2024.01.15',
      comment: '의료진이 친절하고 시설이 깨끗합니다. 대기시간도 길지 않아서 좋았어요.',
    },
    {
      userName: '이환자',
      rating: 4,
      date: '2024.01.10',
      comment: '전문적인 진료를 받을 수 있어서 만족합니다. 주차시설이 조금 부족한 것 같아요.',
    },
    {
      userName: '박환자',
      rating: 5,
      date: '2024.01.08',
      comment: '예약 시스템이 편리하고 의사선생님이 자세히 설명해주셔서 좋았습니다.',
    },
  ];

  // 요일 라벨 변환
  const getDayLabel = (day: string) => {
    const dayLabels: Record<string, string> = {
      monday: '월요일',
      tuesday: '화요일',
      wednesday: '수요일',
      thursday: '목요일',
      friday: '금요일',
      saturday: '토요일',
      sunday: '일요일',
    };
    return dayLabels[day] || day;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            병원 정보를 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hospital) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#8E8E93" />
          <Text variant="titleMedium" style={styles.errorTitle}>
            병원 정보를 찾을 수 없습니다
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
      {/* 헤더 이미지 */}
      <View style={styles.headerImageContainer}>
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0)']}
          style={styles.headerGradient}
        >
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.headerButton}
              onPress={toggleFavorite}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#FF3B30' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* 병원 기본 정보 */}
      <View style={styles.hospitalHeader}>
        <Text variant="headlineSmall" style={styles.hospitalName} numberOfLines={2} ellipsizeMode="tail">
          {hospital.name}
        </Text>
        
        <View style={styles.hospitalMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text variant="titleSmall" style={styles.rating}>
              {hospital.rating.toFixed(1)} ({hospital.reviewCount})
            </Text>
          </View>
          
          <Chip mode="outlined" style={styles.typeChip}>
            {hospital.type}
          </Chip>
          
          <View style={styles.statusContainer}>
            <Ionicons
              name={hospitalService.isHospitalOpen(hospital) ? 'time' : 'time-outline'}
              size={16}
              color={hospitalService.isHospitalOpen(hospital) ? '#34C759' : '#8E8E93'}
            />
            <Text
              variant="bodySmall"
              style={[
                styles.statusText,
                { color: hospitalService.isHospitalOpen(hospital) ? '#34C759' : '#8E8E93' }
              ]}
            >
              {hospitalService.isHospitalOpen(hospital) ? '영업 중' : '영업 종료'}
            </Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Button
            mode="outlined"
            style={styles.quickActionButton}
            onPress={handleCall}
            icon="phone"
          >
            전화
          </Button>
          
          <Button
            mode="outlined"
            style={styles.quickActionButton}
            onPress={() => {
              // 길찾기 기능 (추후 구현)
              console.log('길찾기');
            }}
            icon="navigation"
          >
            길찾기
          </Button>
        </View>
      </View>

      {/* 탭 메뉴 */}
      <View style={styles.tabMenu}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'info' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('info')}
        >
          <Text
            variant="titleSmall"
            style={[styles.tabButtonText, selectedTab === 'info' && styles.tabButtonTextActive]}
          >
            정보
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'doctors' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('doctors')}
        >
          <Text
            variant="titleSmall"
            style={[styles.tabButtonText, selectedTab === 'doctors' && styles.tabButtonTextActive]}
          >
            의료진 ({hospital.doctors.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'reviews' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('reviews')}
        >
          <Text
            variant="titleSmall"
            style={[styles.tabButtonText, selectedTab === 'reviews' && styles.tabButtonTextActive]}
          >
            리뷰 ({hospital.reviewCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 탭 콘텐츠 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>

      {/* 예약하기 FAB */}
      <FAB
        icon="calendar"
        label="예약하기"
        style={styles.fab}
        onPress={() => handleReservation()}
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
  headerImageContainer: {
    height: 200,
    backgroundColor: '#007AFF',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hospitalHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  hospitalName: {
    color: '#1D1B20',
    fontWeight: '700',
    marginBottom: 12,
    flexShrink: 1,
  },
  hospitalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  rating: {
    marginLeft: 4,
    color: '#1D1B20',
    fontWeight: '600',
  },
  typeChip: {
    height: 34,
    marginRight: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    minWidth: 80,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    paddingVertical: 4,
  },
  tabMenu: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#007AFF',
  },
  tabButtonText: {
    color: '#8E8E93',
  },
  tabButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // FAB 공간 확보
  },
  tabContent: {
    padding: 16,
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
  phoneNumber: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  operatingHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    color: '#49454F',
    fontWeight: '500',
    flex: 1,
  },
  hoursText: {
    color: '#1D1B20',
  },
  departmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  departmentChip: {
    marginRight: 10,
    marginBottom: 10,
    height: 36,
    paddingHorizontal: 14,
    minWidth: 80,
  },
  departmentChipText: {
    fontSize: 14,
    paddingHorizontal: 6,
  },
  description: {
    color: '#49454F',
    lineHeight: 20,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  facilityText: {
    marginLeft: 8,
    color: '#49454F',
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorCardContent: {
    padding: 16,
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 16,
  },
  doctorName: {
    color: '#1D1B20',
    fontWeight: '600',
    marginBottom: 8,
  },
  doctorSpecialization: {
    color: '#49454F',
    marginBottom: 4,
    marginTop: 8,
  },
  doctorExperience: {
    color: '#8E8E93',
  },
  doctorRating: {
    marginBottom: 16,
  },
  doctorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  doctorActionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    paddingVertical: 4,
  },
  reviewSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reviewSummary: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  ratingScore: {
    alignItems: 'center',
  },
  ratingNumber: {
    color: '#1D1B20',
    fontWeight: '700',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewCount: {
    color: '#8E8E93',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reviewDate: {
    marginLeft: 8,
    color: '#8E8E93',
  },
  reviewText: {
    color: '#49454F',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#007AFF',
  },
});

export default HospitalDetailScreen; 