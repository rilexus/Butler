import React from "react";
import { ListBoxContext } from "./context";
import ListBoxItem from "./ListBoxItem";
import ListBoxSection from "./ListBoxSection";
import { StyledListBox } from "./styles";

type ListBoxProps = {
  "aria-label"?: string;
  selectionMode?: "none" | "single" | "multiple";
  onAction?: (key: string) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

const ListBox = ({
  children,
  selectionMode = "none",
  onAction,
  ...props
}: ListBoxProps) => {
  return (
    <ListBoxContext.Provider value={{ onAction, selectionMode }}>
      <StyledListBox
        role="listbox"
        aria-orientation="vertical"
        tabIndex={0}
        {...props}
      >
        {children}
      </StyledListBox>
    </ListBoxContext.Provider>
  );
};

ListBox.Item = ListBoxItem;
ListBox.Section = ListBoxSection;

export default ListBox;
