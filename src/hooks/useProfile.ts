"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface UserProfile {
  name: string;
  avatarUrl: string; // Could be an emoji, or a URL to an image
  email: string;
  phone: string;
}

export function useProfile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile>({
    name: "Öğrenci",
    avatarUrl: "",
    email: "",
    phone: "",
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);

  // Load accounts on mount
  useEffect(() => {
    const saved = localStorage.getItem("lingo-accounts");
    if (saved) setAccounts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    async function loadProfile() {
      // If NOT logged in, clear state and local storage to prevent data leakage
      if (!session) {
        const defaultProfile = { name: "Öğrenci", avatarUrl: "", email: "", phone: "" };
        setProfile(defaultProfile);
        localStorage.removeItem("lingo-profile");
        setIsLoaded(true);
        return;
      }

      // If logged in, fetch from database (source of truth)
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const remoteProfile = await res.json();
          setProfile(remoteProfile);
          localStorage.setItem("lingo-profile", JSON.stringify(remoteProfile));
          
          // One-tap switcher: Generate/Refresh switch key
          let deviceId = localStorage.getItem("lingo-device-id");
          if (!deviceId) {
            deviceId = crypto.randomUUID();
            localStorage.setItem("lingo-device-id", deviceId);
          }

          if (session?.user?.name) {
            try {
              const ticketRes = await fetch("/api/auth/switch-ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deviceId }),
              });
              const { switchKey } = await ticketRes.json();
              
              addToAccountsList({
                username: session.user.name,
                displayName: remoteProfile.name,
                avatarUrl: remoteProfile.avatarUrl,
                switchKey // Store the key for later one-tap switch
              });
            } catch (e) {
              console.error("Failed to fetch switch ticket", e);
              addToAccountsList({
                username: session.user.name,
                displayName: remoteProfile.name,
                avatarUrl: remoteProfile.avatarUrl
              });
            }
          }
        } else {
          const saved = localStorage.getItem("lingo-profile");
          if (saved) setProfile(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to fetch remote profile", e);
      }
      setIsLoaded(true);
    }

    loadProfile();
  }, [session]);

  const addToAccountsList = (account: { username: string, displayName: string, avatarUrl: string, switchKey?: string }) => {
    const listJson = localStorage.getItem("lingo-accounts");
    let list = listJson ? JSON.parse(listJson) : [];
    
    // Remove if already exists to update with newest info
    list = list.filter((a: any) => a.username !== account.username);
    list.unshift(account); // Put latest at top
    
    // Limit to last 5 accounts
    const newList = list.slice(0, 5);
    localStorage.setItem("lingo-accounts", JSON.stringify(newList));
    setAccounts(newList);
  };

  const updateProfile = async (name: string, avatarUrl: string, email?: string, phone?: string) => {
    const newProfile = { name, avatarUrl, email: email || "", phone: phone || "" };
    setProfile(newProfile);
    localStorage.setItem("lingo-profile", JSON.stringify(newProfile));

    if (session) {
      try {
        await fetch("/api/user/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProfile),
        });
      } catch (e) {
        console.error("Failed to sync profile to server", e);
      }
    }
  };

  return { profile, updateProfile, isLoaded, accounts };
}

