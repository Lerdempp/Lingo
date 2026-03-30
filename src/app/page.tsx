"use client";

import styles from "./page.module.css";
import { useWords } from "@/hooks/useWords";
import { useProfile } from "@/hooks/useProfile";
import { 
  Bell, 
  Search, 
  TrendingUp, 
  Plus, 
  CheckCircle,
  BrainCircuit,
  LibraryBig,
  User,
  Settings,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const { words, isLoaded: wordsLoaded } = useWords();
  const { profile, isLoaded: profileLoaded } = useProfile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !wordsLoaded || !profileLoaded) {
    return <main className="container"><div className={styles.balanceLabel}>Yükleniyor...</div></main>;
  }

  const totalWords = words.length;
  const totalLearned = words.filter(w => w.correctAnswers > 2).length;
  
  // En son eklenen 3 işlemi (kelimeyi) alalım
  const recentWords = [...words]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);
    
  const isUrl = profile.avatarUrl.startsWith("http");

  return (
    <main className={`container ${styles.main}`}>
      
      {/* Profil & İkonlar */}
      <header className={styles.topHeader}>
        <Link href="/profile" className={styles.profileSection} aria-label="Profili Düzenle">
          <div className={styles.avatar}>
            {isUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : profile.avatarUrl ? (
              <span style={{ fontSize: "1.5rem" }}>{profile.avatarUrl}</span>
            ) : (
              <User size={24} color="#fff" />
            )}
          </div>
          <div className={styles.greeting}>
            <span className={styles.helloText}>Merhaba {profile.name}</span>
          </div>
        </Link>
        <div className={styles.iconGroup}>
          <Link href="/profile" className={styles.iconButton}>
            <Settings size={20} />
          </Link>
          <button className={styles.iconButton}>
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Ana Bakiye Görünümü (Total Words) */}
      <section className={styles.balanceSection}>
        <h2 className={styles.balanceLabel}>Toplam Kelime Haznesi</h2>
        <div className={styles.balanceAmount}>{totalWords}</div>
        <div className={styles.balanceTrend}>
          <TrendingUp size={14} className={styles.trendIcon} />
          <span className={styles.trendIcon}>+{totalLearned}</span> Öğrenilen
        </div>
      </section>

      {/* Quick Actions (4 Kare Buton) */}
      <section className={styles.actionStrip}>
        <Link href="/add" className={styles.actionItem}>
          <div className={styles.actionButton}>
            <Plus size={24} />
          </div>
          <span className={styles.actionLabel}>Ekle</span>
        </Link>
        <Link href="/list" className={styles.actionItem}>
          <div className={styles.actionButton}>
            <LibraryBig size={24} />
          </div>
          <span className={styles.actionLabel}>Listem</span>
        </Link>
        <Link href="/quiz" className={styles.actionItem}>
          <div className={styles.actionButton}>
            <BrainCircuit size={24} />
          </div>
          <span className={styles.actionLabel}>Quiz</span>
        </Link>
        <div className={styles.actionItem}>
          <div className={styles.actionButton}>
            <CheckCircle size={24} />
          </div>
          <span className={styles.actionLabel}>Başarı</span>
        </div>
      </section>

      {/* Son Eklenenler Listesi */}
      <section>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Son Eklenenler</h3>
          <Link href="/list" className={styles.viewAll}>Tümü</Link>
        </div>

        <div className={styles.listContainer}>
          {recentWords.length === 0 ? (
            <div className={styles.balanceLabel} style={{ textAlign: "center", padding: "20px 0" }}>
              Henüz kelime eklenmedi.
            </div>
          ) : (
            recentWords.map(word => {
              const dateObj = new Date(word.createdAt);
              const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              // Skor hesabına göre yeşil veya nötr gösterebiliriz.
              const score = word.correctAnswers - word.wrongAnswers;
              const isPositive = score > 0;

              return (
                <div key={word.id} className={styles.listItem}>
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon}>
                      <BookOpen size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemTitle}>{word.original}</span>
                      <span className={styles.itemSubtitle}>Bugün • {timeString}</span>
                    </div>
                  </div>
                  <div className={`${styles.itemScore} ${isPositive ? styles.scorePositive : styles.scoreNeutral}`}>
                    {score > 0 ? `+${score}` : `${score}`}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

    </main>
  );
}
