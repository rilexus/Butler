import { useState } from "react";
import {
  Container,
  CollapseHandle,
  CollapsedContent,
  CollapsedLabel,
  Content,
} from "./styles";

export const CollapsiblePanel = ({
  label,
  width,
  background = "#f8fafc",
  children,
}: {
  label: string;
  width: number;
  background?: string;
  children: React.ReactNode;
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Container $collapsed={collapsed} $width={width} $background={background}>
      {collapsed ? (
        <CollapsedContent onClick={() => setCollapsed(false)}>
          <CollapsedLabel>{label}</CollapsedLabel>
        </CollapsedContent>
      ) : (
        <Content>{children}</Content>
      )}
      {!collapsed && (
        <CollapseHandle onClick={() => setCollapsed(true)} title="Collapse">
          ‹
        </CollapseHandle>
      )}
    </Container>
  );
};
