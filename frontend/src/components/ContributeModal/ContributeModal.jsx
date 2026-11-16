import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import { fetchUser } from "../../../api/usersApi";
import { addEndorsement } from "../../../api/endorsementsApi";
import { addReview } from "../../../api/reviewsApi";
import "./ContributeModal.css";
import { LocalContributorForm } from "./LocalContributorForm";
import { TouristReviewForm } from "./TouristReviewForm";

export function ContributeModal({ isOpen, onClose, target, onSuccess }) {
  const [userType, setUserType] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [user, authLoading] = useAuthState(auth);
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    async function determineRole() {
      if (!isOpen || !user) {
        setUserType(null);
        return;
      }

      setIsLoadingRole(true);
      try {
        const profile = await fetchUser(user.uid);
        setUserType(profile?.role === "local" ? "local" : "tourist");
      } catch (error) {
        console.error("Failed to fetch user role:", error);
        setUserType("tourist");
      } finally {
        setIsLoadingRole(false);
      }
    }

    determineRole();
  }, [isOpen, user]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSubmitted(false);
      setUserType(null);
      setSubmitError(null);
    }, 300);
  };

  const buildTargetRef = () =>
    target?.type === "activity"
      ? { activityId: target.id }
      : { placeId: target?.id };

  const handleSubmit = async (data) => {
    setSubmitError(null);
    try {
      if (userType === "local") {
        await addEndorsement({
          userId: user.uid,
          ...buildTargetRef(),
          rating: data.localRating,
          whyEndorse: data.whyEndorse,
          culturalSensitivity: data.culturalSensitivity,
          visitDate: data.visitDate,
          createdAt: new Date().toISOString(),
        });
      } else {
        await addReview({
          userId: user.uid,
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
      }, 2000);
    } catch (error) {
      console.error("Submission failed:", error);
      setSubmitError(
        error.message || "Something went wrong. Please try again.",
      );
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
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
              : "Your review has been submitted and will help future travellers make informed decisions."}
          </p>
        </section>
      );
    }

    if (!user) {
      return (
        <section className="contributeModalSuccess">
          <h3 className="contributeModalSuccessTitle">Sign In Required</h3>
          <p className="contributeModalSuccessMessage">
            You need to be logged in to contribute your voice.
          </p>
          <button onClick={handleLogin} className="contributeModalSubmit">
            Login with Google
          </button>
        </section>
      );
    }

    if (isLoadingRole || authLoading) {
      return (
        <section className="contributeModalSuccess">
          <p className="contributeModalSuccessMessage">
            Loading your profile...
          </p>
        </section>
      );
    }

    if (userType === "local") {
      return (
        <LocalContributorForm
          targetName={target.name}
          onSubmit={handleSubmit}
          onCancel={handleClose}
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
    <aside className="contributeModalOverlay" onClick={handleClose}>
      <article className="contributeModal" onClick={(e) => e.stopPropagation()}>
        <header className="contributeModalHeader">
          <button
            onClick={handleClose}
            className="contributeModalClose"
            type="button"
            aria-label="Close modal"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <h2 className="contributeModalTitle">
            {!user
              ? "Contribute"
              : userType === "local"
                ? `Endorse ${target.name}`
                : `Review ${target.name}`}
          </h2>
          <p className="contributeModalSubtitle">
            {!user
              ? "Sign in to share your experience"
              : userType === "local"
                ? "Share why locals value this place"
                : "Your feedback helps future travellers"}
          </p>
        </header>
        <section className="contributeModalBody">
          {submitError && (
            <div className="contributeModalErrorBanner">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{submitError}</span>
            </div>
          )}
          {renderBody()}
        </section>
      </article>
    </aside>
  );
}

export default ContributeModal;
