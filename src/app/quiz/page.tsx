"use client";

import { useWords } from "@/hooks/useWords";
import { useEffect, useState, useRef, useCallback } from "react";
import styles from "./page.module.css";
import { 
  X, 
  Check, 
  BrainCircuit, 
  Trophy, 
  RotateCcw, 
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Type,
  HelpCircle,
  Settings2,
  Play
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

export default function Quiz() {
  const { words, updateWordStats, isLoaded } = useWords();
  const [mounted, setMounted] = useState(false);
  
  // Setup State
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [config, setConfig] = useState({
    count: 10,
    mode: "mixed" as "mixed" | "recent"
  });

  const [questions, setQuestions] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Typing State
  const [userInput, setUserInput] = useState("");
  const [hintCount, setHintCount] = useState(0);
  const [status, setStatus] = useState<"typing" | "correct" | "wrong">("typing");
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startQuiz = () => {
    let pool = [...words];

    // Mode selection
    if (config.mode === "recent") {
      pool.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      pool = shuffle(pool);
    }

    // Record count
    const selected = pool.slice(0, config.count === -1 ? words.length : config.count);
    
    setQuestions(selected);
    setIsConfiguring(false);
    setCurrentIndex(0);
    setUserInput("");
    setScore(0);
    setIsCompleted(false);
    setStatus("typing");
  };

  const handleCheck = useCallback(() => {
    if (status !== "typing" || questions.length === 0) return;
    const currentWord = questions[currentIndex];

    const isCorrect = userInput.trim().toLocaleLowerCase("tr-TR") === currentWord.translation.toLocaleLowerCase("tr-TR");

    if (isCorrect) {
      setStatus("correct");
      setScore(prev => prev + 1);
    } else {
      setStatus("wrong");
    }

    updateWordStats(currentWord.id, isCorrect);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setUserInput("");
        setHintCount(0);
        setStatus("typing");
        inputRef.current?.focus();
      } else {
        setIsCompleted(true);
      }
    }, 2000);
  }, [status, questions, userInput, currentIndex, updateWordStats]);

  const handleHint = () => {
    const currentWord = questions[currentIndex];
    if (!currentWord || status !== "typing") return;
    if (hintCount < currentWord.translation.length) {
      const nextChar = currentWord.translation[hintCount];
      setUserInput(prev => prev + nextChar);
      setHintCount(prev => prev + 1);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (mounted && !isConfiguring && !isCompleted && questions.length > 0) {
      inputRef.current?.focus();
    }
  }, [mounted, isConfiguring, isCompleted, currentIndex, questions.length]);

  if (!mounted || !isLoaded) {
    return <main className={styles.main}><div className="flex items-center justify-center h-full">Yükleniyor...</div></main>;
  }

  if (words.length === 0) {
    return (
      <main className={styles.main}>
        <div className={styles.centeredState}>
          <BrainCircuit size={80} className={styles.stateIcon} />
          <h2 className={styles.completedTitle}>Kelime Yok</h2>
          <p className={styles.completedText}>Önce birkaç kelime eklemelisin.</p>
          <Link href="/add" className={styles.browseBtn}>
            Kelime Ekle
          </Link>
        </div>
      </main>
    );
  }

  // Configuration Screen
  if (isConfiguring) {
    return (
      <main className={styles.main}>
        <header className={styles.header}>
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div className="flex items-center gap-2 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Settings2 size={14} />
              <span>Quiz Ayarları</span>
            </div>
          </div>
          <h1 className={styles.title}>Quizi Hazırla</h1>
        </header>

        <div className={styles.questionSection}>
          <div className={styles.setupCard}>
            <div className={styles.configSection}>
              <div className={styles.configGroup}>
                <h3>Soru Sayısı</h3>
                <div className={styles.optionGrid}>
                  {[5, 10, 20, -1].map(n => (
                    <button 
                      key={n}
                      className={`${styles.configOption} ${config.count === n ? styles.optionActive : ""}`}
                      onClick={() => setConfig(prev => ({ ...prev, count: n }))}
                    >
                      {n === -1 ? "Hepsi" : `${n} Soru`}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.configGroup}>
                <h3>Soru Modu</h3>
                <div className={styles.optionGrid}>
                  <button 
                    className={`${styles.configOption} ${config.mode === "mixed" ? styles.optionActive : ""}`}
                    onClick={() => setConfig(prev => ({ ...prev, mode: "mixed" }))}
                  >
                    Karışık
                  </button>
                  <button 
                    className={`${styles.configOption} ${config.mode === "recent" ? styles.optionActive : ""}`}
                    onClick={() => setConfig(prev => ({ ...prev, mode: "recent" }))}
                  >
                    Son Eklenenler
                  </button>
                </div>
              </div>
            </div>

            <button className={styles.startBtn} onClick={startQuiz}>
              <span>Quizi Başlat</span>
              <Play size={20} fill="currentColor" />
            </button>
          </div>
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
          <h1 className={styles.completedTitle}>Bravo!</h1>
          <p className={styles.completedText}>Testi başarıyla tamamladın.</p>
          
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
              onClick={() => setIsConfiguring(true)}
            >
              Yeni Test Başlat
            </button>
            <Link href="/" className={styles.homeLink}>
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentWord = questions[currentIndex];
  if (!currentWord) return null;

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setIsConfiguring(true)} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Type size={14} />
            <span>Yazma Testi</span>
          </div>
        </div>
        
        <div className={styles.progressText}>
          <span>Kelime {currentIndex + 1} / {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressBar} style={{ width: `${progress}%`, background: "linear-gradient(90deg, #A855F7, #EC4899)" }} />
        </div>
      </header>

      <div className={styles.questionSection}>
        <div className={styles.wordCard}>
          <div className={styles.cardGlow} style={{ background: "radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)" }} />
          <h2 className={styles.originalWord}>{currentWord.original}</h2>
          {currentWord.exampleSentence && (
            <p className={styles.exampleText}>"{currentWord.exampleSentence}"</p>
          )}
        </div>

        <div className={styles.typingSection}>
          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              className={`${styles.typingInput} ${status === "correct" ? styles.correctInput : ""} ${status === "wrong" ? styles.wrongInput : ""}`}
              placeholder="Çeviriyi yazın..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              disabled={status !== "typing"}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            {status === "correct" && <Check className={styles.statusIcon} style={{ color: "#34C759" }} />}
            {status === "wrong" && <X className={styles.statusIcon} style={{ color: "#FF3B30" }} />}
          </div>

          <div className={styles.typingActions}>
            <button 
              className={styles.hintBtn}
              onClick={handleHint}
              disabled={status !== "typing"}
            >
              <HelpCircle size={20} />
              <span>İpucu Al</span>
            </button>
            <button 
              className={styles.checkBtn}
              onClick={handleCheck}
              disabled={!userInput.trim() || status !== "typing"}
              style={{ background: "linear-gradient(135deg, #A855F7, #EC4899)" }}
            >
              <span>Onayla</span>
              <Sparkles size={18} />
            </button>
          </div>
          
          {status === "wrong" && (
            <div className={styles.correctAnswerLabel}>
              Doğru Cevap: <strong>{currentWord.translation}</strong>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
