import "./LocationCard.css";
import { useState, useEffect } from "react";
import { addBookmark, removeBookmark } from "../../../api/bookmarksApi";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function getOpenStatus(hours) {
  if (!hours) return null;

  const now = new Date();
  const todayKey = DAY_KEYS[now.getDay()];
  const today = hours[todayKey];

  if (!today || !today.open || !today.close) return null;

  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const isOvernight = closeMinutes < openMinutes;

  let isOpen = false;
  if (isOvernight) {
    isOpen = nowMinutes >= openMinutes || nowMinutes < closeMinutes;
  } else {
    isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  }

  if (isOpen) {
    let minsToClose;
    if (isOvernight && nowMinutes >= openMinutes) {
      minsToClose = 1440 - nowMinutes + closeMinutes;
    } else if (isOvernight && nowMinutes < closeMinutes) {
      minsToClose = closeMinutes - nowMinutes;
    } else {
      minsToClose = closeMinutes - nowMinutes;
    }

    if (minsToClose <= 60 && minsToClose > 0) {
      return { type: "closing-soon", label: "Closes soon" };
    }
    return { type: "open", label: "Open now" };
  } else {
    let minsToOpen = Infinity;
    if (nowMinutes < openMinutes) {
      minsToOpen = openMinutes - nowMinutes;
    }

    if (minsToOpen <= 60 && minsToOpen > 0) {
      return { type: "opening-soon", label: "Opens soon" };
    }
    return { type: "closed", label: "Closed" };
  }
}

export function LocationCard({
  image,
  name,
  location,
  localRating,
  touristRating,
  interests,
  hours,
  onClick,
  userId,
  itemPath,
  bookmarkId,
  onBookmarkChange,
}) {
  const [localBookmarkId, setLocalBookmarkId] = useState(bookmarkId || null);

  useEffect(() => {
    setLocalBookmarkId(bookmarkId || null);
  }, [bookmarkId]);

  const isBookmarked = !!localBookmarkId;
  const openStatus = getOpenStatus(hours);

  const normalizeInterest = (interest) => {
    if (interest && typeof interest === "object" && "id" in interest) {
      return interest.id;
    }
    return String(interest || "");
  };

  const formatInterest = (interest) =>
    normalizeInterest(interest)
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const interestLabel = Array.isArray(interests)
    ? interests.map(formatInterest).join(", ")
    : interests
      ? formatInterest(interests)
      : "";

  const locationLabel =
    typeof location === "string"
      ? location
      : location?.city && location?.region
        ? `${location.city}, ${location.region}`
        : location?.latitude && location?.longitude
          ? `${location.latitude}, ${location.longitude}`
          : "";

  const toggleBookmark = async (e) => {
    e.stopPropagation();

    if (!userId) {
      console.warn("Cannot bookmark: user not logged in");
      return;
    }

    try {
      if (isBookmarked && localBookmarkId) {
        await removeBookmark(localBookmarkId);
        setLocalBookmarkId(null);
        onBookmarkChange?.(itemPath, null);
      } else {
        const res = await addBookmark(userId, itemPath);
        setLocalBookmarkId(res.id || null);
        onBookmarkChange?.(itemPath, res.id || null);
      }
    } catch (error) {
      console.error("Bookmark toggle failed:", error);
    }
  };

  return (
    <section
      className="locationCard"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <figure className="locationCardImageWrapper">
        <img
          src={image || "/placeholder.png"}
          alt={name || "Unknown place"}
          className="locationCardImage"
        />

        {userId && (
          <button
            className={`locationCardSaveButton ${isBookmarked ? "active" : ""}`}
            onClick={toggleBookmark}
            aria-label={isBookmarked ? "Remove bookmark" : "Save bookmark"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isBookmarked ? "currentColor" : "none"}
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

        <article className="locationCardInterest">{interestLabel}</article>
      </figure>

      <section className="locationCardContent">
        <h3 className="locationCardTitle">{name || "Unnamed Place"}</h3>

        <div className="locationCardMetaRow">
          <address className="locationCardSubtitle">{locationLabel}</address>
          {openStatus && (
            <span
              className={`locationCardStatus locationCardStatus-${openStatus.type}`}
            >
              {openStatus.label}
            </span>
          )}
        </div>

        <dl className="locationCardRatings">
          <section className="locationCardRatingsContainer">
            <dt className="locationCardRating">Local Voices</dt>
            <dd className="locationCardRatingValue">
              <span className="locationCardRatingNumber">
                {localRating ?? "0"}
              </span>
              <span className="locationCardRatingMax">/10</span>
            </dd>
          </section>

          <section className="locationCardRatingsContainer">
            <dt className="locationCardRating">Tourist Rating</dt>
            <dd className="locationCardRatingValue">
              <span className="locationCardRatingNumber">
                {touristRating ?? "0"}
              </span>
              <span className="locationCardRatingMax">/5</span>
            </dd>
          </section>
        </dl>
      </section>

      <article className="locationCardAccent" aria-hidden="true" />
    </section>
  );
}

export default LocationCard;
