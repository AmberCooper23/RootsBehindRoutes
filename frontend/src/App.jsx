import { Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar/NavBar";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { UserProfile } from "./pages/UserProfilePage/UserProfilePage";
import { BookmarksPage } from "./pages/BookmarksPage/BookmarksPage";
import AboutPage from "./pages/AboutPage/AboutPage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

function App() {
  const [user] = useAuthState(auth);

  return (
    <>
      <NavBar user={user} />
      <Routes>
        <Route path="/" element={<LandingPage user={user} />} />
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/About" element={<AboutPage />} />
        <Route path="/Bookmarks" element={<BookmarksPage />} />
      </Routes>
    </>
  );
}

export default App;
