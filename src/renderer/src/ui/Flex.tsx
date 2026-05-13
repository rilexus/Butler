import { CSSProperties } from "react";

export const Flex = ({
  children,
  direction = "row",
  justify = "flex-start",
  style = {},
}: {
  children: React.ReactNode;
  style?: CSSProperties;
  direction?: "row" | "column";
  justify?:
    | "space-between"
    | "space-around"
    | "center"
    | "space-evenly"
    | "flex-start";
}) => (
  <div
    style={{
      display: "flex",
      flex: 1,
      justifyContent: justify,
      overflow: "hidden",
      flexDirection: direction,
      ...style,
    }}
  >
    {children}
  </div>
);
