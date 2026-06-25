import styled from "styled-components";

export const Container = styled.div<{
  $width: number;
  $background: string;
  $side: "left" | "right";
}>`
  width: ${({ $width }) => `${$width}px`};
  flex-shrink: 0;
  border-right: ${({ $side }) =>
    $side === "left" ? "1px solid var(--border)" : "none"};
  border-left: ${({ $side }) =>
    $side === "right" ? "1px solid var(--border)" : "none"};
  overflow: hidden;

  display: flex;
  flex-direction: column;
  position: relative;
`;

export const ResizeHandle = styled.div<{ $side: "left" | "right" }>`
  position: absolute;
  ${({ $side }) => ($side === "left" ? "right: 0;" : "left: 0;")}
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  z-index: 10;
  &:hover {
    background: var(--accent, #3b82f6);
    opacity: 0.4;
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
`;
