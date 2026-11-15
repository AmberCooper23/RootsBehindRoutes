import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { addUser, fetchUser } from "../../../api/usersApi";
import { fetchStats } from "../../../api/statsApi";
import "./Hero.css";
import HeroImage from "../../assets/RedTaxiImage.jpg";

export function Hero() {
  const [user] = useAuthState(auth);
  const [stats, setStats] = useState({
    experiences: 0,
    voices: 0,
    travellers: 0,
  });
  const navigate = useNavigate();

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
      const newUser = result.user;
      await addUser(newUser.uid, {
        name: newUser.displayName,
        email: newUser.email,
      });

      const profile = await fetchUser(newUser.uid);
      if (!profile?.role) {
        navigate("/ProfileSetup");
      } else {
        const section = document.getElementById("discoverContainer");
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }
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
            <button
              className="ctaButtonOutline"
              onClick={() => navigate("/About")}
            >
              Our Story
            </button>
          </section>
          <dl className="heroStats">
            <article>
              <dt className="heroStatValue">{stats.experiences ?? 0}</dt>
              <dd className="heroStatLabel">Authentic Experiences</dd>
            </article>
            <article>
              <dt className="heroStatValue">{stats.voices ?? 0}</dt>
              <dd className="heroStatLabel">Local Voices</dd>
            </article>
            <article>
              <dt className="heroStatValue">{stats.travellers ?? 0}</dt>
              <dd className="heroStatLabel">Happy Travellers</dd>
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
