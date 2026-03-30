"use client";

import { useWords } from "@/hooks/useWords";
import { useEffect, useState, useMemo } from "react";
import styles from "./page.module.css";
import { XCircle, CheckCircle, BrainCircuit, Trophy, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Word } from "@/types";

// Fisher-Yates shuffle
function shuffle(array: Word[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function Quiz() {
  const { words, updateWordStats, isLoaded } = useWords();
  const [mounted, setMounted] = useState(false);
  
  const [quizQueue, setQuizQueue] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize quiz queue when words are loaded
  useEffect(() => {
    if (isLoaded && words.length > 0 && quizQueue.length === 0 && !isCompleted) {
      // Prioritize words with more mistakes or less correct answers
      const sortedByNeed = [...words].sort((a, b) => {
        const scoreA = a.correctAnswers - a.wrongAnswers * 2;
        const scoreB = b.correctAnswers - b.wrongAnswers * 2;
        return scoreA - scoreB;
      });
      
      // Take top 10 words that need practice, or all if less than 10, then shuffle
      const selectedForQuiz = shuffle(sortedByNeed.slice(0, 10));
      setQuizQueue(selectedForQuiz);
    }
  }, [isLoaded, words, quizQueue.length, isCompleted]);

  if (!mounted || !isLoaded) {
    return <main className={`container ${styles.main}`}>Yükleniyor...</main>;
  }

  if (words.length === 0) {
    return (
      <main className={`container ${styles.main}`}>
        <div className={styles.emptyState}>
          <BrainCircuit size={64} className={styles.emptyIcon} />
          <h2>Test Edecek Kelime Yok</h2>
          <p>Quiz yapabilmek için önce birkaç kelime eklemelisin.</p>
          <Link href="/add" className={styles.browseBtn}>
            Kelime Ekle
          </Link>
        </div>
      </main>
    );
  }

  if (isCompleted) {
    return (
      <main className={`container ${styles.main}`}>
        <div className={styles.completedState}>
          <Trophy size={80} className={styles.trophyIcon} />
          <h2>Quiz Tamamlandı!</h2>
          <p>Harika iş çıkardın. Kelime hazneni geliştirmeye devam et.</p>
          <button 
            className={styles.restartBtn}
            onClick={() => {
              setIsCompleted(false);
              setQuizQueue([]);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <RotateCcw size={20} />
              <span>Tekrar Başla</span>
            </div>
          </button>
        </div>
      </main>
    );
  }

  const currentWord = quizQueue[currentIndex];

  if (!currentWord) return null; // Safe guard

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (isCorrect: boolean) => {
    // Update stats
    updateWordStats(currentWord.id, isCorrect);
    
    // Move to next word or end quiz
    if (currentIndex < quizQueue.length - 1) {
      setIsFlipped(false);
      // Small delay to let card flip back before rendering new word
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 150);
    } else {
      setIsCompleted(true);
    }
  };

  return (
    <main className={`container ${styles.main}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Quiz <span className="text-gradient">Zamanı</span></h1>
        <p className={styles.progress}>{currentIndex + 1} / {quizQueue.length}</p>
      </header>

      <div className={styles.cardContainer} onClick={handleFlip}>
        <div className={`${styles.card} ${isFlipped ? styles.isFlipped : ""}`}>
          <div className={`${styles.cardFace} ${styles.cardFront}`}>
            <span className={styles.cardOriginal}>{currentWord.original}</span>
            <span className={styles.hint}>Çeviriyi görmek için dokun</span>
          </div>
          <div className={`${styles.cardFace} ${styles.cardBack}`}>
            <span className={styles.backHint}>Çeviri</span>
            <span className={styles.cardTranslation}>{currentWord.translation}</span>
            {currentWord.exampleSentence && (
              <span className={styles.cardExample}>"{currentWord.exampleSentence}"</span>
            )}
          </div>
        </div>
      </div>

      {isFlipped && (
        <div className={styles.actions}>
          <button 
            className={`${styles.actionBtn} ${styles.wrongBtn}`}
            onClick={(e) => { e.stopPropagation(); handleAnswer(false); }}
          >
            <XCircle size={24} />
            <span>Bilmedim</span>
          </button>
          <button 
            className={`${styles.actionBtn} ${styles.correctBtn}`}
            onClick={(e) => { e.stopPropagation(); handleAnswer(true); }}
          >
            <CheckCircle size={24} />
            <span>Bildi</span>
          </button>
        </div>
      )}
    </main>
  );
}
