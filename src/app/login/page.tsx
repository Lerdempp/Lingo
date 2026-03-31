"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, User, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import styles from "./page.module.css";

function LoginContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userParam = searchParams.get("username");
    if (userParam) {
      setUsername(userParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (result?.error) {
        setError("Geçersiz kullanıcı adı veya şifre.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={18} />
        Geri Dön
      </Link>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <LogIn size={28} color="#fff" />
          </div>
          <h1 className={styles.title}>Hoş Geldin</h1>
          <p className={styles.subtitle}>
            Kelimelerini senkronize etmek için giriş yap.
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
                placeholder="Örn: alierdem"
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
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className={styles.footer}>
          Hesabın yok mu?
          <Link href="/register" className={styles.registerLink}>
            Hemen Kaydol
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <LoginContent />
    </Suspense>
  );
}

