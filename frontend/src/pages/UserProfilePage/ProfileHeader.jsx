import React from "react";

export default function ProfileHeader({
  displayPhoto,
  displayName,
  role,
  isGuest,
}) {
  return (
    <header className="profileHero">
      <span className="profileHeroPattern" aria-hidden="true" />
      <section className="profileHeroInner">
        <figure className="profileAvatarWrapper">
          {displayPhoto && !isGuest ? (
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
          <h1 className="profileName">
            {isGuest ? "Guest User" : displayName}
          </h1>
          <span className="profileRoleBadge">
            <span className="profileRoleDot" />
            {isGuest ? "Explorer" : role.toUpperCase()}
          </span>
        </section>
      </section>
    </header>
  );
}
