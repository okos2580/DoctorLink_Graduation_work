const jwt = require('jsonwebtoken');
const db = require('../db');

/**
 * 인증 미들웨어
 * JWT 토큰을 검증하고 사용자 정보를 req.user에 저장
 */
module.exports = async function(req, res, next) {
  // 토큰 가져오기
  const token = req.header('x-auth-token') || req.cookies.token;

  // 토큰이 없는 경우
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: '인증 토큰이 없습니다. 로그인이 필요합니다.' 
    });
  }

  try {
    // JWT 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'doctorlink-jwt-secret');
    
    // 사용자 ID 가져오기
    const { id, role } = decoded;
    
    // 사용자 존재 여부 및 활성화 상태 확인
    const result = await db.executeQuery(
      'SELECT UserID, Username, Email, FirstName, LastName, RoleID, ' +
      '(SELECT RoleName FROM UserRoles WHERE RoleID = Users.RoleID) AS Role, ' +
      'IsActive FROM Users WHERE UserID = @UserID',
      { UserID: id }
    );
    
    // 사용자를 찾을 수 없거나 비활성화된 경우
    if (!result.success || !result.recordset[0] || !result.recordset[0].IsActive) {
      return res.status(401).json({ 
        success: false, 
        message: '유효하지 않은 토큰입니다.' 
      });
    }
    
    // 의사 ID 조회 (역할이 의사인 경우)
    let doctorId = null;
    if (role === 'Doctor') {
      const doctorResult = await db.executeQuery(
        'SELECT DoctorID FROM Doctors WHERE UserID = @UserID',
        { UserID: id }
      );
      
      if (doctorResult.success && doctorResult.recordset[0]) {
        doctorId = doctorResult.recordset[0].DoctorID;
      }
    }
    
    // req.user에 사용자 정보 저장
    req.user = {
      id: result.recordset[0].UserID,
      username: result.recordset[0].Username,
      email: result.recordset[0].Email,
      firstName: result.recordset[0].FirstName,
      lastName: result.recordset[0].LastName,
      role: result.recordset[0].Role,
      doctorId: doctorId
    };
    
    next();
  } catch (err) {
    console.error('인증 오류:', err);
    res.status(401).json({ 
      success: false, 
      message: '토큰이 유효하지 않습니다.' 
    });
  }
}; 