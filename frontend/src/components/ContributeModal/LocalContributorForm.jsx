import { useState } from "react";

const INITIAL_FORM_DATA = {
  whyEndorse: "",
  localRating: 5,
  culturalSensitivity: "",
};

export function LocalContributorForm({ targetName, onSubmit, onCancel }) {
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
          As a local contributor, your voice shapes how visitors experience{" "}
          {targetName}. Please only endorse this place if you genuinely welcome
          respectful visitors and feel the culture is represented authentically.
        </p>
      </aside>
      <form onSubmit={handleSubmit} className="contributeModalForm">
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
            Submit Endorsement
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
