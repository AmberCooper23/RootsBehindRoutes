import "./LocationCard.css";

export function LocationCard({
  image,
  name,
  location,
  localRating,
  touristRating,
  categoryLabels,
  onClick,
}) {
  console.log("🃏 Rendering LocationCard:", {
    image,
    name,
    location,
    localRating,
    touristRating,
    categoryLabels,
  });

  const formatCategoryLabel = (label) =>
    label
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const categoryLabel = Array.isArray(categoryLabels)
    ? categoryLabels.map(formatCategoryLabel).join(", ")
    : categoryLabels
      ? formatCategoryLabel(categoryLabels)
      : "";

  const locationLabel =
    typeof location === "string"
      ? location
      : location?.city && location?.region
        ? `${location.city}, ${location.region}`
        : location?.latitude && location?.longitude
          ? `${location.latitude}, ${location.longitude}`
          : "";

  return (
    <section
      className="locationCard"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <figure className="locationCardImageWrapper">
        <img
          src={image || "/placeholder.png"}
          alt={name || "Unknown place"}
          className="locationCardImage"
        />
        <article className="locationCardCategory">{categoryLabel}</article>
      </figure>
      <section className="locationCardContent">
        <h3 className="locationCardTitle">{name || "Unnamed Place"}</h3>
        <address className="locationCardSubtitle">{locationLabel}</address>
        <dl className="locationCardRatings">
          <section className="locationCardRatingsContainer">
            <dt className="locationCardRating">Local Voices</dt>
            <dd className="locationCardRatingValue">
              <span className="locationCardRatingNumber">
                {localRating ?? "?"}
              </span>
              <span className="locationCardRatingMax">/10</span>
            </dd>
          </section>
          <section className="locationCardRatingsContainer">
            <dt className="locationCardRating">Tourist Rating</dt>
            <dd className="locationCardRatingValue">
              <span className="locationCardRatingNumber">
                {touristRating ?? "?"}
              </span>
              <span className="locationCardRatingMax">/5</span>
            </dd>
          </section>
        </dl>
      </section>
      <article className="locationCardAccent" aria-hidden="true" />
    </section>
  );
}

export default LocationCard;
