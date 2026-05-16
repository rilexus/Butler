import styled from "styled-components";

type Size = "sm" | "md" | "lg";

const trackSize: Record<Size, { width: string; height: string }> = {
  sm: { width: "36px", height: "20px" },
  md: { width: "44px", height: "24px" },
  lg: { width: "52px", height: "28px" },
};

const thumbSize: Record<Size, string> = {
  sm: "16px",
  md: "20px",
  lg: "24px",
};

const thumbTravel: Record<Size, string> = {
  sm: "16px",
  md: "20px",
  lg: "24px",
};

export const SwitchRoot = styled.label<{ $disabled: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`;

export const VisuallyHidden = styled.span`
  border: 0;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
`;

export const Track = styled.span<{ $checked: boolean; $size: Size }>`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  width: ${({ $size }) => trackSize[$size].width};
  height: ${({ $size }) => trackSize[$size].height};
  border-radius: 999px;
  padding: 2px;
  background: ${({ $checked }) => ($checked ? "#4285f4" : "var(--border-strong)")};
  transition: background 0.2s ease;
`;

export const Thumb = styled.span<{ $checked: boolean; $size: Size }>`
  width: ${({ $size }) => thumbSize[$size]};
  height: ${({ $size }) => thumbSize[$size]};
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
  transform: translateX(${({ $checked, $size }) => ($checked ? thumbTravel[$size] : "0")});
`;

export const SwitchContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SwitchLabel = styled.label`
  font-size: 15px;
  font-weight: 500;
  color: var(--fg);
  cursor: inherit;
  pointer-events: none;
`;
