import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import LocationCard from "../../components/LocationCard/LocationCard";
import { getBookmarks } from "../../../api/bookmarksApi";
import { fetchPlace } from "../../../api/placesApi";
import { fetchActivity } from "../../../api/activitiesApi";
import "./BookmarksPage.css";

export function BookmarksPage() {
  const [user, authLoading] = useAuthState(auth);
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    if (!user?.uid) {
      setBookmarkedItems([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const bookmarks = await getBookmarks(user.uid);

      const items = await Promise.all(
        bookmarks.map(async (bookmark) => {
          const [type, id] = (bookmark.itemId || "").split("/");
          if (!type || !id) return null;

          try {
            const data =
              type === "place" ? await fetchPlace(id) : await fetchActivity(id);
            return {
              ...data,
              type,
              itemPath: bookmark.itemId,
              bookmarkId: bookmark.id,
            };
          } catch (err) {
            console.error(
              "❌ Failed to resolve bookmarked item:",
              bookmark,
              err,
            );
            return null;
          }
        }),
      );

      setBookmarkedItems(items.filter(Boolean));
    } catch (error) {
      console.error("❌ Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleBookmarkChange = (itemPath, bookmarkId) => {
    if (!bookmarkId) {
      setBookmarkedItems((prev) =>
        prev.filter((item) => item.itemPath !== itemPath),
      );
    }
  };

  const renderContent = () => {
    if (authLoading || loading) {
      return (
        <section className="bookmarksStateBox">
          <p className="bookmarksStateText">Gathering your saved places…</p>
        </section>
      );
    }

    if (!user) {
      return (
        <section className="bookmarksStateBox">
          <span className="bookmarksStateIconWrapper" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              width="28"
              height="28"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                   2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                   C13.09 3.81 14.76 3 16.5 3
                   19.58 3 22 5.42 22 8.5
                   c0 3.78-3.4 6.86-8.55 11.18L12 21z"
              />
            </svg>
          </span>
          <h2 className="bookmarksStateTitle">Log In to See Your Saves</h2>
          <p className="bookmarksStateText">
            Your saved places and experiences live here once you're signed in.
          </p>
          <Link to="/about" className="bookmarksStateButton">
            Go to Login
          </Link>
        </section>
      );
    }

    if (bookmarkedItems.length === 0) {
      return (
        <section className="bookmarksStateBox">
          <span className="bookmarksStateIconWrapper" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              width="28"
              height="28"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                   2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                   C13.09 3.81 14.76 3 16.5 3
                   19.58 3 22 5.42 22 8.5
                   c0 3.78-3.4 6.86-8.55 11.18L12 21z"
              />
            </svg>
          </span>
          <h2 className="bookmarksStateTitle">Nothing Tucked Away Yet</h2>
          <p className="bookmarksStateText">
            Every great journey starts with a first save. Go find a place or
            experience worth remembering.
          </p>
          <Link to="/" className="bookmarksStateButton">
            Start Exploring
          </Link>
        </section>
      );
    }

    return (
      <section className="bookmarksGrid">
        {bookmarkedItems.map((item) => (
          <LocationCard
            key={item.itemPath}
            {...item}
            userId={user.uid}
            itemPath={item.itemPath}
            bookmarkId={item.bookmarkId}
            onBookmarkChange={handleBookmarkChange}
            onClick={() => {}}
          />
        ))}
      </section>
    );
  };

  return (
    <main className="bookmarksPage">
      <header className="bookmarksHero">
        <section className="bookmarksHeroInner">
          <b className="bookmarksHeroStamp">Your Collection</b>
          <h1 className="bookmarksHeroTitle">
            Saved <i className="bookmarksHeroTitleItalic">Treasures</i>
          </h1>
          <p className="bookmarksHeroTagline">
            The places and experiences you've set aside to revisit, share, or
            simply dream about.
          </p>
        </section>
      </header>

      <section className="bookmarksBody">
        <header className="bookmarksBodyHeader">
          <h2 className="bookmarksBodyTitle">
            {user && !loading
              ? `${bookmarkedItems.length} Saved ${
                  bookmarkedItems.length === 1 ? "Item" : "Items"
                }`
              : "Your Saved List"}
          </h2>
          <hr className="bookmarksBodyDivider" />
        </header>
        {renderContent()}
      </section>
    </main>
  );
}

export default BookmarksPage;
