import { CSSProperties } from "react";
import { number } from "zod";

export const Flex = ({
  children,
  direction = "row",
  justify = "flex-start",
  gap = "",
  style = {},
}: {
  gap: string | number;
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
      gap,
      justifyContent: justify,
      overflow: "hidden",
      flexDirection: direction,
      ...style,
    }}
  >
    {children}
  </div>
);
