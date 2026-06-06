import React, { useContext } from "react";
import { ListBoxContext } from "../context";
import { StyledItem } from "./styles";

type ListBoxItemProps = {
  item: unknown;
  textValue?: string;
  variant?: "default" | "danger";
  selected?: boolean;
  children?: React.ReactNode;
};

const ListBoxItem = ({
  item,
  variant = "default",
  selected = false,
  children,
}: ListBoxItemProps) => {
  const { onAction } = useContext(ListBoxContext);

  const handleAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAction?.(item);
  };

  return (
    <StyledItem
      role="option"
      aria-selected={selected}
      tabIndex={-1}
      $variant={variant}
      onClick={handleAction}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          handleAction(e);
        }
      }}
    >
      {children}
    </StyledItem>
  );
};

export default ListBoxItem;
