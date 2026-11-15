import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { auth, storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  fetchUser,
  addUser,
  addUserInterest,
  removeUserInterest,
  followUser,
  unfollowUser,
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

function isManagerRole(role) {
  return typeof role === "string" && role.toLowerCase() === "manager";
}

export function UserProfile() {
  const { uid } = useParams();
  const [user] = useAuthState(auth);

  const targetUid = uid || user?.uid;
  const isOwner = user?.uid === targetUid;

  const [profile, setProfile] = useState(null);
  const [viewerRole, setViewerRole] = useState(null);
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [birthday, setBirthday] = useState("");
  const [area, setArea] = useState("");
  const [interests, setInterests] = useState([]);
  const [allInterests, setAllInterests] = useState([]);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [visitedExperiences, setVisitedExperiences] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [stats, setStats] = useState({
    placesVisited: 0,
    savedPlaces: 0,
    contributions: 0,
  });

  useEffect(() => {
    if (!user?.uid) {
      setViewerRole(null);
      return;
    }
    let cancelled = false;
    fetchUser(user.uid)
      .then((data) => {
        if (!cancelled) setViewerRole(data?.role || null);
      })
      .catch(() => {
        if (!cancelled) setViewerRole(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    async function loadProfile() {
      if (!targetUid) return;

      try {
        setLoading(true);
        const profileData = await fetchUser(targetUid);
        setProfile(profileData);
        setBio(profileData?.bio || "");
        setAge(profileData?.age || "");
        setBirthday(profileData?.birthday || "");
        setArea(profileData?.area || "");
        setInterests(profileData?.interests || profileData?.Interests || []);
        setIsFollowing(
          user ? (profileData?.followers || []).includes(user.uid) : false,
        );

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
          isOwner ? getBookmarks(targetUid) : Promise.resolve([]),
          fetchAllInterests(),
        ]);

        setAllInterests(databaseInterests);

        const userReviews = allReviews.filter((r) => r.userId === targetUid);
        const userEndorsements = allEndorsements.filter(
          (e) => e.userId === targetUid,
        );

        const uniquePlaceIds = new Set([
          ...(profileData?.placesVisited || []),
          ...userReviews.map((r) => r.placeId).filter(Boolean),
          ...userEndorsements.map((e) => e.placeId).filter(Boolean),
        ]);

        const uniqueActivityIds = new Set([
          ...(profileData?.activitiesTried || []),
          ...userReviews.map((r) => r.activityId).filter(Boolean),
          ...userEndorsements.map((e) => e.activityId).filter(Boolean),
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
          ...userReviews.map((r) => ({ ...r, logType: "review" })),
          ...userEndorsements.map((e) => ({ ...e, logType: "endorsement" })),
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
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [targetUid, isOwner]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdatePhoto = async (file) => {
    if (!file || !isOwner) return;
    try {
      setIsUploading(true);
      const storageRef = ref(
        storage,
        `profile_pictures/${targetUid}_${Date.now()}`,
      );
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await addUser(targetUid, { photoURL: downloadURL });
      setProfile((prev) => ({ ...prev, photoURL: downloadURL }));
    } catch (error) {
      console.error("Failed to upload photo:", error);
      alert("Failed to upload photo. Ensure Firebase Storage is enabled.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleNameSave = async () => {
    if (!tempName.trim() || !isOwner) return;
    try {
      await addUser(targetUid, { displayName: tempName.trim() });
      setProfile((prev) => ({ ...prev, displayName: tempName.trim() }));
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to save name:", error);
      alert("Failed to save name.");
    }
  };

  const saveBio = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    setIsEditingBio(false);
    try {
      await addUser(targetUid, { bio, age, birthday, area });
      setProfile((prev) => ({ ...prev, bio, age, birthday, area }));
    } catch (error) {
      console.error("Failed to save bio:", error);
    }
  };

  const handleAddInterest = async (interestId) => {
    if (!isOwner || interests.includes(interestId)) return;
    try {
      await addUserInterest(targetUid, interestId);
      setInterests([...interests, interestId]);
    } catch (error) {
      console.error("Failed to add interest:", error);
    }
  };

  const handleRemoveInterest = async (interestId) => {
    if (!isOwner) return;
    try {
      await removeUserInterest(targetUid, interestId);
      setInterests(interests.filter((i) => i !== interestId));
    } catch (error) {
      console.error("Failed to remove interest:", error);
    }
  };

  const handleToggleFollow = async () => {
    if (!user || !targetUid || isOwner || followLoading) return;
    setFollowLoading(true);

    const next = !isFollowing;
    setIsFollowing(next);
    setProfile((prev) => ({
      ...prev,
      followers: next
        ? [...(prev.followers || []), user.uid]
        : (prev.followers || []).filter((id) => id !== user.uid),
    }));

    try {
      if (next) {
        await followUser(user.uid, targetUid);
      } else {
        await unfollowUser(user.uid, targetUid);
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      setIsFollowing(!next);
      setProfile((prev) => ({
        ...prev,
        followers: !next
          ? [...(prev.followers || []), user.uid]
          : (prev.followers || []).filter((id) => id !== user.uid),
      }));
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>Profile not found.</div>;
  }

  const displayPhoto = profile?.photoURL || (isOwner ? user?.photoURL : null);
  const displayName =
    profile?.displayName ||
    profile?.name ||
    (isOwner ? user?.displayName : null) ||
    "Explorer";
  const role = profile?.role || "Explorer";

  const viewerIsManager = isManagerRole(viewerRole);
  const targetIsManager = isManagerRole(profile?.role);
  const showFollowButton =
    !isOwner && !!user && !viewerIsManager && !targetIsManager;

  return (
    <main className="profilePage">
      <ProfileHeader
        displayPhoto={displayPhoto}
        displayName={displayName}
        role={role}
        isOwner={isOwner}
        isManager={targetIsManager}
        onUpdatePhoto={handleUpdatePhoto}
        isUploading={isUploading}
        isEditingName={isEditingName}
        setIsEditingName={setIsEditingName}
        tempName={tempName}
        setTempName={setTempName}
        onNameSave={handleNameSave}
        showFollowButton={showFollowButton}
        isFollowing={isFollowing}
        onToggleFollow={handleToggleFollow}
        followLoading={followLoading}
        followersCount={profile?.followers?.length || 0}
        followingCount={profile?.following?.length || 0}
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
              isOwner={isOwner}
            />
            <InterestsCard
              interests={interests}
              allInterests={allInterests}
              handleRemoveInterest={handleRemoveInterest}
              handleAddInterest={handleAddInterest}
              isOwner={isOwner}
            />

            {isOwner && (
              <nav className="profileNavActions">
                <button
                  onClick={handleLogout}
                  className="profileActionBtn profileActionBtnDanger"
                >
                  Sign Out
                </button>
              </nav>
            )}
          </aside>

          <VisitedExperiences visitedExperiences={visitedExperiences} />
        </section>
      </section>
    </main>
  );
}

export default UserProfile;
