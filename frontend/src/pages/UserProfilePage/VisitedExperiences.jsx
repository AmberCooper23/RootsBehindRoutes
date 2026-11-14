import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function formatShortDate(dateVal) {
  if (!dateVal) return "";
  if (typeof dateVal === "object" && dateVal._seconds !== undefined) {
    return new Date(dateVal._seconds * 1000).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }
  return new Date(dateVal).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function VisitedExperiences({ visitedExperiences }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExperiences = visitedExperiences.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(visitedExperiences.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <article className="profileCard profileVisitedCard">
      <div className="profileVisitedHeader">
        <h2 className="profileCardTitle profileVisitedTitle">
          Places & Activities Visited
        </h2>
        <p className="profileCardSubtitle">
          You have logged {visitedExperiences.length}{" "}
          {visitedExperiences.length === 1 ? "experience" : "experiences"}
        </p>
      </div>

      {visitedExperiences.length > 0 ? (
        <>
          <div className="profileVisitedGrid">
            {currentExperiences.map((item) => (
              <div
                key={`${item.type}-${item.logId}`}
                className="visitedPlaceCard"
                onClick={() => navigate(`/Details/${item.type}/${item.id}`)}
              >
                <img
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  className="visitedPlaceCardImg"
                />

                <div className="visitedPlaceCardOverlay"></div>

                <div className="visitedPlaceCardContent">
                  <h3 className="visitedPlaceCardTitle">{item.name}</h3>

                  <div className="visitedPlaceCardMeta">
                    <span className="visitedPlaceCardPill">
                      ★{" "}
                      {item.userRating
                        ? `${item.userRating}${item.ratingScale}`
                        : "Not rated"}
                    </span>

                    {item.userVisitDate && (
                      <span className="visitedPlaceCardPill">
                        {formatShortDate(item.userVisitDate)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="visitedPlaceCardArrow"
                  aria-label="View details"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="profilePaginationWrapper">
              <div className="profilePagination">
                <button
                  className="profilePaginationBtn"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="profilePaginationText">
                  {currentPage} / {totalPages}
                </span>
                <button
                  className="profilePaginationBtn"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="profileEmptyState">
          <span className="profileEmptyIcon">🗺️</span>
          <p>You haven't explored any places or activities yet.</p>
          <button
            onClick={() => navigate("/")}
            className="profileActionBtn profileEmptyStateBtn"
          >
            Start Exploring
          </button>
        </div>
      )}
    </article>
  );
}
