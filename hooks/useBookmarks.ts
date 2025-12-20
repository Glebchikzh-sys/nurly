
import { useState, useEffect, useCallback } from 'react';
import { Bookmark } from '../types';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nurly_bookmarks_data');
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse bookmarks", e);
    }
  }, []);

  // Sync to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('nurly_bookmarks_data', JSON.stringify(bookmarks));
    // Also keep the simple ID list for backward compatibility or lighter checks if needed
    const ids = bookmarks.map(b => b.id);
    localStorage.setItem('nurly_bookmarks', JSON.stringify(ids));
  }, [bookmarks]);

  const isBookmarked = useCallback((id: string) => {
    return bookmarks.some(b => b.id === id);
  }, [bookmarks]);

  const toggleBookmark = (bookmark: Bookmark) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.id === bookmark.id);
      if (exists) {
        return prev.filter(b => b.id !== bookmark.id);
      } else {
        return [bookmark, ...prev];
      }
    });
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark
  };
};
