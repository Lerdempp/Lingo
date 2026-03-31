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
  BookOpen,
  LogIn,
  UserPlus,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const { words, isLoaded: wordsLoaded, isSyncing } = useWords();
  const { profile, isLoaded: profileLoaded, accounts } = useProfile();
  const [mounted, setMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

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
    
  const isUrl = profile.avatarUrl.startsWith("http") || profile.avatarUrl.startsWith("data:image");
  const displayName = profile.name || session?.user?.name || "Öğrenci";

  const handleSwitchAccount = async (account: any) => {
    if (account.username === session?.user?.name) return;
    
    setIsSwitching(true);

    // If we have a switchKey, try one-tap login
    if (account.switchKey) {
      try {
        await signOut({ redirect: false });
        const result = await signIn("credentials", {
          username: account.username,
          switchKey: account.switchKey,
          redirect: false,
        });

        if (!result?.error) {
          window.location.reload();
          return;
        }
        console.warn("One-tap switch failed, falling back to login:", result?.error);
      } catch (err) {
        console.error("One-tap switch error:", err);
      }
    }
    
    // Normal fallback: Sign out then redirect to login with pre-fill
    await signOut({ redirect: false });
    window.location.href = `/login?username=${account.username}`;
  };

  const handleAddAccount = async () => {
    await signOut({ redirect: false });
    window.location.href = "/register";
  };

  return (
    <main className={`container ${styles.main}`}>
      
      {/* Profil & İkonlar */}
      <header className={styles.topHeader}>
        <div className={styles.profileSection}>
          <Link href="/profile" className={styles.avatar} aria-label="Profil">
            {isUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : profile.avatarUrl ? (
              <span style={{ fontSize: "1.5rem" }}>{profile.avatarUrl}</span>
            ) : (
              <User size={24} color="#fff" />
            )}
          </Link>
          <div className={styles.greeting}>
            <span className={styles.helloText}>Merhaba {displayName}</span>
            {isSyncing && <span className="text-[10px] text-blue-400 animate-pulse ml-2">Senkronize ediliyor...</span>}
          </div>
        </div>
        <div className={styles.iconGroup}>
          <button 
            onClick={() => setShowSettings(true)} 
            className={styles.iconButton}
            title="Ayarlar"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <>
          <div className={styles.overlay} onClick={() => setShowSettings(false)} />
          <div className={styles.settingsModal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Ayarlar</h2>
              <button className={styles.closeButton} onClick={() => setShowSettings(false)}>
                <Plus size={24} style={{ transform: "rotate(45deg)" }} />
              </button>
            </div>
            
            <div className={styles.userInfo}>
              <div className={styles.userCard}>
                <div className={styles.modalAvatar}>
                  {isUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : profile.avatarUrl ? (
                    profile.avatarUrl
                  ) : (
                    <User size={24} color="#fff" />
                  )}
                </div>
                <div className={styles.userMeta}>
                  <span className={styles.userName}>{displayName}</span>
                  <span className={styles.userEmail}>@{session?.user?.name || "misafir"}</span>
                </div>
                {session && <div className={styles.activeBadge}>Aktif</div>}
              </div>
            </div>

            {/* Account Switcher Section */}
            <div className={styles.accountsSection}>
              <h3 className={styles.sectionLabel}>Hesaplarım</h3>
              <div className={styles.accountList}>
                {accounts.filter(a => a.username !== session?.user?.name).map((acc) => {
                  const accIsUrl = acc.avatarUrl?.startsWith("http") || acc.avatarUrl?.startsWith("data:image");
                  return (
                    <div 
                      key={acc.username} 
                      className={styles.accountItem}
                      onClick={() => handleSwitchAccount(acc)}
                    >
                      <div className={styles.accountAvatar}>
                        {accIsUrl ? (
                          <img src={acc.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : acc.avatarUrl ? (
                          acc.avatarUrl
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div className={styles.accountMeta}>
                        <span className={styles.accountName}>{acc.displayName}</span>
                        <span className={styles.accountUsername}>@{acc.username}</span>
                      </div>
                    </div>
                  )
                })}
                
                <button className={styles.addAccountBtn} onClick={handleAddAccount}>
                  <div className={styles.addIcon}>
                    <Plus size={20} />
                  </div>
                  <div className={styles.accountMeta}>
                    <span className={styles.accountName}>Yeni Hesap Ekle</span>
                    <span className={styles.accountUsername}>Başka bir kullanıcıyla giriş yap</span>
                  </div>
                </button>
              </div>
            </div>

            {session ? (
              <button onClick={() => signOut()} className={styles.logoutBtn}>
                <LogIn size={20} className="rotate-180" />
                <span>Çıkış Yap</span>
              </button>
            ) : (
              <Link href="/login" className={styles.logoutBtn} style={{ background: "rgba(0, 122, 255, 0.1)", color: "#007aff" }}>
                <UserPlus size={20} />
                <span>Hesap Ekle / Giriş Yap</span>
              </Link>
            )}
          </div>
        </>
      )}

      {/* Switching Overlay */}
      {isSwitching && (
        <div className={styles.switchingOverlay}>
          <Loader2 size={48} className="animate-spin text-blue-500" />
          <h2 className={styles.title}>Hesap Değiştiriliyor...</h2>
          <p className={styles.subtitle}>Lütfen bekleyin...</p>
        </div>
      )}


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
