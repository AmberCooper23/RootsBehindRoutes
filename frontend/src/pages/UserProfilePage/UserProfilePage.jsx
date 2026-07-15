import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";

export function UserProfile() {
  const [user] = useAuthState(auth);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (!user) {
    return (
      <main style={{ padding: "2rem" }}>
        <h2>User Profile</h2>
        <p>You need to log in to view your profile.</p>
        <button onClick={handleLogin}>Login with Google</button>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h2>User Profile</h2>
      <p>Welcome, {user.displayName || "Traveler"}!</p>
      <p>This is a placeholder profile page. More features coming soon.</p>
    </main>
  );
}

export default UserProfile;
