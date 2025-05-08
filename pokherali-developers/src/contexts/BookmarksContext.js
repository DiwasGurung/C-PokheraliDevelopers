import React, { createContext, useState, useContext } from "react";

// Create BookmarksContext
export const BookmarksContext = createContext();

export const BookmarksProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);

  const addBookmark = (book) => {
    setBookmarks((prevBookmarks) => [...prevBookmarks, book]);
  };

  const removeBookmark = (bookId) => {
    setBookmarks((prevBookmarks) => prevBookmarks.filter((book) => book.id !== bookId));
  };

  return (
    <BookmarksContext.Provider value={{ bookmarks, addBookmark, removeBookmark }}>
      {children}
    </BookmarksContext.Provider>
  );
};
