import styled from "styled-components";
import { Button as RACButton, Dialog, Modal as RACModal, ModalOverlay as RACModalOverlay } from "react-aria-components";

export const StyledModalOverlay = styled(RACModalOverlay)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);

  &[data-entering] {
    animation: overlay-in 0.15s ease;
  }

  &[data-exiting] {
    animation: overlay-out 0.15s ease forwards;
  }

  @keyframes overlay-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes overlay-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

export const StyledModal = styled(RACModal)`
  background: #1c1c1e;
  border-radius: 16px;
  width: 360px;
  max-width: calc(100vw - 32px);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  position: relative;
  outline: none;

  @media (prefers-color-scheme: light) {
    background: #ffffff;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
  }

  &[data-entering] {
    animation: modal-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &[data-exiting] {
    animation: modal-out 0.15s ease forwards;
  }

  @keyframes modal-in {
    from {
      opacity: 0;
      transform: scale(0.94) translateY(8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes modal-out {
    from {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    to {
      opacity: 0;
      transform: scale(0.96) translateY(4px);
    }
  }
`;

export const StyledDialog = styled(Dialog)`
  outline: none;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const CloseButton = styled(RACButton)`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--surface, rgba(255, 255, 255, 0.08));
  border: none;
  color: var(--fg-2, rgba(255, 255, 255, 0.55));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--overlay, rgba(255, 255, 255, 0.2));
    color: var(--fg, #ffffff);
  }

  &:focus-visible {
    outline: 2px solid #4285f4;
    outline-offset: 2px;
  }
`;

export const ModalIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--surface, rgba(255, 255, 255, 0.08));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg, #ffffff);
  margin-bottom: 4px;
  flex-shrink: 0;
`;

export const ModalHeading = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: var(--fg, #ffffff);
  margin: 0;
  line-height: 1.3;

  @media (prefers-color-scheme: light) {
    color: #1c1c1e;
  }
`;

export const ModalBody = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: var(--fg-2, rgba(255, 255, 255, 0.55));

  @media (prefers-color-scheme: light) {
    color: #6b7280;
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
`;
