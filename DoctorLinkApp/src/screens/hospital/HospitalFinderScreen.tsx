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
  Searchbar,
  Card,
  Chip,
  Button,
  FAB,
  ActivityIndicator,
  Menu,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// 타입 import
import { RootStackParamList, TabParamList, Hospital, HospitalFilter } from '../../types';
import hospitalService from '../../services/hospitalService';

// 네비게이션 타입
type HospitalFinderScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'HospitalFinder'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: HospitalFinderScreenNavigationProp;
}

const HospitalFinderScreen: React.FC<Props> = ({ navigation }) => {
  // 상태 관리
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 필터 상태
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // 병원 타입과 진료과 목록
  const hospitalTypes = ['전체', '종합병원', '병원', '의원', '치과', '한의원'];
  const departments = ['전체', '내과', '외과', '정형외과', '피부과', '안과', '이비인후과', '산부인과'];

  // 데이터 로드
  const loadHospitals = async () => {
    try {
      setIsLoading(true);
      
      // Mock 데이터 로드
      const mockHospitals = hospitalService.generateMockHospitals(20);
      setHospitals(mockHospitals);
      setFilteredHospitals(mockHospitals);
    } catch (error) {
      console.error('병원 데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    await loadHospitals();
    setRefreshing(false);
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadHospitals();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = [...hospitals];

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(query) ||
        hospital.address.toLowerCase().includes(query) ||
        hospital.departments.some(dept => dept.toLowerCase().includes(query))
      );
    }

    // 병원 타입 필터링
    if (selectedType && selectedType !== '전체') {
      filtered = filtered.filter(hospital => hospital.type === selectedType);
    }

    // 진료과 필터링
    if (selectedDepartment && selectedDepartment !== '전체') {
      filtered = filtered.filter(hospital => 
        hospital.departments.includes(selectedDepartment)
      );
    }

    // 정렬
    filtered = hospitalService.sortHospitals(filtered, sortBy);

    setFilteredHospitals(filtered);
  }, [hospitals, searchQuery, selectedType, selectedDepartment, sortBy]);

  // 병원 카드 렌더링
  const renderHospitalItem = ({ item: hospital }: { item: Hospital }) => (
    <Card 
      style={styles.hospitalCard}
      onPress={() => navigation.navigate('HospitalDetail', { hospitalId: hospital.id })}
    >
      <Card.Content style={styles.hospitalContent}>
        <View style={styles.hospitalHeader}>
          <View style={styles.hospitalTitleContainer}>
            <Text variant="titleMedium" style={styles.hospitalName} numberOfLines={2}>
              {hospital.name}
            </Text>
            <View style={styles.hospitalMeta}>
              <Chip mode="outlined" style={styles.typeChip}>
                {hospital.type}
              </Chip>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text variant="bodySmall" style={styles.rating}>
                  {hospital.rating.toFixed(1)} ({hospital.reviewCount})
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <View style={styles.hospitalInfo}>
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={16} color="#8E8E93" />
            <Text variant="bodySmall" style={styles.address} numberOfLines={2}>
              {hospital.address}
            </Text>
          </View>
          
          <View style={styles.distanceContainer}>
            <Ionicons name="navigate-outline" size={16} color="#007AFF" />
            <Text variant="bodySmall" style={styles.distance}>
              {hospital.distance ? `${hospital.distance.toFixed(1)}km` : '거리 미확인'}
            </Text>
          </View>
        </View>

        <View style={styles.departmentsContainer}>
          <Text variant="bodySmall" style={styles.departmentsLabel}>
            진료과:
          </Text>
          <View style={styles.departments}>
            {hospital.departments.slice(0, 3).map((dept, index) => (
              <Chip
                key={index}
                mode="flat"
                style={styles.departmentChip}
                textStyle={styles.departmentChipText}
              >
                {dept}
              </Chip>
            ))}
            {hospital.departments.length > 3 && (
              <Text variant="bodySmall" style={styles.moreDepartments}>
                +{hospital.departments.length - 3}개
              </Text>
            )}
          </View>
        </View>

        <View style={styles.hospitalActions}>
          <Button
            mode="outlined"
            style={styles.actionButton}
            onPress={() => {
              // 전화걸기 기능
              console.log('전화걸기:', hospital.phone);
            }}
            icon="phone"
          >
            전화
          </Button>
          
          <Button
            mode="contained"
            style={styles.actionButton}
            onPress={() => navigation.navigate('Reservation', { hospitalId: hospital.id })}
            icon="calendar"
          >
            예약
          </Button>
        </View>

        {/* 영업 시간 표시 */}
        <View style={styles.operatingHours}>
          <Ionicons 
            name={hospitalService.isHospitalOpen(hospital) ? "time" : "time-outline"} 
            size={14} 
            color={hospitalService.isHospitalOpen(hospital) ? "#34C759" : "#8E8E93"} 
          />
          <Text 
            variant="bodySmall" 
            style={[
              styles.operatingText,
              { color: hospitalService.isHospitalOpen(hospital) ? "#34C759" : "#8E8E93" }
            ]}
          >
            {hospitalService.isHospitalOpen(hospital) ? "영업 중" : "영업 종료"}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 검색바 */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="병원명, 지역, 진료과로 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          icon="magnify"
          clearIcon="close"
        />
      </View>

      {/* 필터 섹션 */}
      <View style={styles.filtersContainer}>
        {/* 병원 타입 필터 */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterGroup}
          contentContainerStyle={styles.filterScrollContent}
        >
          {hospitalTypes.map((type) => (
            <Chip
              key={type}
              mode={selectedType === type || (type === '전체' && !selectedType) ? 'flat' : 'outlined'}
              selected={selectedType === type || (type === '전체' && !selectedType)}
              onPress={() => setSelectedType(type === '전체' ? '' : type)}
              style={styles.filterChip}
              textStyle={styles.filterChipText}
            >
              {type}
            </Chip>
          ))}
        </ScrollView>

        <Divider style={styles.filterDivider} />

        {/* 진료과 필터 */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterGroup}
          contentContainerStyle={styles.filterScrollContent}
        >
          {departments.map((dept) => (
            <Chip
              key={dept}
              mode={selectedDepartment === dept || (dept === '전체' && !selectedDepartment) ? 'flat' : 'outlined'}
              selected={selectedDepartment === dept || (dept === '전체' && !selectedDepartment)}
              onPress={() => setSelectedDepartment(dept === '전체' ? '' : dept)}
              style={styles.filterChip}
              textStyle={styles.filterChipText}
            >
              {dept}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* 결과 헤더 */}
      <View style={styles.resultHeader}>
        <Text variant="bodyMedium" style={styles.resultCount}>
          {filteredHospitals.length}개의 병원
        </Text>
        
        <Menu
          visible={showSortMenu}
          onDismiss={() => setShowSortMenu(false)}
          anchor={
            <Button
              mode="text"
              compact
              onPress={() => setShowSortMenu(true)}
              icon="sort-variant"
              contentStyle={styles.sortButtonContent}
            >
              {sortBy === 'distance' ? '거리순' : sortBy === 'rating' ? '평점순' : '이름순'}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setSortBy('distance');
              setShowSortMenu(false);
            }}
            title="거리순"
          />
          <Menu.Item
            onPress={() => {
              setSortBy('rating');
              setShowSortMenu(false);
            }}
            title="평점순"
          />
          <Menu.Item
            onPress={() => {
              setSortBy('name');
              setShowSortMenu(false);
            }}
            title="이름순"
          />
        </Menu>
      </View>

      {/* 병원 목록 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            병원 정보를 불러오는 중...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHospitals}
          renderItem={renderHospitalItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.hospitalList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={64} color="#8E8E93" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                검색 결과가 없습니다
              </Text>
              <Text variant="bodyMedium" style={styles.emptyMessage}>
                다른 검색어나 필터를 시도해보세요
              </Text>
            </View>
          }
        />
      )}

      {/* 지도 보기 FAB */}
      <FAB
        icon="map"
        label="지도"
        style={styles.fab}
        onPress={() => {
          // 지도 보기 기능 (추후 구현)
          console.log('지도 보기');
        }}
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
  searchInput: {
    fontSize: 16,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterGroup: {
    marginBottom: 10,
    minHeight: 60, // 최소 높이 보장
  },
  filterDivider: {
    marginVertical: 8,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  filterChip: {
    marginRight: 10,
    height: 44,
    paddingHorizontal: 16,
    minWidth: 85,
  },
  filterChipText: {
    fontSize: 15,
    paddingHorizontal: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center', // 세로 중앙 정렬
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  sortButtonContent: {
    flexDirection: 'row-reverse',
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
  hospitalList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80, // FAB 공간 확보
  },
  hospitalCard: {
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
  hospitalContent: {
    padding: 18,
    paddingHorizontal: 16,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hospitalTitleContainer: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  hospitalName: {
    color: '#1D1B20',
    fontWeight: '600',
    marginBottom: 4,
    flexShrink: 1,
  },
  hospitalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeChip: {
    height: 30,
    marginRight: 10,
    paddingHorizontal: 12,
    minWidth: 75,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    color: '#8E8E93',
  },
  favoriteButton: {
    padding: 4,
  },
  hospitalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 8,
  },
  address: {
    marginLeft: 6,
    color: '#8E8E93',
    flex: 1,
    flexShrink: 1,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    marginLeft: 4,
    color: '#007AFF',
    fontWeight: '500',
  },
  departmentsContainer: {
    marginBottom: 12,
  },
  departmentsLabel: {
    color: '#49454F',
    marginBottom: 4,
  },
  departments: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  departmentChip: {
    height: 30,
    marginRight: 8,
    marginBottom: 6,
    backgroundColor: '#E3F2FF',
    paddingHorizontal: 12,
    minWidth: 70,
  },
  departmentChipText: {
    fontSize: 13,
    color: '#007AFF',
    paddingHorizontal: 6,
  },
  moreDepartments: {
    color: '#8E8E93',
    marginLeft: 4,
  },
  hospitalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    paddingVertical: 4,
  },
  operatingHours: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
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
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#007AFF',
  },
});

export default HospitalFinderScreen; 