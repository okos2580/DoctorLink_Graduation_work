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
import { RootStackParamList } from '../../types';
import { get, post, put } from '../../services/api';

type AnnouncementEditScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnnouncementEdit'>;
type AnnouncementEditScreenRouteProp = RouteProp<RootStackParamList, 'AnnouncementEdit'>;

interface Props {
  navigation: AnnouncementEditScreenNavigationProp;
  route: AnnouncementEditScreenRouteProp;
}

const AnnouncementEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const announcementId = route.params?.announcementId;
  const isEditing = !!announcementId;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'notice' | 'update' | 'maintenance' | 'event'>('notice');
  const [isPinned, setIsPinned] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    { value: 'notice', label: '공지', icon: 'megaphone-outline', color: '#007AFF' },
    { value: 'update', label: '업데이트', icon: 'refresh-outline', color: '#34C759' },
    { value: 'maintenance', label: '점검', icon: 'construct-outline', color: '#FF9500' },
    { value: 'event', label: '이벤트', icon: 'gift-outline', color: '#AF52DE' },
  ];

  useEffect(() => {
    if (isEditing) {
      loadAnnouncement();
    }
  }, [announcementId]);

  const loadAnnouncement = async () => {
    try {
      setIsLoading(true);
      const response = await get(`/admin/announcements/${announcementId}`);
      
      if (response.success && response.data) {
        const announcement = response.data.announcement;
        setTitle(announcement.title);
        setContent(announcement.content);
        setCategory(announcement.category);
        setIsPinned(announcement.isPinned);
        setIsActive(announcement.isActive);
      } else {
        Alert.alert('오류', '공지사항을 불러올 수 없습니다.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('공지사항 로드 오류:', error);
      Alert.alert('오류', '공지사항을 불러올 수 없습니다.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // 유효성 검사
    if (!title.trim()) {
      Alert.alert('입력 오류', '제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('입력 오류', '내용을 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);

      const announcementData = {
        title: title.trim(),
        content: content.trim(),
        category,
        isPinned,
        isActive,
      };

      let response;
      if (isEditing) {
        response = await put(`/admin/announcements/${announcementId}`, announcementData);
      } else {
        response = await post('/admin/announcements', announcementData);
      }

      if (response.success) {
        Alert.alert(
          '완료',
          isEditing ? '공지사항이 수정되었습니다.' : '공지사항이 등록되었습니다.',
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
      console.error('공지사항 저장 오류:', error);
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
            공지사항을 불러오는 중...
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
                    onPress={() => setCategory(cat.value as typeof category)}
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

          {/* 제목 및 내용 */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                공지사항 내용
              </Text>
              <Divider style={styles.divider} />
              
              <TextInput
                label="제목"
                value={title}
                onChangeText={setTitle}
                mode="outlined"
                placeholder="공지사항 제목을 입력하세요"
                style={styles.input}
                maxLength={100}
                right={<TextInput.Affix text={`${title.length}/100`} />}
              />
              
              <TextInput
                label="내용"
                value={content}
                onChangeText={setContent}
                mode="outlined"
                placeholder="공지사항 내용을 입력하세요"
                multiline
                numberOfLines={10}
                style={[styles.input, styles.contentInput]}
                maxLength={2000}
              />
              <Text variant="bodySmall" style={styles.charCount}>
                {content.length}/2000
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
                  <Ionicons name="pin" size={24} color="#FF3B30" />
                  <View style={styles.settingText}>
                    <Text variant="bodyLarge" style={styles.settingLabel}>
                      상단 고정
                    </Text>
                    <Text variant="bodySmall" style={styles.settingDesc}>
                      공지사항을 목록 최상단에 고정합니다
                    </Text>
                  </View>
                </View>
                <Switch value={isPinned} onValueChange={setIsPinned} color="#007AFF" />
              </View>

              <Divider style={styles.settingDivider} />

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="eye" size={24} color="#34C759" />
                  <View style={styles.settingText}>
                    <Text variant="bodyLarge" style={styles.settingLabel}>
                      활성화
                    </Text>
                    <Text variant="bodySmall" style={styles.settingDesc}>
                      사용자에게 공지사항을 표시합니다
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
                  저장된 공지사항은 즉시 사용자에게 표시됩니다.
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
  contentInput: {
    minHeight: 200,
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
  settingDivider: {
    marginVertical: 12,
    backgroundColor: '#E0E0E0',
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

export default AnnouncementEditScreen;





