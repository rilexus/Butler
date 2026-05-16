import React, { useState } from "react";
import { Tab, TabsList, TabPanel } from "./styles";

type TabItem = {
  key: string;
  label: string;
  content?: React.ReactNode;
};

type TabsProps = {
  tabs: TabItem[];
  defaultSelectedKey?: string;
  selectedKey?: string;
  onChange?: (key: string) => void;
  "aria-label"?: string;
};

const Tabs = ({
  tabs,
  defaultSelectedKey,
  selectedKey: controlledKey,
  onChange,
  "aria-label": ariaLabel,
}: TabsProps) => {
  const [internalKey, setInternalKey] = useState(defaultSelectedKey ?? tabs[0]?.key ?? "");

  const selectedKey = controlledKey !== undefined ? controlledKey : internalKey;

  const select = (key: string) => {
    if (controlledKey === undefined) setInternalKey(key);
    onChange?.(key);
  };

  const selectedTab = tabs.find((t) => t.key === selectedKey);

  return (
    <div>
      <TabsList role="tablist" aria-label={ariaLabel} aria-orientation="horizontal">
        {tabs.map((tab) => {
          const isSelected = tab.key === selectedKey;
          return (
            <Tab
              key={tab.key}
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              $selected={isSelected}
              onClick={() => select(tab.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  select(tab.key);
                }
              }}
            >
              {tab.label}
            </Tab>
          );
        })}
      </TabsList>

      {selectedTab?.content !== undefined && (
        <TabPanel role="tabpanel">{selectedTab.content}</TabPanel>
      )}
    </div>
  );
};

export default Tabs;
