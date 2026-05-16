import React from "react";
import { BreadcrumbsItem, BreadcrumbsLink, BreadcrumbsList, BreadcrumbsSpan, Separator } from "./styles";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

const ChevronRight = () => (
  <Separator aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M5.47 2.97a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06L9.44 8 5.47 4.03a.75.75 0 0 1 0-1.06Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </Separator>
);

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <BreadcrumbsList aria-label="Breadcrumbs">
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1;
        return (
          <BreadcrumbsItem key={index}>
            {isCurrent ? (
              <BreadcrumbsSpan aria-current="page">{item.label}</BreadcrumbsSpan>
            ) : (
              <>
                <BreadcrumbsLink href={item.href ?? "#"} $current={false}>
                  {item.label}
                </BreadcrumbsLink>
                <ChevronRight />
              </>
            )}
          </BreadcrumbsItem>
        );
      })}
    </BreadcrumbsList>
  );
};

export default Breadcrumbs;
