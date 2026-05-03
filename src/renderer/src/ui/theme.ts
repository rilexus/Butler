import { css } from "styled-components";

export const lightTheme = {
  colors: {
    text: "black",
  },
};

export const darkTheme = {
  colors: {
    text: "white",
  },
};

export const colors = (color) => {
  return ({ theme }) => theme.colors[color];
};

export const textColor = css`
  color: ${colors("text")};
`;
