import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { verifyAdmin, adminLogout } from '../services/adminService';

// 알림 타입
interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'reservation' | 'payment' | 'system' | 'emergency';
  targetType: 'all' | 'patients' | 'doctors' | 'specific';
  targetUsers?: string[];
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: string;
  sentAt?: string;
  readCount: number;
  totalRecipients: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 알림 템플릿 타입
interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

const AdminNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notifications' | 'templates' | 'send'>('notifications');
  
  // 알림 관련 상태
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 템플릿 관련 상태
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    title: '',
    content: '',
    type: 'general',
    isActive: true
  });

  // 알림 발송 관련 상태
  const [sendForm, setSendForm] = useState({
    title: '',
    content: '',
    type: 'general',
    targetType: 'all',
    priority: 'medium',
    scheduledAt: '',
    isScheduled: false
  });

  // Mock 데이터
  const mockNotifications: Notification[] = [
    {
      id: 'notif-001',
      title: '시스템 점검 안내',
      content: '2024년 1월 20일 새벽 2시부터 4시까지 시스템 점검이 진행됩니다.',
      type: 'system',
      targetType: 'all',
      status: 'sent',
      priority: 'high',
      sentAt: '2024-01-15T10:00:00Z',
      readCount: 1250,
      totalRecipients: 1500,
      createdBy: '관리자',
      createdAt: '2024-01-15T09:30:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'notif-002',
      title: '새로운 병원 추가',
      content: '서울대학교병원 강남센터가 새롭게 추가되었습니다. 지금 예약해보세요!',
      type: 'general',
      targetType: 'patients',
      status: 'sent',
      priority: 'medium',
      sentAt: '2024-01-14T14:00:00Z',
      readCount: 890,
      totalRecipients: 1200,
      createdBy: '관리자',
      createdAt: '2024-01-14T13:30:00Z',
      updatedAt: '2024-01-14T14:00:00Z'
    },
    {
      id: 'notif-003',
      title: '예약 확인 요청',
      content: '내일 예약하신 진료에 대한 확인이 필요합니다.',
      type: 'reservation',
      targetType: 'specific',
      status: 'scheduled',
      priority: 'medium',
      scheduledAt: '2024-01-17T09:00:00Z',
      readCount: 0,
      totalRecipients: 45,
      createdBy: '관리자',
      createdAt: '2024-01-16T16:00:00Z',
      updatedAt: '2024-01-16T16:00:00Z'
    }
  ];

  const mockTemplates: NotificationTemplate[] = [
    {
      id: 'template-001',
      name: '예약 확인 알림',
      title: '예약 확인 요청',
      content: '안녕하세요. {날짜} {시간}에 예약하신 {병원명} {의사명} 진료에 대한 확인이 필요합니다.',
      type: 'reservation',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'template-002',
      name: '결제 완료 알림',
      title: '결제가 완료되었습니다',
      content: '{금액}원 결제가 정상적으로 완료되었습니다. 예약번호: {예약번호}',
      type: 'payment',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'template-003',
      name: '시스템 점검 안내',
      title: '시스템 점검 안내',
      content: '{날짜} {시간}부터 {종료시간}까지 시스템 점검이 진행됩니다. 이용에 불편을 드려 죄송합니다.',
      type: 'system',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ];

  const checkAdminAuth = useCallback(async () => {
    try {
      const isValid = await verifyAdmin();
      if (!isValid) {
        navigate('/admin/login');
        return;
      }
      await loadData();
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

  const loadData = async () => {
    try {
      // 실제 환경에서는 API 호출
      setTimeout(() => {
        setNotifications(mockNotifications);
        setFilteredNotifications(mockNotifications);
        setTemplates(mockTemplates);
      }, 500);
    } catch (error) {
      console.error('데이터 로드 중 오류:', error);
    }
  };

  // 알림 필터링
  useEffect(() => {
    let filtered = notifications;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(notif => notif.status === selectedStatus);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(notif => notif.type === selectedType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(notif =>
        notif.title.toLowerCase().includes(term) ||
        notif.content.toLowerCase().includes(term)
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, selectedStatus, selectedType, searchTerm]);

  const handleSendNotification = async () => {
    if (sendForm.title && sendForm.content) {
      try {
        const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          title: sendForm.title,
          content: sendForm.content,
          type: sendForm.type as any,
          targetType: sendForm.targetType as any,
          status: sendForm.isScheduled ? 'scheduled' : 'sent',
          priority: sendForm.priority as any,
          scheduledAt: sendForm.isScheduled ? sendForm.scheduledAt : undefined,
          sentAt: sendForm.isScheduled ? undefined : new Date().toISOString(),
          readCount: 0,
          totalRecipients: sendForm.targetType === 'all' ? 1500 : 
                          sendForm.targetType === 'patients' ? 1200 : 300,
          createdBy: '관리자',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setNotifications(prev => [newNotification, ...prev]);
        
        // 폼 초기화
        setSendForm({
          title: '',
          content: '',
          type: 'general',
          targetType: 'all',
          priority: 'medium',
          scheduledAt: '',
          isScheduled: false
        });

        alert(sendForm.isScheduled ? '알림이 예약되었습니다.' : '알림이 발송되었습니다.');
        setActiveTab('notifications');
      } catch (error) {
        console.error('알림 발송 중 오류:', error);
        alert('알림 발송에 실패했습니다.');
      }
    }
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      title: template.title,
      content: template.content,
      type: template.type,
      isActive: template.isActive
    });
    setShowTemplateModal(true);
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      title: '',
      content: '',
      type: 'general',
      isActive: true
    });
    setShowTemplateModal(true);
  };

  const submitTemplate = async () => {
    if (templateForm.name && templateForm.title && templateForm.content) {
      try {
        if (editingTemplate) {
          // 수정
          const updatedTemplate = {
            ...editingTemplate,
            ...templateForm
          };
          setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
        } else {
          // 추가
          const newTemplate: NotificationTemplate = {
            id: `template-${Date.now()}`,
            ...templateForm,
            createdAt: new Date().toISOString()
          };
          setTemplates(prev => [...prev, newTemplate]);
        }

        setShowTemplateModal(false);
        setEditingTemplate(null);
        alert(editingTemplate ? '템플릿이 수정되었습니다.' : '템플릿이 추가되었습니다.');
      } catch (error) {
        console.error('템플릿 저장 중 오류:', error);
        alert('템플릿 저장에 실패했습니다.');
      }
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (window.confirm('이 템플릿을 삭제하시겠습니까?')) {
      try {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        alert('템플릿이 삭제되었습니다.');
      } catch (error) {
        console.error('템플릿 삭제 중 오류:', error);
        alert('템플릿 삭제에 실패했습니다.');
      }
    }
  };

  const applyTemplate = (template: NotificationTemplate) => {
    setSendForm(prev => ({
      ...prev,
      title: template.title,
      content: template.content,
      type: template.type
    }));
    setActiveTab('send');
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      general: '일반',
      reservation: '예약',
      payment: '결제',
      system: '시스템',
      emergency: '긴급'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: '임시저장', color: '#6B7280' },
      scheduled: { label: '예약됨', color: '#F59E0B' },
      sent: { label: '발송완료', color: '#10B981' },
      failed: { label: '발송실패', color: '#EF4444' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <StatusBadge color={config.color}>
        {config.label}
      </StatusBadge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: '낮음', color: '#10B981' },
      medium: { label: '보통', color: '#F59E0B' },
      high: { label: '높음', color: '#EF4444' },
      urgent: { label: '긴급', color: '#DC2626' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    
    return (
      <PriorityBadge color={config.color}>
        {config.label}
      </PriorityBadge>
    );
  };

  const getStats = () => {
    const total = notifications.length;
    const sent = notifications.filter(n => n.status === 'sent').length;
    const scheduled = notifications.filter(n => n.status === 'scheduled').length;
    const totalReads = notifications.reduce((sum, n) => sum + n.readCount, 0);

    return { total, sent, scheduled, totalReads };
  };

  const stats = getStats();

  if (isLoading) {
    return <LoadingContainer>로딩 중...</LoadingContainer>;
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>알림 관리</Title>
          <Subtitle>사용자 알림 발송 및 관리</Subtitle>
        </HeaderLeft>
        <HeaderRight>
          <LogoutButton onClick={() => adminLogout().then(() => navigate('/admin/login'))}>
            로그아웃
          </LogoutButton>
        </HeaderRight>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.total}</StatNumber>
          <StatLabel>총 알림 수</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.sent}</StatNumber>
          <StatLabel>발송 완료</StatLabel>
        </StatCard>
        <StatCard urgent={stats.scheduled > 0}>
          <StatNumber>{stats.scheduled}</StatNumber>
          <StatLabel>예약된 알림</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.totalReads.toLocaleString()}</StatNumber>
          <StatLabel>총 읽음 수</StatLabel>
        </StatCard>
      </StatsGrid>

      <TabContainer>
        <Tab active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>
          알림 목록
        </Tab>
        <Tab active={activeTab === 'send'} onClick={() => setActiveTab('send')}>
          알림 발송
        </Tab>
        <Tab active={activeTab === 'templates'} onClick={() => setActiveTab('templates')}>
          템플릿 관리
        </Tab>
      </TabContainer>

      {activeTab === 'notifications' && (
        <>
          <FilterSection>
            <FilterGroup>
              <FilterLabel>상태</FilterLabel>
              <FilterSelect value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="all">전체</option>
                <option value="draft">임시저장</option>
                <option value="scheduled">예약됨</option>
                <option value="sent">발송완료</option>
                <option value="failed">발송실패</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>타입</FilterLabel>
              <FilterSelect value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="all">전체</option>
                <option value="general">일반</option>
                <option value="reservation">예약</option>
                <option value="payment">결제</option>
                <option value="system">시스템</option>
                <option value="emergency">긴급</option>
              </FilterSelect>
            </FilterGroup>

            <SearchGroup>
              <SearchInput
                type="text"
                placeholder="제목, 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchGroup>
          </FilterSection>

          <NotificationsTable>
            <TableHeader>
              <HeaderCell>제목</HeaderCell>
              <HeaderCell>타입</HeaderCell>
              <HeaderCell>대상</HeaderCell>
              <HeaderCell>우선순위</HeaderCell>
              <HeaderCell>상태</HeaderCell>
              <HeaderCell>읽음률</HeaderCell>
              <HeaderCell>발송일</HeaderCell>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <NotificationTitle>{notification.title}</NotificationTitle>
                    <NotificationContent>{notification.content.substring(0, 50)}...</NotificationContent>
                  </TableCell>
                  <TableCell>{getTypeLabel(notification.type)}</TableCell>
                  <TableCell>
                    {notification.targetType === 'all' ? '전체' :
                     notification.targetType === 'patients' ? '환자' :
                     notification.targetType === 'doctors' ? '의사' : '특정 사용자'}
                  </TableCell>
                  <TableCell>{getPriorityBadge(notification.priority)}</TableCell>
                  <TableCell>{getStatusBadge(notification.status)}</TableCell>
                  <TableCell>
                    <ReadRate>
                      {notification.totalRecipients > 0 
                        ? `${Math.round((notification.readCount / notification.totalRecipients) * 100)}%`
                        : '0%'
                      }
                    </ReadRate>
                    <ReadCount>
                      {notification.readCount}/{notification.totalRecipients}
                    </ReadCount>
                  </TableCell>
                  <TableCell>
                    {notification.sentAt 
                      ? new Date(notification.sentAt).toLocaleDateString()
                      : notification.scheduledAt 
                        ? `예약: ${new Date(notification.scheduledAt).toLocaleDateString()}`
                        : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </NotificationsTable>

          {filteredNotifications.length === 0 && (
            <EmptyState>
              <EmptyIcon>🔔</EmptyIcon>
              <EmptyText>조건에 맞는 알림이 없습니다.</EmptyText>
            </EmptyState>
          )}
        </>
      )}

      {activeTab === 'send' && (
        <SendSection>
          <SendForm>
            <FormGroup>
              <FormLabel>제목</FormLabel>
              <FormInput
                type="text"
                value={sendForm.title}
                onChange={(e) => setSendForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="알림 제목을 입력하세요"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>내용</FormLabel>
              <FormTextarea
                value={sendForm.content}
                onChange={(e) => setSendForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="알림 내용을 입력하세요"
                rows={5}
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <FormLabel>타입</FormLabel>
                <FormSelect
                  value={sendForm.type}
                  onChange={(e) => setSendForm(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="general">일반</option>
                  <option value="reservation">예약</option>
                  <option value="payment">결제</option>
                  <option value="system">시스템</option>
                  <option value="emergency">긴급</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>대상</FormLabel>
                <FormSelect
                  value={sendForm.targetType}
                  onChange={(e) => setSendForm(prev => ({ ...prev, targetType: e.target.value }))}
                >
                  <option value="all">전체 사용자</option>
                  <option value="patients">환자만</option>
                  <option value="doctors">의사만</option>
                  <option value="specific">특정 사용자</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>우선순위</FormLabel>
                <FormSelect
                  value={sendForm.priority}
                  onChange={(e) => setSendForm(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                  <option value="urgent">긴급</option>
                </FormSelect>
              </FormGroup>
            </FormRow>

            <FormGroup>
              <CheckboxGroup>
                <Checkbox
                  type="checkbox"
                  checked={sendForm.isScheduled}
                  onChange={(e) => setSendForm(prev => ({ ...prev, isScheduled: e.target.checked }))}
                />
                <CheckboxLabel>예약 발송</CheckboxLabel>
              </CheckboxGroup>
              {sendForm.isScheduled && (
                <FormInput
                  type="datetime-local"
                  value={sendForm.scheduledAt}
                  onChange={(e) => setSendForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                />
              )}
            </FormGroup>

            <SendActions>
              <SendButton onClick={handleSendNotification}>
                {sendForm.isScheduled ? '예약 발송' : '즉시 발송'}
              </SendButton>
            </SendActions>
          </SendForm>

          <TemplateQuickAccess>
            <QuickAccessTitle>빠른 템플릿</QuickAccessTitle>
            {templates.filter(t => t.isActive).slice(0, 3).map(template => (
              <TemplateQuickItem key={template.id} onClick={() => applyTemplate(template)}>
                <TemplateQuickName>{template.name}</TemplateQuickName>
                <TemplateQuickTitle>{template.title}</TemplateQuickTitle>
              </TemplateQuickItem>
            ))}
          </TemplateQuickAccess>
        </SendSection>
      )}

      {activeTab === 'templates' && (
        <>
          <TemplateHeader>
            <TemplateTitle>알림 템플릿</TemplateTitle>
            <AddButton onClick={handleAddTemplate}>
              템플릿 추가
            </AddButton>
          </TemplateHeader>

          <TemplateList>
            {templates.map((template) => (
              <TemplateItem key={template.id}>
                <TemplateContent>
                  <TemplateItemName>{template.name}</TemplateItemName>
                  <TemplateItemTitle>{template.title}</TemplateItemTitle>
                  <TemplateItemContent>{template.content}</TemplateItemContent>
                  <TemplateMeta>
                    타입: {getTypeLabel(template.type)} | 상태: {template.isActive ? '활성' : '비활성'}
                  </TemplateMeta>
                </TemplateContent>
                <TemplateActions>
                  <UseButton onClick={() => applyTemplate(template)}>
                    사용
                  </UseButton>
                  <EditButton onClick={() => handleEditTemplate(template)}>
                    수정
                  </EditButton>
                  <DeleteButton onClick={() => deleteTemplate(template.id)}>
                    삭제
                  </DeleteButton>
                </TemplateActions>
              </TemplateItem>
            ))}
          </TemplateList>

          {templates.length === 0 && (
            <EmptyState>
              <EmptyIcon>📝</EmptyIcon>
              <EmptyText>등록된 템플릿이 없습니다.</EmptyText>
            </EmptyState>
          )}
        </>
      )}

      {/* 템플릿 모달 */}
      {showTemplateModal && (
        <ModalOverlay onClick={() => setShowTemplateModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingTemplate ? '템플릿 수정' : '템플릿 추가'}</ModalTitle>
              <CloseButton onClick={() => setShowTemplateModal(false)}>&times;</CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <FormLabel>템플릿 이름</FormLabel>
                <FormInput
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="템플릿 이름을 입력하세요"
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>제목</FormLabel>
                <FormInput
                  type="text"
                  value={templateForm.title}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="알림 제목을 입력하세요"
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>내용</FormLabel>
                <FormTextarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="알림 내용을 입력하세요 (변수: {날짜}, {시간}, {병원명} 등)"
                  rows={4}
                />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <FormLabel>타입</FormLabel>
                  <FormSelect
                    value={templateForm.type}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="general">일반</option>
                    <option value="reservation">예약</option>
                    <option value="payment">결제</option>
                    <option value="system">시스템</option>
                    <option value="emergency">긴급</option>
                  </FormSelect>
                </FormGroup>
                <FormGroup>
                  <FormLabel>상태</FormLabel>
                  <FormSelect
                    value={templateForm.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </FormSelect>
                </FormGroup>
              </FormRow>
              <ModalActions>
                <CancelButton onClick={() => setShowTemplateModal(false)}>
                  취소
                </CancelButton>
                <SubmitButton onClick={submitTemplate}>
                  {editingTemplate ? '수정' : '추가'}
                </SubmitButton>
              </ModalActions>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

// 스타일 컴포넌트들
const Container = styled.div`
  padding: var(--spacing-lg);
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: var(--spacing-xs);
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
`;

const HeaderRight = styled.div``;

const LogoutButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e3819d;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
`;

const StatCard = styled.div<{ urgent?: boolean }>`
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-left: 4px solid ${props => props.urgent ? '#EF4444' : 'var(--primary-color)'};
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: var(--spacing-xs);
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const TabContainer = styled.div`
  display: flex;
  background-color: white;
  border-radius: 15px;
  padding: 4px;
  margin-bottom: var(--spacing-xl);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: var(--spacing-md);
  background-color: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : '#f8f9fa'};
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-md);
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const FilterSelect = styled.select`
  padding: var(--spacing-sm);
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SearchGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const SearchInput = styled.input`
  padding: var(--spacing-sm);
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const NotificationsTable = styled.div`
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
  background-color: #f8f9fa;
  padding: var(--spacing-md);
  font-weight: 500;
  color: #333;
`;

const HeaderCell = styled.div`
  font-size: 14px;
`;

const TableBody = styled.div``;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
  padding: var(--spacing-md);
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.div`
  font-size: 14px;
  color: #333;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const NotificationTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const NotificationContent = styled.div`
  font-size: 12px;
  color: #666;
`;

const ReadRate = styled.div`
  font-weight: 500;
  margin-bottom: 2px;
`;

const ReadCount = styled.div`
  font-size: 12px;
  color: #666;
`;

const StatusBadge = styled.span<{ color: string }>`
  background-color: ${props => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
`;

const PriorityBadge = styled.span<{ color: string }>`
  background-color: ${props => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
`;

const SendSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-xl);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SendForm = styled.div`
  background-color: white;
  padding: var(--spacing-xl);
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: var(--spacing-xs);
`;

const FormInput = styled.input`
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
`;

const Checkbox = styled.input``;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #333;
`;

const SendActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const SendButton = styled.button`
  padding: var(--spacing-md) var(--spacing-xl);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e3819d;
  }
`;

const TemplateQuickAccess = styled.div`
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const QuickAccessTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: var(--spacing-md);
`;

const TemplateQuickItem = styled.div`
  padding: var(--spacing-md);
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f8f9fa;
    border-color: var(--primary-color);
  }
`;

const TemplateQuickName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const TemplateQuickTitle = styled.div`
  font-size: 12px;
  color: #666;
`;

const TemplateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

const TemplateTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

const AddButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e3819d;
  }
`;

const TemplateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const TemplateItem = styled.div`
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const TemplateContent = styled.div`
  flex: 1;
`;

const TemplateItemName = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: var(--spacing-xs);
`;

const TemplateItemTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #666;
  margin-bottom: var(--spacing-xs);
`;

const TemplateItemContent = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: var(--spacing-sm);
`;

const TemplateMeta = styled.div`
  font-size: 12px;
  color: #999;
`;

const TemplateActions = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const UseButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e3819d;
  }
`;

const EditButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: #10B981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #059669;
  }
`;

const DeleteButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: #EF4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #DC2626;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: var(--spacing-md);
`;

const EmptyText = styled.div`
  font-size: 18px;
  color: #666;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid #f0f0f0;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
`;

const ModalBody = styled.div`
  padding: var(--spacing-lg);
`;

const ModalActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
`;

const CancelButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const SubmitButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e3819d;
  }
`;

export default AdminNotificationsPage; 