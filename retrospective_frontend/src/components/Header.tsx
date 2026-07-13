import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth/useAuth";
import ProfileMenu from "./ProfileMenu";

const Header = () => {
    const { isAuthenticated } = useAuth();
    const { pathname } = useLocation();

    // Sur l'accueil, la carte principale contient déjà le formulaire de
    // connexion/inscription : les boutons de la navbar y seraient redondants.
    const isHomePage = pathname === "/";
    const isSessionPage = pathname.startsWith("/session/");

    return (
        <header className="sticky top-0 z-40 flex-shrink-0 flex w-full items-center bg-navy-mid border-b border-navy-border h-[52px] md:h-[56px] px-3 md:px-5">
            <div className="flex w-full items-center justify-between gap-3">
                {/* Logo / Nom de l'app */}
                <NavLink
                    to="/"
                    className="shrink-0 font-extrabold text-[15px] text-green-figma tracking-[-0.4px] font-sans transition-opacity hover:opacity-90 select-none"
                >
                    Range ta chambre
                </NavLink>

                {/* Navigation / Actions */}
                <nav className="flex items-center gap-2">
                    {!isAuthenticated ? (
                        !isHomePage && !isSessionPage && (
                            <>
                                <NavLink
                                    to="/signup"
                                    className="hidden sm:inline-flex items-center justify-center font-sans text-xs font-semibold text-navy bg-slate-50 hover:bg-slate-200 rounded-[8px] h-[30px] px-3.5 transition-all select-none"
                                >
                                    S'inscrire
                                </NavLink>
                                <NavLink
                                    to="/login"
                                    className="inline-flex items-center justify-center font-sans text-xs font-semibold text-slate-200 bg-navy-surface-med border border-navy-border-med hover:bg-white/10 rounded-[8px] h-[30px] px-3.5 transition-all select-none"
                                >
                                    Connexion
                                </NavLink>
                            </>
                        )
                    ) : (
                        <ProfileMenu />
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
