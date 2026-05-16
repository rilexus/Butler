import styled from "styled-components";

export const MenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 4px 0;
  min-width: 140px;
`;

export const MenuItem = styled.li<{ $danger?: boolean }>`
  display: block;
  width: 100%;
  padding: 7px 12px;
  background: none;
  border: none;
  border-radius: 6px;
  text-align: left;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  color: ${({ $danger }) => ($danger ? "#e05252" : "inherit")};
  transition: background 0.1s ease;

  &:hover {
    background: var(--hover, rgba(0, 0, 0, 0.06));
  }

  &:active {
    background: var(--selected, rgba(0, 0, 0, 0.1));
  }
`;
