import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { addRecommendation } from "../../../api/recommendationsApi";
import "./RecommendModal.css";

export default function RecommendModal({ isOpen, onClose }) {
  const [user] = useAuthState(auth);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !reason.trim()) return;

    setIsSubmitting(true);
    try {
      await addRecommendation({
        name,
        location,
        reason,
        userId: user?.uid || "anonymous",
        userName: user?.displayName || "Anonymous",
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setName("");
        setLocation("");
        setReason("");
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit recommendation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="recommendOverlay" onClick={onClose}>
      <article className="recommendModal" onClick={(e) => e.stopPropagation()}>
        <header className="recommendHeader">
          <h2 className="recommendTitle">Recommend a Place</h2>
          <button onClick={onClose} className="recommendClose">
            ×
          </button>
        </header>

        {isSuccess ? (
          <div className="recommendSuccess">
            <h3>Thank you!</h3>
            <p>
              Your recommendation has been sent to our admin team. We'll reach
              out to the business owner to get them on board!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="recommendForm">
            <p className="recommendSubtitle">
              Know a spot that deserves to be on Roots Behind Routes? Let us
              know and our team will look into it.
            </p>
            <label className="recommendLabel">
              Name of Place / Activity
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. The Secret Jazz Club"
                required
              />
            </label>
            <label className="recommendLabel">
              Location (Suburb / Area)
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Maboneng, JHB"
                required
              />
            </label>
            <label className="recommendLabel">
              Why should we add it?
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tell us why this place is authentic..."
                rows="3"
                required
              />
            </label>
            <button
              type="submit"
              className="recommendSubmitBtn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Recommendation"}
            </button>
          </form>
        )}
      </article>
    </aside>
  );
}
