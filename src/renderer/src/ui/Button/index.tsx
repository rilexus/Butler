import React from "react";
import { StyledButton } from "./styles";

type ButtonProps = {
  variant?: "primary" | "secondary" | "tertiary" | "outline" | "ghost" | "danger" | "danger-soft";
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  startIcon?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ variant = "primary", size = "md", iconOnly, startIcon, disabled, children, ...props }: ButtonProps) => {
  return (
    <StyledButton $variant={variant} $size={size} $iconOnly={iconOnly} isDisabled={disabled} {...props}>
      {startIcon}
      {children}
    </StyledButton>
  );
};

export default Button;
