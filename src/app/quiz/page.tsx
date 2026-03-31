"use client";

import { useWords } from "@/hooks/useWords";
import { useEffect, useState, useMemo } from "react";
import styles from "./page.module.css";
import { 
  X, 
  Check, 
  BrainCircuit, 
  Trophy, 
  RotateCcw, 
  ArrowLeft,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import { Word } from "@/types";

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface QuizQuestion {
  word: Word;
  options: string[];
  correctAnswer: string;
}

export default function Quiz() {
  const { words, updateWordStats, isLoaded } = useWords();
  const [mounted, setMounted] = useState(false);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize quiz questions
  useEffect(() => {
    if (isLoaded && words.length >= 4 && questions.length === 0 && !isCompleted) {
      // Prioritize words that need practice
      const sortedByNeed = [...words].sort((a, b) => {
        const scoreA = a.correctAnswers - a.wrongAnswers * 2;
        const scoreB = b.correctAnswers - b.wrongAnswers * 2;
        return scoreA - scoreB;
      });
      
      const selectedWords = sortedByNeed.slice(0, 10);
      
      const newQuestions = selectedWords.map(word => {
        // Find 3 random wrong translations
        const otherWords = words.filter(w => w.id !== word.id);
        const shuffledOthers = shuffle(otherWords);
        const wrongOptions = shuffledOthers.slice(0, 3).map(w => w.translation);
        
        return {
          word,
          options: shuffle([word.translation, ...wrongOptions]),
          correctAnswer: word.translation
        };
      });
      
      setQuestions(shuffle(newQuestions));
    }
  }, [isLoaded, words, questions.length, isCompleted]);

  if (!mounted || !isLoaded) {
    return <main className={styles.main}><div className="flex items-center justify-center h-full">Yükleniyor...</div></main>;
  }

  if (words.length < 4) {
    return (
      <main className={styles.main}>
        <div className={styles.centeredState}>
          <BrainCircuit size={80} className={styles.stateIcon} />
          <h2 className={styles.completedTitle}>Yeterli Kelime Yok</h2>
          <p className={styles.completedText}>Quiz yapabilmek için en az 4 kelime eklemelisin.</p>
          <Link href="/add" className={styles.browseBtn}>
            Kelime Ekle
          </Link>
        </div>
      </main>
    );
  }

  if (isCompleted) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <main className={styles.main}>
        <div className={styles.centeredState}>
          <Trophy size={100} className={styles.stateIcon} />
          <h1 className={styles.completedTitle}>Harika İştir!</h1>
          <p className={styles.completedText}>Testi başarıyla tamamladın. İşte performansın:</p>
          
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Doğru</span>
              <span className={styles.statValue} style={{ color: "#34C759" }}>{score}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Başarı</span>
              <span className={styles.statValue}>{accuracy}%</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Toplam</span>
              <span className={styles.statValue}>{questions.length}</span>
            </div>
          </div>

          <div className={styles.resultActions}>
            <button 
              className={styles.restartBtn}
              onClick={() => {
                setIsCompleted(false);
                setQuestions([]);
                setCurrentIndex(0);
                setSelectedOption(null);
                setScore(0);
              }}
            >
              Tekrar Dene
            </button>
            <Link href="/" className={styles.homeLink}>
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return; // Prevent double click
    
    setSelectedOption(option);
    const isCorrect = option === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Update permanent stats in DB
    updateWordStats(currentQuestion.word.id, isCorrect);
    
    // Show feedback and move next after a delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setIsCompleted(true);
      }
    }, 1200);
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <GraduationCap size={14} />
            <span>Pratik Yap</span>
          </div>
        </div>
        
        <div className={styles.progressText}>
          <span>Soru {currentIndex + 1}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className={styles.questionSection}>
        <div className={styles.wordCard}>
          <div className={styles.cardGlow} />
          <h2 className={styles.originalWord}>{currentQuestion.word.original}</h2>
          {currentQuestion.word.exampleSentence && (
            <p className={styles.exampleText}>"{currentQuestion.word.exampleSentence}"</p>
          )}
        </div>

        <div className={styles.optionsGrid}>
          {currentQuestion.options.map((option, idx) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = selectedOption === option;
            
            let optionClass = styles.optionBtn;
            if (selectedOption) {
              if (isCorrect) optionClass += ` ${styles.correctOption}`;
              else if (isSelected) optionClass += ` ${styles.wrongOption}`;
            }

            return (
              <button
                key={idx}
                className={optionClass}
                onClick={() => handleOptionSelect(option)}
                disabled={!!selectedOption}
              >
                <span>{option}</span>
                {selectedOption && isCorrect && <Check size={20} className="text-green-500" />}
                {selectedOption && isSelected && !isCorrect && <X size={20} className="text-red-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
