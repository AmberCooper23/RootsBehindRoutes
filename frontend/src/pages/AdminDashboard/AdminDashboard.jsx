import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getModerationSummary,
  listContentByStatus,
  listAllUsers,
  banUser,
  unbanUser,
  suspendUser,
  unsuspendUser,
} from "../../../api/adminApi";
import {
  fetchRecommendations,
  updateRecommendationStatus,
} from "../../../api/recommendationsApi";
import ModerateButtons from "../../components/Admin/ModerateButtons";
import "./AdminDashboard.css";

function collectionLabel(collection) {
  switch (collection) {
    case "places":
      return "Place";
    case "activities":
      return "Activity";
    case "reviews":
      return "Review";
    case "endorsements":
      return "Endorsement";
    default:
      return collection;
  }
}

function itemTitle(item) {
  return item.name || item.title || item.body || item.text || `#${item.id}`;
}

function userStatus(user) {
  if (user.banned) return { label: "Banned", tone: "danger" };
  if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
    return { label: "Suspended", tone: "warn" };
  }
  return { label: "Active", tone: "ok" };
}

const CONTENT_TABS = [
  { key: "pending", label: "Pending" },
  { key: "hidden", label: "Hidden" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [tab, setTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const contentStatus =
        tab === "users" || tab === "recommendations" ? "pending" : tab;
      const [s, c, u, r] = await Promise.all([
        getModerationSummary(),
        listContentByStatus(contentStatus),
        listAllUsers(),
        fetchRecommendations(),
      ]);
      setSummary(s);
      setContentItems(c);
      setUsers(u);
      setRecommendations(r);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [tab]);

  const reloadContent = async () => {
    try {
      const contentStatus =
        tab === "users" || tab === "recommendations" ? "pending" : tab;
      const c = await listContentByStatus(contentStatus);
      setContentItems(c);
      const s = await getModerationSummary();
      setSummary(s);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRecommendationStatus = async (id, status) => {
    try {
      await updateRecommendationStatus(id, status);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBan = async (uid) => {
    if (!window.confirm("Ban this user?")) return;
    try {
      await banUser(uid);
      await loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUnban = async (uid) => {
    try {
      await unbanUser(uid);
      await loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSuspend = async (uid) => {
    const days = window.prompt("Suspend for how many days?", "7");
    if (!days) return;
    const n = Number(days);
    if (!Number.isFinite(n) || n <= 0) {
      alert("Enter a positive number of days");
      return;
    }
    const until = new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();
    try {
      await suspendUser(uid, until);
      await loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUnsuspend = async (uid) => {
    try {
      await unsuspendUser(uid);
      await loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && !summary) {
    return <main className="adminPage">Loading admin dashboard...</main>;
  }

  if (error) {
    return (
      <main className="adminPage">
        <div className="adminError">{error}</div>
        <button className="adminRefreshBtn" onClick={loadAll}>
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <h1 className="adminTitle">Moderation Dashboard</h1>
          <p className="adminSubtitle">
            Review content, manage accounts, and keep the community healthy.
          </p>
        </div>
        <button className="adminRefreshBtn" onClick={loadAll}>
          Refresh
        </button>
      </header>

      {summary && (
        <section className="adminSummaryGrid">
          <div className="adminSummaryCard">
            <span className="adminSummaryLabel">Users</span>
            <span className="adminSummaryValue">{summary.users.total}</span>
            <span className="adminSummaryMeta">
              {summary.users.banned} banned
            </span>
          </div>
          <div className="adminSummaryCard">
            <span className="adminSummaryLabel">Pending</span>
            <span className="adminSummaryValue">
              {summary.places.pending +
                summary.activities.pending +
                summary.reviews.pending +
                summary.endorsements.pending}
            </span>
            <span className="adminSummaryMeta">awaiting review</span>
          </div>
          <div className="adminSummaryCard">
            <span className="adminSummaryLabel">Hidden</span>
            <span className="adminSummaryValue">
              {summary.places.hidden +
                summary.activities.hidden +
                summary.reviews.hidden +
                summary.endorsements.hidden}
            </span>
            <span className="adminSummaryMeta">content hidden</span>
          </div>
          <div className="adminSummaryCard">
            <span className="adminSummaryLabel">Recommendations</span>
            <span className="adminSummaryValue">
              {recommendations.filter((r) => r.status === "pending").length}
            </span>
            <span className="adminSummaryMeta">user suggestions</span>
          </div>
        </section>
      )}

      <nav className="adminTabs">
        {CONTENT_TABS.map((t) => (
          <button
            key={t.key}
            className={`adminTab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
        <button
          className={`adminTab ${tab === "recommendations" ? "active" : ""}`}
          onClick={() => setTab("recommendations")}
        >
          Recommendations ({recommendations.length})
        </button>
        <button
          className={`adminTab ${tab === "users" ? "active" : ""}`}
          onClick={() => setTab("users")}
        >
          Users ({users.length})
        </button>
      </nav>

      {tab !== "users" && tab !== "recommendations" && (
        <section className="adminPanel">
          {contentItems.length === 0 ? (
            <div className="adminEmpty">Nothing here 🎉</div>
          ) : (
            <ul className="adminPendingList">
              {contentItems.map((item) => (
                <li
                  key={`${item.collection}:${item.id}`}
                  className="adminPendingItem"
                >
                  <div className="adminPendingInfo">
                    <span className="adminPendingCollection">
                      {collectionLabel(item.collection)}
                    </span>
                    <span className="adminPendingTitle">{itemTitle(item)}</span>
                    <span className="adminPendingMeta">
                      by {item.userId || item.createdBy || "unknown"} ·{" "}
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "no date"}
                    </span>
                  </div>
                  <ModerateButtons
                    collection={item.collection}
                    id={item.id}
                    status={item.status}
                    onChanged={reloadContent}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "recommendations" && (
        <section className="adminPanel">
          <ul className="adminPendingList">
            {recommendations.map((rec) => (
              <li key={rec.id} className="adminPendingItem">
                <div className="adminPendingInfo">
                  <span className="adminPendingCollection">Recommendation</span>
                  <span className="adminPendingTitle">{rec.name}</span>
                  <span className="adminPendingMeta">
                    Location: {rec.location} · By {rec.userName}
                  </span>
                  <p
                    style={{
                      margin: "0.5rem 0",
                      fontSize: "0.9rem",
                      fontStyle: "italic",
                      color: "#7a6552",
                    }}
                  >
                    "{rec.reason}"
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {rec.status === "pending" ? (
                    <>
                      <button
                        className="adminUserBtn ok"
                        onClick={() =>
                          handleRecommendationStatus(rec.id, "approved")
                        }
                      >
                        Mark Reviewed
                      </button>
                      <button
                        className="adminUserBtn danger"
                        onClick={() =>
                          handleRecommendationStatus(rec.id, "dismissed")
                        }
                      >
                        Dismiss
                      </button>
                    </>
                  ) : (
                    <span
                      className={`tone-${rec.status === "approved" ? "ok" : "danger"}`}
                      style={{ textTransform: "capitalize" }}
                    >
                      {rec.status}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {recommendations.length === 0 && (
            <div className="adminEmpty">No recommendations yet 🎉</div>
          )}
        </section>
      )}

      {tab === "users" && (
        <section className="adminPanel">
          <ul className="adminUserList">
            {users.map((u) => {
              const st = userStatus(u);
              return (
                <li key={u.id} className="adminUserItem">
                  <div className="adminUserInfo">
                    {u.photoURL ? (
                      <img
                        src={u.photoURL}
                        alt=""
                        className="adminUserAvatar"
                      />
                    ) : (
                      <span className="adminUserAvatar adminUserAvatarEmpty">
                        👤
                      </span>
                    )}
                    <div>
                      <Link
                        to={`/UserProfile/${u.id}`}
                        className="adminUserName"
                      >
                        {u.displayName}
                      </Link>
                      <span className="adminUserMeta">
                        {u.role} ·{" "}
                        <span className={`tone-${st.tone}`}>{st.label}</span>
                      </span>
                    </div>
                  </div>
                  <div className="adminUserActions">
                    {u.banned ? (
                      <button
                        className="adminUserBtn ok"
                        onClick={() => handleUnban(u.id)}
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        className="adminUserBtn danger"
                        onClick={() => handleBan(u.id)}
                      >
                        Ban
                      </button>
                    )}
                    {u.suspendedUntil &&
                    new Date(u.suspendedUntil) > new Date() ? (
                      <button
                        className="adminUserBtn ok"
                        onClick={() => handleUnsuspend(u.id)}
                      >
                        Unsuspend
                      </button>
                    ) : (
                      <button
                        className="adminUserBtn warn"
                        onClick={() => handleSuspend(u.id)}
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
