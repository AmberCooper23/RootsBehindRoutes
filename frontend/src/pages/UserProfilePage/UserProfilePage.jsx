import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider, storage } from "../../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  fetchUser,
  addUser,
  addUserInterest,
  removeUserInterest,
} from "../../../api/usersApi";
import { fetchAllPlaces } from "../../../api/placesApi";
import { fetchAllActivities } from "../../../api/activitiesApi";
import { fetchAllReviews } from "../../../api/reviewsApi";
import { fetchAllEndorsements } from "../../../api/endorsementsApi";
import { fetchAllInterests } from "../../../api/interestsApi";
import { getBookmarks } from "../../../api/bookmarksApi";

import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import AboutMeCard from "./AboutMeCard";
import InterestsCard from "./InterestsCard";
import VisitedExperiences from "./VisitedExperiences";

import "./UserProfilePage.css";

export function UserProfile() {
  const [user] = useAuthState(auth);

  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [birthday, setBirthday] = useState("");
  const [area, setArea] = useState("");
  const [interests, setInterests] = useState([]);
  const [allInterests, setAllInterests] = useState([]);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [visitedExperiences, setVisitedExperiences] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  const [stats, setStats] = useState({
    placesVisited: 0,
    savedPlaces: 0,
    contributions: 0,
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      try {
        const profileData = await fetchUser(user.uid);
        setProfile(profileData);
        setBio(profileData?.bio || "");
        setAge(profileData?.age || "");
        setBirthday(profileData?.birthday || "");
        setArea(profileData?.area || "");
        setInterests(profileData?.interests || profileData?.Interests || []);

        const [
          allPlaces,
          allActivities,
          allReviews,
          allEndorsements,
          myBookmarks,
          databaseInterests,
        ] = await Promise.all([
          fetchAllPlaces(),
          fetchAllActivities(),
          fetchAllReviews(),
          fetchAllEndorsements(),
          getBookmarks(user.uid),
          fetchAllInterests(),
        ]);

        setAllInterests(databaseInterests);

        const myReviews = allReviews.filter((r) => r.userId === user.uid);
        const myEndorsements = allEndorsements.filter(
          (e) => e.userId === user.uid,
        );

        const uniquePlaceIds = new Set([
          ...(profileData?.placesVisited || []),
          ...myReviews.map((r) => r.placeId).filter(Boolean),
          ...myEndorsements.map((e) => e.placeId).filter(Boolean),
        ]);

        const uniqueActivityIds = new Set([
          ...(profileData?.activitiesTried || []),
          ...myReviews.map((r) => r.activityId).filter(Boolean),
          ...myEndorsements.map((e) => e.activityId).filter(Boolean),
        ]);

        const uniqueSavedIds = new Set(
          (Array.isArray(myBookmarks) ? myBookmarks : [])
            .map((b) => b.itemId || b.itemPath || b.placeId)
            .filter(Boolean),
        );

        setStats({
          placesVisited: uniquePlaceIds.size + uniqueActivityIds.size,
          savedPlaces: uniqueSavedIds.size,
          contributions: profileData?.activitiesTried?.length || 0,
        });

        const combinedLogs = [
          ...myReviews.map((r) => ({ ...r, logType: "review" })),
          ...myEndorsements.map((e) => ({ ...e, logType: "endorsement" })),
        ];

        combinedLogs.sort((a, b) => {
          const dateA = new Date(a.visitDate || a.createdAt || 0).getTime();
          const dateB = new Date(b.visitDate || b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        const formattedLogs = combinedLogs
          .map((log) => {
            const isPlace = !!log.placeId;
            const item = isPlace
              ? allPlaces.find((p) => p.id === log.placeId)
              : allActivities.find((a) => a.id === log.activityId);

            if (!item) return null;

            let rating = null;
            let scale = "";

            if (log.logType === "review") {
              rating = log.rating;
              scale = "/5";
            } else if (log.logType === "endorsement") {
              rating = log.score || log.rating;
              scale = "/10";
            }

            return {
              ...item,
              type: isPlace ? "place" : "activity",
              logId: log.id,
              userRating: rating,
              ratingScale: scale,
              userVisitDate: log.visitDate || log.createdAt,
            };
          })
          .filter(Boolean);

        setVisitedExperiences(formattedLogs);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    }

    loadProfile();
  }, [user]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const newUser = result.user;
      await addUser(newUser.uid, {
        name: newUser.displayName,
        email: newUser.email,
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdatePhoto = async (file) => {
    if (!file) return;
    try {
      setIsUploading(true);
      const storageRef = ref(
        storage,
        `profile_pictures/${user.uid}_${Date.now()}`,
      );
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await addUser(user.uid, { photoURL: downloadURL });
      setProfile((prev) => ({ ...prev, photoURL: downloadURL }));
    } catch (error) {
      console.error("Failed to upload photo:", error);
      alert("Failed to upload photo. Ensure Firebase Storage is enabled.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleNameSave = async () => {
    if (!tempName.trim()) return;
    try {
      await addUser(user.uid, { displayName: tempName.trim() });
      setProfile((prev) => ({ ...prev, displayName: tempName.trim() }));
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to save name:", error);
      alert("Failed to save name.");
    }
  };

  const saveBio = async (e) => {
    e.preventDefault();
    setIsEditingBio(false);
    try {
      await addUser(user.uid, { bio, age, birthday, area });
      setProfile((prev) => ({ ...prev, bio, age, birthday, area }));
    } catch (error) {
      console.error("Failed to save bio:", error);
    }
  };

  const handleAddInterest = async (interestId) => {
    if (interests.includes(interestId)) return;
    try {
      await addUserInterest(user.uid, interestId);
      setInterests([...interests, interestId]);
    } catch (error) {
      console.error("Failed to add interest:", error);
    }
  };

  const handleRemoveInterest = async (interestId) => {
    try {
      await removeUserInterest(user.uid, interestId);
      setInterests(interests.filter((i) => i !== interestId));
    } catch (error) {
      console.error("Failed to remove interest:", error);
    }
  };

  if (!user) {
    return (
      <main className="profilePage">
        <ProfileHeader isGuest={true} />
        <section className="profileLoginPrompt">
          <p>You need to log in to view your profile.</p>
          <button onClick={handleLogin} className="profileActionBtn">
            Login with Google
          </button>
        </section>
      </main>
    );
  }

  const displayPhoto = profile?.photoURL || user.photoURL;
  const displayName =
    profile?.displayName || profile?.name || user.displayName || "Explorer";
  const role = profile?.role || "Explorer";

  return (
    <main className="profilePage">
      <ProfileHeader
        displayPhoto={displayPhoto}
        displayName={displayName}
        role={role}
        onUpdatePhoto={handleUpdatePhoto}
        isUploading={isUploading}
        isEditingName={isEditingName}
        setIsEditingName={setIsEditingName}
        tempName={tempName}
        setTempName={setTempName}
        onNameSave={handleNameSave}
      />

      <section className="profileContent">
        <ProfileStats stats={stats} />

        <section className="profileGrid">
          <aside>
            <AboutMeCard
              bio={bio}
              setBio={setBio}
              age={age}
              setAge={setAge}
              birthday={birthday}
              setBirthday={setBirthday}
              area={area}
              setArea={setArea}
              isEditingBio={isEditingBio}
              setIsEditingBio={setIsEditingBio}
              saveBio={saveBio}
              joinDate={profile?.joinDate}
            />
            <InterestsCard
              interests={interests}
              allInterests={allInterests}
              handleRemoveInterest={handleRemoveInterest}
              handleAddInterest={handleAddInterest}
            />

            <nav className="profileNavActions">
              <button
                onClick={handleLogout}
                className="profileActionBtn profileActionBtnDanger"
              >
                Sign Out
              </button>
            </nav>
          </aside>

          <VisitedExperiences visitedExperiences={visitedExperiences} />
        </section>
      </section>
    </main>
  );
}

export default UserProfile;
