import styled from "styled-components";

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 256px;
  position: relative;
`;

export const SelectLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
`;

export const Trigger = styled.button<{ $open: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: box-shadow 0.15s ease;
  box-shadow: ${({ $open }) => ($open ? "0 0 0 3px rgba(66, 133, 244, 0.15)" : "none")};

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.15);
  }
`;

export const Value = styled.span<{ $isPlaceholder: boolean }>`
  font-size: 14px;
  color: ${({ $isPlaceholder }) => ($isPlaceholder ? "var(--fg-3)" : "var(--fg)")};
  line-height: 1.5;
`;

export const ChevronIcon = styled.span<{ $open: boolean }>`
  display: flex;
  flex-shrink: 0;
  color: var(--fg-2);
  transition: transform 0.2s ease;
  transform: rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
`;

export const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow-y: auto;
  max-height: 320px;
  z-index: 50;
  padding: 8px;
`;

export const Option = styled.div<{ $focused: boolean; $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  font-size: 15px;
  border-radius: 10px;
  cursor: pointer;
  color: ${({ $selected }) => ($selected ? "#4285f4" : "#111827")};
  background: ${({ $focused, $selected }) =>
    $selected ? "#eff6ff" : $focused ? "#f3f4f6" : "transparent"};
  font-weight: ${({ $selected }) => ($selected ? "500" : "400")};

  &:hover {
    background: ${({ $selected }) => ($selected ? "#dbeafe" : "#f3f4f6")};
  }
`;

export const HiddenSelect = styled.div`
  border: 0;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: fixed;
  width: 1px;
  white-space: nowrap;
  top: 0;
  left: 0;
`;
