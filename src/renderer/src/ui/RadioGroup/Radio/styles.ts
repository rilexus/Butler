import styled from "styled-components";

export const RadioLabel = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
  background: ${({ $selected }) => ($selected ? "rgba(99,102,241,0.15)" : "transparent")};

  &:hover {
    background: ${({ $selected }) =>
      $selected ? "rgba(99,102,241,0.2)" : "var(--hover)"};
  }
`;

export const VisuallyHidden = styled.span`
  border: 0;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
`;

export const RadioControl = styled.span<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${({ $selected }) => ($selected ? "#6366f1" : "var(--border-strong)")};
  background: transparent;
  flex-shrink: 0;
  margin-top: 1px;
  transition: border-color 0.15s ease;
`;

export const RadioIndicator = styled.span<{ $selected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6366f1;
  transform: scale(${({ $selected }) => ($selected ? 1 : 0)});
  transition: transform 0.15s ease;
`;

export const RadioContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const RadioItemLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--fg);
`;

export const RadioItemDescription = styled.span`
  font-size: 12px;
  color: var(--fg-2);
`;
