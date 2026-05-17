import React, { useContext } from "react";
import { ListBoxContext } from "../context";
import { StyledItem } from "./styles";

type ListBoxItemProps = {
  id: string;
  textValue?: string;
  variant?: "default" | "danger";
  children?: React.ReactNode;
};

const ListBoxItem = ({
  id,
  variant = "default",
  children,
}: ListBoxItemProps) => {
  const { onAction } = useContext(ListBoxContext);

  const handleAction = () => onAction?.(id);

  return (
    <StyledItem
      role="option"
      aria-selected={false}
      tabIndex={-1}
      $variant={variant}
      onClick={handleAction}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleAction();
        }
      }}
    >
      {children}
    </StyledItem>
  );
};

export default ListBoxItem;
