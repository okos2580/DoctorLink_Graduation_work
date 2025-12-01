// DoctorLink 모바일 앱 타입 정의

// =================== 기본 타입 ===================

// 사용자 역할 타입
export type UserRole = 'patient' | 'doctor' | 'admin';

// 사용자 상태 타입
export type UserStatus = 'active' | 'inactive' | 'suspended';

// 병원 상태 타입
export type HospitalStatus = 'active' | 'inactive' | 'pending';

// 예약 상태 타입
export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

// 성별 타입
export type Gender = 'male' | 'female';

// =================== 사용자 관련 타입 ===================

// 의료 정보 타입
export interface MedicalInfo {
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// 사용자 정보 타입
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  birthDate: string;
  gender: Gender;
  address: string;
  role: UserRole;
  status: UserStatus;
  registrationDate: string;
  lastLogin?: string;
  profileImage?: string;
  medicalInfo?: MedicalInfo;
  // 의사 전용 필드
  licenseNumber?: string;
  specialization?: string;
  hospitalId?: string;
  hospitalName?: string;
  department?: string;
  experience?: number;
  education?: string;
}

// 사용자 프로필 정보 타입
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: Gender;
  address?: string;
  profileImage?: string;
}

// 사용자 필터 타입
export interface UserFilter {
  role?: UserRole;
  status?: UserStatus;
  searchTerm?: string;
  hospitalId?: string;
  department?: string;
}

// =================== 의사 관련 타입 ===================

// 의사 정보 타입
export interface Doctor {
  id: string;
  name: string;
  department: string;
  specialization: string;
  experience: number;
  education: string;
  phone: string;
  email: string;
  profileImage?: string;
  rating?: number;
  reviewCount?: number;
  hospitalId?: string;
  hospitalName?: string;
  licenseNumber?: string;
}

// =================== 병원 관련 타입 ===================

// 운영시간 타입
export interface OperatingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

// 병원 정보 타입
export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  type: string;
  departments: string[];
  doctors: Doctor[];
  operatingHours: OperatingHours;
  status: HospitalStatus;
  registrationDate: string;
  lastUpdated: string;
  description: string;
  facilities: string[];
  rating: number;
  reviewCount: number;
  latitude?: number;
  longitude?: number;
  distance?: number;
  image?: string;
}

// 병원 필터 타입
export interface HospitalFilter {
  status?: HospitalStatus;
  type?: string;
  searchTerm?: string;
  department?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  radius?: number;
}

// 검색 옵션 타입
export interface SearchOptions {
  keyword?: string;
  latitude?: number;
  longitude?: number;
  location?: { latitude: number; longitude: number };
  radius?: number;
  category?: string;
  type?: string;
  sort?: 'distance' | 'accuracy' | 'rating';
  limit?: number;
}

// =================== 예약 관련 타입 ===================

// 예약 정보 타입
export interface Reservation {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  date: string;
  time: string;
  department: string;
  status: ReservationStatus;
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 예약 필터 타입
export interface ReservationFilter {
  status?: ReservationStatus;
  date?: string;
  doctorId?: string;
  patientId?: string;
  hospitalId?: string;
  department?: string;
}

// 예약 생성 요청 타입
export interface CreateReservationRequest {
  doctorId: string;
  hospitalId: string;
  date: string;
  time: string;
  reason: string;
  notes?: string;
}

// =================== 의료 기록 관련 타입 ===================

// 의료 기록 타입
export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  date: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// =================== 인증 관련 타입 ===================

// 로그인 요청 타입
export interface LoginRequest {
  username: string;
  password: string;
}

// 로그인 응답 타입
export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// 회원가입 요청 타입
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: Gender;
}

// 카카오 로그인 요청 타입
export interface KakaoLoginRequest {
  accessToken: string;
  userInfo: {
    id: number;
    kakao_account: {
      email?: string;
      profile?: {
        nickname?: string;
        profile_image_url?: string;
      };
    };
  };
}

// =================== API 응답 타입 ===================

// 기본 API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =================== 알림 관련 타입 ===================

// 알림 타입
export type NotificationType = 'general' | 'reservation' | 'announcement' | 'emergency' | 'event';

