import styled from "styled-components";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, string> = {
  sm: "28px",
  md: "36px",
  lg: "48px",
};

export const AvatarRoot = styled.span<{ $size: Size }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  width: ${({ $size }) => sizeMap[$size]};
  height: ${({ $size }) => sizeMap[$size]};
`;

export const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
