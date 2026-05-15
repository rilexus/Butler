import styled from "styled-components";

export const SectionLabel = styled.div`
  padding: 0 16px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
`;

export const Row = styled.div`
  padding: 8px 16px;
  cursor: default;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Info = styled.div`
  min-width: 0;
  flex: 1;
`;

export const Name = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
`;

export const Description = styled.div`
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const EditButton = styled.button`
  flex-shrink: 0;
  margin-left: 4px;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CreateForm = styled.form`
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const FormInput = styled.input`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  outline: none;
`;

export const FormTextarea = styled.textarea`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  outline: none;
  resize: vertical;
`;

export const FormActions = styled.div`
  display: flex;
  gap: 6px;
`;

export const PrimaryButton = styled.button`
  flex: 1;
  font-size: 12px;
  padding: 4px 0;
  border-radius: 4px;
  border: none;
  background: #3b82f6;
  color: #fff;
  cursor: pointer;
`;

export const SecondaryButton = styled.button`
  flex: 1;
  font-size: 12px;
  padding: 4px 0;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  background: #fff;
  cursor: pointer;
`;

export const DashedCreateButton = styled.button`
  margin: 8px 16px 0;
  padding: 6px 0;
  font-size: 12px;
  border-radius: 4px;
  border: 1px dashed #cbd5e1;
  background: transparent;
  color: #64748b;
  cursor: pointer;
`;
