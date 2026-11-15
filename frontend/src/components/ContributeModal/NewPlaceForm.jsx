import { useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { fetchAllInterests } from "../../../api/interestsApi";
import "./NewModal.css";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const EMPTY_HOURS = {
  monday: { open: "", close: "" },
  tuesday: { open: "", close: "" },
  wednesday: { open: "", close: "" },
  thursday: { open: "", close: "" },
  friday: { open: "", close: "" },
  saturday: { open: "", close: "" },
  sunday: { open: "", close: "" },
};

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
  phone: "",
  email: "",
  website: "",
  hours: EMPTY_HOURS,
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
        phone: initialData.phone || "",
        email: initialData.email || "",
        website: initialData.website || "",
        hours: initialData.hours || EMPTY_HOURS,
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

  const handleHourChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value,
        },
      },
    }));
  };

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
      const geocoder = new window.google.maps.Geocoder();
      const addressQuery = [
        formData.address,
        formData.suburb,
        formData.city,
        "South Africa",
      ]
        .filter(Boolean)
        .join(", ");

      const response = await geocoder.geocode({ address: addressQuery });

      if (response.results && response.results.length > 0) {
        const location = response.results[0].geometry.location;
        const formattedAddress = response.results[0].formatted_address;

        const finalData = {
          ...formData,
          type: formType,
          address: formattedAddress,
          latitude: location.lat(),
          longitude: location.lng(),
        };

        onSubmit(finalData);
      } else {
        setError(
          "Could not find the coordinates for this address. Please check the street address, suburb, and city.",
        );
        setIsValidating(false);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      setError(
        "Could not validate this address. Please check your connection and try again.",
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
          culture. Please only add {formType}s where you genuinely welcome
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

        <fieldset className="contributeModalFormGroup">
          <label className="contributeModalLabel">Operating Hours *</label>
          <div className="contributeModalHoursGrid">
            {DAYS.map((day) => (
              <div key={day} className="contributeModalHoursBlock">
                <span className="contributeModalHoursDay">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </span>
                <div className="contributeModalHoursInputs">
                  <input
                    type="time"
                    value={formData.hours[day]?.open || ""}
                    onChange={(e) =>
                      handleHourChange(day, "open", e.target.value)
                    }
                    className="contributeModalInput contributeModalTimeInput"
                    required
                  />
                  <span className="contributeModalHoursSeparator">to</span>
                  <input
                    type="time"
                    value={formData.hours[day]?.close || ""}
                    onChange={(e) =>
                      handleHourChange(day, "close", e.target.value)
                    }
                    className="contributeModalInput contributeModalTimeInput"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <div className="contributeModalContactGrid">
          <fieldset className="contributeModalFormGroup">
            <label htmlFor="phone" className="contributeModalLabel">
              Cellphone
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="e.g., +27 67 676 7676"
              className="contributeModalInput"
            />
          </fieldset>

          <fieldset className="contributeModalFormGroup">
            <label htmlFor="email" className="contributeModalLabel">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="e.g., hello@place.com"
              className="contributeModalInput"
            />
          </fieldset>

          <fieldset className="contributeModalFormGroup">
            <label htmlFor="website" className="contributeModalLabel">
              Website
            </label>
            <input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              placeholder="https://..."
              className="contributeModalInput"
            />
          </fieldset>
        </div>

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
              ? "Locating..."
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
