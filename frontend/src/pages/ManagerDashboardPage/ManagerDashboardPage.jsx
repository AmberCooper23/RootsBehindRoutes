import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import {
  fetchManagerPlaces,
  updateManagerPlace,
  deleteManagerPlace,
} from "../../../api/placesApi";
import {
  fetchManagerActivities,
  updateManagerActivity,
  deleteManagerActivity,
} from "../../../api/activitiesApi";
import { AddPlaceModal } from "../../components/ContributeModal/AddPlaceModal";
import { NewPlaceForm } from "../../components/ContributeModal/NewPlaceForm";
import "./ManagerDashboardPage.css";

function EditPlaceModal({ isOpen, onClose, place, onSuccess }) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (data) => {
    try {
      await updateManagerPlace(place.id, {
        name: data.placeName,
        location: {
          address: data.address,
          suburb: data.suburb,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
        },
        interests: [data.interest],
        description: data.description,
        phone: data.phone,
        email: data.email,
        website: data.website,
        hours: data.hours,
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Failed to update place.");
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="contributeModalOverlay" onClick={onClose}>
      <article className="contributeModal" onClick={(e) => e.stopPropagation()}>
        <header className="contributeModalHeader">
          <button
            onClick={onClose}
            className="contributeModalClose"
            type="button"
          >
            X
          </button>
          <h2 className="contributeModalTitle">Edit Place</h2>
          <p className="contributeModalSubtitle">
            Update details for {place.name}
          </p>
        </header>
        <section className="contributeModalBody">
          {isSubmitted ? (
            <section className="contributeModalSuccess">
              <h3 className="contributeModalSuccessTitle">Updated!</h3>
              <p className="contributeModalSuccessMessage">
                Your place has been successfully updated.
              </p>
            </section>
          ) : (
            <NewPlaceForm
              initialData={place}
              onSubmit={handleSubmit}
              onCancel={onClose}
            />
          )}
        </section>
      </article>
    </aside>
  );
}

function EditActivityModal({ isOpen, onClose, activity, onSuccess }) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (data) => {
    try {
      await updateManagerActivity(activity.id, {
        name: data.placeName,
        location: {
          address: data.address,
          suburb: data.suburb,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
        },
        interests: [data.interest],
        description: data.description,
        phone: data.phone,
        email: data.email,
        website: data.website,
        hours: data.hours,
        duration: data.duration,
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Failed to update activity.");
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="contributeModalOverlay" onClick={onClose}>
      <article className="contributeModal" onClick={(e) => e.stopPropagation()}>
        <header className="contributeModalHeader">
          <button
            onClick={onClose}
            className="contributeModalClose"
            type="button"
          >
            X
          </button>
          <h2 className="contributeModalTitle">Edit Activity</h2>
          <p className="contributeModalSubtitle">
            Update details for {activity.name}
          </p>
        </header>
        <section className="contributeModalBody">
          {isSubmitted ? (
            <section className="contributeModalSuccess">
              <h3 className="contributeModalSuccessTitle">Updated!</h3>
              <p className="contributeModalSuccessMessage">
                Your activity has been successfully updated.
              </p>
            </section>
          ) : (
            <NewPlaceForm
              initialData={activity}
              onSubmit={handleSubmit}
              onCancel={onClose}
            />
          )}
        </section>
      </article>
    </aside>
  );
}

export function ManagerDashboardPage() {
  const [user, authLoading] = useAuthState(auth);
  const [places, setPlaces] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [fetchedPlaces, fetchedActivities] = await Promise.all([
        fetchManagerPlaces(user.uid),
        fetchManagerActivities(user.uid),
      ]);
      setPlaces(fetchedPlaces);
      setActivities(fetchedActivities);
    } catch (err) {
      console.error(err);
      setError("Failed to load your data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleHidePlace = async (place) => {
    try {
      const newStatus = !place.isHidden;
      await updateManagerPlace(place.id, { isHidden: newStatus });
      setPlaces((prev) =>
        prev.map((p) =>
          p.id === place.id ? { ...p, isHidden: newStatus } : p,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update visibility.");
    }
  };

  const handleToggleHideActivity = async (activity) => {
    try {
      const newStatus = !activity.isHidden;
      await updateManagerActivity(activity.id, { isHidden: newStatus });
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activity.id ? { ...a, isHidden: newStatus } : a,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update visibility.");
    }
  };

  const handleDeletePlace = async (id) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this place?")
    )
      return;
    try {
      await deleteManagerPlace(id);
      setPlaces((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete place.");
    }
  };

  const handleDeleteActivity = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this activity?",
      )
    )
      return;
    try {
      await deleteManagerActivity(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete activity.");
    }
  };

  if (authLoading || loading) {
    return (
      <main className="dashboard dashboardCentered">
        <p className="dashboardMuted">Loading your dashboard...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="dashboard dashboardCentered">
        <section className="dashboardNotice">
          <h1 className="dashboardLoginTitle">Access Denied</h1>
          <p className="dashboardMuted">
            You must be logged in to view this page.
          </p>
          <Link to="/" className="dashboardButton">
            Return to Home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header className="dashboardHeader">
        <section>
          <h1 className="dashboardTitle">Manager Dashboard</h1>
          <p className="dashboardMuted">Manage your places and activities.</p>
        </section>
        <div className="managerHeaderActions">
          <button
            type="button"
            className="dashboardButton"
            onClick={() => setIsAddPlaceOpen(true)}
          >
            + Add New Place
          </button>
          <button
            type="button"
            className="dashboardButton"
            onClick={() => setIsAddActivityOpen(true)}
          >
            + Add New Activity
          </button>
        </div>
      </header>

      {error && <p className="dashboardError">{error}</p>}

      <section className="dashboardSection">
        <h2 className="dashboardSectionTitle">Your Places</h2>
        {places.length === 0 ? (
          <p className="dashboardMuted">You haven't added any places yet.</p>
        ) : (
          <div className="managerGrid">
            {places.map((place) => (
              <div
                key={place.id}
                className={`managerCard ${place.isHidden ? "managerCardHidden" : ""}`}
              >
                <img
                  src={place.image || "/placeholder.png"}
                  alt={place.name}
                  className="managerCardImg"
                />
                <div className="managerCardBody">
                  <div className="managerCardHeader">
                    <h3 className="managerCardTitle">{place.name}</h3>
                    {place.isHidden && (
                      <span className="managerHiddenBadge">Hidden</span>
                    )}
                  </div>
                  <p className="managerCardLocation">
                    {place.location?.suburb && place.location?.city
                      ? `${place.location.suburb}, ${place.location.city}`
                      : place.location?.city || "No location set"}
                  </p>

                  <div className="managerCardRatings">
                    <span>★ {place.touristRating ?? 0}/5</span>
                    <span>● {place.localRating ?? 0}/10</span>
                  </div>

                  <div className="managerCardActions">
                    <Link
                      to={`/Details/place/${place.id}`}
                      className="managerBtn managerBtnPrimary"
                    >
                      Preview
                    </Link>
                    <button
                      onClick={() => setEditingPlace(place)}
                      className="managerBtn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleHidePlace(place)}
                      className="managerBtn"
                    >
                      {place.isHidden ? "Show" : "Hide"}
                    </button>
                    <button
                      onClick={() => handleDeletePlace(place.id)}
                      className="managerBtn managerBtnDanger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboardSection">
        <h2 className="dashboardSectionTitle">Your Activities</h2>
        {activities.length === 0 ? (
          <p className="dashboardMuted">
            You haven't added any activities yet.
          </p>
        ) : (
          <div className="managerGrid">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`managerCard ${activity.isHidden ? "managerCardHidden" : ""}`}
              >
                <img
                  src={activity.image || "/placeholder.png"}
                  alt={activity.name}
                  className="managerCardImg"
                />
                <div className="managerCardBody">
                  <div className="managerCardHeader">
                    <h3 className="managerCardTitle">{activity.name}</h3>
                    {activity.isHidden && (
                      <span className="managerHiddenBadge">Hidden</span>
                    )}
                  </div>
                  <p className="managerCardLocation">
                    {activity.location?.suburb && activity.location?.city
                      ? `${activity.location.suburb}, ${activity.location.city}`
                      : activity.location?.city || "No location set"}
                  </p>

                  <div className="managerCardRatings">
                    <span>★ {activity.touristRating ?? 0}/5</span>
                    <span>● {activity.localRating ?? 0}/10</span>
                  </div>

                  <div className="managerCardActions">
                    <Link
                      to={`/Details/activity/${activity.id}`}
                      className="managerBtn managerBtnPrimary"
                    >
                      Preview
                    </Link>
                    <button
                      onClick={() => setEditingActivity(activity)}
                      className="managerBtn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleHideActivity(activity)}
                      className="managerBtn"
                    >
                      {activity.isHidden ? "Show" : "Hide"}
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="managerBtn managerBtnDanger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <AddPlaceModal
        isOpen={isAddPlaceOpen}
        onClose={() => setIsAddPlaceOpen(false)}
        onSuccess={loadData}
        defaultType="place"
      />

      <AddPlaceModal
        isOpen={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
        onSuccess={loadData}
        defaultType="activity"
      />

      {editingPlace && (
        <EditPlaceModal
          isOpen={!!editingPlace}
          onClose={() => setEditingPlace(null)}
          place={editingPlace}
          onSuccess={loadData}
        />
      )}

      {editingActivity && (
        <EditActivityModal
          isOpen={!!editingActivity}
          onClose={() => setEditingActivity(null)}
          activity={editingActivity}
          onSuccess={loadData}
        />
      )}
    </main>
  );
}

export default ManagerDashboardPage;
