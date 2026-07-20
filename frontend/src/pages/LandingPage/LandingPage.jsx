import React, { useState, useEffect } from "react";
import "./LandingPage.css";
import Hero from "../../components/Hero/Hero";
import Filter from "../../components/Filter/Filter";
import LocationCard from "../../components/LocationCard/LocationCard";
import { fetchAllPlaces } from "../../../api/placesApi";
import { fetchAllActivities } from "../../../api/activitiesApi";

export function LandingPage() {
  const [filter, setFilter] = useState({
    category: "All",
    sort: "Most Endorsed",
  });

  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    async function loadExperiences() {
      try {
        const [places, activities] = await Promise.all([
          fetchAllPlaces(),
          fetchAllActivities(),
        ]);

        // Tag each item with its source type so cards/clicks can tell
        // places and activities apart later (e.g. for routing to detail pages)
        const taggedPlaces = places.map((place) => ({
          ...place,
          type: "place",
        }));
        const taggedActivities = activities.map((activity) => ({
          ...activity,
          type: "activity",
        }));

        setExperiences([...taggedPlaces, ...taggedActivities]);
      } catch (error) {
        console.error("Error fetching experiences:", error);
      }
    }
    loadExperiences();
  }, []);

  const filteredExperiences = experiences.filter(
    (experience) =>
      filter.category === "All" ||
      (Array.isArray(experience.categoryLabels) &&
        experience.categoryLabels.includes(filter.category)),
  );

  const sortedExperiences = [...filteredExperiences].sort((a, b) => {
    switch (filter.sort) {
      case "Highest Rated":
        return b.touristRating - a.touristRating;
      case "Most Endorsed":
        return b.localRating - a.localRating;
      case "Alphabetical":
        return (a.name || "").localeCompare(b.name || "");
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
            <span className="discoverCountNumber">
              {sortedExperiences.length}
            </span>{" "}
            experiences found
          </p>
        </header>
        <section className="discoverGrid">
          {sortedExperiences.map((experience) => (
            <LocationCard
              key={`${experience.type}-${experience.id}`}
              {...experience}
            />
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
