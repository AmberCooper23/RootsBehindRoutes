import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../../firebase";
import { addUser, fetchUser } from "../../../api/usersApi";
import { fetchAllInterests } from "../../../api/interestsApi";
import "./ProfileSetupPage.css";

export function ProfileSetupPage() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("tourist");
  const [birthday, setBirthday] = useState("");
  const [age, setAge] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  const [interests, setInterests] = useState([]);
  const [allInterests, setAllInterests] = useState([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkExistingProfile() {
      if (!user) {
        navigate("/");
        return;
      }

      const profile = await fetchUser(user.uid);
      if (profile?.role) {
        navigate("/");
        return;
      }

      setDisplayName(user.displayName || "");
      if (user.photoURL) {
        setPhotoURL(user.photoURL);
      }
    }
    checkExistingProfile();
  }, [user, navigate]);

  useEffect(() => {
    async function loadInterests() {
      try {
        const data = await fetchAllInterests();
        setAllInterests(data);
      } catch (err) {
        console.error("Failed to load interests:", err);
      }
    }
    loadInterests();
  }, []);

  const handleBirthdayChange = (e) => {
    const val = e.target.value;
    setBirthday(val);

    if (val) {
      const birthDate = new Date(val);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge >= 0 ? calculatedAge.toString() : "");
    } else {
      setAge("");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const storageRef = ref(
        storage,
        `profile_pictures/${user.uid}_${Date.now()}`,
      );
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setPhotoURL(downloadURL);
    } catch (err) {
      console.error("Image upload failed:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleInterest = (id) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setIsSaving(true);

    try {
      await addUser(user.uid, {
        displayName,
        role,
        birthday,
        age,
        suburb,
        city,
        bio,
        photoURL,
        interests,
        joinDate: new Date().toISOString(),
      });
      navigate("/");
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Something went wrong. Please try again.");
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <main className="setupPage">
      <section className="setupCard">
        <header className="setupHeader">
          <h1 className="setupTitle">Welcome to Roots Behind Routes</h1>
          <p className="setupSubtitle">
            Let's get your profile set up so the community can get to know you.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="setupForm">
          <div className="setupSection">
            <h2 className="setupSectionTitle">Basic Info</h2>

            <div className="setupProfilePicRow">
              <div className="setupAvatarWrapper">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="Profile"
                    className="setupAvatarImg"
                  />
                ) : (
                  <span className="setupAvatarIcon">👤</span>
                )}
              </div>
              <div className="setupFileUpload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  id="pfpUpload"
                  className="setupFileInput"
                  disabled={isUploading}
                />
                <label htmlFor="pfpUpload" className="setupFileLabel">
                  {isUploading ? "Uploading..." : "Upload Profile Picture"}
                </label>
              </div>
            </div>

            <div className="setupRow">
              <fieldset className="setupFormGroup">
                <label htmlFor="displayName" className="setupLabel">
                  Display Name *
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Amber Cooper"
                  className="setupInput"
                  required
                />
              </fieldset>

              <fieldset className="setupFormGroup">
                <label htmlFor="role" className="setupLabel">
                  Role *
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="setupSelect"
                  required
                >
                  <option value="tourist">Tourist</option>
                  <option value="local">Local</option>
                  <option value="manager">Manager</option>
                </select>
              </fieldset>
            </div>
          </div>

          <div className="setupSection">
            <h2 className="setupSectionTitle">Location & Personal</h2>
            <div className="setupRow">
              <fieldset className="setupFormGroup">
                <label htmlFor="suburb" className="setupLabel">
                  Suburb
                </label>
                <input
                  id="suburb"
                  type="text"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  placeholder="e.g., Braamfontein"
                  className="setupInput"
                />
              </fieldset>

              <fieldset className="setupFormGroup">
                <label htmlFor="city" className="setupLabel">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Johannesburg"
                  className="setupInput"
                />
              </fieldset>
            </div>

            <div className="setupRow">
              <fieldset className="setupFormGroup">
                <label htmlFor="birthday" className="setupLabel">
                  Birthday
                </label>
                <input
                  id="birthday"
                  type="date"
                  value={birthday}
                  onChange={handleBirthdayChange}
                  className="setupInput"
                />
              </fieldset>

              <fieldset className="setupFormGroup">
                <label htmlFor="age" className="setupLabel">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g., 24"
                  className="setupInput"
                  readOnly={!!birthday}
                />
              </fieldset>
            </div>

            <fieldset className="setupFormGroup">
              <label htmlFor="bio" className="setupLabel">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a little about yourself..."
                rows={3}
                className="setupTextarea"
              />
            </fieldset>
          </div>

          <div className="setupSection">
            <h2 className="setupSectionTitle">Interests</h2>
            <p className="setupSectionDesc">Select the things you love most.</p>
            <div className="setupInterestsGrid">
              {allInterests.map((interest) => (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`setupInterestChip ${
                    interests.includes(interest.id) ? "active" : ""
                  }`}
                >
                  {interest.name}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="setupError">{error}</p>}

          <div className="setupActions">
            <button
              type="submit"
              className="setupSubmitBtn"
              disabled={isSaving || isUploading}
            >
              {isSaving ? "Saving..." : "Complete Setup"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default ProfileSetupPage;
