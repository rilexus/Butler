import React from "react";
import { AvatarImage, AvatarRoot } from "./styles";

type AvatarProps = {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
};

const Avatar = ({ src, alt, size = "md" }: AvatarProps) => {
  return (
    <AvatarRoot $size={size}>
      <AvatarImage src={src} alt={alt} />
    </AvatarRoot>
  );
};

export default Avatar;
