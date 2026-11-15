import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AddPlaceModal } from "../ContributeModal/AddPlaceModal";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { addUser, fetchUser } from "../../../api/usersApi";
import "./NavBar.css";

export function NavBar() {
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    async function checkRole() {
      if (!user) {
        setUserRole(null);
        setLoadingRole(false);
        return;
      }
      try {
        const profile = await fetchUser(user.uid);
        setUserRole(profile?.role || "tourist");
      } catch (err) {
        console.error("Failed to fetch user role:", err);
        setUserRole("tourist");
      } finally {
        setLoadingRole(false);
      }
    }
    checkRole();
  }, [user]);

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

  const isManager = userRole === "manager";

  return (
    <>
      <nav className="navBar">
        <section className="navBarContainer">
          <section className="navBarContent">
            <section className="navBarLeft">
              <NavLink
                to={isManager ? "/Dashboard" : "/"}
                className="navBarLogo"
              >
                <section className="navBarLogoText" aria-hidden="true">
                  <h1>Roots Behind Routes</h1>
                  <p>Johannesburg, South Africa</p>
                </section>
              </NavLink>
              <ul className="navBarLinks">
                <li className="navBarLinkItem">
                  <NavLink
                    to={isManager ? "/Dashboard" : "/"}
                    className="navBarLink"
                  >
                    {isManager ? "Dashboard" : "Discover"}
                  </NavLink>
                </li>

                {user && !isManager && (
                  <li className="navBarLinkItem">
                    <NavLink to="/Bookmarks" className="navBarLink">
                      Saved
                    </NavLink>
                  </li>
                )}

                <li className="navBarLinkItem">
                  <NavLink to="/About" className="navBarLink">
                    About
                  </NavLink>
                </li>
              </ul>
            </section>
            <section className="navBarRight">
              {!isManager && (
                <button
                  onClick={() => setIsAddPlaceOpen(true)}
                  className="contributeButton"
                  type="button"
                  aria-label="Contribute"
                >
                  Contribute
                </button>
              )}

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

      {!isManager && (
        <AddPlaceModal
          isOpen={isAddPlaceOpen}
          onClose={() => setIsAddPlaceOpen(false)}
        />
      )}
    </>
  );
}

export default NavBar;
