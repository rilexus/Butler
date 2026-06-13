import styled from "styled-components";

export const StyledListBox = styled.div`
  display: flex;
  flex-direction: column;
  outline: none;
  padding: 0px 10px 0 10px;

  &:focus-visible {
    outline: 2px solid #4285f4;
    outline-offset: 2px;
    border-radius: 8px;
  }
`;
