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

export const BreadcrumbsLink = styled.span`
  font-size: 14px;
  color: var(--fg-2);
  font-weight: 400;
  text-decoration: none;
  cursor: pointer;

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
