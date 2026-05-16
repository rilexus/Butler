import styled from "styled-components";

export const Item = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 8px;
  border-radius: 10px;
  cursor: pointer;
  outline: none;
  transition: background 0.15s ease;
  background: ${({ $selected }) => ($selected ? "rgba(66,133,244,0.15)" : "transparent")};

  &:hover {
    background: ${({ $selected }) =>
      $selected ? "rgba(66,133,244,0.2)" : "var(--hover)"};
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px #4285f4;
  }
`;

export const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 2px;
`;

export const ItemLabel = styled.label`
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
  cursor: pointer;
  line-height: 1.3;
`;

export const ItemDescription = styled.span`
  font-size: 14px;
  color: var(--fg-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CheckmarkWrapper = styled.span<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  color: #4285f4;
  opacity: ${({ $selected }) => ($selected ? 1 : 0)};
  transition: opacity 0.15s ease;

  svg {
    stroke-dashoffset: ${({ $selected }) => ($selected ? "44" : "66")};
    transition: stroke-dashoffset 0.2s ease;
  }
`;
