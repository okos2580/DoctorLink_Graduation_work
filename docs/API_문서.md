# 📡 DoctorLink API 문서

## 개요

DoctorLink는 RESTful API 아키텍처를 사용하여 클라이언트(웹/모바일)와 서버 간 통신을 수행합니다.

### 기본 정보

- **Base URL**: `http://localhost:5000/api`
- **프로토콜**: HTTP/HTTPS
- **데이터 형식**: JSON
- **인증 방식**: JWT (JSON Web Tokens)
- **인코딩**: UTF-8

### HTTP 상태 코드

| 상태 코드 | 설명 |
|-----------|------|
| 200 OK | 요청 성공 |
| 201 Created | 리소스 생성 성공 |
| 400 Bad Request | 잘못된 요청 |
| 401 Unauthorized | 인증 실패 |
| 403 Forbidden | 권한 없음 |
| 404 Not Found | 리소스 없음 |
| 500 Internal Server Error | 서버 오류 |

---

## 인증 (Authentication)

### 회원가입

새 사용자 계정을 생성합니다.

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "email": "patient@example.com",
  "password": "password123!",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "birthDate": "1990-01-01",
  "gender": "male",
  "role": "patient"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "회원가입 완료",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "email": "patient@example.com",
    "name": "홍길동",
    "role": "patient"
  }
}
```

### 로그인

기존 사용자 로그인을 수행합니다.

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "patient@example.com",
  "password": "password123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "email": "patient@example.com",
    "name": "홍길동",
    "role": "patient"
  }
}
```

### 현재 사용자 정보

로그인한 사용자의 정보를 가져옵니다.

**Endpoint**: `GET /api/auth/me`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "userId": 1,
    "email": "patient@example.com",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "role": "patient",
    "birthDate": "1990-01-01",
    "gender": "male"
  }
}
```

---

## 병원 (Hospitals)

### 병원 목록 조회

모든 병원 목록을 조회합니다.

**Endpoint**: `GET /api/hospitals`

**Query Parameters**:
- `type` (optional): 병원 유형 (예: 종합병원, 병원, 의원)
- `city` (optional): 시/도
- `specialty` (optional): 진료과

**Example**:
```
GET /api/hospitals?type=종합병원&city=서울
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "hospitalId": 1,
      "name": "서울대학교병원",
      "address": "서울시 종로구 대학로 101",
      "city": "서울",
      "type": "종합병원",
      "phone": "02-2072-0505",
      "latitude": 37.5798,
      "longitude": 127.0015,
      "rating": 4.8,
      "reviewCount": 152
    }
  ]
}
```

### 병원 상세 정보

특정 병원의 상세 정보를 조회합니다.

**Endpoint**: `GET /api/hospitals/:id`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "hospitalId": 1,
    "name": "서울대학교병원",
    "address": "서울시 종로구 대학로 101",
    "city": "서울",
    "type": "종합병원",
    "phone": "02-2072-0505",
    "latitude": 37.5798,
    "longitude": 127.0015,
    "rating": 4.8,
    "reviewCount": 152,
    "description": "국내 최고 수준의 의료 서비스를 제공합니다.",
    "openTime": "09:00",
    "closeTime": "18:00",
    "doctors": [
      {
        "doctorId": 1,
        "name": "김의사",
        "specialty": "내과",
        "experience": 15
      }
    ]
  }
}
```

### 병원 검색

키워드로 병원을 검색합니다.

**Endpoint**: `GET /api/hospitals/search`

**Query Parameters**:
- `q`: 검색 키워드 (병원명, 주소, 진료과)

**Example**:
```
GET /api/hospitals/search?q=서울대
```

### 근처 병원 찾기

GPS 좌표 기반으로 근처 병원을 찾습니다.

**Endpoint**: `GET /api/hospitals/nearby`

**Query Parameters**:
- `lat`: 위도
- `lng`: 경도
- `radius` (optional): 반경 (km, 기본값: 5)

**Example**:
```
GET /api/hospitals/nearby?lat=37.5665&lng=126.9780&radius=3
```

---

## 의사 (Doctors)

### 의사 목록 조회

**Endpoint**: `GET /api/doctors`

**Query Parameters**:
- `hospitalId` (optional): 병원 ID
- `specialty` (optional): 전문 분야

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "doctorId": 1,
      "userId": 10,
      "name": "김의사",
      "specialty": "내과",
      "hospitalId": 1,
      "hospitalName": "서울대학교병원",
      "experience": 15,
      "education": "서울대학교 의과대학",
      "bio": "내과 전문의",
      "profileImage": "/images/doctor1.jpg"
    }
  ]
}
```

---

## 예약 (Appointments)

### 예약 가능 시간 조회

특정 의사의 예약 가능한 시간을 조회합니다.

**Endpoint**: `GET /api/appointments/availability`

**Query Parameters**:
- `doctorId`: 의사 ID
- `date`: 날짜 (YYYY-MM-DD)

**Example**:
```
GET /api/appointments/availability?doctorId=1&date=2025-01-15
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "date": "2025-01-15",
    "availableSlots": [
      "09:00",
      "10:00",
      "11:00",
      "14:00",
      "15:00",
      "16:00"
    ]
  }
}
```

### 예약 생성

새 예약을 생성합니다.

**Endpoint**: `POST /api/appointments`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "doctorId": 1,
  "appointmentDate": "2025-01-15",
  "appointmentTime": "09:00",
  "reason": "감기 증상",
  "notes": "기침과 열이 있습니다"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "예약이 접수되었습니다",
  "data": {
    "appointmentId": 123,
    "patientId": 1,
    "doctorId": 1,
    "appointmentDate": "2025-01-15",
    "appointmentTime": "09:00",
    "status": "pending",
    "reason": "감기 증상",
    "createdAt": "2025-01-10T10:30:00Z"
  }
}
```

