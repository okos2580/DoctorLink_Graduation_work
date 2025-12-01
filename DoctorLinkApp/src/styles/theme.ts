import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

// 커스텀 색상 팔레트
const colors = {
  primary: '#007AFF',
  primaryContainer: '#E3F2FF',
  secondary: '#34C759',
  secondaryContainer: '#E8F7EA',
  tertiary: '#FF3B30',
  tertiaryContainer: '#FFE5E3',
  surface: '#FFFFFF',
  surfaceVariant: '#F2F2F7',
  background: '#F2F2F7',
  error: '#FF3B30',
  errorContainer: '#FFE5E3',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#001F28',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#002018',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#3A0008',
  onSurface: '#1D1B20',
  onSurfaceVariant: '#49454F',
  onError: '#FFFFFF',
  onErrorContainer: '#3A0008',
  onBackground: '#1D1B20',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#322F35',
  inverseOnSurface: '#F5EFF7',
  inversePrimary: '#9CCAFF',
  elevation: {
    level0: 'transparent',
    level1: '#FFFFFF',
    level2: '#FFFFFF',
    level3: '#FFFFFF',
    level4: '#FFFFFF',
    level5: '#FFFFFF',
  },
  // DoctorLink 앱 전용 색상
  success: '#34C759',
  warning: '#FF9500',
  info: '#007AFF',
  lightGray: '#F8F9FA',
  mediumGray: '#8E8E93',
  darkGray: '#3A3A3C',
  hospitalCard: '#FFFFFF',
  reservationPending: '#FF9500',
  reservationApproved: '#34C759',
  reservationRejected: '#FF3B30',
  reservationCompleted: '#007AFF',
  reservationCancelled: '#8E8E93',
};

// 폰트 설정
const fonts = {
  ...DefaultTheme.fonts,
  displayLarge: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },
  titleLarge: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelLarge: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
};

// 커스텀 테마
const theme = {
  ...DefaultTheme,
  colors,
  fonts,
  // 커스텀 스타일링
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  elevation: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
  },
  // 컴포넌트별 스타일
  components: {
    card: {
      borderRadius: 12,
      elevation: 2,
      backgroundColor: colors.surface,
    },
    button: {
      borderRadius: 8,
      minHeight: 48,
    },
    input: {
      borderRadius: 8,
      minHeight: 56,
    },
    fab: {
      borderRadius: 16,
    },
  },
};

export default theme;

// 타입 확장
export type AppTheme = typeof theme;

declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      success: string;
      warning: string;
      info: string;
      lightGray: string;
      mediumGray: string;
      darkGray: string;
      hospitalCard: string;
      reservationPending: string;
      reservationApproved: string;
      reservationRejected: string;
      reservationCompleted: string;
      reservationCancelled: string;
    }
    
    interface Theme {
      spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
      };
      borderRadius: {
        sm: number;
        md: number;
        lg: number;
        xl: number;
        full: number;
      };
      elevation: {
        sm: number;
        md: number;
        lg: number;
        xl: number;
      };
      components: {
        card: {
          borderRadius: number;
          elevation: number;
          backgroundColor: string;
        };
        button: {
          borderRadius: number;
          minHeight: number;
        };
        input: {
          borderRadius: number;
          minHeight: number;
        };
        fab: {
          borderRadius: number;
        };
      };
    }
  }
} 