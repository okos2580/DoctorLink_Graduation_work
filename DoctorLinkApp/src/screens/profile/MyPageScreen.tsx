import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  List,
  Divider,
  Button,
  Switch,
  Badge,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// 타입 import
import { RootStackParamList, TabParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

// 네비게이션 타입
type MyPageScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'MyPage'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: MyPageScreenNavigationProp;
}

// 메뉴 아이템 타입 정의
interface BaseMenuItem {
  icon: string;
  title: string;
  subtitle: string;
}

interface ButtonMenuItem extends BaseMenuItem {
  onPress: () => void;
  showBadge: boolean;
  badgeCount?: number;
  isSwitch?: never;
  switchValue?: never;
  onSwitchChange?: never;
}

interface SwitchMenuItem extends BaseMenuItem {
  isSwitch: true;
  switchValue: boolean;
  onSwitchChange: (value: boolean) => void;
  onPress?: never;
  showBadge?: never;
  badgeCount?: never;
}

type MenuItem = ButtonMenuItem | SwitchMenuItem;

const MyPageScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  
  // 설정 상태
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // 로그아웃 처리
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('로그아웃 오류:', error);
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  // 메뉴 아이템들
  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: '개인정보',
      items: [
        {
          icon: 'person-outline',
          title: '프로필 수정',
          subtitle: '개인정보 및 의료정보 관리',
          onPress: () => navigation.navigate('Profile'),
          showBadge: false,
        },
        {
          icon: 'shield-checkmark-outline',
          title: '계정 보안',
          subtitle: '비밀번호 변경 및 보안 설정',
          onPress: () => {
            Alert.alert('준비 중', '계정 보안 기능을 준비 중입니다.');
          },
          showBadge: false,
        },
      ],
    },
    {
      title: '예약 및 기록',
      items: [
        {
          icon: 'calendar-outline',
          title: '예약 관리',
          subtitle: '예약 내역 및 상태 확인',
          onPress: () => navigation.navigate('Reservations'),
          showBadge: true,
          badgeCount: 2,
        },
        {
          icon: 'document-text-outline',
          title: '진료 기록',
          subtitle: '과거 진료 내역 조회',
          onPress: () => navigation.navigate('MedicalRecords'),
          showBadge: false,
        },
        {
          icon: 'heart-outline',
          title: '즐겨찾기 병원',
          subtitle: '자주 방문하는 병원 관리',
          onPress: () => {
            Alert.alert('준비 중', '즐겨찾기 병원 기능을 준비 중입니다.');
          },
          showBadge: false,
        },
      ],
    },
    {
      title: '알림 설정',
      items: [
        {
          icon: 'notifications-outline',
          title: '푸시 알림',
          subtitle: '앱 알림 수신 여부',
          isSwitch: true,
          switchValue: pushNotifications,
          onSwitchChange: setPushNotifications,
        },
        {
          icon: 'mail-outline',
          title: '이메일 알림',
          subtitle: '이메일 알림 수신 여부',
          isSwitch: true,
          switchValue: emailNotifications,
          onSwitchChange: setEmailNotifications,
        },
      ],
    },
    {
      title: '고객 지원',
      items: [
        {
          icon: 'newspaper-outline',
          title: '공지사항',
          subtitle: '새로운 소식과 업데이트 확인',
          onPress: () => navigation.navigate('AnnouncementScreen'),
          showBadge: true,
          badgeCount: 3,
        },
        {
          icon: 'help-circle-outline',
          title: 'FAQ',
          subtitle: '자주 묻는 질문',
          onPress: () => navigation.navigate('FAQScreen'),
          showBadge: false,
        },
        {
          icon: 'chatbubble-outline',
          title: '1:1 문의',
          subtitle: '고객센터 문의 및 피드백',
          onPress: () => navigation.navigate('InquiryScreen'),
          showBadge: false,
        },
        {
          icon: 'call-outline',
          title: '고객센터',
          subtitle: '전화 문의 및 연락처',
          onPress: () => navigation.navigate('Contact'),
          showBadge: false,
        },
        {
          icon: 'information-circle-outline',
          title: 'DoctorLink 소개',
          subtitle: '앱 정보 및 버전',
          onPress: () => navigation.navigate('About'),
          showBadge: false,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 프로필 헤더 */}
        <LinearGradient
          colors={['#007AFF', '#0056CC']}
          style={styles.headerGradient}
        >
          <View style={styles.profileHeader}>
            <TouchableOpacity
              style={styles.profileImageContainer}
              onPress={() => navigation.navigate('Profile')}
            >
              {user?.profileImage ? (
                <Avatar.Image
                  size={80}
                  source={{ uri: user.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <Avatar.Icon
                  size={80}
                  icon="account"
                  style={styles.profileImage}
                />
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text variant="headlineSmall" style={styles.userName}>
                {user?.name || '사용자'}
              </Text>
              <Text variant="bodyMedium" style={styles.userEmail}>
                {user?.email || 'user@example.com'}
              </Text>
              <View style={styles.userStats}>
                <View style={styles.statItem}>
                  <Text variant="titleSmall" style={styles.statNumber}>
                    12
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    예약
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text variant="titleSmall" style={styles.statNumber}>
                    5
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    진료
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text variant="titleSmall" style={styles.statNumber}>
                    3
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    즐겨찾기
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* 빠른 액션 */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('Reservation', {})}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#34C759' }]}>
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            </View>
            <Text variant="bodySmall" style={styles.quickActionText}>
              예약하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('Reservations')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FF9500' }]}>
              <Ionicons name="calendar" size={24} color="#FFFFFF" />
            </View>
            <Text variant="bodySmall" style={styles.quickActionText}>
              예약내역
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('MedicalRecords')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#007AFF' }]}>
              <Ionicons name="document-text" size={24} color="#FFFFFF" />
            </View>
            <Text variant="bodySmall" style={styles.quickActionText}>
              진료기록
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('HospitalFinder')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#8E8E93' }]}>
              <Ionicons name="business" size={24} color="#FFFFFF" />
            </View>
            <Text variant="bodySmall" style={styles.quickActionText}>
              병원찾기
            </Text>
          </TouchableOpacity>
        </View>

        {/* 메뉴 섹션들 */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              {section.title}
            </Text>
            
            <Card style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  {item.isSwitch ? (
                    <List.Item
                      title={item.title}
                      description={item.subtitle}
                      left={(props) => (
                        <Ionicons
                          name={item.icon as keyof typeof Ionicons.glyphMap}
                          size={24}
                          color="#8E8E93"
                          style={{ marginLeft: 16, marginTop: 8 }}
                        />
                      )}
                      right={() => (
                        <Switch
                          value={item.switchValue}
                          onValueChange={item.onSwitchChange}
                          style={{ marginRight: 16 }}
                        />
                      )}
                      style={styles.menuItem}
                    />
                  ) : (
                    <List.Item
                      title={item.title}
                      description={item.subtitle}
                      left={(props) => (
                        <Ionicons
                          name={item.icon as keyof typeof Ionicons.glyphMap}
                          size={24}
                          color="#8E8E93"
                          style={{ marginLeft: 16, marginTop: 8 }}
                        />
                      )}
                      right={(props) => (
                        <View style={styles.rightContainer}>
                          {item.showBadge && item.badgeCount && (
                            <Badge size={20} style={styles.badge}>
                              {item.badgeCount}
                            </Badge>
                          )}
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#8E8E93"
                            style={{ marginRight: 16 }}
                          />
                        </View>
                      )}
                      onPress={item.onPress}
                      style={styles.menuItem}
                    />
                  )}
                  {itemIndex < section.items.length - 1 && (
                    <Divider style={styles.itemDivider} />
                  )}
                </View>
              ))}
            </Card>
          </View>
        ))}

        {/* 로그아웃 버튼 */}
        <View style={styles.logoutSection}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            buttonColor="#FFFFFF"
            textColor="#FF3B30"
            icon="log-out"
          >
            로그아웃
          </Button>
        </View>

        {/* 앱 정보 */}
        <View style={styles.appInfo}>
          <Text variant="bodySmall" style={styles.appVersion}>
            DoctorLink v1.0.0
          </Text>
          <Text variant="bodySmall" style={styles.copyright}>
            © 2024 DoctorLink. All rights reserved.
          </Text>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomPadding} />
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
  headerGradient: {
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#E3F2FF',
    opacity: 0.9,
    marginBottom: 16,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  statNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    color: '#E3F2FF',
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginTop: -12,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    color: '#49454F',
    fontWeight: '500',
    textAlign: 'center',
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '600',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  menuItem: {
    paddingVertical: 8,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  itemDivider: {
    marginLeft: 56,
    backgroundColor: '#F2F2F7',
  },
  logoutSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  logoutButton: {
    borderColor: '#FF3B30',
    borderRadius: 12,
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  appVersion: {
    color: '#8E8E93',
    marginBottom: 4,
  },
  copyright: {
    color: '#8E8E93',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 32,
  },
});

export default MyPageScreen; 