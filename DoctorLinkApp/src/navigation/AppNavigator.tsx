import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// 타입 import
import { RootStackParamList, TabParamList } from '../types';

// 화면 import (나중에 생성할 예정)
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/main/HomeScreen';
import HospitalFinderScreen from '../screens/hospital/HospitalFinderScreen';
import HospitalDetailScreen from '../screens/hospital/HospitalDetailScreen';
import ReservationScreen from '../screens/reservation/ReservationScreen';
import ReservationDetailScreen from '../screens/reservation/ReservationDetailScreen';
import ReservationManagementScreen from '../screens/reservation/ReservationManagementScreen';
import MedicalRecordsScreen from '../screens/medical/MedicalRecordsScreen';
import MedicalRecordDetailScreen from '../screens/medical/MedicalRecordDetailScreen';
import MyPageScreen from '../screens/profile/MyPageScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationsScreen from '../screens/notification/NotificationsScreen';
import AboutScreen from '../screens/info/AboutScreen';
import ContactScreen from '../screens/info/ContactScreen';

// 관리자 화면 import
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import HospitalManagementScreen from '../screens/admin/HospitalManagementScreen';
import SystemSettingsScreen from '../screens/admin/SystemSettingsScreen';
import UserDetailScreen from '../screens/admin/UserDetailScreen';
import UserEditScreen from '../screens/admin/UserEditScreen';
import HospitalEditScreen from '../screens/admin/HospitalEditScreen';
import NotificationSendScreen from '../screens/admin/NotificationSendScreen';
import NotificationHistoryScreen from '../screens/admin/NotificationHistoryScreen';
import AnnouncementManagementScreen from '../screens/admin/AnnouncementManagementScreen';
import FAQManagementScreen from '../screens/admin/FAQManagementScreen';
import InquiryManagementScreen from '../screens/admin/InquiryManagementScreen';
import AnnouncementEditScreen from '../screens/admin/AnnouncementEditScreen';
import FAQEditScreen from '../screens/admin/FAQEditScreen';

// 사용자 정보 화면 import
import AnnouncementScreen from '../screens/info/AnnouncementScreen';
import FAQScreen from '../screens/info/FAQScreen';
import InquiryScreen from '../screens/info/InquiryScreen';

// 인증 컨텍스트 import (나중에 생성할 예정)
import { useAuth } from '../contexts/AuthContext';

// 네비게이터 생성
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// 탭 네비게이터 컴포넌트 (환자/의사용)
const PatientTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'HospitalFinder') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Reservations') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'MedicalRecords') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'MyPage') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          headerTitle: 'DoctorLink',
        }}
      />
      <Tab.Screen
        name="HospitalFinder"
        component={HospitalFinderScreen}
        options={{
          tabBarLabel: '병원찾기',
          headerTitle: '병원 찾기',
        }}
      />
      <Tab.Screen
        name="Reservations"
        component={ReservationManagementScreen}
        options={{
          tabBarLabel: '예약관리',
          headerTitle: '예약 관리',
        }}
      />
      <Tab.Screen
        name="MedicalRecords"
        component={MedicalRecordsScreen}
        options={{
          tabBarLabel: '진료기록',
          headerTitle: '진료 기록',
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{
          tabBarLabel: '마이페이지',
          headerTitle: '마이페이지',
        }}
      />
    </Tab.Navigator>
  );
};

// 관리자 전용 탭 네비게이터
const AdminTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'AdminDashboard') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'UserManagement') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'HospitalManagement') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'SystemSettings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'MyPage') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF3B30', // 관리자는 빨간색 테마
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#FF3B30', // 관리자는 빨간색 헤더
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: '대시보드',
          headerTitle: '관리자 대시보드',
        }}
      />
      <Tab.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{
          tabBarLabel: '사용자관리',
          headerTitle: '사용자 관리',
        }}
      />
      <Tab.Screen
        name="HospitalManagement"
        component={HospitalManagementScreen}
        options={{
          tabBarLabel: '병원관리',
          headerTitle: '병원 관리',
        }}
      />
      <Tab.Screen
        name="SystemSettings"
        component={SystemSettingsScreen}
        options={{
          tabBarLabel: '시스템설정',
          headerTitle: '시스템 설정',
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{
          tabBarLabel: '마이페이지',
          headerTitle: '관리자 페이지',
        }}
      />
    </Tab.Navigator>
  );
};

// 역할별 탭 네비게이터 선택
const TabNavigator: React.FC = () => {
  const { user } = useAuth();
  
  // 관리자인 경우 관리자 전용 탭 네비게이터 반환
  if (user?.role === 'admin') {
    return <AdminTabNavigator />;
  }
  
  // 일반 사용자(환자/의사)인 경우 기본 탭 네비게이터 반환
  return <PatientTabNavigator />;
};

