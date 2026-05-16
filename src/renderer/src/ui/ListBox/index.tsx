import React, { useState } from "react";
import ListBoxItem from "./ListBoxItem";
import { ListBoxRoot } from "./styles";

type Item = {
  key: string | number;
  label: string;
  description?: string;
  avatar?: { src: string; alt: string };
};

type ListBoxProps = {
  items: Item[];
  "aria-label"?: string;
  selectionMode?: "single" | "multiple";
  defaultSelectedKeys?: Array<string | number>;
  onSelectionChange?: (keys: Set<string | number>) => void;
};

const ListBox = ({
  items,
  "aria-label": ariaLabel,
  selectionMode = "single",
  defaultSelectedKeys = [],
  onSelectionChange,
}: ListBoxProps) => {
  const [selectedKeys, setSelectedKeys] = useState(() => new Set(defaultSelectedKeys));

  const handleSelect = (key: string | number) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (selectionMode === "single") {
        next.clear();
        if (!prev.has(key)) next.add(key);
      } else {
        if (next.has(key)) next.delete(key);
        else next.add(key);
      }
      onSelectionChange?.(next);
      return next;
    });
  };

  return (
    <ListBoxRoot role="listbox" aria-label={ariaLabel} aria-orientation="vertical" tabIndex={0}>
      {items.map((item) => (
        <ListBoxItem
          key={item.key}
          label={item.label}
          description={item.description}
          avatar={item.avatar}
          selected={selectedKeys.has(item.key)}
          onPress={() => handleSelect(item.key)}
        />
      ))}
    </ListBoxRoot>
  );
};

export default ListBox;
