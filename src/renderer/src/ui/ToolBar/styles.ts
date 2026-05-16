import styled from "styled-components";
import { Toolbar as RACToolbar } from "react-aria-components";

export const ToolBarRoot = styled(RACToolbar)<{ $orientation: "horizontal" | "vertical" }>`
  display: inline-flex;
  align-items: center;
  flex-direction: ${({ $orientation }) => ($orientation === "vertical" ? "column" : "row")};
  gap: 4px;
  padding: 4px;
  background: #efefef;
  border-radius: 99px;
`;