// 인증되지 않은 사용자용 스택
const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerTitle: '로그인',
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerTitle: '회원가입',
        }}
      />
    </Stack.Navigator>
  );
};

// 인증된 사용자용 스택
const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* 병원 관련 화면 */}
      <Stack.Screen
        name="HospitalDetail"
        component={HospitalDetailScreen}
        options={{
          headerTitle: '병원 정보',
        }}
      />
      
      {/* 예약 관련 화면 */}
      <Stack.Screen
        name="Reservation"
        component={ReservationScreen}
        options={{
          headerTitle: '예약하기',
        }}
      />
      <Stack.Screen
        name="ReservationDetail"
        component={ReservationDetailScreen}
        options={{
          headerTitle: '예약 상세',
        }}
      />
      
      {/* 의료 기록 관련 화면 */}
      <Stack.Screen
        name="MedicalRecordDetail"
        component={MedicalRecordDetailScreen}
        options={{
          headerTitle: '진료 기록 상세',
        }}
      />
      
      {/* 프로필 관련 화면 */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: '프로필 수정',
        }}
      />
      
      {/* 알림 화면 */}
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerTitle: '알림',
        }}
      />
      
      {/* 정보 화면들 */}
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerTitle: 'DoctorLink 소개',
        }}
      />
      <Stack.Screen
        name="Contact"
        component={ContactScreen}
        options={{
          headerTitle: '문의하기',
        }}
      />
      
      {/* 사용자 정보 화면들 */}
      <Stack.Screen
        name="AnnouncementScreen"
        component={AnnouncementScreen}
        options={{
          headerTitle: '공지사항',
        }}
      />
      <Stack.Screen
        name="FAQScreen"
        component={FAQScreen}
        options={{
          headerTitle: 'FAQ',
        }}
      />
      <Stack.Screen
        name="InquiryScreen"
        component={InquiryScreen}
        options={{
          headerTitle: '1:1 문의',
        }}
      />
      
      {/* 관리자 전용 화면들 */}
      <Stack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="UserEdit"
        component={UserEditScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HospitalEdit"
        component={HospitalEditScreen}
        options={{
          headerTitle: '병원 정보 관리',
          headerStyle: {
            backgroundColor: '#FF3B30',
          },
          headerTintColor: 'white',
        }}
      />
      
      {/* 관리자 알림 및 고객 지원 화면들 */}
      <Stack.Screen
        name="NotificationSend"
        component={NotificationSendScreen}
        options={{
          headerTitle: '알림 발송',
          headerStyle: {
            backgroundColor: '#FF3B30',
          },
          headerTintColor: 'white',
        }}
      />
      <Stack.Screen
        name="NotificationHistory"
        component={NotificationHistoryScreen}
        options={{
          headerTitle: '알림 이력',
          headerStyle: {
            backgroundColor: '#FF3B30',
          },
          headerTintColor: 'white',
        }}
      />
      <Stack.Screen
        name="AnnouncementManagement"
        component={AnnouncementManagementScreen}
        options={{
          headerTitle: '공지사항 관리',
          headerStyle: {
            backgroundColor: '#FF3B30',
          },
          headerTintColor: 'white',
        }}
      />
      <Stack.Screen
        name="AnnouncementEdit"
        component={AnnouncementEditScreen}
        options={{
          headerTitle: '공지사항 등록/수정',
          headerStyle: {
            backgroundColor: '#FF3B30',
          },
          headerTintColor: 'white',
        }}
      />
      <Stack.Screen
        name="FAQManagement"
        component={FAQManagementScreen}
        options={{
          headerTitle: 'FAQ 관리',
          headerStyle: {
            backgroundColor: '#FF3B30',
          },
          headerTintColor: 'white',
        }}
      />
      <Stack.Screen
        name="FAQEdit"
        component={FAQEditScreen}
        options={{
          headerTitle: 'FAQ 등록/수정',
          headerStyle: {
            backgroundColor: '#FF3B30',
          },
          headerTintColor: 'white',
        }}
      />
      <Stack.Screen
        name="InquiryManagement"
        component={InquiryManagementScreen}
        options={{
          headerTitle: '문의 관리',
          headerStyle: {
            backgroundColor: '#FF3B30',
          },
          headerTintColor: 'white',
        }}
      />
      <Stack.Screen
        name="InquiryDetail"
        component={InquiryScreen}
        options={{
          headerTitle: '문의 상세',
          headerStyle: {
            backgroundColor: '#FF3B30',
          },
          headerTintColor: 'white',
        }}
      />
    </Stack.Navigator>
  );
};

// 메인 앱 네비게이터
const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  // 로딩 중일 때는 스플래시 화면을 보여줄 수 있음
  if (isLoading) {
    return null; // 또는 로딩 스피너 컴포넌트
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator; 