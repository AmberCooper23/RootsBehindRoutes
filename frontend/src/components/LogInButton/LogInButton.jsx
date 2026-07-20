import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";
import { addUser, fetchUser } from "./api/usersApi";

function LoginButton() {
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

  return <button onClick={handleLogin}>Sign in with Google</button>;
}

export default LoginButton;
