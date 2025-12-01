import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { verifyAdmin, adminLogout } from '../services/adminService';

// 문의 타입
interface Inquiry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  category: 'reservation' | 'payment' | 'medical' | 'technical' | 'other';
  title: string;
  content: string;
  status: 'pending' | 'answered' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  answeredAt?: string;
  answeredBy?: string;
  answer?: string;
  attachments?: string[];
}

// FAQ 타입
interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminCustomerServicePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inquiries' | 'faq'>('inquiries');
  
  // 문의 관련 상태
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [answerText, setAnswerText] = useState('');

  // FAQ 관련 상태
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [faqForm, setFaqForm] = useState({
    category: '',
    question: '',
    answer: '',
    order: 0,
    isActive: true
  });

  // Mock 데이터
  const mockInquiries: Inquiry[] = [
    {
      id: 'inq-001',
      userId: 'user-001',
      userName: '김환자',
      userEmail: 'patient@example.com',
      userPhone: '010-1234-5678',
      category: 'reservation',
      title: '예약 취소 문의',
      content: '내일 예약을 취소하고 싶습니다. 어떻게 해야 하나요?',
      status: 'pending',
      priority: 'medium',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'inq-002',
      userId: 'user-002',
      userName: '박환자',
      userEmail: 'patient2@example.com',
      userPhone: '010-2345-6789',
      category: 'payment',
      title: '결제 오류 문의',
      content: '결제가 두 번 처리된 것 같습니다. 확인 부탁드립니다.',
      status: 'answered',
      priority: 'high',
      createdAt: '2024-01-14T14:20:00Z',
      answeredAt: '2024-01-14T16:30:00Z',
      answeredBy: '관리자',
      answer: '결제 내역을 확인한 결과, 중복 결제가 확인되었습니다. 환불 처리해드렸습니다.'
    },
    {
      id: 'inq-003',
      userId: 'user-003',
      userName: '최환자',
      userEmail: 'patient3@example.com',
      userPhone: '010-3456-7890',
      category: 'technical',
      title: '앱 로그인 문제',
      content: '앱에서 로그인이 안 됩니다. 비밀번호를 재설정해도 같은 문제가 발생합니다.',
      status: 'pending',
      priority: 'urgent',
      createdAt: '2024-01-16T09:15:00Z'
    }
  ];

  const mockFaqs: FAQ[] = [
    {
      id: 'faq-001',
      category: '예약',
      question: '예약은 어떻게 하나요?',
      answer: '홈페이지에서 원하는 병원과 의사를 선택한 후 예약 가능한 시간을 선택하여 예약할 수 있습니다.',
      order: 1,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'faq-002',
      category: '예약',
      question: '예약 취소는 언제까지 가능한가요?',
      answer: '예약 시간 2시간 전까지 취소 가능합니다. 그 이후에는 병원에 직접 연락해주세요.',
      order: 2,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'faq-003',
      category: '결제',
      question: '결제 방법은 어떤 것들이 있나요?',
      answer: '신용카드, 체크카드, 계좌이체, 간편결제(카카오페이, 네이버페이) 등을 지원합니다.',
      order: 3,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
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
        setInquiries(mockInquiries);
        setFilteredInquiries(mockInquiries);
        setFaqs(mockFaqs);
      }, 500);
    } catch (error) {
      console.error('데이터 로드 중 오류:', error);
    }
  };

  // 문의 필터링
  useEffect(() => {
    let filtered = inquiries;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === selectedStatus);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(inquiry =>
        inquiry.title.toLowerCase().includes(term) ||
        inquiry.content.toLowerCase().includes(term) ||
        inquiry.userName.toLowerCase().includes(term)
      );
    }

    setFilteredInquiries(filtered);
  }, [inquiries, selectedStatus, selectedCategory, searchTerm]);

  const handleAnswerInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setAnswerText(inquiry.answer || '');
    setShowAnswerModal(true);
  };

  const submitAnswer = async () => {
    if (selectedInquiry && answerText.trim()) {
      try {
        // 실제 환경에서는 API 호출
        const updatedInquiry = {
          ...selectedInquiry,
          status: 'answered' as const,
          answer: answerText,
          answeredAt: new Date().toISOString(),
          answeredBy: '관리자'
        };

        setInquiries(prev => 
          prev.map(inq => inq.id === selectedInquiry.id ? updatedInquiry : inq)
        );

        setShowAnswerModal(false);
        setSelectedInquiry(null);
        setAnswerText('');
        alert('답변이 등록되었습니다.');
      } catch (error) {
        console.error('답변 등록 중 오류:', error);
        alert('답변 등록에 실패했습니다.');
      }
    }
  };

  const handleEditFaq = (faq: FAQ) => {
    setEditingFaq(faq);
    setFaqForm({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
      isActive: faq.isActive
    });
    setShowFaqModal(true);
  };

  const handleAddFaq = () => {
    setEditingFaq(null);
    setFaqForm({
      category: '',
      question: '',
      answer: '',
      order: faqs.length + 1,
      isActive: true
    });
    setShowFaqModal(true);
  };

  const submitFaq = async () => {
    if (faqForm.category && faqForm.question && faqForm.answer) {
      try {
        if (editingFaq) {
          // 수정
          const updatedFaq = {
            ...editingFaq,
            ...faqForm,
            updatedAt: new Date().toISOString()
          };
          setFaqs(prev => prev.map(faq => faq.id === editingFaq.id ? updatedFaq : faq));
        } else {
          // 추가
          const newFaq: FAQ = {
            id: `faq-${Date.now()}`,
            ...faqForm,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setFaqs(prev => [...prev, newFaq]);
        }

        setShowFaqModal(false);
        setEditingFaq(null);
        alert(editingFaq ? 'FAQ가 수정되었습니다.' : 'FAQ가 추가되었습니다.');
      } catch (error) {
        console.error('FAQ 저장 중 오류:', error);
        alert('FAQ 저장에 실패했습니다.');
      }
    }
  };

  const deleteFaq = async (faqId: string) => {
    if (window.confirm('이 FAQ를 삭제하시겠습니까?')) {
      try {
        setFaqs(prev => prev.filter(faq => faq.id !== faqId));
        alert('FAQ가 삭제되었습니다.');
      } catch (error) {
        console.error('FAQ 삭제 중 오류:', error);
        alert('FAQ 삭제에 실패했습니다.');
      }
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      reservation: '예약',
      payment: '결제',
      medical: '진료',
      technical: '기술',
      other: '기타'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '대기', color: '#F59E0B' },
      answered: { label: '답변완료', color: '#10B981' },
      closed: { label: '종료', color: '#6B7280' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
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
    const total = inquiries.length;
    const pending = inquiries.filter(inq => inq.status === 'pending').length;
    const answered = inquiries.filter(inq => inq.status === 'answered').length;
    const urgent = inquiries.filter(inq => inq.priority === 'urgent').length;

    return { total, pending, answered, urgent };
  };

  const stats = getStats();

  if (isLoading) {
    return <LoadingContainer>로딩 중...</LoadingContainer>;
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>고객센터 관리</Title>
          <Subtitle>문의 답변 및 FAQ 관리</Subtitle>
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
          <StatLabel>총 문의 수</StatLabel>
        </StatCard>
        <StatCard urgent={stats.pending > 0}>
          <StatNumber>{stats.pending}</StatNumber>
          <StatLabel>대기 중인 문의</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.answered}</StatNumber>
          <StatLabel>답변 완료</StatLabel>
        </StatCard>
        <StatCard urgent={stats.urgent > 0}>
          <StatNumber>{stats.urgent}</StatNumber>
          <StatLabel>긴급 문의</StatLabel>
        </StatCard>
      </StatsGrid>

      <TabContainer>
        <Tab active={activeTab === 'inquiries'} onClick={() => setActiveTab('inquiries')}>
          문의 관리
        </Tab>
        <Tab active={activeTab === 'faq'} onClick={() => setActiveTab('faq')}>
          FAQ 관리
        </Tab>
      </TabContainer>

      {activeTab === 'inquiries' && (
        <>
          <FilterSection>
            <FilterGroup>
              <FilterLabel>상태</FilterLabel>
              <FilterSelect value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="all">전체</option>
                <option value="pending">대기</option>
                <option value="answered">답변완료</option>
                <option value="closed">종료</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>카테고리</FilterLabel>
              <FilterSelect value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="all">전체</option>
                <option value="reservation">예약</option>
                <option value="payment">결제</option>
                <option value="medical">진료</option>
                <option value="technical">기술</option>
                <option value="other">기타</option>
              </FilterSelect>
            </FilterGroup>

            <SearchGroup>
              <SearchInput
                type="text"
                placeholder="제목, 내용, 사용자명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchGroup>
          </FilterSection>

          <InquiriesTable>
            <TableHeader>
              <HeaderCell>사용자</HeaderCell>
              <HeaderCell>카테고리</HeaderCell>
              <HeaderCell>제목</HeaderCell>
              <HeaderCell>우선순위</HeaderCell>
              <HeaderCell>상태</HeaderCell>
              <HeaderCell>등록일</HeaderCell>
              <HeaderCell>작업</HeaderCell>
            </TableHeader>
            <TableBody>
              {filteredInquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell>
                    <UserInfo>
                      <UserName>{inquiry.userName}</UserName>
                      <UserEmail>{inquiry.userEmail}</UserEmail>
                    </UserInfo>
                  </TableCell>
                  <TableCell>{getCategoryLabel(inquiry.category)}</TableCell>
                  <TableCell>
                    <InquiryTitle>{inquiry.title}</InquiryTitle>
                  </TableCell>
                  <TableCell>{getPriorityBadge(inquiry.priority)}</TableCell>
                  <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                  <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <ActionButton onClick={() => handleAnswerInquiry(inquiry)}>
                      {inquiry.status === 'pending' ? '답변하기' : '답변보기'}
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </InquiriesTable>

          {filteredInquiries.length === 0 && (
            <EmptyState>
              <EmptyIcon>💬</EmptyIcon>
              <EmptyText>조건에 맞는 문의가 없습니다.</EmptyText>
            </EmptyState>
          )}
        </>
      )}

      {activeTab === 'faq' && (
        <>
          <FaqHeader>
            <FaqTitle>FAQ 목록</FaqTitle>
            <AddButton onClick={handleAddFaq}>
              FAQ 추가
            </AddButton>
          </FaqHeader>

          <FaqList>
            {faqs.map((faq) => (
              <FaqItem key={faq.id}>
                <FaqContent>
                  <FaqCategory>{faq.category}</FaqCategory>
                  <FaqQuestion>{faq.question}</FaqQuestion>
                  <FaqAnswer>{faq.answer}</FaqAnswer>
                  <FaqMeta>
                    순서: {faq.order} | 상태: {faq.isActive ? '활성' : '비활성'}
                  </FaqMeta>
                </FaqContent>
                <FaqActions>
                  <EditButton onClick={() => handleEditFaq(faq)}>
                    수정
                  </EditButton>
                  <DeleteButton onClick={() => deleteFaq(faq.id)}>
                    삭제
                  </DeleteButton>
                </FaqActions>
              </FaqItem>
            ))}
          </FaqList>

          {faqs.length === 0 && (
            <EmptyState>
              <EmptyIcon>❓</EmptyIcon>
              <EmptyText>등록된 FAQ가 없습니다.</EmptyText>
            </EmptyState>
          )}
        </>
      )}

      {/* 답변 모달 */}
      {showAnswerModal && selectedInquiry && (
        <ModalOverlay onClick={() => setShowAnswerModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>문의 답변</ModalTitle>
              <CloseButton onClick={() => setShowAnswerModal(false)}>&times;</CloseButton>
            </ModalHeader>
            <ModalBody>
              <InquiryDetail>
                <DetailLabel>문의자</DetailLabel>
                <DetailValue>{selectedInquiry.userName} ({selectedInquiry.userEmail})</DetailValue>
              </InquiryDetail>
              <InquiryDetail>
                <DetailLabel>제목</DetailLabel>
                <DetailValue>{selectedInquiry.title}</DetailValue>
              </InquiryDetail>
              <InquiryDetail>
                <DetailLabel>내용</DetailLabel>
                <DetailValue>{selectedInquiry.content}</DetailValue>
              </InquiryDetail>
              <InquiryDetail>
                <DetailLabel>답변</DetailLabel>
                <AnswerTextarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="답변을 입력해주세요..."
                  rows={5}
                />
              </InquiryDetail>
              <ModalActions>
                <CancelButton onClick={() => setShowAnswerModal(false)}>
                  취소
                </CancelButton>
                <SubmitButton onClick={submitAnswer}>
                  답변 등록
                </SubmitButton>
              </ModalActions>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* FAQ 모달 */}
      {showFaqModal && (
        <ModalOverlay onClick={() => setShowFaqModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingFaq ? 'FAQ 수정' : 'FAQ 추가'}</ModalTitle>
              <CloseButton onClick={() => setShowFaqModal(false)}>&times;</CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <FormLabel>카테고리</FormLabel>
                <FormInput
                  type="text"
                  value={faqForm.category}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="카테고리를 입력하세요"
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>질문</FormLabel>
                <FormInput
                  type="text"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="질문을 입력하세요"
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>답변</FormLabel>
                <FormTextarea
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="답변을 입력하세요"
                  rows={4}
                />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <FormLabel>순서</FormLabel>
                  <FormInput
                    type="number"
                    value={faqForm.order}
                    onChange={(e) => setFaqForm(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>상태</FormLabel>
                  <FormSelect
                    value={faqForm.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFaqForm(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </FormSelect>
                </FormGroup>
              </FormRow>
              <ModalActions>
                <CancelButton onClick={() => setShowFaqModal(false)}>
                  취소
                </CancelButton>
                <SubmitButton onClick={submitFaq}>
                  {editingFaq ? '수정' : '추가'}
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

const InquiriesTable = styled.div`
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 2fr 1fr 1fr 1fr 1fr;
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
  grid-template-columns: 1.5fr 1fr 2fr 1fr 1fr 1fr 1fr;
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
  align-items: center;
`;

const UserInfo = styled.div``;

const UserName = styled.div`
  font-weight: 500;
  margin-bottom: 2px;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: #666;
`;

const InquiryTitle = styled.div`
  font-weight: 500;
`;

const StatusBadge = styled.span<{ color: string }>`
  background-color: ${props => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
`;

const PriorityBadge = styled.span<{ color: string }>`
  background-color: ${props => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
`;

const ActionButton = styled.button`
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

const FaqHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

const FaqTitle = styled.h2`
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

const FaqList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FaqItem = styled.div`
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const FaqContent = styled.div`
  flex: 1;
`;

const FaqCategory = styled.div`
  background-color: var(--primary-color);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  margin-bottom: var(--spacing-sm);
`;

const FaqQuestion = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: var(--spacing-sm);
`;

const FaqAnswer = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: var(--spacing-sm);
`;

const FaqMeta = styled.div`
  font-size: 12px;
  color: #999;
`;

const FaqActions = styled.div`
  display: flex;
  gap: var(--spacing-xs);
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

const InquiryDetail = styled.div`
  margin-bottom: var(--spacing-md);
`;

const DetailLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: var(--spacing-xs);
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
`;

const AnswerTextarea = styled.textarea`
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

const FormGroup = styled.div`
  margin-bottom: var(--spacing-md);
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
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

export default AdminCustomerServicePage; 