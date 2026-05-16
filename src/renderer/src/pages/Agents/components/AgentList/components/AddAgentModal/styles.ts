import styled from "styled-components";

export const LibraryList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 340px;
  overflow-y: auto;
`;

export const LibraryItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.1s ease, border-color 0.1s ease;

  &:hover {
    background: var(--hover, rgba(0, 0, 0, 0.05));
    border-color: var(--border, rgba(0, 0, 0, 0.08));
  }

  &:active {
    background: var(--selected, rgba(0, 0, 0, 0.1));
  }
`;

export const LibraryItemName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--fg, #1c1c1e);
`;

export const LibraryItemDescription = styled.span`
  font-size: 12px;
  color: var(--fg-2, rgba(0, 0, 0, 0.5));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
