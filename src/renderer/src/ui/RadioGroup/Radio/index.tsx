import React from "react";
import {
  RadioContent,
  RadioControl,
  RadioIndicator,
  RadioItemDescription,
  RadioItemLabel,
  RadioLabel,
  VisuallyHidden,
} from "./styles";

type RadioProps = {
  label: string;
  description?: string;
  value: string;
  name: string;
  groupDescriptionId?: string;
  selected: boolean;
  onChange: (value: string) => void;
};

const Radio = ({ label, description, value, name, groupDescriptionId, selected, onChange }: RadioProps) => {
  return (
    <RadioLabel $selected={selected}>
      <VisuallyHidden>
        <input
          type="radio"
          value={value}
          name={name}
          checked={selected}
          aria-describedby={groupDescriptionId}
          tabIndex={selected ? 0 : -1}
          onChange={() => onChange(value)}
        />
      </VisuallyHidden>
      <RadioControl $selected={selected}>
        <RadioIndicator $selected={selected} aria-hidden="true" />
      </RadioControl>
      <RadioContent>
        <RadioItemLabel>{label}</RadioItemLabel>
        {description && <RadioItemDescription>{description}</RadioItemDescription>}
      </RadioContent>
    </RadioLabel>
  );
};

export default Radio;
