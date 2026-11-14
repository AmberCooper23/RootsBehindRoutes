import React, { useState } from "react";

export default function InterestsCard({
  interests,
  allInterests,
  handleRemoveInterest,
  handleAddInterest,
}) {
  const [isAdding, setIsAdding] = useState(false);

  const availableOptions = allInterests.filter(
    (dbInterest) => !interests.includes(dbInterest.id),
  );

  const getInterestName = (id) => {
    const match = allInterests.find((dbInterest) => dbInterest.id === id);
    return match ? match.name : id;
  };

  const handleSelect = (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      handleAddInterest(selectedId);
      setIsAdding(false);
    }
  };

  return (
    <article className="profileCard profileInterestsCard">
      <h2 className="profileCardTitle">Interests</h2>

      <ul className="profileTags">
        {interests.map((interestId, idx) => (
          <li key={idx} className="profileTag">
            <span>{getInterestName(interestId)}</span>
            <button
              type="button"
              onClick={() => handleRemoveInterest(interestId)}
              className="profileTagRemove"
            >
              ×
            </button>
          </li>
        ))}

        {!isAdding && availableOptions.length > 0 && (
          <li>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="profileAddInterestIconBtn"
              aria-label="Add Interest"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </li>
        )}
      </ul>

      {isAdding && (
        <div className="profileInterestSelectWrapper">
          <select
            className="profileInterestSelect"
            onChange={handleSelect}
            defaultValue=""
            autoFocus
          >
            <option value="" disabled>
              Select an interest...
            </option>
            {availableOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="profileActionBtn profileActionBtnDanger profileInterestCancel"
          >
            Cancel
          </button>
        </div>
      )}
    </article>
  );
}
