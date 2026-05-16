import React from "react";
import { ToolBarRoot } from "./styles";

type ToolBarProps = {
  label: string;
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
};

const ToolBar = ({ label, orientation = "horizontal", children }: ToolBarProps) => {
  return (
    <ToolBarRoot aria-label={label} orientation={orientation} $orientation={orientation}>
      {children}
    </ToolBarRoot>
  );
};

export default ToolBar;
