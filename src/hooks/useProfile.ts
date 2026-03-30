"use client";

import { useState, useEffect } from "react";

export interface UserProfile {
  name: string;
  avatarUrl: string; // Could be an emoji, or a URL to an image
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "Öğrenci",
    avatarUrl: "", // Default empty means we show the User icon
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lingo-profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    } else {
      // First time user default could be anything else
      setProfile({ name: "Gizli Kahraman", avatarUrl: "" });
    }
    setIsLoaded(true);
  }, []);

  const updateProfile = (name: string, avatarUrl: string) => {
    const newProfile = { name, avatarUrl };
    setProfile(newProfile);
    localStorage.setItem("lingo-profile", JSON.stringify(newProfile));
  };

  return { profile, updateProfile, isLoaded };
}
