import styled from "styled-components";

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
  height: 100%;
  border-right: 1px solid var(--border);
  overflow: hidden;
`;

export const BreadcrumbsContainer = styled.div`
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
`;

export const NodeHeader = styled.div`
  padding: 10px 12px 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--fg-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

export const OptionLabel = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ChildIndicator = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: none;
  border: none;
  border-radius: 4px;
  color: var(--fg-3);
  font-size: 12px;
  cursor: pointer;
  transition:
    color 0.15s,
    background 0.15s;

  &:hover {
    color: var(--fg);
    background: var(--bg-2, #555555);
  }
`;

export const EmptyState = styled.div`
  padding: 16px 12px;
  font-size: 12px;
  color: var(--fg-3);
`;
