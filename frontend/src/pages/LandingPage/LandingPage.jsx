import React, { useState, useEffect, useCallback } from "react";
import "./LandingPage.css";
import Hero from "../../components/Hero/Hero";
import Filter from "../../components/Filter/Filter";
import LocationCard from "../../components/LocationCard/LocationCard";
import ContributeModal from "../../components/ContributeModal/ContributeModal";
import { fetchAllPlaces } from "../../../api/placesApi";
import { fetchAllActivities } from "../../../api/activitiesApi";

export function LandingPage() {
  const [filter, setFilter] = useState({
    category: "All",
    sort: "Most Endorsed",
  });

  const [experiences, setExperiences] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [isContributeOpen, setIsContributeOpen] = useState(false);

  const loadExperiences = useCallback(async () => {
    try {
      console.log("➡️ Loading experiences...");
      const [places, activities] = await Promise.all([
        fetchAllPlaces(),
        fetchAllActivities(),
      ]);

      console.log("✅ Places:", places);
      console.log("✅ Activities:", activities);

      const taggedPlaces = places.map((place) => ({
        ...place,
        type: "place",
      }));
      const taggedActivities = activities.map((activity) => ({
        ...activity,
        type: "activity",
      }));

      const combined = [...taggedPlaces, ...taggedActivities];
      console.log("✅ Combined experiences:", combined);

      setExperiences(combined);
    } catch (error) {
      console.error("❌ Error fetching experiences:", error);
    }
  }, []);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  useEffect(() => {
    window.addEventListener("experiences:updated", loadExperiences);
    return () =>
      window.removeEventListener("experiences:updated", loadExperiences);
  }, [loadExperiences]);

  const handleCardClick = (experience) => {
    console.log("🖱️ Card clicked:", experience);
    setSelectedExperience(experience);
    setIsContributeOpen(true);
  };

  const handleModalClose = () => {
    setIsContributeOpen(false);
  };

  const handleContributeSuccess = () => {
    console.log("✅ Contribution succeeded, reloading...");
    loadExperiences();
  };

  const filteredExperiences = experiences.filter(
    (experience) =>
      filter.category === "All" ||
      (Array.isArray(experience.categoryLabels) &&
        experience.categoryLabels.includes(filter.category)),
  );

  const sortedExperiences = [...filteredExperiences].sort((a, b) => {
    switch (filter.sort) {
      case "Highest Rated":
        return (b.touristRating ?? 0) - (a.touristRating ?? 0);
      case "Most Endorsed":
        return (b.localRating ?? 0) - (a.localRating ?? 0);
      case "Alphabetical":
        return (a.name || "").localeCompare(b.name || "");
      default:
        return 0;
    }
  });

  console.log("✅ Final sorted experiences:", sortedExperiences);

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
              onClick={() => handleCardClick(experience)}
            />
          ))}
        </section>
        <aside className="ratingSystem">
          {/* rating system UI unchanged */}
        </aside>
      </section>
      <ContributeModal
        isOpen={isContributeOpen}
        onClose={handleModalClose}
        target={selectedExperience}
        onSuccess={handleContributeSuccess}
      />
    </main>
  );
}

export default LandingPage;
