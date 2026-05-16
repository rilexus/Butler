import React from "react";
import { StyledSection } from "./styles";

type ListBoxSectionProps = {
  children?: React.ReactNode;
};

const ListBoxSection = ({ children }: ListBoxSectionProps) => {
  return <StyledSection role="group">{children}</StyledSection>;
};

export default ListBoxSection;
