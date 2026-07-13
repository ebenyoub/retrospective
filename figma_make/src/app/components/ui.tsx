import React from "react";
import { Category, Participant, ParticipantStatus } from "../types";

// ── Design tokens ────────────────────────────────────────────────────────────
export const T = {
  navy: "#0f172a",
  navyMid: "#1e293b",
  navyLight: "#334155",
  navyBorder: "rgba(255,255,255,0.08)",
  navyBorderMed: "rgba(255,255,255,0.13)",
  navySurface: "rgba(255,255,255,0.05)",
  navySurfaceMed: "rgba(255,255,255,0.08)",

  green: "#16a34a",
  greenLight: "#dcfce7",
  greenMid: "#bbf7d0",
  greenBorder: "#15803d",
  greenText: "#14532d",

  red: "#dc2626",
  redLight: "#fee2e2",
  redMid: "#fca5a5",
  redBorder: "#b91c1c",
  redText: "#7f1d1d",

  yellow: "#d97706",
  yellowLight: "#fef3c7",
  yellowMid: "#fde68a",
  yellowBorder: "#b45309",
  yellowText: "#78350f",

  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate600: "#475569",
  slate700: "#334155",
  white: "#ffffff",
};

export const CAT: Record<Category, { bg: string; light: string; mid: string; border: string; text: string; label: string }> = {
  positif: { bg: T.green, light: T.greenLight, mid: T.greenMid, border: T.greenBorder, text: T.greenText, label: "Positif" },
  negatif: { bg: T.red, light: T.redLight, mid: T.redMid, border: T.redBorder, text: T.redText, label: "Négatif" },
  idee: { bg: T.yellow, light: T.yellowLight, mid: T.yellowMid, border: T.yellowBorder, text: T.yellowText, label: "Idées" },
};

// ── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type BtnSize = "sm" | "md" | "lg";

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  full?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const BTN_STYLES: Record<BtnVariant, { bg: string; color: string; border: string; hoverBg: string }> = {
  primary: { bg: T.slate50, color: T.navy, border: "transparent", hoverBg: T.slate200 },
  secondary: { bg: T.navySurfaceMed, color: T.slate200, border: T.navyBorderMed, hoverBg: "rgba(255,255,255,0.13)" },
  ghost: { bg: "transparent", color: T.slate400, border: "transparent", hoverBg: T.navySurface },
  danger: { bg: "#7f1d1d", color: "#fca5a5", border: "#991b1b", hoverBg: "#991b1b" },
  success: { bg: T.greenBorder, color: T.greenLight, border: "transparent", hoverBg: T.green },
};

const BTN_SIZE: Record<BtnSize, { px: string; py: string; fontSize: number; height: number; radius: number }> = {
  sm: { px: "12px", py: "6px", fontSize: 12, height: 30, radius: 8 },
  md: { px: "16px", py: "8px", fontSize: 14, height: 36, radius: 10 },
  lg: { px: "24px", py: "12px", fontSize: 15, height: 44, radius: 12 },
};

export function Btn({ variant = "secondary", size = "md", full, icon, iconRight, children, style, ...props }: BtnProps) {
  const s = BTN_STYLES[variant];
  const sz = BTN_SIZE[size];
  return (
    <button
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: sz.radius,
        padding: `${sz.py} ${sz.px}`,
        fontSize: sz.fontSize,
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        cursor: "pointer",
        width: full ? "100%" : undefined,
        whiteSpace: "nowrap",
        transition: "background 0.15s, opacity 0.15s",
        ...style,
      }}
      onMouseEnter={e => { if (!props.disabled) e.currentTarget.style.background = s.hoverBg; }}
      onMouseLeave={e => { if (!props.disabled) e.currentTarget.style.background = s.bg; }}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

// ── Icon Button ──────────────────────────────────────────────────────────────
export function IconBtn({ children, active, title, onClick, badge }: { children: React.ReactNode; active?: boolean; title?: string; onClick?: () => void; badge?: number }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        borderRadius: 9,
        border: `1px solid ${active ? T.navyBorderMed : "transparent"}`,
        background: active ? T.navySurfaceMed : "transparent",
        color: active ? T.slate200 : T.slate500,
        cursor: "pointer",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = T.navySurfaceMed; e.currentTarget.style.color = T.slate200; }}
      onMouseLeave={e => {
        e.currentTarget.style.background = active ? T.navySurfaceMed : "transparent";
        e.currentTarget.style.color = active ? T.slate200 : T.slate500;
      }}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span style={{
          position: "absolute",
          top: 2,
          right: 2,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: T.red,
          color: T.white,
          fontSize: 9,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "JetBrains Mono, monospace",
        }}>{badge > 9 ? "9+" : badge}</span>
      )}
    </button>
  );
}

// ── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export function Input({ label, hint, leftIcon, style, ...props }: InputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {label && <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: T.slate400, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</label>}
      {hint && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate500, marginTop: -2 }}>{hint}</p>}
      <div style={{ position: "relative" }}>
        {leftIcon && (
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.slate500, display: "flex", pointerEvents: "none" }}>
            {leftIcon}
          </span>
        )}
        <input
          {...props}
          style={{
            width: "100%",
            borderRadius: 10,
            border: `1px solid ${T.navyBorderMed}`,
            background: T.navySurface,
            padding: leftIcon ? "9px 12px 9px 34px" : "9px 12px",
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            color: T.slate50,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
            ...style,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
          onBlur={e => (e.currentTarget.style.borderColor = T.navyBorderMed)}
        />
      </div>
    </div>
  );
}

// ── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, style, ...props }: TextareaProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {label && <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: T.slate400, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</label>}
      <textarea
        {...props}
        style={{
          width: "100%",
          borderRadius: 10,
          border: `1px solid ${T.navyBorderMed}`,
          background: T.navySurface,
          padding: "9px 12px",
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          color: T.slate50,
          outline: "none",
          resize: "none",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
          ...style,
        }}
        onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
        onBlur={e => (e.currentTarget.style.borderColor = T.navyBorderMed)}
      />
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
export function CategoryBadge({ category, small }: { category: Category; small?: boolean }) {
  const c = CAT[category];
  return (
    <span style={{
      background: c.light,
      color: c.text,
      borderRadius: 6,
      padding: small ? "1px 7px" : "2px 8px",
      fontFamily: "'Inter', sans-serif",
      fontSize: small ? 10 : 11,
      fontWeight: 700,
      letterSpacing: 0.3,
      whiteSpace: "nowrap",
    }}>
      {c.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const map = {
    high: { bg: "#7f1d1d", color: "#fca5a5", label: "Haute" },
    medium: { bg: "#78350f", color: "#fde68a", label: "Moyenne" },
    low: { bg: "#1e3a5f", color: "#93c5fd", label: "Basse" },
  };
  const m = map[priority];
  return (
    <span style={{ background: m.bg, color: m.color, borderRadius: 6, padding: "1px 7px", fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 0.3 }}>
      {m.label}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, color, size = 28, status }: { name: string; color: string; size?: number; status?: ParticipantStatus }) {
  const initials = name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const statusColor = { online: T.green, away: "#f59e0b", offline: T.slate600 };
  return (
    <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: color, color: T.white,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        fontSize: size * 0.36, fontWeight: 700,
      }}>
        {initials}
      </div>
      {status && (
        <span style={{
          position: "absolute", bottom: -1, right: -1,
          width: size * 0.36, height: size * 0.36,
          borderRadius: "50%",
          background: statusColor[status],
          border: `2px solid ${T.navy}`,
        }} />
      )}
    </div>
  );
}

// ── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 1, background: T.navyBorder }} />
      {label && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.slate500, whiteSpace: "nowrap" }}>{label}</span>}
      {label && <div style={{ flex: 1, height: 1, background: T.navyBorder }} />}
    </div>
  );
}

// ── Timer ────────────────────────────────────────────────────────────────────
export function TimerChip({ value }: { value: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: T.navySurface,
      border: `1px solid ${T.navyBorderMed}`,
      borderRadius: 8, padding: "4px 10px",
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={T.slate400} strokeWidth="2" />
        <path d="M12 7v5l3 3" stroke={T.slate400} strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: T.slate200, letterSpacing: 1 }}>{value}</span>
    </div>
  );
}

// ── Search bar ───────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder ?? "Rechercher…"}
      leftIcon={
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6" stroke={T.slate500} strokeWidth="1.8" />
          <path d="M15 15l-3.5-3.5" stroke={T.slate500} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      }
    />
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "40px 20px", textAlign: "center" }}>
      <div style={{ color: T.slate600, marginBottom: 4 }}>{icon}</div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: T.slate400 }}>{title}</p>
      {description && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate600, maxWidth: 280 }}>{description}</p>}
    </div>
  );
}

// ── Modal backdrop ───────────────────────────────────────────────────────────
export function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

// ── Card vote bar ────────────────────────────────────────────────────────────
export function VoteBar({ votes, max, color }: { votes: number; max: number; color: string }) {
  const pct = max > 0 ? (votes / max) * 100 : 0;
  return (
    <div style={{ height: 3, borderRadius: 2, background: T.navyBorderMed, overflow: "hidden", marginTop: 4 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────
export const Icon = {
  Chat: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M17 10c0 3.866-3.134 7-7 7a6.96 6.96 0 01-3.5-.938L3 17l.938-3.5A6.96 6.96 0 013 10c0-3.866 3.134-7 7-7s7 3.134 7 7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  Users: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M13 10a3 3 0 100-6 3 3 0 000 6zM7.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM13 12c2.21 0 4 1.343 4 3H9c0-1.657 1.79-3 4-3zM5 14.5c0-1.38 1.12-2.5 2.5-2.5H8c.33 0 .65.06.94.17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Plus: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  X: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Back: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ChevronLeft: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ChevronRight: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Check: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Comment: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M14 9.333A2.667 2.667 0 0111.333 12H5.667L3 14.5V5.667A2.667 2.667 0 015.667 3h5.666A2.667 2.667 0 0114 5.667V9.333z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  ThumbUp: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M5 14H3a1 1 0 01-1-1V8a1 1 0 011-1h2m0 7V7m0 7h7.333a1 1 0 001-.778L14 8.222A1 1 0 0012.889 7H9V4a2 2 0 00-2-2L5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Download: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2v8M5 7l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Share: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="12" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="4" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 3.75L5.5 7M10.5 12.25L5.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Copy: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="5" y="5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 5V4a2 2 0 00-2-2H4a2 2 0 00-2 2v5a2 2 0 002 2h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Send: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M14 2L7 9M14 2L9.5 14 7 9 2 6.5 14 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Trophy: ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 13v4m-4 0h8M4 3H2v4a4 4 0 004 4M16 3h2v4a4 4 0 01-4 4M6 3h8a2 2 0 01.5 3.9L10 9l-4.5-2.1A2 2 0 016 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Logout: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M11 11l3-3-3-3M14 8H6M6 13H3a1 1 0 01-1-1V4a1 1 0 011-1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};
