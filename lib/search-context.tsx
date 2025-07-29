"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearchChange: (search: string) => void;
  setSearchHandler: (handler: (search: string) => void) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    // Return a default implementation when not within SearchProvider
    return {
      searchTerm: "",
      setSearchTerm: () => {},
      onSearchChange: () => {},
      setSearchHandler: () => {}
    };
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchHandlerRef = useRef<((search: string) => void) | null>(null);

  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search);
    if (searchHandlerRef.current) {
      searchHandlerRef.current(search);
    }
  }, []);

  const setHandler = useCallback((handler: (search: string) => void) => {
    searchHandlerRef.current = handler;
  }, []);

  return (
    <SearchContext.Provider value={{ 
      searchTerm, 
      setSearchTerm, 
      onSearchChange: handleSearchChange,
      setSearchHandler: setHandler
    }}>
      {children}
    </SearchContext.Provider>
  );
}; 