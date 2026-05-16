import React from "react";
import { GroupRoot, InternalSeparator } from "./styles";

type ButtonGroupProps = {
  label?: string;
  children: React.ReactNode;
};

const ButtonGroup = ({ label, children }: ButtonGroupProps) => {
  const items = React.Children.toArray(children);

  return (
    <GroupRoot role="group" aria-label={label}>
      {items.map((child, i) => (
        <React.Fragment key={i}>
          {i > 0 && <InternalSeparator aria-hidden="true" />}
          {child}
        </React.Fragment>
      ))}
    </GroupRoot>
  );
};

export default ButtonGroup;
