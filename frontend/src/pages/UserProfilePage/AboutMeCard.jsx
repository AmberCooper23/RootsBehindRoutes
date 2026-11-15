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
  age,
  setAge,
  birthday,
  setBirthday,
  area,
  setArea,
  isEditingBio,
  setIsEditingBio,
  saveBio,
  joinDate,
  isOwner,
}) {
  return (
    <article className="profileCard">
      <header className="profileCardHeader">
        <h2 className="profileCardTitle">
          {isOwner && (
            <button
              type="button"
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="profileEditToggle"
              aria-label="Edit About Me"
            >
              ✎
            </button>
          )}
          About Me
        </h2>
      </header>

      {isEditingBio && isOwner ? (
        <form onSubmit={saveBio} className="profileBioForm">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="profileBioEdit"
            placeholder="Tell people a little about yourself..."
          />

          <div className="profileAboutGrid">
            <div className="profileAboutItem">
              <label className="profileAboutLabel">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="profileAboutInput"
                placeholder="e.g. 25"
              />
            </div>
            <div className="profileAboutItem">
              <label className="profileAboutLabel">Birthday</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="profileAboutInput"
              />
            </div>
            <div className="profileAboutItem">
              <label className="profileAboutLabel">Area</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="profileAboutInput"
                placeholder="e.g. Johannesburg"
              />
            </div>
          </div>

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
        <>
          <p className="profileBio">
            {bio || "Tell people a little about yourself."}
          </p>

          <div className="profileAboutGrid">
            <div className="profileAboutItem">
              <span className="profileAboutLabel">Age</span>
              <span className="profileAboutValue">{age || "-"}</span>
            </div>
            <div className="profileAboutItem">
              <span className="profileAboutLabel">Birthday</span>
              <span className="profileAboutValue">{birthday || "-"}</span>
            </div>
            <div className="profileAboutItem">
              <span className="profileAboutLabel">Area</span>
              <span className="profileAboutValue">{area || "-"}</span>
            </div>
          </div>
        </>
      )}

      <p className="profileJoinDate">Member since {formatJoinDate(joinDate)}</p>
    </article>
  );
}
