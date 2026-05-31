import styled from "styled-components";

export const Container = styled.div<{
  $collapsed: boolean;
  $width: number;
  $background: string;
  $side: "left" | "right";
}>`
  width: ${({ $collapsed, $width }) => ($collapsed ? "28px" : `${$width}px`)};
  flex-shrink: 0;
  border-right: ${({ $side }) =>
    $side === "left" ? "1px solid var(--border)" : "none"};
  border-left: ${({ $side }) =>
    $side === "right" ? "1px solid var(--border)" : "none"};
  overflow: hidden;

  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
  position: relative;
`;

export const CollapseHandle = styled.div<{ $side: "left" | "right" }>`
  position: absolute;
  ${({ $side }) => ($side === "left" ? "right: 0;" : "left: 0;")}
  top: 0;
  bottom: 0;
  width: 16px;
  ${({ $side }) =>
    $side === "left"
      ? "border-left: 1px solid var(--border);"
      : "border-right: 1px solid var(--border);"}
  display: flex;
  align-items: stretch;
  overflow: hidden;
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
  color: var(--fg-2);
  white-space: nowrap;
  user-select: none;
`;

export const Content = styled.div<{ $side: "left" | "right" }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  ${({ $side }) =>
    $side === "left" ? "padding-right: 16px;" : "padding-left: 16px;"}
`;
