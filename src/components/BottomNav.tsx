"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, BrainCircuit, LibraryBig } from "lucide-react";
import styles from "./BottomNav.module.css";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "My Words", href: "/list", icon: LibraryBig },
    { name: "Add", href: "/add", icon: PlusCircle },
  ];

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContainer}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              aria-label={item.name}
            >
              <div className={styles.iconWrapper}>
                <Icon
                  size={22}
                  className={isActive ? styles.iconActive : styles.icon}
                />
              </div>
            </Link>
          );
        })}
        
        {/* FAB Style Quiz Button */}
        <Link 
          href="/quiz"
          className={styles.fabItem}
          aria-label="Quiz"
        >
          <BrainCircuit size={24} className={styles.fabIcon} />
        </Link>
      </div>
    </nav>
  );
}
