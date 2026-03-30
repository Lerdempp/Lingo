"use client";

import { useState, useEffect } from "react";
import { Word } from "@/types";

export function useWords() {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("lingo-words");
    if (saved) {
      try {
        setWords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse words from local storage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever words change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("lingo-words", JSON.stringify(words));
    }
  }, [words, isLoaded]);

  const addWord = (word: Omit<Word, "id" | "createdAt" | "correctAnswers" | "wrongAnswers">) => {
    const newWord: Word = {
      ...word,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      correctAnswers: 0,
      wrongAnswers: 0,
    };
    setWords((prev) => [newWord, ...prev]);
    return newWord;
  };

  const removeWord = (id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWordStats = (id: string, isCorrect: boolean) => {
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
  };

  return { words, addWord, removeWord, updateWordStats, isLoaded };
}
