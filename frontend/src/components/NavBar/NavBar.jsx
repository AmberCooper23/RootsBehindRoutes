import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ContributeModal } from "../ContributeModal/ContributeModal";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import "./NavBar.css";

export function NavBar() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleUserClick = async () => {
    if (!user) {
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Login failed:", error);
      }
    } else {
      navigate("/UserProfile");
    }
  };

  return (
    <>
      <nav className="navBar">
        <section className="navBarContainer">
          <section className="navBarContent">
            <section className="navBarLeft">
              <Link to="/" className="navBarLogo">
                <section className="navBarLogoText" aria-hidden="true">
                  <h1>Roots Behind Routes</h1>
                  <p>Johannesburg, South Africa</p>
                </section>
              </Link>

              <ul className="navBarLinks">
                <li className="navBarLinkItem">
                  <Link to="/" className="navBarLink">
                    Discover
                  </Link>
                </li>
                <li className="navBarLinkItem">
                  <Link to="/Map" className="navBarLink">
                    Map
                  </Link>
                </li>
                <li className="navBarLinkItem">
                  <Link to="/About" className="navBarLink">
                    About
                  </Link>
                </li>
                <li className="navBarLinkItem">
                  <Link to="/Saved" className="navBarLink">
                    Saved
                  </Link>
                </li>
              </ul>
            </section>

            <section className="navBarRight">
              {isSearchExpanded ? (
                <form
                  className="navBarSearch navBarSearchExpanded"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="text"
                    placeholder="Search places..."
                    className="navBarSearchInput"
                    aria-label="Search places"
                    autoFocus
                    onBlur={() => setIsSearchExpanded(false)}
                  />
                  <span className="navBarSearchIcon" aria-hidden="true">
                    🔍︎
                  </span>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className="navBarIconButton"
                  type="button"
                  aria-label="Search places"
                >
                  🔍︎
                </button>
              )}

              <button
                onClick={() => setIsContributeOpen(true)}
                className="contributeButton"
                type="button"
                aria-label="Contribute"
              >
                Contribute
              </button>

              <button
                className="navBarIconButton"
                type="button"
                aria-label="User profile"
                onClick={handleUserClick}
              >
                {user ? "Profile" : "Login"}
              </button>
            </section>
          </section>
        </section>
      </nav>

      <ContributeModal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
      />
    </>
  );
}

export default NavBar;
