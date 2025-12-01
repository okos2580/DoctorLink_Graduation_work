import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, Switch, Divider, List, Dialog, Portal, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const SystemSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    debugMode: false,
  });
  
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('시스템 점검 중입니다.');

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleBackup = () => {
    setShowBackupDialog(false);
    Alert.alert('백업 시작', '데이터 백업이 시작되었습니다.');
  };

  const handleMaintenanceMode = () => {
    if (!settings.maintenanceMode) {
      setShowMaintenanceDialog(true);
    } else {
      setSettings(prev => ({ ...prev, maintenanceMode: false }));
    }
  };

  const enableMaintenanceMode = () => {
    setSettings(prev => ({ ...prev, maintenanceMode: true }));
    setShowMaintenanceDialog(false);
    Alert.alert('점검 모드 활성화', '시스템이 점검 모드로 전환되었습니다.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 시스템 상태 */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              시스템 상태
            </Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title="점검 모드"
              description="사용자 접근을 차단하고 시스템을 점검 모드로 전환"
              left={() => <Ionicons name="construct" size={24} color={settings.maintenanceMode ? '#FF3B30' : '#8E8E93'} />}
              right={() => (
                <Switch
                  value={settings.maintenanceMode}
                  onValueChange={handleMaintenanceMode}
                  color="#FF3B30"
                />
              )}
            />
            
            <List.Item
              title="신규 가입 허용"
              description="새로운 사용자의 회원가입을 허용"
              left={() => <Ionicons name="person-add" size={24} color={settings.allowRegistration ? '#34C759' : '#8E8E93'} />}
              right={() => (
                <Switch
                  value={settings.allowRegistration}
                  onValueChange={() => handleSettingChange('allowRegistration')}
                  color="#FF3B30"
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* 알림 설정 */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              알림 설정
            </Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title="이메일 알림"
              description="시스템 이벤트를 이메일로 알림"
              left={() => <Ionicons name="mail" size={24} color={settings.emailNotifications ? '#007AFF' : '#8E8E93'} />}
              right={() => (
                <Switch
                  value={settings.emailNotifications}
                  onValueChange={() => handleSettingChange('emailNotifications')}
                  color="#FF3B30"
                />
              )}
            />
            
            <List.Item
              title="SMS 알림"
              description="긴급 상황을 SMS로 알림"
              left={() => <Ionicons name="chatbox" size={24} color={settings.smsNotifications ? '#34C759' : '#8E8E93'} />}
              right={() => (
                <Switch
                  value={settings.smsNotifications}
                  onValueChange={() => handleSettingChange('smsNotifications')}
                  color="#FF3B30"
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* 데이터 관리 */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              데이터 관리
            </Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title="자동 백업"
              description="매일 자동으로 데이터를 백업"
              left={() => <Ionicons name="cloud-upload" size={24} color={settings.autoBackup ? '#007AFF' : '#8E8E93'} />}
              right={() => (
                <Switch
                  value={settings.autoBackup}
                  onValueChange={() => handleSettingChange('autoBackup')}
                  color="#FF3B30"
                />
              )}
            />
            
            <List.Item
              title="수동 백업"
              description="지금 즉시 데이터를 백업"
              left={() => <Ionicons name="download" size={24} color="#FF9500" />}
              right={() => (
                <Button
                  mode="contained"
                  compact
                  style={styles.actionButton}
                  onPress={() => setShowBackupDialog(true)}
                >
                  백업 시작
                </Button>
              )}
            />
          </Card.Content>
        </Card>

        {/* 개발자 설정 */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              개발자 설정
            </Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title="디버그 모드"
              description="개발자를 위한 디버깅 정보 표시"
              left={() => <Ionicons name="bug" size={24} color={settings.debugMode ? '#FF3B30' : '#8E8E93'} />}
              right={() => (
                <Switch
                  value={settings.debugMode}
                  onValueChange={() => handleSettingChange('debugMode')}
                  color="#FF3B30"
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* 시스템 정보 */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              시스템 정보
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>앱 버전</Text>
              <Text variant="bodyMedium" style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>빌드 번호</Text>
              <Text variant="bodyMedium" style={styles.infoValue}>20241201</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>서버 상태</Text>
              <Text variant="bodyMedium" style={[styles.infoValue, styles.statusOnline]}>온라인</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>마지막 백업</Text>
              <Text variant="bodyMedium" style={styles.infoValue}>2024-12-01 14:30</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* 백업 확인 다이얼로그 */}
      <Portal>
        <Dialog visible={showBackupDialog} onDismiss={() => setShowBackupDialog(false)}>
          <Dialog.Title>데이터 백업</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              현재 시스템의 모든 데이터를 백업하시겠습니까? 
              백업 중에는 시스템 성능이 일시적으로 저하될 수 있습니다.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowBackupDialog(false)}>취소</Button>
            <Button mode="contained" onPress={handleBackup} style={styles.dialogButton}>
              백업 시작
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* 점검 모드 다이얼로그 */}
      <Portal>
        <Dialog visible={showMaintenanceDialog} onDismiss={() => setShowMaintenanceDialog(false)}>
          <Dialog.Title>점검 모드 활성화</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              점검 모드를 활성화하면 모든 사용자의 접근이 차단됩니다.
              점검 메시지를 입력해주세요.
            </Text>
            <TextInput
              label="점검 메시지"
              value={maintenanceMessage}
              onChangeText={setMaintenanceMessage}
              mode="outlined"
              style={styles.dialogInput}
              multiline
              numberOfLines={3}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowMaintenanceDialog(false)}>취소</Button>
            <Button mode="contained" onPress={enableMaintenanceMode} style={styles.dialogButton}>
              점검 모드 활성화
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
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
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#E0E0E0',
  },
  actionButton: {
    backgroundColor: '#FF3B30',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    color: '#49454F',
  },
  infoValue: {
    color: '#1D1B20',
    fontWeight: '500',
  },
  statusOnline: {
    color: '#34C759',
  },
  dialogButton: {
    backgroundColor: '#FF3B30',
  },
  dialogText: {
    marginBottom: 16,
  },
  dialogInput: {
    backgroundColor: 'transparent',
  },
});

export default SystemSettingsScreen; 