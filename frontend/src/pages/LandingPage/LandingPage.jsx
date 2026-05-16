import React from 'react';
import './LandingPage.css';
import Hero from '../../components/Hero/Hero';
import Filter from '../../components/Filter/Filter';
import LocationCard from '../../components/LocationCard/LocationCard';

export function LandingPage() {

    const places = [
    {
      image: "https://images.unsplash.com/photo-1621419203897-20b66b98d495?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      title: "Origins Centre Museum",
      location: "Braamfontein, JHB",
      localRating: 8.5,
      touristRating: 4.6,
      category: "Museum"
    },
    {
      title: "Neighbourgoods Market",
      location: "Braamfontein, JHB",
      localRating: 7.8,
      touristRating: 4.3,
      category: "Market"
    },
    {
      title: "Rosebank Art Market",
      location: "Rosebank, JHB",
      localRating: 6.9,
      touristRating: 4.0,
      category: "Market"
    },
    {
      title: "Traditional Arts Gallery",
      location: "Newtown, JHB",
      localRating: 9.2,
      touristRating: 4.8,
      category: "Heritage Site"
    },
    {
      title: "Constitution Hill",
      location: "Hillbrow, JHB",
      localRating: 9.5,
      touristRating: 4.9,
      category: "Heritage Site"
    },
    {
      title: "Bruma Flea Market",
      location: "Bruma, JHB",
      localRating: 7.2,
      touristRating: 4.1,
      category: "Market"
    }
  ];

    return (
        <main className='discoverPage'>
            <Hero />
            <Filter />

            <section className='discoverContainer'>
              <header className='discoverHeader'>
                <span className='discoverHeaderText'>
                  <h2 className='discoverHeaderTitle'>
                  Discover Authentic Experiences
                </h2>
                <p className='discoverSubtitle'>
                  Endorsed by locals, experienced by travelers like you
                </p>
                </span>
                
                <p className='discoverCount'>
                  <span className='discoverCountNumber'>6</span> experiences found
                </p>
              </header>

        <section className="discoverGrid">
          {places.map((place, index) => (
            <LocationCard
              key={index}
              {...place}
              onClick={() => setIsModalOpen(true)}
            />
          ))}
        </section>
            </section>

        </main>
    );
}

export default LandingPage;