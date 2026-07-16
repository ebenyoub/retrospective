import Form, { FormTitle } from '@/components/ui/Form';
import FormField from '@/components/ui/FormField';
import SpinContainer from '@/components/ui/SpinContainer';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/auth/useAuth';
import { NavLink, useNavigate } from 'react-router-dom';
import { useToast } from '@/context/toast/useToast';
import type { ValidationSchema } from '@/hooks/types/useFormValidation.types';
import useFormValidation from '@/hooks/useFormValidation';
import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from '@/lib/apiError';
import { loginApi } from '@/pages/auth/services/authApi';
import type { LoginValues } from '../types/auth.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loginValidationSchema: ValidationSchema<LoginValues> = {
    email: [
        (value) => value.trim() === "" ? "L'adresse e-mail est requise." : undefined,
        (value) => !EMAIL_REGEX.test(value) ? "Le format de l'adresse e-mail est invalide." : undefined,
    ],
    password: [
        (value) => value.trim() === "" ? "Le mot de passe est requis." : undefined,
    ]
};

const Login: React.FC = () => {
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const {
        values,
        errors,
        isLoading,
        handleInputChange,
        validateAll,
        setIsLoading
    } = useFormValidation<LoginValues>(
        { email: "", password: "" },
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

            const result = await loginApi(values);

            if (result.ok) {
                login(result.data);
                addToast("success", "Vous êtes connectés.");

                // Redirection directe vers l'accueil neutre après connexion
                navigate('/', { replace: true });
            } else {
                addToast("error", getApiErrorMessage(result.payload, "Connexion impossible."));
            }
        } catch (err) {
            console.error(err);
            addToast("error", NETWORK_ERROR_MESSAGE);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Container className='flex justify-center items-center min-h-[60vh]'>
            <SpinContainer onSpin={isLoading} className="w-full max-w-md">
                <Form onSubmit={handleSubmit} aria-busy={isLoading}>
                    <FormTitle>Connexion</FormTitle>
                    <FormField
                        id="email"
                        name="email"
                        label="Adresse e-mail"
                        type="text"
                        value={values.email}
                        placeholder="rtc@example.com"
                        autoComplete="email"
                        disabled={isLoading}
                        onChange={handleInputChange}
                        onBlur={handleInputChange}
                        error={errors.email}
                        showValidState
                    />

                    <FormField
                        id="password"
                        name="password"
                        label="Mot de passe"
                        type="password"
                        value={values.password}
                        autoComplete="current-password"
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
                        <NavLink to="/forgot" className="text-blue-400 hover:underline">
                            Mot de passe oublié ?
                        </NavLink>
                        <NavLink to="/" className="text-gray-400 hover:underline">
                            Retour à l'accueil
                        </NavLink>
                    </div>
                </Form>
            </SpinContainer>
        </Container>
    );
};

export default Login;
