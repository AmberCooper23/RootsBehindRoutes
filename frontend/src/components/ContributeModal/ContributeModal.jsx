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
    }, 300);
  };

  const buildTargetRef = () =>
    target?.type === "activity"
      ? { activityId: target.id }
      : { placeId: target?.id };

  const handleSubmit = async (data) => {
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
              : "Your review has been submitted and will help future travelers make informed decisions."}
          </p>
        </section>
      );
    }

    if (!user) {
      return (
        <section
          className="contributeModalSuccess"
          style={{ textAlign: "center", padding: "2rem 1rem" }}
        >
          <h3 className="contributeModalSuccessTitle">Sign In Required</h3>
          <p
            className="contributeModalSuccessMessage"
            style={{ marginBottom: "1.5rem" }}
          >
            You need to be logged in to contribute your voice.
          </p>
          <button
            onClick={handleLogin}
            className="contributeModalSubmit"
            style={{ maxWidth: "250px", margin: "0 auto" }}
          >
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
                : "Your feedback helps future travelers"}
          </p>
        </header>
        <section className="contributeModalBody">{renderBody()}</section>
      </article>
    </aside>
  );
}

export default ContributeModal;
