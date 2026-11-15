import { useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { fetchAllInterests } from "../../../api/interestsApi";
import "./NewModal.css";

const INITIAL_FORM_DATA = {
  placeName: "",
  address: "",
  city: "",
  region: "",
  interest: "",
  description: "",
  whyEndorse: "",
  localRating: 5,
  culturalSensitivity: "",
};

export function NewPlaceForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [interests, setInterests] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    async function loadInterests() {
      try {
        const data = await fetchAllInterests();
        setInterests(data);
      } catch (error) {
        console.error("Failed to load interests:", error);
      }
    }
    loadInterests();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoaded) {
      alert("Google Maps is still loading. Please try again.");
      return;
    }

    setIsGeocoding(true);

    const addressQuery = `${formData.address}, ${formData.city}, ${formData.region}, South Africa`;
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: addressQuery }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;

        const finalData = {
          ...formData,
          latitude: location.lat(),
          longitude: location.lng(),
        };

        onSubmit(finalData);
      } else {
        console.error(
          "Geocode was not successful for the following reason: " + status,
        );
        alert(
          "Could not find the coordinates for this address. Please check the street address, city, and region.",
        );
        setIsGeocoding(false);
      }
    });
  };

  return (
    <>
      <aside className="contributeModalAlert">
        <h3 className="contributeModalAlertTitle">Before You Submit</h3>
        <p className="contributeModalAlertDescription">
          As a local contributor, your voice shapes how visitors experience our
          culture. Please only add places where you genuinely welcome respectful
          visitors and feel the culture is represented authentically.
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
          <label htmlFor="address" className="contributeModalLabel">
            Street Address *
          </label>
          <input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="e.g., 1 Jan Smuts Ave"
            className="contributeModalInput"
            required
          />
        </fieldset>

        <fieldset className="contributeModalFormGroup">
          <label htmlFor="city" className="contributeModalLabel">
            City *
          </label>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="e.g., Braamfontein"
            className="contributeModalInput"
            required
          />
        </fieldset>

        <fieldset className="contributeModalFormGroup">
          <label htmlFor="region" className="contributeModalLabel">
            Region *
          </label>
          <input
            id="region"
            type="text"
            value={formData.region}
            onChange={(e) =>
              setFormData({ ...formData, region: e.target.value })
            }
            placeholder="e.g., Johannesburg"
            className="contributeModalInput"
            required
          />
        </fieldset>

        <fieldset className="contributeModalFormGroup">
          <label htmlFor="interest" className="contributeModalLabel">
            Interest *
          </label>
          <section className="contributeModalInputWrapper">
            <select
              id="interest"
              value={formData.interest}
              onChange={(e) =>
                setFormData({ ...formData, interest: e.target.value })
              }
              className="contributeModalSelect contributeModalInputWithIcon"
              required
            >
              <option value="">Select an interest</option>
              {interests.map((interest) => (
                <option key={interest.id} value={interest.id}>
                  {interest.name}
                </option>
              ))}
            </select>
          </section>
        </fieldset>

        <fieldset className="contributeModalFormGroup">
          <label htmlFor="description" className="contributeModalLabel">
            Description *
          </label>
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
            placeholder="Are there any cultural protocols, dress codes, or respectful behaviors visitors should know?"
            rows={3}
            className="contributeModalTextarea"
          />
        </fieldset>

        <footer className="contributeModalActions">
          <button
            type="submit"
            className="contributeModalSubmit"
            disabled={isGeocoding}
          >
            {isGeocoding ? "Locating..." : "Submit Place"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="contributeModalCancel"
            disabled={isGeocoding}
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

export default NewPlaceForm;
