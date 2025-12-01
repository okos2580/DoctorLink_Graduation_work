import { 
  Reservation, 
  CreateReservationRequest,
  ReservationFilter,
  ApiResponse,
  PaginatedResponse 
} from '../types';
import { get, post, put, del } from './api';

// 예약 서비스 클래스
class ReservationService {
  // 예약 생성
  async createReservation(reservationData: CreateReservationRequest): Promise<ApiResponse<Reservation>> {
    try {
      // Mock 예약 생성
      const newReservation: Reservation = {
        id: `reservation-${Date.now()}`,
        patientId: 'user-001', // 현재 사용자 ID
        patientName: '김환자',
        doctorId: reservationData.doctorId,
        doctorName: '이의사', // 실제로는 doctorId로 조회해야 함
        hospitalId: reservationData.hospitalId,
        hospitalName: '서울대학교병원', // 실제로는 hospitalId로 조회해야 함
        date: reservationData.date,
        time: reservationData.time,
        department: '내과', // 실제로는 의사 정보에서 가져와야 함
        status: 'pending',
        reason: reservationData.reason,
        notes: reservationData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 성공 응답 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 지연

      return {
        success: true,
        message: '예약이 성공적으로 생성되었습니다.',
        data: newReservation
      };
    } catch (error: any) {
      console.error('예약 생성 오류:', error);
      return {
        success: false,
        message: error.message || '예약 생성에 실패했습니다.',
      };
    }
  }

  // 사용자 예약 목록 조회
  async getUserReservations(filter?: ReservationFilter): Promise<ApiResponse<Reservation[]>> {
    try {
      // Mock 예약 데이터 생성
      const mockReservations = this.generateMockReservations(5);
      let filteredReservations = mockReservations;
      
      // 필터 적용
      if (filter?.status) {
        filteredReservations = filteredReservations.filter(r => r.status === filter.status);
      }
      
      if (filter?.date) {
        filteredReservations = filteredReservations.filter(r => r.date === filter.date);
      }
      
      if (filter?.doctorId) {
        filteredReservations = filteredReservations.filter(r => r.doctorId === filter.doctorId);
      }

      return {
        success: true,
        message: '예약 목록을 성공적으로 불러왔습니다.',
        data: filteredReservations
      };
    } catch (error: any) {
      console.error('사용자 예약 목록 조회 오류:', error);
      return {
        success: false,
        message: error.message || '예약 목록을 불러오는데 실패했습니다.',
        data: [],
      };
    }
  }

  // 예약 상세 정보 조회
  async getReservationById(reservationId: string): Promise<ApiResponse<Reservation>> {
    try {
      const response = await get<Reservation>(`/reservations/${reservationId}`);
      return response;
    } catch (error: any) {
      console.error('예약 상세 정보 조회 오류:', error);
      return {
        success: false,
        message: error.message || '예약 정보를 불러오는데 실패했습니다.',
      };
    }
  }

  // 예약 수정
  async updateReservation(
    reservationId: string, 
    updateData: Partial<CreateReservationRequest>
  ): Promise<ApiResponse<Reservation>> {
    try {
      const response = await put<Reservation>(`/reservations/${reservationId}`, updateData);
      return response;
    } catch (error: any) {
      console.error('예약 수정 오류:', error);
      return {
        success: false,
        message: error.message || '예약 수정에 실패했습니다.',
      };
    }
  }

  // 예약 취소
  async cancelReservation(reservationId: string, reason?: string): Promise<ApiResponse> {
    try {
      const response = await put(`/reservations/${reservationId}/cancel`, { reason });
      return response;
    } catch (error: any) {
      console.error('예약 취소 오류:', error);
      return {
        success: false,
        message: error.message || '예약 취소에 실패했습니다.',
      };
    }
  }

  // 예약 삭제
  async deleteReservation(reservationId: string): Promise<ApiResponse> {
    try {
      const response = await del(`/reservations/${reservationId}`);
      return response;
    } catch (error: any) {
      console.error('예약 삭제 오류:', error);
      return {
        success: false,
        message: error.message || '예약 삭제에 실패했습니다.',
      };
    }
  }

  // 의사별 예약 가능한 시간 조회
  async getAvailableTimeSlots(
    doctorId: string,
    date: string
  ): Promise<ApiResponse<string[]>> {
    try {
      const response = await get<string[]>(`/reservations/available-times`, {
        doctorId,
        date,
      });
      return response;
    } catch (error: any) {
      console.error('예약 가능 시간 조회 오류:', error);
      return {
        success: false,
        message: error.message || '예약 가능 시간을 불러오는데 실패했습니다.',
        data: [],
      };
    }
  }

  // 병원별 예약 가능한 날짜 조회
  async getAvailableDates(
    hospitalId: string,
    doctorId?: string
  ): Promise<ApiResponse<string[]>> {
    try {
      const params: any = { hospitalId };
      if (doctorId) params.doctorId = doctorId;
      
      const response = await get<string[]>('/reservations/available-dates', params);
      return response;
    } catch (error: any) {
      console.error('예약 가능 날짜 조회 오류:', error);
      return {
        success: false,
        message: error.message || '예약 가능 날짜를 불러오는데 실패했습니다.',
        data: [],
      };
    }
  }

  // 예약 확인/승인 (의사용)
  async confirmReservation(reservationId: string): Promise<ApiResponse> {
    try {
      const response = await put(`/reservations/${reservationId}/confirm`);
      return response;
    } catch (error: any) {
      console.error('예약 확인 오류:', error);
      return {
        success: false,
        message: error.message || '예약 확인에 실패했습니다.',
      };
    }
  }

  // 예약 거부 (의사용)
  async rejectReservation(reservationId: string, reason: string): Promise<ApiResponse> {
    try {
      const response = await put(`/reservations/${reservationId}/reject`, { reason });
      return response;
    } catch (error: any) {
      console.error('예약 거부 오류:', error);
      return {
        success: false,
        message: error.message || '예약 거부에 실패했습니다.',
      };
    }
  }

  // 예약 완료 처리 (의사용)
  async completeReservation(reservationId: string, notes?: string): Promise<ApiResponse> {
    try {
      const response = await put(`/reservations/${reservationId}/complete`, { notes });
      return response;
    } catch (error: any) {
      console.error('예약 완료 처리 오류:', error);
      return {
        success: false,
        message: error.message || '예약 완료 처리에 실패했습니다.',
      };
    }
  }

  // 의사별 예약 목록 조회 (의사용)
  async getDoctorReservations(
    doctorId: string,
    filter?: ReservationFilter
  ): Promise<ApiResponse<Reservation[]>> {
    try {
      const response = await get<Reservation[]>(`/reservations/doctor/${doctorId}`, filter);
      return response;
    } catch (error: any) {
      console.error('의사 예약 목록 조회 오류:', error);
      return {
        success: false,
        message: error.message || '예약 목록을 불러오는데 실패했습니다.',
        data: [],
      };
    }
  }

  // 병원별 예약 목록 조회 (병원 관리자용)
  async getHospitalReservations(
    hospitalId: string,
    filter?: ReservationFilter
  ): Promise<ApiResponse<Reservation[]>> {
    try {
      const response = await get<Reservation[]>(`/reservations/hospital/${hospitalId}`, filter);
      return response;
    } catch (error: any) {
      console.error('병원 예약 목록 조회 오류:', error);
      return {
        success: false,
        message: error.message || '예약 목록을 불러오는데 실패했습니다.',
        data: [],
      };
    }
  }

  // =================== 유틸리티 메서드 ===================

  // 예약 상태별 필터링
  filterReservationsByStatus(reservations: Reservation[], status: string): Reservation[] {
    return reservations.filter(reservation => reservation.status === status);
  }

  // 예약 날짜별 정렬
  sortReservationsByDate(reservations: Reservation[], ascending: boolean = true): Reservation[] {
    return [...reservations].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return ascending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
  }

  // 예약 취소 가능 여부 확인
  canCancelReservation(reservation: Reservation): boolean {
    const reservationDateTime = new Date(`${reservation.date} ${reservation.time}`);
    const now = new Date();
    const hoursDiff = (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // 예약 시간 24시간 전까지만 취소 가능
    return hoursDiff > 24 && ['pending', 'approved'].includes(reservation.status);
  }

  // 예약 수정 가능 여부 확인
  canModifyReservation(reservation: Reservation): boolean {
    const reservationDateTime = new Date(`${reservation.date} ${reservation.time}`);
    const now = new Date();
    const hoursDiff = (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // 예약 시간 48시간 전까지만 수정 가능
    return hoursDiff > 48 && reservation.status === 'pending';
  }

  // 예약 상태 텍스트 변환
  getReservationStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      pending: '대기중',
      approved: '승인됨',
      rejected: '거부됨',
      completed: '완료',
      cancelled: '취소됨',
    };
    return statusMap[status] || status;
  }

  // 예약 상태 색상 반환
  getReservationStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      pending: '#FFA500',    // 주황색
      approved: '#4CAF50',   // 초록색
      rejected: '#F44336',   // 빨간색
      completed: '#2196F3',  // 파란색
      cancelled: '#9E9E9E',  // 회색
    };
    return colorMap[status] || '#9E9E9E';
  }

  // 시간 형식 변환 (24시간 -> 12시간)
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 < 12 ? '오전' : '오후';
    return `${ampm} ${hour12}:${minutes}`;
  }

  // 날짜 형식 변환
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
  }

  // Mock 데이터 생성 (개발용)
  generateMockReservations(count: number = 10): Reservation[] {
    const mockReservations: Reservation[] = [];
    const statuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    const departments = ['내과', '외과', '정형외과', '피부과', '안과'];
    const reasons = [
      '정기 검진',
      '복통 증상',
      '두통 지속',
      '피부 트러블',
      '시력 검사',
      '무릎 통증',
      '감기 증상',
    ];

    for (let i = 1; i <= count; i++) {
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 30) - 15); // 15일 전후
      
      mockReservations.push({
        id: `res-${i.toString().padStart(3, '0')}`,
        patientId: `pat-${i.toString().padStart(3, '0')}`,
        patientName: `환자${i}`,
        doctorId: `doc-${(i % 5 + 1).toString().padStart(3, '0')}`,
        doctorName: `의사${i % 5 + 1}`,
        hospitalId: `hosp-${(i % 3 + 1).toString().padStart(3, '0')}`,
        hospitalName: `병원${i % 3 + 1}`,
        date: date.toISOString().split('T')[0],
        time: `${9 + (i % 8)}:${(i % 2) * 30 || '00'}`,
        department: departments[i % departments.length],
        status: statuses[i % statuses.length] as any,
        reason: reasons[i % reasons.length],
        notes: i % 3 === 0 ? `진료 노트 ${i}` : undefined,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return mockReservations;
  }

  // 예약 알림 설정
  async setReservationReminder(
    reservationId: string,
    reminderMinutes: number
  ): Promise<ApiResponse> {
    try {
      const response = await post(`/reservations/${reservationId}/reminder`, {
        reminderMinutes,
      });
      return response;
    } catch (error: any) {
      console.error('예약 알림 설정 오류:', error);
      return {
        success: false,
        message: error.message || '알림 설정에 실패했습니다.',
      };
    }
  }

  // 예약 피드백 제출
  async submitReservationFeedback(
    reservationId: string,
    feedback: {
      rating: number;
      comment: string;
    }
  ): Promise<ApiResponse> {
    try {
      const response = await post(`/reservations/${reservationId}/feedback`, feedback);
      return response;
    } catch (error: any) {
      console.error('예약 피드백 제출 오류:', error);
      return {
        success: false,
        message: error.message || '피드백 제출에 실패했습니다.',
      };
    }
  }
}

// 싱글톤 인스턴스 생성
const reservationService = new ReservationService();

export default reservationService; 