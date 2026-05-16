import React from "react";
import { Description, Input, Label, RequiredMark, Root, Textarea } from "./styles";

type BaseProps = {
  label?: string;
  description?: string;
  maxWidth?: string;
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
};
type InputProps = BaseProps & { multiline?: false } & React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps & { multiline: true } & React.TextareaHTMLAttributes<HTMLTextAreaElement>;
type TextFieldProps = InputProps | TextareaProps;

const TextField = ({
  label,
  description,
  maxWidth,
  containerStyle,
  containerClassName,
  multiline,
  required,
  ...rest
}: TextFieldProps) => {
  return (
    <Root
      isRequired={required}
      $maxWidth={maxWidth}
      style={containerStyle}
      className={containerClassName}
    >
      {label && (
        <Label>
          {label}
          {required && <RequiredMark aria-hidden>*</RequiredMark>}
        </Label>
      )}
      {multiline ? (
        <Textarea
          required={required}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <Input
          required={required}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {description && <Description slot="description">{description}</Description>}
    </Root>
  );
};

export default TextField;
