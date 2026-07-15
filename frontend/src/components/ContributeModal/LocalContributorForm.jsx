import { useState } from "react";

const INITIAL_FORM_DATA = {
  placeName: "",
  location: "",
  category: "",
  description: "",
  whyEndorse: "",
  localRating: 5,
  culturalSensitivity: "",
};

export function LocalContributorForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      <aside className="contributeModalAlert">
        <h3 className="contributeModalAlertTitle">Before You Submit</h3>
        <p className="contributeModalAlertDescription">
          As a local contributor, your voice shapes how visitors experience our
          culture. Please only recommend places where you genuinely welcome
          respectful visitors and feel the culture is represented authentically.
        </p>
      </aside>

      <form onSubmit={handleSubmit} className="contributeModalForm">
        <fieldset className="contributeModalFormGroup">
          <label htmlFor="placeName" className="contributeModalLabel">
            Place Name *
          </label>
          <input
            id="placeName"
            type="text"
            value={formData.placeName}
            onChange={(e) =>
              setFormData({ ...formData, placeName: e.target.value })
            }
            placeholder="e.g., Origins Centre Museum"
            className="contributeModalInput"
            required
          />
        </fieldset>

        <fieldset className="contributeModalFormGroup">
          <label htmlFor="location" className="contributeModalLabel">
            Location *
          </label>
          <section className="contributeModalInputWrapper">
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g., Braamfontein, Johannesburg"
              className="contributeModalInput contributeModalInputWithIcon"
              required
            />
          </section>
        </fieldset>

        <fieldset className="contributeModalFormGroup">
          <label htmlFor="category" className="contributeModalLabel">
            Category *
          </label>
          <section className="contributeModalInputWrapper">
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="contributeModalSelect contributeModalInputWithIcon"
              required
            >
              <option value="">Select a category</option>
              <option value="museum">Museum</option>
              <option value="heritage">Heritage Site</option>
              <option value="market">Market</option>
              <option value="restaurant">Restaurant</option>
              <option value="cultural-center">Cultural Center</option>
              <option value="gallery">Gallery</option>
            </select>
          </section>
        </fieldset>

        <fieldset className="contributeModalFormGroup">
          <label htmlFor="description" className="contributeModalLabel">
            Description *
          </label>
          <section className="contributeModalInputWrapper">
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe this place and what makes it special..."
              rows={4}
              className="contributeModalTextarea contributeModalInputWithIcon"
              required
            />
          </section>
        </fieldset>

        <fieldset className="contributeModalFormGroup">
          <label htmlFor="whyEndorse" className="contributeModalLabel">
            Why Do You Endorse This Place? *
          </label>
          <textarea
            id="whyEndorse"
            value={formData.whyEndorse}
            onChange={(e) =>
              setFormData({ ...formData, whyEndorse: e.target.value })
            }
            placeholder="Explain why you believe visitors should experience this place and how it represents our culture authentically..."
            rows={4}
            className="contributeModalTextarea"
            required
          />
        </fieldset>

        <fieldset className="contributeModalFormGroup">
          <label htmlFor="localRating" className="contributeModalLabel">
            Your Local Endorsement (1-10) *
          </label>
          <section className="contributeModalRangeWrapper">
            <input
              id="localRating"
              type="range"
              min="1"
              max="10"
              value={formData.localRating}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  localRating: parseInt(e.target.value),
                })
              }
              className="contributeModalRange"
              style={{
                background: `linear-gradient(to right, #8B7355 0%, #8B7355 ${(formData.localRating - 1) * 11.11}%, #E8DCC8 ${(formData.localRating - 1) * 11.11}%, #E8DCC8 100%)`,
              }}
            />
            <section className="contributeModalRangeLabels">
              <span className="contributeModalRangeLabelLeft">
                Prefer visitors didn't come
              </span>
              <output className="contributeModalRangeValue">
                {formData.localRating}/10
              </output>
              <span className="contributeModalRangeLabelRight">
                Wish they could experience it
              </span>
            </section>
          </section>
        </fieldset>

        <fieldset className="contributeModalFormGroup">
          <label htmlFor="culturalSensitivity" className="contributeModalLabel">
            Cultural Sensitivity Notes
          </label>
          <textarea
            id="culturalSensitivity"
            value={formData.culturalSensitivity}
            onChange={(e) =>
              setFormData({ ...formData, culturalSensitivity: e.target.value })
            }
            placeholder="Are there any cultural protocols, dress codes, or respectful behaviors visitors should know? (Optional)"
            rows={3}
            className="contributeModalTextarea"
          />
        </fieldset>

        <footer className="contributeModalActions">
          <button type="submit" className="contributeModalSubmit">
            Submit Contribution
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
        * Required fields. All contributions are reviewed to ensure quality and
        cultural respect.
      </p>
    </>
  );
}

export default LocalContributorForm;
