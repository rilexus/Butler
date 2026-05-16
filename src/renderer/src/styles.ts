import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    ${({ theme }) => (theme as any)?.cssVars ?? ""}
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: transparent;
    color: var(--fg);
    height: 100vh;
    overflow: hidden;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
`;

export const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -1px;
  color: #e94560;
`;

export const Subtitle = styled.p`
  font-size: 1.1rem;
  color: var(--fg-2);
`;
