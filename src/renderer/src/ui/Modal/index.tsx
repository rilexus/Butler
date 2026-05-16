import React from "react";
import { DialogTrigger, Heading } from "react-aria-components";
import { CloseButton, ModalBody, ModalFooter, ModalHeading, ModalIcon, StyledDialog, StyledModal, StyledModalOverlay } from "./styles";

type ModalProps = {
  trigger?: React.ReactElement;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode | ((close: () => void) => React.ReactNode);
  children: React.ReactNode;
};

const CloseIcon = () => (
  <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path clipRule="evenodd" d="M3.47 3.47a.75.75 0 0 1 1.06 0L8 6.94l3.47-3.47a.75.75 0 1 1 1.06 1.06L9.06 8l3.47 3.47a.75.75 0 1 1-1.06 1.06L8 9.06l-3.47 3.47a.75.75 0 0 1-1.06-1.06L6.94 8 3.47 4.53a.75.75 0 0 1 0-1.06Z" fill="currentColor" fillRule="evenodd" />
  </svg>
);

const Modal = ({ trigger, isOpen, onOpenChange, title, icon, footer, children }: ModalProps) => {
  const overlay = (
    <StyledModalOverlay {...(!trigger ? { isOpen, onOpenChange } : {})}>
      <StyledModal>
        <StyledDialog>
          {({ close }) => (
            <>
              <CloseButton aria-label="Close" onPress={close}>
                <CloseIcon />
              </CloseButton>
              {icon && <ModalIcon>{icon}</ModalIcon>}
              {title && <Heading slot="title"><ModalHeading>{title}</ModalHeading></Heading>}
              <ModalBody>{children}</ModalBody>
              {footer && (
                <ModalFooter>
                  {typeof footer === "function" ? footer(close) : footer}
                </ModalFooter>
              )}
            </>
          )}
        </StyledDialog>
      </StyledModal>
    </StyledModalOverlay>
  );

  if (trigger) {
    return (
      <DialogTrigger>
        {trigger}
        {overlay}
      </DialogTrigger>
    );
  }

  return overlay;
};

export default Modal;
