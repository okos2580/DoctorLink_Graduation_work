import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* 색상 변수 */
    --primary-color: #2C9DB8;
    --primary-dark: #1E7A91;
    --primary-light: #68C3D9;
    --primary-lightest: #D3F2FA;
    
    /* 성공, 에러 색상 업데이트 */
    --success-color: #4CAF50;
    --success-dark: #388E3C;
    --success-light: #A5D6A7;
    
    --error-color: #F44336;
    --error-dark: #D32F2F;
    --error-light: #FFCDD2;
    
    /* 텍스트 색상 업데이트 */
    --text-primary: #2C3E50;
    --text-secondary: #5D6D7E;
    --text-tertiary: #8C9BAA;
    --text-disabled: #BDC3C7;
    
    /* 배경 색상 업데이트 */
    --background-primary: #FFFFFF;
    --background-secondary: #F8FAFC;
    --background-tertiary: #EDF2F7;
    
    /* 회색 톤 업데이트 */
    --gray-50: #F9FAFB;
    --gray-100: #F3F4F6;
    --gray-200: #E5E7EB;
    --gray-300: #D1D5DB;
    --gray-400: #9CA3AF;
    --gray-500: #6B7280;
    --gray-600: #4B5563;
    --gray-700: #374151;
    --gray-800: #1F2937;
    --gray-900: #111827;
    
    /* 강조 및 액션 색상 */
    --accent-color: #4573CB;
    --warning-color: #FF9800;
    
    /* 중성 / 보조 색상 */
    --neutral-color: #64748B;
    --neutral-light: #CBD5E1;
    
    /* 간격 */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-xxl: 48px;
    
    /* 글꼴 크기 */
    --font-size-xs: 12px;
    --font-size-sm: 14px;
    --font-size-md: 16px;
    --font-size-lg: 18px;
    --font-size-xl: 20px;
    --font-size-xxl: 24px;
    --font-size-xxxl: 32px;
    
    /* 글꼴 두께 */
    --font-weight-light: 300;
    --font-weight-regular: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    
    /* 줄 높이 */
    --line-height-tight: 1.2;
    --line-height-normal: 1.5;
    --line-height-loose: 1.8;
    
    /* 테두리 반경 */
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;
    --border-radius-xl: 16px;
    --border-radius-round: 50%;
    
    /* 그림자 */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.05);
    
    /* 트랜지션 */
    --transition-fast: 150ms;
    --transition-normal: 300ms;
    --transition-slow: 500ms;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: var(--text-color);
    background-color: var(--background-light);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  ul, ol {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* 스크롤바 스타일링 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }

  /* 텍스트 선택 스타일 */
  ::selection {
    background-color: var(--primary-color);
    color: white;
  }
`;

export default GlobalStyles; 