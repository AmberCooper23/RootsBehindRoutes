import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { addUser, fetchUser } from "../../../api/usersApi";
import { fetchStats } from "../../../api/statsApi";
import "./Hero.css";
import HeroImage from "../../assets/RedTaxiImage.jpg";

export function Hero() {
  const [user] = useAuthState(auth);
  const [stats, setStats] = useState({ places: 0, voices: 0, travelers: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    loadStats();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await addUser(user.uid, { name: user.displayName, email: user.email });
      await fetchUser(user.uid);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const scrollToDiscover = () => {
    const section = document.getElementById("discoverContainer");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero">
      <section className="heroGrid">
        <section className="heroContainer">
          <article className="heroBadge">Est. 2026</article>
          <h1 className="heroTitle">Journey Beyond the Tourist Trails</h1>
          <p className="heroSubtitle">
            Discover Johannesburg's cultural tapestry through the eyes of her
            people.
          </p>
          <section className="ctaButtonContainer">
            {!user ? (
              <button className="ctaButtonSolid" onClick={handleLogin}>
                Start Exploring
              </button>
            ) : (
              <button className="ctaButtonSolid" onClick={scrollToDiscover}>
                Continue Exploring
              </button>
            )}
            <button className="ctaButtonOutline">Our Story</button>
          </section>
          <dl className="heroStats">
            <article>
              <dt className="heroStatValue">{stats.places}</dt>
              <dd className="heroStatLabel">Authentic Places</dd>
            </article>
            <article>
              <dt className="heroStatValue">{stats.voices}</dt>
              <dd className="heroStatLabel">Local Voices</dd>
            </article>
            <article>
              <dt className="heroStatValue">{stats.travellers}</dt>
              <dd className="heroStatLabel">Happy Travelers</dd>
            </article>
          </dl>
        </section>
        <figure className="heroImageContainer">
          <article className="heroImageBorder"></article>
          <img
            className="heroImage"
            src={HeroImage}
            alt="Johannesburg Street Scene"
          />
          <blockquote className="QuoteContainer">
            <section className="QuoteContent">
              <p className="QuoteText">
                Culture is an experience, not a commodity.
              </p>
              <cite className="QuoteAuthor">Amber Cooper</cite>
            </section>
          </blockquote>
        </figure>
      </section>
    </section>
  );
}

export default Hero;
