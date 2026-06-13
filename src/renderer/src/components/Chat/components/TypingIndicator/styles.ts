import styled, { keyframes } from "styled-components";

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40%            { transform: translateY(-6px); }
`;

export const Dots = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 14px;
`;

export const Dot = styled.span<{ $delay: number }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--fg-2);
  animation: ${bounce} 0.9s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}ms;
`;
