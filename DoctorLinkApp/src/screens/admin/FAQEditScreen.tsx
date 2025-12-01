import React, { useState, useEffect } from 'react';
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
  Card,
  Chip,
  Divider,
  ActivityIndicator,
  Switch,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, FAQCategory } from '../../types';
import { get, post, put } from '../../services/api';

type FAQEditScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FAQEdit'>;
type FAQEditScreenRouteProp = RouteProp<RootStackParamList, 'FAQEdit'>;

interface Props {
  navigation: FAQEditScreenNavigationProp;
  route: FAQEditScreenRouteProp;
}

const FAQEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const faqId = route.params?.faqId;
  const isEditing = !!faqId;

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState<FAQCategory>('general');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    { value: 'general', label: '일반', icon: 'help-circle-outline', color: '#007AFF' },
    { value: 'reservation', label: '예약', icon: 'calendar-outline', color: '#34C759' },
    { value: 'account', label: '계정', icon: 'person-outline', color: '#FF9500' },
    { value: 'payment', label: '결제', icon: 'card-outline', color: '#AF52DE' },
    { value: 'technical', label: '기술', icon: 'construct-outline', color: '#FF3B30' },
  ];

  useEffect(() => {
    if (isEditing) {
      loadFAQ();
    }
  }, [faqId]);

  const loadFAQ = async () => {
    try {
      setIsLoading(true);
      const response = await get(`/admin/faqs/${faqId}`);
      
      if (response.success && response.data) {
        const faq = response.data.faq;
        setQuestion(faq.question);
        setAnswer(faq.answer);
        setCategory(faq.category);
        setIsActive(faq.isActive);
      } else {
        Alert.alert('오류', 'FAQ를 불러올 수 없습니다.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('FAQ 로드 오류:', error);
      Alert.alert('오류', 'FAQ를 불러올 수 없습니다.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // 유효성 검사
    if (!question.trim()) {
      Alert.alert('입력 오류', '질문을 입력해주세요.');
      return;
    }

    if (!answer.trim()) {
      Alert.alert('입력 오류', '답변을 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);

      const faqData = {
        question: question.trim(),
        answer: answer.trim(),
        category,
        isActive,
      };

      let response;
      if (isEditing) {
        response = await put(`/admin/faqs/${faqId}`, faqData);
      } else {
        response = await post('/admin/faqs', faqData);
      }

      if (response.success) {
        Alert.alert(
          '완료',
          isEditing ? 'FAQ가 수정되었습니다.' : 'FAQ가 등록되었습니다.',
          [
            {
              text: '확인',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('오류', response.message || '저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('FAQ 저장 오류:', error);
      Alert.alert('오류', '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            FAQ를 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          {/* 카테고리 선택 */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                카테고리
              </Text>
              <Divider style={styles.divider} />
              
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <Chip
                    key={cat.value}
                    mode={category === cat.value ? 'flat' : 'outlined'}
                    selected={category === cat.value}
                    onPress={() => setCategory(cat.value as FAQCategory)}
                    style={[
                      styles.categoryChip,
                      category === cat.value && { backgroundColor: cat.color + '20' }
                    ]}
                    textStyle={[
                      styles.categoryChipText,
                      category === cat.value && { color: cat.color }
                    ]}
                    icon={cat.icon}
                  >
                    {cat.label}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* 질문 및 답변 */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                FAQ 내용
              </Text>
              <Divider style={styles.divider} />
              
              <TextInput
                label="질문"
                value={question}
                onChangeText={setQuestion}
                mode="outlined"
                placeholder="자주 묻는 질문을 입력하세요"
                style={styles.input}
                maxLength={200}
                right={<TextInput.Affix text={`${question.length}/200`} />}
              />
              
              <TextInput
                label="답변"
                value={answer}
                onChangeText={setAnswer}
                mode="outlined"
                placeholder="답변을 입력하세요"
                multiline
                numberOfLines={8}
                style={[styles.input, styles.answerInput]}
                maxLength={1000}
              />
              <Text variant="bodySmall" style={styles.charCount}>
                {answer.length}/1000
              </Text>
            </Card.Content>
          </Card>

          {/* 설정 */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                설정
              </Text>
              <Divider style={styles.divider} />
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="eye" size={24} color="#34C759" />
                  <View style={styles.settingText}>
                    <Text variant="bodyLarge" style={styles.settingLabel}>
                      활성화
                    </Text>
                    <Text variant="bodySmall" style={styles.settingDesc}>
                      사용자에게 FAQ를 표시합니다
                    </Text>
                  </View>
                </View>
                <Switch value={isActive} onValueChange={setIsActive} color="#007AFF" />
              </View>
            </Card.Content>
          </Card>

          {/* 안내 */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.infoRow}>
                <Ionicons name="information-circle" size={20} color="#007AFF" />
                <Text variant="bodySmall" style={styles.infoText}>
                  저장된 FAQ는 즉시 사용자에게 표시됩니다.
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
            disabled={isSaving}
          >
            취소
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            loading={isSaving}
            disabled={isSaving}
            icon="content-save"
          >
            {isEditing ? '수정' : '등록'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#8E8E93',
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
    height: 38,
    paddingHorizontal: 12,
  },
  categoryChipText: {
    fontSize: 13,
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  answerInput: {
    minHeight: 160,
  },
  charCount: {
    textAlign: 'right',
    color: '#8E8E93',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    color: '#1D1B20',
    fontWeight: '500',
  },
  settingDesc: {
    color: '#8E8E93',
    marginTop: 2,
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
  saveButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
});

export default FAQEditScreen;





