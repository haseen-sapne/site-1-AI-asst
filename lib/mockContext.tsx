'use client';

import React, { createContext, useContext, useState, ReactNode } from "react";
import { MOCK_PROFILES, MockProfile } from "./mockProfiles";

interface MockContextType {
  activeProfile: MockProfile;
  profiles: MockProfile[];
  setActiveProfile: (profile: MockProfile) => void;
  setProfileById: (id: number) => void;
}

const MockContext = createContext<MockContextType | undefined>(undefined);

export function MockProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<MockProfile>(MOCK_PROFILES[0]);

  const setProfileById = (id: number) => {
    const found = MOCK_PROFILES.find((p) => p.id === id);
    if (found) {
      setActiveProfile(found);
    }
  };

  return (
    <MockContext.Provider
      value={{
        activeProfile,
        profiles: MOCK_PROFILES,
        setActiveProfile,
        setProfileById,
      }}
    >
      {children}
    </MockContext.Provider>
  );
}

export function useMockProfile() {
  const context = useContext(MockContext);
  if (!context) {
    throw new Error("useMockProfile must be used within a MockProfileProvider");
  }
  return context;
}
