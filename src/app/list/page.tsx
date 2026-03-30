"use client";

import { useWords } from "@/hooks/useWords";
import styles from "./page.module.css";
import { Trash2, LibraryBig } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WordList() {
  const { words, removeWord, isLoaded } = useWords();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return <main className="container"><header className={styles.header}>Yükleniyor...</header></main>;
  }

  return (
    <main className={`container ${styles.main}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Kelime <span className="text-gradient">Listem</span>
        </h1>
        <p className={styles.subtitle}>
          Eklediğin tüm kelimeleri görüntüle ve yönet.
        </p>
      </header>

      {words.length === 0 ? (
        <div className={styles.emptyState}>
          <LibraryBig size={64} className={styles.emptyIcon} />
          <h2>Listen Henüz Boş</h2>
          <p>Hemen yeni kelimeler ekleyerek öğrenmeye başla.</p>
          <Link href="/add" className={styles.browseBtn}>
            Kelime Ekle
          </Link>
        </div>
      ) : (
        <div className={styles.wordList}>
          {words.map((word) => (
            <div key={word.id} className={`glass-panel ${styles.wordCard}`}>
              <div className={styles.wordInfo}>
                <span className={styles.original}>{word.original}</span>
                <span className={styles.translation}>{word.translation}</span>
                {word.exampleSentence && (
                  <span className={styles.example}>"{word.exampleSentence}"</span>
                )}
              </div>
              
              <div className={styles.actions}>
                <div className={styles.stats}>
                  <span className={styles.statCorrect}>✓ {word.correctAnswers}</span>
                  <span className={styles.statWrong}>✗ {word.wrongAnswers}</span>
                </div>
                <button 
                  onClick={() => removeWord(word.id)}
                  className={styles.deleteBtn}
                  aria-label="Sil"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
