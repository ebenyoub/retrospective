import FormContainer, { FormTitle } from '@/components/ui/FormContainer';
import FormField from '@/components/ui/FormField';
import SpinContainer from '@/components/ui/SpinContainer';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { useAuth, type AuthLoginData } from '@/context/auth/useAuth';
import { NavLink } from 'react-router-dom';
import { useToast } from '@/context/toast/useToast';
import type { ValidationSchema } from '@/hooks/useFormValidation';
import useFormValidation from '@/hooks/useFormValidation';
import { getApiErrorMessage, isApiSuccess, NETWORK_ERROR_MESSAGE, readJsonSafely } from '@/lib/apiError';

interface LoginValues {
    username: string;
    password: string;
}

const loginValidationSchema: ValidationSchema<LoginValues> = {
    username: [
        (value) => value.trim() === "" ? "Le pseudo est requis." : undefined,
        (value) => value.trim().length < 4 ? "Doit contenir au moins 4 caractères." : undefined,
    ],
    password: [
        (value) => value.trim() === "" ? "Le mot de passe est requis." : undefined,
        (value) => value.trim().length < 4 ? "Doit contenir au moins 4 caractères." : undefined,
    ]
};

const Login: React.FC = () => {
    const { login } = useAuth();
    const { addToast } = useToast();

    const {
        values,
        errors,
        isLoading,
        handleInputChange,
        validateAll,
        setIsLoading
    } = useFormValidation<LoginValues>(
        { username: "", password: "" },
        loginValidationSchema
    )

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateAll()) {
            setIsLoading(false);
            addToast('invalid', "Veuillez corriger les erreurs du formulaire.");
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            })
            const data = await readJsonSafely(response);

            if (response.ok && isApiSuccess<AuthLoginData>(data)) {
                login(data.data)
                addToast("success", "Vous êtes connectés.")
            } else {
                addToast("error", getApiErrorMessage(data, "Connexion impossible."));
            }
        } catch (err) {
            console.error(err);
            addToast("error", NETWORK_ERROR_MESSAGE);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Container className='flex justify-center mt-10 sm:mt-20'>
            <SpinContainer onSpin={isLoading} className="w-full max-w-md">
                <FormContainer onSubmit={handleSubmit}>
                    <FormTitle>Connexion</FormTitle>
                    <FormField
                        id="username"
                        name="username"
                        label="Pseudonyme (Nom d'utilisateur)"
                        type="text"
                        value={values.username}
                        placeholder="Albus Dumbledore"
                        autoComplete="username"
                        disabled={isLoading}
                        onChange={handleInputChange}
                        onBlur={handleInputChange}
                        error={errors.username}
                        showValidState
                    />

                    <FormField
                        id="password"
                        name="password"
                        label="Mot de passe"
                        type="password"
                        value={values.password}
                        autoComplete="new-password"
                        disabled={isLoading}
                        onChange={handleInputChange}
                        onBlur={handleInputChange}
                        error={errors.password}
                        showValidState
                    />

                    <Button type="submit">Se connecter</Button>

                    <div className="flex flex-col gap-2 mt-4 text-center text-sm">
                        <NavLink to="/signup" className="text-blue-400 hover:underline">
                            Pas encore de compte ? S'inscrire
                        </NavLink>
                        <NavLink to="/" className="text-gray-400 hover:underline">
                            Retour à l'accueil
                        </NavLink>
                    </div>

                    <NavLink to="/forgot">Mot de passe oublié ?</NavLink>
                </FormContainer>
            </SpinContainer>
        </Container>
    );
};

export default Login;
