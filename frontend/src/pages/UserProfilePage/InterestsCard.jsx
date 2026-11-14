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
      </ul>

      {isAdding ? (
        <div className="profileInterestSelectWrapper">
          <select
            className="profileInterestSelect"
            onChange={handleSelect}
            defaultValue=""
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
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="profileActionBtn profileAddInterestBtn"
          disabled={availableOptions.length === 0}
        >
          {availableOptions.length === 0
            ? "All Interests Added"
            : "Add Interest"}
        </button>
      )}
    </article>
  );
}
