import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { fetchMyBusiness, updateMyBusiness } from "../../../api/managerApi";
import "./ManagerDashboardPage.css";

const LOGIN_ERRORS = {
  "auth/invalid-credential": "That email or password isn't right.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/too-many-requests":
    "Too many attempts. Wait a few minutes and try again.",
};

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

function BusinessLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(LOGIN_ERRORS[err.code] || "Couldn't sign in. Try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <main className="dashboard dashboardCentered">
      <form className="dashboardLogin" onSubmit={handleSubmit}>
        <h1 className="dashboardLoginTitle">Business sign in</h1>
        <p className="dashboardMuted">
          Use the business account we set up for your place. This is separate
          from your personal account.
        </p>
        <label className="dashboardLabel" htmlFor="businessEmail">
          Email
        </label>
        <input
          id="businessEmail"
          type="email"
          className="dashboardInput"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />
        <label className="dashboardLabel" htmlFor="businessPassword">
          Password
        </label>
        <input
          id="businessPassword"
          type="password"
          className="dashboardInput"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error && (
          <p className="dashboardError" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="dashboardButton"
          disabled={isSigningIn}
        >
          {isSigningIn ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

function BusinessForm({ business, getToken, onSaved }) {
  const [form, setForm] = useState({
    name: business.name || "",
    description: business.description || "",
    image: business.image || "",
    city: business.location?.city || "",
    region: business.location?.region || "",
  });
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [error, setError] = useState("");

  const setField = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setStatus("idle");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("saving");
    setError("");
    try {
      const updated = await updateMyBusiness(await getToken(), form);
      onSaved(updated);
      setStatus("saved");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  return (
    <form className="dashboardForm" onSubmit={handleSubmit}>
      <label className="dashboardLabel" htmlFor="bizName">
        Name
      </label>
      <input
        id="bizName"
        className="dashboardInput"
        value={form.name}
        onChange={setField("name")}
        required
      />

      <label className="dashboardLabel" htmlFor="bizDescription">
        Description
      </label>
      <textarea
        id="bizDescription"
        className="dashboardInput dashboardTextarea"
        rows={5}
        value={form.description}
        onChange={setField("description")}
      />

      <label className="dashboardLabel" htmlFor="bizImage">
        Image link
      </label>
      <input
        id="bizImage"
        className="dashboardInput"
        value={form.image}
        onChange={setField("image")}
        placeholder="https://..."
      />

      <section className="dashboardRow">
        <section className="dashboardField">
          <label className="dashboardLabel" htmlFor="bizCity">
            City
          </label>
          <input
            id="bizCity"
            className="dashboardInput"
            value={form.city}
            onChange={setField("city")}
          />
        </section>
        <section className="dashboardField">
          <label className="dashboardLabel" htmlFor="bizRegion">
            Region
          </label>
          <input
            id="bizRegion"
            className="dashboardInput"
            value={form.region}
            onChange={setField("region")}
          />
        </section>
      </section>

      {status === "error" && (
        <p className="dashboardError" role="alert">
          {error}
        </p>
      )}
      <footer className="dashboardActions">
        <button
          type="submit"
          className="dashboardButton"
          disabled={status === "saving"}
        >
          {status === "saving" ? "Saving..." : "Save changes"}
        </button>
        {status === "saved" && (
          <p className="dashboardSaved" role="status">
            Changes saved
          </p>
        )}
      </footer>
    </form>
  );
}

function Rating({ label, value, max, count, countLabel }) {
  return (
    <article className="dashboardRating">
      <p className="dashboardRatingLabel">{label}</p>
      <p className="dashboardRatingValue">
        {typeof value === "number" && value > 0 ? value : "-"}
        <span className="dashboardRatingMax">/{max}</span>
      </p>
      <p className="dashboardMuted">
        {count} {countLabel}
        {count === 1 ? "" : "s"}
      </p>
    </article>
  );
}

function FeedbackList({ title, items, emptyMessage, renderItem }) {
  return (
    <section className="dashboardSection">
      <h2 className="dashboardSectionTitle">
        {title} <span className="dashboardMuted">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <p className="dashboardMuted">{emptyMessage}</p>
      ) : (
        <ul className="dashboardFeedbackList">
          {items.map((item) => (
            <li key={item.id} className="dashboardFeedbackItem">
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ManagerDashboardPage() {
  const [user, authLoading] = useAuthState(auth);
  const [business, setBusiness] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notLinked | error

  const getToken = useCallback(() => user.getIdToken(), [user]);

  const load = useCallback(async () => {
    if (!user) return;
    setStatus("loading");
    try {
      const data = await fetchMyBusiness(await user.getIdToken());
      if (data) {
        setBusiness(data);
        setStatus("ready");
      } else {
        setStatus("notLinked");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (authLoading) {
    return <main className="dashboard dashboardCentered">Loading...</main>;
  }

  if (!user) return <BusinessLogin />;

  if (status === "loading") {
    return (
      <main className="dashboard dashboardCentered">
        Loading your dashboard...
      </main>
    );
  }

  if (status === "notLinked" || status === "error") {
    return (
      <main className="dashboard dashboardCentered">
        <section className="dashboardNotice">
          <h1 className="dashboardLoginTitle">
            {status === "notLinked"
              ? "This account isn't linked to a business"
              : "Couldn't load your dashboard"}
          </h1>
          <p className="dashboardMuted">
            {status === "notLinked"
              ? `You're signed in as ${user.email}. Sign in with the business account for your place, or contact us to get one linked.`
              : "Check your connection and try again."}
          </p>
          <footer className="dashboardActions">
            {status === "error" && (
              <button type="button" className="dashboardButton" onClick={load}>
                Try again
              </button>
            )}
            <button
              type="button"
              className="dashboardButton dashboardButtonQuiet"
              onClick={() => signOut(auth)}
            >
              Sign out
            </button>
          </footer>
        </section>
      </main>
    );
  }

  const location = [business.location?.city, business.location?.region]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="dashboard">
      <header className="dashboardHeader">
        <section>
          <h1 className="dashboardTitle">{business.name}</h1>
          <p className="dashboardMuted">
            {business.type === "activity" ? "Activity" : "Place"}
            {location ? `, ${location}` : ""}
          </p>
          <Link
            className="dashboardLink"
            to={`/Details/${business.type}/${business.id}`}
          >
            View public page
          </Link>
        </section>
        <button
          type="button"
          className="dashboardButton dashboardButtonQuiet"
          onClick={() => signOut(auth)}
        >
          Sign out
        </button>
      </header>

      <section className="dashboardRatings">
        <Rating
          label="Local endorsement"
          value={business.localRating}
          max={10}
          count={business.endorsements.length}
          countLabel="endorsement"
        />
        <Rating
          label="Tourist rating"
          value={business.touristRating}
          max={5}
          count={business.reviews.length}
          countLabel="review"
        />
      </section>

      <section className="dashboardSection">
        <h2 className="dashboardSectionTitle">Your details</h2>
        <BusinessForm
          key={business.id}
          business={business}
          getToken={getToken}
          onSaved={(updated) => setBusiness(updated)}
        />
      </section>

      <FeedbackList
        title="Reviews"
        items={business.reviews}
        emptyMessage="No reviews yet. They'll show up here as visitors leave them."
        renderItem={(review) => (
          <>
            <p className="dashboardFeedbackMeta">
              <strong>{review.rating}/5</strong>
              {review.visitDate ? ` visited ${review.visitDate}` : ""}
              {review.wouldRecommend
                ? `, recommend: ${review.wouldRecommend}`
                : ""}
            </p>
            <p>{review.review}</p>
            {review.createdAt && (
              <p className="dashboardMuted">{formatDate(review.createdAt)}</p>
            )}
          </>
        )}
      />

      <FeedbackList
        title="Local endorsements"
        items={business.endorsements}
        emptyMessage="No endorsements yet. Locals can endorse your place from its page."
        renderItem={(endorsement) => (
          <>
            <p className="dashboardFeedbackMeta">
              <strong>{endorsement.rating}/10</strong>
            </p>
            {endorsement.whyEndorse && <p>{endorsement.whyEndorse}</p>}
            {endorsement.culturalSensitivity && (
              <p className="dashboardMuted">
                Visitor notes: {endorsement.culturalSensitivity}
              </p>
            )}
            {endorsement.createdAt && (
              <p className="dashboardMuted">
                {formatDate(endorsement.createdAt)}
              </p>
            )}
          </>
        )}
      />
    </main>
  );
}

export default ManagerDashboardPage;
