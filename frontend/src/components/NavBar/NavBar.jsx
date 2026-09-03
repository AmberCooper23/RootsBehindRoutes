import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AddPlaceModal } from "../ContributeModal/AddPlaceModal";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { addUser, fetchUser } from "../../../api/usersApi";
import "./NavBar.css";

export function NavBar() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleUserClick = async () => {
    if (!user) {
      try {
        const result = await signInWithPopup(auth, provider);
        const newUser = result.user;
        await addUser(newUser.uid, {
          name: newUser.displayName,
          email: newUser.email,
        });
        await fetchUser(newUser.uid);
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
              <NavLink to="/" className="navBarLogo">
                <section className="navBarLogoText" aria-hidden="true">
                  <h1>Roots Behind Routes</h1>
                  <p>Johannesburg, South Africa</p>
                </section>
              </NavLink>
              <ul className="navBarLinks">
                <li className="navBarLinkItem">
                  <NavLink to="/" className="navBarLink">
                    Discover
                  </NavLink>
                </li>
                {/* <li className="navBarLinkItem">
                  <NavLink to="/Map" className="navBarLink">
                    Map
                  </NavLink>
                </li> */}
                <li className="navBarLinkItem">
                  <NavLink to="/Saved" className="navBarLink">
                    Saved
                  </NavLink>
                </li>
                <li className="navBarLinkItem">
                  <NavLink to="/About" className="navBarLink">
                    About
                  </NavLink>
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
                onClick={() => setIsAddPlaceOpen(true)}
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
      <AddPlaceModal
        isOpen={isAddPlaceOpen}
        onClose={() => setIsAddPlaceOpen(false)}
      />
    </>
  );
}

export default NavBar;
