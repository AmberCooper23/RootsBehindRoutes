import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import { addPlace } from "../../../api/placesApi";
import { NewPlaceForm } from "./NewPlaceForm";
import "./ContributeModal.css";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400?text=Photo+Coming+Soon";

export function AddPlaceModal({ isOpen, onClose, onSuccess }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [user] = useAuthState(auth);

  const handleSubmit = async (data) => {
    try {
      let currentUser = user;

      if (!currentUser) {
        try {
          const result = await signInWithPopup(auth, provider);
          currentUser = result.user;
        } catch (error) {
          console.error("Login failed:", error);
          return;
        }
      }

      await addPlace({
        name: data.placeName,
        location: {
          city: data.city,
          region: data.region,
        },
        interests: [data.interest],
        description: data.description,
        whyEndorse: data.whyEndorse,
        culturalSensitivity: data.culturalSensitivity || "",
        localRating: data.localRating,
        touristRating: 0,
        reviewCount: 0,
        endorsementCount: 1,
        image: PLACEHOLDER_IMAGE,
        contributorId: currentUser.uid,
        contributorName: currentUser.displayName || "Anonymous",
        createdAt: new Date().toISOString(),
      });

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

  if (!isOpen) return null;

  return (
    <aside className="contributeModalOverlay" onClick={onClose}>
      <article className="contributeModal" onClick={(e) => e.stopPropagation()}>
        <header className="contributeModalHeader">
          <button
            onClick={onClose}
            className="contributeModalClose"
            type="button"
            aria-label="Close modal"
          >
            X
          </button>

          <h2 className="contributeModalTitle">Add a New Place</h2>

          <p className="contributeModalSubtitle">
            Help others discover authentic experiences
          </p>
        </header>

        <section className="contributeModalBody">
          {isSubmitted ? (
            <section className="contributeModalSuccess">
              <h3 className="contributeModalSuccessTitle">Thank You!</h3>
              <p className="contributeModalSuccessMessage">
                Your place has been submitted and is now live on the site.
              </p>
            </section>
          ) : (
            <NewPlaceForm onSubmit={handleSubmit} onCancel={onClose} />
          )}
        </section>
      </article>
    </aside>
  );
}

export default AddPlaceModal;
