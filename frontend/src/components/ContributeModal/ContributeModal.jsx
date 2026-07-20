import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import { addEndorsement } from "../../../api/endorsementsApi";
import { addReview } from "../../../api/reviewsApi";
import "./ContributeModal.css";
import { TypeSelector } from "./TypeSelector";
import { LocalContributorForm } from "./LocalContributorForm";
import { TouristReviewForm } from "./TouristReviewForm";

// target: the place/activity being endorsed or reviewed, e.g. { id, type: "place" | "activity", name }
// onSuccess: called after a successful submit so the parent can refetch and show the updated rating
export function ContributeModal({ isOpen, onClose, target, onSuccess }) {
  const [userType, setUserType] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [user] = useAuthState(auth);

  const resetForm = () => setUserType(null);

  const handleClose = () => {
    onClose();
    setTimeout(() => resetForm(), 300);
  };

  const buildTargetRef = () =>
    target?.type === "activity"
      ? { activityId: target.id }
      : { placeId: target?.id };

  const handleSubmit = async (data) => {
    try {
      if (userType === "local") {
        await addEndorsement({
          ...buildTargetRef(),
          rating: data.localRating,
          whyEndorse: data.whyEndorse,
          culturalSensitivity: data.culturalSensitivity,
          createdAt: new Date().toISOString(),
        });
      } else {
        await addReview({
          ...buildTargetRef(),
          rating: data.rating,
          review: data.review,
          visitDate: data.visitDate,
          wouldRecommend: data.wouldRecommend,
          createdAt: new Date().toISOString(),
        });
      }
      onSuccess?.();
      window.dispatchEvent(new CustomEvent("experiences:updated"));
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

  if (!isOpen || !target) return null;

  const renderBody = () => {
    if (isSubmitted) {
      return (
        <section className="contributeModalSuccess">
          <h3 className="contributeModalSuccessTitle">Thank You!</h3>
          <p className="contributeModalSuccessMessage">
            {userType === "local"
              ? "Your endorsement has been submitted and this place's local rating has been updated."
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
        <LocalContributorForm
          targetName={target.name}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      );
    }
    return (
      <TouristReviewForm
        targetName={target.name}
        onSubmit={handleSubmit}
        onCancel={handleClose}
      />
    );
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
            {!userType && `Share Your Voice on ${target.name}`}
            {userType === "local" && `Endorse ${target.name}`}
            {userType === "tourist" && `Review ${target.name}`}
          </h2>
          <p className="contributeModalSubtitle">
            {!userType && "Help others discover authentic experiences"}
            {userType === "local" && "Share why locals value this place"}
            {userType === "tourist" && "Your feedback helps future travelers"}
          </p>
        </header>
        <section className="contributeModalBody">{renderBody()}</section>
      </article>
    </aside>
  );
}

export default ContributeModal;
