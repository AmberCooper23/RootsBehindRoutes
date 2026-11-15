import { useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { fetchAllInterests } from "../../../api/interestsApi";
import "./NewModal.css";

const INITIAL_FORM_DATA = {
  placeName: "",
  address: "",
  suburb: "",
  city: "",
  interest: "",
  description: "",
  whyEndorse: "",
  localRating: 5,
  culturalSensitivity: "",
  duration: "",
};

export function NewPlaceForm({
  initialData,
  defaultType = "place",
  onSubmit,
  onCancel,
}) {
  const [formType, setFormType] = useState(() => {
    if (initialData) {
      return initialData.duration ? "activity" : "place";
    }
    return defaultType;
  });

  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        placeName: initialData.name || "",
        address: initialData.location?.address || "",
        suburb: initialData.location?.suburb || "",
        city: initialData.location?.city || "",
        interest: initialData.interests?.[0] || "",
        description: initialData.description || "",
        whyEndorse: initialData.whyEndorse || "",
        localRating: initialData.localRating || 5,
        culturalSensitivity: initialData.culturalSensitivity || "",
        duration: initialData.duration || "",
      };
    }
    return INITIAL_FORM_DATA;
  });

  const [interests, setInterests] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      initialData &&
      initialData.location?.address === formData.address &&
      initialData.location?.suburb === formData.suburb &&
      initialData.location?.city === formData.city
    ) {
      onSubmit({
        ...formData,
        type: formType,
        latitude: initialData.location?.latitude,
        longitude: initialData.location?.longitude,
      });
      return;
    }

    if (!isLoaded) {
      setError(
        "Google Maps is still loading. Please wait a moment and try again.",
      );
      return;
    }

    setIsValidating(true);

    try {
      const { AddressValidation } =
        await window.google.maps.importLibrary("addressValidation");

      const addressLines = [
        formData.address,
        formData.suburb,
        formData.city,
        "South Africa",
      ].filter(Boolean);

      const result = await AddressValidation.fetchAddressValidation({
        address: {
          regionCode: "ZA",
          languageCode: "en",
          addressLines: [addressLines.join(", ")],
        },
      });

      const verdict = result.verdict;

      if (!verdict.addressComplete || verdict.hasUnconfirmedComponents) {
        let errorMsg = "Address could not be fully validated. ";
        if (verdict.hasUnconfirmedComponents) {
          errorMsg += "Please double-check the street address and suburb.";
        }
        setError(errorMsg);
        setIsValidating(false);
        return;
      }

      const lat = result.geocode.location.lat();
      const lng = result.geocode.location.lng();
      const formattedAddress = result.address.formattedAddress;

      const finalData = {
        ...formData,
        type: formType,
        address: formattedAddress,
        latitude: lat,
        longitude: lng,
      };

      onSubmit(finalData);
    } catch (err) {
      console.error("Validation failed:", err);
      setError(
        "Could not validate this address. Please ensure the address is correct and try again.",
      );
      setIsValidating(false);
    }
  };

  return (
    <>
      <aside className="contributeModalAlert">
        <h3 className="contributeModalAlertTitle">Before You Submit</h3>
        <p className="contributeModalAlertDescription">
          As a local contributor, your voice shapes how visitors experience our
          culture. Please only add a {formType} where you genuinely welcome
          respectful visitors and feel the culture is represented authentically.
        </p>
      </aside>

      <form onSubmit={handleSubmit} className="contributeModalForm">
        <div className="contributeModalToggleGroup">
          <button
            type="button"
            className={`contributeModalToggleBtn ${formType === "place" ? "active" : ""}`}
            onClick={() => setFormType("place")}
          >
            Place
          </button>
          <button
            type="button"
            className={`contributeModalToggleBtn ${formType === "activity" ? "active" : ""}`}
            onClick={() => setFormType("activity")}
          >
            Activity
          </button>
        </div>

        <fieldset className="contributeModalFormGroup">
          <label htmlFor="placeName" className="contributeModalLabel">
            {formType === "activity" ? "Activity Name *" : "Place Name *"}
          </label>
          <input
            id="placeName"
            type="text"
            value={formData.placeName}
            onChange={(e) =>
              setFormData({ ...formData, placeName: e.target.value })
            }
            placeholder={
              formType === "activity"
                ? "e.g., BraamByBike Tour"
                : "e.g., Origins Centre Museum"
            }
            className="contributeModalInput"
            required
          />
        </fieldset>

        {formType === "activity" && (
          <fieldset className="contributeModalFormGroup">
            <label htmlFor="duration" className="contributeModalLabel">
              Estimated Duration *
            </label>
            <input
              id="duration"
              type="text"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              placeholder="e.g., 2 hours"
              className="contributeModalInput"
              required
            />
          </fieldset>
        )}

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
          <label htmlFor="suburb" className="contributeModalLabel">
            Suburb *
          </label>
          <input
            id="suburb"
            type="text"
            value={formData.suburb}
            onChange={(e) =>
              setFormData({ ...formData, suburb: e.target.value })
            }
            placeholder="e.g., Braamfontein"
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
            placeholder={`Describe this ${formType} and what makes it special...`}
            rows={4}
            className="contributeModalTextarea contributeModalInputWithIcon"
            required
          />
        </fieldset>

        {!initialData && (
          <>
            <fieldset className="contributeModalFormGroup">
              <label htmlFor="whyEndorse" className="contributeModalLabel">
                Why Do You Endorse This{" "}
                {formType === "activity" ? "Activity" : "Place"}? *
              </label>
              <textarea
                id="whyEndorse"
                value={formData.whyEndorse}
                onChange={(e) =>
                  setFormData({ ...formData, whyEndorse: e.target.value })
                }
                placeholder={`Explain why you believe visitors should experience this ${formType}...`}
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
              <label
                htmlFor="culturalSensitivity"
                className="contributeModalLabel"
              >
                Cultural Sensitivity Notes
              </label>
              <textarea
                id="culturalSensitivity"
                value={formData.culturalSensitivity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    culturalSensitivity: e.target.value,
                  })
                }
                placeholder="Are there any cultural protocols, dress codes, or respectful behaviors visitors should know?"
                rows={3}
                className="contributeModalTextarea"
              />
            </fieldset>
          </>
        )}

        {error && (
          <div className="contributeModalErrorBanner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
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
            <span>{error}</span>
          </div>
        )}

        <footer className="contributeModalActions">
          <button
            type="submit"
            className="contributeModalSubmit"
            disabled={isValidating}
          >
            {isValidating
              ? "Validating Address..."
              : initialData
                ? "Save Changes"
                : `Submit ${formType === "activity" ? "Activity" : "Place"}`}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="contributeModalCancel"
            disabled={isValidating}
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
