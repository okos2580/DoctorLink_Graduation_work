import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

// FAQ 데이터
const faqData = [
  {
    question: '예약을 어떻게 취소하나요?',
    answer: '마이페이지 > 예약 내역에서 취소하고자 하는 예약을 선택하여 취소할 수 있습니다. 단, 예약 시간 24시간 이내에는 취소 수수료가 발생할 수 있습니다.'
  },
  {
    question: '의사를 어떻게 검색하나요?',
    answer: '예약하기 페이지에서 병원 선택 후 해당 병원의 의사 목록을 확인하거나, 전문 분야나 이름으로 검색할 수 있습니다.'
  },
  {
    question: '가입한 아이디와 비밀번호를 잊어버렸어요.',
    answer: '로그인 페이지에서 "아이디/비밀번호 찾기" 기능을 통해 가입 시 등록한 이메일이나 휴대폰 번호로 인증 후 확인할 수 있습니다.'
  },
  {
    question: '진료 기록은 어디서 확인할 수 있나요?',
    answer: '로그인 후 마이페이지 > 진료 기록에서 이전의 모든 진료 기록을 확인할 수 있습니다. 진료일, 병원, 의사, 진단내용 등이 상세히 기록되어 있습니다.'
  },
  {
    question: '결제 방법은 어떤 것이 있나요?',
    answer: '신용카드, 실시간 계좌이체, 휴대폰 결제, 간편결제(카카오페이, 네이버페이, 페이코 등) 서비스를 지원합니다.'
  },
  {
    question: '이용 중 문제가 발생했을 때 어떻게 문의하나요?',
    answer: '고객센터 페이지에서 1:1 문의하기를 통해 문의하시거나, 고객센터 전화번호(1588-1234)로 연락주시면 신속히 도움드리겠습니다.'
  }
];

