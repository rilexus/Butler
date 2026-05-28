import { useState } from "react";
import Button from "../Button";
import {
  Container,
  CollapsedContent,
  CollapsedLabel,
  Content,
  CollapseHandle,
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

  return (
    <Container
      $collapsed={collapsed}
      $width={width}
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
      )}
    </Container>
  );
};
