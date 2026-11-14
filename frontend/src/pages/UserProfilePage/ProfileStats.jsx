import React from "react";

export default function ProfileStats({ stats }) {
  return (
    <dl className="profileStatsBar">
      <div className="profileStat">
        <dt className="profileStatLabel">Experiences Explored</dt>
        <dd className="profileStatValue">{stats.placesVisited}</dd>
      </div>

      <div className="profileStat">
        <dt className="profileStatLabel">Saved Places</dt>
        <dd className="profileStatValue">{stats.savedPlaces}</dd>
      </div>

      <div className="profileStat">
        <dt className="profileStatLabel">Activities Tried</dt>
        <dd className="profileStatValue">{stats.contributions}</dd>
      </div>
    </dl>
  );
}
