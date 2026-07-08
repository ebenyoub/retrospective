
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
        <header className="flex w-full items-center bg-background px-2 py-2 shadow-sm shadow-white sm:px-4">
            <Container className="flex flex-wrap items-center justify-between gap-3 py-0">
                <NavLink to="/" className="shrink-0"><h1 className="uppercase">rtc</h1></NavLink>
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
