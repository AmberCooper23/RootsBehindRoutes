import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";

function LoginButton() {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Logged in:", user.displayName, user.email);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return <button onClick={handleLogin}>Sign in with Google</button>;
}

export default LoginButton;
