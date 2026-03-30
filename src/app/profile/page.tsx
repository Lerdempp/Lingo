"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Save, User } from "lucide-react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { profile, updateProfile, isLoaded } = useProfile();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [avatarStr, setAvatarStr] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setName(profile.name);
      setAvatarStr(profile.avatarUrl);
    }
  }, [profile, isLoaded]);

  if (!isLoaded) return <main className={`container ${styles.main}`}>Yükleniyor...</main>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateProfile(name.trim(), avatarStr.trim());

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.push("/"); // Uygulama ana sayfasına dön
    }, 1500);
  };

  // Basit bir kontrol: string http veya https ile başlıyorsa URL'dir, değilse Emoji veya metindir
  const isUrl = avatarStr.startsWith("http");

  return (
    <main className={`container ${styles.main}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Profili <span className="text-gradient">Düzenle</span></h1>
        <p className={styles.subtitle}>Kendine özel bir isim ve ikon belirle.</p>
      </header>

      {showSuccess && (
        <div className={styles.successMessage}>
          Profilin başarıyla güncellendi! 🎉
        </div>
      )}

      <form onSubmit={handleSubmit} className={`glass-panel ${styles.formCard}`}>
        {/* Avatar Önizleme */}
        <div className={styles.avatarPreviewContainer}>
          <div className={styles.avatarPreview}>
            {isUrl ? (
              <img src={avatarStr} alt="Profil Önizleme" className={styles.avatarImage} />
            ) : avatarStr ? (
              <span>{avatarStr}</span>
            ) : (
              <User size={48} color="#fff" />
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Kullanıcı Adı</label>
          <input
            id="name"
            type="text"
            className={styles.input}
            placeholder="Örn: Erdem"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="off"
            maxLength={20}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="avatar" className={styles.label}>Profil Resmi (Emoji veya Resim URL)</label>
          <input
            id="avatar"
            type="text"
            className={styles.input}
            placeholder="Örn: 🚀 veya https://link.com/foto.jpg"
            value={avatarStr}
            onChange={(e) => setAvatarStr(e.target.value)}
            autoComplete="off"
          />
          <p className={styles.inputHint}>Bir emoji koyabilir veya internetten bir görselin bağlantısını kopyalayabilirsin.</p>
        </div>

        <button type="submit" className={styles.saveBtn}>
          <Save size={24} />
          <span>Kaydet</span>
        </button>
      </form>
    </main>
  );
}