### 환자 예약 목록

로그인한 환자의 예약 목록을 조회합니다.

**Endpoint**: `GET /api/appointments/patient`

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `status` (optional): 예약 상태 (pending, approved, completed, cancelled)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "appointmentId": 123,
      "doctorName": "김의사",
      "hospitalName": "서울대학교병원",
      "appointmentDate": "2025-01-15",
      "appointmentTime": "09:00",
      "status": "approved",
      "reason": "감기 증상"
    }
  ]
}
```

### 예약 상태 변경

예약 상태를 변경합니다 (취소, 승인 등).

**Endpoint**: `PUT /api/appointments/:id/status`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "status": "cancelled"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "예약이 취소되었습니다"
}
```

---

## 진료 기록 (Medical Records)

### 환자 진료 기록 조회

로그인한 환자의 진료 기록을 조회합니다.

**Endpoint**: `GET /api/medical-records/patient`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "recordId": 1,
      "appointmentId": 120,
      "doctorName": "김의사",
      "hospitalName": "서울대학교병원",
      "recordDate": "2024-12-20",
      "diagnosis": "급성 상기도 감염",
      "treatment": "항생제 처방",
      "prescription": "아목시실린 500mg, 1일 3회",
      "notes": "충분한 휴식 필요"
    }
  ]
}
```

### 진료 기록 상세

**Endpoint**: `GET /api/medical-records/:id`

**Headers**:
```
Authorization: Bearer <token>
```

---

## 리뷰 (Reviews)

### 리뷰 생성

병원 및 의사에 대한 리뷰를 작성합니다.

**Endpoint**: `POST /api/reviews`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "appointmentId": 120,
  "doctorId": 1,
  "hospitalId": 1,
  "rating": 5,
  "comment": "친절하고 진료를 잘 봐주셨습니다."
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "리뷰가 등록되었습니다",
  "data": {
    "reviewId": 50,
    "rating": 5,
    "comment": "친절하고 진료를 잘 봐주셨습니다.",
    "createdAt": "2025-01-10T15:00:00Z"
  }
}
```

---

## 알림 (Notifications)

### 알림 목록 조회

**Endpoint**: `GET /api/notifications`

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `isRead` (optional): 읽음 여부 (true/false)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "notificationId": 1,
      "type": "appointment",
      "title": "예약이 승인되었습니다",
      "message": "2025-01-15 09:00 예약이 승인되었습니다.",
      "isRead": false,
      "createdAt": "2025-01-10T14:00:00Z"
    }
  ]
}
```

### 알림 읽음 처리

**Endpoint**: `PUT /api/notifications/:id/read`

**Headers**:
```
Authorization: Bearer <token>
```

---

## 문의 (Inquiries)

### 문의 등록

**Endpoint**: `POST /api/inquiries`

**Request Body**:
```json
{
  "type": "general",
  "name": "홍길동",
  "email": "hong@example.com",
  "phone": "010-1234-5678",
  "subject": "예약 관련 문의",
  "message": "예약 변경이 가능한가요?"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "문의가 등록되었습니다",
  "data": {
    "inquiryId": 10,
    "status": "pending"
  }
}
```

---

## 관리자 API

### 사용자 관리

**Endpoint**: `GET /api/admin/users`

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Response**: 전체 사용자 목록

### 예약 관리

**Endpoint**: `GET /api/admin/appointments`

**Headers**:
```
Authorization: Bearer <admin_token>
```

### 통계

**Endpoint**: `GET /api/admin/stats`

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalUsers": 500,
    "totalHospitals": 50,
    "totalAppointments": 1200,
    "todayAppointments": 15
  }
}
```

---

## 오류 응답 형식

모든 오류는 다음 형식으로 반환됩니다:

```json
{
  "success": false,
  "message": "오류 메시지",
  "error": "상세 오류 정보 (개발 모드만)"
}
```

### 일반적인 오류 메시지

| 오류 | 상태 코드 | 메시지 |
|------|-----------|--------|
| 인증 실패 | 401 | "인증이 필요합니다" |
| 권한 없음 | 403 | "접근 권한이 없습니다" |
| 리소스 없음 | 404 | "요청한 리소스를 찾을 수 없습니다" |
| 중복 데이터 | 400 | "이미 존재하는 데이터입니다" |
| 유효성 검사 실패 | 400 | "입력값이 유효하지 않습니다" |

---

## Rate Limiting

API 요청 제한은 다음과 같습니다:

- **일반 사용자**: 분당 60회
- **관리자**: 분당 120회

제한 초과 시 `429 Too Many Requests` 응답을 받습니다.

---

## 버전 관리

현재 API 버전: **v1**

향후 API 변경 시 `/api/v2/` 형식으로 버전을 관리할 예정입니다.

---

## 테스트

### Postman Collection

Postman 컬렉션은 프로젝트 루트의 `postman/` 폴더에서 찾을 수 있습니다.

### 테스트 계정

개발 환경에서 사용 가능한 테스트 계정:

**환자**:
- Email: `patient@test.com`
- Password: `test1234`

**의사**:
- Email: `doctor@test.com`
- Password: `test1234`

**관리자**:
- Email: `admin@test.com`
- Password: `admin1234`

