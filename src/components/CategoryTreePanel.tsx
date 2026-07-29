import { useState } from "react";
import type { PolicyCategory } from "../types/bill";
import { AI_TOPICS, POLICY_CATEGORIES } from "../lib/search";
import "../styles/components/CategoryTreePanel.css";

interface CategoryTreePanelProps {
  categories: PolicyCategory[];
  topics: string[];
  onChange: (next: { categories: PolicyCategory[]; topics: string[] }) => void;
  maxHeight?: number;
}

export function CategoryTreePanel({
  categories,
  topics,
  onChange,
  maxHeight = 360,
}: CategoryTreePanelProps) {
  const [aiExpanded, setAiExpanded] = useState(
    () =>
      categories.includes("Artificial Intelligence") || topics.length > 0,
  );

  const allCategoriesSelected = POLICY_CATEGORIES.every((category) =>
    categories.includes(category),
  );
  const allTopicsSelected = topics.length === AI_TOPICS.length;
  const selectAllChecked =
    allCategoriesSelected && (allTopicsSelected || topics.length === 0);

  function setCategories(nextCategories: PolicyCategory[], nextTopics = topics) {
    const aiStillSelected = nextCategories.includes("Artificial Intelligence");
    onChange({
      categories: nextCategories,
      topics: aiStillSelected ? nextTopics : [],
    });
  }

  function toggleSelectAll() {
    if (selectAllChecked) {
      onChange({ categories: [], topics: [] });
      setAiExpanded(false);
      return;
    }
    onChange({
      categories: [...POLICY_CATEGORIES],
      topics: [...AI_TOPICS],
    });
    setAiExpanded(true);
  }

  function toggleCategory(category: PolicyCategory) {
    const checked = categories.includes(category);
    if (checked) {
      setCategories(
        categories.filter((item) => item !== category),
        category === "Artificial Intelligence" ? [] : topics,
      );
      if (category === "Artificial Intelligence") {
        setAiExpanded(false);
      }
      return;
    }

    setCategories([...categories, category], topics);
    if (category === "Artificial Intelligence") {
      setAiExpanded(true);
    }
  }

  function toggleTopic(topic: string) {
    const checked = topics.includes(topic);
    const nextTopics = checked
      ? topics.filter((item) => item !== topic)
      : [...topics, topic];

    const nextCategories = categories.includes("Artificial Intelligence")
      ? categories
      : [...categories, "Artificial Intelligence" as PolicyCategory];

    onChange({
      categories: nextCategories,
      topics: nextTopics,
    });
    setAiExpanded(true);
  }

  function selectAllAiTopics() {
    const nextCategories = categories.includes("Artificial Intelligence")
      ? categories
      : [...categories, "Artificial Intelligence" as PolicyCategory];
    onChange({
      categories: nextCategories,
      topics: [...AI_TOPICS],
    });
    setAiExpanded(true);
  }

  function clearAiTopics() {
    onChange({
      categories,
      topics: [],
    });
  }

  function clearAll() {
    onChange({ categories: [], topics: [] });
    setAiExpanded(false);
  }

  return (
    <section className="category-tree">
      <header className="category-tree__header">
        <h3>Categories</h3>
        <button
          type="button"
          className="category-tree__action"
          onClick={clearAll}
          disabled={categories.length === 0 && topics.length === 0}
        >
          Clear
        </button>
      </header>

      <div className="category-tree__body" style={{ maxHeight }}>
        <label className="category-tree__row category-tree__row--root">
          <input
            type="checkbox"
            checked={selectAllChecked}
            onChange={toggleSelectAll}
          />
          <span>Select all</span>
        </label>

        <ul className="category-tree__list">
          {POLICY_CATEGORIES.map((category) => {
            const checked = categories.includes(category);
            const isAi = category === "Artificial Intelligence";

            return (
              <li key={category} className="category-tree__node">
                <div className="category-tree__item">
                  {isAi ? (
                    <button
                      type="button"
                      className="category-tree__expand"
                      aria-expanded={aiExpanded}
                      aria-label={
                        aiExpanded
                          ? "Collapse AI topics"
                          : "Expand AI topics"
                      }
                      onClick={() => setAiExpanded((open) => !open)}
                    >
                      {aiExpanded ? "▾" : "▸"}
                    </button>
                  ) : (
                    <span className="category-tree__expand-spacer" aria-hidden="true" />
                  )}

                  <label className="category-tree__row category-tree__row--item">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(category)}
                    />
                    <span>{category}</span>
                  </label>
                </div>

                {isAi && aiExpanded && (
                  <div
                    className="category-tree__children"
                    role="group"
                    aria-label="AI topics"
                  >
                    <div className="category-tree__child-toolbar">
                      <button
                        type="button"
                        className="text-btn"
                        onClick={selectAllAiTopics}
                        disabled={allTopicsSelected}
                      >
                        Select all topics
                      </button>
                      <button
                        type="button"
                        className="text-btn"
                        onClick={clearAiTopics}
                        disabled={topics.length === 0}
                      >
                        Clear topics
                      </button>
                    </div>

                    <ul className="category-tree__topic-list">
                      {AI_TOPICS.map((topic) => {
                        const topicChecked = topics.includes(topic);
                        return (
                          <li key={topic}>
                            <label className="category-tree__row category-tree__row--child">
                              <input
                                type="checkbox"
                                checked={topicChecked}
                                onChange={() => toggleTopic(topic)}
                              />
                              <span>{topic}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>

                    <p className="category-tree__hint">
                      {topics.length === 0
                        ? "No topics checked = include all AI topics when AI is selected"
                        : `${topics.length} AI topic${topics.length === 1 ? "" : "s"} selected`}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
