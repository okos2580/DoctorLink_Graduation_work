import { apiRequest } from './api';

// 예약 상태 타입
export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

// 예약 정보 타입
export interface Reservation {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  hospitalName: string;
  doctorName: string;
  department: string;
  reservationDate: string;
  reservationTime: string;
  status: ReservationStatus;
  symptoms: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 예약 필터 타입
export interface ReservationFilter {
  status?: ReservationStatus;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  hospitalId?: string;
  doctorId?: string;
}

// 예약 목록 조회
export const getReservations = async (filter?: ReservationFilter): Promise<Reservation[]> => {
  // 개발 환경에서는 mock 데이터 반환
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockReservations: Reservation[] = [
          {
            id: 'res-001',
            patientName: '김철수',
            patientPhone: '010-1234-5678',
            patientEmail: 'kim@email.com',
            hospitalName: '서울대학교병원',
            doctorName: '이영희',
            department: '내과',
            reservationDate: '2024-01-15',
            reservationTime: '14:00',
            status: 'pending',
            symptoms: '감기 증상, 발열',
            createdAt: '2024-01-10T09:00:00Z',
            updatedAt: '2024-01-10T09:00:00Z'
          },
          {
            id: 'res-002',
            patientName: '박영수',
            patientPhone: '010-2345-6789',
            patientEmail: 'park@email.com',
            hospitalName: '연세대학교병원',
            doctorName: '김민수',
            department: '정형외과',
            reservationDate: '2024-01-16',
            reservationTime: '10:30',
            status: 'approved',
            symptoms: '무릎 통증',
            createdAt: '2024-01-11T10:30:00Z',
            updatedAt: '2024-01-11T15:20:00Z'
          },
          {
            id: 'res-003',
            patientName: '최지영',
            patientPhone: '010-3456-7890',
            patientEmail: 'choi@email.com',
            hospitalName: '고려대학교병원',
            doctorName: '정수진',
            department: '피부과',
            reservationDate: '2024-01-17',
            reservationTime: '16:00',
            status: 'completed',
            symptoms: '피부 트러블',
            createdAt: '2024-01-12T14:15:00Z',
            updatedAt: '2024-01-17T16:30:00Z'
          },
          {
            id: 'res-004',
            patientName: '이민호',
            patientPhone: '010-4567-8901',
            patientEmail: 'lee@email.com',
            hospitalName: '삼성서울병원',
            doctorName: '홍길동',
            department: '안과',
            reservationDate: '2024-01-18',
            reservationTime: '11:00',
            status: 'rejected',
            symptoms: '시력 저하',
            notes: '예약 시간 중복으로 인한 거절',
            createdAt: '2024-01-13T11:00:00Z',
            updatedAt: '2024-01-13T11:30:00Z'
          },
          {
            id: 'res-005',
            patientName: '송미영',
            patientPhone: '010-5678-9012',
            patientEmail: 'song@email.com',
            hospitalName: '아산병원',
            doctorName: '윤서연',
            department: '산부인과',
            reservationDate: '2024-01-19',
            reservationTime: '15:30',
            status: 'pending',
            symptoms: '정기 검진',
            createdAt: '2024-01-14T13:45:00Z',
            updatedAt: '2024-01-14T13:45:00Z'
          }
        ];

        // 필터 적용
        let filteredReservations = mockReservations;
        
        if (filter?.status) {
          filteredReservations = filteredReservations.filter(r => r.status === filter.status);
        }
        
        if (filter?.searchTerm) {
          const searchTerm = filter.searchTerm.toLowerCase();
          filteredReservations = filteredReservations.filter(r => 
            r.patientName.toLowerCase().includes(searchTerm) ||
            r.hospitalName.toLowerCase().includes(searchTerm) ||
            r.doctorName.toLowerCase().includes(searchTerm) ||
            r.department.toLowerCase().includes(searchTerm)
          );
        }

        resolve(filteredReservations);
      }, 800);
    });
  }

  const queryParams = new URLSearchParams();
  if (filter?.status) queryParams.append('status', filter.status);
  if (filter?.searchTerm) queryParams.append('search', filter.searchTerm);
  if (filter?.startDate) queryParams.append('startDate', filter.startDate);
  if (filter?.endDate) queryParams.append('endDate', filter.endDate);
  if (filter?.hospitalId) queryParams.append('hospitalId', filter.hospitalId);
  if (filter?.doctorId) queryParams.append('doctorId', filter.doctorId);

  const response = await apiRequest<Reservation[]>(`/admin/reservations?${queryParams.toString()}`);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || '예약 목록을 불러오는데 실패했습니다.');
};

// 예약 상태 변경
export const updateReservationStatus = async (
  reservationId: string, 
  status: ReservationStatus, 
  notes?: string
): Promise<void> => {
  // 개발 환경에서는 성공 시뮬레이션
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`예약 ${reservationId} 상태를 ${status}로 변경`);
        resolve();
      }, 500);
    });
  }

  const response = await apiRequest(
    `/admin/reservations/${reservationId}/status`,
    'PUT',
    { status, notes }
  );
  
  if (!response.success) {
    throw new Error(response.error || '예약 상태 변경에 실패했습니다.');
  }
};

// 예약 상세 정보 조회
export const getReservationDetail = async (reservationId: string): Promise<Reservation> => {
  // 개발 환경에서는 mock 데이터 반환
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockReservation: Reservation = {
          id: reservationId,
          patientName: '김철수',
          patientPhone: '010-1234-5678',
          patientEmail: 'kim@email.com',
          hospitalName: '서울대학교병원',
          doctorName: '이영희',
          department: '내과',
          reservationDate: '2024-01-15',
          reservationTime: '14:00',
          status: 'pending',
          symptoms: '감기 증상, 발열, 목 아픔',
          notes: '환자가 요청한 특별 사항: 오후 시간 선호',
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-10T09:00:00Z'
        };
        resolve(mockReservation);
      }, 600);
    });
  }

  const response = await apiRequest<Reservation>(`/admin/reservations/${reservationId}`);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || '예약 정보를 불러오는데 실패했습니다.');
};

// 예약 삭제
export const deleteReservation = async (reservationId: string): Promise<void> => {
  // 개발 환경에서는 성공 시뮬레이션
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`예약 ${reservationId} 삭제 완료`);
        resolve();
      }, 500);
    });
  }

  const response = await apiRequest(`/admin/reservations/${reservationId}`, 'DELETE');
  if (!response.success) {
    throw new Error(response.error || '예약 삭제에 실패했습니다.');
  }
}; 