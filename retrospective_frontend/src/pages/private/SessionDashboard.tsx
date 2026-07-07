import { useAuth } from '@/context/auth/useAuth';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SessionDashboard = () => {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
        navigate("/login");
    }
    }, [isAuthenticated, navigate])

    return (
        <div>
            <h1>Dashboard de Session {id || " : inconnue"}</h1>
        </div>
    );
};

export default SessionDashboard;