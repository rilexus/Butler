import styled from "styled-components";
import { Dialog, Popover as RACPopover } from "react-aria-components";

export const StyledPopover = styled(RACPopover)`
  background: #1c1c1e;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  outline: none;

  @media (prefers-color-scheme: light) {
    background: #ffffff;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 1px solid #e5e7eb;
  }

  &[data-entering] {
    animation: popover-in 0.15s ease;
  }

  &[data-exiting] {
    animation: popover-out 0.1s ease forwards;
  }

  @keyframes popover-in {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(-4px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes popover-out {
    from {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    to {
      opacity: 0;
      transform: scale(0.96) translateY(-4px);
    }
  }
`;

export const StyledDialog = styled(Dialog)`
  padding: 14px 16px;
  outline: none;
  min-width: 200px;
  max-width: 320px;
`;

export const PopoverHeading = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 6px;

  @media (prefers-color-scheme: light) {
    color: #111827;
  }
`;

export const PopoverBody = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);

  @media (prefers-color-scheme: light) {
    color: #6b7280;
  }
`;
