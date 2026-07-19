import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth/useAuth";
import type { MenuItem } from "./types/ProfileMenu.types";

// Menu déroulant accessible (pattern WAI-ARIA "menu button") : remplace la
// page intermédiaire /profile et le bouton Déconnexion séparé de la navbar.
const ProfileMenu = () => {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const items: MenuItem[] = [
    { label: "Mes sessions", action: () => navigate("/sessions") },
    { label: "Rejoindre une session", action: () => navigate("/", { state: { tab: "join" } }) },
    { label: "Créer une rétrospective", action: () => navigate("/", { state: { tab: "create" } }) },
    { label: "Déconnexion", action: () => logout(), isDanger: true },
  ];

  const close = () => {
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const openMenu = () => {
    setIsOpen(true);
    setActiveIndex(0);
  };

  const selectItem = (index: number) => {
    items[index].action();
    close();
  };

  useEffect(() => {
    if (isOpen) itemRefs.current[activeIndex]?.focus();
  }, [isOpen, activeIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (event.key === "Tab") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? close() : openMenu())}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="profile-menu"
        className="inline-flex items-center justify-center font-sans text-xs font-semibold text-slate-200 bg-navy-surface-med border border-navy-border-med hover:bg-white/10 rounded-[8px] h-[30px] px-3.5 transition-all select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        {username || "Profil"}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id="profile-menu"
          role="menu"
          aria-label="Menu profil"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 mt-2 w-56 rounded-[10px] border border-navy-border bg-navy-mid shadow-[0_8px_32px_rgba(0,0,0,0.35)] py-1.5 z-50"
        >
          {items.map((item, index) => (
            <button
              key={item.label}
              ref={(el) => { itemRefs.current[index] = el; }}
              type="button"
              role="menuitem"
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => selectItem(index)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`w-full text-left px-3.5 py-2 text-xs font-sans cursor-pointer transition-colors focus-visible:outline-none focus-visible:bg-white/10 hover:bg-white/10 ${
                item.isDanger ? "text-red-400 hover:text-red-300" : "text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
