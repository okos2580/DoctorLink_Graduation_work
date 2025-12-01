import DatabaseService, { Appointment, Doctor, Hospital } from './DatabaseService';
import sql from 'mssql';

/**
 * 예약 관리 서비스 클래스
 * 예약 생성, 조회, 수정, 취소 등의 기능을 제공
 */
export default class AppointmentService {
  /**
   * 의사 일정 확인
   * @param doctorId 의사 ID
   * @param hospitalId 병원 ID
   * @param date 예약 날짜
   * @returns 의사 근무 시간, 예약된 시간, 휴무 여부 정보
   */
  static async checkDoctorAvailability(doctorId: number, hospitalId: number, date: Date): Promise<any> {
    try {
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
      
      const result = await DatabaseService.executeStoredProcedure('usp_CheckDoctorAvailability', {
        DoctorID: doctorId,
        HospitalID: hospitalId,
        AppointmentDate: formattedDate
      });
      
      // 프로시저 결과에서 근무 시간, 이미 예약된 시간, 휴무 여부 추출
      const schedules = result.recordsets && Array.isArray(result.recordsets) ? result.recordsets[0] || [] : [];
      const bookedSlots = result.recordsets && Array.isArray(result.recordsets) && result.recordsets.length > 1 ? result.recordsets[1] || [] : [];
      const isTimeOffRecords = result.recordsets && Array.isArray(result.recordsets) && result.recordsets.length > 2 ? result.recordsets[2] || [] : [];
      const isTimeOff = isTimeOffRecords.length > 0;
      
      return {
        schedules,
        bookedSlots,
        isTimeOff
      };
    } catch (error) {
      console.error('Error checking doctor availability:', error);
      throw error;
    }
  }
  
  /**
   * 사용 가능한 시간대 생성
   * @param doctorId 의사 ID
   * @param hospitalId 병원 ID
   * @param date 예약 날짜
   * @param duration 예약당 소요 시간(분)
   * @returns 예약 가능한 시간대 목록
   */
  static async getAvailableTimeSlots(doctorId: number, hospitalId: number, date: Date, duration: number = 30): Promise<any[]> {
    try {
      const { schedules, bookedSlots, isTimeOff } = await this.checkDoctorAvailability(doctorId, hospitalId, date);
      
      // 휴무일이면 빈 배열 반환
      if (isTimeOff) {
        return [];
      }
      
      // 근무 일정이 없으면 빈 배열 반환
      if (schedules.length === 0) {
        return [];
      }
      
      const schedule = schedules[0]; // 해당 요일의 근무 일정
      const timeSlots = [];
      
      // 시작 시간과 종료 시간을 Date 객체로 변환
      const startTime = new Date(`1970-01-01T${schedule.StartTime.toTimeString().split(' ')[0]}`);
      const endTime = new Date(`1970-01-01T${schedule.EndTime.toTimeString().split(' ')[0]}`);
      
      // 점심 시간이 있는 경우
      let breakStartTime = null;
      let breakEndTime = null;
      
      if (schedule.BreakStartTime && schedule.BreakEndTime) {
        breakStartTime = new Date(`1970-01-01T${schedule.BreakStartTime.toTimeString().split(' ')[0]}`);
        breakEndTime = new Date(`1970-01-01T${schedule.BreakEndTime.toTimeString().split(' ')[0]}`);
      }
      
      // 이미 예약된 시간대
      const bookedTimes = bookedSlots.map((slot: any) => ({
        start: new Date(`1970-01-01T${slot.StartTime.toTimeString().split(' ')[0]}`),
        end: new Date(`1970-01-01T${slot.EndTime.toTimeString().split(' ')[0]}`)
      }));
      
      // 시간대 생성
      let current = new Date(startTime);
      
      while (current < endTime) {
        const slotStart = new Date(current);
        const slotEnd = new Date(current.getTime() + duration * 60000);
        
        // 종료 시간이 근무 종료 시간을 넘어가면 중단
        if (slotEnd > endTime) {
          break;
        }
        
        // 점심 시간과 겹치는지 확인
        const isInBreak = breakStartTime && breakEndTime && 
          ((slotStart >= breakStartTime && slotStart < breakEndTime) || 
           (slotEnd > breakStartTime && slotEnd <= breakEndTime) ||
           (slotStart <= breakStartTime && slotEnd >= breakEndTime));
        
        // 이미 예약된 시간과 겹치는지 확인
        const isBooked = bookedTimes.some((booked: { start: Date; end: Date; }) => 
          (slotStart >= booked.start && slotStart < booked.end) || 
          (slotEnd > booked.start && slotEnd <= booked.end) ||
          (slotStart <= booked.start && slotEnd >= booked.end));
        
        // 점심 시간이나 이미 예약된 시간과 겹치지 않으면 추가
        if (!isInBreak && !isBooked) {
          timeSlots.push({
            startTime: slotStart.toTimeString().substring(0, 5),
            endTime: slotEnd.toTimeString().substring(0, 5),
            available: true
          });
        }
        
        // 다음 시간대로 이동
        current = new Date(current.getTime() + duration * 60000);
      }
      
      return timeSlots;
    } catch (error) {
      console.error('Error getting available time slots:', error);
      throw error;
    }
  }
  
