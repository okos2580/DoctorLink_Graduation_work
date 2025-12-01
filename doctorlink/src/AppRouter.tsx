import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// 페이지
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ReservationPage from './pages/ReservationPage';
import ReservationManagementPage from './pages/ReservationManagementPage';
import NotificationsPage from './pages/NotificationsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import MyPage from './pages/MyPage';
import HospitalFinderPage from './pages/HospitalFinderPage';
import HospitalDetailPage from './pages/HospitalDetailPage';

// 의사 페이지
import DashboardPage from './pages/doctor/DashboardPage';
import AppointmentsPage from './pages/doctor/AppointmentsPage';
import PatientsPage from './pages/doctor/PatientsPage';
import MedicalRecordsPageDoctor from './pages/doctor/MedicalRecordsPage';
import MedicalRecordFormPage from './pages/doctor/MedicalRecordFormPage';

// 관리자 페이지
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminReservationsPage from './pages/AdminReservationsPage';
import AdminHospitalsPage from './pages/AdminHospitalsPage';
import AdminMedicalRecordsPage from './pages/AdminMedicalRecordsPage';
import AdminCustomerServicePage from './pages/AdminCustomerServicePage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';
import AdminStatsPage from './pages/AdminStatsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 공개 접근 가능 페이지 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/hospitals" element={<HospitalFinderPage />} />
          <Route path="/hospital-finder" element={<HospitalFinderPage />} />
          <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
          
          {/* 관리자 페이지 */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/reservations" element={<AdminReservationsPage />} />
          <Route path="/admin/hospitals" element={<AdminHospitalsPage />} />
          <Route path="/admin/medical-records" element={<AdminMedicalRecordsPage />} />
          <Route path="/admin/customer-service" element={<AdminCustomerServicePage />} />
          <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
          <Route path="/admin/stats" element={<AdminStatsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          
          {/* 보호된 페이지 - 환자 */}
          <Route 
            path="/mypage" 
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reservation" 
            element={
              <ProtectedRoute>
                <ReservationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reservations" 
            element={
              <ProtectedRoute>
                <ReservationManagementPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/medical-records" 
            element={
              <ProtectedRoute>
                <MedicalRecordsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 보호된 페이지 - 의사 */}
          <Route 
            path="/doctor/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/appointments" 
            element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/patients" 
            element={
              <ProtectedRoute>
                <PatientsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/medical-records" 
            element={
              <ProtectedRoute>
                <MedicalRecordsPageDoctor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/medical-record/new" 
            element={
              <ProtectedRoute>
                <MedicalRecordFormPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/medical-record/:id" 
            element={
              <ProtectedRoute>
                <MedicalRecordFormPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 존재하지 않는 페이지 처리 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter; 