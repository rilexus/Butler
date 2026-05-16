import styled, { css } from "styled-components";
import { Button as RACButton } from "react-aria-components";

type Variant = "primary" | "secondary" | "tertiary" | "outline" | "ghost" | "danger" | "danger-soft";
type Size = "sm" | "md" | "lg";

const iconOnlySize: Record<Size, string> = {
  sm: "28px",
  md: "36px",
  lg: "42px",
};

const sizes: Record<Size, ReturnType<typeof css>> = {
  sm: css`
    padding: 4px 12px;
    font-size: 12px;
  `,
  md: css`
    padding: 8px 18px;
    font-size: 14px;
  `,
  lg: css`
    padding: 10px 22px;
    font-size: 15px;
  `,
};

const variants: Record<Variant, ReturnType<typeof css>> = {
  primary: css`
    background: #4285f4;
    color: #ffffff;
    border: 1px solid #4285f4;

    &:hover:not([data-disabled]) {
      background: #3367d6;
      border-color: #3367d6;
    }

    &:active:not([data-disabled]),
    &[data-pressed]:not([data-disabled]) {
      background: #2a56c6;
      border-color: #2a56c6;
    }
  `,
  secondary: css`
    background: #e8eaed;
    color: #4285f4;
    border: 1px solid #e8eaed;

    &:hover:not([data-disabled]) {
      background: #dadce0;
      border-color: #dadce0;
    }

    &:active:not([data-disabled]),
    &[data-pressed]:not([data-disabled]) {
      background: #d2d5d9;
      border-color: #d2d5d9;
    }
  `,
  tertiary: css`
    background: var(--selected);
    color: var(--fg);
    border: 1px solid var(--selected);

    &:hover:not([data-disabled]) {
      background: var(--overlay);
      border-color: var(--overlay);
    }

    &:active:not([data-disabled]),
    &[data-pressed]:not([data-disabled]) {
      background: var(--overlay);
      border-color: var(--overlay);
    }
  `,
  outline: css`
    background: transparent;
    color: var(--fg);
    border: 1px solid var(--border-strong);

    &:hover:not([data-disabled]) {
      background: var(--hover);
    }

    &:active:not([data-disabled]),
    &[data-pressed]:not([data-disabled]) {
      background: var(--selected);
    }
  `,
  ghost: css`
    background: transparent;
    color: var(--fg);
    border: 1px solid transparent;

    &:hover:not([data-disabled]) {
      background: var(--hover);
    }

    &:active:not([data-disabled]),
    &[data-pressed]:not([data-disabled]) {
      background: var(--selected);
    }
  `,
  danger: css`
    background: #e05252;
    color: #ffffff;
    border: 1px solid #e05252;

    &:hover:not([data-disabled]) {
      background: #c94040;
      border-color: #c94040;
    }

    &:active:not([data-disabled]),
    &[data-pressed]:not([data-disabled]) {
      background: #b53535;
      border-color: #b53535;
    }
  `,
  "danger-soft": css`
    background: #fde8e8;
    color: #e05252;
    border: 1px solid #fde8e8;

    &:hover:not([data-disabled]) {
      background: #fad5d5;
      border-color: #fad5d5;
    }

    &:active:not([data-disabled]),
    &[data-pressed]:not([data-disabled]) {
      background: #f7c3c3;
      border-color: #f7c3c3;
    }
  `,
};

export const StyledButton = styled(RACButton)<{
  $variant: Variant;
  $size: Size;
  $iconOnly?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 500;
  border-radius: 9999px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
  line-height: 1.5;
  white-space: nowrap;

  svg {
    flex-shrink: 0;
    display: block;
  }

  ${({ $size }) => sizes[$size]}
  ${({ $variant }) => variants[$variant]}

  ${({ $iconOnly, $size }) =>
    $iconOnly &&
    css`
      padding: 0;
      width: ${iconOnlySize[$size]};
      height: ${iconOnlySize[$size]};
    `}

  &:focus-visible {
    outline: 2px solid #4285f4;
    outline-offset: 2px;
  }

  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
