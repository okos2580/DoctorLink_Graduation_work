const express = require('express');
const router = express.Router();
const db = require('../../db');
const auth = require('../../middleware/auth');

/**
 * @route   GET /api/appointments/availability
 * @desc    의사 예약 가능 시간 확인
 * @access  Private
 */
router.get('/availability', auth, async (req, res) => {
  try {
    const { doctorId, hospitalId, date } = req.query;
    
    if (!doctorId || !hospitalId || !date) {
      return res.status(400).json({ 
        success: false, 
        message: '의사ID, 병원ID, 날짜는 필수 항목입니다.' 
      });
    }
    
    // ISO 문자열 형식의 날짜를 날짜 객체로 변환
    const appointmentDate = new Date(date);
    
    const result = await db.checkDoctorAvailability(
      parseInt(doctorId), 
      parseInt(hospitalId), 
      appointmentDate
    );
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: '가용 시간 조회 중 오류가 발생했습니다.', 
        error: result.error 
      });
    }
    
    // 근무 시간, 이미 예약된 시간, 휴무일 여부 반환
    const workingHours = result.recordsets[0] || [];
    const bookedSlots = result.recordsets[1] || [];
    const isTimeOff = (result.recordsets[2] && result.recordsets[2].length > 0);
    
    // 가용 시간대 계산 (필요 시 구현)
    const availableTimeSlots = calculateAvailableTimeSlots(workingHours, bookedSlots, isTimeOff);
    
    return res.json({
      success: true,
      data: {
        doctorId,
        hospitalId,
        date: appointmentDate.toISOString().split('T')[0],
        workingHours,
        bookedSlots,
        isTimeOff,
        availableTimeSlots
      }
    });
  } catch (err) {
    console.error('의사 가용 시간 조회 오류:', err);
    return res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route   POST /api/appointments
 * @desc    새 예약 생성
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, hospitalId, date, startTime, endTime, reason } = req.body;
    
    if (!doctorId || !hospitalId || !date || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        message: '의사ID, 병원ID, 날짜, 시작 시간, 종료 시간은 필수 항목입니다.' 
      });
    }
    
    // 사용자 ID (환자 ID)는 로그인 정보에서 가져옴
    const patientId = req.user.id;
    
    // ISO 문자열 형식의 날짜를 날짜 객체로 변환
    const appointmentDate = new Date(date);
    
    const result = await db.createAppointment(
      patientId,
      parseInt(doctorId),
      parseInt(hospitalId),
      appointmentDate,
      startTime,
      endTime,
      reason
    );
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: '예약 생성 중 오류가 발생했습니다.', 
        error: result.error 
      });
    }
    
    // 생성된 예약 정보 반환
    const appointment = result.recordset[0];
    
    return res.status(201).json({
      success: true,
      message: '예약이 성공적으로 생성되었습니다.',
      data: appointment
    });
  } catch (err) {
    console.error('예약 생성 오류:', err);
    return res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route   GET /api/appointments/patient
 * @desc    환자의 예약 목록 조회
 * @access  Private
 */
router.get('/patient', auth, async (req, res) => {
  try {
    const patientId = req.user.id;
    const includePast = req.query.includePast === 'true';
    
    const result = await db.executeStoredProcedure('usp_GetPatientAppointments', {
      PatientID: patientId,
      IncludePast: includePast
    });
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: '예약 목록 조회 중 오류가 발생했습니다.', 
        error: result.error 
      });
    }
    
    const appointments = result.recordset || [];
    
    return res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    console.error('환자 예약 목록 조회 오류:', err);
    return res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route   GET /api/appointments/doctor
 * @desc    의사의 예약 목록 조회
 * @access  Private (의사/관리자)
 */
router.get('/doctor', auth, async (req, res) => {
  try {
    // 의사/관리자 권한 확인 (필요 시 구현)
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
      return res.status(403).json({ 
        success: false, 
        message: '권한이 없습니다.' 
      });
    }
    
    const { doctorId, startDate, endDate, status } = req.query;
    
    if (!doctorId) {
      return res.status(400).json({ 
        success: false, 
        message: '의사ID는 필수 항목입니다.' 
      });
    }
    
    const result = await db.executeStoredProcedure('usp_GetDoctorAppointments', {
      DoctorID: parseInt(doctorId),
      StartDate: startDate ? new Date(startDate) : null,
      EndDate: endDate ? new Date(endDate) : null,
      StatusName: status
    });
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: '예약 목록 조회 중 오류가 발생했습니다.', 
        error: result.error 
      });
    }
    
    const appointments = result.recordset || [];
    
    return res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    console.error('의사 예약 목록 조회 오류:', err);
    return res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route   PUT /api/appointments/:id/status
 * @desc    예약 상태 변경
 * @access  Private (의사/관리자/환자)
 */
