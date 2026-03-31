"use client";

import { useState, useEffect, useRef } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Check, User, ArrowLeft, Camera } from "lucide-react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { profile, updateProfile, isLoaded } = useProfile();
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState("");
  const [avatarStr, setAvatarStr] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setName(profile.name);
      setAvatarStr(profile.avatarUrl);
      setPhone(profile.phone || "");
    }
  }, [profile, isLoaded]);

  if (!isLoaded) return <main className={`container ${styles.main}`}>Yükleniyor...</main>;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit check
        alert("Resim boyutu 1MB'dan küçük olmalıdır.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarStr(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    await updateProfile(name.trim(), avatarStr.trim(), "", phone.trim()); 
    setIsSaving(false);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.push("/"); 
    }, 1500);
  };

  const isUrl = avatarStr.startsWith("http") || avatarStr.startsWith("data:image");

  return (
    <main className={`container ${styles.main}`}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={() => router.back()} className={styles.backBtn} aria-label="Geri">
            <ArrowLeft size={24} />
          </button>
          <h1 className={styles.title}>Profili Düzenle</h1>
        </div>
        <button 
          onClick={() => handleSubmit()} 
          className={styles.saveCheckBtn} 
          disabled={isSaving}
          title="Kaydet"
        >
          {isSaving ? (
            <div className="animate-spin" style={{ width: 24, height: 24, border: "2px solid", borderRadius: "50%", borderTopColor: "transparent" }} />
          ) : (
            <Check size={28} />
          )}
        </button>
      </header>

      {showSuccess && (
        <div className={styles.successMessage}>
          Değişiklikler kaydedildi! 🎉
        </div>
      )}

      <div className={styles.formCard}>
        <div className={styles.avatarPreviewContainer}>
          <div className={styles.avatarWrapper} onClick={() => fileInputRef.current?.click()}>
            <div className={styles.avatarPreview}>
              {isUrl ? (
                <img src={avatarStr} alt="Profil Önizleme" className={styles.avatarImage} />
              ) : avatarStr ? (
                <span>{avatarStr}</span>
              ) : (
                <User size={56} color="#fff" />
              )}
            </div>
            <div className={styles.cameraIcon}>
              <Camera size={18} />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              style={{ display: "none" }} 
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>İsim</label>
            <div className={styles.inputWrapper}>
              <input
                id="name"
                type="text"
                className={styles.input}
                placeholder="Charlotte King"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>Kullanıcı Adı</label>
            <div className={styles.inputWrapper}>
              <input
                id="username"
                type="text"
                className={styles.input}
                value={`@${session?.user?.name || "misafir"}`}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>
          </div>
        </form>

      </div>
    </main>
  );
}
