// DoctorLink 백엔드 타입 정의

import { Request } from 'express';

// =================== 기본 타입 ===================

export type UserRole = 'patient' | 'doctor' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type HospitalStatus = 'active' | 'inactive' | 'pending';
export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
export type Gender = 'male' | 'female';

// =================== 데이터베이스 모델 타입 ===================

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  birthDate: string;
  gender: Gender;
  address?: string;
  role: UserRole;
  status: UserStatus;
  profileImage?: string;
  registrationDate: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalInfo {
  id: string;
  userId: string;
  bloodType?: string;
  allergies?: string[]; // JSON으로 저장
  medications?: string[]; // JSON으로 저장
  medicalHistory?: string[]; // JSON으로 저장
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  type: string;
  departments: string[]; // JSON으로 저장
  operatingHours: OperatingHours; // JSON으로 저장
  status: HospitalStatus;
  description?: string;
  facilities: string[]; // JSON으로 저장
  rating: number;
  reviewCount: number;
  latitude?: number;
  longitude?: number;
  image?: string;
  registrationDate: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperatingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface Doctor {
  id: string;
  userId: string;
  hospitalId?: string;
  licenseNumber: string;
  department: string;
  specialization: string;
  experience: number;
  education?: string;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  // 조인된 데이터
  user?: User;
  hospital?: Hospital;
}

export interface Reservation {
  id: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  reservationDate: string;
  reservationTime: string;
  department: string;
  status: ReservationStatus;
  reason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // 조인된 데이터
  patient?: User;
  doctor?: Doctor;
  hospital?: Hospital;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  reservationId?: string;
  recordDate: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  notes?: string;
  attachments?: string[]; // JSON으로 저장
  createdAt: Date;
  updatedAt: Date;
  // 조인된 데이터
  patient?: User;
  doctor?: Doctor;
  reservation?: Reservation;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: Date;
  readAt?: Date;
  // 조인된 데이터
  user?: User;
}

export interface Review {
  id: string;
  patientId: string;
  doctorId?: string;
  hospitalId?: string;
  reservationId?: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  // 조인된 데이터
  patient?: User;
  doctor?: Doctor;
  hospital?: Hospital;
  reservation?: Reservation;
}

export interface FileUpload {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  relatedTable?: string;
  relatedId?: string;
  createdAt: Date;
  // 조인된 데이터
  user?: User;
}

// =================== API 요청/응답 타입 ===================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

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

export interface ValidationError {
  field: string;
  message: string;
}

// =================== 인증 관련 타입 ===================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  birthDate: string;
  gender: Gender;
  address?: string;
  role?: UserRole;
}

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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// =================== 필터 및 쿼리 타입 ===================

export interface UserFilter {
  role?: UserRole;
  status?: UserStatus;
  searchTerm?: string;
  hospitalId?: string;
  department?: string;
}

export interface HospitalFilter {
  status?: HospitalStatus;
  type?: string;
  searchTerm?: string;
  department?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface ReservationFilter {
  status?: ReservationStatus;
  date?: string;
  doctorId?: string;
  patientId?: string;
  hospitalId?: string;
  department?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// =================== Express 확장 타입 ===================

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

// =================== 서비스 응답 타입 ===================

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// =================== 데이터베이스 쿼리 타입 ===================

export interface QueryResult<T = any> {
  recordset: T[];
  recordsets: T[][];
  output: any;
  rowsAffected: number[];
}

// =================== 파일 업로드 타입 ===================

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// =================== 이메일 관련 타입 ===================

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// =================== 통계 관련 타입 ===================

export interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalHospitals: number;
  totalReservations: number;
  todayReservations: number;
  pendingReservations: number;
  completedReservations: number;
  activeUsers: number;
}

export interface HospitalStats {
  totalReservations: number;
  todayReservations: number;
  completedReservations: number;
  averageRating: number;
  totalReviews: number;
  departmentStats: Array<{
    department: string;
    count: number;
  }>;
}

// =================== 검색 관련 타입 ===================

export interface SearchOptions {
  keyword?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  category?: string;
  type?: string;
  sort?: 'distance' | 'rating' | 'name';
  limit?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}



















