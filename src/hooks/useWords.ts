"use client";

import { useState, useEffect, useCallback } from "react";
import { Word } from "@/types";
import { useSession } from "next-auth/react";

export function useWords() {
  const { data: session, status } = useSession();
  const [words, setWords] = useState<Word[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load words
  useEffect(() => {
    async function loadWords() {
      if (status === "loading") return;

      if (session) {
        // Logged in: Fetch from API
        try {
          setIsSyncing(true);
          const res = await fetch("/api/words");
          const data = await res.json();
          if (data.words) {
            setWords(data.words);

            // One-time migration: if we have local words, sync them to cloud
            const local = localStorage.getItem("lingo-words");
            if (local) {
              const localWords = JSON.parse(local);
              if (localWords.length > 0) {
                // Bulk push local words to cloud
                await fetch("/api/words", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(localWords),
                });
                // Clear local storage after sync
                localStorage.removeItem("lingo-words");
                // Refresh cloud words
                const refreshRes = await fetch("/api/words");
                const refreshData = await refreshRes.json();
                setWords(refreshData.words);
              }
            }
          }
        } catch (e) {
          console.error("Failed to fetch words from API", e);
        } finally {
          setIsSyncing(false);
          setIsLoaded(true);
        }
      } else {
        // Not logged in: Load from local storage
        const saved = localStorage.getItem("lingo-words");
        if (saved) {
          try {
            setWords(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to parse words from local storage", e);
          }
        }
        setIsLoaded(true);
      }
    }

    loadWords();
  }, [session, status]);

  // Save to local storage for guests
  useEffect(() => {
    if (isLoaded && !session) {
      localStorage.setItem("lingo-words", JSON.stringify(words));
    }
  }, [words, isLoaded, session]);

  const addWord = async (word: Omit<Word, "id" | "createdAt" | "correctAnswers" | "wrongAnswers">) => {
    const id = crypto.randomUUID();
    const newWord: Word = {
      ...word,
      id,
      createdAt: Date.now(),
      correctAnswers: 0,
      wrongAnswers: 0,
    };

    setWords((prev) => [newWord, ...prev]);

    if (session) {
      try {
        await fetch("/api/words", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...word, id }),
        });
      } catch (e) {
        console.error("Failed to save word to backend", e);
      }
    }

    return newWord;
  };

  const removeWord = async (id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));

    if (session) {
      try {
        await fetch(`/api/words?id=${id}`, {
          method: "DELETE",
        });
      } catch (e) {
        console.error("Failed to delete word from backend", e);
      }
    }
  };

  const updateWordStats = async (id: string, isCorrect: boolean) => {
    setWords((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          return {
            ...w,
            correctAnswers: isCorrect ? w.correctAnswers + 1 : w.correctAnswers,
            wrongAnswers: !isCorrect ? w.wrongAnswers + 1 : w.wrongAnswers,
          };
        }
        return w;
      })
    );

    if (session) {
      try {
        await fetch("/api/words", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, isCorrect }),
        });
      } catch (e) {
        console.error("Failed to update word stats on backend", e);
      }
    }
  };

  return { words, addWord, removeWord, updateWordStats, isLoaded, isSyncing };
}

