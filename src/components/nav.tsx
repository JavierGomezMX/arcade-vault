"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isBiblioteca = pathname === "/" || pathname.startsWith("/juegos");
  const isSalon = pathname.startsWith("/salon");

  const close = () => setOpen(false);

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo">
          <div className="logo-mark"></div>
          <div className="logo-text neon-cyan">ARCADE <span className="neon-magenta">VAULT</span></div>
        </Link>
        <div className="links">
          <Link href="/" className={isBiblioteca ? "active" : ""}>Biblioteca</Link>
          <Link href="/salon" className={isSalon ? "active" : ""}>Salón de la Fama</Link>
        </div>
        <div className="spacer"></div>
        <div className="coin-counter">
          <span className="coin"></span>
          <span>CRÉDITOS · 03</span>
        </div>
        <button className="btn ghost hamburger" onClick={() => setOpen(true)} aria-label="Menú">≡</button>
      </nav>

      <div className={"av-mobile-backdrop" + (open ? " open" : "")} onClick={close}></div>
      <aside className={"av-mobile-panel" + (open ? " open" : "")}>
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>MENÚ</div>
        <Link href="/" className={isBiblioteca ? "active" : ""} onClick={close}>Biblioteca</Link>
        <Link href="/salon" className={isSalon ? "active" : ""} onClick={close}>Salón de la Fama</Link>
        <div style={{ flex: 1 }}></div>
        <div className="pixel" style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.16em" }}>CRÉDITOS · 03</div>
      </aside>
    </>
  );
}