const ContactPage: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 실제 구현에서는 API 호출을 통해 데이터를 서버로 전송
    // 여기서는 시뮬레이션
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // 성공 메시지 3초 후 제거
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    }, 1500);
  };
  
  return (
    <PageContainer>
      <Header />
      <MainContent>
        <Hero
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <HeroContent>
            <HeroTitle>고객센터</HeroTitle>
            <HeroSubtitle>궁금한 점이 있으신가요? 저희가 도와드리겠습니다.</HeroSubtitle>
          </HeroContent>
        </Hero>
        
        <ContentSection>
          <ContactInfoContainer>
            <ContactInfoCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ContactInfoIcon>
                <i className="fas fa-phone-alt"></i>
              </ContactInfoIcon>
              <ContactInfoTitle>전화 문의</ContactInfoTitle>
              <ContactInfoText>1588-1234</ContactInfoText>
              <ContactInfoDetail>평일 09:00 - 18:00 (공휴일 제외)</ContactInfoDetail>
            </ContactInfoCard>
            
            <ContactInfoCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ContactInfoIcon>
                <i className="fas fa-envelope"></i>
              </ContactInfoIcon>
              <ContactInfoTitle>이메일 문의</ContactInfoTitle>
              <ContactInfoText>support@doctorlink.com</ContactInfoText>
              <ContactInfoDetail>24시간 접수 가능 (답변은 영업일 기준)</ContactInfoDetail>
            </ContactInfoCard>
            
            <ContactInfoCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ContactInfoIcon>
                <i className="fas fa-comments"></i>
              </ContactInfoIcon>
              <ContactInfoTitle>채팅 상담</ContactInfoTitle>
              <ContactInfoText>실시간 채팅</ContactInfoText>
              <ContactInfoDetail>평일 09:00 - 22:00 (공휴일 제외)</ContactInfoDetail>
            </ContactInfoCard>
          </ContactInfoContainer>
          
          <SectionDivider />
          
          <FAQSection
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <SectionTitle>자주 묻는 질문</SectionTitle>
            <FAQContainer>
              {faqData.map((faq, index) => (
                <FAQItem key={index}>
                  <FAQQuestion onClick={() => toggleFaq(index)} $isActive={activeIndex === index}>
                    <FAQQuestionText>{faq.question}</FAQQuestionText>
                    <FAQIcon $isActive={activeIndex === index}>
                      <i className="fas fa-chevron-down"></i>
                    </FAQIcon>
                  </FAQQuestion>
                  <FAQAnswer
                    initial={false}
                    animate={{ height: activeIndex === index ? 'auto' : 0, opacity: activeIndex === index ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FAQAnswerContent>{faq.answer}</FAQAnswerContent>
                  </FAQAnswer>
                </FAQItem>
              ))}
            </FAQContainer>
          </FAQSection>
          
          <SectionDivider />
          
          <ContactFormSection
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <SectionTitle>1:1 문의하기</SectionTitle>
            <ContactFormContainer>
              {submitSuccess && (
                <SuccessMessage>
                  <i className="fas fa-check-circle"></i> 문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.
                </SuccessMessage>
              )}
              <ContactForm onSubmit={handleSubmit}>
                <FormGroup>
                  <FormLabel htmlFor="name">이름</FormLabel>
                  <FormInput
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="이름을 입력하세요"
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="email">이메일</FormLabel>
                  <FormInput
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="이메일을 입력하세요"
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="subject">제목</FormLabel>
                  <FormInput
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="문의 제목을 입력하세요"
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="message">문의 내용</FormLabel>
                  <FormTextarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="문의 내용을 자세히 입력해주세요"
                    rows={5}
                  />
                </FormGroup>
                
                <SubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '제출 중...' : '문의하기'}
                </SubmitButton>
              </ContactForm>
            </ContactFormContainer>
          </ContactFormSection>
          
          <MapSection
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <SectionTitle>찾아오시는 길</SectionTitle>
            <MapContainer>
              {/* 실제 구현에서는 구글 맵이나 카카오 맵 API를 연동 */}
              <MapPlaceholder>
                <MapIcon>
                  <i className="fas fa-map-marked-alt"></i>
                </MapIcon>
                <MapText>서울특별시 강남구 테헤란로 123 DoctorLink 빌딩 5층</MapText>
              </MapPlaceholder>
              <AddressInfoContainer>
                <AddressInfoItem>
                  <AddressInfoIcon>
                    <i className="fas fa-subway"></i>
                  </AddressInfoIcon>
                  <AddressInfoText>
                    <strong>지하철</strong>: 2호선 강남역 3번 출구에서 도보 5분
                  </AddressInfoText>
                </AddressInfoItem>
                <AddressInfoItem>
                  <AddressInfoIcon>
                    <i className="fas fa-bus"></i>
                  </AddressInfoIcon>
                  <AddressInfoText>
                    <strong>버스</strong>: 강남역 정류장 하차 (간선 143, 145, 233 / 지선 3411)
                  </AddressInfoText>
                </AddressInfoItem>
                <AddressInfoItem>
                  <AddressInfoIcon>
                    <i className="fas fa-car"></i>
                  </AddressInfoIcon>
                  <AddressInfoText>
                    <strong>주차</strong>: 건물 지하 주차장 이용 (최초 1시간 무료)
                  </AddressInfoText>
                </AddressInfoItem>
              </AddressInfoContainer>
            </MapContainer>
          </MapSection>
        </ContentSection>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
`;

const Hero = styled.section`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  padding: var(--spacing-xl) var(--spacing-md);
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: var(--spacing-sm);

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: ${props => props.theme.typography.fontSize['2xl']};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  opacity: 0.9;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: ${props => props.theme.typography.fontSize.md};
  }
`;

const ContentSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
`;

const ContactInfoContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const ContactInfoCard = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: var(--spacing-lg);
  text-align: center;
  box-shadow: ${props => props.theme.shadows.md};
  transition: transform ${props => props.theme.transition.normal};
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ContactInfoIcon = styled.div`
  font-size: 2.5rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: var(--spacing-md);
`;

const ContactInfoTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: var(--spacing-sm);
`;

const ContactInfoText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[800]};
  margin-bottom: var(--spacing-xs);
`;

const ContactInfoDetail = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
`;

const SectionDivider = styled.hr`
  border: none;
  height: 1px;
  background-color: ${props => props.theme.colors.gray[200]};
  margin: var(--spacing-xl) 0;
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: var(--spacing-lg);
  text-align: center;
`;

const FAQSection = styled.section`
  margin-bottom: var(--spacing-xl);
`;

const FAQContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FAQItem = styled.div`
  margin-bottom: var(--spacing-md);
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
`;

interface FAQQuestionProps {
  $isActive: boolean;
}

const FAQQuestion = styled.div<FAQQuestionProps>`
  padding: var(--spacing-md);
  background-color: ${props => props.$isActive ? props.theme.colors.gray[100] : 'white'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
  }
`;

const FAQQuestionText = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[900]};
`;

interface FAQIconProps {
  $isActive: boolean;
}

const FAQIcon = styled.span<FAQIconProps>`
  transform: ${props => props.$isActive ? 'rotate(180deg)' : 'rotate(0)'};
  transition: transform ${props => props.theme.transition.fast};
  color: ${props => props.theme.colors.gray[600]};
`;

const FAQAnswer = styled(motion.div)`
  overflow: hidden;
  background-color: white;
`;

const FAQAnswerContent = styled.p`
  padding: var(--spacing-md);
  font-size: ${props => props.theme.typography.fontSize.md};
  line-height: 1.6;
  color: ${props => props.theme.colors.gray[700]};
  border-top: 1px solid ${props => props.theme.colors.gray[200]};
`;

const ContactFormSection = styled.section`
  margin-bottom: var(--spacing-xl);
`;

const ContactFormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: var(--spacing-lg);
  box-shadow: ${props => props.theme.shadows.md};
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[800]};
  margin-bottom: var(--spacing-xs);
`;

const FormInput = styled.input`
  padding: var(--spacing-md);
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  transition: border-color ${props => props.theme.transition.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray[400]};
  }
`;

const FormTextarea = styled.textarea`
  padding: var(--spacing-md);
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  resize: vertical;
  transition: border-color ${props => props.theme.transition.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray[400]};
  }
`;

const SubmitButton = styled.button`
  padding: var(--spacing-md);
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color ${props => props.theme.transition.fast},
    transform ${props => props.theme.transition.fast};
  
  &:hover:not(:disabled) {
    background-color: #e3819d;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray[400]};
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background-color: ${props => props.theme.colors.success};
  color: white;
  padding: var(--spacing-md);
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  i {
    font-size: ${props => props.theme.typography.fontSize.lg};
  }
`;

const MapSection = styled.section`
  margin-bottom: var(--spacing-xl);
`;

const MapContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const MapPlaceholder = styled.div`
  height: 300px;
  background-color: ${props => props.theme.colors.gray[100]};
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

const MapIcon = styled.div`
  font-size: 4rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: var(--spacing-md);
`;

const MapText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.gray[700]};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-align: center;
  max-width: 80%;
`;

const AddressInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const AddressInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const AddressInfoIcon = styled.div`
  width: 40px;
  height: 40px;
  background-color: ${props => props.theme.colors.gray[100]};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const AddressInfoText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.gray[700]};
`;

export default ContactPage; 