  /**
   * 예약 생성
   * @param patientId 환자 ID
   * @param doctorId 의사 ID
   * @param hospitalId 병원 ID
   * @param date 예약 날짜
   * @param startTime 예약 시작 시간
   * @param endTime 예약 종료 시간
   * @param reason 예약 이유
   * @returns 생성된 예약 ID
   */
  static async createAppointment(
    patientId: number, 
    doctorId: number, 
    hospitalId: number, 
    date: Date, 
    startTime: string, 
    endTime: string, 
    reason?: string
  ): Promise<number> {
    try {
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
      
      const result = await DatabaseService.executeStoredProcedure('usp_CreateAppointment', {
        PatientID: patientId,
        DoctorID: doctorId,
        HospitalID: hospitalId,
        AppointmentDate: formattedDate,
        StartTime: startTime,
        EndTime: endTime,
        Reason: reason
      });
      
      return result.returnValue || result.recordset[0].AppointmentID;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }
  
  /**
   * 환자의 예약 목록 조회
   * @param patientId 환자 ID
   * @param includePast 지난 예약도 포함할지 여부
   * @returns 예약 목록
   */
  static async getPatientAppointments(patientId: number, includePast: boolean = false): Promise<Appointment[]> {
    try {
      const result = await DatabaseService.executeStoredProcedure('usp_GetPatientAppointments', {
        PatientID: patientId,
        IncludePast: includePast ? 1 : 0
      });
      
      return result.recordset;
    } catch (error) {
      console.error('Error getting patient appointments:', error);
      throw error;
    }
  }
  
  /**
   * 의사의 예약 목록 조회
   * @param doctorId 의사 ID
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @param statusId 예약 상태 ID
   * @returns 예약 목록
   */
  static async getDoctorAppointments(
    doctorId: number, 
    startDate: Date, 
    endDate?: Date, 
    statusId?: number
  ): Promise<Appointment[]> {
    try {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : null;
      
      const result = await DatabaseService.executeStoredProcedure('usp_GetDoctorAppointments', {
        DoctorID: doctorId,
        StartDate: formattedStartDate,
        EndDate: formattedEndDate,
        StatusID: statusId
      });
      
      return result.recordset;
    } catch (error) {
      console.error('Error getting doctor appointments:', error);
      throw error;
    }
  }
  
  /**
   * 예약 상태 업데이트
   * @param appointmentId 예약 ID
   * @param statusId 예약 상태 ID
   * @param notes 메모
   * @returns 성공 여부
   */
  static async updateAppointmentStatus(appointmentId: number, statusId: number, notes?: string): Promise<boolean> {
    try {
      const result = await DatabaseService.executeStoredProcedure('usp_UpdateAppointmentStatus', {
        AppointmentID: appointmentId,
        StatusID: statusId,
        Notes: notes
      });
      
      return result.returnValue > 0;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }
  
  /**
   * 병원별 의사 목록 조회
   * @param hospitalId 병원 ID
   * @param specialization 전문 분야
   * @returns 의사 목록
   */
  static async getDoctorsByHospital(hospitalId: number, specialization?: string): Promise<Doctor[]> {
    try {
      const result = await DatabaseService.executeStoredProcedure('usp_GetDoctorsByHospital', {
        HospitalID: hospitalId,
        Specialization: specialization
      });
      
      return result.recordset;
    } catch (error) {
      console.error('Error getting doctors by hospital:', error);
      throw error;
    }
  }
  
  /**
   * 병원 검색
   * @param searchTerm 검색어
   * @param city 도시
   * @param pageNumber 페이지 번호
   * @param pageSize 페이지 크기
   * @returns 병원 목록과 총 개수
   */
  static async searchHospitals(
    searchTerm?: string, 
    city?: string, 
    pageNumber: number = 1, 
    pageSize: number = 10
  ): Promise<{ hospitals: Hospital[], totalCount: number }> {
    try {
      const result = await DatabaseService.executeStoredProcedure('usp_SearchHospitals', {
        SearchTerm: searchTerm,
        City: city,
        PageNumber: pageNumber,
        PageSize: pageSize
      });
      
      const hospitals = result.recordset;
      const totalCount = hospitals.length > 0 ? hospitals[0].TotalCount : 0;
      
      return { hospitals, totalCount };
    } catch (error) {
      console.error('Error searching hospitals:', error);
      throw error;
    }
  }
} 