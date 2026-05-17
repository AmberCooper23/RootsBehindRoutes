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
      </section>
    </main>
  );
}

export default LandingPage;
