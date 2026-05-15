import styled from "styled-components";

export const Card = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
  width: 240px;
  box-sizing: border-box;
  overflow-y: auto;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
`;

export const NodeName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FieldRow = styled.div`
  display: flex;
  gap: 6px;
  flex-direction: column;
  margin-bottom: 4px;
  line-height: 1.4;
`;

export const FieldLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: #aaaaaa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 68px;
  flex-shrink: 0;
  padding-top: 1px;
`;

export const FieldValue = styled.span`
  font-size: 11px;
  color: #444444;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
`;
