import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { fetchPlace } from "../../../api/placesApi";
import { fetchActivity } from "../../../api/activitiesApi";
import { fetchUser } from "../../../api/usersApi";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
} from "../../../api/bookmarksApi";
import {
  fetchAllEndorsements,
  addEndorsementReply,
} from "../../../api/endorsementsApi";
import { fetchAllReviews, addReviewReply } from "../../../api/reviewsApi";
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

function formatDate(dateVal) {
  if (!dateVal) return "";
  if (typeof dateVal === "object" && dateVal._seconds !== undefined) {
    return new Date(dateVal._seconds * 1000).toLocaleDateString();
  }
  return new Date(dateVal).toLocaleDateString();
}

function getInitials(name) {
  if (!name || name === "Anonymous") return "?";
  return name.charAt(0).toUpperCase();
}

function formatRating(val) {
  if (val === undefined || val === null || val === "?") return "?";
  const num = Number(val);
  if (isNaN(num)) return val;
  return parseFloat(num.toFixed(1));
}

function getHoursStatus(hours) {
  if (!hours) return { known: false };
  const now = new Date();
  const todayKey = DAY_KEYS[now.getDay()];
  const today = hours[todayKey];
  if (!today) return { known: true, isOpen: false, todayLabel: "Closed today" };

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

  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

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

  const handleStartReply = async (targetId) => {
    if (!user) {
      try {
        await signInWithPopup(auth, provider);
        setReplyingToId(targetId);
        setReplyText("");
      } catch (error) {
        console.error("Login failed:", error);
      }
    } else {
      setReplyingToId(targetId);
      setReplyText("");
    }
  };

  const handleReplySubmit = async (e, targetId, isEndorsement) => {
    e.preventDefault();
    if (!replyText.trim() || !user) return;

    setIsSubmittingReply(true);
    const newReplyContent = replyText.trim();
    const replyData = {
      userId: user.uid,
      userDisplayName: user.displayName || "User",
      userPhotoURL: user.photoURL || null,
      content: newReplyContent,
    };

    try {
      if (isEndorsement) {
        const savedReply = await addEndorsementReply(targetId, replyData);
        setEndorsements((prev) =>
          prev.map((end) => {
            if (end.id === targetId) {
              return { ...end, replies: [...(end.replies || []), savedReply] };
            }
            return end;
          }),
        );
      } else {
        const savedReply = await addReviewReply(targetId, replyData);
        setReviews((prev) =>
          prev.map((rev) => {
            if (rev.id === targetId) {
              return { ...rev, replies: [...(rev.replies || []), savedReply] };
            }
            return rev;
          }),
        );
      }

      setReplyText("");
      setReplyingToId(null);
    } catch (err) {
      console.error("Failed to post reply:", err);
      alert("Failed to post reply.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const formatInterestLabel = (label) =>
    String(label || "")
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const interestsLabel = Array.isArray(item?.interests)
    ? item.interests.map(formatInterestLabel).join(", ")
    : item?.interests
      ? formatInterestLabel(item.interests)
      : "";

  const locationLabel =
    item?.location?.city && item?.location?.region
      ? `${item.location.city}, ${item.location.region}`
      : "";
  const hoursStatus = getHoursStatus(item?.hours);

  const dynamicTouristRating =
    reviews.length > 0
      ? formatRating(
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length,
        )
      : formatRating(item?.touristRating);

  const dynamicLocalRating =
    endorsements.length > 0
      ? formatRating(
          endorsements.reduce((sum, e) => sum + (e.score ?? e.rating ?? 0), 0) /
            endorsements.length,
        )
      : formatRating(item?.localRating);

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
          <span className="detailsInterestBadge">{interestsLabel}</span>

          <button
            className="detailsCloseButton"
            onClick={() => navigate(-1)}
            aria-label="Close details"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
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
                    d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z"
                  />
                </svg>
              </button>
            )}
          </header>

          <section className="detailsRatings">
            <article className="detailsRatingBox">
              <span className="detailsRatingLabel">Local Voice</span>
              <span className="detailsRatingValue">
                {dynamicLocalRating}
                <span className="detailsRatingMax">/10</span>
              </span>
              <span className="detailsRatingCaption">
                {endorsements.length > 0
                  ? `Based on ${endorsements.length} endorsement${endorsements.length === 1 ? "" : "s"}`
                  : "Locals wish you could experience it"}
              </span>
            </article>
            <article className="detailsRatingBox">
              <span className="detailsRatingLabel">traveller Rating</span>
              <span className="detailsRatingValue">
                {dynamicTouristRating}
                <span className="detailsRatingMax">/5</span>
              </span>
              <span className="detailsRatingCaption">
                {reviews.length > 0
                  ? `Based on ${reviews.length} review${reviews.length === 1 ? "" : "s"}`
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
                    className={`detailsHoursStatusDot ${hoursStatus.isOpen ? "open" : "closed"}`}
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
                {DAY_KEYS.map((dayKey) => (
                  <li key={dayKey} className="detailsHoursRow">
                    <span className="detailsHoursDay">
                      {DAY_LABELS[dayKey]}
                    </span>
                    <span className="detailsHoursTime">
                      {item.hours?.[dayKey]
                        ? `${formatTime(item.hours[dayKey].open)} – ${formatTime(item.hours[dayKey].close)}`
                        : "Closed"}
                    </span>
                  </li>
                ))}
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
              {endorsements.length > 0 ? `(${endorsements.length})` : ""}
            </button>
            <button
              className={`detailsTab ${activeTab === "touristReviews" ? "active" : ""}`}
              onClick={() => setActiveTab("touristReviews")}
            >
              Tourist Reviews {reviews.length > 0 ? `(${reviews.length})` : ""}
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
                    const userName =
                      reviewerNames[endorsement.userId] ||
                      endorsement.userDisplayName ||
                      "Local Guide";

                    return (
                      <li key={endorsement.id} className="detailsReviewCard">
                        <header className="detailsReviewHeader">
                          <div className="detailsReviewUser">
                            <div className="detailsReviewAvatar">
                              {getInitials(userName)}
                            </div>
                            <div className="detailsReviewAuthorInfo">
                              <span className="detailsReviewAuthor">
                                {userName}
                              </span>
                              {endorsement.createdAt && (
                                <span className="detailsReviewDate">
                                  {formatDate(endorsement.createdAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="detailsReviewRating">
                            {formatRating(score)}
                            <span className="detailsReviewRatingMax">/10</span>
                          </span>
                        </header>

                        <div className="detailsReviewContent">
                          {text && <p className="detailsReviewText">{text}</p>}
                          {endorsement.culturalSensitivity && (
                            <p className="detailsReviewMeta">
                              Cultural note: {endorsement.culturalSensitivity}
                            </p>
                          )}
                        </div>

                        <div className="detailsReplySection">
                          <div className="detailsReplyList">
                            {endorsement.replies?.map((reply) => (
                              <div key={reply.id} className="detailsReplyItem">
                                <div className="detailsReplyAvatar">
                                  {reply.userPhotoURL ? (
                                    <img
                                      src={reply.userPhotoURL}
                                      alt={reply.userDisplayName}
                                      className="detailsReplyAvatarImg"
                                    />
                                  ) : (
                                    getInitials(reply.userDisplayName)
                                  )}
                                </div>
                                <div className="detailsReplyContent">
                                  <div className="detailsReplyHeader">
                                    <span className="detailsReplyAuthor">
                                      {reply.userDisplayName}
                                    </span>
                                    {reply.createdAt && (
                                      <span className="detailsReplyDate">
                                        {formatDate(reply.createdAt)}
                                      </span>
                                    )}
                                  </div>
                                  <p className="detailsReplyText">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {replyingToId === endorsement.id ? (
                            <form
                              onSubmit={(e) =>
                                handleReplySubmit(e, endorsement.id, true)
                              }
                              className="detailsReplyForm"
                            >
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="detailsReplyInput"
                                autoFocus
                              />
                              <button
                                type="submit"
                                disabled={isSubmittingReply}
                                className="detailsReplySubmit"
                              >
                                Send
                              </button>
                              <button
                                type="button"
                                onClick={() => setReplyingToId(null)}
                                className="detailsReplyCancel"
                              >
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <button
                              className="detailsReplyBtn"
                              onClick={() => handleStartReply(endorsement.id)}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                              Reply
                            </button>
                          )}
                        </div>
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
                  travellers.
                </p>
              ) : (
                <ul className="detailsReviewList">
                  {reviews.map((review) => {
                    const text = review.content ?? review.review;
                    const userName =
                      reviewerNames[review.userId] ||
                      review.userDisplayName ||
                      "traveller";
                    const dateToShow = review.visitDate || review.createdAt;

                    return (
                      <li key={review.id} className="detailsReviewCard">
                        <header className="detailsReviewHeader">
                          <div className="detailsReviewUser">
                            <div className="detailsReviewAvatar">
                              {getInitials(userName)}
                            </div>
                            <div className="detailsReviewAuthorInfo">
                              <span className="detailsReviewAuthor">
                                {userName}
                              </span>
                              {dateToShow && (
                                <span className="detailsReviewDate">
                                  Visited {formatDate(dateToShow)}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="detailsReviewRating">
                            {formatRating(review.rating)}
                            <span className="detailsReviewRatingMax">/5</span>
                          </span>
                        </header>

                        <div className="detailsReviewContent">
                          {text && <p className="detailsReviewText">{text}</p>}
                          {typeof review.wouldRecommend === "boolean" && (
                            <p className="detailsReviewMeta">
                              {review.wouldRecommend
                                ? "👍 Would recommend"
                                : "👎 Would not recommend"}
                            </p>
                          )}
                        </div>

                        <div className="detailsReplySection">
                          <div className="detailsReplyList">
                            {review.replies?.map((reply) => (
                              <div key={reply.id} className="detailsReplyItem">
                                <div className="detailsReplyAvatar">
                                  {reply.userPhotoURL ? (
                                    <img
                                      src={reply.userPhotoURL}
                                      alt={reply.userDisplayName}
                                      className="detailsReplyAvatarImg"
                                    />
                                  ) : (
                                    getInitials(reply.userDisplayName)
                                  )}
                                </div>
                                <div className="detailsReplyContent">
                                  <div className="detailsReplyHeader">
                                    <span className="detailsReplyAuthor">
                                      {reply.userDisplayName}
                                    </span>
                                    {reply.createdAt && (
                                      <span className="detailsReplyDate">
                                        {formatDate(reply.createdAt)}
                                      </span>
                                    )}
                                  </div>
                                  <p className="detailsReplyText">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {replyingToId === review.id ? (
                            <form
                              onSubmit={(e) =>
                                handleReplySubmit(e, review.id, false)
                              }
                              className="detailsReplyForm"
                            >
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="detailsReplyInput"
                                autoFocus
                              />
                              <button
                                type="submit"
                                disabled={isSubmittingReply}
                                className="detailsReplySubmit"
                              >
                                Send
                              </button>
                              <button
                                type="button"
                                onClick={() => setReplyingToId(null)}
                                className="detailsReplyCancel"
                              >
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <button
                              className="detailsReplyBtn"
                              onClick={() => handleStartReply(review.id)}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                              Reply
                            </button>
                          )}
                        </div>
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