import styled from "styled-components";

export const Container = styled.div<{
  $collapsed: boolean;
  $width: number;
  $background: string;
}>`
  width: ${({ $collapsed, $width }) => ($collapsed ? "28px" : `${$width}px`)};
  flex-shrink: 0;
  background: ${({ $background }) => $background};
  border-right: 1px solid #e2e8f0;
  overflow: hidden;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
  position: relative;
`;

export const CollapseHandle = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 16px;
  border: none;
  border-left: 1px solid #e2e8f0;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 9px;
  padding: 0;
  flex-shrink: 0;

  &:hover {
    background: #e2e8f0;
  }
`;

export const CollapsedContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 8px;
  cursor: pointer;
  flex: 1;
`;

export const CollapsedLabel = styled.span`
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  white-space: nowrap;
  user-select: none;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding-right: 16px;
`;
