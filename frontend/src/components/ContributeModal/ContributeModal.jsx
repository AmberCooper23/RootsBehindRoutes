import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import { addPlace } from "../../../api/placesApi";
import { addReview } from "../../../api/reviewsApi";
import "./ContributeModal.css";
import { TypeSelector } from "./TypeSelector";
import { LocalContributorForm } from "./LocalContributorForm";
import { TouristReviewForm } from "./TouristReviewForm";

export function ContributeModal({ isOpen, onClose }) {
  const [userType, setUserType] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [user] = useAuthState(auth);

  const resetForm = () => setUserType(null);

  const handleClose = () => {
    onClose();
    setTimeout(() => resetForm(), 300);
  };

  const handleSubmit = async (data) => {
    try {
      if (userType === "local") {
        await addPlace(data);
      } else {
        await addReview(data);
      }
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
        resetForm();
      }, 2000);
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  const handleSelectType = async (role) => {
    if (!user) {
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Login failed:", error);
        return;
      }
    }
    setUserType(role);
  };

  if (!isOpen) return null;

  const renderBody = () => {
    if (isSubmitted) {
      return (
        <section className="contributeModalSuccess">
          <h3 className="contributeModalSuccessTitle">Thank You!</h3>
          <p className="contributeModalSuccessMessage">
            {userType === "local"
              ? "Your contribution has been submitted for review. We'll notify you once it's published."
              : "Your review has been submitted and will help future travelers make informed decisions."}
          </p>
        </section>
      );
    }
    if (!userType) {
      return <TypeSelector onSelectType={handleSelectType} />;
    }
    if (userType === "local") {
      return (
        <LocalContributorForm onSubmit={handleSubmit} onCancel={onClose} />
      );
    }
    return <TouristReviewForm onSubmit={handleSubmit} onCancel={handleClose} />;
  };

  return (
    <aside className="contributeModalOverlay">
      <article className="contributeModal">
        <header
          className={`contributeModalHeader ${
            userType === "tourist" ? "contributeModalHeaderTourist" : ""
          }`}
        >
          <button
            onClick={handleClose}
            className="contributeModalClose"
            type="button"
            aria-label="Close modal"
          >
            X
          </button>
          {userType && (
            <button
              onClick={() => setUserType(null)}
              className="contributeModalBack"
              type="button"
            >
              ← Back
            </button>
          )}
          <h2 className="contributeModalTitle">
            {!userType && "Share Your Voice"}
            {userType === "local" && "Contribute a Place"}
            {userType === "tourist" && "Share Your Experience"}
          </h2>
          <p className="contributeModalSubtitle">
            {!userType && "Help others discover authentic experiences"}
            {userType === "local" &&
              "Share your local knowledge with travelers"}
            {userType === "tourist" && "Your feedback helps future travelers"}
          </p>
        </header>
        <section className="contributeModalBody">{renderBody()}</section>
      </article>
    </aside>
  );
}

export default ContributeModal;
