import React, { useState, useEffect } from "react";
import "./LandingPage.css";
import Hero from "../../components/Hero/Hero";
import Filter from "../../components/Filter/Filter";
import LocationCard from "../../components/LocationCard/LocationCard";
import { fetchAllPlaces } from "../../../api/placesApi";

export function LandingPage() {
  const [filter, setFilter] = useState({
    category: "All",
    sort: "Most Endorsed",
  });

  const [places, setPlaces] = useState([]);

  useEffect(() => {
    async function loadPlaces() {
      try {
        const data = await fetchAllPlaces();
        setPlaces(data);
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    }
    loadPlaces();
  }, []);

  const filteredPlaces = places.filter(
    (place) => filter.category === "All" || place.category === filter.category,
  );

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    switch (filter.sort) {
      case "Highest Rated":
        return b.touristRating - a.touristRating;
      case "Most Endorsed":
        return b.localRating - a.localRating;
      case "Alphabetical":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    <main className="discoverPage">
      <Hero />
      <Filter filter={filter} setFilter={setFilter} />
      <section id="discoverContainer" className="discoverContainer">
        <header className="discoverHeader">
          <span className="discoverHeaderText">
            <h2 className="discoverHeaderTitle">
              Discover Authentic Experiences
            </h2>
            <p className="discoverSubtitle">
              Endorsed by locals, experienced by travelers like you
            </p>
          </span>
          <p className="discoverCount">
            <span className="discoverCountNumber">{sortedPlaces.length}</span>{" "}
            experiences found
          </p>
        </header>
        <section className="discoverGrid">
          {sortedPlaces.map((place, index) => (
            <LocationCard key={index} {...place} />
          ))}
        </section>
        <aside className="ratingSystem">
          <h3 className="ratingSystemTitle">Understanding our rating system</h3>
          <article className="ratingSystemDivider" aria-hidden="true"></article>
          <p className="ratingSystemDescription">
            We use a unique dual rating system to give you both local insight
            and tourist perspective.
          </p>
          <section className="ratingSystemGrid">
            <article className="ratingSystemCategory">
              <header className="ratingSystemHeader">
                <section className="ratingSystemIconContainer">
                  <article className="ratingSystemIcon">10</article>
                </section>
                <h4 className="ratingSystemCategoryTitle">
                  Local Endorsement (1-10)
                </h4>
              </header>
              <ul className="ratingSystemList">
                <li className="ratingSystemItem">
                  <strong>1-3:</strong> Locals prefer you didn't visit
                </li>
                <li className="ratingSystemItem">
                  <strong>4-6:</strong> Locals are okay with visitors
                </li>
                <li className="ratingSystemItem">
                  <strong>7-8:</strong> Locals love this place
                </li>
                <li className="ratingSystemItem">
                  <strong>9-10:</strong> Locals wish you could experience it
                </li>
              </ul>
            </article>
            <article className="ratingSystemCategory">
              <header className="ratingSystemHeader">
                <section className="ratingSystemIconContainer">
                  <article className="ratingSystemIcon">★</article>
                </section>
                <h4 className="ratingSystemCategoryTitle">
                  Tourist Rating (1-5)
                </h4>
              </header>
              <ul className="ratingSystemList">
                <li className="ratingSystemItem">
                  <strong>1-2:</strong> Not recommended
                </li>
                <li className="ratingSystemItem">
                  <strong>3:</strong> Average experience
                </li>
                <li className="ratingSystemItem">
                  <strong>4:</strong> Good experience
                </li>
                <li className="ratingSystemItem">
                  <strong>5:</strong> Excellent, highly recommended
                </li>
              </ul>
            </article>
          </section>
        </aside>
      </section>
    </main>
  );
}

export default LandingPage;
