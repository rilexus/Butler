import React, { useEffect, useId, useRef, useState } from "react";
import {
  ChevronIcon,
  Dropdown,
  HiddenSelect,
  Option,
  Root,
  SelectLabel,
  Trigger,
  Value,
} from "./styles";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

const ChevronDown = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
  >
    <path
      clipRule="evenodd"
      d="M2.97 5.47a.75.75 0 0 1 1.06 0L8 9.44l3.97-3.97a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 0-1.06"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const CheckMark = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M13.488 3.43a.75.75 0 0 1 .081 1.058l-6 7a.75.75 0 0 1-1.1.042l-3.5-3.5A.75.75 0 0 1 4.03 6.97l2.928 2.927 5.473-6.385a.75.75 0 0 1 1.057-.081"
      clipRule="evenodd"
    />
  </svg>
);

const Select = ({
  label,
  placeholder = "Select one",
  options,
  value: controlledValue,
  defaultValue = "",
  onChange,
}: SelectProps) => {
  const labelId = useId();
  const valueId = useId();
  const triggerId = useId();
  const listboxId = useId();

  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const selectedOption = options.find((o) => o.value === value);

  const commit = (option: SelectOption) => {
    if (controlledValue === undefined) setInternalValue(option.value);
    onChange?.(option.value);
    setOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  };

  const openAt = (index: number) => {
    setOpen(true);
    setFocusedIndex(index);
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(focusedIndex + 1, options.length - 1);
      openAt(
        open
          ? next
          : Math.max(
              options.findIndex((o) => o.value === value),
              0,
            ),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openAt(Math.max(focusedIndex - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open && focusedIndex >= 0) {
        commit(options[focusedIndex]);
      } else {
        openAt(
          Math.max(
            options.findIndex((o) => o.value === value),
            0,
          ),
        );
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusedIndex >= 0) commit(options[focusedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
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
      <SelectLabel id={labelId}>{label}</SelectLabel>

      <Trigger
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-labelledby={`${valueId} ${labelId}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        $open={open}
        onClick={() =>
          open
            ? setOpen(false)
            : openAt(
                Math.max(
                  options.findIndex((o) => o.value === value),
                  0,
                ),
              )
        }
        onKeyDown={handleTriggerKeyDown}
      >
        <Value id={valueId} $isPlaceholder={!selectedOption}>
          {selectedOption ? selectedOption.label : placeholder}
        </Value>
        <ChevronIcon $open={open}>
          <ChevronDown />
        </ChevronIcon>
      </Trigger>

      <HiddenSelect aria-hidden="true">
        <label>
          <select
            tabIndex={-1}
            value={value}
            onChange={(e) => {
              if (controlledValue === undefined)
                setInternalValue(e.target.value);
              onChange?.(e.target.value);
            }}
          >
            <option value="">&nbsp;</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </HiddenSelect>

      {open && (
        <Dropdown
          id={listboxId}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={handleDropdownKeyDown}
        >
          {options.map((option, index) => (
            <Option
              key={option.value}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={value === option.value}
              $focused={index === focusedIndex}
              $selected={value === option.value}
              onMouseDown={(e) => {
                e.preventDefault();
                commit(option);
              }}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              {option.label}
              {value === option.value && <CheckMark />}
            </Option>
          ))}
        </Dropdown>
      )}
    </Root>
  );
};

export default Select;
