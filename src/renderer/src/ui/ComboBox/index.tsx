import React, { useEffect, useId, useRef, useState } from "react";
import {
  ChevronIcon,
  ComboInput,
  ComboLabel,
  Dropdown,
  DropdownOption,
  EmptyState,
  InputGroup,
  Root,
  TriggerButton,
} from "./styles";

type ComboBoxOption = {
  value: string;
  label: string;
};

type ComboBoxProps = {
  label: string;
  placeholder?: string;
  options: ComboBoxOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
};

const ChevronDown = () => (
  <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
    <path
      clipRule="evenodd"
      d="M2.97 5.47a.75.75 0 0 1 1.06 0L8 9.44l3.97-3.97a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 0-1.06"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const ComboBox = ({
  label,
  placeholder,
  options,
  defaultValue = "",
  value: controlledValue,
  onChange,
}: ComboBoxProps) => {
  const inputId = useId();
  const labelId = useId();
  const listboxId = useId();
  const triggerId = useId();

  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState(defaultValue);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = controlledValue !== undefined ? controlledValue : undefined;

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(inputText.toLowerCase())
  );

  const optionId = (i: number) => `${listboxId}-option-${i}`;

  const commit = (option: ComboBoxOption) => {
    setInputText(option.label);
    setOpen(false);
    setFocusedIndex(-1);
    onChange?.(option.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    setOpen(true);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      commit(filtered[focusedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setFocusedIndex(-1);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <Root ref={rootRef}>
      <ComboLabel id={labelId} htmlFor={inputId}>
        {label}
      </ComboLabel>
      <InputGroup>
        <ComboInput
          ref={inputRef}
          id={inputId}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listboxId : undefined}
          aria-labelledby={labelId}
          aria-activedescendant={focusedIndex >= 0 ? optionId(focusedIndex) : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={placeholder}
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
        />
        <TriggerButton
          id={triggerId}
          type="button"
          tabIndex={-1}
          aria-label="Show suggestions"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${triggerId} ${labelId}`}
          onClick={() => {
            setOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
        >
          <ChevronIcon $open={open}>
            <ChevronDown />
          </ChevronIcon>
        </TriggerButton>
      </InputGroup>
      {open && (
        <Dropdown id={listboxId} role="listbox" aria-label={label}>
          {filtered.length > 0 ? (
            filtered.map((option, index) => (
              <DropdownOption
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={selectedLabel === option.value || inputText === option.label}
                $focused={index === focusedIndex}
                $selected={selectedLabel === option.value || inputText === option.label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(option);
                }}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                {option.label}
              </DropdownOption>
            ))
          ) : (
            <EmptyState>No results found</EmptyState>
          )}
        </Dropdown>
      )}
    </Root>
  );
};

export default ComboBox;
