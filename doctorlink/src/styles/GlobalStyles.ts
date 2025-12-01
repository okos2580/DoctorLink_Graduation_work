import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* 기본 박스 모델 */
  * {
    margin: 0;
    padding: 0;
    border: 0;
    box-sizing: border-box;
    overscroll-behavior: contain;
  }

  /* 스크롤 동작 */
  html, body {
    -webkit-overflow-scrolling: touch;
    height: 100%;
  }

  /* 타이포그래피 시스템 */
  html {
    font-size: 62.5%; /* 10px */
    
    @media screen and (max-width: 1280px) {
      font-size: 43.75%;
    }

    @media screen and (max-width: 1023px) {
      font-size: 43.75%;
    }
  }

  body {
    font-family: SMTOWN, Pretendard, "Noto Sans KR", sans-serif, "sans-serif", AppleGothic, applegothic;
    font-size: 1.3rem; /* 13px */
    font-weight: 400;
    line-height: 1;
    color: #191919;
    background-color: #fff;
  }

  /* 텍스트 선택 스타일 */
  ::selection {
    background: #f297b3;
    color: #fff;
    text-shadow: none;
  }

  /* CSS 변수 */
  :root {
    --swiper-theme-color: #007aff;
    --swiper-navigation-size: 44px;
    
    /* 커스텀 변수 */
    --primary-color: #f297b3;
    --secondary-color: #007aff;
    --text-color: #191919;
    --background-color: #fff;
    --border-color: #eaeaea;
    --error-color: #ff3b30;
    --success-color: #34c759;
    --warning-color: #ff9500;
    --info-color: #5ac8fa;
    
    /* 간격 시스템 */
    --spacing-xs: 0.4rem;
    --spacing-sm: 0.8rem;
    --spacing-md: 1.6rem;
    --spacing-lg: 2.4rem;
    --spacing-xl: 3.2rem;
    --spacing-xxl: 4.8rem;
    
    /* 그림자 시스템 */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    --shadow-md: 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12);
    --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05);
    
    /* 애니메이션 시스템 */
    --transition-fast: 0.15s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
  }

  /* 링크 스타일 */
  a {
    color: var(--secondary-color);
    text-decoration: none;
    transition: color var(--transition-fast);
    
    &:hover {
      color: var(--primary-color);
    }
  }

  /* 기본 버튼 스타일 제거 */
  button {
    background: none;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
  }

  /* 이미지 기본 스타일 */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* 목록 스타일 제거 */
  ul, ol {
    list-style: none;
  }

  /* 테이블 기본 스타일 */
  table {
    border-collapse: collapse;
    width: 100%;
  }
`;

export default GlobalStyles; 