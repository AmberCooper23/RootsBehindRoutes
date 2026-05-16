import "./LocationCard.css";

export function LocationCard({ 
  image, 
  title, 
  location, 
  localRating, 
  touristRating, 
  category, 
  onClick 
}) {
  return (
    <section 
      className="locationCard" 
      onClick={onClick} 
      role="button" 
      tabIndex={0}
    >
      <figure className="locationCardImage">
        <img src={image} alt={title} />
        <article className="locationCardCategory">{category}</article>
      </figure>

      <section className="locationCardContent">
        <h3 className="locationCardTitle">{title}</h3>
        <address className="locationCardSubtitle">{location}</address>

        <dl className="locationCardRatings">
          <dt className="locationCardRating">Local Voices</dt>
          <dd className="locationCardRatingValue">
            <span className="locationCardRatingNumber">{localRating}</span>
            <span className="locationCardRatingMax">/10</span>
          </dd>

          <dt className="locationCardRating">Tourist Rating</dt>
          <dd className="locationCardRatingValue">
            <span className="locationCardRatingNumber">{touristRating}</span>
            <span className="locationCardRatingMax">/5</span>
          </dd>
        </dl>
      </section>
      <article className="locationCardAccent" aria-hidden="true" />
    </section>
  );
}

export default LocationCard;
