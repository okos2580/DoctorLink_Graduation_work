import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { verifyAdmin, adminLogout, getUsers } from '../services/adminService';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'male' | 'female';
  address: string;
  role: 'patient' | 'doctor' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  registrationDate: string;
  lastLoginDate: string;
  reservationCount: number;
  profileImage?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalInfo?: {
    bloodType: string;
    allergies: string[];
    medications: string[];
    conditions: string[];
  };
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'add'>('view');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAdminAuth = useCallback(async () => {
    try {
      const isValid = await verifyAdmin();
      if (!isValid) {
        navigate('/admin/login');
        return;
      }
      await loadUsers();
    } catch (error) {
      console.error('관리자 인증 확인 중 오류:', error);
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  useEffect(() => {
    filterUsers();
  }, [users, selectedRole, selectedStatus, searchTerm]);

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate('/admin/login');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      navigate('/admin/login');
    }
  };

  const loadUsers = async () => {
    try {
      console.log('사용자 목록 로딩 중...');
      const userData = await getUsers({
        page: 1,
        limit: 100,
        role: selectedRole === 'all' ? undefined : selectedRole,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchTerm || undefined
      });
      
      console.log('API에서 받은 사용자 데이터:', userData);
      
      if (Array.isArray(userData)) {
        // API에서 받은 데이터를 User 인터페이스에 맞게 변환
        const formattedUsers: User[] = userData.map(user => ({
          id: user.id || user.UserID?.toString() || '',
          name: user.name || `${user.FirstName || ''} ${user.LastName || ''}`.trim() || user.Username || '',
          email: user.email || user.Email || '',
          phone: user.phone || user.PhoneNumber || '',
          birthDate: user.birthDate || (user.DateOfBirth ? new Date(user.DateOfBirth).toISOString().split('T')[0] : ''),
          gender: (user.gender || user.Gender || 'male') as 'male' | 'female',
          address: user.address || '',
          role: (user.role || 'patient') as 'patient' | 'doctor' | 'admin',
          status: (user.status || 'active') as 'active' | 'inactive' | 'suspended',
          registrationDate: user.registrationDate || (user.CreatedAt ? new Date(user.CreatedAt).toISOString().split('T')[0] : ''),
          lastLoginDate: user.lastLoginDate || (user.LastLoginAt ? new Date(user.LastLoginAt).toISOString().split('T')[0] : ''),
          reservationCount: user.reservationCount || 0,
          profileImage: user.profileImage || user.ProfileImage
        }));
        
        setUsers(formattedUsers);
        console.log('변환된 사용자 데이터:', formattedUsers);
      } else {
        console.log('사용자 데이터가 배열이 아닙니다:', userData);
        setUsers([]);
      }
    } catch (error) {
      console.error('사용자 목록 로드 중 오류:', error);
      setUsers([]);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // 역할별 필터링
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // 상태별 필터링
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleAction = (user: User, action: 'view' | 'edit' | 'delete') => {
    setSelectedUser(user);
    if (action === 'delete') {
      setShowDeleteConfirm(true);
    } else {
      setModalType(action);
      setShowModal(true);
    }
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setModalType('add');
    setShowModal(true);
  };

  const handleStatusChange = (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          status: newStatus
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    alert(`사용자 상태가 ${getStatusText(newStatus)}(으)로 변경되었습니다.`);
  };

  const handleDelete = () => {
    if (!selectedUser) return;

    const updatedUsers = users.filter(user => user.id !== selectedUser.id);
    setUsers(updatedUsers);
    setShowDeleteConfirm(false);
    setSelectedUser(null);
    alert('사용자가 삭제되었습니다.');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { text: '활성', color: '#28a745', bgColor: '#d4edda' },
      inactive: { text: '비활성', color: '#6c757d', bgColor: '#e2e3e5' },
      suspended: { text: '정지', color: '#dc3545', bgColor: '#f8d7da' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <StatusBadge color={config.color} bgColor={config.bgColor}>
        {config.text}
      </StatusBadge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      patient: { text: '환자', color: '#007bff', bgColor: '#e3f2fd' },
      doctor: { text: '의사', color: '#28a745', bgColor: '#e8f5e8' },
      admin: { text: '관리자', color: '#dc3545', bgColor: '#ffeaea' }
    };

    const config = roleConfig[role as keyof typeof roleConfig];
    return (
      <RoleBadge color={config.color} bgColor={config.bgColor}>
        {config.text}
      </RoleBadge>
    );
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      active: '활성',
      inactive: '비활성',
      suspended: '정지'
    };
    return statusMap[status as keyof typeof statusMap];
  };

  const getStats = () => {
    return {
      total: users.length,
      patients: users.filter(u => u.role === 'patient').length,
      doctors: users.filter(u => u.role === 'doctor').length,
      admins: users.filter(u => u.role === 'admin').length,
      active: users.filter(u => u.status === 'active').length,
      suspended: users.filter(u => u.status === 'suspended').length
    };
  };

  const stats = getStats();

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

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate('/admin/dashboard')}>
            ← 대시보드로
          </BackButton>
          <Title>👥 사용자 관리</Title>
        </HeaderLeft>
        <HeaderRight>
          <AddButton onClick={handleAdd}>
            + 사용자 추가
          </AddButton>
          <RefreshButton onClick={loadUsers}>
            🔄 새로고침
          </RefreshButton>
          <LogoutButton onClick={handleLogout}>
            로그아웃
          </LogoutButton>
        </HeaderRight>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.total}</StatNumber>
          <StatLabel>전체 사용자</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.patients}</StatNumber>
          <StatLabel>환자</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.doctors}</StatNumber>
          <StatLabel>의사</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.admins}</StatNumber>
          <StatLabel>관리자</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.active}</StatNumber>
          <StatLabel>활성 사용자</StatLabel>
        </StatCard>
        <StatCard urgent>
          <StatNumber>{stats.suspended}</StatNumber>
          <StatLabel>정지된 사용자</StatLabel>
        </StatCard>
      </StatsGrid>

      <FilterSection>
        <FilterLeft>
          <SearchInput
            type="text"
            placeholder="이름, 이메일, 전화번호로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FilterLeft>
        <FilterRight>
          <FilterSelect
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">전체 역할</option>
            <option value="patient">환자</option>
            <option value="doctor">의사</option>
            <option value="admin">관리자</option>
          </FilterSelect>
          <FilterSelect
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="suspended">정지</option>
          </FilterSelect>
        </FilterRight>
      </FilterSection>

      <UserTable>
        <TableHeader>
          <HeaderCell>사용자 정보</HeaderCell>
          <HeaderCell>연락처</HeaderCell>
          <HeaderCell>역할</HeaderCell>
          <HeaderCell>상태</HeaderCell>
          <HeaderCell>가입일</HeaderCell>
          <HeaderCell>최근 로그인</HeaderCell>
          <HeaderCell>예약 수</HeaderCell>
          <HeaderCell>작업</HeaderCell>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <UserInfo>
                  <UserAvatar>
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} />
                    ) : (
                      <DefaultAvatar>{user.name.charAt(0)}</DefaultAvatar>
                    )}
                  </UserAvatar>
                  <UserDetails>
                    <UserName>{user.name}</UserName>
                    <UserId>ID: {user.id}</UserId>
                    <UserEmail>{user.email}</UserEmail>
                  </UserDetails>
                </UserInfo>
              </TableCell>
              <TableCell>
                <ContactInfo>
                  <div>📞 {user.phone}</div>
                  <div>📍 {user.address.length > 30 ? user.address.substring(0, 30) + '...' : user.address}</div>
                </ContactInfo>
              </TableCell>
              <TableCell>
                {getRoleBadge(user.role)}
              </TableCell>
              <TableCell>
                {getStatusBadge(user.status)}
              </TableCell>
              <TableCell>
                <DateInfo>{user.registrationDate}</DateInfo>
              </TableCell>
              <TableCell>
                <DateInfo>{user.lastLoginDate}</DateInfo>
              </TableCell>
              <TableCell>
                <ReservationCount>
                  {user.role === 'patient' ? user.reservationCount : '-'}
                </ReservationCount>
              </TableCell>
              <TableCell>
                <ActionButtons>
                  <ActionButton
                    onClick={() => handleAction(user, 'view')}
                    variant="info"
                  >
                    상세
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleAction(user, 'edit')}
                    variant="primary"
                  >
                    수정
                  </ActionButton>
                  {user.status === 'active' && user.role !== 'admin' && (
                    <ActionButton
                      onClick={() => handleStatusChange(user.id, 'suspended')}
                      variant="warning"
                    >
                      정지
                    </ActionButton>
                  )}
                  {user.status === 'suspended' && (
                    <ActionButton
                      onClick={() => handleStatusChange(user.id, 'active')}
                      variant="success"
                    >
                      해제
                    </ActionButton>
                  )}
                  {user.role !== 'admin' && (
                    <ActionButton
                      onClick={() => handleAction(user, 'delete')}
                      variant="danger"
                    >
                      삭제
                    </ActionButton>
                  )}
                </ActionButtons>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </UserTable>

      {filteredUsers.length === 0 && (
        <EmptyState>
          <EmptyIcon>👥</EmptyIcon>
          <EmptyText>조건에 맞는 사용자가 없습니다.</EmptyText>
        </EmptyState>
      )}

      {/* 상세보기/수정 모달 */}
      {showModal && (
        <Modal>
          <ModalOverlay onClick={() => setShowModal(false)} />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {modalType === 'view' ? '사용자 상세정보' :
                 modalType === 'edit' ? '사용자 정보 수정' : '새 사용자 추가'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>
            
            <ModalBody>
              {selectedUser && modalType === 'view' && (
                <DetailGrid>
                  <DetailSection>
                    <SectionTitle>기본 정보</SectionTitle>
                    <DetailItem>
                      <DetailLabel>이름</DetailLabel>
                      <DetailValue>{selectedUser.name}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>사용자 ID</DetailLabel>
                      <DetailValue>{selectedUser.id}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>이메일</DetailLabel>
                      <DetailValue>{selectedUser.email}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>전화번호</DetailLabel>
                      <DetailValue>{selectedUser.phone}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>생년월일</DetailLabel>
                      <DetailValue>{selectedUser.birthDate}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>성별</DetailLabel>
                      <DetailValue>{selectedUser.gender === 'male' ? '남성' : '여성'}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>주소</DetailLabel>
                      <DetailValue>{selectedUser.address}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>역할</DetailLabel>
                      <DetailValue>{getRoleBadge(selectedUser.role)}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>상태</DetailLabel>
                      <DetailValue>{getStatusBadge(selectedUser.status)}</DetailValue>
                    </DetailItem>
                  </DetailSection>

                  <DetailSection>
                    <SectionTitle>계정 정보</SectionTitle>
                    <DetailItem>
                      <DetailLabel>가입일</DetailLabel>
                      <DetailValue>{selectedUser.registrationDate}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>최근 로그인</DetailLabel>
                      <DetailValue>{selectedUser.lastLoginDate}</DetailValue>
                    </DetailItem>
                    {selectedUser.role === 'patient' && (
                      <DetailItem>
                        <DetailLabel>예약 횟수</DetailLabel>
                        <DetailValue>{selectedUser.reservationCount}회</DetailValue>
                      </DetailItem>
                    )}
                  </DetailSection>

                  {selectedUser.emergencyContact && (
                    <DetailSection>
                      <SectionTitle>비상 연락처</SectionTitle>
                      <DetailItem>
                        <DetailLabel>이름</DetailLabel>
                        <DetailValue>{selectedUser.emergencyContact.name}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>전화번호</DetailLabel>
                        <DetailValue>{selectedUser.emergencyContact.phone}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>관계</DetailLabel>
                        <DetailValue>{selectedUser.emergencyContact.relationship}</DetailValue>
                      </DetailItem>
                    </DetailSection>
                  )}

                  {selectedUser.medicalInfo && (
                    <DetailSection>
                      <SectionTitle>의료 정보</SectionTitle>
                      <DetailItem>
                        <DetailLabel>혈액형</DetailLabel>
                        <DetailValue>{selectedUser.medicalInfo.bloodType}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>알레르기</DetailLabel>
                        <DetailValue>
                          {selectedUser.medicalInfo.allergies.length > 0 ? (
                            <TagList>
                              {selectedUser.medicalInfo.allergies.map((allergy, index) => (
                                <Tag key={index} color="#dc3545">{allergy}</Tag>
                              ))}
                            </TagList>
                          ) : '없음'}
                        </DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>복용 약물</DetailLabel>
                        <DetailValue>
                          {selectedUser.medicalInfo.medications.length > 0 ? (
                            <TagList>
                              {selectedUser.medicalInfo.medications.map((medication, index) => (
                                <Tag key={index} color="#007bff">{medication}</Tag>
                              ))}
                            </TagList>
                          ) : '없음'}
                        </DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>기존 질환</DetailLabel>
                        <DetailValue>
                          {selectedUser.medicalInfo.conditions.length > 0 ? (
                            <TagList>
                              {selectedUser.medicalInfo.conditions.map((condition, index) => (
                                <Tag key={index} color="#ffc107">{condition}</Tag>
                              ))}
                            </TagList>
                          ) : '없음'}
                        </DetailValue>
                      </DetailItem>
                    </DetailSection>
                  )}
                </DetailGrid>
              )}

              {modalType === 'edit' && (
                <FormContainer>
                  <FormMessage>
                    사용자 정보 수정 기능은 실제 구현에서 폼 컴포넌트로 대체됩니다.
                  </FormMessage>
                </FormContainer>
              )}

              {modalType === 'add' && (
                <FormContainer>
                  <FormMessage>
                    새 사용자 추가 기능은 실제 구현에서 폼 컴포넌트로 대체됩니다.
                  </FormMessage>
                </FormContainer>
              )}
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={() => setShowModal(false)}>
                {modalType === 'view' ? '닫기' : '취소'}
              </CancelButton>
              {modalType !== 'view' && (
                <ConfirmButton>
                  {modalType === 'edit' ? '수정하기' : '추가하기'}
                </ConfirmButton>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && selectedUser && (
        <Modal>
          <ModalOverlay onClick={() => setShowDeleteConfirm(false)} />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>사용자 삭제 확인</ModalTitle>
              <CloseButton onClick={() => setShowDeleteConfirm(false)}>×</CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <DeleteMessage>
                <strong>{selectedUser.name}</strong> 사용자를 정말 삭제하시겠습니까?
                <br />
                이 작업은 되돌릴 수 없으며, 관련된 모든 데이터가 삭제됩니다.
              </DeleteMessage>
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={() => setShowDeleteConfirm(false)}>
                취소
              </CancelButton>
              <DeleteButton onClick={handleDelete}>
                삭제하기
              </DeleteButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

// 스타일 컴포넌트들
const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 10px;
`;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #5a6268;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const AddButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #218838;
  }
`;

const RefreshButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #0056b3;
  }
`;

const LogoutButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #c82333;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div<{ urgent?: boolean }>`
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-left: 4px solid ${props => props.urgent ? '#dc3545' : '#007bff'};
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const FilterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterLeft = styled.div`
  flex: 1;
`;

const FilterRight = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  background: white;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const UserTable = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 250px 200px 100px 100px 120px 120px 80px 200px;
  background: #f8f9fa;
  padding: 15px 20px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e1e5e9;

  @media (max-width: 1400px) {
    display: none;
  }
`;

const HeaderCell = styled.div`
  font-size: 14px;
`;

const TableBody = styled.div``;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 250px 200px 100px 100px 120px 120px 80px 200px;
  padding: 20px;
  border-bottom: 1px solid #f1f3f4;
  align-items: center;

  &:hover {
    background: #f8f9fa;
  }

  @media (max-width: 1400px) {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 20px;
  }
`;

const TableCell = styled.div`
  font-size: 14px;
  color: #333;

  @media (max-width: 1400px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f1f3f4;
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DefaultAvatar = styled.div`
  width: 100%;
  height: 100%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
`;

const UserDetails = styled.div``;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
`;

const UserId = styled.div`
  font-size: 11px;
  color: #666;
  margin-bottom: 2px;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: #666;
`;

const ContactInfo = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;

  div {
    margin-bottom: 2px;
  }
`;

const StatusBadge = styled.span<{ color: string; bgColor: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.color};
  background-color: ${props => props.bgColor};
`;

const RoleBadge = styled.span<{ color: string; bgColor: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.color};
  background-color: ${props => props.bgColor};
`;

const DateInfo = styled.div`
  font-size: 12px;
  color: #666;
`;

const ReservationCount = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant: 'info' | 'primary' | 'success' | 'warning' | 'danger' }>`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 500;
  
  ${props => {
    switch (props.variant) {
      case 'info':
        return `
          background: #17a2b8;
          color: white;
          &:hover { background: #138496; }
        `;
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover { background: #0056b3; }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover { background: #218838; }
        `;
      case 'warning':
        return `
          background: #ffc107;
          color: #212529;
          &:hover { background: #e0a800; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
    }
  }}
`;

const EmptyState = styled.div`
  background: white;
  padding: 60px 20px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const EmptyText = styled.div`
  font-size: 18px;
  color: #666;
`;

// 모달 스타일
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  z-index: 1001;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e1e5e9;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 30px;
`;

const DetailGrid = styled.div`
  display: grid;
  gap: 30px;
`;

const DetailSection = styled.div``;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f1f3f4;
`;

const DetailItem = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 15px;
  margin-bottom: 12px;
  align-items: start;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 5px;
  }
`;

const DetailLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tag = styled.span<{ color: string }>`
  background: ${props => props.color}20;
  color: ${props => props.color};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
`;

const FormContainer = styled.div`
  padding: 20px;
  text-align: center;
`;

const FormMessage = styled.div`
  font-size: 16px;
  color: #666;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 10px;
`;

const DeleteMessage = styled.div`
  font-size: 16px;
  color: #333;
  text-align: center;
  padding: 20px;
  line-height: 1.6;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 30px;
  border-top: 1px solid #e1e5e9;
`;

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #5a6268;
  }
`;

const ConfirmButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #0056b3;
  }
`;

const DeleteButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #c82333;
  }
`;

export default AdminUsersPage; 