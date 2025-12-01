import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import hospitalService, { Hospital } from '../services/HospitalService';

// 병원 유형 목록
const HOSPITAL_TYPES = [
  '전체',
  '내과',
  '외과',
  '소아과',
  '산부인과',
  '이비인후과',
  '안과',
  '피부과',
  '정신건강의학과',
  '치과',
  '한의원',
  '정형외과',
  '신경과',
  '비뇨기과',
  '재활의학과',
  '가정의학과'
];

// 청주시 서원구의 기본 위치 좌표
const DEFAULT_LOCATION = {
  latitude: 36.6293,
  longitude: 127.4562
};

const HospitalFinderPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isShowingAllCheongju, setIsShowingAllCheongju] = useState<boolean>(false);

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('브라우저에서 위치 정보를 지원하지 않습니다.');
      return;
    }

    setIsLocating(true);
    setIsShowingAllCheongju(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setIsLocating(false);
      },
      (error) => {
        console.error('위치 정보를 가져오는 중 오류 발생:', error);
        setError('위치 정보를 가져오는 데 실패했습니다. 기본 위치를 사용합니다.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // 청주시 전체 병원 보기
  const showAllCheongjuHospitals = async () => {
    try {
      setIsLoading(true);
      setCurrentLocation(null);
      setIsShowingAllCheongju(true);
      setSearchQuery('');
      
      // 직접 청주시 전체 병원 검색 실행
      console.log('청주시 전체 병원 검색 시작...');
      const options: any = {
        location: null, // 위치 정보를 null로 설정하여 전체 지역 검색
        type: selectedType !== '전체' ? selectedType : undefined
      };
      
      // 청주시 전체 모드일 때는 location을 undefined로 설정하여 모든 지역 검색   
      if (isShowingAllCheongju) {
        options.location = null;
        console.log('청주시 전체 병원 검색 모드 활성화');
      }
      
      const data = await hospitalService.searchNearbyHospitals(options);
      console.log(`청주시 전체 병원 검색 완료: ${data.length}개 병원 발견`);
      setHospitals(data);
    } catch (err) {
      console.error('청주시 전체 병원 검색 중 오류 발생:', err);
      setError('병원 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 현재 위치 가져오기
  useEffect(() => {
    getCurrentLocation();
    // 개발 콘솔에 API 키 로깅
    console.log('사용 중인 API 키:', process.env.REACT_APP_KAKAO_API_KEY);
  }, []);

  // 병원 데이터 로드
  useEffect(() => {
    const loadHospitals = async () => {
      // 이미 청주시 전체 검색 중이면 중복 로드 방지
      if (isShowingAllCheongju && hospitals.length > 0) {
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const options: any = {
          location: currentLocation || DEFAULT_LOCATION,
          radius: 10000, // 10km 반경으로 확장
          type: selectedType !== '전체' ? selectedType : undefined
        };

        // 청주시 전체 모드일 때는 location을 undefined로 설정하여 모든 지역 검색
        if (isShowingAllCheongju) {
          options.location = null;
          console.log('청주시 전체 병원 검색 모드 활성화');
        }
        
        // 검색어가 있을 때만 키워드 검색 사용, 그렇지 않으면 주변 병원 검색
        let data;
        if (searchQuery && searchQuery.trim() !== '') {
          console.log('키워드 검색 실행:', searchQuery);
          data = await hospitalService.searchHospitals(searchQuery, options);
        } else if (isShowingAllCheongju) {
          console.log('청주시 전체 병원 검색 실행');
          data = await hospitalService.searchNearbyHospitals({...options, location: null});
        } else {
          console.log('주변 병원 검색 실행');
          data = await hospitalService.searchNearbyHospitals(options);
        }
        
        console.log(`로드된 병원 수: ${data.length}`);
        setHospitals(data);
      } catch (err) {
        console.error('병원 데이터 로드 중 오류 발생:', err);
        setError('병원 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // 위치 정보가 로드되었거나 이미 오류가 발생한 경우 또는 청주시 전체 모드일 때 병원 데이터 로드
    if (currentLocation || error || isShowingAllCheongju) {
      loadHospitals();
    }
  }, [selectedType, searchQuery, currentLocation, isShowingAllCheongju, error, hospitals.length]);
  
  // 필터링 및 정렬 로직
  useEffect(() => {
    let result = [...hospitals];
    
    // 정렬
    result.sort((a, b) => {
      if (sortBy === 'distance') {
        // 거리순 정렬 - 거리 정보가 없는 경우 맨 뒤로
        if (a.distance === undefined && b.distance === undefined) return 0;
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      } else {
        // 평점순 정렬 - 평점 정보가 없는 경우 맨 뒤로
        if (a.rating === undefined && b.rating === undefined) return 0;
        if (a.rating === undefined) return 1;
        if (b.rating === undefined) return -1;
        return b.rating - a.rating;
      }
    });
    
    setFilteredHospitals(result);
  }, [hospitals, sortBy]);

  // 병원 유형 필터 변경 핸들러
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 정렬 변경 핸들러
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'distance' | 'rating');
  };

  // 예약 버튼 핸들러
  const handleReservation = () => {
    if (isAuthenticated) {
      navigate('/reservation');
    } else {
      navigate('/login', { state: { from: { pathname: '/reservation' } } });
    }
  };
  
  // 길찾기 핸들러
  const handleDirections = (hospital: Hospital) => {
    if (hospital.latitude && hospital.longitude) {
      const url = `https://map.kakao.com/link/to/${encodeURIComponent(hospital.name)},${hospital.latitude},${hospital.longitude}`;
      window.open(url, '_blank');
    } else {
      const searchUrl = `https://map.kakao.com/link/search/${encodeURIComponent(hospital.name + ' ' + hospital.address)}`;
      window.open(searchUrl, '_blank');
    }
  };

  // 병원 상세정보 핸들러
  const handleHospitalDetails = (hospital: Hospital) => {
    navigate(`/hospitals/${hospital.id}`);
  };

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <PageTitle
          as={motion.h1}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          주변 병원 찾기
        </PageTitle>
        
        <PageSubtitle
          as={motion.p}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isShowingAllCheongju 
            ? '청주시 전체 병원을 찾아보세요' 
            : currentLocation 
              ? '현재 위치 주변의 병원을 찾아보세요' 
              : '청주시 서원구 모충동 근처의 병원을 찾아보세요'}
        </PageSubtitle>
        
        <LocationButtonsContainer>
          <LocationButton
            as={motion.button}
            onClick={getCurrentLocation}
            disabled={isLocating}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <i className="fas fa-location-arrow"></i>
            {isLocating ? '위치 정보 가져오는 중...' : '현재 위치 사용하기'}
          </LocationButton>
          
          <LocationButton
            as={motion.button}
            onClick={showAllCheongjuHospitals}
            $isActive={isShowingAllCheongju}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <i className="fas fa-hospital"></i>
            청주시 전체 병원 보기
          </LocationButton>
        </LocationButtonsContainer>
        
        <SearchSection
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SearchInput
            type="text"
            placeholder="병원 이름, 주소, 특징으로 검색"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <SortSelect value={sortBy} onChange={handleSortChange}>
            <option value="distance">거리순</option>
            <option value="rating">평점순</option>
          </SortSelect>
        </SearchSection>
        
        <HospitalTypesFilter
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {HOSPITAL_TYPES.map(type => (
            <TypeFilterButton
              key={type}
              $isSelected={selectedType === type}
              onClick={() => handleTypeChange(type)}
            >
              {type}
            </TypeFilterButton>
          ))}
        </HospitalTypesFilter>
        
        <ResultStats>
          총 <strong>{filteredHospitals.length}</strong>개의 병원이 검색되었습니다
        </ResultStats>
        
        <HospitalList>
          <AnimatePresence>
            {isLoading ? (
              <LoadingMessage>
                <i className="fas fa-spinner fa-spin"></i> 병원 정보를 불러오는 중...
              </LoadingMessage>
            ) : error ? (
              <ErrorMessage>
                <i className="fas fa-exclamation-triangle"></i> {error}
              </ErrorMessage>
            ) : filteredHospitals.length > 0 ? (
              filteredHospitals.map(hospital => (
                <HospitalCard
                  key={hospital.id}
                  as={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                >
                  <HospitalHeader>
                    <HospitalType>{hospital.type}</HospitalType>
                    <HospitalName>{hospital.name}</HospitalName>
                    <HospitalRating>
                      <i className="fas fa-star"></i> {hospital.rating?.toFixed(1) || '평가없음'}
                    </HospitalRating>
                  </HospitalHeader>
                  
                  <HospitalInfo>
                    <HospitalInfoItem>
                      <i className="fas fa-map-marker-alt"></i>
                      {hospital.address}
                    </HospitalInfoItem>
                    <HospitalInfoItem>
                      <i className="fas fa-phone"></i>
                      {hospital.phone}
                    </HospitalInfoItem>
                    {hospital.operatingHours && (
                      <HospitalInfoItem>
                        <i className="fas fa-clock"></i>
                        운영시간: {hospital.operatingHours.monday}
                      </HospitalInfoItem>
                    )}
                    {hospital.distance !== undefined && (
                      <HospitalInfoItem>
                        <i className="fas fa-walking"></i>
                        {hospital.distance.toFixed(1)}km 거리
                      </HospitalInfoItem>
                    )}
                  </HospitalInfo>
                  
                  {hospital.description && (
                    <HospitalDescription>
                      {hospital.description}
                    </HospitalDescription>
                  )}
                  
                  <HospitalActions>
                    <ActionButton $primary onClick={handleReservation}>
                      <i className="fas fa-calendar-plus"></i> 예약하기
                    </ActionButton>
                    <ActionButton onClick={() => handleDirections(hospital)}>
                      <i className="fas fa-directions"></i> 길 찾기
                    </ActionButton>
                    <ActionButton onClick={() => handleHospitalDetails(hospital)}>
                      <i className="fas fa-info-circle"></i> 상세정보
                    </ActionButton>
                  </HospitalActions>
                </HospitalCard>
              ))
            ) : (
              <NoResultsMessage>
                검색 조건에 맞는 병원이 없습니다. 다른 조건으로 검색해보세요.
              </NoResultsMessage>
            )}
          </AnimatePresence>
        </HospitalList>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

// 스타일 컴포넌트
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 1.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #1565c0;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: #616161;
  margin-bottom: 2rem;
  text-align: center;
`;

const SearchSection = styled.div`
  display: flex;
  margin-bottom: 1rem;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.375rem;
  font-size: 1rem;
  
  &:focus {
    border-color: #1976d2;
    outline: none;
    box-shadow: 0 0 0 2px rgba(30, 136, 229, 0.2);
  }
`;

const SortSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.375rem;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  min-width: 120px;
  
  &:focus {
    border-color: #1976d2;
    outline: none;
  }
`;

const HospitalTypesFilter = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 2rem;
`;

interface TypeFilterButtonProps {
  $isSelected: boolean;
}

const TypeFilterButton = styled.button<TypeFilterButtonProps>`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  background-color: ${props => props.$isSelected ? '#1976d2' : 'white'};
  color: ${props => props.$isSelected ? 'white' : '#333333'};
  border: 1px solid ${props => props.$isSelected ? '#1976d2' : '#e0e0e0'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$isSelected ? '#1565c0' : '#f5f5f5'};
  }
`;

const ResultStats = styled.p`
  font-size: 1rem;
  color: #616161;
  margin-bottom: 1rem;
`;

const HospitalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HospitalCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  transition: all 0.3s ease;
`;

const HospitalHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const HospitalType = styled.span`
  font-size: 0.875rem;
  background-color: #4caf50;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  margin-right: 0.5rem;
`;

const HospitalName = styled.h3`
  font-size: 1.125rem;
  color: #212121;
  flex: 1;
`;

const HospitalRating = styled.div`
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: #f57c00;
  
  i {
    margin-right: 0.25rem;
  }
`;

const HospitalInfo = styled.div`
  margin-bottom: 1rem;
`;

const HospitalInfoItem = styled.div`
  font-size: 1rem;
  color: #616161;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  
  i {
    width: 20px;
    margin-right: 0.5rem;
    color: #1976d2;
  }
`;

const HospitalDescription = styled.p`
  font-size: 1rem;
  color: #212121;
  margin-bottom: 1rem;
`;

const HospitalActions = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

interface ActionButtonProps {
  $primary?: boolean;
}

const ActionButton = styled.button<ActionButtonProps>`
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  background-color: ${props => props.$primary ? '#1976d2' : 'white'};
  color: ${props => props.$primary ? 'white' : '#1976d2'};
  border: 1px solid #1976d2;
  
  i {
    margin-right: 0.25rem;
  }
  
  &:hover {
    background-color: ${props => props.$primary ? '#1565c0' : '#e3f2fd'};
    color: ${props => props.$primary ? 'white' : '#1565c0'};
  }
`;

const NoResultsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #616161;
  font-size: 1.125rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #1976d2;
  font-size: 1.125rem;
  
  i {
    margin-right: 0.5rem;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #d32f2f;
  font-size: 1.125rem;
  
  i {
    margin-right: 0.5rem;
  }
`;

const LocationButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

interface LocationButtonProps {
  $isActive?: boolean;
}

const LocationButton = styled.button<LocationButtonProps>`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  
  background-color: ${props => props.$isActive ? '#e3f2fd' : 'white'};
  color: #1976d2;
  border: 1px solid #1976d2;
  
  i {
    margin-right: 0.25rem;
  }
  
  &:hover {
    background-color: #e3f2fd;
  }
`;

export default HospitalFinderPage; 