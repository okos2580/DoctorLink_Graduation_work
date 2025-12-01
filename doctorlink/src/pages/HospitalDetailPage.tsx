import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import hospitalService, { Hospital } from '../services/HospitalService';

declare global {
  interface Window {
    kakao: any;
  }
}

const HospitalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const loadHospitalDetails = async () => {
      if (!id) {
        setError('병원 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        const hospitalData = await hospitalService.getHospitalDetails(id);
        setHospital(hospitalData);
        setError(null);
      } catch (err) {
        console.error('병원 상세정보 로드 오류:', err);
        setError('병원 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadHospitalDetails();
  }, [id]);

  useEffect(() => {
    const loadKakaoMap = async () => {
      if (!hospital || !hospital.latitude || !hospital.longitude) {
        console.log('병원 정보 또는 좌표가 없습니다:', { hospital, lat: hospital?.latitude, lng: hospital?.longitude });
        return;
      }

      console.log('⏳ 카카오맵 SDK 로드 대기 중...');

      try {
        // autoload=true로 프리로드된 SDK 대기
        let attempts = 0;
        const maxAttempts = 60; // 30초 대기
        
        const waitForKakaoMaps = () => {
          return new Promise<void>((resolve, reject) => {
            const checkInterval = setInterval(() => {
              attempts++;
              
              if (window.kakao && window.kakao.maps) {
                clearInterval(checkInterval);
                console.log('✅ 카카오맵 SDK 로드 완료');
                
                // 카카오맵 초기화
                window.kakao.maps.load(() => {
                  console.log('✅ 카카오맵 SDK 초기화 완료');
                  initializeMap();
                  resolve();
                });
                return;
              }
              
              if (attempts % 10 === 0) {
                console.log(`⏳ 카카오 SDK 대기 중... (${attempts}/${maxAttempts})`);
              }
              
              if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('❌ 카카오 SDK 로드 타임아웃');
                reject(new Error('카카오 SDK 로드 타임아웃'));
              }
            }, 500);
          });
        };
        
        await waitForKakaoMaps();
        
      } catch (error) {
        console.error('❌ 카카오맵 로드 실패:', error instanceof Error ? error.message : '알 수 없는 오류');
        showMapError();
      }
    };

    const showMapError = () => {
      setMapError('카카오맵을 불러올 수 없습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.');
      setMapLoaded(false);
    };

    // 구글 맵 대체 방식
    const loadGoogleMapsStaticImage = () => {
      if (!hospital || !hospital.latitude || !hospital.longitude) return null;
      
      const googleMapsUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${hospital.latitude},${hospital.longitude}&zoom=15&size=600x400&markers=color:red%7C${hospital.latitude},${hospital.longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`;
      
      // Google Maps API 키가 없으면 OpenStreetMap 사용
      const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${hospital.longitude - 0.01},${hospital.latitude - 0.01},${hospital.longitude + 0.01},${hospital.latitude + 0.01}&layer=mapnik&marker=${hospital.latitude},${hospital.longitude}`;
      
      return osmUrl;
    };

    const initializeMap = () => {
      try {
        if (!hospital || !hospital.latitude || !hospital.longitude) {
          console.error('병원 좌표 정보가 없습니다');
          return;
        }

        const container = document.getElementById('kakao-map');
        if (!container) {
          console.error('지도 컨테이너를 찾을 수 없습니다');
          return;
        }

        console.log('지도 초기화 시작:', { lat: hospital.latitude, lng: hospital.longitude });

        const options = {
          center: new window.kakao.maps.LatLng(hospital.latitude, hospital.longitude),
          level: 3
        };

        const map = new window.kakao.maps.Map(container, options);

        // 마커 생성
        const markerPosition = new window.kakao.maps.LatLng(hospital.latitude, hospital.longitude);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition
        });

        marker.setMap(map);

        // 인포윈도우 생성
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:10px;font-size:12px;width:200px;text-align:center;border-radius:5px;">
                      <strong style="color:#333;">${hospital.name}</strong><br/>
                      <span style="color:#666;">${hospital.address}</span>
                    </div>`
        });

        // 마커 클릭 시 인포윈도우 표시
        window.kakao.maps.event.addListener(marker, 'click', () => {
          infowindow.open(map, marker);
        });

        // 지도 로드 완료
        console.log('지도 초기화 완료');
        setMapLoaded(true);
        setMapError(null);
        
      } catch (error) {
        console.error('지도 초기화 중 오류:', error);
        setMapLoaded(false);
        showMapError();
      }
    };

    if (hospital) {
      loadKakaoMap();
    }
  }, [hospital]);

  const handleReservation = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }
    navigate('/reservation', { state: { selectedHospital: hospital } });
  };

  const handleDirections = () => {
    if (!hospital) return;
    
    if (hospital.latitude && hospital.longitude) {
      const url = `https://map.kakao.com/link/to/${encodeURIComponent(hospital.name)},${hospital.latitude},${hospital.longitude}`;
      window.open(url, '_blank');
    } else {
      const searchUrl = `https://map.kakao.com/link/search/${encodeURIComponent(hospital.name + ' ' + hospital.address)}`;
      window.open(searchUrl, '_blank');
    }
  };

  const handleCall = () => {
    if (hospital?.phone) {
      window.location.href = `tel:${hospital.phone}`;
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <LoadingMessage>
            <i className="fas fa-spinner fa-spin"></i>
            병원 정보를 불러오는 중...
          </LoadingMessage>
        </MainContent>
        <Footer />
      </PageContainer>
    );
  }

  if (error || !hospital) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <ErrorMessage>
            <i className="fas fa-exclamation-triangle"></i>
            {error || '병원 정보를 찾을 수 없습니다.'}
          </ErrorMessage>
          <BackButton onClick={() => navigate('/hospitals')}>
            <i className="fas fa-arrow-left"></i> 병원 찾기로 돌아가기
          </BackButton>
        </MainContent>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <ContentContainer
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 병원 기본 정보 */}
          <HospitalHeader>
            <HospitalType>{hospital.type}</HospitalType>
            <HospitalName>{hospital.name}</HospitalName>
            {hospital.rating && (
              <HospitalRating>
                <i className="fas fa-star"></i>
                {hospital.rating.toFixed(1)} ({hospital.reviewCount}개 리뷰)
              </HospitalRating>
            )}
          </HospitalHeader>

          {/* 액션 버튼들 */}
          <ActionButtonsContainer>
            <ActionButton $primary onClick={handleReservation}>
              <i className="fas fa-calendar-plus"></i> 예약하기
            </ActionButton>
            <ActionButton onClick={handleCall}>
              <i className="fas fa-phone"></i> 전화하기
            </ActionButton>
            <ActionButton onClick={handleDirections}>
              <i className="fas fa-directions"></i> 길찾기
            </ActionButton>
          </ActionButtonsContainer>

          <ContentGrid>
            {/* 왼쪽: 병원 정보 */}
            <InfoSection>
              <SectionTitle>병원 정보</SectionTitle>
              
              <InfoCard>
                <InfoItem>
                  <InfoIcon><i className="fas fa-map-marker-alt"></i></InfoIcon>
                  <InfoContent>
                    <InfoFieldLabel>주소</InfoFieldLabel>
                    <InfoValue>{hospital.address}</InfoValue>
                  </InfoContent>
                </InfoItem>
                
                <InfoItem>
                  <InfoIcon><i className="fas fa-phone"></i></InfoIcon>
                  <InfoContent>
                    <InfoFieldLabel>전화번호</InfoFieldLabel>
                    <InfoValue>{hospital.phone}</InfoValue>
                  </InfoContent>
                </InfoItem>

                {hospital.email && (
                  <InfoItem>
                    <InfoIcon><i className="fas fa-envelope"></i></InfoIcon>
                    <InfoContent>
                      <InfoFieldLabel>이메일</InfoFieldLabel>
                      <InfoValue>{hospital.email}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                )}

                {hospital.website && (
                  <InfoItem>
                    <InfoIcon><i className="fas fa-globe"></i></InfoIcon>
                    <InfoContent>
                      <InfoFieldLabel>웹사이트</InfoFieldLabel>
                      <InfoValue>
                        <a href={hospital.website} target="_blank" rel="noopener noreferrer">
                          병원 홈페이지 방문
                        </a>
                      </InfoValue>
                    </InfoContent>
                  </InfoItem>
                )}

                {hospital.distance !== undefined && (
                  <InfoItem>
                    <InfoIcon><i className="fas fa-walking"></i></InfoIcon>
                    <InfoContent>
                      <InfoFieldLabel>거리</InfoFieldLabel>
                      <InfoValue>{hospital.distance.toFixed(1)}km</InfoValue>
                    </InfoContent>
                  </InfoItem>
                )}
              </InfoCard>

              {/* 운영시간 */}
              {hospital.operatingHours && (
                <InfoCard>
                  <CardTitle>
                    <i className="fas fa-clock"></i> 운영시간
                  </CardTitle>
                  <OperatingHours>
                    <OperatingHourItem>
                      <DayLabel>월요일</DayLabel>
                      <TimeLabel>{hospital.operatingHours.monday}</TimeLabel>
                    </OperatingHourItem>
                    <OperatingHourItem>
                      <DayLabel>화요일</DayLabel>
                      <TimeLabel>{hospital.operatingHours.tuesday}</TimeLabel>
                    </OperatingHourItem>
                    <OperatingHourItem>
                      <DayLabel>수요일</DayLabel>
                      <TimeLabel>{hospital.operatingHours.wednesday}</TimeLabel>
                    </OperatingHourItem>
                    <OperatingHourItem>
                      <DayLabel>목요일</DayLabel>
                      <TimeLabel>{hospital.operatingHours.thursday}</TimeLabel>
                    </OperatingHourItem>
                    <OperatingHourItem>
                      <DayLabel>금요일</DayLabel>
                      <TimeLabel>{hospital.operatingHours.friday}</TimeLabel>
                    </OperatingHourItem>
                    <OperatingHourItem>
                      <DayLabel>토요일</DayLabel>
                      <TimeLabel>{hospital.operatingHours.saturday}</TimeLabel>
                    </OperatingHourItem>
                    <OperatingHourItem>
                      <DayLabel>일요일</DayLabel>
                      <TimeLabel>{hospital.operatingHours.sunday}</TimeLabel>
                    </OperatingHourItem>
                  </OperatingHours>
                </InfoCard>
              )}

              {/* 진료과목 */}
              {hospital.departments && hospital.departments.length > 0 && (
                <InfoCard>
                  <CardTitle>
                    <i className="fas fa-stethoscope"></i> 진료과목
                  </CardTitle>
                  <DepartmentList>
                    {hospital.departments.map((dept, index) => (
                      <DepartmentItem key={index}>{dept}</DepartmentItem>
                    ))}
                  </DepartmentList>
                </InfoCard>
              )}

              {/* 시설정보 */}
              {hospital.facilities && hospital.facilities.length > 0 && (
                <InfoCard>
                  <CardTitle>
                    <i className="fas fa-building"></i> 시설정보
                  </CardTitle>
                  <FacilityList>
                    {hospital.facilities.map((facility, index) => (
                      <FacilityItem key={index}>
                        <i className="fas fa-check"></i> {facility}
                      </FacilityItem>
                    ))}
                  </FacilityList>
                </InfoCard>
              )}
            </InfoSection>

            {/* 오른쪽: 지도 */}
            <MapSection>
              <SectionTitle>위치</SectionTitle>
              <MapContainer>
                {mapError ? (
                  <MapErrorContainer>
                    <MapErrorIcon>
                      <i className="fas fa-exclamation-triangle"></i>
                    </MapErrorIcon>
                    <MapErrorMessage>{mapError}</MapErrorMessage>
                    <MapErrorActions>
                      <RetryButton onClick={() => {
                        setMapError(null);
                        setMapLoaded(false);
                        // 페이지 새로고침으로 재시도
                        window.location.reload();
                      }}>
                        <i className="fas fa-redo"></i> 다시 시도
                      </RetryButton>
                      <ExternalMapButton onClick={() => {
                        const query = encodeURIComponent(`${hospital?.name} ${hospital?.address}`);
                        window.open(`https://map.kakao.com/link/search/${query}`, '_blank');
                      }}>
                        <i className="fas fa-external-link-alt"></i> 카카오맵에서 보기
                      </ExternalMapButton>
                      <ExternalMapButton onClick={() => {
                        const query = encodeURIComponent(`${hospital?.name} ${hospital?.address}`);
                        window.open(`https://maps.google.com/maps?q=${query}`, '_blank');
                      }}>
                        <i className="fas fa-globe"></i> 구글맵에서 보기
                      </ExternalMapButton>
                    </MapErrorActions>
                    
                    {/* OpenStreetMap 대체 지도 */}
                    {hospital?.latitude && hospital?.longitude && (
                      <AlternativeMapContainer>
                        <AlternativeMapTitle>대체 지도 (OpenStreetMap)</AlternativeMapTitle>
                        <OSMMapFrame
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${hospital.longitude - 0.01},${hospital.latitude - 0.01},${hospital.longitude + 0.01},${hospital.latitude + 0.01}&layer=mapnik&marker=${hospital.latitude},${hospital.longitude}`}
                          title={`${hospital.name} 위치`}
                        />
                      </AlternativeMapContainer>
                    )}
                    
                    <StaticMapInfo>
                      <InfoRow>
                        <InfoLabel>주소:</InfoLabel>
                        <InfoText>{hospital?.address}</InfoText>
                      </InfoRow>
                      {hospital?.latitude && hospital?.longitude && (
                        <InfoRow>
                          <InfoLabel>좌표:</InfoLabel>
                          <InfoText>{hospital.latitude.toFixed(6)}, {hospital.longitude.toFixed(6)}</InfoText>
                        </InfoRow>
                      )}
                    </StaticMapInfo>
                  </MapErrorContainer>
                ) : (
                  <>
                    <KakaoMapContainer id="kakao-map" />
                    {!mapLoaded && (
                      <MapLoadingOverlay>
                        <i className="fas fa-spinner fa-spin"></i>
                        지도를 불러오는 중...
                      </MapLoadingOverlay>
                    )}
                  </>
                )}
              </MapContainer>
            </MapSection>
          </ContentGrid>

          {/* 뒤로가기 버튼 */}
          <BackButton onClick={() => navigate('/hospitals')}>
            <i className="fas fa-arrow-left"></i> 병원 찾기로 돌아가기
          </BackButton>
        </ContentContainer>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem 0;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const HospitalHeader = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const HospitalType = styled.span`
  display: inline-block;
  background-color: #4caf50;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const HospitalName = styled.h1`
  font-size: 2rem;
  color: #212121;
  margin-bottom: 0.5rem;
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

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

interface ActionButtonProps {
  $primary?: boolean;
}

const ActionButton = styled.button<ActionButtonProps>`
  flex: 1;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  background-color: ${props => props.$primary ? '#1976d2' : 'white'};
  color: ${props => props.$primary ? 'white' : '#1976d2'};
  border: 1px solid #1976d2;
  
  i {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: ${props => props.$primary ? '#1565c0' : '#e3f2fd'};
    color: ${props => props.$primary ? 'white' : '#1565c0'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MapSection = styled.div``;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #212121;
  margin-bottom: 1rem;
`;

const InfoCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  color: #212121;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  
  i {
    margin-right: 0.5rem;
    color: #1976d2;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  background-color: #e3f2fd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
  
  i {
    color: #1976d2;
  }
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoFieldLabel = styled.div`
  font-size: 0.875rem;
  color: #616161;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: #212121;
  
  a {
    color: #1976d2;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const OperatingHours = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OperatingHourItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DayLabel = styled.span`
  font-weight: 500;
  color: #212121;
`;

const TimeLabel = styled.span`
  color: #616161;
`;

const DepartmentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const DepartmentItem = styled.span`
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
`;

const FacilityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FacilityItem = styled.div`
  display: flex;
  align-items: center;
  color: #212121;
  
  i {
    color: #4caf50;
    margin-right: 0.5rem;
  }
`;

const MapContainer = styled.div`
  position: relative;
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const KakaoMapContainer = styled.div`
  width: 100%;
  height: 400px;
`;

const MapLoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976d2;
  font-size: 1rem;
  
  i {
    margin-right: 0.5rem;
  }
`;

const MapErrorContainer = styled.div`
  width: 100%;
  height: 400px;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

const MapErrorIcon = styled.div`
  font-size: 3rem;
  color: #ffc107;
  margin-bottom: 1rem;
`;

const MapErrorMessage = styled.div`
  font-size: 1.125rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const MapErrorActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const RetryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  i {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: #1565c0;
    transform: translateY(-1px);
  }
`;

const ExternalMapButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: #1976d2;
  border: 1px solid #1976d2;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  i {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: #e3f2fd;
  }
`;

const StaticMapInfo = styled.div`
  background-color: white;
  border-radius: 0.375rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  width: 100%;
  max-width: 400px;
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #495057;
  min-width: 60px;
  margin-right: 0.5rem;
`;

const InfoText = styled.span`
  color: #212529;
  word-break: break-all;
`;

const AlternativeMapContainer = styled.div`
  margin: 1.5rem 0;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const AlternativeMapTitle = styled.div`
  background-color: #f8f9fa;
  padding: 0.75rem 1rem;
  font-weight: 500;
  color: #495057;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.875rem;
`;

const OSMMapFrame = styled.iframe`
  width: 100%;
  height: 300px;
  border: none;
  display: block;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: #616161;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  i {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: #f5f5f5;
    color: #212121;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #1976d2;
  font-size: 1.125rem;
  
  i {
    margin-right: 0.5rem;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #d32f2f;
  font-size: 1.125rem;
  
  i {
    margin-right: 0.5rem;
  }
`;

export default HospitalDetailPage;
