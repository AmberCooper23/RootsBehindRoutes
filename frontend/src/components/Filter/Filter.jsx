import React, { useEffect, useState } from "react";
import { fetchAllInterests } from "../../../api/interestsApi";
import "./Filter.css";

export function Filter({ filter, setFilter }) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    async function loadInterests() {
      try {
        const data = await fetchAllInterests();

        setInterests([
          {
            id: "all",
            name: "All",
          },
          ...data,
        ]);
      } catch (error) {
        console.error("Failed to load interests:", error);
      }
    }

    loadInterests();
  }, []);

  const sortOptions = [
    "Most Endorsed",
    "Most Reviewed",
    "Highest Rated",
    "Newest",
    "Oldest",
    "Alphabetical",
  ];

  const handleInterestChange = (interest) => {
    setFilter({
      interest: interest === "all" ? null : interest,
      sort: filter.sort,
    });
  };

  const handleSortChange = (option) => {
    setFilter({
      interest: filter.interest,
      sort: option,
    });

    setIsSortOpen(false);
  };

  return (
    <main className="filterBar">
      <nav className="filterBarContainer">
        <ul className="filterBarInterests">
          {interests.map((interest) => (
            <li key={interest.id} className="filterBarInterestItem">
              <button
                type="button"
                onClick={() => handleInterestChange(interest.id)}
                className={`filterBarInterestButton ${
                  filter.interest === interest.id ||
                  (interest.id === "all" && !filter.interest)
                    ? "filterBarInterestButtonActive"
                    : ""
                }`}
              >
                {interest.name}
              </button>
            </li>
          ))}
        </ul>

        <section className="filterBarSort">
          <button
            className="filterBarSortButton"
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            aria-expanded={isSortOpen}
          >
            {filter.sort} ▼
          </button>

          {isSortOpen && (
            <ul className="filterBarDropdown">
              {sortOptions.map((option) => (
                <li key={option} className="filterBarDropdownItem">
                  <button
                    type="button"
                    onClick={() => handleSortChange(option)}
                    className={`filterBarDropdownButton ${
                      filter.sort === option
                        ? "filterBarDropdownButtonActive"
                        : ""
                    }`}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </nav>

      {isSortOpen && (
        <button
          className="filterBarOverlay"
          onClick={() => setIsSortOpen(false)}
          aria-label="Close sort dropdown"
          type="button"
        />
      )}
    </main>
  );
}

export default Filter;
