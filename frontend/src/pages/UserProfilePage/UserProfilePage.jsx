import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "../../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import {
  fetchUser,
  addUser,
  addUserInterest,
  removeUserInterest,
} from "../../../api/usersApi";
import { fetchAllPlaces } from "../../../api/placesApi";
import { fetchAllActivities } from "../../../api/activitiesApi";
import { fetchAllReviews } from "../../../api/reviewsApi";
import { fetchAllEndorsements } from "../../../api/endorsementsApi";
import { getBookmarks } from "../../../api/bookmarksApi";

import "./UserProfilePage.css";

function formatJoinDate(dateVal) {
  if (!dateVal) return "Unknown";
  if (typeof dateVal === "object" && dateVal._seconds !== undefined) {
    return new Date(dateVal._seconds * 1000).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }
  return new Date(dateVal).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateVal) {
  if (!dateVal) return "";
  if (typeof dateVal === "object" && dateVal._seconds !== undefined) {
    return new Date(dateVal._seconds * 1000).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }
  return new Date(dateVal).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function UserProfile() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState([]);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [visitedExperiences, setVisitedExperiences] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const [stats, setStats] = useState({
    placesVisited: 0,
    savedPlaces: 0,
    contributions: 0,
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      try {
        const profileData = await fetchUser(user.uid);

        setProfile(profileData);
        setBio(profileData?.bio || "");
        setInterests(profileData?.interests || profileData?.Interests || []);

        const [
          allPlaces,
          allActivities,
          allReviews,
          allEndorsements,
          myBookmarks,
        ] = await Promise.all([
          fetchAllPlaces(),
          fetchAllActivities(),
          fetchAllReviews(),
          fetchAllEndorsements(),
          getBookmarks(user.uid),
        ]);

        const myReviews = allReviews.filter((r) => r.userId === user.uid);
        const myEndorsements = allEndorsements.filter(
          (e) => e.userId === user.uid,
        );

        const uniquePlaceIds = new Set([
          ...(profileData?.placesVisited || []),
          ...myReviews.map((r) => r.placeId).filter(Boolean),
          ...myEndorsements.map((e) => e.placeId).filter(Boolean),
        ]);

        const uniqueActivityIds = new Set([
          ...(profileData?.activitiesTried || []),
          ...myReviews.map((r) => r.activityId).filter(Boolean),
          ...myEndorsements.map((e) => e.activityId).filter(Boolean),
        ]);

        const uniqueSavedIds = new Set(
          (Array.isArray(myBookmarks) ? myBookmarks : [])
            .map((b) => b.itemId || b.itemPath || b.placeId)
            .filter(Boolean),
        );

        setStats({
          placesVisited: uniquePlaceIds.size + uniqueActivityIds.size,
          savedPlaces: uniqueSavedIds.size,
          contributions: profileData?.activitiesTried?.length || 0,
        });

        const combinedLogs = [
          ...myReviews.map((r) => ({ ...r, logType: "review" })),
          ...myEndorsements.map((e) => ({ ...e, logType: "endorsement" })),
        ];

        combinedLogs.sort((a, b) => {
          const dateA = new Date(a.visitDate || a.createdAt || 0).getTime();
          const dateB = new Date(b.visitDate || b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        const formattedLogs = combinedLogs
          .map((log) => {
            const isPlace = !!log.placeId;
            const item = isPlace
              ? allPlaces.find((p) => p.id === log.placeId)
              : allActivities.find((a) => a.id === log.activityId);

            if (!item) return null;

            let rating = null;
            let scale = "";

            if (log.logType === "review") {
              rating = log.rating;
              scale = "/5";
            } else if (log.logType === "endorsement") {
              rating = log.score || log.rating;
              scale = "/10";
            }

            return {
              ...item,
              type: isPlace ? "place" : "activity",
              logId: log.id,
              userRating: rating,
              ratingScale: scale,
              userVisitDate: log.visitDate || log.createdAt,
            };
          })
          .filter(Boolean);

        setVisitedExperiences(formattedLogs);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    }

    loadProfile();
  }, [user]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const newUser = result.user;
      await addUser(newUser.uid, {
        name: newUser.displayName,
        email: newUser.email,
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  const saveBio = async (e) => {
    e.preventDefault();
    setIsEditingBio(false);
    try {
      await addUser(user.uid, { bio });
      setProfile((prev) => ({ ...prev, bio }));
    } catch (error) {
      console.error("Failed to save bio:", error);
    }
  };

  const handleAddInterest = async (interestId) => {
    try {
      await addUserInterest(user.uid, interestId);
      setInterests([...interests, interestId]);
    } catch (error) {
      console.error("Failed to add interest:", error);
    }
  };

  const handleRemoveInterest = async (interestId) => {
    try {
      await removeUserInterest(user.uid, interestId);
      setInterests(interests.filter((i) => i !== interestId));
    } catch (error) {
      console.error("Failed to remove interest:", error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExperiences = visitedExperiences.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(visitedExperiences.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  if (!user) {
    return (
      <main className="profilePage">
        <header className="profileHero">
          <section className="profileHeroInner">
            <figure className="profileAvatarWrapper">
              <span className="profileAvatarIcon" aria-hidden="true">
                👤
              </span>
            </figure>

            <section className="profileHeroInfo">
              <h1 className="profileName">Guest User</h1>
              <span className="profileRoleBadge">
                <span className="profileRoleDot" />
                Explorer
              </span>
            </section>
          </section>
        </header>

        <section className="profileLoginPrompt">
          <p>You need to log in to view your profile.</p>
          <button onClick={handleLogin} className="profileActionBtn">
            Login with Google
          </button>
        </section>
      </main>
    );
  }

  const displayPhoto = profile?.photoURL || user.photoURL;
  const displayName =
    profile?.displayName || profile?.name || user.displayName || "Explorer";
  const role = profile?.role || "Explorer";
  const joinDate = formatJoinDate(profile?.joinDate);

  return (
    <main className="profilePage">
      <header className="profileHero">
        <span className="profileHeroPattern" aria-hidden="true" />

        <section className="profileHeroInner">
          <figure className="profileAvatarWrapper">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt="Profile"
                className="profileAvatarImg"
              />
            ) : (
              <span className="profileAvatarIcon" aria-hidden="true">
                👤
              </span>
            )}
          </figure>

          <section className="profileHeroInfo">
            <h1 className="profileName">{displayName}</h1>
            <span className="profileRoleBadge">
              <span className="profileRoleDot" />
              {role.toUpperCase()}
            </span>
          </section>
        </section>
      </header>

      <section className="profileContent">
        <dl className="profileStatsBar">
          <div className="profileStat">
            <dt className="profileStatLabel">Experiences Explored</dt>
            <dd className="profileStatValue">{stats.placesVisited}</dd>
          </div>

          <div className="profileStat">
            <dt className="profileStatLabel">Saved Places</dt>
            <dd className="profileStatValue">{stats.savedPlaces}</dd>
          </div>

          <div className="profileStat">
            <dt className="profileStatLabel">Activities Tried</dt>
            <dd className="profileStatValue">{stats.contributions}</dd>
          </div>
        </dl>

        <section className="profileGrid">
          <aside>
            <article className="profileCard">
              <header className="profileCardHeader">
                <h2 className="profileCardTitle">
                  <button
                    type="button"
                    onClick={() => setIsEditingBio(!isEditingBio)}
                    className="profileEditToggle"
                    aria-label="Edit About Me"
                  >
                    ✎
                  </button>
                  About Me
                </h2>
              </header>

              {isEditingBio ? (
                <form onSubmit={saveBio} className="profileBioForm">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="profileBioEdit"
                    placeholder="Tell people a little about yourself..."
                  />

                  <div className="profileBioActions">
                    <button type="submit" className="profileActionBtn">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingBio(false)}
                      className="profileActionBtn profileActionBtnDanger"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="profileBio">
                  {bio || "Tell people a little about yourself."}
                </p>
              )}

              <p className="profileJoinDate">Member since {joinDate}</p>
            </article>

            <article className="profileCard profileInterestsCard">
              <h2 className="profileCardTitle">Interests</h2>

              <ul className="profileTags">
                {interests.map((interest, idx) => (
                  <li key={idx} className="profileTag">
                    <span>
                      {typeof interest === "string" ? interest : "Interest"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="profileTagRemove"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleAddInterest("New Interest")}
                className="profileActionBtn profileAddInterestBtn"
              >
                Add Interest
              </button>
            </article>

            <nav className="profileNavActions" aria-label="Account actions">
              <Link to="/settings" className="profileActionBtn">
                Account Settings
              </Link>
              <button
                onClick={handleLogout}
                className="profileActionBtn profileActionBtnDanger"
              >
                Sign Out
              </button>
            </nav>
          </aside>

          <article className="profileCard profileVisitedCard">
            <div className="profileVisitedHeader">
              <h2 className="profileCardTitle profileVisitedTitle">
                Places & Activities Visited
              </h2>
              <p className="profileCardSubtitle">
                You have logged {visitedExperiences.length}{" "}
                {visitedExperiences.length === 1 ? "experience" : "experiences"}
              </p>
            </div>

            {visitedExperiences.length > 0 ? (
              <>
                <div className="profileVisitedGrid">
                  {currentExperiences.map((item) => (
                    <div
                      key={`${item.type}-${item.logId}`}
                      className="visitedPlaceCard"
                      onClick={() =>
                        navigate(`/Details/${item.type}/${item.id}`)
                      }
                    >
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                        className="visitedPlaceCardImg"
                      />

                      <div className="visitedPlaceCardOverlay"></div>

                      <div className="visitedPlaceCardContent">
                        <h3 className="visitedPlaceCardTitle">{item.name}</h3>

                        <div className="visitedPlaceCardMeta">
                          <span className="visitedPlaceCardPill">
                            ★{" "}
                            {item.userRating
                              ? `${item.userRating}${item.ratingScale}`
                              : "Not rated"}
                          </span>

                          {item.userVisitDate && (
                            <span className="visitedPlaceCardPill">
                              {formatShortDate(item.userVisitDate)}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        className="visitedPlaceCardArrow"
                        aria-label="View details"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="profilePaginationWrapper">
                    <div className="profilePagination">
                      <button
                        className="profilePaginationBtn"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
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
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <span className="profilePaginationText">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        className="profilePaginationBtn"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="profileEmptyState">
                <span className="profileEmptyIcon">🗺️</span>
                <p>You haven't explored any places or activities yet.</p>
                <button
                  onClick={() => navigate("/")}
                  className="profileActionBtn profileEmptyStateBtn"
                >
                  Start Exploring
                </button>
              </div>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}

export default UserProfile;
