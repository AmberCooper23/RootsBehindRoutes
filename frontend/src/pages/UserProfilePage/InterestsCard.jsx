import React from "react";

export default function InterestsCard({
  interests,
  handleRemoveInterest,
  handleAddInterest,
}) {
  return (
    <article className="profileCard profileInterestsCard">
      <h2 className="profileCardTitle">Interests</h2>

      <ul className="profileTags">
        {interests.map((interest, idx) => (
          <li key={idx} className="profileTag">
            <span>{typeof interest === "string" ? interest : "Interest"}</span>
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
  );
}
