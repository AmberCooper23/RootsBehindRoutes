import React, { useEffect, useState } from "react";
import { fetchAllInterests } from "../../../api/interestsApi";
import "./Filter.css";

export function Filter({ filter, setFilter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [interests, setInterests] = useState([]);

  const [draftInterests, setDraftInterests] = useState(filter.interests);
  const [draftSort, setDraftSort] = useState(filter.sort);

  const hasActiveFilters =
    filter.interests.length > 0 || filter.sort !== "Most Endorsed";

  useEffect(() => {
    async function loadInterests() {
      try {
        const data = await fetchAllInterests();
        setInterests(data);
      } catch (error) {
        console.error("Failed to load interests:", error);
      }
    }
    loadInterests();
  }, []);

  useEffect(() => {
    setDraftInterests(filter.interests);
    setDraftSort(filter.sort);
  }, [filter, isOpen]);

  const sortOptions = [
    "Most Endorsed",
    "Now Open",
    "Highest Rated",
    "Most Reviewed",
    "Newest",
    "Oldest",
    "Alphabetical",
  ];

  const toggleInterest = (id) => {
    if (draftInterests.includes(id)) {
      setDraftInterests(draftInterests.filter((i) => i !== id));
    } else {
      setDraftInterests([...draftInterests, id]);
    }
  };

  const handleApply = () => {
    setFilter({ interests: draftInterests, sort: draftSort });
    setIsOpen(false);
  };

  const handleClear = () => {
    setDraftInterests([]);
    setDraftSort("Most Endorsed");
    setFilter({ interests: [], sort: "Most Endorsed" });
  };

  return (
    <div className="filterWrapper">
      <button
        className={`filterBarTrigger ${
          isOpen || hasActiveFilters ? "filterBarTriggerFilled" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filters & Sort
      </button>

      {isOpen && (
        <>
          <button
            className="filterBarOverlay"
            onClick={() => setIsOpen(false)}
            aria-label="Close filters"
          />
          <div className="filterDropdownPanel">
            <div className="filterDropdownHeader">
              <h3 className="filterDropdownTitle">Filters</h3>
              <button className="filterClearBtn" onClick={handleClear}>
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Clear all
              </button>
            </div>

            <div className="filterSection">
              <h4 className="filterSectionTitle">By category:</h4>
              <div className="filterChipsWrapper">
                {interests.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`filterChip ${
                      draftInterests.includes(interest.id) ? "active" : ""
                    }`}
                  >
                    {interest.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filterSection">
              <h4 className="filterSectionTitle">Sort by:</h4>
              <select
                className="filterSortSelect"
                value={draftSort}
                onChange={(e) => setDraftSort(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <button className="filterApplyBtn" onClick={handleApply}>
              Apply Filters
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Filter;
