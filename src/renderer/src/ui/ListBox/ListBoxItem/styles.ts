import styled, { css } from "styled-components";

type Variant = "default" | "danger";

const variants: Record<Variant, ReturnType<typeof css>> = {
  default: css`
    color: var(--fg);

    &:hover {
      background: var(--hover);
    }

    &[aria-selected="true"] {
      background: var(--selected);
    }
  `,
  danger: css`
    color: #ef4444;

    &:hover {
      background: rgba(239, 68, 68, 0.08);
    }
  `,
};

export const StyledItem = styled.div<{ $variant: Variant }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  transition: background 0.15s ease;

  &:focus-visible {
    box-shadow: inset 0 0 0 2px #4285f4;
  }

  ${({ $variant }) => variants[$variant]}
`;
