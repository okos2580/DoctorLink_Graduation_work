import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { verifyAdmin, adminLogout } from '../services/adminService';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    operatingHours: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
  };
  notification: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    reservationReminders: boolean;
    systemAlerts: boolean;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    twoFactorAuth: boolean;
    ipWhitelist: string[];
  };
  api: {
    kakaoMapApiKey: string;
    emailServiceProvider: string;
    smsServiceProvider: string;
    backupFrequency: string;
    logRetentionDays: number;
  };
}

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'DoctorLink',
      siteDescription: '청주시 의료진 예약 플랫폼',
      contactEmail: 'contact@doctorlink.com',
      contactPhone: '043-123-4567',
      address: '충청북도 청주시 서원구',
      operatingHours: '평일 09:00-18:00',
      maintenanceMode: false,
      registrationEnabled: true
    },
    notification: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      reservationReminders: true,
      systemAlerts: true
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      twoFactorAuth: false,
      ipWhitelist: []
    },
    api: {
      kakaoMapApiKey: '',
      emailServiceProvider: 'SendGrid',
      smsServiceProvider: 'Twilio',
      backupFrequency: 'daily',
      logRetentionDays: 30
    }
  });

  const [activeTab, setActiveTab] = useState<'general' | 'notification' | 'security' | 'api'>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAdminAuth = useCallback(async () => {
    try {
      const isValid = await verifyAdmin();
      if (!isValid) {
        navigate('/admin/login');
        return;
      }
      await loadSettings();
    } catch (error) {
      console.error('관리자 인증 확인 중 오류:', error);
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const loadSettings = async () => {
    // 실제 프로젝트에서는 API에서 설정을 가져옴
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate('/admin/login');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      navigate('/admin/login');
    }
  };

  const handleSettingChange = (category: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleArrayChange = (category: keyof SystemSettings, key: string, index: number, value: string) => {
    setSettings(prev => {
      const currentArray = (prev[category] as any)[key] as string[];
      const newArray = [...currentArray];
      newArray[index] = value;
      
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: newArray
        }
      };
    });
    setHasChanges(true);
  };

  const addArrayItem = (category: keyof SystemSettings, key: string) => {
    setSettings(prev => {
      const currentArray = (prev[category] as any)[key] as string[];
      
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: [...currentArray, '']
        }
      };
    });
    setHasChanges(true);
  };

  const removeArrayItem = (category: keyof SystemSettings, key: string, index: number) => {
    setSettings(prev => {
      const currentArray = (prev[category] as any)[key] as string[];
      const newArray = currentArray.filter((_, i) => i !== index);
      
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: newArray
        }
      };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // 실제 프로젝트에서는 API로 설정을 저장
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      
      // 시뮬레이션을 위한 지연
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      alert('설정이 성공적으로 저장되었습니다.');
    } catch (error) {
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('모든 변경사항을 취소하시겠습니까?')) {
      loadSettings();
      setHasChanges(false);
    }
  };

  const renderGeneralSettings = () => (
    <SettingsSection>
      <SectionTitle>일반 설정</SectionTitle>
      
      <SettingGroup>
        <SettingLabel>사이트 이름</SettingLabel>
        <SettingInput
          type="text"
          value={settings.general.siteName}
          onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
        />
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>사이트 설명</SettingLabel>
        <SettingTextarea
          value={settings.general.siteDescription}
          onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
          rows={3}
        />
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>연락처 이메일</SettingLabel>
        <SettingInput
          type="email"
          value={settings.general.contactEmail}
          onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
        />
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>연락처 전화번호</SettingLabel>
        <SettingInput
          type="tel"
          value={settings.general.contactPhone}
          onChange={(e) => handleSettingChange('general', 'contactPhone', e.target.value)}
        />
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>주소</SettingLabel>
        <SettingInput
          type="text"
          value={settings.general.address}
          onChange={(e) => handleSettingChange('general', 'address', e.target.value)}
        />
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>운영 시간</SettingLabel>
        <SettingInput
          type="text"
          value={settings.general.operatingHours}
          onChange={(e) => handleSettingChange('general', 'operatingHours', e.target.value)}
        />
      </SettingGroup>

      <SettingGroup>
        <ToggleContainer>
          <ToggleLabel>
            <ToggleInput
              type="checkbox"
              checked={settings.general.maintenanceMode}
              onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
            />
            <ToggleSlider />
            유지보수 모드
          </ToggleLabel>
          <ToggleDescription>
            활성화 시 일반 사용자의 접근이 제한됩니다.
          </ToggleDescription>
        </ToggleContainer>
      </SettingGroup>

      <SettingGroup>
        <ToggleContainer>
          <ToggleLabel>
            <ToggleInput
              type="checkbox"
              checked={settings.general.registrationEnabled}
              onChange={(e) => handleSettingChange('general', 'registrationEnabled', e.target.checked)}
            />
            <ToggleSlider />
            신규 회원가입 허용
          </ToggleLabel>
          <ToggleDescription>
            비활성화 시 새로운 사용자 등록이 중단됩니다.
          </ToggleDescription>
        </ToggleContainer>
      </SettingGroup>
    </SettingsSection>
  );

  const renderNotificationSettings = () => (
    <SettingsSection>
      <SectionTitle>알림 설정</SectionTitle>
      
      <SettingGroup>
        <ToggleContainer>
          <ToggleLabel>
            <ToggleInput
              type="checkbox"
              checked={settings.notification.emailNotifications}
              onChange={(e) => handleSettingChange('notification', 'emailNotifications', e.target.checked)}
            />
            <ToggleSlider />
            이메일 알림
          </ToggleLabel>
          <ToggleDescription>
            시스템에서 이메일 알림을 발송합니다.
          </ToggleDescription>
        </ToggleContainer>
      </SettingGroup>

      <SettingGroup>
        <ToggleContainer>
          <ToggleLabel>
            <ToggleInput
              type="checkbox"
              checked={settings.notification.smsNotifications}
              onChange={(e) => handleSettingChange('notification', 'smsNotifications', e.target.checked)}
            />
            <ToggleSlider />
            SMS 알림
          </ToggleLabel>
          <ToggleDescription>
            중요한 알림을 SMS로 발송합니다.
          </ToggleDescription>
        </ToggleContainer>
      </SettingGroup>

      <SettingGroup>
        <ToggleContainer>
          <ToggleLabel>
            <ToggleInput
              type="checkbox"
              checked={settings.notification.pushNotifications}
              onChange={(e) => handleSettingChange('notification', 'pushNotifications', e.target.checked)}
            />
            <ToggleSlider />
            푸시 알림
          </ToggleLabel>
          <ToggleDescription>
            웹 브라우저 푸시 알림을 발송합니다.
          </ToggleDescription>
        </ToggleContainer>
      </SettingGroup>

      <SettingGroup>
        <ToggleContainer>
          <ToggleLabel>
            <ToggleInput
              type="checkbox"
              checked={settings.notification.reservationReminders}
              onChange={(e) => handleSettingChange('notification', 'reservationReminders', e.target.checked)}
            />
            <ToggleSlider />
            예약 리마인더
          </ToggleLabel>
          <ToggleDescription>
            예약 전 자동으로 리마인더를 발송합니다.
          </ToggleDescription>
        </ToggleContainer>
      </SettingGroup>

      <SettingGroup>
        <ToggleContainer>
          <ToggleLabel>
            <ToggleInput
              type="checkbox"
              checked={settings.notification.systemAlerts}
              onChange={(e) => handleSettingChange('notification', 'systemAlerts', e.target.checked)}
            />
            <ToggleSlider />
            시스템 알림
          </ToggleLabel>
          <ToggleDescription>
            시스템 오류 및 중요 이벤트 알림을 발송합니다.
          </ToggleDescription>
        </ToggleContainer>
      </SettingGroup>
    </SettingsSection>
  );

  const renderSecuritySettings = () => (
    <SettingsSection>
      <SectionTitle>보안 설정</SectionTitle>
      
      <SettingGroup>
        <SettingLabel>최소 비밀번호 길이</SettingLabel>
        <SettingInput
          type="number"
          min="6"
          max="20"
          value={settings.security.passwordMinLength}
          onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
        />
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>세션 타임아웃 (분)</SettingLabel>
        <SettingInput
          type="number"
          min="5"
          max="120"
          value={settings.security.sessionTimeout}
          onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
        />
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>최대 로그인 시도 횟수</SettingLabel>
        <SettingInput
          type="number"
          min="3"
          max="10"
          value={settings.security.maxLoginAttempts}
          onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
        />
      </SettingGroup>

      <SettingGroup>
        <ToggleContainer>
          <ToggleLabel>
            <ToggleInput
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
            />
            <ToggleSlider />
            2단계 인증
          </ToggleLabel>
          <ToggleDescription>
            관리자 계정에 2단계 인증을 적용합니다.
          </ToggleDescription>
        </ToggleContainer>
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>IP 화이트리스트</SettingLabel>
        <ArrayContainer>
          {settings.security.ipWhitelist.map((ip, index) => (
            <ArrayItem key={index}>
              <ArrayInput
                type="text"
                placeholder="192.168.1.1"
                value={ip}
                onChange={(e) => handleArrayChange('security', 'ipWhitelist', index, e.target.value)}
              />
              <RemoveButton onClick={() => removeArrayItem('security', 'ipWhitelist', index)}>
                ×
              </RemoveButton>
            </ArrayItem>
          ))}
          <AddButton onClick={() => addArrayItem('security', 'ipWhitelist')}>
            + IP 주소 추가
          </AddButton>
        </ArrayContainer>
      </SettingGroup>
    </SettingsSection>
  );

  const renderApiSettings = () => (
    <SettingsSection>
      <SectionTitle>API 및 서비스 설정</SectionTitle>
      
      <SettingGroup>
        <SettingLabel>카카오맵 API 키</SettingLabel>
        <SettingInput
          type="password"
          value={settings.api.kakaoMapApiKey}
          onChange={(e) => handleSettingChange('api', 'kakaoMapApiKey', e.target.value)}
          placeholder="카카오맵 API 키를 입력하세요"
        />
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>이메일 서비스 제공업체</SettingLabel>
        <SettingSelect
          value={settings.api.emailServiceProvider}
          onChange={(e) => handleSettingChange('api', 'emailServiceProvider', e.target.value)}
        >
          <option value="SendGrid">SendGrid</option>
          <option value="AWS SES">AWS SES</option>
          <option value="Mailgun">Mailgun</option>
          <option value="SMTP">SMTP</option>
        </SettingSelect>
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>SMS 서비스 제공업체</SettingLabel>
        <SettingSelect
          value={settings.api.smsServiceProvider}
          onChange={(e) => handleSettingChange('api', 'smsServiceProvider', e.target.value)}
        >
          <option value="Twilio">Twilio</option>
          <option value="AWS SNS">AWS SNS</option>
          <option value="NHN Cloud">NHN Cloud</option>
          <option value="KT">KT</option>
        </SettingSelect>
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>백업 주기</SettingLabel>
        <SettingSelect
          value={settings.api.backupFrequency}
          onChange={(e) => handleSettingChange('api', 'backupFrequency', e.target.value)}
        >
          <option value="hourly">매시간</option>
          <option value="daily">매일</option>
          <option value="weekly">매주</option>
          <option value="monthly">매월</option>
        </SettingSelect>
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>로그 보관 기간 (일)</SettingLabel>
        <SettingInput
          type="number"
          min="7"
          max="365"
          value={settings.api.logRetentionDays}
          onChange={(e) => handleSettingChange('api', 'logRetentionDays', parseInt(e.target.value))}
        />
      </SettingGroup>
    </SettingsSection>
  );

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        관리자 권한 확인 중...
      </div>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate('/admin/dashboard')}>
            ← 대시보드로
          </BackButton>
          <Title>⚙️ 시스템 설정</Title>
        </HeaderLeft>
        <HeaderRight>
          {hasChanges && (
            <>
              <ResetButton onClick={handleReset}>
                취소
              </ResetButton>
              <SaveButton onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : '저장하기'}
              </SaveButton>
            </>
          )}
          <LogoutButton onClick={handleLogout}>
            로그아웃
          </LogoutButton>
        </HeaderRight>
      </Header>

      <ContentContainer>
        <TabContainer>
          <Tab
            active={activeTab === 'general'}
            onClick={() => setActiveTab('general')}
          >
            🏢 일반
          </Tab>
          <Tab
            active={activeTab === 'notification'}
            onClick={() => setActiveTab('notification')}
          >
            🔔 알림
          </Tab>
          <Tab
            active={activeTab === 'security'}
            onClick={() => setActiveTab('security')}
          >
            🔒 보안
          </Tab>
          <Tab
            active={activeTab === 'api'}
            onClick={() => setActiveTab('api')}
          >
            🔌 API
          </Tab>
        </TabContainer>

        <TabContent>
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'notification' && renderNotificationSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'api' && renderApiSettings()}
        </TabContent>
      </ContentContainer>

      {hasChanges && (
        <FloatingAlert>
          <AlertIcon>⚠️</AlertIcon>
          <AlertText>저장되지 않은 변경사항이 있습니다.</AlertText>
          <AlertActions>
            <AlertButton onClick={handleReset} variant="secondary">
              취소
            </AlertButton>
            <AlertButton onClick={handleSave} variant="primary" disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </AlertButton>
          </AlertActions>
        </FloatingAlert>
      )}
    </Container>
  );
};

