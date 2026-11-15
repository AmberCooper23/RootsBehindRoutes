import { Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar/NavBar";
import { ScrollToTop } from "./components/ScrollToTop/ScrollToTop";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { UserProfile } from "./pages/UserProfilePage/UserProfilePage";
import { BookmarksPage } from "./pages/BookmarksPage/BookmarksPage";
import AboutPage from "./pages/AboutPage/AboutPage";
import { DetailsPage } from "./pages/DetailsPage/DetailsPage";
import { ManagerDashboardPage } from "./pages/ManagerDashboardPage/ManagerDashboardPage";
import { MapPage } from "./pages/MapPage/MapPage";
import { ProfileSetupPage } from "./pages/ProfileSetupPage/ProfileSetupPage";
import AdminDashboardPage from "./pages/AdminDashboardPage/AdminDashboardPage";
import RequireAdmin from "./components/Admin/RequireAdmin";
import { AdminProvider } from "./context/AdminContext";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

function App() {
  const [user] = useAuthState(auth);

  return (
    <AdminProvider>
      <ScrollToTop />
      <NavBar user={user} />
      <Routes>
        <Route path="/" element={<LandingPage user={user} />} />
        <Route path="/ProfileSetup" element={<ProfileSetupPage />} />
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/UserProfile/:uid" element={<UserProfile />} />
        <Route path="/About" element={<AboutPage />} />
        <Route path="/Bookmarks" element={<BookmarksPage />} />
        <Route path="/Details/:type/:id" element={<DetailsPage />} />
        <Route path="/Dashboard" element={<ManagerDashboardPage />} />
        <Route path="/Map" element={<MapPage />} />
        <Route
          path="/Admin"
          element={
            <RequireAdmin>
              <AdminDashboardPage />
            </RequireAdmin>
          }
        />
      </Routes>
    </AdminProvider>
  );
}

export default App;
