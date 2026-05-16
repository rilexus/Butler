import React, { useId } from "react";
import Avatar from "../../Avatar";
import { CheckmarkWrapper, Item, ItemContent, ItemDescription, ItemLabel } from "./styles";

type ListBoxItemProps = {
  label: string;
  description?: string;
  avatar?: { src: string; alt: string };
  selected?: boolean;
  onPress?: () => void;
};

const Checkmark = () => (
  <svg
    aria-hidden="true"
    fill="none"
    role="presentation"
    stroke="currentColor"
    strokeDasharray="22"
    strokeDashoffset="66"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 17 18"
    width="16"
    height="16"
  >
    <polyline points="1 9 7 14 15 4" />
  </svg>
);

const ListBoxItem = ({ label, description, avatar, selected = false, onPress }: ListBoxItemProps) => {
  const descriptionId = useId();

  return (
    <Item
      role="option"
      aria-selected={selected}
      aria-describedby={description ? descriptionId : undefined}
      $selected={selected}
      tabIndex={-1}
      onClick={onPress}
    >
      {avatar && <Avatar src={avatar.src} alt={avatar.alt} size="lg" />}
      <ItemContent>
        <ItemLabel>{label}</ItemLabel>
        {description && <ItemDescription id={descriptionId}>{description}</ItemDescription>}
      </ItemContent>
      <CheckmarkWrapper $selected={selected} aria-hidden="true">
        <Checkmark />
      </CheckmarkWrapper>
    </Item>
  );
};

export default ListBoxItem;
