"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, User, Lock, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import styles from "./page.module.css";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password.trim() 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kayıt sırasında bir hata oluştu.");
        setIsLoading(false);
      } else {
        setSuccess(true);
        setTimeout(async () => {
          await signIn("credentials", {
            username: username.trim(),
            password: password.trim(),
            callbackUrl: "/",
          });
        }, 1500);
      }
    } catch (err) {
      setError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <main className={styles.main}>
        <div className={styles.successCard}>
          <div className={styles.successLogoWrapper}>
            <CheckCircle2 size={32} color="#fff" />
          </div>
          <h1 className={styles.title}>Hesabın Hazır!</h1>
          <p className={styles.subtitle}>
            Kelimeler dünyasına yönlendiriliyorsun...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Link href="/login" className={styles.backLink}>
        <ArrowLeft size={18} />
        Geri Dön
      </Link>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <UserPlus size={28} color="#fff" />
          </div>
          <h1 className={styles.title}>Kayıt Ol</h1>
          <p className={styles.subtitle}>
            Kelime öğrenme yolculuğuna bugün başla.
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>Kullanıcı Adı</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={18} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
                placeholder="En az 3 karakter"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Şifre</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="En az 6 karakter"
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
          </button>
        </form>

        <div className={styles.footer}>
          Zaten bir hesabın var mı?
          <Link href="/login" className={styles.loginLink}>
             Giriş Yap
          </Link>
        </div>
      </div>
    </main>
  );
}

