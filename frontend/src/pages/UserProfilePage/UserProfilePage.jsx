import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "../../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import "./UserProfilePage.css";

export function UserProfile() {
  const [user] = useAuthState(auth);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState(
    "Passionate about discovering the hidden stories and cultural richness of Johannesburg. Always looking for authentic local experiences and community connections.",
  );
  const [interests] = useState([
    "Local History",
    "Street Food",
    "Art & Culture",
    "Community Events",
  ]);

  const handleLogin = async () => {
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const saveBio = () => {
    setIsEditingBio(false);
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

  return (
    <main className="profilePage">
      <header className="profileHero">
        <span className="profileHeroPattern" aria-hidden="true" />
        <section className="profileHeroInner">
          <figure className="profileAvatarWrapper">
            {user.photoURL ? (
              <img
                src={user.photoURL}
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
            <h1 className="profileName">{user.displayName || "Explorer"}</h1>
            <span className="profileRoleBadge">
              <span className="profileRoleDot" />
              Explorer
            </span>
          </section>
        </section>
      </header>

      <section className="profileContent">
        <dl className="profileStatsBar">
          <div className="profileStat">
            <dt className="profileStatLabel">Places Visited</dt>
            <dd className="profileStatValue">12</dd>
          </div>
          <div className="profileStat">
            <dt className="profileStatLabel">Saved Places</dt>
            <dd className="profileStatValue">8</dd>
          </div>
          <div className="profileStat">
            <dt className="profileStatLabel">Contributions</dt>
            <dd className="profileStatValue">3</dd>
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
                <form>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
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
                      onClick={() => setIsEditingBio(false)}
                      className="profileActionBtn profileActionBtnDanger"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="profileBio">{bio}</p>
              )}
              <p className="profileJoinDate">Member since March 2024</p>
            </article>

            <article className="profileCard" style={{ marginTop: "1.25rem" }}>
              <h2 className="profileCardTitle">Interests</h2>
              <ul className="profileTags">
                {interests.map((interest, idx) => (
                  <li key={idx} className="profileTag">
                    {interest}
                  </li>
                ))}
              </ul>
            </article>

            <nav className="profileActions" aria-label="Account actions">
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

          <article className="profileCard">
            <h2 className="profileCardTitle">Recent Activity</h2>
            <ul className="profileActivityList">
              <li className="profileActivityItem">
                <span className="profileActivityDot" aria-hidden="true" />
                <p className="profileActivityText">
                  Reviewed <strong>Wits Art Museum</strong> — rated 4 stars
                </p>
                <p className="profileActivityMeta">2 days ago · Braamfontein</p>
              </li>
              <li className="profileActivityItem">
                <span className="profileActivityDot" aria-hidden="true" />
                <p className="profileActivityText">
                  Saved <strong>Neighbourgoods Market</strong> to your list
                </p>
                <p className="profileActivityMeta">5 days ago · Braamfontein</p>
              </li>
              <li className="profileActivityItem">
                <span className="profileActivityDot" aria-hidden="true" />
                <p className="profileActivityText">
                  Submitted <strong>Maboneng Precinct Walk</strong> for local
                  review
                </p>
                <p className="profileActivityMeta">1 week ago · Maboneng</p>
              </li>
              <li className="profileActivityItem">
                <span className="profileActivityDot" aria-hidden="true" />
                <p className="profileActivityText">
                  Endorsed <strong>The Cosmopolitan</strong> — local score 9/10
                </p>
                <p className="profileActivityMeta">2 weeks ago · Newtown</p>
              </li>
              <li className="profileActivityItem">
                <span className="profileActivityDot" aria-hidden="true" />
                <p className="profileActivityText">
                  Visited <strong>Constitution Hill</strong>
                </p>
                <p className="profileActivityMeta">3 weeks ago · Hillbrow</p>
              </li>
            </ul>
          </article>
        </section>
      </section>
    </main>
  );
}

export default UserProfile;
