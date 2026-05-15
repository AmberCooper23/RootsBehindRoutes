interface LocationCardProps {
    image: String;
    title: String;
    location: String;
    localRating: number;
    touristRating: number;
    category: String;
    onClick?: () => void;
}

export function LocationCard({ image, title, location, localRating, touristRating, category, onClick }: LocationCardProps) {
    
    return (
        <section className="locationCard" onClick={onClick} role="button" tabIndex={0}>
            <figure className="locationCardImage">
                 <article className="locationCardCategory">{category}</article>
            </figure>
            
            <section className="locationCardContent">
                <h3 className="locationCardTitle">{title}</h3>
                <address className="locationCardSubtitle">{location}</address>

                <dl className="locationCardRatings">
                    <dt className="locationCardRating">
                        Local Voices
                    </dt>
                    <dd className="locationCardRatingValue">
                        <span className="locationCardRatingNumber">{localRating}</span>
                        <span className="locationCardRatingMax">/10</span>
                    </dd>
            </dl>
            </section>
        </section>
    );
}

export default LocationCard;