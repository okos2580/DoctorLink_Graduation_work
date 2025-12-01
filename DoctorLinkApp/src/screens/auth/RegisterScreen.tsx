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
  RadioButton,
  Snackbar,
  HelperText,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

// 타입 import
import { RootStackParamList, RegisterRequest, Gender } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

// 네비게이션 타입
type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register, isLoading, error, clearError } = useAuth();
  
  // 폼 상태
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'male',
  });
  
  // UI 상태
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 입력값 변경 핸들러
  const handleInputChange = (field: keyof RegisterRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // 에러 메시지 클리어
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 필수 필드 체크
    if (!formData.username.trim()) {
      errors.username = '사용자명을 입력해주세요.';
    } else if (formData.username.length < 3) {
      errors.username = '사용자명은 3자 이상이어야 합니다.';
    }

    if (!formData.email.trim()) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!formData.password.trim()) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = '비밀번호를 다시 입력해주세요.';
    } else if (formData.password !== confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    if (!formData.firstName.trim()) {
      errors.firstName = '이름을 입력해주세요.';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = '성을 입력해주세요.';
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = '전화번호를 입력해주세요.';
    } else if (!/^[0-9-+\s()]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = '올바른 전화번호 형식이 아닙니다.';
    }

    if (!formData.dateOfBirth.trim()) {
      errors.dateOfBirth = '생년월일을 입력해주세요.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
      errors.dateOfBirth = 'YYYY-MM-DD 형식으로 입력해주세요.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 회원가입 처리
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
      // 회원가입 성공 시 AuthContext에서 자동으로 메인 화면으로 이동
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      setSnackbarVisible(true);
    }
  };

  // 로그인으로 이동
  const navigateToLogin = () => {
    navigation.goBack();
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
            {/* 헤더 */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <Ionicons name="person-add" size={40} color="#FFFFFF" />
              </View>
              <Text variant="headlineMedium" style={styles.title}>
                회원가입
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                DoctorLink에 오신 것을 환영합니다
              </Text>
            </View>

            {/* 회원가입 폼 카드 */}
            <Card style={styles.registerCard}>
              <Card.Content style={styles.cardContent}>

                {/* 사용자명 */}
                <TextInput
                  label="사용자명 *"
                  value={formData.username}
                  onChangeText={(text) => handleInputChange('username', text)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={!!formErrors.username}
                />
                <HelperText type="error" visible={!!formErrors.username}>
                  {formErrors.username}
                </HelperText>

                {/* 이메일 */}
                <TextInput
                  label="이메일 *"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  error={!!formErrors.email}
                />
                <HelperText type="error" visible={!!formErrors.email}>
                  {formErrors.email}
                </HelperText>

                {/* 성과 이름 */}
                <View style={styles.nameContainer}>
                  <View style={styles.nameField}>
                    <TextInput
                      label="성 *"
                      value={formData.lastName}
                      onChangeText={(text) => handleInputChange('lastName', text)}
                      mode="outlined"
                      style={styles.input}
                      error={!!formErrors.lastName}
                    />
                    <HelperText type="error" visible={!!formErrors.lastName}>
                      {formErrors.lastName}
                    </HelperText>
                  </View>
                  <View style={styles.nameField}>
                    <TextInput
                      label="이름 *"
                      value={formData.firstName}
                      onChangeText={(text) => handleInputChange('firstName', text)}
                      mode="outlined"
                      style={styles.input}
                      error={!!formErrors.firstName}
                    />
                    <HelperText type="error" visible={!!formErrors.firstName}>
                      {formErrors.firstName}
                    </HelperText>
                  </View>
                </View>

                {/* 전화번호 */}
                <TextInput
                  label="전화번호 *"
                  value={formData.phoneNumber}
                  onChangeText={(text) => handleInputChange('phoneNumber', text)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="phone" />}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                  placeholder="010-1234-5678"
                  error={!!formErrors.phoneNumber}
                />
                <HelperText type="error" visible={!!formErrors.phoneNumber}>
                  {formErrors.phoneNumber}
                </HelperText>

                {/* 생년월일 */}
                <TextInput
                  label="생년월일 *"
                  value={formData.dateOfBirth}
                  onChangeText={(text) => handleInputChange('dateOfBirth', text)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="calendar" />}
                  placeholder="1990-01-01"
                  error={!!formErrors.dateOfBirth}
                />
                <HelperText type="error" visible={!!formErrors.dateOfBirth}>
                  {formErrors.dateOfBirth}
                </HelperText>

                {/* 성별 */}
                <Text variant="bodyMedium" style={styles.genderLabel}>
                  성별 *
                </Text>
                <RadioButton.Group
                  onValueChange={(value) => handleInputChange('gender', value as Gender)}
                  value={formData.gender}
                >
                  <View style={styles.genderContainer}>
                    <View style={styles.genderOption}>
                      <RadioButton value="male" />
                      <Text variant="bodyMedium">남성</Text>
                    </View>
                    <View style={styles.genderOption}>
                      <RadioButton value="female" />
                      <Text variant="bodyMedium">여성</Text>
                    </View>
                  </View>
                </RadioButton.Group>

                <Divider style={styles.divider} />

                {/* 비밀번호 */}
                <TextInput
                  label="비밀번호 *"
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
                  textContentType="newPassword"
                  error={!!formErrors.password}
                />
                <HelperText type="error" visible={!!formErrors.password}>
                  {formErrors.password}
                </HelperText>

                {/* 비밀번호 확인 */}
                <TextInput
                  label="비밀번호 확인 *"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={!confirmPasswordVisible}
                  left={<TextInput.Icon icon="lock-check" />}
                  right={
                    <TextInput.Icon
                      icon={confirmPasswordVisible ? 'eye-off' : 'eye'}
                      onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    />
                  }
                  textContentType="newPassword"
                  error={!!formErrors.confirmPassword}
                />
                <HelperText type="error" visible={!!formErrors.confirmPassword}>
                  {formErrors.confirmPassword}
                </HelperText>

                {/* 회원가입 버튼 */}
                <Button
                  mode="contained"
                  onPress={handleRegister}
                  style={styles.registerButton}
                  contentStyle={styles.buttonContent}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? '가입 중...' : '회원가입'}
                </Button>

                {/* 로그인 링크 */}
                <View style={styles.loginContainer}>
                  <Text variant="bodyMedium">
                    이미 계정이 있으신가요?{' '}
                  </Text>
                  <Button
                    mode="text"
                    onPress={navigateToLogin}
                    compact
                    style={styles.loginButton}
                  >
                    로그인
                  </Button>
                </View>
              </Card.Content>
            </Card>

            {/* 푸터 */}
            <View style={styles.footer}>
              <Text variant="bodySmall" style={styles.footerText}>
                회원가입하시면 서비스 이용약관 및{'\n'}
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
          {error || '회원가입 중 오류가 발생했습니다.'}
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
  registerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardContent: {
    padding: 24,
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#F8F9FA',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameField: {
    flex: 1,
    marginHorizontal: 4,
  },
  genderLabel: {
    marginBottom: 8,
    marginTop: 8,
    color: '#49454F',
    fontWeight: '500',
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 32,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#E0E0E0',
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    marginLeft: -8,
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

export default RegisterScreen; 