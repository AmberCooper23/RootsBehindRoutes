import React from "react";

export default function ProfileHeader({
  displayPhoto,
  displayName,
  role,
  isOwner,
  isManager,
  onUpdatePhoto,
  isUploading,
  isEditingName,
  setIsEditingName,
  tempName,
  setTempName,
  onNameSave,
  showFollowButton,
  isFollowing,
  onToggleFollow,
  followLoading,
  followersCount,
  followingCount,
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
          className={`profileAvatarWrapper ${isOwner ? "profileAvatarEditable" : ""}`}
        >
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

          {isOwner && (
            <div className="profileAvatarOverlay">
              <span>{isUploading ? "Uploading..." : "Change Photo"}</span>
            </div>
          )}

          {isOwner && (
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
          {isEditingName && isOwner ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onNameSave();
              }}
              className="profileNameEditForm"
            >
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="profileNameInput"
                autoFocus
              />
              <button type="submit" className="profileNameSaveBtn">
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="profileNameCancelBtn"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="profileNameWrapper">
              <h1 className="profileName">{displayName}</h1>
              {isOwner && (
                <button
                  className="profileNameEditBtn"
                  onClick={() => {
                    setTempName(displayName);
                    setIsEditingName(true);
                  }}
                  aria-label="Edit display name"
                >
                  ✎
                </button>
              )}
            </div>
          )}

          <span className="profileRoleBadge">
            <span className="profileRoleDot" />
            {role.toUpperCase()}
          </span>

          {!isManager && (
            <span className="profileFollowStats">
              <strong>{followersCount}</strong> Followers
              <span className="profileFollowStatsDot">·</span>
              <strong>{followingCount}</strong> Following
            </span>
          )}
        </section>

        {showFollowButton && (
          <button
            className={`followBtn ${isFollowing ? "following" : ""}`}
            onClick={onToggleFollow}
            disabled={followLoading}
          >
            {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </section>
    </header>
  );
}
