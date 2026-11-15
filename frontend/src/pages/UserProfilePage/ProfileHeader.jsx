import React from "react";

export default function ProfileHeader({
  displayPhoto,
  displayName,
  role,
  isGuest,
  onUpdatePhoto,
  isUploading,
  isEditingName,
  setIsEditingName,
  tempName,
  setTempName,
  onNameSave,
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
          {isEditingName ? (
            <form 
              onSubmit={(e) => { e.preventDefault(); onNameSave(); }} 
              className="profileNameEditForm"
            >
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="profileNameInput"
                autoFocus
              />
              <button type="submit" className="profileNameSaveBtn">Save</button>
              <button type="button" onClick={() => setIsEditingName(false)} className="profileNameCancelBtn">Cancel</button>
            </form>
          ) : (
            <div className="profileNameWrapper">
              <h1 className="profileName">
                {isGuest ? "Guest User" : displayName}
              </h1>
              {!isGuest && (
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
            {isGuest ? "Explorer" : role.toUpperCase()}
          </span>
        </section>
      </section>
    </header>
  );
}