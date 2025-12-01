import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Chip, Searchbar, ActivityIndicator, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList, Hospital } from '../../types';

// 네비게이션 타입
type HospitalManagementScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'HospitalManagement'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: HospitalManagementScreenNavigationProp;
}

const HospitalManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadHospitals = async () => {
    try {
      setIsLoading(true);
      
      // Mock 병원 데이터
      const mockHospitals: Hospital[] = [
        {
          id: 'hosp-001',
          name: '서울대학교병원',
          type: '종합병원',
          address: '서울시 종로구 대학로 101',
          phone: '02-2072-2114',
          email: 'info@snuh.org',
          rating: 4.8,
          reviewCount: 1234,
          distance: 2.5,
          departments: ['내과', '외과', '소아과', '산부인과'],
          operatingHours: {
            monday: '08:00-18:00',
            tuesday: '08:00-18:00',
            wednesday: '08:00-18:00',
            thursday: '08:00-18:00',
            friday: '08:00-18:00',
            saturday: '08:00-13:00',
            sunday: '09:00-13:00',
          },
          doctors: [],
          status: 'active',
          registrationDate: '2024-01-01T00:00:00Z',
          lastUpdated: '2024-01-01T00:00:00Z',
          description: '최고의 의료진과 첨단 시설을 갖춘 종합병원',
          facilities: ['주차장', 'MRI', 'CT', '응급실'],
        },
        {
          id: 'hosp-002',
          name: '강남성심병원',
          type: '병원',
          address: '서울시 강남구 테헤란로 123',
          phone: '02-3456-7890',
          email: 'info@gangnam.org',
          rating: 4.5,
          reviewCount: 567,
          distance: 1.8,
          departments: ['내과', '정형외과', '피부과'],
          operatingHours: {
            monday: '09:00-18:00',
            tuesday: '09:00-18:00',
            wednesday: '09:00-18:00',
            thursday: '09:00-18:00',
            friday: '09:00-18:00',
            saturday: '09:00-13:00',
            sunday: '휴진',
          },
          doctors: [],
          status: 'active',
          registrationDate: '2024-01-01T00:00:00Z',
          lastUpdated: '2024-01-01T00:00:00Z',
          description: '환자 중심의 따뜻한 진료',
          facilities: ['주차장', 'X-Ray'],
        },
      ];
      
      setHospitals(mockHospitals);
    } catch (error) {
      console.error('병원 데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            병원 데이터를 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 검색 */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="병원 검색..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* 결과 헤더 */}
      <View style={styles.resultHeader}>
        <Text variant="bodyMedium" style={styles.resultCount}>
          {filteredHospitals.length}개의 병원
        </Text>
      </View>

      {/* 병원 목록 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredHospitals.map((hospital) => (
          <Card key={hospital.id} style={styles.hospitalCard}>
            <Card.Content style={styles.hospitalContent}>
              <View style={styles.hospitalHeader}>
                <View style={styles.hospitalInfo}>
                  <Text variant="titleMedium" style={styles.hospitalName} numberOfLines={2}>
                    {hospital.name}
                  </Text>
                  <View style={styles.hospitalMeta}>
                    <Chip mode="outlined" compact style={styles.typeChip}>
                      {hospital.type}
                    </Chip>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text variant="bodySmall" style={styles.rating}>
                        {hospital.rating} ({hospital.reviewCount})
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.hospitalDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={16} color="#8E8E93" />
                  <Text variant="bodySmall" style={styles.detailText} numberOfLines={2}>
                    {hospital.address}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={16} color="#8E8E93" />
                  <Text variant="bodySmall" style={styles.detailText}>
                    {hospital.phone}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="medical-outline" size={16} color="#8E8E93" />
                  <Text variant="bodySmall" style={styles.detailText} numberOfLines={2}>
                    {hospital.departments.slice(0, 3).join(', ')}
                    {hospital.departments.length > 3 && ` 외 ${hospital.departments.length - 3}개`}
                  </Text>
                </View>
              </View>

              <View style={styles.hospitalActions}>
                <Button
                  mode="outlined"
                  compact
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('HospitalDetail', { hospitalId: hospital.id })}
                >
                  상세보기
                </Button>
                <Button
                  mode="contained"
                  compact
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => navigation.navigate('HospitalEdit', { hospitalId: hospital.id })}
                >
                  편집
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        label="병원 추가"
        style={styles.fab}
        onPress={() => navigation.navigate('HospitalEdit', {})}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  hospitalCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hospitalContent: {
    padding: 16,
  },
  hospitalHeader: {
    marginBottom: 12,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    color: '#1D1B20',
    fontWeight: '600',
    marginBottom: 6,
  },
  hospitalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeChip: {
    height: 24,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    color: '#8E8E93',
  },
  hospitalDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#49454F',
    flex: 1,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  hospitalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#FF3B30',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF3B30',
  },
});

export default HospitalManagementScreen; 