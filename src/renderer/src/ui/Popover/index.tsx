import React from "react";
import { DialogTrigger, type PopoverProps as RACPopoverProps } from "react-aria-components";
import { PopoverBody, PopoverHeading, StyledDialog, StyledPopover } from "./styles";

type PopoverProps = {
  trigger: React.ReactElement;
  title?: React.ReactNode;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
} & Omit<RACPopoverProps, "children" | "trigger">;

const Popover = ({ trigger, title, children, ...props }: PopoverProps) => {
  return (
    <DialogTrigger>
      {trigger}
      <StyledPopover {...props}>
        <StyledDialog>
          {({ close }) => (
            <>
              {title && <PopoverHeading slot="title">{title}</PopoverHeading>}
              <PopoverBody>
                {typeof children === "function" ? children(close) : children}
              </PopoverBody>
            </>
          )}
        </StyledDialog>
      </StyledPopover>
    </DialogTrigger>
  );
};

export default Popover;
