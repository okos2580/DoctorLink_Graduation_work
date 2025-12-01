import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Card, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../../types';

type ContactScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Contact'>;

interface Props {
  navigation: ContactScreenNavigationProp;
}

const ContactScreen: React.FC<Props> = ({ navigation }) => {
  const [category, setCategory] = useState('general');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // 입력 검증
    if (!userName.trim() || !userEmail.trim() || !userPhone.trim() || !title.trim() || !content.trim()) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      Alert.alert('오류', '올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // 전화번호 형식 검증 (간단히)
    const phoneRegex = /^[\d-]+$/;
    if (!phoneRegex.test(userPhone)) {
      Alert.alert('오류', '올바른 전화번호 형식을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('http://1.246.253.172:3000/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: userName.trim(),
          userEmail: userEmail.trim(),
          userPhone: userPhone.trim(),
          category,
          title: title.trim(),
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          '문의 접수 완료',
          '문의가 성공적으로 접수되었습니다.\n빠른 시일 내에 답변 드리겠습니다.',
          [
            {
              text: '확인',
              onPress: () => {
                // 입력 필드 초기화
                setCategory('general');
                setUserName('');
                setUserEmail('');
                setUserPhone('');
                setTitle('');
                setContent('');
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('오류', data.message || '문의 접수 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('문의 제출 오류:', error);
      Alert.alert('오류', '문의 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={styles.title}>
          문의하기
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          궁금하신 사항을 문의해주세요.
        </Text>

        <Card style={styles.formCard}>
          <Card.Content>
            {/* 문의 유형 */}
            <Text variant="titleSmall" style={styles.label}>
              문의 유형
            </Text>
            <SegmentedButtons
              value={category}
              onValueChange={setCategory}
              buttons={[
                { value: 'general', label: '일반' },
                { value: 'reservation', label: '예약' },
                { value: 'medical', label: '진료' },
                { value: 'payment', label: '결제' },
              ]}
              style={styles.segmentedButtons}
            />

            {/* 이름 */}
            <TextInput
              label="이름 *"
              value={userName}
              onChangeText={setUserName}
              mode="outlined"
              style={styles.input}
              placeholder="홍길동"
            />

            {/* 이메일 */}
            <TextInput
              label="이메일 *"
              value={userEmail}
              onChangeText={setUserEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholder="example@email.com"
            />

            {/* 전화번호 */}
            <TextInput
              label="전화번호 *"
              value={userPhone}
              onChangeText={setUserPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              placeholder="010-1234-5678"
            />

            {/* 제목 */}
            <TextInput
              label="제목 *"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
              placeholder="문의 제목을 입력하세요"
            />

            {/* 내용 */}
            <TextInput
              label="내용 *"
              value={content}
              onChangeText={setContent}
              mode="outlined"
              multiline
              numberOfLines={6}
              style={[styles.input, styles.textArea]}
              placeholder="문의 내용을 상세히 입력해주세요"
            />
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
          >
            {isSubmitting ? '제출 중...' : '문의하기'}
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
            style={styles.cancelButton}
          >
            취소
          </Button>
        </View>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.infoTitle}>
              📞 직접 문의
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              이메일: support@doctorlink.com{'\n'}
              전화: 1588-1234{'\n'}
              운영시간: 평일 09:00 - 18:00
            </Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#1D1B20',
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#8E8E93',
  },
  formCard: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  label: {
    marginBottom: 8,
    marginTop: 4,
    color: '#49454F',
    fontWeight: '600',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  textArea: {
    minHeight: 120,
  },
  actions: {
    marginBottom: 16,
  },
  submitButton: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
  },
  cancelButton: {
    marginBottom: 12,
    borderRadius: 8,
    borderColor: '#FF3B30',
  },
  infoCard: {
    backgroundColor: '#FFF8E1',
    marginBottom: 16,
  },
  infoTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#1D1B20',
  },
  infoText: {
    color: '#49454F',
    lineHeight: 22,
  },
});

export default ContactScreen; 