import styled from "styled-components";
import {
  TextField as RATextField,
  Label as RALabel,
  Input as RAInput,
  TextArea as RATextArea,
  Text as RAText,
} from "react-aria-components";

export const Root = styled(RATextField)<{ $maxWidth?: string }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  ${({ $maxWidth }) => $maxWidth && `max-width: ${$maxWidth};`}
`;

export const Label = styled(RALabel)`
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
`;

export const RequiredMark = styled.span`
  color: #e05252;
  margin-left: 3px;
`;

const inputStyles = `
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--fg);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  font-family: inherit;

  &::placeholder {
    color: var(--fg-3);
  }

  &:focus {
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.15);
  }

  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Input = styled(RAInput)`
  ${inputStyles}
`;

export const Textarea = styled(RATextArea)`
  ${inputStyles}
  resize: vertical;
  min-height: 96px;
`;

export const Description = styled(RAText)`
  font-size: 12px;
  color: var(--fg-2);
  line-height: 1.5;
`;
