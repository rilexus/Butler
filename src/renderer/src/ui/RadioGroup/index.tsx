import React, { useId, useState } from "react";
import Radio from "./Radio";
import { GroupDescription, GroupLabel, GroupRoot } from "./styles";

type RadioOption = {
  value: string;
  label: string;
  description?: string;
};

type RadioGroupProps = {
  label: string;
  description?: string;
  name: string;
  options: RadioOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
};

const RadioGroup = ({
  label,
  description,
  name,
  options,
  defaultValue,
  value: controlledValue,
  onChange,
}: RadioGroupProps) => {
  const labelId = useId();
  const descriptionId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (v: string) => {
    if (controlledValue === undefined) setInternalValue(v);
    onChange?.(v);
  };

  return (
    <GroupRoot
      role="radiogroup"
      aria-orientation="vertical"
      aria-labelledby={labelId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <GroupLabel id={labelId}>{label}</GroupLabel>
      {description && <GroupDescription id={descriptionId}>{description}</GroupDescription>}
      {options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          label={option.label}
          description={option.description}
          name={name}
          groupDescriptionId={description ? descriptionId : undefined}
          selected={value === option.value}
          onChange={handleChange}
        />
      ))}
    </GroupRoot>
  );
};

export default RadioGroup;
