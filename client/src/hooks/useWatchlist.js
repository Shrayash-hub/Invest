import { useState, useEffect, useCallback } from "react";
import { databases, DATABASE_ID, WATCHLIST_COLLECTION_ID } from "../lib/appwrite.js";
import { ID, Query } from "appwrite";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Appwrite-backed watchlist hook.
 * Scopes all documents to the currently authenticated user.
 * Interface is identical to a localStorage-backed hook so UI components are unchanged.
 *
 * @returns {{ watchlist: Array, loading: boolean, addToWatchlist: Function, removeFromWatchlist: Function }}
 */
export function useWatchlist() {
  const { currentUser } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all watchlist documents for this user
  const fetchWatchlist = useCallback(async () => {
    if (!currentUser) {
      setWatchlist([]);
      return;
    }
    setLoading(true);
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        WATCHLIST_COLLECTION_ID,
        [Query.orderDesc("$createdAt")]
      );
      setWatchlist(res.documents);
    } catch (err) {
      console.error("[Watchlist] Failed to fetch:", err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  /**
   * Add a company to the watchlist.
   * @param {{ companyName: string, ticker: string, exchange?: string, verdict?: string, confidenceScore?: number }} item
   */
  const addToWatchlist = useCallback(async (item) => {
    if (!currentUser) return;

    // Optimistically add to state
    const tempDoc = { $id: `temp-${Date.now()}`, ...item, userId: currentUser.$id };
    setWatchlist((prev) => [tempDoc, ...prev]);

    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        WATCHLIST_COLLECTION_ID,
        ID.unique(),
        {
          companyId: item.ticker || item.companyName, 
          symbol: item.ticker || "", 
          companyName: item.companyName,
          exchange: item.exchange ?? "",
          verdict: item.verdict ?? "",
          confidenceScore: item.confidenceScore ?? 0,
        }
      );
      // Replace temp entry with the real document
      setWatchlist((prev) => prev.map((d) => (d.$id === tempDoc.$id ? doc : d)));
    } catch (err) {
      console.error("[Watchlist] Failed to add:", err.message);
      // Roll back the optimistic update
      setWatchlist((prev) => prev.filter((d) => d.$id !== tempDoc.$id));
    }
  }, [currentUser]);

  /**
   * Remove a company from the watchlist by its Appwrite document ID.
   * @param {string} documentId
   */
  const removeFromWatchlist = useCallback(async (documentId) => {
    // Optimistically remove
    setWatchlist((prev) => prev.filter((d) => d.$id !== documentId));
    try {
      await databases.deleteDocument(DATABASE_ID, WATCHLIST_COLLECTION_ID, documentId);
    } catch (err) {
      console.error("[Watchlist] Failed to remove:", err.message);
      // Re-fetch to restore state on error
      fetchWatchlist();
    }
  }, [fetchWatchlist]);

  return { watchlist, loading, addToWatchlist, removeFromWatchlist };
}
