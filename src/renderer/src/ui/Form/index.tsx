import React from "react";
import Button from "../Button";
import TextField from "../TextField";
import { ButtonRow, StyledForm } from "./styles";

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M13.488 3.43a.75.75 0 0 1 .081 1.058l-6 7a.75.75 0 0 1-1.1.042l-3.5-3.5A.75.75 0 0 1 4.03 6.97l2.928 2.927 5.473-6.385a.75.75 0 0 1 1.057-.081"
      clipRule="evenodd"
    />
  </svg>
);

const Form = (props: React.FormHTMLAttributes<HTMLFormElement>) => {
  return (
    <StyledForm {...props}>
      <TextField label="Email" type="email" name="email" placeholder="john@example.com" required />
      <TextField
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        minLength={8}
        required
        description="Must be at least 8 characters with 1 uppercase and 1 number"
      />
      <ButtonRow>
        <Button type="submit" variant="primary" startIcon={<CheckIcon />}>
          Submit
        </Button>
        <Button type="reset" variant="secondary">
          Reset
        </Button>
      </ButtonRow>
    </StyledForm>
  );
};

export default Form;
