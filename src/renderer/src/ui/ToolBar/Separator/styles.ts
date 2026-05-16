import styled from "styled-components";
import { Separator as RACSeparator } from "react-aria-components";

export const SeparatorRoot = styled(RACSeparator)<{ $orientation: "vertical" | "horizontal" }>`
  background: #d4d4d4;
  flex-shrink: 0;
  ${({ $orientation }) =>
    $orientation === "vertical"
      ? "width: 1px; align-self: stretch;"
      : "height: 1px; width: 100%;"}
`;
