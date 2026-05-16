import styled from "styled-components";

export const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
`;

export const FieldLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: #aaaaaa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const CardRoot = styled.div`
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
  overflow: hidden;
`;

export const CardTitle = styled.div`
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
`;

export const CardBody = styled.div`
  padding: 8px 12px;
`;

export const NativeInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  height: 24px;
  padding: 0 6px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  font-family: system-ui, -apple-system, sans-serif;
  outline: none;
  background: #fff;
  color: #333;

  &:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
  }
`;
