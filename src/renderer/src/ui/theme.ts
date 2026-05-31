import { css } from "styled-components";

const darkVars = `
  --fg: #ffffff;
  --fg-2: rgba(255, 255, 255, 0.55);
  --fg-3: rgba(255, 255, 255, 0.4);
  --border: rgba(255, 255, 255, 0.1);
  --border-strong: rgba(255, 255, 255, 0.25);
  --surface: rgba(255, 255, 255, 0.08);
  --hover: rgba(255, 255, 255, 0.08);
  --selected: rgba(255, 255, 255, 0.12);
  --overlay: rgba(255, 255, 255, 0.2);
`;

const lightVars = `
  --fg: #1C1C1E;
  --fg-2: #6b7280;
  --fg-3: #9ca3af;
  --border: rgba(0, 0, 0, 0.1);
  --border-strong: rgba(0, 0, 0, 0.2);
  --surface: rgba(255, 255, 255, 0.76);
  --hover: rgba(0, 0, 0, 0.04);
  --selected: rgba(0, 0, 0, 0.08);
  --overlay: rgba(0, 0, 0, 0.12);
`;

export const darkTheme = {
  colors: { text: "#ffffff" },
  cssVars: darkVars,
};

export const lightTheme = {
  colors: { text: "#1C1C1E" },
  cssVars: lightVars,
};

type AppTheme = typeof darkTheme;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const colors = (color: keyof AppTheme["colors"]) => (props: any) =>
  props.theme?.colors?.[color] as string;

export const textColor = css`
  color: ${colors("text")};
`;
