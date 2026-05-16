import styled from "styled-components";

export const SectionLabel = styled.div`
  padding: 0 16px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-2);
`;

export const Item = styled.div<{ $selected: boolean }>`
  padding: 8px 16px;
  cursor: pointer;
  background: ${({ $selected }) => ($selected ? "var(--selected)" : "transparent")};
  border-left: 3px solid
    ${({ $selected }) => ($selected ? "#3b82f6" : "transparent")};
  font-size: 13px;
  font-weight: ${({ $selected }) => ($selected ? 600 : 400)};
  color: ${({ $selected }) => ($selected ? "var(--fg)" : "var(--fg-2)")};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ItemLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DeleteButton = styled.button`
  flex-shrink: 0;
  margin-left: 4px;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--fg-2);
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DashedCreateButton = styled.button`
  margin: 8px 16px 0;
  padding: 6px 0;
  font-size: 12px;
  border-radius: 4px;
  border: 1px dashed var(--border-strong);
  background: transparent;
  color: var(--fg-2);
  cursor: pointer;
`;
