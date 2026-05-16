import React from "react";
import { Actions, FieldGroup, FieldSetDescription, FieldSetRoot, Legend } from "./styles";

type FieldSetProps = {
  legend: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
} & React.FieldsetHTMLAttributes<HTMLFieldSetElement>;

const FieldSet = ({ legend, description, children, actions, ...rest }: FieldSetProps) => {
  return (
    <FieldSetRoot {...rest}>
      <Legend>{legend}</Legend>
      {description && <FieldSetDescription>{description}</FieldSetDescription>}
      <FieldGroup>{children}</FieldGroup>
      {actions && <Actions>{actions}</Actions>}
    </FieldSetRoot>
  );
};

export default FieldSet;
