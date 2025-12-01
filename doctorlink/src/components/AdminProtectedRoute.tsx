import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { verifyAdmin } from '../services/adminService';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const adminInfo = localStorage.getItem('adminInfo');
        if (!adminInfo) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const isValid = await verifyAdmin();
        setIsAdmin(isValid);
      } catch (error) {
        console.error('관리자 권한 확인 중 오류:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        관리자 권한 확인 중...
      </div>
    );
  }

  if (!isAdmin) {
    // 현재 위치를 state로 전달하여 로그인 후 원래 페이지로 돌아올 수 있게 함
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute; 