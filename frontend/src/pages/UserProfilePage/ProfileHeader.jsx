import React from "react";

export default function ProfileHeader({
  displayPhoto,
  displayName,
  role,
  isGuest,
  onUpdatePhoto,
  isUploading,
}) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpdatePhoto(file);
    }
  };

  return (
    <header className="profileHero">
      <span className="profileHeroPattern" aria-hidden="true" />
      <section className="profileHeroInner">
        <label
          className={`profileAvatarWrapper ${!isGuest ? "profileAvatarEditable" : ""}`}
        >
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

          {!isGuest && (
            <div className="profileAvatarOverlay">
              <span>{isUploading ? "Uploading..." : "Change Photo"}</span>
            </div>
          )}

          {!isGuest && (
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="profileAvatarInput"
              disabled={isUploading}
            />
          )}
        </label>

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
