import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { addUser, fetchUser } from "../../../api/usersApi";

import "./AboutPage.css";

export function AboutPage() {
  const [user] = useAuthState(auth);

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
    <main className="aboutPage">
      <header className="aboutHero">
        <section className="aboutHeroInner">
          <b className="aboutHeroStamp">Our Story</b>
          <h1 className="aboutHeroTitle">
            Bridging Cultures,
            <i className="aboutHeroTitleItalic">Preserving Heritage</i>
          </h1>
          <p className="aboutHeroTagline">
            Roots Behind Routes was born from a simple belief: that travel
            should honour and celebrate local culture, not exploit it.
          </p>
        </section>
      </header>

      <section className="aboutBody">
        <section className="aboutProblemSection">
          <section>
            <h2 className="aboutProblemHeading">The Problem We Solve</h2>
            <hr className="aboutProblemDivider" />
            <section className="aboutProblemTextBlock">
              <p className="aboutProblemText">
                Traditional travel platforms prioritise tourist attractions over
                authentic cultural experiences. They fail to capture the voice
                of local communities, often leading to overtourism and the
                commodification of sacred or sensitive cultural sites.
              </p>
              <p className="aboutProblemText">
                We believe that locals should have a say in how their culture is
                shared. Their endorsement isn't just a rating, it's a measure of
                cultural respect and authenticity.
              </p>
            </section>
          </section>

          <figure className="aboutProblemImageWrapper">
            <img
              src="https://images.unsplash.com/photo-1605302596032-15e67c3cf66a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
              alt="Local community gathering in Johannesburg"
              className="aboutProblemImage"
            />
          </figure>
        </section>

        <section aria-label="Our values">
          <ul className="aboutValuesGrid">
            <li className="aboutValueCard">
              <h3 className="aboutValueTitle">Respect</h3>
              <p className="aboutValueDescription">
                We prioritise cultural sensitivity and local voices in every
                recommendation
              </p>
            </li>

            <li className="aboutValueCard">
              <h3 className="aboutValueTitle">Community</h3>
              <p className="aboutValueDescription">
                Our platform is built on the wisdom and guidance of local
                residents
              </p>
            </li>

            <li className="aboutValueCard">
              <h3 className="aboutValueTitle">Authenticity</h3>
              <p className="aboutValueDescription">
                Every place is vetted for genuine cultural value, not just
                tourist appeal
              </p>
            </li>

            <li className="aboutValueCard">
              <h3 className="aboutValueTitle">Protection</h3>
              <p className="aboutValueDescription">
                We help preserve cultural heritage by promoting responsible and
                ethical tourism
              </p>
            </li>
          </ul>
        </section>

        <section className="aboutHowItWorksSection">
          <h2 className="aboutHowItWorksHeading">How It Works</h2>
          <hr className="aboutHowItWorksDivider" />

          <ol className="aboutStepsGrid">
            <li className="aboutStep">
              <b className="aboutStepNumber">1</b>
              <h3 className="aboutStepTitle">Local Endorsement</h3>
              <p className="aboutStepDescription">
                Residents rate places on a 1–10 scale, indicating whether they
                welcome visitors and feel the site is represented authentically
              </p>
            </li>

            <li className="aboutStep">
              <b className="aboutStepNumber">2</b>
              <h3 className="aboutStepTitle">Tourist Experience</h3>
              <p className="aboutStepDescription">
                Visitors rate their experience on a traditional 5-star scale,
                providing practical feedback on accessibility and quality
              </p>
            </li>

            <li className="aboutStep">
              <b className="aboutStepNumber">3</b>
              <h3 className="aboutStepTitle">Informed Choice</h3>
              <p className="aboutStepDescription">
                Both ratings together help you make respectful, informed
                decisions about where to visit and how to engage with local
                culture
              </p>
            </li>
          </ol>
        </section>

        <aside className="aboutCtaBanner">
          <h2 className="aboutCtaTitle">Join Our Movement</h2>
          <hr className="aboutCtaDivider" />
          <p className="aboutCtaTagline">
            Whether you're a local who wants to share your culture responsibly,
            or a traveler seeking authentic experiences, we invite you to be
            part of this journey.
          </p>

          <nav className="aboutCtaButtons">
            {!user ? (
              <button className="aboutCtaPrimaryButton" onClick={handleLogin}>
                Become a Contributor
              </button>
            ) : (
              <button
                className="aboutCtaSecondaryButton"
                onClick={scrollToDiscover}
              >
                Continue Contributing
              </button>
            )}
          </nav>
        </aside>
      </section>
    </main>
  );
}

export default AboutPage;
