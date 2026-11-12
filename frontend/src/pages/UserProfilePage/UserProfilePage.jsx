import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "../../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import {
  fetchUser,
  addUser,
  addUserInterest,
  removeUserInterest,
} from "../../../api/usersApi";

import "./UserProfilePage.css";

export function UserProfile() {
  const [user] = useAuthState(auth);

  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState([]);
  const [isEditingBio, setIsEditingBio] = useState(false);

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

        setInterests(
          profileData?.interests ||
            profileData?.Interests ||
            []
        );

        setStats({
          placesVisited:
            profileData?.placesVisited?.length || 0,

          savedPlaces:
            profileData?.bookmarks?.length || 0,

          contributions:
            profileData?.activitiesTried?.length || 0,
        });
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );
      }
    }

    loadProfile();
  }, [user]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(
        auth,
        provider
      );

      const newUser = result.user;

      await addUser(newUser.uid, {
        name: newUser.displayName,
        email: newUser.email,
      });
    } catch (error) {
      console.error(
        "Login failed:",
        error
      );
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  const saveBio = () => {
    setIsEditingBio(false);

    // Add your update API call here later
  };

  const handleAddInterest = async (
    interestId
  ) => {
    try {
      await addUserInterest(
        user.uid,
        interestId
      );

      setInterests([
        ...interests,
        interestId,
      ]);
    } catch (error) {
      console.error(
        "Failed to add interest:",
        error
      );
    }
  };

  const handleRemoveInterest = async (
    interestId
  ) => {
    try {
      await removeUserInterest(
        user.uid,
        interestId
      );

      setInterests(
        interests.filter(
          (i) => i !== interestId
        )
      );
    } catch (error) {
      console.error(
        "Failed to remove interest:",
        error
      );
    }
  };

  if (!user) {
    return (
      <main className="profilePage">
        <header className="profileHero">
          <section className="profileHeroInner">
            <figure className="profileAvatarWrapper">
              <span
                className="profileAvatarIcon"
                aria-hidden="true"
              >
                👤
              </span>
            </figure>

            <section className="profileHeroInfo">
              <h1 className="profileName">
                Guest User
              </h1>

              <span className="profileRoleBadge">
                <span className="profileRoleDot" />
                Explorer
              </span>
            </section>
          </section>
        </header>

        <section className="profileLoginPrompt">
          <p>
            You need to log in to view
            your profile.
          </p>

          <button
            onClick={handleLogin}
            className="profileActionBtn"
          >
            Login with Google
          </button>
        </section>
      </main>
    );
  }

  const displayPhoto =
    profile?.photoURL || user.photoURL;

  const displayName =
    profile?.displayName ||
    profile?.name ||
    user.displayName ||
    "Explorer";

  const role =
    profile?.role || "Explorer";

  const joinDate = profile?.joinDate
    ? profile.joinDate
        .toDate()
        .toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
    : "Unknown";

  return (
    <main className="profilePage">
      <header className="profileHero">
        <span
          className="profileHeroPattern"
          aria-hidden="true"
        />

        <section className="profileHeroInner">
          <figure className="profileAvatarWrapper">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt="Profile"
                className="profileAvatarImg"
              />
            ) : (
              <span
                className="profileAvatarIcon"
                aria-hidden="true"
              >
                👤
              </span>
            )}
          </figure>

          <section className="profileHeroInfo">
            <h1 className="profileName">
              {displayName}
            </h1>

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
            <dt className="profileStatLabel">
              Places Visited
            </dt>

            <dd className="profileStatValue">
              {stats.placesVisited}
            </dd>
          </div>

          <div className="profileStat">
            <dt className="profileStatLabel">
              Saved Places
            </dt>

            <dd className="profileStatValue">
              {stats.savedPlaces}
            </dd>
          </div>

          <div className="profileStat">
            <dt className="profileStatLabel">
              Activities Tried
            </dt>

            <dd className="profileStatValue">
              {stats.contributions}
            </dd>
          </div>
        </dl>

        <section className="profileGrid">
          <aside>
            <article className="profileCard">
              <header className="profileCardHeader">
                <h2 className="profileCardTitle">
                  <button
                    type="button"
                    onClick={() =>
                      setIsEditingBio(
                        !isEditingBio
                      )
                    }
                    className="profileEditToggle"
                    aria-label="Edit About Me"
                  >
                    ✎
                  </button>
                  About Me
                </h2>
              </header>

              {isEditingBio ? (
                <form>
                  <textarea
                    value={bio}
                    onChange={(e) =>
                      setBio(
                        e.target.value
                      )
                    }
                    className="profileBioEdit"
                  />

                  <div className="profileActions">
                    <button
                      type="button"
                      onClick={saveBio}
                      className="profileActionBtn"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setIsEditingBio(
                          false
                        )
                      }
                      className="profileActionBtn profileActionBtnDanger"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="profileBio">
                  {bio ||
                    "Tell people a little about yourself."}
                </p>
              )}

              <p className="profileJoinDate">
                Member since {joinDate}
              </p>
            </article>

            <article
              className="profileCard"
              style={{
                marginTop: "1.25rem",
              }}
            >
              <h2 className="profileCardTitle">
                Interests
              </h2>

              <ul className="profileTags">
                {interests.map(
                  (interest, idx) => (
                    <li
                      key={idx}
                      className="profileTag"
                    >
                      {typeof interest ===
                      "string"
                        ? interest
                        : "Interest"}

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveInterest(
                            interest
                          )
                        }
                        className="profileTagRemove"
                      >
                        ×
                      </button>
                    </li>
                  )
                )}
              </ul>

              <button
                type="button"
                onClick={() =>
                  handleAddInterest(
                    "New Interest"
                  )
                }
                className="profileActionBtn"
              >
                Add Interest
              </button>
            </article>

            <nav
              className="profileActions"
              aria-label="Account actions"
            >
              <Link
                to="/settings"
                className="profileActionBtn"
              >
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

          <article className="profileCard">
            <h2 className="profileCardTitle">
              Profile Summary
            </h2>

            <div
              style={{
                display: "grid",
                gap: "1rem",
              }}
            >
              <p>
                <strong>Name:</strong>{" "}
                {displayName}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {profile?.email ||
                  user.email}
              </p>

              <p>
                <strong>Role:</strong>{" "}
                {role}
              </p>

              <p>
                <strong>
                  Places Visited:
                </strong>{" "}
                {stats.placesVisited}
              </p>

              <p>
                <strong>
                  Activities Tried:
                </strong>{" "}
                {stats.contributions}
              </p>

              <p>
                <strong>
                  Interests:
                </strong>{" "}
                {interests.length}
              </p>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

export default UserProfile;