router.put('/:id/status', auth, async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: '상태는 필수 항목입니다.' 
      });
    }
    
    // 예약 상태 업데이트 전 권한 확인
    const appointmentQuery = await db.executeQuery(
      'SELECT PatientID, DoctorID FROM Appointments WHERE AppointmentID = @AppointmentID',
      { AppointmentID: appointmentId }
    );
    
    if (!appointmentQuery.success || !appointmentQuery.recordset[0]) {
      return res.status(404).json({ 
        success: false, 
        message: '예약을 찾을 수 없습니다.' 
      });
    }
    
    const appointment = appointmentQuery.recordset[0];
    
    // 예약 변경 권한 확인 - 환자 본인, 담당 의사, 또는 관리자만 변경 가능
    const isPatient = appointment.PatientID === req.user.id;
    const isDoctor = appointment.DoctorID === req.user.doctorId;
    const isAdmin = req.user.role === 'Admin';
    
    if (!(isPatient || isDoctor || isAdmin)) {
      return res.status(403).json({ 
        success: false, 
        message: '이 예약을 변경할 권한이 없습니다.' 
      });
    }
    
    // 환자는 취소만 가능하도록 제한 (필요 시)
    if (isPatient && status !== '취소됨') {
      return res.status(403).json({ 
        success: false, 
        message: '환자는 예약을 취소만 할 수 있습니다.' 
      });
    }
    
    const result = await db.executeStoredProcedure('usp_UpdateAppointmentStatus', {
      AppointmentID: appointmentId,
      StatusName: status,
      Notes: notes
    });
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: '예약 상태 변경 중 오류가 발생했습니다.', 
        error: result.error 
      });
    }
    
    const updatedAppointment = result.recordset[0];
    
    return res.json({
      success: true,
      message: '예약 상태가 성공적으로 변경되었습니다.',
      data: updatedAppointment
    });
  } catch (err) {
    console.error('예약 상태 변경 오류:', err);
    return res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

// 가용 시간대 계산 함수
function calculateAvailableTimeSlots(workingHours, bookedSlots, isTimeOff) {
  // 휴무일인 경우 빈 배열 반환
  if (isTimeOff || workingHours.length === 0) {
    return [];
  }
  
  const doctor = workingHours[0];
  const { StartTime, EndTime, BreakStartTime, BreakEndTime } = doctor;
  
  // 30분 간격으로 가용 시간대 생성
  const slots = [];
  let currentTime = new Date(`1970-01-01T${StartTime}`);
  const endTime = new Date(`1970-01-01T${EndTime}`);
  
  // 휴식 시간 설정
  const breakStart = BreakStartTime ? new Date(`1970-01-01T${BreakStartTime}`) : null;
  const breakEnd = BreakEndTime ? new Date(`1970-01-01T${BreakEndTime}`) : null;
  
  // 예약된 시간대를 Date 객체로 변환
  const bookedTimesRanges = bookedSlots.map(slot => ({
    start: new Date(`1970-01-01T${slot.StartTime}`),
    end: new Date(`1970-01-01T${slot.EndTime}`)
  }));
  
  // 30분 간격으로 가용 시간대 생성
  while (currentTime < endTime) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + 30 * 60000); // 30분 추가
    
    // 근무 종료 시간을 넘어가면 중단
    if (slotEnd > endTime) {
      break;
    }
    
    // 휴식 시간 체크
    const isDuringBreak = breakStart && breakEnd && 
                         ((slotStart >= breakStart && slotStart < breakEnd) || 
                          (slotEnd > breakStart && slotEnd <= breakEnd) ||
                          (slotStart <= breakStart && slotEnd >= breakEnd));
    
    // 이미 예약된 시간과 겹치는지 체크
    const isBooked = bookedTimesRanges.some(booked => 
      (slotStart >= booked.start && slotStart < booked.end) || 
      (slotEnd > booked.start && slotEnd <= booked.end) ||
      (slotStart <= booked.start && slotEnd >= booked.end)
    );
    
    // 휴식 시간이 아니고 예약되지 않은 시간대만 추가
    if (!isDuringBreak && !isBooked) {
      slots.push({
        startTime: slotStart.toTimeString().slice(0, 8),
        endTime: slotEnd.toTimeString().slice(0, 8),
        available: true
      });
    }
    
    // 다음 슬롯으로 이동
    currentTime = slotEnd;
  }
  
  return slots;
}

module.exports = router; 