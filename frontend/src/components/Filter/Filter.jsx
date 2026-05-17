import React from "react";
import "./Filter.css";

export function Filter({ filter, setFilter }) {
    const categories = ["All", "Museums", "Markets", "Restaurants", "Heritage Sites", "Cultural Centers"];
    const sortOptions = ["Most Endorsed", "Most Reviewed", "Highest Rated", "Newest", "Oldest", "Alphabetical"];

    const [isSortOpen, setIsSortOpen] = React.useState(false);

    const handleCategoryChange = (category) => {
        setFilter({ category, sort: filter.sort });
    };

    const handleSortChange = (option) => {
        setFilter({ category: filter.category, sort: option });
        setIsSortOpen(false);
    };

    return (
        <main className="filterBar">
            <nav className="filterBarContainer">
                <ul className="filterBarCategories">
                    {categories.map((category) => (
                        <li key={category} className="filterBarCategoryItem">
                            <button
                                onClick={() => handleCategoryChange(category)}
                                className={`filterBarCategoryButton ${filter.category === category ? "filterBarCategoryButtonActive" : ""}`}
                                type="button"
                            >
                                {category}
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
                                        onClick={() => handleSortChange(option)}
                                        className={`filterBarDropdownButton ${filter.sort === option ? "filterBarDropdownButtonActive" : ""}`}
                                        type="button"
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
