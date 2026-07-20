import { useState } from "react";
import { Star } from "lucide-react";

const RATING_LABELS = {
  0: "Click to rate your experience",
  1: "Poor - Major issues",
  2: "Below Average - Disappointing",
  3: "Average - Met basic expectations",
  4: "Good - Enjoyable experience",
  5: "Excellent - Highly recommend",
};

const INITIAL_FORM_DATA = {
  rating: 0,
  hoveredRating: 0,
  review: "",
  visitDate: "",
  wouldRecommend: "",
};

export function TouristReviewForm({ targetName, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      <aside className="contributeModalAlert contributeModalAlertTourist">
        <h3 className="contributeModalAlertTitle">Reviewing {targetName}</h3>
        <p className="contributeModalAlertDescription">
          Share your honest experience to help other travelers. Your feedback on
          accessibility, facilities, and overall experience is valuable.
        </p>
      </aside>
      <form onSubmit={handleSubmit} className="contributeModalForm">
        <fieldset className="contributeModalFormGroup">
          <label className="contributeModalLabel">Your Rating *</label>
          <section className="contributeModalStarRating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                onMouseEnter={() =>
                  setFormData({ ...formData, hoveredRating: star })
                }
                onMouseLeave={() =>
                  setFormData({ ...formData, hoveredRating: 0 })
                }
                className="contributeModalStarButton"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  size={35}
                  stroke="#8B7355"
                  fill={
                    formData.hoveredRating >= star || formData.rating >= star
                      ? "#D4A574"
                      : "none"
                  }
                />
              </button>
            ))}
          </section>
          <p className="contributeModalStarDescription">
            {RATING_LABELS[formData.rating]}
          </p>
        </fieldset>
        <fieldset className="contributeModalFormGroup">
          <label htmlFor="visitDate" className="contributeModalLabel">
            When Did You Visit? *
          </label>
          <input
            id="visitDate"
            type="month"
            value={formData.visitDate}
            onChange={(e) =>
              setFormData({ ...formData, visitDate: e.target.value })
            }
            required
            className="contributeModalInput"
          />
        </fieldset>
        <fieldset className="contributeModalFormGroup">
          <label htmlFor="review" className="contributeModalLabel">
            Tell Us About Your Experience *
          </label>
          <textarea
            id="review"
            value={formData.review}
            onChange={(e) =>
              setFormData({ ...formData, review: e.target.value })
            }
            placeholder="Share details about your visit, what you enjoyed, and any tips for future visitors..."
            rows={6}
            required
            className="contributeModalTextarea"
          />
          <p className="contributeModalTextareaHint">
            Minimum 50 characters. Be specific and helpful to other travelers.
          </p>
        </fieldset>
        <fieldset className="contributeModalFormGroup">
          <legend className="contributeModalLabel">
            Would You Recommend This Place? *
          </legend>
          <section className="contributeModalRadioGroup">
            <label className="contributeModalRadioLabel">
              <input
                type="radio"
                name="recommend"
                value="yes"
                checked={formData.wouldRecommend === "yes"}
                onChange={(e) =>
                  setFormData({ ...formData, wouldRecommend: e.target.value })
                }
                className="contributeModalRadio"
              />
              <section className="contributeModalRadioTextWrapper">
                <p className="contributeModalRadioTitle">
                  Yes, I'd recommend it
                </p>
                <p className="contributeModalRadioDescription">
                  Worth visiting for most travelers
                </p>
              </section>
            </label>
            <label className="contributeModalRadioLabel">
              <input
                type="radio"
                name="recommend"
                value="maybe"
                checked={formData.wouldRecommend === "maybe"}
                onChange={(e) =>
                  setFormData({ ...formData, wouldRecommend: e.target.value })
                }
                className="contributeModalRadio"
              />
              <section className="contributeModalRadioTextWrapper">
                <p className="contributeModalRadioTitle">
                  Maybe, depends on preferences
                </p>
                <p className="contributeModalRadioDescription">
                  Good for specific types of travelers
                </p>
              </section>
            </label>
            <label className="contributeModalRadioLabel">
              <input
                type="radio"
                name="recommend"
                value="no"
                checked={formData.wouldRecommend === "no"}
                onChange={(e) =>
                  setFormData({ ...formData, wouldRecommend: e.target.value })
                }
                className="contributeModalRadio"
              />
              <section className="contributeModalRadioTextWrapper">
                <p className="contributeModalRadioTitle">
                  No, I wouldn't recommend it
                </p>
                <p className="contributeModalRadioDescription">
                  Did not meet expectations
                </p>
              </section>
            </label>
          </section>
        </fieldset>
        <footer className="contributeModalActions">
          <button
            type="submit"
            disabled={formData.rating === 0}
            className="contributeModalSubmit"
          >
            Submit Review
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="contributeModalCancel"
          >
            Cancel
          </button>
        </footer>
      </form>
      <p className="contributeModalFooterNote">
        * Required fields. Please be respectful and constructive in your
        feedback.
      </p>
    </>
  );
}

export default TouristReviewForm;
