import { apiRequest } from './api';

// 사용자 역할 타입
export type UserRole = 'patient' | 'doctor' | 'admin';

// 사용자 상태 타입
export type UserStatus = 'active' | 'inactive' | 'suspended';

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
  gender: 'male' | 'female';
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

// 사용자 필터 타입
export interface UserFilter {
  role?: UserRole;
  status?: UserStatus;
  searchTerm?: string;
  hospitalId?: string;
  department?: string;
}

// 사용자 프로필 정보 타입
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'male' | 'female';
  address?: string;
  profileImage?: string;
}

// 사용자 예약 정보 타입
export interface UserReservation {
  id: string;
  hospitalName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  reason?: string;
  notes?: string;
}

// 사용자 목록 조회
export const getUsers = async (filter?: UserFilter): Promise<User[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filter?.role) queryParams.append('role', filter.role);
    if (filter?.status) queryParams.append('status', filter.status);
    if (filter?.searchTerm) queryParams.append('search', filter.searchTerm);
    if (filter?.hospitalId) queryParams.append('hospitalId', filter.hospitalId);
    if (filter?.department) queryParams.append('department', filter.department);

    const response = await fetch(`/api/admin/users?${queryParams.toString()}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || '사용자 목록을 불러오는데 실패했습니다.');
    }
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    return [];
  }
};

// 사용자 프로필 조회
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('사용자 프로필 조회 오류:', error);
    return null;
  }
};

// 사용자 예약 목록 조회
export const getUserReservations = async (): Promise<UserReservation[]> => {
  try {
    const response = await fetch('/api/user/reservations', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('사용자 예약 목록 조회 오류:', error);
    return [];
  }
};

// 병원 목록 조회 (사용자용)
export const getHospitals = async (filters?: {
  search?: string;
  department?: string;
  location?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.location) params.append('location', filters.location);

    const response = await fetch(`/api/hospitals?${params.toString()}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('병원 목록 조회 오류:', error);
    return [];
  }
};

// 사용자 상태 변경
export const updateUserStatus = async (userId: string, status: UserStatus): Promise<void> => {
  try {
    const response = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || '사용자 상태 변경에 실패했습니다.');
    }
  } catch (error) {
    console.error('사용자 상태 변경 오류:', error);
    throw error;
  }
};

// 사용자 상세 정보 조회
export const getUserDetail = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || '사용자 정보를 불러오는데 실패했습니다.');
    }
  } catch (error) {
    console.error('사용자 상세 정보 조회 오류:', error);
    throw error;
  }
};

// 사용자 정보 수정
export const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || '사용자 정보 수정에 실패했습니다.');
    }
  } catch (error) {
    console.error('사용자 정보 수정 오류:', error);
    throw error;
  }
};

// 사용자 삭제
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || '사용자 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('사용자 삭제 오류:', error);
    throw error;
  }
};

// 사용자 역할 변경
export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
  try {
    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role })
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || '사용자 역할 변경에 실패했습니다.');
    }
  } catch (error) {
    console.error('사용자 역할 변경 오류:', error);
    throw error;
  }
}; 