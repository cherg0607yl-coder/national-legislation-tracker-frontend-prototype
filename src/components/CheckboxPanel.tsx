import { useMemo, useState } from "react";
import "../styles/components/CheckboxPanel.css";

interface CheckboxPanelProps {
  title: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  disabledMessage?: string;
  maxHeight?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function CheckboxPanel({
  title,
  options,
  selected,
  onChange,
  disabled = false,
  disabledMessage,
  maxHeight = 280,
  searchable = false,
  searchPlaceholder = "Search…",
}: CheckboxPanelProps) {
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(needle) ||
        option.value.toLowerCase().includes(needle),
    );
  }, [options, query]);

  const allVisibleSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((option) => selected.includes(option.value));

  function toggle(value: string) {
    if (disabled) return;
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function clear() {
    if (disabled) return;
    onChange([]);
  }

  function selectAllVisible() {
    if (disabled) return;
    const merged = new Set(selected);
    for (const option of filteredOptions) merged.add(option.value);
    onChange([...merged]);
  }

  return (
    <section
      className={disabled ? "checkbox-panel is-disabled" : "checkbox-panel"}
      aria-disabled={disabled}
    >
      <header className="checkbox-panel__header">
        <h3>{title}</h3>
        <div className="checkbox-panel__actions">
          <button
            type="button"
            className="checkbox-panel__action"
            onClick={selectAllVisible}
            disabled={disabled || allVisibleSelected || filteredOptions.length === 0}
          >
            All
          </button>
          <button
            type="button"
            className="checkbox-panel__action"
            onClick={clear}
            disabled={disabled || selected.length === 0}
          >
            Clear
          </button>
        </div>
      </header>

      {disabled ? (
        <p className="checkbox-panel__disabled-msg">
          {disabledMessage ?? "Unavailable with the current selection."}
        </p>
      ) : (
        <>
          {searchable && (
            <div className="checkbox-panel__search">
              <label className="sr-only" htmlFor={`search-${title}`}>
                Search {title.toLowerCase()}
              </label>
              <input
                id={`search-${title}`}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                autoComplete="off"
              />
              {query && (
                <p className="checkbox-panel__search-meta">
                  {filteredOptions.length === 0
                    ? "No matches"
                    : `${filteredOptions.length} match${filteredOptions.length === 1 ? "" : "es"}`}
                  {selected.length > 0 ? ` · ${selected.length} selected` : ""}
                </p>
              )}
            </div>
          )}

          <ul
            className="checkbox-panel__list"
            style={{ maxHeight }}
            role="group"
            aria-label={title}
          >
            {filteredOptions.length === 0 ? (
              <li className="checkbox-panel__empty">
                No {title.toLowerCase()} match “{query.trim()}”.
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const checked = selected.includes(option.value);
                return (
                  <li
                    key={option.value}
                    className={
                      index % 2 === 0
                        ? "checkbox-panel__item"
                        : "checkbox-panel__item is-alt"
                    }
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  </li>
                );
              })
            )}
          </ul>
        </>
      )}
    </section>
  );
}
