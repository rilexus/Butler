import styled, { css } from "styled-components";

type Variant = "default" | "secondary" | "tertiary" | "transparent";

const variants: Record<Variant, ReturnType<typeof css>> = {
  default: css`
    background: #ffffff;
    border: 1px solid transparent;

    @media (prefers-color-scheme: dark) {
      background: #1e1e1e;
    }
  `,
  secondary: css`
    background: #efefef;
    border: 1px solid transparent;

    @media (prefers-color-scheme: dark) {
      background: #252525;
    }
  `,
  tertiary: css`
    background: #e5e5e5;
    border: 1px solid transparent;

    @media (prefers-color-scheme: dark) {
      background: #2d2d2d;
    }
  `,
  transparent: css`
    background: transparent;
    border: 1px solid #d4d4d4;

    @media (prefers-color-scheme: dark) {
      border-color: #3a3a3a;
    }
  `,
};

export const StyledSurface = styled.div<{ $variant: Variant }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: 24px;
  padding: 24px;
  min-width: 320px;

  ${({ $variant }) => variants[$variant]}
`;
