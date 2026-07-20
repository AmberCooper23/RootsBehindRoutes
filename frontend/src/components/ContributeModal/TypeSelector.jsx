import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";

export function TypeSelector({ onSelectType }) {
  const [user] = useAuthState(auth);

  const handleSelect = async (role) => {
    if (!user) {
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Login failed:", error);
        return;
      }
    }
    onSelectType(role);
  };

  return (
    <section className="contributeModalTypeSelector">
      <h3 className="contributeModalTypeTitle">
        Are you a local or a tourist?
      </h3>
      <p className="contributeModalTypeDescription">
        Your perspective matters. Choose your role to contribute in the way that
        best represents your experience.
      </p>
      <nav className="contributeModalTypeGrid">
        <button
          onClick={() => handleSelect("local")}
          className="contributeModalTypeButton"
          type="button"
        >
          <figure className="contributeModalTypeButtonIconWrapper" />
          <h4 className="contributeModalTypeButtonTitle">Local</h4>
          <p className="contributeModalTypeButtonDescription">
            Share places from your community that you believe travelers should
            experience with respect and understanding.
          </p>
          <section className="contributeModalTypeButtonInfo">
            <p className="contributeModalTypeButtonInfoTitle">
              You'll provide:
            </p>
            <ul className="contributeModalTypeButtonList">
              <li className="contributeModalTypeButtonListItem">
                Place details & location
              </li>
              <li className="contributeModalTypeButtonListItem">
                Cultural context
              </li>
              <li className="contributeModalTypeButtonListItem">
                Local endorsement (1-10)
              </li>
              <li className="contributeModalTypeButtonListItem">
                Sensitivity guidelines
              </li>
            </ul>
          </section>
        </button>
        <button
          onClick={() => handleSelect("tourist")}
          className="contributeModalTypeButton contributeModalTypeButtonTourist"
          type="button"
        >
          <figure className="contributeModalTypeButtonIconWrapper contributeModalTypeButtonIconWrapperTourist" />
          <h4 className="contributeModalTypeButtonTitle">Tourist</h4>
          <p className="contributeModalTypeButtonDescription">
            Share your experience visiting places in Johannesburg to help other
            travelers make informed decisions.
          </p>
          <section className="contributeModalTypeButtonInfo contributeModalTypeButtonInfoTourist">
            <p className="contributeModalTypeButtonInfoTitle">
              You'll provide:
            </p>
            <ul className="contributeModalTypeButtonList">
              <li className="contributeModalTypeButtonListItem">
                5-star rating
              </li>
              <li className="contributeModalTypeButtonListItem">
                Detailed review
              </li>
              <li className="contributeModalTypeButtonListItem">Visit date</li>
              <li className="contributeModalTypeButtonListItem">
                Recommendation level
              </li>
            </ul>
          </section>
        </button>
      </nav>
    </section>
  );
}

export default TypeSelector;