// 스타일 컴포넌트들
const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 10px;
`;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #5a6268;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const ResetButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #5a6268;
  }
`;

const SaveButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover:not(:disabled) {
    background: #218838;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ContentContainer = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e1e5e9;
  background: #f8f9fa;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 15px 20px;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#007bff' : '#666'};
  font-size: 16px;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  border-bottom: ${props => props.active ? '2px solid #007bff' : 'none'};

  &:hover {
    background: ${props => props.active ? 'white' : '#e9ecef'};
  }
`;

const TabContent = styled.div`
  padding: 30px;
`;

const SettingsSection = styled.div``;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 30px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #f1f3f4;
`;

const SettingGroup = styled.div`
  margin-bottom: 25px;
`;

const SettingLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const SettingInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SettingTextarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SettingSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ToggleContainer = styled.div``;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const ToggleInput = styled.input`
  display: none;
`;

const ToggleSlider = styled.span`
  position: relative;
  width: 50px;
  height: 24px;
  background: #ccc;
  border-radius: 24px;
  transition: background 0.3s;

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s;
  }

  ${ToggleInput}:checked + & {
    background: #007bff;
  }

  ${ToggleInput}:checked + &::before {
    transform: translateX(26px);
  }
`;

const ToggleDescription = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  margin-left: 62px;
`;

const ArrayContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ArrayItem = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const ArrayInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const RemoveButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #c82333;
  }
`;

const AddButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  align-self: flex-start;

  &:hover {
    background: #218838;
  }
`;

const FloatingAlert = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 1000;
  max-width: 400px;

  @media (max-width: 768px) {
    left: 20px;
    right: 20px;
    max-width: none;
  }
`;

const AlertIcon = styled.div`
  font-size: 20px;
`;

const AlertText = styled.div`
  flex: 1;
  font-size: 14px;
  color: #333;
`;

const AlertActions = styled.div`
  display: flex;
  gap: 8px;
`;

const AlertButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  
  ${props => props.variant === 'primary' ? `
    background: #007bff;
    color: white;
    &:hover:not(:disabled) { background: #0056b3; }
  ` : `
    background: #6c757d;
    color: white;
    &:hover { background: #5a6268; }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LogoutButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 10px;

  &:hover {
    background: #c82333;
  }
`;

export default AdminSettingsPage; 