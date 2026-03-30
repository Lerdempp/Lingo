"use client";

import { useState } from "react";
import { useWords } from "@/hooks/useWords";
import { PlusCircle } from "lucide-react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function AddWord() {
  const { addWord } = useWords();
  const router = useRouter();
  
  const [original, setOriginal] = useState("");
  const [translation, setTranslation] = useState("");
  const [example, setExample] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!original.trim() || !translation.trim()) return;

    addWord({
      original: original.trim(),
      translation: translation.trim(),
      exampleSentence: example.trim(),
    });

    setOriginal("");
    setTranslation("");
    setExample("");

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <main className={`container ${styles.main}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Yeni <span className="text-gradient">Kelime</span></h1>
        <p className="subtitle">Öğrendiğin yeni bir kelimeyi listene ekle.</p>
      </header>

      {showSuccess && (
        <div className={styles.successMessage}>
          Kelime başarıyla eklendi! 🎉
        </div>
      )}

      <form onSubmit={handleSubmit} className={`glass-panel ${styles.formCard}`}>
        <div className={styles.formGroup}>
          <label htmlFor="original" className={styles.label}>Yabancı Kelime</label>
          <input
            id="original"
            type="text"
            className={styles.input}
            placeholder="Örn: Serendipity"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            required
            autoComplete="off"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="translation" className={styles.label}>Türkçe Çevirisi</label>
          <input
            id="translation"
            type="text"
            className={styles.input}
            placeholder="Örn: Şans eseri bulma"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            required
            autoComplete="off"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="example" className={styles.label}>Örnek Cümle (İsteğe Bağlı)</label>
          <input
            id="example"
            type="text"
            className={styles.input}
            placeholder="Kelimeti cümle içinde kullan..."
            value={example}
            onChange={(e) => setExample(e.target.value)}
            autoComplete="off"
          />
        </div>

        <button type="submit" className={styles.submitBtn}>
          <PlusCircle size={24} />
          <span>Ekle</span>
        </button>
      </form>
    </main>
  );
}
