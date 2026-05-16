import styled from "styled-components";
import { Group as RACGroup } from "react-aria-components";

export const GroupRoot = styled(RACGroup)`
  display: inline-flex;
  align-items: center;
  gap: 0;
`;

export const InternalSeparator = styled.span`
  width: 1px;
  height: 18px;
  background: #d4d4d4;
  flex-shrink: 0;
`;
