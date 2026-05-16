import React from "react";
import { StyledSurface } from "./styles";

type SurfaceProps = {
  variant?: "default" | "secondary" | "tertiary" | "transparent";
} & React.HTMLAttributes<HTMLDivElement>;

const Surface = ({ variant = "default", children, ...props }: SurfaceProps) => {
  return (
    <StyledSurface $variant={variant} {...props}>
      {children}
    </StyledSurface>
  );
};

export default Surface;
