import styled from "styled-components";

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 256px;
  position: relative;
`;

export const ComboLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: var(--fg);
`;

export const InputGroup = styled.div`
  position: relative;
  display: flex;
`;

export const ComboInput = styled.input`
  flex: 1;
  padding: 8px 38px 8px 12px;
  font-size: 14px;
  color: var(--fg);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &::placeholder {
    color: var(--fg-3);
  }

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
`;

export const TriggerButton = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-left: 1px solid var(--border);
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  color: var(--fg-2);
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--hover);
    color: var(--fg);
  }
`;

export const ChevronIcon = styled.span<{ $open: boolean }>`
  display: flex;
  transition: transform 0.2s ease;
  transform: rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
`;

export const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 240px;
  z-index: 50;
`;

export const DropdownOption = styled.div<{ $focused: boolean; $selected: boolean }>`
  padding: 8px 12px;
  font-size: 14px;
  color: #111827;
  cursor: pointer;
  background: ${({ $focused, $selected }) =>
    $selected ? "#f0f0ff" : $focused ? "#f3f4f6" : "transparent"};

  &:hover {
    background: ${({ $selected }) => ($selected ? "#e8e8fc" : "#f3f4f6")};
  }
`;

export const EmptyState = styled.div`
  padding: 12px;
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
`;
