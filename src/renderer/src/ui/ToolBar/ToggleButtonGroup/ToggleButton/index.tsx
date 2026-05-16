import React from "react";
import { ToggleBtn } from "./styles";

type ToggleButtonProps = {
  icon: React.ReactNode;
  label: string;
  pressed?: boolean;
  defaultPressed?: boolean;
  onChange?: (pressed: boolean) => void;
};

const ToggleButton = ({
  icon,
  label,
  pressed,
  defaultPressed = false,
  onChange,
}: ToggleButtonProps) => {
  return (
    <ToggleBtn
      aria-label={label}
      isSelected={pressed}
      defaultSelected={defaultPressed}
      onChange={onChange}
    >
      {icon}
    </ToggleBtn>
  );
};

export default ToggleButton;
