import React, { useState } from 'react';
import './LandingPage.css';
import Hero from '../../components/Hero/Hero';
import Filter from '../../components/Filter/Filter';
import LocationCard from '../../components/LocationCard/LocationCard';

export function LandingPage() {
  const [filter, setFilter] = useState({ category: "All", sort: "Most Endorsed" });

  const places = [
    { title: "Origins Centre Museum", location: "Braamfontein, JHB", localRating: 8.5, touristRating: 4.6, category: "Museums",
      image: "https://images.unsplash.com/photo-1621419203897-20b66b98d495?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
    { title: "Neighbourgoods Market", location: "Braamfontein, JHB", localRating: 7.8, touristRating: 4.3, category: "Markets",
      image: "https://images.unsplash.com/photo-1692689383138-c2df3476072c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
    { title: "Rosebank Art Market", location: "Rosebank, JHB", localRating: 6.9, touristRating: 4.0, category: "Markets",
      image: "https://images.unsplash.com/photo-1692689388228-363ffdb7a551?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
    { title: "Traditional Arts Gallery", location: "Newtown, JHB", localRating: 9.2, touristRating: 4.8, category: "Heritage Sites",
      image: "https://images.unsplash.com/photo-1695142258282-99f0ac5db788?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
    { title: "Constitution Hill", location: "Hillbrow, JHB", localRating: 9.5, touristRating: 4.9, category: "Heritage Sites",
      image: "https://images.unsplash.com/photo-1636706519609-988babca3dd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
    { title: "Bruma Flea Market", location: "Bruma, JHB", localRating: 7.2, touristRating: 4.1, category: "Markets",
      image: "https://images.unsplash.com/photo-1630960411440-10f7b59717ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" }
  ];

  const filteredPlaces = places.filter(place =>
    filter.category === "All" || place.category === filter.category
  );

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    switch (filter.sort) {
      case "Highest Rated":
        return b.touristRating - a.touristRating;
      case "Most Endorsed":
        return b.localRating - a.localRating;
      case "Alphabetical":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    <main className='discoverPage'>
      <Hero />
      <Filter filter={filter} setFilter={setFilter} />

      <section className='discoverContainer'>
        <header className='discoverHeader'>
          <span className='discoverHeaderText'>
            <h2 className='discoverHeaderTitle'>Discover Authentic Experiences</h2>
            <p className='discoverSubtitle'>
              Endorsed by locals, experienced by travelers like you
            </p>
          </span>
          <p className='discoverCount'>
            <span className='discoverCountNumber'>{sortedPlaces.length}</span> experiences found
          </p>
        </header>

        <section className="discoverGrid">
          {sortedPlaces.map((place, index) => (
            <LocationCard key={index} {...place} />
          ))}
        </section>

        <aside className='ratingSystem'>
          <h3 className='ratingSystemTitle'>
            Understanding our rating system
          </h3>
          <article className='ratingSystemDivider' aria-hidden="true"></article>
          <p className='ratingSystemDescription'>
            We use a unique dual rating system to give you both local insight and tourist perspective.
          </p>
          
          <section className='ratingSystemGrid'>
            <article className='ratingSystemCategory'>
              <header className='ratingSystemHeader'>
                <section className='ratingSystemIconContainer'>
                <article className='ratingSystemIcon'>10</article>
                </section>
                <h4 className='ratingSystemCategoryTitle'>
                  Local Endorsement (1-10)
                </h4>
              </header>
              <ul className="ratingSystemList">
                <li className="ratingSystemItem"><strong>1-3:</strong> Locals prefer you didn't visit</li>
                <li className="ratingSystemItem"><strong>4-6:</strong> Locals are okay with visitors</li>
                <li className="ratingSystemItem"><strong>7-8:</strong> Locals love this place</li>
                <li className="ratingSystemItem"><strong>9-10:</strong> Locals wish you could experience it</li>
              </ul>
            </article>

            <article className='ratingSystemCategory'>
              <header className='ratingSystemHeader'>
                <section className='ratingSystemIconContainer'>
                <article className='ratingSystemIcon'>★</article>
                </section>
                <h4 className='ratingSystemCategoryTitle'>
                  Tourist Rating (1-5)
                </h4>
              </header>
              <ul className="ratingSystemList">
                <li className="ratingSystemItem"><strong>1-2:</strong> Not recommended</li>
                <li className="ratingSystemItem"><strong>3:</strong> Average experience</li>
                <li className="ratingSystemItem"><strong>4:</strong> Good experience</li>
                <li className="ratingSystemItem"><strong>5:</strong> Excellent, highly recommended</li>
              </ul>
            </article>

          </section>
        </aside>
        
      </section>
    </main>
  );
}

export default LandingPage;
