import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

// 타입 import
import { RootStackParamList, LoginRequest } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

// 네비게이션 타입
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, isLoading, error, clearError } = useAuth();
  
  // 폼 상태
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  
  // UI 상태
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // 입력값 변경 핸들러
  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 로그인 처리
  const handleLogin = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      Alert.alert('입력 오류', '사용자명과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      await login(formData);
      // 로그인 성공 시 AuthContext에서 자동으로 메인 화면으로 이동
    } catch (error: any) {
      console.error('로그인 오류:', error);
      setSnackbarVisible(true);
    }
  };

  // 카카오 로그인 (추후 구현)
  const handleKakaoLogin = () => {
    Alert.alert('준비 중', '카카오 로그인 기능을 준비 중입니다.');
  };

  // 회원가입으로 이동
  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#007AFF', '#0056CC']}
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 로고 및 제목 영역 */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <Ionicons name="medical" size={60} color="#FFFFFF" />
              </View>
              <Text variant="headlineLarge" style={styles.title}>
                DoctorLink
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                믿을 수 있는 의료 예약 서비스
              </Text>
            </View>

            {/* 로그인 폼 카드 */}
            <Card style={styles.loginCard}>
              <Card.Content style={styles.cardContent}>
                <Text variant="headlineSmall" style={styles.formTitle}>
                  로그인
                </Text>

                {/* 사용자명 입력 */}
                <TextInput
                  label="사용자명 또는 이메일"
                  value={formData.username}
                  onChangeText={(text) => handleInputChange('username', text)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="username"
                  keyboardType="email-address"
                />

                {/* 비밀번호 입력 */}
                <TextInput
                  label="비밀번호"
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={!passwordVisible}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={passwordVisible ? 'eye-off' : 'eye'}
                      onPress={() => setPasswordVisible(!passwordVisible)}
                    />
                  }
                  textContentType="password"
                />

                {/* 로그인 버튼 */}
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  contentStyle={styles.buttonContent}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </Button>

                {/* 구분선 */}
                <View style={styles.dividerContainer}>
                  <Divider style={styles.divider} />
                  <Text variant="bodySmall" style={styles.dividerText}>
                    또는
                  </Text>
                  <Divider style={styles.divider} />
                </View>

                {/* 카카오 로그인 버튼 */}
                <Button
                  mode="contained"
                  onPress={handleKakaoLogin}
                  style={styles.kakaoButton}
                  contentStyle={styles.buttonContent}
                  buttonColor="#FEE500"
                  textColor="#000000"
                  icon="chat"
                >
                  카카오로 로그인
                </Button>

                {/* 회원가입 링크 */}
                <View style={styles.signupContainer}>
                  <Text variant="bodyMedium">
                    계정이 없으신가요?{' '}
                  </Text>
                  <Button
                    mode="text"
                    onPress={navigateToRegister}
                    compact
                    style={styles.signupButton}
                  >
                    회원가입
                  </Button>
                </View>

                {/* 비밀번호 찾기 */}
                <Button
                  mode="text"
                  onPress={() => Alert.alert('준비 중', '비밀번호 찾기 기능을 준비 중입니다.')}
                  compact
                  style={styles.forgotButton}
                >
                  비밀번호를 잊으셨나요?
                </Button>
              </Card.Content>
            </Card>

            {/* 푸터 */}
            <View style={styles.footer}>
              <Text variant="bodySmall" style={styles.footerText}>
                로그인하시면 서비스 이용약관 및{'\n'}
                개인정보처리방침에 동의하시는 것으로 간주됩니다.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* 에러 스낵바 */}
        <Snackbar
          visible={snackbarVisible && !!error}
          onDismiss={() => {
            setSnackbarVisible(false);
            clearError();
          }}
          duration={4000}
          style={styles.snackbar}
          action={{
            label: '확인',
            onPress: () => {
              setSnackbarVisible(false);
              clearError();
            },
          }}
        >
          {error || '로그인 중 오류가 발생했습니다.'}
        </Snackbar>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#E3F2FF',
    textAlign: 'center',
    opacity: 0.9,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardContent: {
    padding: 24,
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#1D1B20',
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#8E8E93',
  },
  kakaoButton: {
    borderRadius: 12,
    marginBottom: 20,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  signupButton: {
    marginLeft: -8,
  },
  forgotButton: {
    alignSelf: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    color: '#E3F2FF',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  snackbar: {
    backgroundColor: '#FF3B30',
  },
});

export default LoginScreen; 