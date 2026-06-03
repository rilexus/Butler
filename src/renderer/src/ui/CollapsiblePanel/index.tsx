import { useCallback, useState } from "react";
import Button from "../Button";
import {
  Container,
  CollapsedContent,
  CollapsedLabel,
  Content,
  CollapseHandle,
  ResizeHandle,
} from "./styles";

export const CollapsiblePanel = ({
  label,
  width,
  background = "#f8fafc",
  side = "left",
  children,
}: {
  label: string;
  width: number;
  background?: string;
  side?: "left" | "right";
  children: React.ReactNode;
}) => {
  const [collapsed, setCollapsed] = useState(false);
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
    <Container
      $collapsed={collapsed}
      $width={currentWidth}
      $background={background}
      $side={side}
    >
      {collapsed ? (
        <CollapsedContent onClick={() => setCollapsed(false)}>
          <CollapsedLabel>{label}</CollapsedLabel>
        </CollapsedContent>
      ) : (
        <Content $side={side}>{children}</Content>
      )}
      {!collapsed && (
        <>
          <ResizeHandle $side={side} onMouseDown={handleResizeMouseDown} />
          <CollapseHandle $side={side}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(true)}
              title="Collapse"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 0,
                color: "#94a3b8",
                fontSize: 9,
              }}
            >
              {side === "left" ? "‹" : "›"}
            </Button>
          </CollapseHandle>
        </>
      )}
    </Container>
  );
};
