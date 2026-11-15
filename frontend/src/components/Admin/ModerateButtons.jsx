import React, { useState } from "react";
import { setContentStatus, deleteContent } from "../../api/adminApi";
import "./ModerateButtons.css";

export default function ModerateButtons({
  collection,
  id,
  status,
  onChanged,
  compact = false,
}) {
  const [busy, setBusy] = useState(false);
  const current = status || "approved";

  const run = async (fn) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      onChanged?.();
    } catch (err) {
      console.error("Moderation failed:", err);
      alert(err.message || "Moderation action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`moderateButtons ${compact ? "moderateButtonsCompact" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {current !== "approved" && (
        <button
          className="moderateBtn approve"
          disabled={busy}
          onClick={() =>
            run(() => setContentStatus(collection, id, "approved"))
          }
        >
          Approve
        </button>
      )}
      {current !== "rejected" && (
        <button
          className="moderateBtn reject"
          disabled={busy}
          onClick={() =>
            run(() => setContentStatus(collection, id, "rejected"))
          }
        >
          Reject
        </button>
      )}
      {current !== "hidden" && (
        <button
          className="moderateBtn hide"
          disabled={busy}
          onClick={() => run(() => setContentStatus(collection, id, "hidden"))}
        >
          Hide
        </button>
      )}
      <button
        className="moderateBtn delete"
        disabled={busy}
        onClick={() => {
          if (window.confirm("Permanently delete this content?")) {
            run(() => deleteContent(collection, id));
          }
        }}
      >
        Delete
      </button>
    </div>
  );
}
