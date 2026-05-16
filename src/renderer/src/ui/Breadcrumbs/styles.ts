import styled from "styled-components";

export const BreadcrumbsList = styled.ol`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2px;
`;

export const BreadcrumbsItem = styled.li`
  display: flex;
  align-items: center;
  gap: 2px;
`;

export const BreadcrumbsLink = styled.a<{ $current?: boolean }>`
  font-size: 14px;
  color: ${({ $current }) => ($current ? "var(--fg)" : "var(--fg-2)")};
  font-weight: ${({ $current }) => ($current ? "600" : "400")};
  text-decoration: none;
  cursor: ${({ $current }) => ($current ? "default" : "pointer")};

  &:hover {
    color: var(--fg);
  }
`;

export const BreadcrumbsSpan = styled.span`
  font-size: 14px;
  color: var(--fg);
  font-weight: 600;
`;

export const Separator = styled.svg`
  flex-shrink: 0;
  color: var(--fg-2);
`;
