import React, { useId, useState } from "react";
import { SwitchContent, SwitchLabel, SwitchRoot, Thumb, Track, VisuallyHidden } from "./styles";

type SwitchProps = {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
};

const Switch = ({
  label,
  checked: controlledChecked,
  defaultChecked = false,
  size = "md",
  disabled = false,
  onChange,
}: SwitchProps) => {
  const inputId = useId();
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const checked = controlledChecked !== undefined ? controlledChecked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (controlledChecked === undefined) setInternalChecked(e.target.checked);
    onChange?.(e.target.checked);
  };

  return (
    <SwitchRoot htmlFor={inputId} $disabled={disabled}>
      <VisuallyHidden>
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          aria-checked={checked}
          onChange={handleChange}
        />
      </VisuallyHidden>
      <Track $checked={checked} $size={size}>
        <Thumb $checked={checked} $size={size} aria-hidden="true" />
      </Track>
      <SwitchContent>
        <SwitchLabel htmlFor={inputId}>{label}</SwitchLabel>
      </SwitchContent>
    </SwitchRoot>
  );
};

export default Switch;