// 알림 정보 타입
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  receiverId?: string;
  receiverType?: 'all' | 'patients' | 'doctors' | 'specific';
  isRead: boolean;
  sentAt: string;
  sentBy: string;
  sentByName: string;
  targetUsers?: string[];
}

// 알림 발송 요청 타입
export interface SendNotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  receiverType: 'all' | 'patients' | 'doctors' | 'specific';
  targetUsers?: string[];
}

// =================== 공지사항 관련 타입 ===================

// 공지사항 타입
export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorName: string;
  category: 'notice' | 'update' | 'maintenance' | 'event';
  isPinned: boolean;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// =================== FAQ 관련 타입 ===================

// FAQ 카테고리 타입
export type FAQCategory = 'general' | 'reservation' | 'account' | 'payment' | 'technical';

// FAQ 타입
export interface FAQ {
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// =================== 문의 관련 타입 ===================

// 문의 상태 타입
export type InquiryStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

// 문의 타입
export interface Inquiry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  content: string;
  category: string;
  status: InquiryStatus;
  reply?: string;
  repliedBy?: string;
  repliedByName?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// =================== 네비게이션 관련 타입 ===================

// 스택 네비게이션 파라미터 타입
export type RootStackParamList = {
  // 인증 관련
  Login: undefined;
  Register: undefined;
  
  // 메인 탭
  MainTabs: undefined;
  
  // 홈 관련
  Home: undefined;
  
  // 병원 관련
  HospitalFinder: undefined;
  HospitalDetail: { hospitalId: string };
  
  // 예약 관련
  Reservation: { hospitalId?: string; doctorId?: string; reservationId?: string };
  ReservationDetail: { reservationId: string };
  ReservationManagement: undefined;
  
  // 의료 기록
  MedicalRecords: undefined;
  MedicalRecordDetail: { recordId: string };
  
  // 프로필
  MyPage: undefined;
  Profile: undefined;
  
  // 알림
  Notifications: undefined;
  
  // 기타
  About: undefined;
  Contact: undefined;
  
  // 사용자 정보 화면
  AnnouncementScreen: undefined;
  FAQScreen: undefined;
  InquiryScreen: undefined;
  
  // 관리자 전용
  UserDetail: { userId: string };
  UserEdit: { userId?: string };
  HospitalEdit: { hospitalId?: string };
  NotificationSend: undefined;
  NotificationHistory: undefined;
  AnnouncementManagement: undefined;
  AnnouncementEdit: { announcementId?: string };
  FAQManagement: undefined;
  FAQEdit: { faqId?: string };
  InquiryManagement: undefined;
  InquiryDetail: { inquiryId: string };
};

// 탭 네비게이션 파라미터 타입
export type TabParamList = {
  // 일반 사용자 탭
  Home: undefined;
  HospitalFinder: undefined;
  Reservations: undefined;
  MedicalRecords: undefined;
  MyPage: undefined;
  
  // 관리자 전용 탭
  AdminDashboard: undefined;
  UserManagement: undefined;
  HospitalManagement: undefined;
  SystemSettings: undefined;
};

// =================== 컴포넌트 Props 타입 ===================

// 병원 카드 컴포넌트 Props
export interface HospitalCardProps {
  hospital: Hospital;
  onPress: (hospital: Hospital) => void;
}

// 예약 카드 컴포넌트 Props
export interface ReservationCardProps {
  reservation: Reservation;
  onPress: (reservation: Reservation) => void;
}

// 의사 카드 컴포넌트 Props
export interface DoctorCardProps {
  doctor: Doctor;
  onPress: (doctor: Doctor) => void;
}

// 로딩 상태 타입
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// =================== 상태 관리 타입 ===================

// 인증 컨텍스트 타입
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error?: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  kakaoLogin: (data: KakaoLoginRequest) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<User>;
  clearError: () => void;
  refreshToken: () => Promise<boolean>;
  addAuthListener: (listener: (user: User | null) => void) => void;
  removeAuthListener: (listener: (user: User | null) => void) => void;
  hasPermission: (requiredRole?: string) => boolean;
  isLoggedIn: () => boolean;
  isRole: (role: string) => boolean;
}

// 앱 상태 타입
export interface AppState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  };
  hospitals: {
    list: Hospital[];
    isLoading: boolean;
    error?: string;
  };
  reservations: {
    list: Reservation[];
    isLoading: boolean;
    error?: string;
  };
} 