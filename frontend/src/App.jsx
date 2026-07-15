import { Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar/NavBar";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { UserProfile } from "./pages/UserProfilePage/UserProfilePage";
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
      </Routes>
    </>
  );
}

export default App;
