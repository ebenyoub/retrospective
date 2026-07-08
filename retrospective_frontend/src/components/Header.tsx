
import { NavLink } from "react-router-dom";
import Container from "./ui/Container";
import { useAuth } from "@/context/auth/useAuth";
import Button from "./ui/Button";

const Header = () => {
    const { isAuthenticated, logout } = useAuth();
    // const navigate = useNavigate();
    // const handleQuit = (event: React.MouseEvent<HTMLButtonElement>) => {
    //     event.preventDefault();

    //     fetch("http://localhost:8000/auth/delete", {
    //         method: "delete",
    //         headers: {
    //             "Content-Type": "application/json",
    //             "Authorization": "Bearer " + token
    //         },
    //     })
    //         .then(response => response.json())
    //         .then(result => {
    //             if (result.success) {
    //                 localStorage.removeItem("token");
    //                 logout();
    //                 navigate("/login");
    //             }
    //         })
    //         .catch(error => console.error(error));
    // }

    return (
        <header className="flex h-14 w-full items-center bg-navy-mid border-b border-navy-border px-2 sm:px-5">
            <Container className="flex flex-wrap items-center justify-between gap-3 py-0">
                <NavLink to="/" className="shrink-0 font-extrabold text-green-figma tracking-tight text-[15px] font-sans">
                    Range ta chambre
                </NavLink>
                <nav className="flex flex-wrap justify-end gap-2">
                    {!isAuthenticated ? (
                        <>
                            <NavLink to={"/signup"}><Button>S'inscrire</Button></NavLink>
                            <NavLink to={"/login"}><Button>Connexion</Button></NavLink>
                        </>
                    ) : (
                        <>
                            <Button><NavLink to="/profile">Profile</NavLink></Button>
                            <Button variant="destructive" onClick={() => logout()}>Déconnexion</Button>
                        </>
                    )}
                </nav>
            </Container>
        </header>
    );
};

export default Header;
