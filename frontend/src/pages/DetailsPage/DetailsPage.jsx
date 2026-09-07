import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { fetchPlace } from "../../../api/placesApi";
import { fetchActivity } from "../../../api/activitiesApi";
import { fetchUser } from "../../../api/usersApi";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
} from "../../../api/bookmarksApi";
import { fetchAllEndorsements } from "../../../api/endorsementsApi";
import { fetchAllReviews } from "../../../api/reviewsApi";
import ContributeModal from "../../components/ContributeModal/ContributeModal";
import "./DetailsPage.css";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const DAY_LABELS = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

function formatTime(time24) {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function getHoursStatus(hours) {
  if (!hours) return { known: false };

  const now = new Date();
  const todayKey = DAY_KEYS[now.getDay()];
  const today = hours[todayKey];

  if (!today) {
    return { known: true, isOpen: false, todayLabel: "Closed today" };
  }

  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes;

  return {
    known: true,
    isOpen,
    todayLabel: isOpen
      ? `Open Now · Closes ${formatTime(today.close)}`
      : `Closed · Opens ${formatTime(today.open)}`,
  };
}

export function DetailsPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [bookmarkId, setBookmarkId] = useState(null);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);
  const [endorsements, setEndorsements] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewerNames, setReviewerNames] = useState({});

  const itemPath = `${type}/${id}`;

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const data =
        type === "place" ? await fetchPlace(id) : await fetchActivity(id);
      setItem({ ...data, type });
    } catch (err) {
      console.error("❌ Failed to load item:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [type, id]);

  const loadBookmarkStatus = useCallback(async () => {
    if (!user?.uid) {
      setBookmarkId(null);
      return;
    }
    try {
      const bookmarks = await getBookmarks(user.uid);
      const match = bookmarks.find((b) => b.itemId === itemPath);
      setBookmarkId(match ? match.id : null);
    } catch (err) {
      console.error("❌ Failed to load bookmark status:", err);
    }
  }, [user?.uid, itemPath]);

  const loadContributions = useCallback(async () => {
    try {
      const [allEndorsements, allReviews] = await Promise.all([
        fetchAllEndorsements(),
        fetchAllReviews(),
      ]);
      const key = type === "place" ? "placeId" : "activityId";
      const sortByRecent = (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

      const filteredEndorsements = allEndorsements
        .filter((e) => e[key] === id)
        .sort(sortByRecent);
      const filteredReviews = allReviews
        .filter((r) => r[key] === id)
        .sort(sortByRecent);

      setEndorsements(filteredEndorsements);
      setReviews(filteredReviews);

      const userIds = new Set(
        [...filteredEndorsements, ...filteredReviews]
          .map((entry) => entry.userId)
          .filter(Boolean),
      );

      const nameEntries = await Promise.all(
        Array.from(userIds).map(async (uid) => {
          try {
            const profile = await fetchUser(uid);
            return [uid, profile?.displayName || "Anonymous"];
          } catch (err) {
            console.error("❌ Failed to load reviewer profile:", uid, err);
            return [uid, "Anonymous"];
          }
        }),
      );
      setReviewerNames(Object.fromEntries(nameEntries));
    } catch (err) {
      console.error("❌ Failed to load reviews/endorsements:", err);
    }
  }, [type, id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  useEffect(() => {
    loadBookmarkStatus();
  }, [loadBookmarkStatus]);

  useEffect(() => {
    loadContributions();
  }, [loadContributions]);

  const handleContributeSuccess = () => {
    loadItem();
    loadContributions();
  };

  const toggleBookmark = async () => {
    if (!user?.uid) return;
    try {
      if (bookmarkId) {
        await removeBookmark(bookmarkId);
        setBookmarkId(null);
      } else {
        const res = await addBookmark(user.uid, itemPath);
        setBookmarkId(res.id || null);
      }
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    }
  };

  const formatCategoryLabel = (label) =>
    label
      ?.split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const categoryLabel = Array.isArray(item?.categoryLabels)
    ? item.categoryLabels.map(formatCategoryLabel).join(", ")
    : "";

  const locationLabel =
    item?.location?.city && item?.location?.region
      ? `${item.location.city}, ${item.location.region}`
      : "";

  const hoursStatus = getHoursStatus(item?.hours);

  if (loading) {
    return (
      <main className="detailsPage">
        <section className="detailsStateBox">
          <p className="detailsStateText">Loading details…</p>
        </section>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="detailsPage">
        <section className="detailsStateBox">
          <h2 className="detailsStateTitle">We Couldn't Find That</h2>
          <p className="detailsStateText">
            This place or experience may have been removed.
          </p>
          <button className="detailsStateButton" onClick={() => navigate("/")}>
            Back to Discover
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="detailsPage">
      <section className="detailsCard">
        <figure className="detailsHeroWrapper">
          <img
            src={item.image || "/placeholder.png"}
            alt={item.name || "Unknown place"}
            className="detailsHeroImage"
          />
          <span className="detailsCategoryBadge">{categoryLabel}</span>
          <button
            className="detailsCloseButton"
            onClick={() => navigate(-1)}
            aria-label="Close details"
          >
            ×
          </button>
        </figure>

        <section className="detailsBody">
          <header className="detailsHeader">
            <section>
              <h1 className="detailsTitle">{item.name || "Unnamed Place"}</h1>
              <address className="detailsSubtitle">{locationLabel}</address>
            </section>
            {user && (
              <button
                className={`detailsSaveButton ${bookmarkId ? "active" : ""}`}
                onClick={toggleBookmark}
                aria-label={bookmarkId ? "Remove bookmark" : "Save bookmark"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={bookmarkId ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  width="24"
                  height="24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                       2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                       C13.09 3.81 14.76 3 16.5 3
                       19.58 3 22 5.42 22 8.5
                       c0 3.78-3.4 6.86-8.55 11.18L12 21z"
                  />
                </svg>
              </button>
            )}
          </header>

          <section className="detailsRatings">
            <article className="detailsRatingBox">
              <span className="detailsRatingLabel">Local Voice</span>
              <span className="detailsRatingValue">
                {item.localRating ?? "?"}
                <span className="detailsRatingMax">/10</span>
              </span>
              <span className="detailsRatingCaption">
                Locals wish you could experience it
              </span>
            </article>
            <article className="detailsRatingBox">
              <span className="detailsRatingLabel">Traveler Rating</span>
              <span className="detailsRatingValue">
                {item.touristRating ?? "?"}
                <span className="detailsRatingMax">/5</span>
              </span>
              <span className="detailsRatingCaption">
                {item.reviewCount
                  ? `Based on ${item.reviewCount} review${item.reviewCount === 1 ? "" : "s"}`
                  : "No reviews yet"}
              </span>
            </article>
          </section>

          <section className="detailsHoursSection">
            <button
              className="detailsHoursToggle"
              onClick={() => setIsHoursExpanded((prev) => !prev)}
              aria-expanded={isHoursExpanded}
            >
              <span className="detailsHoursLeft">
                {hoursStatus.known ? (
                  <span
                    className={`detailsHoursStatusDot ${
                      hoursStatus.isOpen ? "open" : "closed"
                    }`}
                    aria-hidden="true"
                  />
                ) : null}
                <span className="detailsHoursStatusText">
                  {hoursStatus.known
                    ? hoursStatus.todayLabel
                    : "Hours not listed"}
                </span>
              </span>
              {hoursStatus.known && (
                <span className="detailsHoursChevron">
                  {isHoursExpanded ? "▲" : "▼"}
                </span>
              )}
            </button>

            {isHoursExpanded && hoursStatus.known && (
              <ul className="detailsHoursList">
                {DAY_KEYS.map((dayKey) => {
                  const dayHours = item.hours?.[dayKey];
                  return (
                    <li key={dayKey} className="detailsHoursRow">
                      <span className="detailsHoursDay">
                        {DAY_LABELS[dayKey]}
                      </span>
                      <span className="detailsHoursTime">
                        {dayHours
                          ? `${formatTime(dayHours.open)} – ${formatTime(dayHours.close)}`
                          : "Closed"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="detailsMetaGrid">
            <article className="detailsMetaItem">
              <span className="detailsMetaLabel">Phone</span>
              {item.phone ? (
                <a href={`tel:${item.phone}`} className="detailsMetaLink">
                  {item.phone}
                </a>
              ) : (
                <span className="detailsMetaValue">Not listed</span>
              )}
            </article>
            <article className="detailsMetaItem">
              <span className="detailsMetaLabel">Email</span>
              {item.email ? (
                <a href={`mailto:${item.email}`} className="detailsMetaLink">
                  {item.email}
                </a>
              ) : (
                <span className="detailsMetaValue">Not listed</span>
              )}
            </article>
            <article className="detailsMetaItem">
              <span className="detailsMetaLabel">Website</span>
              {item.website ? (
                <a
                  href={item.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detailsMetaLink"
                >
                  Visit
                </a>
              ) : (
                <span className="detailsMetaValue">Not listed</span>
              )}
            </article>
          </section>

          <nav className="detailsTabs" aria-label="Details sections">
            <button
              className={`detailsTab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`detailsTab ${activeTab === "localReviews" ? "active" : ""}`}
              onClick={() => setActiveTab("localReviews")}
            >
              Local Reviews{" "}
              {endorsements.length ? `(${endorsements.length})` : ""}
            </button>
            <button
              className={`detailsTab ${activeTab === "touristReviews" ? "active" : ""}`}
              onClick={() => setActiveTab("touristReviews")}
            >
              Tourist Reviews {item.reviewCount ? `(${item.reviewCount})` : ""}
            </button>
          </nav>

          {activeTab === "overview" && (
            <section className="detailsTabPanel">
              <p className="detailsDescription">
                {item.description || "No description available yet."}
              </p>
            </section>
          )}

          {activeTab === "localReviews" && (
            <section className="detailsTabPanel">
              {endorsements.length === 0 ? (
                <p className="detailsDescription">
                  No local endorsements yet. Be the first to share why this
                  place matters.
                </p>
              ) : (
                <ul className="detailsReviewList">
                  {endorsements.map((endorsement) => {
                    const score = endorsement.score ?? endorsement.rating;
                    const text = endorsement.content ?? endorsement.whyEndorse;
                    return (
                      <li key={endorsement.id} className="detailsReviewCard">
                        <header className="detailsReviewHeader">
                          <span className="detailsReviewRating">
                            {score ?? "?"}
                            <span className="detailsReviewRatingMax">/10</span>
                          </span>
                          {endorsement.createdAt && (
                            <span className="detailsReviewDate">
                              {new Date(
                                endorsement.createdAt,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </header>
                        {text && <p className="detailsReviewText">{text}</p>}
                        {endorsement.culturalSensitivity && (
                          <p className="detailsReviewMeta">
                            Cultural note: {endorsement.culturalSensitivity}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {activeTab === "touristReviews" && (
            <section className="detailsTabPanel">
              {reviews.length === 0 ? (
                <p className="detailsDescription">
                  No tourist reviews yet. Share your experience to help future
                  travelers.
                </p>
              ) : (
                <ul className="detailsReviewList">
                  {reviews.map((review) => {
                    const text = review.content ?? review.review;
                    return (
                      <li key={review.id} className="detailsReviewCard">
                        <header className="detailsReviewHeader">
                          <span className="detailsReviewRating">
                            {review.rating ?? "?"}
                            <span className="detailsReviewRatingMax">/5</span>
                          </span>
                          {review.visitDate && (
                            <span className="detailsReviewDate">
                              Visited{" "}
                              {new Date(review.visitDate).toLocaleDateString()}
                            </span>
                          )}
                        </header>
                        {text && <p className="detailsReviewText">{text}</p>}
                        {typeof review.wouldRecommend === "boolean" && (
                          <p className="detailsReviewMeta">
                            {review.wouldRecommend
                              ? "Would recommend"
                              : "Would not recommend"}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          <footer className="detailsActions">
            <button
              className="detailsContributeButton"
              onClick={() => setIsContributeOpen(true)}
            >
              Contribute
            </button>
          </footer>
        </section>
      </section>

      <ContributeModal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        target={item}
        onSuccess={handleContributeSuccess}
      />
    </main>
  );
}

export default DetailsPage;
