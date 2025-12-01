import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  RadioButton,
  Card,
  Chip,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, NotificationType, SendNotificationRequest } from '../../types';

type NotificationSendScreenNavigationProp = StackNavigationProp<RootStackParamList, 'NotificationSend'>;
type NotificationSendScreenRouteProp = RouteProp<RootStackParamList, 'NotificationSend'>;

interface Props {
  navigation: NotificationSendScreenNavigationProp;
  route: NotificationSendScreenRouteProp;
}

const NotificationSendScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState<NotificationType>('general');
  const [receiverType, setReceiverType] = useState<'all' | 'patients' | 'doctors' | 'specific'>('all');
  const [isSending, setIsSending] = useState(false);

  const notificationTypes = [
    { value: 'general', label: '일반 알림', icon: 'notifications-outline', color: '#007AFF' },
    { value: 'reservation', label: '예약 알림', icon: 'calendar-outline', color: '#34C759' },
    { value: 'announcement', label: '공지사항', icon: 'megaphone-outline', color: '#FF9500' },
    { value: 'emergency', label: '긴급 알림', icon: 'alert-circle-outline', color: '#FF3B30' },
    { value: 'event', label: '이벤트', icon: 'gift-outline', color: '#AF52DE' },
  ];

  const receiverTypes = [
    { value: 'all', label: '모든 사용자', icon: 'people', count: 1245 },
    { value: 'patients', label: '환자만', icon: 'person', count: 1058 },
    { value: 'doctors', label: '의사만', icon: 'medical', count: 149 },
  ];

  const handleSend = async () => {
    // 유효성 검사
    if (!title.trim()) {
      Alert.alert('알림 오류', '알림 제목을 입력해주세요.');
      return;
    }

    if (!message.trim()) {
      Alert.alert('알림 오류', '알림 내용을 입력해주세요.');
      return;
    }

    Alert.alert(
      '알림 발송',
      `${receiverTypes.find(r => r.value === receiverType)?.label}에게 알림을 발송하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '발송',
          onPress: async () => {
            try {
              setIsSending(true);

              const request: SendNotificationRequest = {
                type: notificationType,
                title: title.trim(),
                message: message.trim(),
                receiverType,
              };

              // API 호출
              const response = await fetch('http://1.246.253.172:3000/api/admin/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
              });
              const data = await response.json();

              if (data.success) {
                Alert.alert(
                  '발송 완료',
                  '알림이 성공적으로 발송되었습니다.',
                  [
                    {
                      text: '확인',
                      onPress: () => {
                        // 입력 필드 초기화
                        setTitle('');
                        setMessage('');
                        setNotificationType('general');
                        setReceiverType('all');
                        navigation.goBack();
                      },
                    },
                  ]
                );
              } else {
                Alert.alert('발송 실패', data.message || '알림 발송 중 오류가 발생했습니다.');
              }
            } catch (error) {
              console.error('알림 발송 오류:', error);
              Alert.alert('발송 실패', '알림 발송 중 오류가 발생했습니다.');
            } finally {
              setIsSending(false);
            }
          },
        },
      ]
    );
  };

  const getTypeInfo = () => {
    return notificationTypes.find(t => t.value === notificationType);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 알림 타입 선택 */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                알림 유형
              </Text>
              <Divider style={styles.divider} />
              
              <View style={styles.typeGrid}>
                {notificationTypes.map((type) => (
                  <Chip
                    key={type.value}
                    mode={notificationType === type.value ? 'flat' : 'outlined'}
                    selected={notificationType === type.value}
                    onPress={() => setNotificationType(type.value as NotificationType)}
                    style={[
                      styles.typeChip,
                      notificationType === type.value && { backgroundColor: type.color + '20' }
                    ]}
                    textStyle={[
                      styles.typeChipText,
                      notificationType === type.value && { color: type.color }
                    ]}
                    icon={type.icon}
                  >
                    {type.label}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* 수신자 선택 */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                수신 대상
              </Text>
              <Divider style={styles.divider} />
              
              <RadioButton.Group
                onValueChange={value => setReceiverType(value as typeof receiverType)}
                value={receiverType}
              >
                {receiverTypes.map((receiver) => (
                  <View key={receiver.value} style={styles.receiverItem}>
                    <View style={styles.receiverInfo}>
                      <Ionicons name={receiver.icon as any} size={24} color="#007AFF" />
                      <View style={styles.receiverText}>
                        <Text variant="bodyLarge" style={styles.receiverLabel}>
                          {receiver.label}
                        </Text>
                        <Text variant="bodySmall" style={styles.receiverCount}>
                          약 {receiver.count.toLocaleString()}명
                        </Text>
                      </View>
                    </View>
                    <RadioButton value={receiver.value} color="#007AFF" />
                  </View>
                ))}
              </RadioButton.Group>
            </Card.Content>
          </Card>

          {/* 알림 내용 */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                알림 내용
              </Text>
              <Divider style={styles.divider} />
              
              <TextInput
                label="알림 제목"
                value={title}
                onChangeText={setTitle}
                mode="outlined"
                placeholder="알림 제목을 입력하세요"
                style={styles.input}
                maxLength={100}
                right={<TextInput.Affix text={`${title.length}/100`} />}
              />
              
              <TextInput
                label="알림 메시지"
                value={message}
                onChangeText={setMessage}
                mode="outlined"
                placeholder="알림 메시지를 입력하세요"
                multiline
                numberOfLines={6}
                style={[styles.input, styles.messageInput]}
                maxLength={500}
              />
              <Text variant="bodySmall" style={styles.charCount}>
                {message.length}/500
              </Text>
            </Card.Content>
          </Card>

          {/* 미리보기 */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                미리보기
              </Text>
              <Divider style={styles.divider} />
              
              <View style={styles.preview}>
                <View style={styles.previewHeader}>
                  <Ionicons
                    name={getTypeInfo()?.icon as any}
                    size={24}
                    color={getTypeInfo()?.color}
                  />
                  <Text variant="titleSmall" style={styles.previewTitle}>
                    {title || '알림 제목'}
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.previewMessage}>
                  {message || '알림 메시지'}
                </Text>
                <Text variant="bodySmall" style={styles.previewTime}>
                  방금 전
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* 발송 정보 */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.infoRow}>
                <Ionicons name="information-circle" size={20} color="#007AFF" />
                <Text variant="bodySmall" style={styles.infoText}>
                  발송된 알림은 취소할 수 없습니다. 내용을 확인한 후 발송해주세요.
                </Text>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={isSending}
          >
            취소
          </Button>
          <Button
            mode="contained"
            onPress={handleSend}
            style={styles.sendButton}
            loading={isSending}
            disabled={isSending}
            icon="send"
          >
            발송하기
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  card: {
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    marginRight: 8,
    marginBottom: 8,
    height: 38,
    paddingHorizontal: 12,
  },
  typeChipText: {
    fontSize: 13,
  },
  receiverItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  receiverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  receiverText: {
    marginLeft: 12,
  },
  receiverLabel: {
    color: '#1D1B20',
    fontWeight: '500',
  },
  receiverCount: {
    color: '#8E8E93',
    marginTop: 2,
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  messageInput: {
    minHeight: 150,
  },
  charCount: {
    textAlign: 'right',
    color: '#8E8E93',
  },
  preview: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewTitle: {
    marginLeft: 8,
    color: '#1D1B20',
    fontWeight: '600',
  },
  previewMessage: {
    color: '#49454F',
    marginBottom: 8,
  },
  previewTime: {
    color: '#8E8E93',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    marginLeft: 8,
    color: '#007AFF',
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 8,
  },
  sendButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
});

export default NotificationSendScreen;


