import styled from "styled-components";
import { ToggleButton as RACToggleButton } from "react-aria-components";

export const ToggleBtn = styled(RACToggleButton)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  color: var(--fg-2);
  border: none;
  border-radius: 99px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  flex-shrink: 0;

  &[data-selected] {
    background: var(--overlay);
    color: var(--fg);
  }

  &[data-hovered]:not([data-selected]) {
    background: var(--hover);
  }

  &[data-selected][data-hovered] {
    background: var(--overlay);
  }

  &[data-pressed] {
    background: var(--selected);
  }

  &[data-focus-visible] {
    outline: 2px solid #4285f4;
    outline-offset: 2px;
  }
`;
