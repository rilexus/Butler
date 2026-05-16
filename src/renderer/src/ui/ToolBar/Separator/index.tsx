import React from "react";
import { SeparatorRoot } from "./styles";

type SeparatorProps = {
  orientation?: "vertical" | "horizontal";
};

const Separator = ({ orientation = "vertical" }: SeparatorProps) => {
  return <SeparatorRoot orientation={orientation} $orientation={orientation} />;
};

export default Separator;
