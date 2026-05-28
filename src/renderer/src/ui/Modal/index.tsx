import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CloseButton,
  ModalBody,
  ModalFooter,
  ModalHeading,
  ModalIcon,
  StyledDialog,
  StyledModal,
  StyledModalOverlay,
} from "./styles";

type ModalProps = {
  trigger?: React.ReactElement;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode | ((close: () => void) => React.ReactNode);
  children: React.ReactNode;
};

type AnimState = "entering" | "open" | "exiting" | null;

const CloseIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M3.47 3.47a.75.75 0 0 1 1.06 0L8 6.94l3.47-3.47a.75.75 0 1 1 1.06 1.06L9.06 8l3.47 3.47a.75.75 0 1 1-1.06 1.06L8 9.06l-3.47 3.47a.75.75 0 0 1-1.06-1.06L6.94 8 3.47 4.53a.75.75 0 0 1 0-1.06Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const Modal = ({
  trigger,
  isOpen: externalOpen,
  onOpenChange,
  title,
  icon,
  footer,
  children,
}: ModalProps) => {
  const hasTrigger = !!trigger;
  const [internalOpen, setInternalOpen] = useState(false);
  const [animState, setAnimState] = useState<AnimState>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const wantsOpen = hasTrigger ? internalOpen : (externalOpen ?? false);

  useEffect(() => {
    if (wantsOpen) {
      setAnimState((prev) => (prev === null ? "entering" : prev));
    } else {
      setAnimState((prev) =>
        prev === "entering" || prev === "open" ? "exiting" : prev,
      );
    }
  }, [wantsOpen]);

  const close = useCallback(() => {
    if (hasTrigger) {
      setInternalOpen(false);
    } else {
      onOpenChange?.(false);
    }
  }, [hasTrigger, onOpenChange]);

  const handleAnimationEnd = useCallback(
    (e: React.AnimationEvent<HTMLDivElement>) => {
      if (e.currentTarget !== e.target) return;
      if (animState === "entering") setAnimState("open");
      if (animState === "exiting") setAnimState(null);
    },
    [animState],
  );

  useEffect(() => {
    if (animState === "entering") {
      modalRef.current?.focus();
    }
  }, [animState]);

  useEffect(() => {
    if (!animState || animState === "exiting") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [animState, close]);

  const triggerEl = trigger
    ? React.cloneElement(
        trigger as React.ReactElement<{ onClick?: () => void }>,
        { onClick: () => setInternalOpen(true) },
      )
    : null;

  if (!animState) {
    return triggerEl;
  }

  const dataAttrs =
    animState === "entering"
      ? { "data-entering": "" }
      : animState === "exiting"
        ? { "data-exiting": "" }
        : {};

  const overlay = createPortal(
    <StyledModalOverlay {...dataAttrs} onClick={close}>
      <StyledModal
        {...dataAttrs}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onAnimationEnd={handleAnimationEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <StyledDialog>
          <CloseButton aria-label="Close" onClick={close}>
            <CloseIcon />
          </CloseButton>
          {icon && <ModalIcon>{icon}</ModalIcon>}
          {title && <ModalHeading>{title}</ModalHeading>}
          <ModalBody>{children}</ModalBody>
          {footer && (
            <ModalFooter>
              {typeof footer === "function" ? footer(close) : footer}
            </ModalFooter>
          )}
        </StyledDialog>
      </StyledModal>
    </StyledModalOverlay>,
    document.body,
  );

  if (triggerEl) {
    return (
      <>
        {triggerEl}
        {overlay}
      </>
    );
  }

  return overlay;
};

export default Modal;
