import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { addUser, fetchUser } from "../../../api/usersApi";
import RecommendModal from "../RecommendModal/RecommendModal";
import "./NavBar.css";

export function NavBar() {
  const [isRecommendOpen, setIsRecommendOpen] = useState(false);
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
        setUserRole(profile?.role || null);
      } catch (err) {
        console.error("Failed to fetch user role:", err);
        setUserRole(null);
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
        const profile = await fetchUser(newUser.uid);

        if (!profile?.role) {
          navigate("/ProfileSetup");
        } else if (profile.role === "admin") {
          navigate("/Admin");
        } else if (profile.role === "manager") {
          navigate("/Dashboard");
        } else {
          navigate("/UserProfile");
        }
      } catch (error) {
        console.error("Login failed:", error);
      }
    } else {
      if (!userRole) {
        navigate("/ProfileSetup");
      } else if (userRole === "admin") {
        navigate("/Admin");
      } else if (userRole === "manager") {
        navigate("/Dashboard");
      } else {
        navigate("/UserProfile");
      }
    }
  };

  const isManager = userRole === "manager";
  const isAdmin = userRole === "admin";

  const profileLabel = loadingRole
    ? "Profile"
    : isAdmin
      ? "Dashboard"
      : user
        ? "Profile"
        : "Login";

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
                {!isManager && !isAdmin && (
                  <li className="navBarLinkItem">
                    <NavLink to="/" className="navBarLink">
                      Discover
                    </NavLink>
                  </li>
                )}

                {isManager && (
                  <li className="navBarLinkItem">
                    <NavLink to="/Dashboard" className="navBarLink">
                      Dashboard
                    </NavLink>
                  </li>
                )}

                {isAdmin && (
                  <>
                    <li className="navBarLinkItem">
                      <NavLink to="/" className="navBarLink">
                        Discover
                      </NavLink>
                    </li>
                    <li className="navBarLinkItem">
                      <NavLink to="/Admin" className="navBarLink">
                        Dashboard
                      </NavLink>
                    </li>
                  </>
                )}

                {!isManager && !isAdmin && (
                  <li className="navBarLinkItem">
                    <NavLink to="/Map" className="navBarLink">
                      Map
                    </NavLink>
                  </li>
                )}

                {user && !isManager && !isAdmin && (
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
              {!isManager && !isAdmin && (
                <button
                  onClick={() => setIsRecommendOpen(true)}
                  className="contributeButton"
                  type="button"
                  aria-label="Recommend a place"
                >
                  Recommend
                </button>
              )}

              <button
                className="navBarIconButton"
                type="button"
                aria-label={isAdmin ? "Admin dashboard" : "User profile"}
                onClick={handleUserClick}
              >
                {profileLabel}
              </button>
            </section>
          </section>
        </section>
      </nav>

      <RecommendModal
        isOpen={isRecommendOpen}
        onClose={() => setIsRecommendOpen(false)}
      />
    </>
  );
}

export default NavBar;
