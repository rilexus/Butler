import { useCallback, useState } from "react";
import { Container, Content, ResizeHandle } from "./styles";

export const ExpandiblePanel = ({
  width,
  background = "#f8fafc",
  side = "left",
  children,
}: {
  width: number;
  background?: string;
  side?: "left" | "right";
  children: React.ReactNode;
}) => {
  const [currentWidth, setCurrentWidth] = useState(width);

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = currentWidth;

      const onMouseMove = (ev: MouseEvent) => {
        const delta =
          side === "right" ? startX - ev.clientX : ev.clientX - startX;
        setCurrentWidth(Math.max(200, Math.min(800, startWidth + delta)));
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [currentWidth, side],
  );

  return (
    <Container $width={currentWidth} $background={background} $side={side}>
      <Content>{children}</Content>
      <ResizeHandle $side={side} onMouseDown={handleResizeMouseDown} />
    </Container>
  );
};
