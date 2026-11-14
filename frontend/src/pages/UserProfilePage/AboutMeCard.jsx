import React from "react";

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

export default function AboutMeCard({
  bio,
  setBio,
  isEditingBio,
  setIsEditingBio,
  saveBio,
  joinDate,
}) {
  return (
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

      <p className="profileJoinDate">Member since {formatJoinDate(joinDate)}</p>
    </article>
  );
}
