import React from "react";
import "./Filter.css";

export function Filter({ filter, setFilter }) {

    const categories = ["All", "Museums", "Markets", "Restaurants", "Heritage Sites", "Cultural Centers" ];
    const [activeCategory, setActiveCategory] = React.useState("All");
    const [isSortOpen, setIsSortOpen] = React.useState(false);
    const [sortBy, setSortBy] = React.useState('Most Endorsed');

    const sortOptions = ["Most Endorsed", "Most Reviewed", "Highest Rated", "Newest", "Oldest", "Alphabetical"];

    const handleSortChange = (option) => {
        setSortBy(option);
        setIsSortOpen(false);
    };

    return (
        <main className="filterBar">
            <nav className="filterBarContainer">
                <ul className="filterBarCategories">
                    {categories.map((category) => (
                    <li key={category} className="filterBarCategoryItem">
                        <button
                        onClick={()=> setActiveCategory(category)}
                        className={`filterBarCategoryButton $ {
                            activeCategory === category ? "filterBarCategoryActive" : ""
                            }`}
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
                {sortBy} ▼
                </button>
                {isSortOpen && (
                    <ul className="filterBarDropdown">
                        {sortOptions.map((option) => (
                        <li key={option} className="filterBarDropdownItem">
                            <button
                            onClick={() => handleSortChange(option)}
                            className={`filterBarDropdownButton $ 
                                {sortBy === option ? "filterBarDropdownButtonActive" : ""}`}
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

        {isSortOpen &&(
            <button
            className="filterBarOverlay"
            onClick={()=>setIsSortOpen(false)}
            aria-label="Close sort dropdown"
            type="button"
            />
        )}
        </main>
    );
}

export default Filter;