import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import Hero from "../../components/Hero/Hero";
import Filter from "../../components/Filter/Filter";
import LocationCard from "../../components/LocationCard/LocationCard";
import { fetchAllPlaces } from "../../../api/placesApi";
import { fetchAllActivities } from "../../../api/activitiesApi";
import { getBookmarks } from "../../../api/bookmarksApi";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function isCurrentlyOpen(hours) {
  if (!hours) return false;
  const now = new Date();
  const todayKey = DAY_KEYS[now.getDay()];
  const today = hours[todayKey];

  if (!today || !today.open || !today.close) return false;

  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

export function LandingPage() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const [filter, setFilter] = useState({
    interests: [],
    sort: "Most Endorsed",
  });

  const [experiences, setExperiences] = useState([]);
  const [bookmarksByPath, setBookmarksByPath] = useState({});

  const loadExperiences = useCallback(async () => {
    try {
      const [places, activities] = await Promise.all([
        fetchAllPlaces(),
        fetchAllActivities(),
      ]);

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
      console.error("❌ Error fetching experiences:", error);
    }
  }, []);

  const loadBookmarks = useCallback(async () => {
    if (!user?.uid) {
      setBookmarksByPath({});
      return;
    }
    try {
      const bookmarks = await getBookmarks(user.uid);
      const map = {};
      bookmarks.forEach((b) => {
        map[b.itemId] = b.id;
      });
      setBookmarksByPath(map);
    } catch (error) {
      console.error("❌ Error fetching bookmarks:", error);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  useEffect(() => {
    window.addEventListener("experiences:updated", loadExperiences);
    return () =>
      window.removeEventListener("experiences:updated", loadExperiences);
  }, [loadExperiences]);

  const handleCardClick = (experience) => {
    navigate(`/Details/${experience.type}/${experience.id}`);
  };

  const handleBookmarkChange = (itemPath, bookmarkId) => {
    setBookmarksByPath((prev) => {
      const next = { ...prev };
      if (bookmarkId) {
        next[itemPath] = bookmarkId;
      } else {
        delete next[itemPath];
      }
      return next;
    });
  };

  const filteredExperiences = experiences.filter((experience) => {
    if (filter.interests.length > 0) {
      if (!experience.interests) return false;
      const expInterests = Array.isArray(experience.interests)
        ? experience.interests
        : [experience.interests];
      if (
        !filter.interests.every((interest) => expInterests.includes(interest))
      ) {
        return false;
      }
    }

    if (filter.sort === "Now Open") {
      if (!isCurrentlyOpen(experience.hours)) return false;
    }

    return true;
  });

  const sortedExperiences = [...filteredExperiences].sort((a, b) => {
    switch (filter.sort) {
      case "Now Open":
        return (b.localRating ?? 0) - (a.localRating ?? 0);
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
              Endorsed by locals, experienced by travellers like you
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
          {sortedExperiences.map((experience) => {
            const itemPath = `${experience.type}/${experience.id}`;
            return (
              <LocationCard
                key={`${experience.type}-${experience.id}`}
                {...experience}
                userId={user?.uid}
                itemPath={itemPath}
                bookmarkId={bookmarksByPath[itemPath] || null}
                onBookmarkChange={handleBookmarkChange}
                onClick={() => handleCardClick(experience)}
              />
            );
          })}
        </section>
        <aside className="ratingSystem">
          <h3 className="ratingSystemTitle">Understanding our rating system</h3>
          <article className="ratingSystemDivider" aria-hidden="true"></article>
          <p className="ratingSystemDescription">
            We use a unique dual rating system to give you both local insight
            and tourist perspective.
          </p>
          <section className="ratingSystemGrid">
            <article className="ratingSystemInterest">
              <header className="ratingSystemHeader">
                <section className="ratingSystemIconContainer">
                  <article className="ratingSystemIcon">10</article>
                </section>
                <h4 className="ratingSystemInterestTitle">
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
            <article className="ratingSystemInterest">
              <header className="ratingSystemHeader">
                <section className="ratingSystemIconContainer">
                  <article className="ratingSystemIcon">★</article>
                </section>
                <h4 className="ratingSystemInterestTitle">
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
