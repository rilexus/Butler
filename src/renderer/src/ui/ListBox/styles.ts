import styled from "styled-components";

export const ListBoxRoot = styled.div`
  display: flex;
  flex-direction: column;
  width: 220px;
  padding: 4px 0;
  outline: none;

  &:focus-visible {
    outline: 2px solid #4285f4;
    outline-offset: 2px;
    border-radius: 8px;
  }
`;
